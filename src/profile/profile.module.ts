// src/profile/profile.module.ts
import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Profile } from 'src/entities/profile.entity';
import { User } from 'src/entities/user.entity';
import { Experience } from 'src/entities/experience.entity';
import { Education } from 'src/entities/education.entity';
import { Background } from 'src/entities/background.entity';
import { ProfileController } from './profile.controller';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, User, Experience, Education, Background]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [ProfileService, JwtAuthGuard],
  controllers: [ProfileController],
})
export class ProfileModule { }