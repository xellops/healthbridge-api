import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppNotification } from './app-notification.entity';
import { AppNotificationService } from './app-notification.service';
import { AppNotificationController } from './app-notification.controller';
import { AppNotificationRecipientModule } from '../app-notification-recipient/app-notification-recipient.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppNotification]),
    AppNotificationRecipientModule,
  ],
  providers: [AppNotificationService],
  controllers: [AppNotificationController],
  exports: [AppNotificationService],
})
export class AppNotificationModule {}
