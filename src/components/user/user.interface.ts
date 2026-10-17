import { UserType } from './user.enum';

export interface CreateUserInput {
  email: string;
  /** Hashed password */
  password: string;
  type: UserType;
}

export interface UserQuery {
  id?: string;
  email?: string;
}
