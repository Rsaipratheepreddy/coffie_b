import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';
import { Invitation } from 'src/entities/invite.entity';
import { User } from 'src/entities/user.entity';
import { JwtStrategy } from 'src/auth/local-strategy/local-strategy';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Invitation, User]),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [InvitesController],
  providers: [InvitesService, JwtStrategy, JwtAuthGuard],
})
export class InvitesModule { }
