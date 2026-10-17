import { ResourceType } from '../../shared/enums/resource.enum';

export interface CreateAppNotificationInput {
  organizationId?: string;
  resourceId: string;
  resourceType: ResourceType;
  title: string;
  description?: string;
  recipientIds: string[];
}

export interface AppNotificationFilter {
  id?: string;
  organizationId?: string;
  resourceType?: ResourceType;
  resourceId?: string;
}
