import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
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

    @ManyToOne(() => User, user => user.sentInvitations, { nullable: false })
    inviter: User;

    @ManyToOne(() => User, user => user.receivedInvitations, { nullable: false })
    invitee: User;

    @Column({ type: 'enum', enum: InviteStatus, default: InviteStatus.PENDING })
    status: InviteStatus;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
