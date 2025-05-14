// src/auth/jwt-auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const secret = process.env.JWT_SECRET || '4f9d3e2a7b0c1d8f5e6a9b3c7d1e4f0a9c2b3d4e5f6a7b8c9d0e1f2a3b4c5d6';
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