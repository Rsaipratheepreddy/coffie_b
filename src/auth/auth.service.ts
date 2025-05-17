import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'crypto';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { RequestOtpDto, VerifyOtpDto } from './dtos/signup.dto';
import { UserProfileDto } from './dtos/user-profile.dto';

@Injectable()
export class AuthService {
    private readonly jwtSecret: string;

    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        private readonly jwtService: JwtService,
        configService: ConfigService,
    ) {
        this.jwtSecret = configService.get<string>('JWT_SECRET');
        if (!this.jwtSecret) throw new Error('JWT_SECRET must be defined');
    }

    private generateOtp(): string {
        return '123456';
    }

    async sendOtp(mobile: string) {
        const otp = this.generateOtp();

        const user = await this.usersRepo.findOne({ where: { mobile } });
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        if (user) {
            user.otpHash = otp;
            user.otpExpiry = otpExpiry;
            await this.usersRepo.save(user);
        } else {
            const newUser = this.usersRepo.create({
                mobile,
                otpHash: otp,
                otpExpiry
            });
            await this.usersRepo.save(newUser);
        }

        return { message: `OTP sent to ${mobile}` };
    }

    async verifyOtp(mobile: string, otp: string): Promise<AuthResponseDto> {
        const user = await this.usersRepo.findOne({ where: { mobile } });

        if (!user) {
            throw new UnauthorizedException('Invalid mobile number');
        }

        if (!user.otpHash || !user.otpExpiry) {
            throw new BadRequestException('No OTP was requested');
        }

        if (new Date() > user.otpExpiry) {
            throw new BadRequestException('OTP has expired');
        }

        if (user.otpHash !== otp) {
            throw new UnauthorizedException('Invalid OTP');
        }

        user.otpHash = null;
        user.otpExpiry = null;
        await this.usersRepo.save(user);

        const token = this.jwtService.sign(
            { sub: user.id, mobile: user.mobile },
            { secret: this.jwtSecret, expiresIn: '24h' },
        );

        return {
            access_token: token,
            expires_in: 24 * 60 * 60
        };
    }

    async getProfile(userId: string): Promise<UserProfileDto> {
        const user = await this.usersRepo.findOne({
            where: { id: userId },
            relations: ['profile'],
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const profile: UserProfileDto = {
            id: user.id,
            mobile: user.mobile,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        return profile;
    }

    async deleteUser(userId: string) {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        await this.usersRepo.remove(user);
        return { message: 'User deleted successfully' };
    }

    async deleteAllUsers() {
        await this.usersRepo.clear();
        return { message: 'All users deleted successfully' };
    }

    async logout(userId: string): Promise<void> {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        // In a real app, you might want to invalidate the token here
        // For now, we'll just return as the client will remove the token
    }
}
