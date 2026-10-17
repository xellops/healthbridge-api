import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SnakeNamingStrategy } from './shared/utils/snake-naming.strategy';
import { AuthGuard } from './components/auth/auth.guard';
import { EventManagerModule } from './components/event-manager/event-manager.module';
import { CacheModule } from './components/cache/cache.module';
import { UserModule } from './components/user/user.module';
import { AuthModule } from './components/auth/auth.module';
import { ProfileModule } from './components/profile/profile.module';
import { AppNotificationModule } from './components/app-notification/app-notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
        // Never enable in production; use migrations there.
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
      }),
    }),
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD || undefined,
        },
      }),
    }),
    EventManagerModule,
    CacheModule,
    UserModule,
    AuthModule,
    ProfileModule,
    AppNotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
