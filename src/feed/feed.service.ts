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
        @InjectRepository(Profile)
        private readonly profileRepo: Repository<Profile>,
    ) { }

    async getFeed(userId: string) {
        const bookmarks = await this.bookmarkRepo.find({
            where: { user: { id: userId } },
            relations: ['bookmarkedUser'],
        });

        const passedOnUsers = bookmarks
            .filter(b => b.type === BookmarkType.PASS_BY)
            .map(b => b.bookmarkedUser.id);

        const excludeIds = [userId, ...passedOnUsers];

        const users = await this.usersRepo.find({
            where: { id: Not(In(excludeIds)) },
            relations: [
                'profile',
                'profile.background',
                'profile.experiences',
                'profile.education',
            ],
            select: {
                id: true,
                mobile: true,
                profile: true,
            },
        });

        return {
            availableUsersCount: users.length,
            users,
        };
    }

    async getBookMarkedProfiles(userId: string): Promise<User[]> {
        const user = await this.usersRepo.findOne({
            where: { id: userId },
            relations: ['bookmarks', 'bookmarks.bookmarkedUser'],
        });
        if (!user) throw new NotFoundException('User not found');

        const ids = user.bookmarks
            .filter(b => b.type === BookmarkType.BOOKMARK)
            .map(b => b.bookmarkedUser.id);

        if (ids.length === 0) return [];

        return this.usersRepo.find({
            where: { id: In(ids) },
            relations: ['profile', 'profile.background', 'profile.experiences', 'profile.education'],
        });
    }

    async getPassByProfiles(userId: string): Promise<User[]> {
        const user = await this.usersRepo.findOne({
            where: { id: userId },
            relations: ['bookmarks', 'bookmarks.bookmarkedUser'],
        });
        if (!user) throw new NotFoundException('User not found');

        const ids = user.bookmarks
            .filter(b => b.type === BookmarkType.PASS_BY)
            .map(b => b.bookmarkedUser.id);

        if (ids.length === 0) return [];

        return this.usersRepo.find({
            where: { id: In(ids) },
            relations: ['profile', 'profile.background', 'profile.experiences', 'profile.education'],
        });
    }

    async updatePassBy(userId: string, targetUserId: string): Promise<Bookmark> {
        const [me, target] = await Promise.all([
            this.usersRepo.findOne({ where: { id: userId } }),
            this.usersRepo.findOne({ where: { id: targetUserId } }),
        ]);
        if (!me || !target) throw new NotFoundException('User not found');

        let bm = await this.bookmarkRepo.findOne({
            where: { user: { id: userId }, bookmarkedUser: { id: targetUserId } },
        });

        if (!bm) {
            bm = this.bookmarkRepo.create({ user: me, bookmarkedUser: target, type: BookmarkType.PASS_BY });
            return this.bookmarkRepo.save(bm);
        }

        if (bm.type !== BookmarkType.PASS_BY) {
            bm.type = BookmarkType.PASS_BY;
            return this.bookmarkRepo.save(bm);
        }

        return bm;
    }

    async updateBookmark(userId: string, targetUserId: string): Promise<Bookmark> {
        const [me, target] = await Promise.all([
            this.usersRepo.findOne({ where: { id: userId } }),
            this.usersRepo.findOne({ where: { id: targetUserId } }),
        ]);
        if (!me || !target) throw new NotFoundException('User not found');

        let bm = await this.bookmarkRepo.findOne({
            where: { user: { id: userId }, bookmarkedUser: { id: targetUserId } },
        });

        if (!bm) {
            bm = this.bookmarkRepo.create({ user: me, bookmarkedUser: target, type: BookmarkType.BOOKMARK });
            return this.bookmarkRepo.save(bm);
        }

        if (bm.type !== BookmarkType.BOOKMARK) {
            bm.type = BookmarkType.BOOKMARK;
            return this.bookmarkRepo.save(bm);
        }

        return bm;
    }
}
