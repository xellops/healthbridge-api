import { UserType } from '../user/user.enum';

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface SignInSuccessPayload extends AuthTokens {
  id: string;
  email: string;
  type: UserType;
}

export interface PasswordResetRequestInput {
  email: string;
}

export interface PasswordResetInput {
  email: string;
  otp: string;
  password: string;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  type: UserType;
}

export interface RefreshTokenPayload {
  id: string;
}

export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
}
