import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { User } from 'src/entities/user.entity';
import { JwtStrategy } from './local-strategy/local-strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: ' Avast', session: false }),
    JwtModule.register({
      secret: "4f9d3e2a7b0c1d8f5e6a9b3c7d1e4f0a9c2b3d4e5f6a7b8c9d0e1f2a3b4c5d6",
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [PassportModule, JwtModule, JwtAuthGuard, JwtStrategy], // Removed JwtService
})
export class AuthModule { }