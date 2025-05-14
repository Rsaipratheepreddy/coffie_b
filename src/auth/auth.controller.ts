import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto, RequestOtpDto, SignupDto, VerifyOtpDto } from './dtos/signup.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    @ApiOperation({ summary: 'Register with mobile + password' })
    @ApiBody({ type: SignupDto })
    @ApiResponse({ status: 201, description: 'Signup successful' })
    @ApiResponse({ status: 409, description: 'Mobile already in use' })
    signup(@Body() dto: SignupDto) {
        return this.authService.signup(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login with mobile + password' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 200, description: 'JWT access_token issued', schema: {
            example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…' }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('otp/request')
    @ApiOperation({ summary: 'Request an OTP for mobile login/signup' })
    @ApiBody({ type: RequestOtpDto })
    @ApiResponse({ status: 200, description: 'OTP sent (123456)' })
    requestOtp(@Body() dto: RequestOtpDto) {
        return this.authService.sendOtp(dto.mobile);
    }

    @Post('otp/verify')
    @ApiOperation({ summary: 'Verify OTP and receive JWT' })
    @ApiBody({ type: VerifyOtpDto })
    @ApiResponse({
        status: 200, description: 'JWT access_token issued', schema: {
            example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…' }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid OTP' })
    verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto.mobile, dto.otp);
    }
}
