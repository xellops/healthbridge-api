import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { NormalizeEmail } from '../../shared/utils/decorators';
import { OrganizationLevel, OrganizationOwnership } from './organization.enum';

export class CreateOrganizationAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  lastName: string;

  @NormalizeEmail()
  @IsEmail()
  @MaxLength(80)
  email: string;
}

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @NormalizeEmail()
  @IsEmail()
  @MaxLength(80)
  email: string;

  @IsOptional()
  @Matches(/^\+?[0-9]{7,17}$/, { message: 'Invalid phone number' })
  phone?: string;

  @IsEnum(OrganizationOwnership)
  ownership: OrganizationOwnership;

  @IsEnum(OrganizationLevel)
  level: OrganizationLevel;

  @ValidateNested()
  @Type(() => CreateOrganizationAdminDto)
  admin: CreateOrganizationAdminDto;
}
