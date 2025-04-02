// app/patients/[patientId]/records/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // Import useParams to get ID from URL, useRouter for navigation
import Header from "@/components/Header"; // Assuming Header component exists

// Define interfaces based on the health record API response structure
interface Symptom {
  name: string;
  severity: number | null;
  duration: string | null;
  description: string | null;
}

interface Diagnosis {
  name: string;
  icd10_code: string | null;
  description: string | null;
  confidence?: number | null;
}

interface TreatmentPlan {
  description: string;
  duration?: string | null;
  follow_up?: string | null;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string | null;
  notes?: string | null;
}

interface HealthRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  title: string;
  summary: string;
  record_type: "doctor_note" | "at_triage" | string; // Add other known types
  symptoms: Symptom[] | null;
  diagnosis: Diagnosis[] | null;
  treatment_plan: TreatmentPlan[] | null;
  medication: Medication[] | null;
  triage_recommendation: string | null;
  confidence_score: number | null;
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

export default function PatientHealthRecordPage() {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState<{ id: string | null }>({
    id: null,
  }); // To store patient info, starting with ID

  const params = useParams(); // Get route parameters
  const router = useRouter(); // Get router instance for back navigation etc.
  const patientId = params.patientId as string; // Extract patientId from URL

  useEffect(() => {
    if (patientId) {
      setPatientInfo({ id: patientId }); // Store patientId for display
      // --- IMPORTANT: Retrieve token securely ---
      const storedToken = localStorage.getItem("auth_token");
      if (!storedToken) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        // Optionally redirect to login: router.push('/login');
        return;
      }
      // ---

      const fetchHealthRecords = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(
            `${apiUrl}/api/health-record/patient/${patientId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${storedToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            let errorBody = `Failed to fetch health records for patient ${patientId}`;
            try {
              const errorData = await response.json();
              errorBody =
                errorData.message ||
                errorData.detail ||
                JSON.stringify(errorData);
            } catch (parseError) {
              errorBody = `HTTP error ${response.status}: ${response.statusText} - ${parseError}`;
            }
            throw new Error(errorBody);
          }

          const data: HealthRecord[] = await response.json();
          // Sort records by creation date, newest first (optional but recommended)
          data.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          setHealthRecords(data);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error("Error fetching health records:", err);
            setError(err.message || "An unexpected error occurred.");
          } else {
            console.error("Unknown error:", err);
            setError("An unexpected error occurred.");
          }
          console.error("Error fetching health records:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchHealthRecords();
    } else {
      setError("Patient ID not found in URL.");
      setLoading(false);
    }
  }, [patientId, router]); // Re-run effect if patientId changes

  // Helper function to format date/time nicely (can be moved to a utils file)
  const formatDateTime = (isoString: string) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleString(undefined, {
        dateStyle: "long", // More detail for records
        timeStyle: "short",
      });
    } catch (e) {
      console.error("Error formatting date:", isoString, e);
      return isoString;
    }
  };

  // Helper component to render details for different sections (optional but good practice)
  const RenderSection = ({
    title,
    items,
    renderItem,
  }: {
    title: string;
    items: (Symptom | Diagnosis | TreatmentPlan | Medication)[] | null;
    renderItem: (item: Symptom | Diagnosis | TreatmentPlan | Medication, index: number) => React.ReactNode;
  }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-700 mb-2">{title}</h4>
        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-600">
          {items.map((item, index) => (
            <li key={index}>{renderItem(item, index)}</li>
          ))}
        </ul>
      </div>
    );
  };

  const handleAddNewNote = () => {
    if (patientId) {
      router.push(`/patients/${patientId}/records/new-note`);
    } else {
      // Handle case where patientId might be missing (though unlikely if page loaded)
      setError("Cannot create note: Patient ID is missing.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            &larr; Back
          </button>
          {/* *** ADD THIS BUTTON *** */}
          <button
            onClick={handleAddNewNote}
            disabled={!patientId || loading} // Disable if no ID or still loading records
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            + Create New Doctor Note
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Health Records for Patient #{patientInfo.id || "..."}
        </h1>

        {loading && (
          <div className="text-center py-10">
            <p>Loading health records...</p>
          </div>
        )}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            role="alert"
          >
            <strong>Error: </strong>
            {error}
          </div>
        )}
        {!loading && !error && healthRecords.length === 0 && (
          <div className="text-center py-10">
            <p>No health records found for this patient.</p>
          </div>
        )}

        {!loading && !error && healthRecords.length > 0 && (
          <div className="space-y-6">
            {healthRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white p-5 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-xl font-semibold text-primary">
                      {record.title || "Record"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Type:{" "}
                      <span className="font-medium capitalize">
                        {record.record_type.replace("_", " ")}
                      </span>
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 text-right">
                    Created: {formatDateTime(record.created_at)} <br />
                    {record.created_at !== record.updated_at &&
                      `Updated: ${formatDateTime(record.updated_at)}`}
                  </p>
                </div>

                {record.summary && (
                  <p className="text-gray-700 mb-4">{record.summary}</p>
                )}

                {record.triage_recommendation && (
                  <p className="mb-3 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                    <strong>Triage Recommendation:</strong>{" "}
                    {record.triage_recommendation}
                    {record.confidence_score &&
                      ` (Confidence: ${(record.confidence_score * 100).toFixed(
                        0
                      )}%)`}
                  </p>
                )}

                <RenderSection
                  title="Symptoms"
                  items={record.symptoms}
                  renderItem={(item) => {
                    if ("name" in item && "severity" in item) {
                      const symptom = item as Symptom;
                      return (
                        <span>
                          <strong>{symptom.name}:</strong>{" "}
                          {symptom.description || "N/A"}
                          {symptom.severity &&
                            ` (Severity: ${symptom.severity}/10)`}
                          {symptom.duration && `, Duration: ${symptom.duration}`}
                        </span>
                      );
                    }
                    return null; // Handle other cases if necessary
                  }}
                />

                <RenderSection
                  title="Diagnosis"
                  items={record.diagnosis}
                  renderItem={(item) => {
                    if ("icd10_code" in item) {
                      const diag = item as Diagnosis;
                      return (
                        <span>
                          <strong>{diag.name}</strong>{" "}
                          {diag.icd10_code && `(${diag.icd10_code})`} -{" "}
                          {diag.description || "N/A"}
                          {diag.confidence && ` (Confidence: ${diag.confidence})`}
                        </span>
                      );
                    }
                    return null; // Handle other cases if necessary
                  }}
                />

                <RenderSection
                  title="Treatment Plan"
                  items={record.treatment_plan}
                  renderItem={(item) => {
                    if ("description" in item && !("name" in item)) {
                      const plan = item as TreatmentPlan;
                      return (
                        <span>
                          {plan.description}
                          {plan.duration && ` (Duration: ${plan.duration})`}
                          {plan.follow_up && `, Follow-up: ${plan.follow_up}`}
                        </span>
                      );
                    }
                    return null;
                  }}
                />

                <RenderSection
                  title="Medication"
                  items={record.medication}
                  renderItem={(item) => {
                    if ("name" in item && "dosage" in item && "frequency" in item) {
                      const med = item as Medication;
                      return (
                        <span>
                          <strong>{med.name}</strong> {med.dosage}, {med.frequency}
                          {med.duration && ` (Duration: ${med.duration})`}
                          {med.notes && ` - Notes: ${med.notes}`}
                        </span>
                      );
                    }
                    return null;
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
