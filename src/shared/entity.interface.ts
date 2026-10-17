export interface Organization {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  user_id: string; // The user who created the organization
  created_at: Date;
  updated_at: Date;
}

/**
 * Notes:
 * - Patient can renew a card
 * - Card type cannot be changed after creation
 */
export interface Card {
  id: string;
  organization_id: string;
  name: string;
  card_type_id: string;
  hmo_provider_id?: string;
  patient_id: string;
  expiration_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CardType {
  id: string;
  organization_id: string;
  name: string;
  code: 'FAMILY' | 'INDIVIDUAL' | 'CORPORATE';
  description: string;
  price: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface CardPatient {
  id: string;
  organization_id: string;
  card_id: string;
  patient_id: string;
  hmo_number?: string;
  created_at: Date;
  updated_at: Date;
}

export interface HmoProvider {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  password: string;
  type: 'staff' | 'patient';
  created_at: Date;
  updated_at: Date;
}

export interface Patient {
  id: string;
  organization_id: string;
  hospital_number: string; // If the admin does not provide a hospital number, the system will generate one automatically
  user_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: 'male' | 'female' | 'other';
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  address: string;
  phone_number: string;
  email?: string;
  occupation?: string;
  next_of_kin_name: string;
  next_of_kin_relationship: string;
  next_of_kin_phone_number: string;
  next_of_kin_address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PatientAllergyAndDisability {
  id: string;
  organization_id: string;
  patient_id: string;
  condition: string;
  type: 'allergy' | 'disability';
  reaction?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PatientHistory {
  id: string;
  organization_id: string;
  patient_id: string;
  encounter_id: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Encounter {
  id: string;
  organization_id: string;
  patient_id: string;
  staff_id: string; // This must be a doctor
  encounter_date: Date;
  encounter_type: 'antenatal' | 'outpatient' | 'emergency';
  card_id?: string;
  primary_service_id: string;
  branch_id: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Appointment {
  id: string;
  organization_id: string;
  patient_id: string;
  staff_id: string;
  appointment_date: Date;
  appointment_type: 'antenatal' | 'outpatient' | 'emergency';
  primary_service_id?: string;
  branch_id?: string;
  card_id: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface Branch {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  phone_number: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BranchService {
  id: string;
  organization_id: string;
  branch_id: string;
  service_id: string;
  price: number;
  created_at: Date;
  updated_at: Date;
}
