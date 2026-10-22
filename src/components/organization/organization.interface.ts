import {
  OrganizationLevel,
  OrganizationOwnership,
  OrganizationStatus,
} from './organization.enum';

export interface CreateOrganizationInput {
  name: string;
  email: string;
  phone?: string;
  ownership: OrganizationOwnership;
  level: OrganizationLevel;
  admin: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface OrganizationQuery {
  id?: string;
  email?: string;
  ownership?: OrganizationOwnership;
  level?: OrganizationLevel;
  status?: OrganizationStatus;
}
