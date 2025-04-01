// components/DoctorNoteForm.tsx
"use client";
import React, { useState } from 'react';
import { DoctorNote, Symptom, Diagnosis, TreatmentPlan, Medication } from '@/types/healthRecord';
import Header from '@/components/Header';

interface DoctorNoteFormProps {
  onSubmit: (note: Omit<DoctorNote, 'id' | 'doctor_id' | 'record_type' | 'created_at' | 'updated_at'>) => void;
  initialNote?: Omit<DoctorNote, 'id' | 'doctor_id' | 'record_type' | 'created_at' | 'updated_at'>;
}

export default function DoctorNoteForm({ initialNote, onSubmit }: DoctorNoteFormProps) {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [summary, setSummary] = useState(initialNote?.summary || '');
  const [patientId, setPatientId] = useState(initialNote?.patient_id || 1);
  const [symptoms, setSymptoms] = useState<Symptom[]>(initialNote?.symptoms || [{ name: '', severity: 0, duration: '', description: '' }]);
  const [diagnosis, setDiagnosis] = useState<Diagnosis[]>(initialNote?.diagnosis || [{ name: '', icd10_code: '', description: '' }]);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan[]>(initialNote?.treatment_plan || [{ description: '' }]);
  const [medication, setMedication] = useState<Medication[]>(initialNote?.medication || [{ name: '', dosage: '', frequency: '' }]);

  const handleAddSymptom = () => {
    setSymptoms([...symptoms, { name: '', severity: 0, duration: '', description: '' }]);
  };

  const handleSymptomChange = (index: number, field: keyof Symptom, value: string | number) => {
    const newSymptoms = [...symptoms];
    newSymptoms[index][field] = value as never;
    setSymptoms(newSymptoms);
  };

  const handleRemoveSymptom = (index: number) => {
    const newSymptoms = symptoms.filter((_, i) => i !== index);
    setSymptoms(newSymptoms);
  };

  const handleAddDiagnosis = () => {
    setDiagnosis([...diagnosis, { name: '', icd10_code: '', description: '' }]);
  };

  const handleDiagnosisChange = (index: number, field: keyof Diagnosis, value: string|number) => {
    const newDiagnosis = [...diagnosis];
    newDiagnosis[index][field] = value as never;
    setDiagnosis(newDiagnosis);
  };

  const handleRemoveDiagnosis = (index: number) => {
    const newDiagnosis = diagnosis.filter((_, i) => i !== index);
    setDiagnosis(newDiagnosis);
  };

  const handleAddTreatmentPlan = () => {
    setTreatmentPlan([...treatmentPlan, { description: '' }]);
  };

  const handleTreatmentPlanChange = (index: number, field: keyof TreatmentPlan, value: string) => {
    const newTreatmentPlan = [...treatmentPlan];
    newTreatmentPlan[index][field] = value;
    setTreatmentPlan(newTreatmentPlan);
  };

  const handleRemoveTreatmentPlan = (index: number) => {
    const newTreatmentPlan = treatmentPlan.filter((_, i) => i !== index);
    setTreatmentPlan(newTreatmentPlan);
  };

  const handleAddMedication = () => {
    setMedication([...medication, { name: '', dosage: '', frequency: '' }]);
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const newMedication = [...medication];
    newMedication[index][field] = value;
    setMedication(newMedication);
  };

  const handleRemoveMedication = (index: number) => {
    const newMedication = medication.filter((_, i) => i !== index);
    setMedication(newMedication);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const noteData: Omit<DoctorNote, 'id' | 'doctor_id' | 'record_type' | 'created_at' | 'updated_at'> = {
      title,
      summary,
      patient_id: patientId,
      symptoms,
      diagnosis,
      treatment_plan: treatmentPlan,
      medication,
    };

    onSubmit(noteData);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="container mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md shadow-md grid gap-6 md:grid-cols-2">
          {/* General Information */}
          <div className="col-span-full">
            <h2 className="text-xl font-semibold mb-4">General Information</h2>
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                Title:
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="summary" className="block text-gray-700 text-sm font-bold mb-2">
                Summary:
              </label>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="patientId" className="block text-gray-700 text-sm font-bold mb-2">
                Patient ID:
              </label>
              <input
                type="number"
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(parseInt(e.target.value))}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          {/* Symptoms */}
          <div className="col-span-full md:col-span-1">
            <h3 className="text-lg font-semibold mb-3">Symptoms</h3>
            {symptoms.map((symptom, index) => (
              <div key={index} className="mb-4 p-4 border rounded-md">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor={`symptom-name-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                    <input
                      type="text"
                      id={`symptom-name-${index}`}
                      placeholder="Name"
                      value={symptom.name}
                      onChange={(e) => handleSymptomChange(index, 'name', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label htmlFor={`symptom-severity-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Severity (1-10):</label>
                    <input
                      type="number"
                      id={`symptom-severity-${index}`}
                      placeholder="Severity"
                      value={symptom.severity}
                      onChange={(e) => handleSymptomChange(index, 'severity', parseInt(e.target.value))}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label htmlFor={`symptom-duration-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Duration:</label>
                    <input
                      type="text"
                      id={`symptom-duration-${index}`}
                      placeholder="Duration"
                      value={symptom.duration}
                      onChange={(e) => handleSymptomChange(index, 'duration', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label htmlFor={`symptom-description-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                    <textarea
                      id={`symptom-description-${index}`}
                      placeholder="Description"
                      value={symptom.description}
                      onChange={(e) => handleSymptomChange(index, 'description', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSymptom(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddSymptom}
              className="bg-primary hover:bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
            >
              Add Symptom
            </button>
          </div>

          {/* Diagnosis */}
          <div className="col-span-full md:col-span-1">
            <h3 className="text-lg font-semibold mb-3">Diagnosis</h3>
            {diagnosis.map((diag, index) => (
              <div key={index} className="mb-4 p-4 border rounded-md">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor={`diagnosis-name-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                    <input
                      type="text"
                      id={`diagnosis-name-${index}`}
                      placeholder="Name"
                      value={diag.name}
                      onChange={(e) => handleDiagnosisChange(index, 'name', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label htmlFor={`diagnosis-icd10-${index}`} className="block text-gray-700 text-sm font-bold mb-2">ICD-10 Code:</label>
                    <input
                      type="text"
                      id={`diagnosis-icd10-${index}`}
                      placeholder="ICD-10 Code"
                      value={diag.icd10_code}
                      onChange={(e) => handleDiagnosisChange(index, 'icd10_code', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label htmlFor={`diagnosis-description-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                    <textarea
                      id={`diagnosis-description-${index}`}
                      placeholder="Description"
                      value={diag.description}
                      onChange={(e) => handleDiagnosisChange(index, 'description', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDiagnosis(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddDiagnosis}
              className="bg-primary hover:bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
            >
              Add Diagnosis
            </button>
          </div>

          {/* Treatment Plan */}
          <div className="col-span-full md:col-span-1">
            <h3 className="text-lg font-semibold mb-3">Treatment Plan</h3>
            {treatmentPlan.map((plan, index) => (
              <div key={index} className="mb-4 p-4 border rounded-md">
                <div className="mb-2">
                  <label htmlFor={`treatment-description-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                  <textarea
                    id={`treatment-description-${index}`}
                    placeholder="Description"
                    value={plan.description}
                    onChange={(e) => handleTreatmentPlanChange(index, 'description', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor={`treatment-duration-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Duration (optional):</label>
                    <input
                      type="text"
                      id={`treatment-duration-${index}`}
                      placeholder="Duration"
                      value={plan.duration || ''}
                      onChange={(e) => handleTreatmentPlanChange(index, 'duration', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label htmlFor={`treatment-followup-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Follow-up (optional):</label>
                    <input
                      type="text"
                      id={`treatment-followup-${index}`}
                      placeholder="Follow-up"
                      value={plan.follow_up || ''}
                      onChange={(e) => handleTreatmentPlanChange(index, 'follow_up', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTreatmentPlan(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddTreatmentPlan}
              className="bg-primary hover:bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
            >
              Add Treatment Plan
            </button>
          </div>

          {/* Medication */}
          <div className="col-span-full md:col-span-1">
            <h3 className="text-lg font-semibold mb-3">Medication</h3>
            {medication.map((med, index) => (
              <div key={index} className="mb-4 p-4 border rounded-md">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor={`medication-name-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                    <input
                      type="text"
                      id={`medication-name-${index}`}
                      placeholder="Name"
                      value={med.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label htmlFor={`medication-dosage-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Dosage:</label>
                    <input
                      type="text"
                      id={`medication-dosage-${index}`}
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label htmlFor={`medication-frequency-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Frequency:</label>
                    <input
                      type="text"
                      id={`medication-frequency-${index}`}
                      placeholder="Frequency"
                      value={med.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label htmlFor={`medication-duration-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Duration (optional):</label>
                    <input
                      type="text"
                      id={`medication-duration-${index}`}
                      placeholder="Duration"
                      value={med.duration || ''}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label htmlFor={`medication-notes-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Notes (optional):</label>
                    <input
                      type="text"
                      id={`medication-notes-${index}`}
                      placeholder="Notes"
                      value={med.notes || ''}
                      onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMedication(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddMedication}
              className="bg-primary hover:bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
            >
              Add Medication
            </button>
          </div>

          <div className="col-span-full">
            <button
              type="submit"
              className="bg-primary hover:bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save Doctor Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};