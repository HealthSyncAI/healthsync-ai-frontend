// types/healthRecord.ts

export interface Symptom {
    name: string;
    severity: number;
    duration: string;
    description: string;
  }
  
  export interface Diagnosis {
    name: string;
    icd10_code: string;
    description: string;
    confidence?: number;
  }
  
  export interface TreatmentPlan {
    description: string;
    duration?: string;
    follow_up?: string;
  }
  
  export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
    notes?: string;
  }
  
  export interface DoctorNote {
    id?: number;
    title: string;
    summary: string;
    patient_id: number;
    doctor_id?: number; // Added doctor_id as it's in the response
    record_type?: string; // Added record_type as it's in the response
    symptoms: Symptom[];
    diagnosis: Diagnosis[];
    treatment_plan: TreatmentPlan[];
    medication: Medication[];
    triage_recommendation?: string | null;
    confidence_score?: number | null;
    created_at?: string;
    updated_at?: string;
  }