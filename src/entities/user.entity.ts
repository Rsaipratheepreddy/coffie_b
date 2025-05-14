// src/users/entities/user.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Invitation } from './invite.entity';
import { Bookmark } from './bookmark.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    mobile: string;

    @Column({ unique: true })
    password: string;

    @OneToOne(() => Profile, profile => profile.user, {
        cascade: true,
        eager: true,
    })

    @OneToMany(() => Invitation, inv => inv.inviter)
    sentInvitations: Invitation[];

    @OneToMany(() => Invitation, inv => inv.invitee)
    receivedInvitations: Invitation[];

    @OneToMany(() => Bookmark, b => b.user)
    bookmarks: Bookmark[]

    @OneToMany(() => Bookmark, b => b.bookmarkedUser)
    bookmarkedBy: Bookmark[]

    @JoinColumn()
    profile: Profile;
}
