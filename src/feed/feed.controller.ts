import {
    Controller,
    Get,
    Put,
    Param,
    Request,
    UseGuards,
    Query,
    Post,
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
@ApiBearerAuth('access-token')
@Controller('feed')
export class FeedController {
    constructor(private readonly feedService: FeedService) { }

    @Get()
    @ApiOperation({ summary: 'Get next available user in feed' })
    @ApiOkResponse({
        schema: {
            example: { availableUsersCount: 42, user: {} },
        },
    })
    getFeed(
        @Request() req,
        @Query('offset') offset?: string,
        @Query('limit') limit?: string,
    ) {
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        const limitNum = limit ? parseInt(limit, 10) : 1;
        return this.feedService.getFeed(req.user.id, offsetNum, limitNum);
    }

    @Get('bookmarks')
    @ApiOperation({ summary: 'Get all bookmarked profiles' })
    @ApiOkResponse({ type: [User] })
    getBookmarked(@Request() req): Promise<{ users: User[] }> {
        console.log('req.user', req.user);
        return this.feedService.getBookMarkedProfiles(req.user.id);
    }

    @Get('pass-by')
    @ApiOperation({ summary: 'Get all pass-by profiles' })
    @ApiOkResponse({ type: [User] })
    getPassBy(@Request() req): Promise<{ users: User[] }> {
        return this.feedService.getPassByProfiles(req.user.id);
    }

    @Post('bookmark/:targetId')
    @ApiOperation({ summary: 'Add a bookmark' })
    @ApiOkResponse({ type: Bookmark })
    addBookmark(
        @Param('targetId') targetId: string,
        @Request() req,
    ): Promise<Bookmark> {
        return this.feedService.updateBookmark(req.user.id, targetId);
    }

    @Post('pass-by/:targetId')
    @ApiOperation({ summary: 'Add a pass-by' })
    @ApiOkResponse({ type: Bookmark })
    addPassBy(
        @Param('targetId') targetId: string,
        @Request() req,
    ): Promise<Bookmark> {
        return this.feedService.updatePassBy(req.user.id, targetId);
    }


}
