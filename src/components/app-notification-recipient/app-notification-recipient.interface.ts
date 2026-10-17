export enum AppNotificationRecipientStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
}

export interface CreateAppNotificationRecipientInput {
  userId: string;
  notificationId: string;
}

export interface BulkCreateAppNotificationRecipientInput {
  notificationId: string;
  recipientIds: string[];
}

export interface AppNotificationRecipientFilter {
  id?: string;
  userId?: string;
  notificationId?: string;
  batchId?: string;
  status?: AppNotificationRecipientStatus;
  /** Matches on the notification's organization. */
  organizationId?: string;
}
