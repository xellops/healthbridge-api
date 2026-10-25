export interface Organization {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  userId: string; // The user who created the organization
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notes:
 * - Patient can renew a card
 * - Card type cannot be changed after creation
 */
export interface Card {
  id: string;
  organizationId: string;
  name: string;
  cardTypeId: string;
  hmoProviderId?: string;
  patAntId: string;
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardType {
  id: string;
  organizationId: string;
  name: string;
  code: 'FAMILY' | 'INDIVIDUAL' | 'CORPORATE'; // Use enum
  description: string;
  price: number;
  status: 'active' | 'inactive'; // Use enum
  createdAt: Date;
  updatedAt: Date;
}

export interface CardPatient {
  id: string;
  organizationId: string;
  cardId: string;
  patientId: string;
  hmoNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HmoProvider {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  password: string;
  type: 'staff' | 'patient';
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  organizationId: string;
  hospitalNumber: string; // If the admin does not provide a hospital number, the system will generate one automatically
  userId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  address: string;
  phoneNumber: string;
  email?: string;
  occupation?: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhoneNumber: string;
  nextOfKinAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientAllergyAndDisability {
  id: string;
  organizationId: string;
  patientId: string;
  condition: string;
  type: 'allergy' | 'disability'; // Use enum
  reaction?: string;
  severity?: 'mild' | 'moderate' | 'severe'; // Use enum instead
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientHistory {
  id: string;
  organizationId: string;
  patientId: string;
  encounterId: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Encounter {
  id: string;
  organizationId: string;
  patientId: string;
  staffId: string; // This must be a doctor
  encounterDate: Date;
  encounterType: 'antenatal' | 'outpatient' | 'emergency'; // Use enum
  cardId?: string;
  primaryServiceId: string;
  branchId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  organizationId: string;
  patientId: string;
  staffId: string;
  appointmentDate: Date;
  appointmentType: 'antenatal' | 'outpatient' | 'emergency'; // Use enum
  primaryServiceId?: string;
  branchId?: string;
  cardId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** See prd/service.md */
export interface Service {
  id: string;
  /** Null for system-generated services */
  organizationId?: string;
  isSystemGenerated: boolean; // default false
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  phoneNumber: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchService {
  id: string;
  organizationId: string;
  branchId: string;
  serviceId: string;
  price: number;
  status: 'active' | 'inactive'; // per-branch availability
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  roleId?: string;
  organizationId?: string;
  status: any; // Implement a DepartmentStatus enum: active and inactive.
  createdAt: Date;
  updatedAt: Date;
}
