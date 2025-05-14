import {
    Controller,
    Post,
    Put,
    Get,
    Param,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiOkResponse,
    ApiBadRequestResponse,
} from '@nestjs/swagger';
import { InvitesService } from './invites.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { Invitation } from 'src/entities/invite.entity';
import { User } from 'src/entities/user.entity';

@ApiTags('Invites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invites')
export class InvitesController {
    constructor(private readonly invitesService: InvitesService) { }

    @Post(':inviteeId')
    @ApiOperation({ summary: 'Send an invite to a user' })
    @ApiOkResponse({ type: Invitation })
    @ApiBadRequestResponse()
    sendInvite(
        @Param('inviteeId') inviteeId: string,
        @Request() req,
    ): Promise<Invitation> {
        return this.invitesService.sendInvite(req.user.id, inviteeId);
    }

    @Put(':inviteId/accept')
    @ApiOperation({ summary: 'Accept an invitation' })
    @ApiOkResponse({ type: Invitation })
    @ApiBadRequestResponse()
    acceptInvite(
        @Param('inviteId') inviteId: string,
        @Request() req,
    ): Promise<Invitation> {
        return this.invitesService.acceptInvite(inviteId, req.user.id);
    }

    @Put(':inviteId/reject')
    @ApiOperation({ summary: 'Decline an invitation' })
    @ApiOkResponse({ type: Invitation })
    @ApiBadRequestResponse()
    rejectInvite(
        @Param('inviteId') inviteId: string,
        @Request() req,
    ): Promise<Invitation> {
        return this.invitesService.rejectInvite(inviteId, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: 'List all sent and received invites' })
    @ApiOkResponse({ schema: { example: { sent: [], received: [] } } })
    getInvites(
        @Request() req,
    ): Promise<{
        sent: Invitation[];
        received: Invitation[];
    }> {
        return this.invitesService.getUserInvites(req.user.id);
    }

    @Get('accepted')
    @ApiOperation({ summary: 'Get all accepted users' })
    @ApiOkResponse({ schema: { example: { acceptedSent: [], acceptedReceived: [] } } })
    getAcceptedUsers(
        @Request() req,
    ): Promise<{
        acceptedSent: User[];
        acceptedReceived: User[];
    }> {
        return this.invitesService.getAcceptedUsers(req.user.id);
    }

}
