import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { AppNotificationRecipient } from './app-notification-recipient.entity';
import {
  CreateAppNotificationRecipientInput,
  AppNotificationRecipientFilter,
  BulkCreateAppNotificationRecipientInput,
  AppNotificationRecipientStatus,
} from './app-notification-recipient.interface';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';
import { Pagination } from '../../shared/interfaces/pagination.interface';

@Injectable()
export class AppNotificationRecipientService {
  constructor(
    @InjectRepository(AppNotificationRecipient)
    private repository: Repository<AppNotificationRecipient>,
  ) {}

  /** Builds a where clause from the filter, leaving out unset fields. */
  private toWhere({
    organizationId,
    ...filter
  }: AppNotificationRecipientFilter): FindOptionsWhere<AppNotificationRecipient> {
    const where: FindOptionsWhere<AppNotificationRecipient> =
      Object.fromEntries(
        Object.entries(filter).filter(([, value]) => value !== undefined),
      );

    if (organizationId) {
      where.notification = { organizationId };
    }

    return where;
  }

  /**
   * Unread notifications are grouped into a batch so they can be marked as
   * read together. Reuses the user's open batch, or starts a new one.
   */
  async resolveBatchIdForUser(userId: string) {
    const latestUnreadNotification = await this.repository.findOne({
      where: { userId, readAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    return latestUnreadNotification?.batchId || uuidv7();
  }

  async create(
    input: CreateAppNotificationRecipientInput,
  ): Promise<AppNotificationRecipient> {
    const batchId = await this.resolveBatchIdForUser(input.userId);

    return this.repository.save(this.repository.create({ ...input, batchId }));
  }

  async bulkCreate(
    input: BulkCreateAppNotificationRecipientInput,
  ): Promise<AppNotificationRecipient[]> {
    const recordsToCreate = await Promise.all(
      input.recipientIds.map(async (userId) => ({
        notificationId: input.notificationId,
        userId,
        batchId: await this.resolveBatchIdForUser(userId),
      })),
    );

    return this.repository.save(this.repository.create(recordsToCreate));
  }

  async find(
    filter: AppNotificationRecipientFilter,
    pagination: Pagination = {},
  ): Promise<PaginatedResult<AppNotificationRecipient>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;

    const [records, total] = await this.repository.findAndCount({
      where: this.toWhere(filter),
      relations: { notification: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { page, limit, total, records };
  }

  /**
   * Marks a record and all other records with the same batch ID as read.
   */
  async markAsRead(filter: AppNotificationRecipientFilter) {
    const notification = await this.repository.findOne({
      where: this.toWhere(filter),
    });

    if (notification) {
      await this.repository.update(
        { batchId: notification.batchId, userId: notification.userId },
        { readAt: new Date(), status: AppNotificationRecipientStatus.READ },
      );
    }
  }
}
