import { UserType } from './user.enum';

export interface CreateUseForOrganizationInput {
  firstName: string;
  lastName: string;
  email: string;
  /** Hashed password */
  password: string;
  type: UserType;
  organizationId: string;
}

export interface UserQuery {
  id?: string;
  email?: string;
}
