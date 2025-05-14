import {
    Controller,
    Get,
    Put,
    Param,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { FeedService } from './feed.service';
import { User } from 'src/entities/user.entity';
import { Bookmark } from 'src/entities/bookmark.entity';

@ApiTags('Feed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feed')
export class FeedController {
    constructor(private readonly feedService: FeedService) { }

    @Get()
    @ApiOperation({ summary: 'Get next available user in feed' })
    @ApiOkResponse({
        schema: {
            example: { availableUsersCount: 42, user: { /* User object or null */ } },
        },
    })
    getFeed(@Request() req) {
        return this.feedService.getFeed(req.user.userId);
    }

    @Get('bookmarks')
    @ApiOperation({ summary: 'Get all bookmarked profiles' })
    @ApiOkResponse({ type: [User] })
    getBookmarked(@Request() req): Promise<User[]> {
        return this.feedService.getBookMarkedProfiles(req.user.userId);
    }

    @Get('pass-by')
    @ApiOperation({ summary: 'Get all pass-by profiles' })
    @ApiOkResponse({ type: [User] })
    getPassBy(@Request() req): Promise<User[]> {
        return this.feedService.getPassByProfiles(req.user.userId);
    }

    @Put('bookmark/:targetId')
    @ApiOperation({ summary: 'Bookmark a user' })
    @ApiOkResponse({ type: Bookmark })
    updateBookmark(
        @Param('targetId') targetId: string,
        @Request() req,
    ): Promise<Bookmark> {
        return this.feedService.updateBookmark(req.user.userId, targetId);
    }

    @Put('pass-by/:targetId')
    @ApiOperation({ summary: 'Pass by a user' })
    @ApiOkResponse({ type: Bookmark })
    updatePassBy(
        @Param('targetId') targetId: string,
        @Request() req,
    ): Promise<Bookmark> {
        return this.feedService.updatePassBy(req.user.userId, targetId);
    }
}