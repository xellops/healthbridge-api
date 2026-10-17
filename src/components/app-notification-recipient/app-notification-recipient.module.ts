import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppNotificationRecipient } from './app-notification-recipient.entity';
import { AppNotificationRecipientService } from './app-notification-recipient.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppNotificationRecipient])],
  providers: [AppNotificationRecipientService],
  exports: [AppNotificationRecipientService],
})
export class AppNotificationRecipientModule {}
