import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AppNotificationRecipientStatus } from '../app-notification-recipient/app-notification-recipient.interface';

export class MarkNotificationAsReadDto {
  @IsUUID()
  notificationId: string;
}

export class UserAppNotificationFilterDto {
  @IsEnum(AppNotificationRecipientStatus)
  @IsOptional()
  status?: AppNotificationRecipientStatus;

  @IsUUID()
  @IsOptional()
  organizationId?: string;
}
