import { Module } from '@nestjs/common';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation } from 'src/entities/invite.entity';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [InvitesController],
  providers: [InvitesService]
})
export class InvitesModule { }
