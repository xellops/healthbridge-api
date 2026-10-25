import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseOptions } from './database/database.config';
import { AuthGuard } from './components/auth/auth.guard';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { EventManagerModule } from './components/event-manager/event-manager.module';
import { CacheModule } from './components/cache/cache.module';
import { UserModule } from './components/user/user.module';
import { AuthModule } from './components/auth/auth.module';
import { ProfileModule } from './components/profile/profile.module';
import { AppNotificationModule } from './components/app-notification/app-notification.module';
import { OrganizationModule } from './components/organization/organization.module';
import { OrganizationUserModule } from './components/organization-user/organization-user.module';
import { DepartmentModule } from './components/department/department.module';
import { BranchModule } from './components/branch/branch.module';
import { ServiceModule } from './components/service/service.module';
import { BranchServiceModule } from './components/branch-service/branch-service.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({ ...databaseOptions(), autoLoadEntities: true }),
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
    OrganizationModule,
    OrganizationUserModule,
    DepartmentModule,
    BranchModule,
    ServiceModule,
    BranchServiceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
