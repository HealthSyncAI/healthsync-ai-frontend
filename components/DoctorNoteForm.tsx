// pages/doctor/appointments.tsx (or wherever your appointments page is)
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import the router hook
import Header from '@/components/Header';

// Keep the Appointment interface as before
interface Appointment {
    id: number;
    patient_id: number;
    doctor_id: number;
    start_time: string;
    end_time: string;
    status: string;
    telemedicine_url?: string;
}

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // Initialize the router

    // useEffect for fetching appointments remains largely the same...
    useEffect(() => {
        // --- IMPORTANT: Retrieve token securely ---
        const storedToken = localStorage.getItem("auth_token");
        // Add check here if storedToken is null/invalid and handle appropriately
        if (!storedToken) {
            setError("Authentication token not found. Please log in.");
            setLoading(false);
            // Optionally redirect to login: router.push('/login');
            return;
        }
        // ---

        const fetchAppointments = async () => {
            setLoading(true);
            setError(null);

            try {
                // Make sure the URL is correct for fetching doctor's appointments
                const response = await fetch('http://localhost:8000/api/appointment/my-appointments', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    let errorBody = 'Failed to fetch appointments';
                    try {
                        const errorData = await response.json();
                        errorBody = errorData.message || errorData.detail || JSON.stringify(errorData);
                    } catch (parseError) {
                        errorBody = `HTTP error ${response.status}: ${response.statusText} - ${parseError}`;
                    }
                    throw new Error(errorBody);
                }

                const data: Appointment[] = await response.json();
                console.log("Fetched appointments:", data);
                setAppointments(data);

            } catch (err: unknown) { // Use 'unknown' instead of 'any'
                console.error("Error fetching appointments:", err);

                // Check if the error is an instance of Error
                if (err instanceof Error) {
                    setError(err.message || 'An unexpected error occurred.');
                } else {
                    setError('An unexpected error occurred.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [router]); // Add router to dependency array if you use it for redirection inside useEffect

    // formatDateTime function remains the same...
    const formatDateTime = (isoString: string) => {
        if (!isoString) return 'N/A';
        try {
            return new Date(isoString).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
            });
        } catch (e) {
            console.error("Error formatting date:", isoString, e);
            return isoString;
        }
    };

    // *** UPDATE THIS FUNCTION ***
    const handleViewHealthRecord = (patientId: number) => {
        console.log(`Navigating to health records for patient ID: ${patientId}`);
        // Navigate to the dynamic route for patient health records
        // Adjust the path according to your file structure
        router.push(`/patients/${patientId}/records`);
    };

    // JSX rendering structure remains the same...
    // Ensure the onClick handler for the button correctly calls handleViewHealthRecord
    return (
        <div className="bg-gray-100 min-h-screen">
            <Header />
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Appointments</h1>

                {/* Loading, Error, No Appointments messages remain the same */}
                {loading && <div className="text-center py-10"><p>Loading appointments...</p></div>}
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert"><strong>Error: </strong>{error}</div>}
                {!loading && !error && appointments.length === 0 && <div className="text-center py-10"><p>No appointments found.</p></div>}

                {!loading && !error && appointments.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="bg-white p-5 rounded-lg shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
                                <div>
                                    {/* Appointment details rendering remains the same */}
                                    <h2 className="text-xl font-semibold mb-3 text-primary">Appointment #{appointment.id}</h2>
                                    <p className="text-gray-700 mb-2"><span className="font-medium">Patient ID:</span> {appointment.patient_id}</p>
                                    <p className="text-gray-700 mb-2"><span className="font-medium">Starts:</span> {formatDateTime(appointment.start_time)}</p>
                                    <p className="text-gray-700 mb-2"><span className="font-medium">Ends:</span> {formatDateTime(appointment.end_time)}</p>
                                    <p className="text-gray-700 mb-2 capitalize"><span className="font-medium">Status:</span> <span className={`ml-2 px-2 py-0.5 rounded text-sm font-medium ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : appointment.status === 'completed' ? 'bg-green-100 text-green-800' : appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{appointment.status}</span></p>
                                    {appointment.telemedicine_url && (
                                        <p className="text-gray-700 mb-4 break-words"><span className="font-medium">Meeting Link:</span> <a href={appointment.telemedicine_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">Join Telemedicine Session</a></p>
                                    )}
                                </div>
                                {/* Ensure onClick calls the updated handler */}
                                <button
                                    onClick={() => handleViewHealthRecord(appointment.patient_id)}
                                    className="mt-4 w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                                >
                                    View Health Record
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}