import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { NormalizeEmail } from '../../shared/utils/decorators';

export class SignInDto {
  /** The organization's client ID */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  clientId: string;

  @NormalizeEmail()
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class RequestPasswordResetDto {
  /** The organization's client ID */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  clientId: string;

  @NormalizeEmail()
  @IsEmail()
  email: string;
}

export class PasswordResetDto {
  /** The organization's client ID */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  clientId: string;

  @NormalizeEmail()
  @IsEmail()
  email: string;

  @IsNumberString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class PasswordChangeDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
