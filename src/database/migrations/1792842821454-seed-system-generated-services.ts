import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * System-generated services available to every organization (prd/service.md).
 * Common consultations, maternal and child health, procedures, admission
 * charges, nursing and clinic services offered by Nigerian hospitals. Lab
 * tests, imaging studies and drugs get their own catalogs (prd/entities.md).
 */
const SERVICES: [name: string, description: string][] = [
  // Consultations
  [
    'General Consultation',
    'General outpatient (GOPD) consultation with a medical officer',
  ],
  ['Follow-up Consultation', 'Review visit after a previous consultation'],
  ['Specialist Consultation', 'Consultation with a consultant or specialist'],
  [
    'Emergency Consultation',
    'Accident and Emergency (A&E) assessment and initial treatment',
  ],
  ['Paediatric Consultation', 'Consultation for children'],
  [
    'Obstetrics & Gynaecology Consultation',
    'Consultation for pregnancy and women’s health',
  ],
  ['Dental Consultation', 'Oral and dental examination'],
  ['Eye Consultation', 'Ophthalmology or optometry examination'],
  ['ENT Consultation', 'Ear, nose and throat consultation'],
  ['Psychiatric Consultation', 'Mental health assessment and treatment'],
  ['Dermatology Consultation', 'Skin, hair and nail consultation'],
  ['Telemedicine Consultation', 'Remote consultation by phone or video'],

  // Maternal and child health
  ['Antenatal Registration', 'Antenatal booking for a pregnant patient'],
  ['Antenatal Care Visit', 'Routine antenatal clinic visit'],
  ['Normal Delivery', 'Spontaneous vaginal delivery (SVD)'],
  ['Caesarean Section', 'Elective or emergency caesarean delivery'],
  ['Postnatal Care', 'Care for mother and baby after delivery'],
  ['Family Planning Services', 'Counselling and contraceptive services'],
  [
    'Childhood Immunization',
    'Routine immunization under the National Programme on Immunization (NPI)',
  ],
  ['Infant Welfare Clinic', 'Growth monitoring and well-baby checks'],

  // Procedures
  ['Male Circumcision', 'Circumcision, including neonatal circumcision'],
  ['Myomectomy', 'Surgical removal of uterine fibroids'],
  ['Hysterectomy', 'Surgical removal of the uterus'],
  [
    'Dilatation and Curettage',
    'D&C, including evacuation of retained products of conception',
  ],
  ['Appendectomy', 'Surgical removal of the appendix'],
  ['Hernia Repair', 'Herniorrhaphy or hernioplasty'],
  ['Incision and Drainage', 'Drainage of an abscess'],
  ['Wound Suturing', 'Repair of lacerations'],
  ['Wound Dressing', 'Cleaning and dressing of wounds'],
  ['Tooth Extraction', 'Removal of a tooth'],
  ['Scaling and Polishing', 'Dental cleaning'],

  // Admission and bed charges
  ['General Ward Admission', 'In-patient stay in a general ward (per day)'],
  ['Private Ward Admission', 'In-patient stay in a private room (per day)'],
  ['Intensive Care', 'Intensive Care Unit (ICU) stay (per day)'],
  [
    'Neonatal Intensive Care',
    'Special Care Baby Unit (SCBU) or NICU stay (per day)',
  ],
  ['Observation', 'Short-stay observation, under 24 hours'],

  // Nursing
  ['Injection Administration', 'Administration of an injection'],
  [
    'IV Infusion Administration',
    'Setting up and monitoring an intravenous infusion',
  ],
  ['Blood Transfusion', 'Administration of blood or blood products'],

  // Clinics and other services
  ['Physiotherapy Session', 'One physiotherapy session'],
  ['Haemodialysis Session', 'One haemodialysis session'],
  [
    'Antiretroviral Therapy Clinic',
    'HIV care and antiretroviral therapy (ART)',
  ],
  ['HIV Counselling and Testing', 'HIV counselling and testing (HCT)'],
  ['Tuberculosis DOTS Clinic', 'Directly observed treatment for tuberculosis'],
  ['Sickle Cell Clinic', 'Care for patients with sickle cell disease'],
  ['Diabetes Clinic', 'Diabetes care and education'],
  ['Hypertension Clinic', 'Blood pressure monitoring and management'],
  ['Nutrition and Dietetics Counselling', 'Dietary assessment and counselling'],
  [
    'Medical Fitness Certificate',
    'Examination and certificate of medical fitness',
  ],
  ['Pre-employment Medical Examination', 'Medical examination for employment'],
  ['Medical Report', 'Preparation of a medical report'],
  ['Ambulance Service', 'Patient transport by ambulance'],
  ['Mortuary Services', 'Storage and care of the deceased'],
];

export class SeedSystemGeneratedServices1792842821454 implements MigrationInterface {
  name = 'SeedSystemGeneratedServices1792842821454';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [name, description] of SERVICES) {
      await queryRunner.query(
        `INSERT INTO "services" ("name", "description", "isSystemGenerated", "organizationId")
         VALUES ($1, $2, true, NULL)`,
        [name, description],
      );
    }
  }

  /** Fails if a branch still offers one of these services (RESTRICT), which is intended. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "services" WHERE "isSystemGenerated" AND "name" = ANY($1)`,
      [SERVICES.map(([name]) => name)],
    );
  }
}
