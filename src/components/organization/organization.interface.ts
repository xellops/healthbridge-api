import { OrganizationLevel, OrganizationOwnership } from './organization.enum';

export interface CreateOrganizationInput {
  name: string;
  ownership: OrganizationOwnership;
  level: OrganizationLevel;
  phone: string;
  admin: {
    firstName: string;
    lastName: string;
    email: string;
  };
  branch: {
    name: string;
    street: string;
    city?: string;
    state: string;
    countryCode: string;
  };
}

export interface OrganizationQuery {
  id?: string;
  ownership?: OrganizationOwnership;
  level?: OrganizationLevel;
}
