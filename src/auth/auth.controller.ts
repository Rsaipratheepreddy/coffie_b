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
import { LoginDto, RequestOtpDto, SignupDto, VerifyOtpDto } from './dtos/signup.dto';
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

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register with mobile + password' })
    @ApiBody({ type: SignupDto })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Signup successful', type: AuthResponseDto })
    @ApiConflictResponse({ description: 'Mobile already in use' })
    async signup(@Body() dto: SignupDto): Promise<AuthResponseDto> {
        return this.authService.signup(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with mobile + password' })
    @ApiBody({ type: LoginDto })
    @ApiOkResponse({ description: 'Login successful', type: AuthResponseDto })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(dto);
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
}
