"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the possible roles
type UserRole = 'patient' | 'doctor';

// --- Define Interfaces for Registration Payloads ---
interface BaseUserData {
    username: string;
    email: string;
    password?: string; // Password included in submission
    first_name: string;
    last_name: string;
}

interface PatientRegistrationData extends BaseUserData {
    // role?: "patient"; // Only add if your API explicitly expects role:"patient"
    date_of_birth: string;
    gender: string;
    height_cm: number;
    weight_kg: number;
    blood_type: string;
    allergies?: string;       // Optional fields
    existing_conditions?: string; // Optional fields
}

interface DoctorRegistrationData extends BaseUserData {
    role: "doctor"; // Role is required for doctors
    specialization: string;
    qualifications: string;
    is_available: boolean;
}
// --- End Interface Definitions ---


// Changed export to named export to potentially align with LoginForm if needed
export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [gender, setGender] = useState<string>('');
  const router = useRouter()

  const contentRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current) {
        const shouldScroll = contentRef.current.scrollHeight > 900;
        setIsScrollable(shouldScroll);
      } else {
        setIsScrollable(false);
      }
    };
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [selectedRole]);


  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
  
    const formData = new FormData(event.currentTarget)
    let data: PatientRegistrationData | DoctorRegistrationData;
  
    const baseData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
    };
  
    if (selectedRole === 'doctor') {
      data = {
        ...baseData,
        role: "doctor",
        specialization: formData.get("specialization") as string,
        qualifications: formData.get("qualifications") as string,
        is_available: formData.get("is_available") === "true",
      };
    } else {
      data = {
        ...baseData,
        date_of_birth: formData.get("date_of_birth") as string,
        gender: gender, // Use the gender state value
        height_cm: parseFloat(formData.get("height_cm") as string || "0"),
        weight_kg: parseFloat(formData.get("weight_kg") as string || "0"),
        blood_type: formData.get("blood_type") as string,
        allergies: formData.get("allergies") as string || undefined,
        existing_conditions: formData.get("existing_conditions") as string || undefined,
      };
    }
  
    console.log("Submitting Form data:", data)
  
    try {
      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
  
      console.log("Response Status:", response.status);
  
      if (response.ok) {
        const responseData = await response.json();
        console.log("Registration successful:", responseData);
  
        const access_token = responseData?.access_token;
        const token_type = responseData?.token_type;
        const user_id = responseData?.user_id; // Extract user_id from response
        const username = data.username;
  
        if (access_token && token_type && username) {
          localStorage.setItem("auth_token", access_token);
          localStorage.setItem("token_type", token_type);
          localStorage.setItem("username", username);
          localStorage.setItem("userRole", selectedRole);
          
          // Store user_id in localStorage
          if (user_id) {
            localStorage.setItem("user_id", user_id.toString());
          } else {
            console.warn("User ID not found in registration response");
          }
        } else {
          console.warn("Token not found in registration response. User may need to log in.");
        }
  
        if (selectedRole === 'doctor') {
          console.log(`Registered as Doctor. Redirecting to /doctor-note...`);
          router.push("/doctor-note");
        } else {
          console.log(`Registered as Patient. Redirecting to /health-record...`);
          router.push("/health-record");
        }
      } else {
        const errorData = await response.json();
        console.error("Registration Error data:", errorData);
        const message = errorData?.detail || errorData?.message || "An error occurred during registration";
        setError(typeof message === 'string' ? message : JSON.stringify(message));
      }
    } catch (error: unknown) {
      console.error("Registration submission error:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError("Network error: Could not connect to the server.");
      } else if (error instanceof Error) {
        setError(error.message || "An error occurred during registration");
      } else {
        setError("An unexpected error occurred during registration");
      }
    }
  }

   const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(event.target.value as UserRole);
    setError(null);
  };

  // --- Return statement remains the same ---
  return (
    <Card className="max-w-md mx-auto">
      <form onSubmit={onSubmit}>
        <CardContent
            className="space-y-4"
            style={{
                maxHeight: isScrollable ? '580px' : 'none',
                overflowY: isScrollable ? 'auto' : 'visible',
                paddingRight: isScrollable ? '1rem' : undefined,
            }}
        >
          <div ref={contentRef} className="space-y-4">
             {/* Role Selection */}
             <div className="space-y-2">
                <Label>Register As</Label>
                <div className="flex space-x-4 pt-1">
                  {/* ... radio buttons ... */}
                   <div className="flex items-center space-x-2">
                    <input
                    type="radio"
                    id="role-patient-register"
                    name="role-select"
                    value="patient"
                    checked={selectedRole === 'patient'}
                    onChange={handleRoleChange}
                    className="cursor-pointer"
                    />
                    <Label htmlFor="role-patient-register" className="font-normal cursor-pointer">
                    Patient
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                    type="radio"
                    id="role-doctor-register"
                    name="role-select"
                    value="doctor"
                    checked={selectedRole === 'doctor'}
                    onChange={handleRoleChange}
                    className="cursor-pointer"
                    />
                    <Label htmlFor="role-doctor-register" className="font-normal cursor-pointer">
                    Doctor
                    </Label>
                </div>
                </div>
            </div>

            {/* Common Fields */}
             {/* ... common fields ... */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" name="first_name" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" name="last_name" required />
            </div>


            {/* Patient Specific Fields */}
            {selectedRole === 'patient' && (
                 <>
                    {/* ... patient fields ... */}
                     <div className="space-y-2">
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input id="date_of_birth" name="date_of_birth" type="date" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select 
                          onValueChange={setGender} 
                          value={gender} 
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="height_cm">Height (cm)</Label>
                        <Input id="height_cm" name="height_cm" type="number" step="0.1" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="weight_kg">Weight (kg)</Label>
                        <Input id="weight_kg" name="weight_kg" type="number" step="0.1" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="blood_type">Blood Type</Label>
                        <Input id="blood_type" name="blood_type" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="allergies">Allergies (optional)</Label>
                        <Input id="allergies" name="allergies" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="existing_conditions">Existing Conditions (optional)</Label>
                        <Input id="existing_conditions" name="existing_conditions" />
                    </div>
                 </>
            )}

            {/* Doctor Specific Fields */}
            {selectedRole === 'doctor' && (
                <>
                    {/* ... doctor fields ... */}
                     <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input id="specialization" name="specialization" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="qualifications">Qualifications</Label>
                        <Input id="qualifications" name="qualifications" required />
                    </div>
                    <div className="space-y-2 pt-2">
                        <Label>Currently Available?</Label>
                         <div className="flex space-x-4 pt-1">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="available-yes"
                                    name="is_available"
                                    value="true"
                                    defaultChecked
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="available-yes" className="font-normal cursor-pointer">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="available-no"
                                    name="is_available"
                                    value="false"
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="available-no" className="font-normal cursor-pointer">No</Label>
                            </div>
                        </div>
                    </div>
                </>
            )}
           </div> {/* End of ref'd inner div */}
        </CardContent>
        <CardFooter>
          {/* Assuming default Button variant handles text color */}
          <Button type="submit" className="w-full text-white">
            Register as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
          </Button>
        </CardFooter>
      </form>
      {error && (
        <div className="px-6 pb-6">
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
      )}
    </Card>
  )
}