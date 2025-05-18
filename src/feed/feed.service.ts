import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Bookmark, BookmarkType } from 'src/entities/bookmark.entity';
import { Profile } from 'src/entities/profile.entity';

@Injectable()
export class FeedService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        @InjectRepository(Bookmark)
        private readonly bookmarkRepo: Repository<Bookmark>,
    ) { }

    async getFeed(userId: string, offset = 0, limit = 1) {
        const bookmarks = await this.bookmarkRepo.find({
            where: { user: { id: userId } },
            relations: ['bookmarkedUser'],
        });

        const passedOnUsers = bookmarks
            .filter(b => b.passedBy)
            .map(b => b.bookmarkedUser.id);

        const excludeIds = [userId, ...passedOnUsers];

        const [users, total] = await this.usersRepo.findAndCount({
            where: { id: Not(In(excludeIds)) },
            relations: [
                'profile',
                'profile.background',
                'profile.experiences',
                'profile.education',
            ],
            select: ['id', 'mobile', 'profile'],
            order: {
                id: 'DESC',
            },
            skip: offset,
            take: limit,
        });

        return {
            users,
            pagination: {
                total,
                offset,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            emptyFeed: total === 0
        };
    }

    async getBookMarkedProfiles(userId: string): Promise<{ users: User[] }> {
        const bookmarks = await this.bookmarkRepo.find({
            where: { user: { id: userId }, bookmarked: true },
            relations: ['bookmarkedUser'],
            order: { id: 'DESC' },
        });

        const bookmarkedUserIds = bookmarks
            .filter(b => b.bookmarkedUser && b.bookmarkedUser.id)
            .map(b => b.bookmarkedUser.id);
        if (bookmarkedUserIds.length === 0) return { users: [] };

        const bookmarkedUsers = await this.usersRepo.find({
            where: { id: In(bookmarkedUserIds) },
            relations: [
                'profile',
                'profile.background',
                'profile.experiences',
                'profile.education',
            ],
            order: { id: 'DESC' },
        });
        return { users: bookmarkedUsers };
    }

    async getPassByProfiles(userId: string): Promise<{ users: User[] }> {
        const bookmarks = await this.bookmarkRepo.find({
            where: { user: { id: userId }, passedBy: true },
            relations: ['bookmarkedUser'],
            order: { id: 'DESC' },
        });

        const passByUserIds = bookmarks
            .filter(b => b.bookmarkedUser && b.bookmarkedUser.id)
            .map(b => b.bookmarkedUser.id);
        if (passByUserIds.length === 0) return { users: [] };

        const passByUsers = await this.usersRepo.find({
            where: { id: In(passByUserIds) },
            relations: [
                'profile',
                'profile.background',
                'profile.experiences',
                'profile.education',
            ],
            order: { id: 'DESC' },
        });
        return {
            users: passByUsers,
        }
    }

    async updatePassBy(userId: string, targetUserId: string, value = true): Promise<Bookmark> {
        const [me, target] = await Promise.all([
            this.usersRepo.findOne({ where: { id: userId } }),
            this.usersRepo.findOne({ where: { id: targetUserId } }),
        ]);
        if (!me || !target) throw new NotFoundException('User not found');

        let bm = await this.bookmarkRepo.findOne({
            where: { user: { id: userId }, bookmarkedUser: { id: targetUserId } },
            relations: ['user', 'bookmarkedUser'],
        });

        if (!bm) {
            bm = this.bookmarkRepo.create({
                user: me,
                bookmarkedUser: target,
                bookmarked: false,
                passedBy: value,
            });
        } else {
            bm.passedBy = value;
        }
        return this.bookmarkRepo.save(bm);
    }

    async updateBookmark(userId: string, targetUserId: string, value = true): Promise<Bookmark> {
        const [me, target] = await Promise.all([
            this.usersRepo.findOne({ where: { id: userId } }),
            this.usersRepo.findOne({ where: { id: targetUserId } }),
        ]);
        if (!me || !target) throw new NotFoundException('User not found');

        let bm = await this.bookmarkRepo.findOne({
            where: { user: { id: userId }, bookmarkedUser: { id: targetUserId } },
            relations: ['user', 'bookmarkedUser'],
        });

        if (!bm) {
            bm = this.bookmarkRepo.create({
                user: me,
                bookmarkedUser: target,
                bookmarked: value,
                passedBy: false,
            });
        } else {
            bm.bookmarked = value;
        }
        return this.bookmarkRepo.save(bm);
    }
}
