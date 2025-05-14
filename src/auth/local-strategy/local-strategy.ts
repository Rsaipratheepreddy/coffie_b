import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
    ) {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET must be defined');
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
        if (!user) throw new UnauthorizedException();
        return { id: user.id, mobile: user.mobile };
    }
}
