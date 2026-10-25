import { UserStatus, UserType } from '../user/user.enum';

/** The user types this module manages. Patients are handled elsewhere. */
export const ORGANIZATION_USER_TYPES = [UserType.ADMIN, UserType.STAFF];

export interface CreateOrganizationUserInput {
  firstName: string;
  lastName: string;
  email: string;
  type: UserType;
  organizationId: string;
  departmentId: string;
}

export interface SuspendOrganizationUserInput {
  /** The user to suspend */
  userId: string;
  organizationId: string;
  /** The admin doing the suspending */
  suspendedById: string;
}

export interface ReactivateOrganizationUserInput {
  /** The user to reactivate */
  userId: string;
  organizationId: string;
}

export interface OrganizationUserFilter {
  organizationId: string;
  type?: UserType;
  status?: UserStatus;
  search?: string;
  departmentId?: string;
}

export interface ChangeOrganizationUserDepartmentInput {
  userId: string;
  organizationId: string;
  /** The department to move the user to */
  departmentId: string;
}
