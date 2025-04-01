// Doctor types
export interface Doctor {
    id: number
    first_name: string
    last_name: string
    specialization: string | null
    qualifications: string | null
    email: string
    is_available: boolean
    years_experience: number
    bio: string | null
    rating: number | null
  }
  
  // Health record types
  export interface Symptom {
    name: string
    severity: number | null
    duration: string | null
    description: string | null
  }
  
  export interface Diagnosis {
    name: string
    icd10_code: string | null
    description: string | null
    confidence: number | null
  }
  
  export interface TreatmentPlan {
    description: string
    duration: string | null
    follow_up: string | null
  }
  
  export interface Medication {
    name: string
    dosage: string
    frequency: string
    duration: string
    notes: string | null
  }
  
  export interface HealthRecord {
    id: number
    title: string
    summary: string
    patient_id: number
    doctor_id: number
    record_type: string
    symptoms: Symptom[] | null
    diagnosis: Diagnosis[] | null
    treatment_plan: TreatmentPlan[] | null
    medication: Medication[] | null
    triage_recommendation: string | null
    confidence_score: number | null
    created_at: string
    updated_at: string
  }