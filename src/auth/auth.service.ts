import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { LoginDto, SignupDto } from './dtos/signup.dto';

const DUMMY_OTP = '123456';

@Injectable()
export class AuthService {
    private readonly jwtSecret: string;

    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        private readonly jwtService: JwtService,
        configService: ConfigService,
    ) {
        this.jwtSecret = process.env.JWT_SECRET;
        if (!this.jwtSecret) throw new Error('JWT_SECRET must be defined');
    }

    private hashPassword(password: string): string {
        const salt = randomBytes(16).toString('hex');
        const derivedKey = scryptSync(password, salt, 64).toString('hex');
        return `${salt}:${derivedKey}`;
    }

    async sendOtp(mobile: string) {
        console.log(`OTP for ${mobile}: ${DUMMY_OTP}`);
        return { message: `OTP sent to ${mobile}` };
    }

    async verifyOtp(mobile: string, otp: string) {
        if (otp !== DUMMY_OTP) throw new UnauthorizedException('Invalid OTP');
        const user = await this.usersRepo.findOne({ where: { mobile } });
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const token = this.jwtService.sign(
            { sub: user.id, mobile: user.mobile },
            { secret: this.jwtSecret },
        );
        return { access_token: token };
    }

    private verifyPassword(stored: string, supplied: string): boolean {
        const [salt, key] = stored.split(':');
        const derived = scryptSync(supplied, salt, 64);
        return timingSafeEqual(Buffer.from(key, 'hex'), derived);
    }

    async signup(dto: SignupDto) {
        const exists = await this.usersRepo.findOne({ where: { mobile: dto.mobile } });
        if (exists) throw new ConflictException('Mobile number already in use');
        const passwordHash = this.hashPassword(dto.password);
        const user = this.usersRepo.create({ mobile: dto.mobile, password: passwordHash });
        await this.usersRepo.save(user);
        return { message: 'Signup successful' };
    }

    async login(dto: LoginDto) {
        const user = await this.usersRepo.findOne({ where: { mobile: dto.mobile } });
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const valid = this.verifyPassword(user.password, dto.password);
        if (!valid) throw new UnauthorizedException('Invalid credentials');
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
}
