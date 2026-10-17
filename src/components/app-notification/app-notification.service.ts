import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppNotification } from './app-notification.entity';
import { CreateAppNotificationInput } from './app-notification.interface';
import { AppNotificationRecipientService } from '../app-notification-recipient/app-notification-recipient.service';
import { EventManagerService } from '../event-manager/event-manager.service';
import { AppNotificationEvent } from './app-notification.event';

@Injectable()
export class AppNotificationService {
  constructor(
    @InjectRepository(AppNotification)
    private appNotificationRepository: Repository<AppNotification>,
    @Inject(AppNotificationRecipientService)
    private readonly appNotificationRecipientService: AppNotificationRecipientService,
    @Inject(EventManagerService)
    private readonly eventManager: EventManagerService,
  ) {}

  async create(input: CreateAppNotificationInput): Promise<AppNotification> {
    const { recipientIds, ...data } = input;

    const notification = await this.appNotificationRepository.save(
      this.appNotificationRepository.create(data),
    );

    await this.appNotificationRecipientService.bulkCreate({
      notificationId: notification.id,
      recipientIds,
    });

    // TODO: Queue push notification

    this.eventManager.emit(AppNotificationEvent.CREATED, notification);

    return notification;
  }
}
