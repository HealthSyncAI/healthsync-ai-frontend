// app/patients/[patientId]/records/new-note/page.tsx
"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import DoctorNoteForm from '@/components/HealthRecord'; // Import the form
import { DoctorNote } from '@/types/healthRecord'; // Import type (adjust path if needed)

// Define the data type expected by the form's onSubmit
type DoctorNoteFormData = Omit<DoctorNote, 'id' | 'doctor_id' | 'record_type' | 'created_at' | 'updated_at'>;

export default function NewDoctorNotePage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const router = useRouter();
    const params = useParams();
    const patientId = params.patientId as string; // Get patientId from URL

    // Convert patientId string to number for the form prop, handle potential errors
    const patientIdNumber = parseInt(patientId, 10);

    const handleFormSubmit = async (noteData: DoctorNoteFormData) => {
        setIsSubmitting(true);
        setSubmitError(null);
        console.log("Submitting Doctor Note:", noteData); // Log data being sent

        // --- IMPORTANT: Retrieve token securely ---
        const storedToken = localStorage.getItem("auth_token");
        if (!storedToken) {
            setSubmitError("Authentication token not found. Please log in.");
            setIsSubmitting(false);
            // Optionally redirect: router.push('/login');
            return;
        }
        // ---

        try {
            const response = await fetch('http://localhost:8000/api/health-record/doctor-note', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(noteData), // Send the form data
            });

            if (!response.ok) {
                let errorBody = 'Failed to save doctor note.';
                try {
                    const errorData = await response.json();
                     // Customize based on your API's error response structure
                    errorBody = errorData.detail || errorData.message || JSON.stringify(errorData);
                } catch (parseError) {
                     errorBody = `HTTP error ${response.status}: ${response.statusText} - ${parseError}`;
                }
                throw new Error(errorBody);
            }

            // Handle success
            const responseData = await response.json(); // Optional: use response data if needed
            console.log("Doctor note saved successfully:", responseData);
            alert("Doctor Note Saved Successfully!"); // Or use a more sophisticated notification

            // Navigate back to the patient's records page
            router.push(`/patients/${patientId}/records`);

        } catch (err: unknown) {
            console.error("Error saving doctor note:", err);
            if (err instanceof Error) {
                setSubmitError(err.message || 'An unexpected error occurred.');
            } else {
                setSubmitError('An unexpected error occurred.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back(); // Go back to the previous page
    };

    // Handle case where patientId is not a valid number
    if (isNaN(patientIdNumber)) {
        return (
             <div className="bg-gray-100 min-h-screen">
                 <Header />
                 <div className="container mx-auto p-6">
                     <p className="text-red-500">Invalid Patient ID in URL.</p>
                     <button onClick={() => router.back()}>Go Back</button>
                 </div>
             </div>
        );
    }


    return (
        <div className="bg-gray-100 min-h-screen">
            <Header />
            <div className="container mx-auto p-6">
                <button
                    onClick={handleCancel}
                    className="mb-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    &larr; Cancel and Go Back
                </button>

                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    Create New Doctor Note for Patient #{patientId}
                </h1>

                {submitError && (
                     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                         <strong className="font-bold">Error Saving: </strong>
                         <span className="block sm:inline">{submitError}</span>
                     </div>
                 )}

                {/* Render the form, passing patientId and the submission handler */}
                <DoctorNoteForm
                    patientId={patientIdNumber}
                    onSubmit={handleFormSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={handleCancel} // Pass cancel handler
                />
            </div>
        </div>
    );
}