// src/users/entities/user.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Invitation } from './invite.entity';
import { Bookmark } from './bookmark.entity';
import { Profile } from './profile.entity';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column()
    mobile: string;



    @Column({ nullable: true })
    otpHash: string;

    @Column({ nullable: true })
    otpExpiry: Date;

    @OneToMany(() => Invitation, inv => inv.inviter)
    sentInvitations: Invitation[];

    @OneToMany(() => Invitation, inv => inv.invitee)
    receivedInvitations: Invitation[];

    @OneToMany(() => Bookmark, b => b.user)
    bookmarks: Bookmark[];

    @OneToMany(() => Bookmark, b => b.bookmarkedUser)
    bookmarkedBy: Bookmark[];

    @OneToOne(() => Profile, profile => profile.user, {
        cascade: true,
        eager: true,
    })
    @JoinColumn({ name: 'profile_id' })
    profile: Profile;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
