import { BranchServiceStatus } from './branch-service.enum';

export interface CreateBranchServiceInput {
  organizationId: string;
  branchId: string;
  serviceId: string;
  price: number;
  status?: BranchServiceStatus;
}

export interface UpdateBranchServiceInput {
  price?: number;
  status?: BranchServiceStatus;
}

export interface BranchServiceQuery {
  id: string;
  organizationId: string;
}

export interface BranchServiceFilter {
  organizationId: string;
  branchId?: string;
  serviceId?: string;
  status?: BranchServiceStatus;
}
