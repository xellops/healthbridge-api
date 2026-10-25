import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { NormalizeEmail } from '../../shared/utils/decorators';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const PHONE = /^\+?[0-9]{7,17}$/;

export class CreateBranchDto {
  @trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @Matches(PHONE, { message: 'Invalid phone number' })
  phoneNumber: string;

  @IsOptional()
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(80)
  email?: string;
}

export class UpdateBranchDto {
  @IsOptional()
  @trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @Matches(PHONE, { message: 'Invalid phone number' })
  phoneNumber?: string;

  /** Send null to clear it. */
  @IsOptional()
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(80)
  email?: string | null;
}

export class BranchFilterDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
