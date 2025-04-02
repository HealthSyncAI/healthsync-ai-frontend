// components/DoctorNoteForm.tsx
"use client";

import React, { useState } from 'react';
// Adjust the path to your type definitions if necessary
import { DoctorNote, Symptom, Diagnosis, TreatmentPlan, Medication } from '@/types/healthRecord';

// Define the structure for the data submitted by the form
// Exclude fields automatically added by backend (id, doctor_id, record_type, timestamps)
type DoctorNoteFormData = Omit<DoctorNote, 'id' | 'doctor_id' | 'record_type' | 'created_at' | 'updated_at'>;

interface DoctorNoteFormProps {
  patientId: number; // Make patientId required, passed from parent
  onSubmit: (note: DoctorNoteFormData) => Promise<void>; // Expect an async function for submission handling
  initialNote?: Partial<DoctorNoteFormData>; // Allow partial initial data, useful for editing later
  isSubmitting?: boolean; // To disable button during API call
  onCancel?: () => void; // Optional handler for a Cancel button
}

export default function DoctorNoteForm({
    patientId, // Receive patientId directly
    onSubmit,
    initialNote,
    isSubmitting = false, // Default to false
    onCancel
}: DoctorNoteFormProps) {
  // Initialize state from initialNote or defaults
  const [title, setTitle] = useState(initialNote?.title || '');
  const [summary, setSummary] = useState(initialNote?.summary || '');

  // Initialize arrays, ensuring at least one empty item if initialNote doesn't provide them
  const [symptoms, setSymptoms] = useState<Symptom[]>(
    initialNote?.symptoms && initialNote.symptoms.length > 0
      ? initialNote.symptoms
      : [{ name: '', severity: 0, duration: '', description: '' }]
  );
  const [diagnosis, setDiagnosis] = useState<Diagnosis[]>(
    initialNote?.diagnosis && initialNote.diagnosis.length > 0
      ? initialNote.diagnosis
      : [{ name: '', icd10_code: '', description: '' }]
  );
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan[]>(
    initialNote?.treatment_plan && initialNote.treatment_plan.length > 0
      ? initialNote.treatment_plan
      : [{ description: '' }]
  );
  const [medication, setMedication] = useState<Medication[]>(
    initialNote?.medication && initialNote.medication.length > 0
      ? initialNote.medication
      : [{ name: '', dosage: '', frequency: '' }]
  );

  // --- Handler Functions for Dynamic Array Inputs ---

  // Symptoms Handlers
  const handleAddSymptom = () => {
    setSymptoms([...symptoms, { name: '', severity: 0, duration: '', description: '' }]);
  };
  // Symptoms Handlers (Replace the previous handleSymptomChange with this)
  const handleSymptomChange = (index: number, field: keyof Symptom, value: string | number | null) => {
    // Input values are typically strings, even from type="number".
    // Treat empty string ('') as null for optional fields.
    const processedValue = value === '' ? null : value;
    const newSymptoms = [...symptoms];

    // Create a mutable copy of the specific symptom object
    const symptomToUpdate = { ...newSymptoms[index] };

    // Use a switch for type safety and clarity
    switch (field) {
        case 'name':
            // Ensure name is always a string (or handle potential errors if it could be otherwise)
            symptomToUpdate.name = typeof processedValue === 'string' ? processedValue : '';
            break;
        case 'severity':
            // Explicitly handle parsing from string input value to number | null
            if (processedValue === null) {
                symptomToUpdate.severity = null;
            } else {
                // Use parseInt for whole numbers, base 10
                const numValue = parseInt(String(processedValue), 10);
                // Assign null if parsing results in NaN, otherwise assign the number
                symptomToUpdate.severity = isNaN(numValue) ? null : numValue;
            }
            break;
        case 'duration':
            // Assign null if processedValue is null, otherwise expect string
            symptomToUpdate.duration = typeof processedValue === 'string' ? processedValue : '';
            break;
        case 'description':
             // Assign null if processedValue is null, otherwise expect string
            symptomToUpdate.description = typeof processedValue === 'string' ? processedValue : '';
            break;
        default:
            // This should not happen with keyof Symptom, but good practice
            console.warn("Attempted to update unknown symptom field:", field);
            return; // Do nothing if field is unrecognized
    }

    // Update the symptoms array with the modified symptom object
    newSymptoms[index] = symptomToUpdate;
    setSymptoms(newSymptoms);
  };
  const handleRemoveSymptom = (index: number) => {
    // Prevent removing the last item if you always want at least one row showing
    if (symptoms.length > 1) {
        const newSymptoms = symptoms.filter((_, i) => i !== index);
        setSymptoms(newSymptoms);
    } else {
        // Optionally clear the fields of the last item instead of removing it
         setSymptoms([{ name: '', severity: null, duration: '', description: '' }]);
    }
  };

  // Diagnosis Handlers
  const handleAddDiagnosis = () => {
    setDiagnosis([...diagnosis, { name: '', icd10_code: '', description: '' }]);
  };
  const handleDiagnosisChange = (index: number, field: keyof Diagnosis, value: string | number | null) => {
    const newDiagnosis = [...diagnosis];
    newDiagnosis[index] = { ...newDiagnosis[index], [field]: value } as Diagnosis;
    setDiagnosis(newDiagnosis);
  };
  const handleRemoveDiagnosis = (index: number) => {
     if (diagnosis.length > 1) {
        const newDiagnosis = diagnosis.filter((_, i) => i !== index);
        setDiagnosis(newDiagnosis);
     } else {
         setDiagnosis([{ name: '', icd10_code: '', description: '' }]);
     }
  };

  // Treatment Plan Handlers
  const handleAddTreatmentPlan = () => {
    setTreatmentPlan([...treatmentPlan, { description: '', duration: '', follow_up: '' }]); // Include optional fields
  };
  const handleTreatmentPlanChange = (index: number, field: keyof TreatmentPlan, value: string) => {
    const newTreatmentPlan = [...treatmentPlan];
    newTreatmentPlan[index] = { ...newTreatmentPlan[index], [field]: value } as TreatmentPlan;
    setTreatmentPlan(newTreatmentPlan);
  };
  const handleRemoveTreatmentPlan = (index: number) => {
     if (treatmentPlan.length > 1) {
        const newTreatmentPlan = treatmentPlan.filter((_, i) => i !== index);
        setTreatmentPlan(newTreatmentPlan);
     } else {
         setTreatmentPlan([{ description: '', duration: '', follow_up: '' }]);
     }
  };

  // Medication Handlers
  const handleAddMedication = () => {
    setMedication([...medication, { name: '', dosage: '', frequency: '', duration: '', notes: '' }]); // Include optional fields
  };
  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const newMedication = [...medication];
    newMedication[index] = { ...newMedication[index], [field]: value } as Medication;
    setMedication(newMedication);
  };
  const handleRemoveMedication = (index: number) => {
     if (medication.length > 1) {
        const newMedication = medication.filter((_, i) => i !== index);
        setMedication(newMedication);
     } else {
         setMedication([{ name: '', dosage: '', frequency: '', duration: '', notes: '' }]);
     }
  };

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission

    // Filter out entries where the primary field (e.g., name/description) is empty
    const cleanSymptoms = symptoms.filter(s => s.name?.trim());
    const cleanDiagnosis = diagnosis.filter(d => d.name?.trim());
    const cleanTreatmentPlan = treatmentPlan.filter(t => t.description?.trim());
    const cleanMedication = medication.filter(m => m.name?.trim());

    // Construct the final data object for submission
    const noteData: DoctorNoteFormData = {
      title: title.trim(), // Trim whitespace
      summary: summary.trim(),
      patient_id: patientId, // Use the required patientId prop from the parent component
      symptoms: cleanSymptoms,
      diagnosis: cleanDiagnosis,
      treatment_plan: cleanTreatmentPlan,
      medication: cleanMedication,
    };

    // Call the onSubmit function passed from the parent component
    await onSubmit(noteData);
  };

  // --- JSX Rendering ---
  return (
    // The form itself, assuming the parent page provides layout context (like Header, bg color)
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md grid gap-6 md:grid-cols-2 border border-gray-200">

      {/* General Information Section */}
      <div className="col-span-full">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">General Information</h2>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-transparent"
            placeholder="e.g., Follow-up Visit, Initial Consultation"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="summary" className="block text-gray-700 text-sm font-bold mb-2">
            Summary / Chief Complaint
          </label>
          <textarea
            id="summary"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-transparent"
            placeholder="Brief overview of the visit or patient's main concerns"
          />
        </div>
        {/* Patient ID input field is intentionally removed - provided by parent */}
      </div>

      {/* Symptoms Section */}
      <div className="col-span-full md:col-span-1">
        <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-gray-700">Symptoms</h3>
        {symptoms.map((symptom, index) => (
          <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50 relative">
             {symptoms.length > 1 && ( // Show remove button only if more than one item exists
               <button
                 type="button"
                 onClick={() => handleRemoveSymptom(index)}
                 className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-semibold"
                 aria-label="Remove symptom"
               >
                 Remove
               </button>
             )}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label htmlFor={`symptom-name-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Name:</label>
                <input
                  type="text"
                  id={`symptom-name-${index}`}
                  placeholder="e.g., Headache, Cough"
                  value={symptom.name}
                  onChange={(e) => handleSymptomChange(index, 'name', e.target.value)}
                  className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                />
              </div>
              <div>
                 <label htmlFor={`symptom-severity-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Severity (1-10):</label>
                 <input
                   type="number"
                   id={`symptom-severity-${index}`}
                   placeholder="1-10"
                   min="1"
                   max="10"
                   value={symptom.severity ?? ''} // Use empty string for null/undefined
                   onChange={(e) => handleSymptomChange(index, 'severity', e.target.value)}
                   className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                 />
               </div>
              <div>
                <label htmlFor={`symptom-duration-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Duration:</label>
                <input
                  type="text"
                  id={`symptom-duration-${index}`}
                  placeholder="e.g., 3 days, 2 weeks"
                  value={symptom.duration || ''}
                  onChange={(e) => handleSymptomChange(index, 'duration', e.target.value)}
                  className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                />
              </div>
              <div>
                 <label htmlFor={`symptom-description-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Description:</label>
                 <textarea
                   rows={2}
                   id={`symptom-description-${index}`}
                   placeholder="e.g., Sharp pain, Worse at night"
                   value={symptom.description || ''}
                   onChange={(e) => handleSymptomChange(index, 'description', e.target.value)}
                   className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                 />
               </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddSymptom}
          className="mt-2 text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
        >
          + Add Symptom
        </button>
      </div>

      {/* Diagnosis Section */}
      <div className="col-span-full md:col-span-1">
        <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-gray-700">Diagnosis</h3>
        {diagnosis.map((diag, index) => (
          <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50 relative">
            {diagnosis.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDiagnosis(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-semibold"
                  aria-label="Remove diagnosis"
                >
                  Remove
                </button>
            )}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label htmlFor={`diagnosis-name-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Name:</label>
                <input
                  type="text"
                  id={`diagnosis-name-${index}`}
                  placeholder="e.g., Hypertension, Migraine"
                  value={diag.name}
                  onChange={(e) => handleDiagnosisChange(index, 'name', e.target.value)}
                  className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor={`diagnosis-icd10-${index}`} className="block text-gray-600 text-sm font-medium mb-1">ICD-10 Code:</label>
                <input
                  type="text"
                  id={`diagnosis-icd10-${index}`}
                  placeholder="e.g., I10, G43.909"
                  value={diag.icd10_code || ''}
                  onChange={(e) => handleDiagnosisChange(index, 'icd10_code', e.target.value)}
                  className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor={`diagnosis-description-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Description:</label>
                 <textarea
                   rows={2}
                   id={`diagnosis-description-${index}`}
                   placeholder="e.g., Essential hypertension, Migraine without aura"
                   value={diag.description || ''}
                   onChange={(e) => handleDiagnosisChange(index, 'description', e.target.value)}
                   className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                 />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddDiagnosis}
          className="mt-2 text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
        >
          + Add Diagnosis
        </button>
      </div>

      {/* Treatment Plan Section */}
      <div className="col-span-full md:col-span-1">
        <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-gray-700">Treatment Plan</h3>
        {treatmentPlan.map((plan, index) => (
          <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50 relative">
             {treatmentPlan.length > 1 && (
                 <button
                   type="button"
                   onClick={() => handleRemoveTreatmentPlan(index)}
                   className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-semibold"
                   aria-label="Remove treatment plan item"
                 >
                   Remove
                 </button>
             )}
            <div className="grid grid-cols-1 gap-3">
                <div>
                  <label htmlFor={`treatment-description-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Description:</label>
                  <textarea
                    rows={2}
                    id={`treatment-description-${index}`}
                    placeholder="e.g., Prescribe medication, Lifestyle changes"
                    value={plan.description}
                    onChange={(e) => handleTreatmentPlanChange(index, 'description', e.target.value)}
                    className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                  />
                </div>
                <div>
                   <label htmlFor={`treatment-duration-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Duration (optional):</label>
                   <input
                     type="text"
                     id={`treatment-duration-${index}`}
                     placeholder="e.g., 1 month, Ongoing"
                     value={plan.duration || ''}
                     onChange={(e) => handleTreatmentPlanChange(index, 'duration', e.target.value)}
                     className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                   />
                 </div>
                 <div>
                   <label htmlFor={`treatment-followup-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Follow-up (optional):</label>
                   <input
                     type="text"
                     id={`treatment-followup-${index}`}
                     placeholder="e.g., Return in 2 weeks, Check blood pressure"
                     value={plan.follow_up || ''}
                     onChange={(e) => handleTreatmentPlanChange(index, 'follow_up', e.target.value)}
                     className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                   />
                 </div>
             </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddTreatmentPlan}
          className="mt-2 text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
        >
          + Add Treatment Plan
        </button>
      </div>

      {/* Medication Section */}
      <div className="col-span-full md:col-span-1">
        <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-gray-700">Medication</h3>
        {medication.map((med, index) => (
          <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50 relative">
            {medication.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveMedication(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-semibold"
                  aria-label="Remove medication"
                >
                  Remove
                </button>
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-x-4">
              <div className="md:col-span-2">
                <label htmlFor={`medication-name-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Name:</label>
                <input
                  type="text"
                  id={`medication-name-${index}`}
                  placeholder="e.g., Lisinopril, Ibuprofen"
                  value={med.name}
                  onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                  className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor={`medication-dosage-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Dosage:</label>
                <input
                  type="text"
                  id={`medication-dosage-${index}`}
                  placeholder="e.g., 10mg, 200mg"
                  value={med.dosage}
                  onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                  className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor={`medication-frequency-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Frequency:</label>
                <input
                  type="text"
                  id={`medication-frequency-${index}`}
                  placeholder="e.g., Once daily, As needed"
                  value={med.frequency}
                  onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                  className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                />
              </div>
              <div>
                 <label htmlFor={`medication-duration-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Duration (optional):</label>
                 <input
                   type="text"
                   id={`medication-duration-${index}`}
                   placeholder="e.g., 14 days, Until finished"
                   value={med.duration || ''}
                   onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                   className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                 />
               </div>
               <div>
                 <label htmlFor={`medication-notes-${index}`} className="block text-gray-600 text-sm font-medium mb-1">Notes (optional):</label>
                 <input
                   type="text"
                   id={`medication-notes-${index}`}
                   placeholder="e.g., Take with food"
                   value={med.notes || ''}
                   onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                   className="shadow-sm appearance-none border rounded w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-primary-focus focus:border-transparent"
                 />
               </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddMedication}
          className="mt-2 text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
        >
          + Add Medication
        </button>
      </div>

      {/* Submission Buttons */}
      <div className="col-span-full mt-4 pt-4 border-t flex justify-start gap-4">
        <button
          type="submit"
          disabled={isSubmitting} // Disable button when submitting
          className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition-opacity duration-200 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Doctor Note'}
        </button>
        {/* Conditionally render Cancel button if handler is provided */}
        {onCancel && (
             <button
               type="button"
               onClick={onCancel}
               disabled={isSubmitting} // Also disable cancel during submission? Maybe not.
               className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
             >
               Cancel
             </button>
        )}
      </div>
    </form>
  );
}