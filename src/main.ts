// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import { FeedModule } from './feed/feed.module';
import { InvitesModule } from './invites/invites.module';
import { ChatsModule } from './chats/chats.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'https://your-flutter-web-domain'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  });
  const configService = app.get(ConfigService);
  console.log('JWT_SECRET:', configService.get('JWT_SECRET') || 'Not set');
  console.log('DATABASE_URL:', configService.get('DATABASE_URL'));
  console.log('PORT:', configService.get('PORT'));
  console.log('Server Time:', new Date().toISOString());

  const config = new DocumentBuilder()
    .setTitle('Coffie Space')
    .setDescription('APIs for Coffie Space')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [ProfileModule, AuthModule, FeedModule, InvitesModule, ChatsModule],
  });

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();