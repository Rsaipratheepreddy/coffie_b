// src/auth/jwt-auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const secret = process.env.JWT_SECRET || 'your-hardcoded-secret';
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
        console.log('JwtStrategy secretOrKey:', secret);
    }

    async validate(payload: any) {
        console.log('JWT Payload:', payload);
        if (!payload.sub) {
            console.error('Invalid payload: missing sub');
            throw new UnauthorizedException('Invalid token');
        }
        return { id: payload.sub, mobile: payload.mobile };
    }
}