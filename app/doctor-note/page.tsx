// app/doctor-note/page.tsx
"use client";

import React from 'react';
import DoctorNoteForm from '@/components/DoctorNoteForm';
import { DoctorNote } from '@/types/healthRecord';

const DoctorNotePage = () => {
  const handleSubmit = async (note: Omit<DoctorNote, 'id' | 'doctor_id' | 'record_type' | 'created_at' | 'updated_at'>) => {
    const token = localStorage.getItem('auth_token') || '';

    try {
      const response = await fetch('http://localhost:8000/api/health-record/doctor-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(note),
      });

      if (response.ok) {
        alert('Doctor note saved successfully!');
        // Optionally, you can redirect the user or clear the form here
      } else {
        const errorData = await response.json();
        console.error('Error saving doctor note:', errorData);
        alert(`Error saving doctor note: ${errorData.message || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Could not connect to the server. Please try again later.');
    }
  };

  return (
    <div>
      <DoctorNoteForm onSubmit={handleSubmit} />
    </div>
  );
};

export default DoctorNotePage;