import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { BranchServiceStatus } from './branch-service.enum';

const MAX_PRICE = 9_999_999_999.99; // numeric(12, 2)

export class CreateBranchServiceDto {
  @IsUUID()
  branchId: string;

  @IsUUID()
  serviceId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_PRICE)
  price: number;

  @IsOptional()
  @IsEnum(BranchServiceStatus)
  status?: BranchServiceStatus;
}

/** Only price and status can change; to move a service to another branch, delete and re-create it. */
export class UpdateBranchServiceDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_PRICE)
  price?: number;

  @IsOptional()
  @IsEnum(BranchServiceStatus)
  status?: BranchServiceStatus;
}

export class BranchServiceFilterDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @IsOptional()
  @IsEnum(BranchServiceStatus)
  status?: BranchServiceStatus;
}
