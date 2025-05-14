// src/users/entities/bookmark.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    Column,
    Unique,
} from 'typeorm'
import { User } from './user.entity'

export enum BookmarkType {
    BOOKMARK = 'bookmark',
    PASS_BY = 'passBy',
}

@Entity()
@Unique(['user', 'bookmarkedUser', 'type'])
export class Bookmark {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => User, u => u.bookmarks, { nullable: false, onDelete: 'CASCADE' })
    user: User

    @ManyToOne(() => User, u => u.bookmarkedBy, { nullable: false, onDelete: 'CASCADE' })
    bookmarkedUser: User

    @Column({
        type: 'enum',
        enum: BookmarkType,
        default: BookmarkType.BOOKMARK,
    })
    type: BookmarkType

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date
}
