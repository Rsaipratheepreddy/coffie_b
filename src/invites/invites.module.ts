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
      secret: "4f9d3e2a7b0c1d8f5e6a9b3c7d1e4f0a9c2b3d4e5f6a7b8c9d0e1f2a3b4c5d6",
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [InvitesController],
  providers: [InvitesService]
})
export class InvitesModule { }
