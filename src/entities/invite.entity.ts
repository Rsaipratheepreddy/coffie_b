// src/users/entities/invite.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    Column,
    Index,
    RelationId,
} from 'typeorm';
import { User } from './user.entity';

export enum InviteStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
}

@Entity('invitation')
@Index(['inviter', 'invitee'], { unique: true })
export class Invitation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, u => u.sentInvitations, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'inviter_id' })
    inviter: User;

    @RelationId((inv: Invitation) => inv.inviter)
    inviterId: string;

    @ManyToOne(() => User, u => u.receivedInvitations, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'invitee_id' })
    invitee: User;

    @RelationId((inv: Invitation) => inv.invitee)
    inviteeId: string;

    @Column({
        type: 'enum',
        enum: InviteStatus,
        default: InviteStatus.PENDING,
    })
    status: InviteStatus;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}
