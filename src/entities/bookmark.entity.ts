// src/users/entities/bookmark.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    Column,
    Unique,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum BookmarkType {
    BOOKMARK = 'bookmark',
    PASS_BY = 'passBy',
}

@Entity()
@Unique(['user', 'bookmarkedUser', 'type'])
export class Bookmark {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, u => u.bookmarks, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => User, u => u.bookmarkedBy, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'bookmarked_user_id' })
    bookmarkedUser: User;

    @Column({
        type: 'enum',
        enum: BookmarkType,
        default: BookmarkType.BOOKMARK,
    })
    type: BookmarkType;

    @Column({ default: false })
    bookmarked: boolean;

    @Column({ default: false })
    passedBy: boolean;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;
}
