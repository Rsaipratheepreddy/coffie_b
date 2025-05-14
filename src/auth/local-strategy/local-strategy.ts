import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private usersRepo: Repository<User>,
    ) {
        const secreat = "f9d3e2a7b0c1d8f5e6a9b3c7d1e4f0a9c2b3d4e5f6a7b8c9d0e1f2a3b4c5d6"
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secreat,
        });
    }

    async validate(payload: any) {
        const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
        if (!user) throw new UnauthorizedException();
        return { id: user.id, mobile: user.mobile };
    }
}