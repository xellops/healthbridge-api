import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { NormalizeEmail } from '../../shared/utils/decorators';
import { UserStatus, UserType } from '../user/user.enum';
import { ORGANIZATION_USER_TYPES } from './organization-user.interface';

export class CreateOrganizationUserDto {
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

  @IsIn(ORGANIZATION_USER_TYPES)
  type: UserType;

  @IsUUID()
  departmentId: string;
}

export class OrganizationUserFilterDto {
  @IsOptional()
  @IsIn(ORGANIZATION_USER_TYPES)
  type?: UserType;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  /** Matches first name, last name or email */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;
}

export class ChangeOrganizationUserDepartmentDto {
  @IsUUID()
  departmentId: string;
}
