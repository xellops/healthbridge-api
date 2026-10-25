import { UserStatus, UserType } from './user.enum';

export interface CreateUseForOrganizationInput {
  firstName: string;
  lastName: string;
  email: string;
  /** Hashed password */
  password: string;
  type: UserType;
  organizationId: string;
}

export interface UserFilter {
  organizationId?: string;
  /** Matches any of the given types */
  types?: UserType[];
  status?: UserStatus;
  /** Case-insensitive match on first name, last name or email */
  search?: string;
  departmentId?: string;
}

export interface UserQuery {
  id?: string;
  email?: string;
  organizationId?: string;
  status?: UserStatus;
}
