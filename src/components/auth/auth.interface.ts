import { UserType } from '../user/user.enum';

export interface SignUpInput {
  email: string;
  password: string;
}

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

export interface EmailVerificationRequestInput {
  email: string;
}

export interface EmailVerificationInput {
  otp: string;
  email: string;
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

/** A sign-up held in the cache until the email address is verified. */
export interface UserToCreate {
  email: string;
  /** Hashed password */
  password: string;
}
