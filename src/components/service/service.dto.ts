import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ServiceStatus } from './service.enum';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

/**
 * Query strings are text, and implicit conversion would turn "false" into
 * true. Read the raw value instead.
 */
const queryBoolean = () =>
  Transform(({ obj, key }) => {
    const raw = obj[key];
    if (raw === 'true' || raw === true) return true;
    if (raw === 'false' || raw === false) return false;
    return raw;
  });

/** Organizations can only create their own services; system ones are seeded by the platform. */
export class CreateServiceDto {
  @trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @trim()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;
}

export class UpdateServiceDto {
  @IsOptional()
  @trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  /** Send null to clear it. */
  @IsOptional()
  @trim()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;
}

export class ServiceFilterDto {
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @queryBoolean()
  @IsBoolean()
  isSystemGenerated?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
