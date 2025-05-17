import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Invitation, InviteStatus } from 'src/entities/invite.entity';

@Injectable()
export class InvitesService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        @InjectRepository(Invitation)
        private readonly invitesRepo: Repository<Invitation>,
    ) { }

    async sendInvite(inviterId: string, inviteeId: string): Promise<Invitation> {
        if (inviterId === inviteeId) {
            throw new ForbiddenException('Cannot invite yourself');
        }
        const [inviter, invitee] = await Promise.all([
            this.usersRepo.findOne({
                where: { id: inviterId },
                relations: ['sentInvitations', 'sentInvitations.invitee'],
            }),
            this.usersRepo.findOne({
                where: { id: inviteeId },
                relations: ['receivedInvitations', 'receivedInvitations.inviter'],
            }),
        ]);

        if (!inviter) throw new NotFoundException('Inviter not found');
        if (!invitee) throw new NotFoundException('Invitee not found');

        // Check for existing pending invites in both directions
        const pendingInviteFromInviter = inviter.sentInvitations.find(
            inv => inv.invitee.id === inviteeId && inv.status === InviteStatus.PENDING
        );
        const pendingInviteFromInvitee = invitee.receivedInvitations.find(
            inv => inv.inviter.id === inviterId && inv.status === InviteStatus.PENDING
        );

        if (pendingInviteFromInviter || pendingInviteFromInvitee) {
            throw new ForbiddenException('An outstanding invite already exists');
        }
        const invite = this.invitesRepo.create({
            inviter,
            invitee,
            status: InviteStatus.PENDING,
        });
        return this.invitesRepo.save(invite);
    }

    async acceptInvite(inviteId: string, userId: string): Promise<Invitation> {
        const invite = await this.invitesRepo.findOne({
            where: { id: inviteId },
            relations: ['invitee', 'inviter'],
        });
        if (!invite) {
            throw new NotFoundException('Invitation not found');
        }
        if (invite.invitee.id !== userId) {
            throw new ForbiddenException('You are not authorized to accept this invite');
        }
        if (invite.status !== InviteStatus.PENDING) {
            throw new ForbiddenException(`Cannot accept an invite with status "${invite.status}"`);
        }

        const oppositeInvite = await this.invitesRepo.findOne({
            where: {
                inviter: { id: invite.invitee.id },
                invitee: { id: invite.inviter.id },
                status: InviteStatus.PENDING
            }
        });

        if (oppositeInvite) {
            oppositeInvite.status = InviteStatus.ACCEPTED;
            await this.invitesRepo.save(oppositeInvite);
        }

        invite.status = InviteStatus.ACCEPTED;
        return this.invitesRepo.save(invite);
    }

    async rejectInvite(inviteId: string, userId: string): Promise<Invitation> {
        const invite = await this.invitesRepo.findOne({
            where: { id: inviteId },
            relations: ['invitee', 'inviter'],
        });
        if (!invite) {
            throw new NotFoundException('Invitation not found');
        }
        if (invite.invitee.id !== userId) {
            throw new ForbiddenException('You are not authorized to decline this invite');
        }
        if (invite.status !== InviteStatus.PENDING) {
            throw new ForbiddenException(`Cannot decline an invite with status "${invite.status}"`);
        }

        const oppositeInvite = await this.invitesRepo.findOne({
            where: {
                inviter: { id: invite.invitee.id },
                invitee: { id: invite.inviter.id },
                status: InviteStatus.PENDING
            }
        });

        if (oppositeInvite) {
            oppositeInvite.status = InviteStatus.DECLINED;
            await this.invitesRepo.save(oppositeInvite);
        }

        invite.status = InviteStatus.DECLINED;
        return this.invitesRepo.save(invite);
    }

    async getUserInvites(userId: string): Promise<{
        sent: Invitation[];
        received: Invitation[];
    }> {
        const [sent, received] = await Promise.all([
            this.invitesRepo.find({
                where: { inviter: { id: userId } },
                relations: ['invitee', 'inviter'],
                order: { createdAt: 'DESC' },
                select: ['id', 'status', 'createdAt', 'updatedAt']
            }),
            this.invitesRepo.find({
                where: { invitee: { id: userId } },
                relations: ['inviter', 'invitee'],
                order: { createdAt: 'DESC' },
                select: ['id', 'status', 'createdAt', 'updatedAt']
            }),
        ]);
        return { sent, received };
    }

    async getAcceptedUsers(userId: string) {
        const [sentInvites, receivedInvites] = await Promise.all([
            this.invitesRepo.find({
                where: { inviter: { id: userId }, status: InviteStatus.ACCEPTED },
                relations: ['invitee'],
            }),
            this.invitesRepo.find({
                where: { invitee: { id: userId }, status: InviteStatus.ACCEPTED },
                relations: ['inviter'],
            }),
        ]);
        return {
            acceptedSent: sentInvites.map(inv => inv.invitee),
            acceptedReceived: receivedInvites.map(inv => inv.inviter),
        };
    }
}
