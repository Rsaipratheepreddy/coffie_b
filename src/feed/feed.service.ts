import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { use } from 'passport';
import { Bookmark, BookmarkType } from 'src/entities/bookmark.entity';
import { Invitation } from 'src/entities/invite.entity';
import { User } from 'src/entities/user.entity';
import { In, Not, Repository } from 'typeorm';

@Injectable()
export class FeedService {

    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,

        @InjectRepository(Bookmark)
        private readonly bookmarkRepo: Repository<Bookmark>,
    ) { }
    ;

    async getFeed(userId: string) {
        // 1) Get IDs of everyone you’ve “passed by”
        const passedByRows = await this.usersRepo
            .createQueryBuilder('user')
            .innerJoin(
                'user.bookmarks',
                'bm',
                'bm.userId = :userId AND bm.type = :passBy',
                { userId, passBy: BookmarkType.PASS_BY },
            )
            .select('bm.bookmarkedUserId', 'id')
            .getRawMany<{ id: string }>();

        const passedByIds = passedByRows.map(r => r.id);

        const availableUsers = await this.usersRepo.find({
            where: {
                id: Not(In([userId, ...passedByIds])),
            },
            relations: ['profile'],

        });

        return {
            availableUsersCount: availableUsers.length,
            users: availableUsers,
        };
    }



    async getBookMarkedProfiles(userId: string): Promise<User[]> {
        const user = await this.usersRepo.findOne({
            where: { id: userId },
            relations: ['bookmarks', 'bookmarks.bookmarkedUser'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const bookmarkList = user.bookmarks.filter(
            (b) => b.type === BookmarkType.BOOKMARK,
        );

        if (bookmarkList.length === 0) {
            return [];
        }

        const ids = bookmarkList.map((b) => b.bookmarkedUser.id);
        const bookmarkedUsers = await this.usersRepo.find({
            where: { id: In(ids) },
            relations: ['profile'],
        });

        return bookmarkedUsers;
    }

    async getPassByProfiles(userId: string): Promise<User[]> {
        const user = await this.usersRepo.findOne({
            where: { id: userId },
            relations: ['bookmarks', 'bookmarks.bookmarkedUser'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const passByList = user.bookmarks.filter(
            b => b.type === BookmarkType.PASS_BY,
        );

        if (passByList.length === 0) {
            return [];
        }

        const ids = passByList.map(b => b.bookmarkedUser.id);

        const passedByUsers = await this.usersRepo.find({
            where: { id: In(ids) },
            relations: ['profile'],
        });

        return passedByUsers;
    }

    async updatePassBy(
        userId: string,
        targetUserId: string,
    ): Promise<Bookmark> {
        const [me, target] = await Promise.all([
            this.usersRepo.findOne({ where: { id: userId } }),
            this.usersRepo.findOne({ where: { id: targetUserId } }),
        ]);
        if (!me || !target) {
            throw new NotFoundException('User not found');
        }

        let bm = await this.bookmarkRepo.findOne({
            where: { user: { id: userId }, bookmarkedUser: { id: targetUserId } },
        });

        if (!bm) {
            bm = this.bookmarkRepo.create({
                user: me,
                bookmarkedUser: target,
                type: BookmarkType.PASS_BY,
            });
            return this.bookmarkRepo.save(bm);
        }

        if (bm.type !== BookmarkType.PASS_BY) {
            bm.type = BookmarkType.PASS_BY;
            return this.bookmarkRepo.save(bm);
        }
        return bm;
    }

    async updateBookmark(
        userId: string,
        targetUserId: string,
    ): Promise<Bookmark> {
        const [me, target] = await Promise.all([
            this.usersRepo.findOne({ where: { id: userId } }),
            this.usersRepo.findOne({ where: { id: targetUserId } }),
        ]);
        if (!me || !target) {
            throw new NotFoundException('User not found');
        }

        let bm = await this.bookmarkRepo.findOne({
            where: { user: { id: userId }, bookmarkedUser: { id: targetUserId } },
        });

        if (!bm) {
            bm = this.bookmarkRepo.create({
                user: me,
                bookmarkedUser: target,
                type: BookmarkType.BOOKMARK,
            });
            return this.bookmarkRepo.save(bm);
        }

        if (bm.type !== BookmarkType.BOOKMARK) {
            bm.type = BookmarkType.BOOKMARK;
            return this.bookmarkRepo.save(bm);
        }
        return bm;
    }
}
