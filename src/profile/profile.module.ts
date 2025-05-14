import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { Profile } from 'src/entities/profile.entity';
import { User } from 'src/entities/user.entity';
import { Experience } from 'src/entities/experience.entity';
import { Education } from 'src/entities/education.entity';
import { Background } from 'src/entities/background.entity';
import { JwtStrategy } from 'src/auth/local-strategy/local-strategy';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Profile, User, Experience, Education, Background]),
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
  providers: [ProfileService, JwtStrategy, JwtAuthGuard],
  controllers: [ProfileController],
})
export class ProfileModule { }
