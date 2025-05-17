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
import { MessageResponseDto } from './dtos/message-response.dto';
import { UserProfileDto } from './dtos/user-profile.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get current user profile',
        description: 'Retrieves the profile of the currently authenticated user'
    })
    @ApiOkResponse({
        description: 'User profile retrieved successfully',
        type: UserProfileDto
    })
    @ApiUnauthorizedResponse({
        description: 'Not authenticated',
        schema: {
            example: {
                statusCode: 401,
                message: 'Unauthorized'
            }
        }
    })
    async getProfile(@Request() req): Promise<UserProfileDto> {
        return this.authService.getProfile(req.user.id);
    }



    @Post('otp/request')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Request an OTP',
        description: 'Sends a 6-digit OTP to the provided mobile number for login/signup. OTP expires in 10 minutes.'
    })
    @ApiBody({
        type: RequestOtpDto,
        description: 'Mobile number to send OTP to'
    })
    @ApiOkResponse({
        description: 'OTP sent successfully',
        type: MessageResponseDto,
        schema: {
            example: {
                message: 'OTP sent successfully'
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.TOO_MANY_REQUESTS,
        description: 'Too many OTP requests',
        schema: {
            example: {
                statusCode: 429,
                message: 'Too many requests, please try again later'
            }
        }
    })
    async requestOtp(@Body() dto: RequestOtpDto): Promise<MessageResponseDto> {
        await this.authService.sendOtp(dto.mobile);
        return { message: 'OTP sent successfully' };
    }

    @Post('otp/verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Verify OTP',
        description: 'Verifies the OTP sent to the mobile number. If valid, returns a JWT token. Creates a new user if mobile number is new.'
    })
    @ApiBody({
        type: VerifyOtpDto,
        description: 'Mobile number and OTP to verify'
    })
    @ApiOkResponse({
        description: 'OTP verified successfully',
        type: AuthResponseDto,
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                expires_in: 86400
            }
        }
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid OTP',
        schema: {
            example: {
                statusCode: 401,
                message: 'Invalid OTP'
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'OTP expired or not requested',
        schema: {
            example: {
                statusCode: 400,
                message: 'OTP has expired'
            }
        }
    })
    async verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthResponseDto> {
        return this.authService.verifyOtp(dto.mobile, dto.otp);
    }

    @Delete('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Logout',
        description: 'Logs out the current user by invalidating their JWT token'
    })
    @ApiNoContentResponse({
        description: 'Logged out successfully'
    })
    @ApiUnauthorizedResponse({
        description: 'Not authenticated',
        schema: {
            example: {
                statusCode: 401,
                message: 'Unauthorized'
            }
        }
    })
    async logout(@Request() req): Promise<void> {
        await this.authService.logout(req.user.id);
    }

    @Delete('account')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Delete Account',
        description: 'Permanently deletes the current user\'s account and all associated data'
    })
    @ApiOkResponse({
        description: 'Account deleted successfully',
        type: MessageResponseDto,
        schema: {
            example: {
                message: 'User deleted successfully'
            }
        }
    })
    @ApiUnauthorizedResponse({
        description: 'Not authenticated',
        schema: {
            example: {
                statusCode: 401,
                message: 'Unauthorized'
            }
        }
    })
    async deleteAccount(@Request() req): Promise<MessageResponseDto> {
        return this.authService.deleteUser(req.user.id);
    }

    @Delete('all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Delete All Users',
        description: 'Permanently deletes all users from the database. This is an open API with no authentication required.'
    })
    @ApiOkResponse({
        description: 'All users deleted successfully',
        type: MessageResponseDto,
        schema: {
            example: {
                message: 'All users deleted successfully'
            }
        }
    })
    async deleteAllUsers(): Promise<MessageResponseDto> {
        return this.authService.deleteAllUsers();
    }
}
