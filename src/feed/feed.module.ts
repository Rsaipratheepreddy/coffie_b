import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Bookmark } from 'src/entities/bookmark.entity';
import { JwtModule } from '@nestjs/jwt';
import { Profile } from 'src/entities/profile.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Bookmark, Profile]),
    JwtModule.register({
      secret: "4f9d3e2a7b0c1d8f5e6a9b3c7d1e4f0a9c2b3d4e5f6a7b8c9d0e1f2a3b4c5d6",
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [FeedService, JwtAuthGuard],
  controllers: [FeedController]
})
export class FeedModule { }
