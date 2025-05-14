// src/users/entities/invite.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    Column,
} from 'typeorm';
import { User } from './user.entity';

export enum InviteStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
}

@Entity()
export class Invitation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.sentInvitations, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'inviter_id' })
    inviter: User;

    @ManyToOne(() => User, user => user.receivedInvitations, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'invitee_id' })
    invitee: User;

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
