import { DepartmentStatus } from './department.enum';

export interface CreateDepartmentInput {
  name: string;
  description?: string | null;
  organizationId: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  description?: string | null;
  status?: DepartmentStatus;
}

export interface DepartmentQuery {
  id: string;
  organizationId: string;
}

export interface DepartmentFilter {
  organizationId: string;
  status?: DepartmentStatus;
  /** Case-insensitive match on name */
  search?: string;
}
