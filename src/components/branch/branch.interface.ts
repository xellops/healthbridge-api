export interface CreateBranchInput {
  organizationId: string;
  name: string;
  address: string;
  phoneNumber: string;
  email?: string | null;
}

export interface UpdateBranchInput {
  name?: string;
  address?: string;
  phoneNumber?: string;
  email?: string | null;
}

export interface BranchQuery {
  id: string;
  organizationId: string;
}

export interface BranchFilter {
  organizationId: string;
  /** Case-insensitive match on name or address */
  search?: string;
}
