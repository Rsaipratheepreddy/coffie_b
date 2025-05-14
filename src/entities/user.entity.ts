// src/users/entities/user.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Invitation } from './invite.entity';
import { Bookmark } from './bookmark.entity';
import { Profile } from './profile.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    mobile: string;

    @Column()
    password: string;

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
}
