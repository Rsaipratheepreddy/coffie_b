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
      secret: "4f9d3e2a7b0c1d8f5e6a9b3c7d1e4f0a9c2b3d4e5f6a7b8c9d0e1f2a3b4c5d6",
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [ProfileService, JwtAuthGuard],
  controllers: [ProfileController],
})
export class ProfileModule { }