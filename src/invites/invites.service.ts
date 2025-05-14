import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invitation } from 'src/entities/invite.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InvitesService {
    constructor(
        @InjectRepository(User)
        private usersRepo: Repository<User>,

        @InjectRepository(Invitation)
        private invitesRepo: Repository<Invitation>,
    ) {

    }

    async sendInvite(userId: string, invitedId: string) {

        const user = await this.usersRepo.findOne({ where: { id: userId }, relations: ['invited'] });
        if (!user) throw new Error('User not found');
        const invitedUser = await this.usersRepo.findOne({ where: { id: invitedId } });
        if (!invitedUser) throw new Error('Invited user not found');

        const { sentInvitations } = user;

        const existingInvite = sentInvitations.find(invite => invite.invitee.id === invitedId);
        if (existingInvite) {
            throw new Error('Invite already sent');
        }

        const newInvite = this.invitesRepo.create({
            inviter: user,
            invitee: invitedUser,
        });
        await this.invitesRepo.save(newInvite);
        return newInvite;
    }

    async acceptInvite(userId: string) { }

    async rejectInvite() { }

    async getUserInvites() { }
}
