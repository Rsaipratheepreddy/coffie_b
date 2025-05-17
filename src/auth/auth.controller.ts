import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Request,
    HttpStatus,
    HttpCode,
    Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
    ApiOkResponse,
    ApiUnauthorizedResponse,
    ApiConflictResponse,
    ApiNoContentResponse,
} from '@nestjs/swagger';
import { RequestOtpDto, VerifyOtpDto } from './dtos/signup.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { AuthResponseDto } from './dtos/auth-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiOkResponse({ description: 'Returns the current user profile' })
    @ApiUnauthorizedResponse({ description: 'Not authenticated' })
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.id);
    }



    @Post('otp/request')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request an OTP for mobile login/signup' })
    @ApiBody({ type: RequestOtpDto })
    @ApiOkResponse({ description: 'OTP sent successfully' })
    async requestOtp(@Body() dto: RequestOtpDto): Promise<{ message: string }> {
        await this.authService.sendOtp(dto.mobile);
        return { message: 'OTP sent successfully' };
    }

    @Post('otp/verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify OTP and receive JWT' })
    @ApiBody({ type: VerifyOtpDto })
    @ApiOkResponse({ description: 'OTP verified successfully', type: AuthResponseDto })
    @ApiUnauthorizedResponse({ description: 'Invalid OTP' })
    async verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthResponseDto> {
        return this.authService.verifyOtp(dto.mobile, dto.otp);
    }

    @Delete('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Logout current user' })
    @ApiNoContentResponse({ description: 'Logged out successfully' })
    @ApiUnauthorizedResponse({ description: 'Not authenticated' })
    async logout(@Request() req): Promise<void> {
        await this.authService.logout(req.user.id);
    }

    @Delete('account')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete current user account' })
    @ApiOkResponse({ description: 'Account deleted successfully' })
    @ApiUnauthorizedResponse({ description: 'Not authenticated' })
    async deleteAccount(@Request() req): Promise<{ message: string }> {
        return this.authService.deleteUser(req.user.id);
    }

    @Delete('all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete all users (open API)' })
    @ApiOkResponse({ description: 'All users deleted successfully' })
    async deleteAllUsers(): Promise<{ message: string }> {
        return this.authService.deleteAllUsers();
    }
}
