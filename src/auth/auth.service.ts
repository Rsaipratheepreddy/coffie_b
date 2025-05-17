import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'crypto';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { RequestOtpDto, VerifyOtpDto } from './dtos/signup.dto';

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

    async sendOtp(dto: RequestOtpDto) {
        const { mobile } = dto;
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

    async verifyOtp(dto: VerifyOtpDto) {
        const { mobile, otp } = dto;
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
            { secret: this.jwtSecret },
        );

        return { access_token: token };
    }

    async me(userId: string) {
        return this.usersRepo.findOne({
            where: { id: userId },
            select: ['id', 'mobile'],
        });
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
}
