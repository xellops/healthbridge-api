import { ServiceStatus } from './service.enum';

export interface CreateServiceInput {
  organizationId: string;
  name: string;
  description?: string | null;
  status?: ServiceStatus;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string | null;
  status?: ServiceStatus;
}

export interface ServiceQuery {
  id: string;
  /** The caller's organization. System-generated services are visible to every organization. */
  organizationId: string;
}

export interface ServiceFilter {
  organizationId: string;
  status?: ServiceStatus;
  /** true: only system-generated; false: only the organization's own; unset: both */
  isSystemGenerated?: boolean;
  /** Case-insensitive match on name */
  search?: string;
}
