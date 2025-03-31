"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define the possible roles
type UserRole = 'patient' | 'doctor';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient'); // Default to 'patient'
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const loginData = {
        username: formData.get("username") as string,
        password: formData.get("password") as string,
    }
    console.log("Form data:", loginData);
    console.log("Selected Role:", selectedRole);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { access_token, token_type } = await response.json()
        // Store credentials and role in localStorage
        localStorage.setItem("auth_token", access_token)
        localStorage.setItem("token_type", token_type)
        localStorage.setItem("username", loginData.username)
        localStorage.setItem("userRole", selectedRole); // Store the selected role

        // --- Conditional Redirection ---
        if (selectedRole === 'doctor') {
          console.log(`Logged in as Doctor. Redirecting to /doctor-note...`);
          router.push("/doctor-note"); // Redirect doctors here
        } else {
          console.log(`Logged in as Patient. Redirecting to /dashboard...`);
          router.push("/dashboard"); // Redirect patients here
        }
        // --- End Conditional Redirection ---

      } else {
        const errorData = await response.json()
        // Use optional chaining and provide a default message
        setError(errorData?.detail || "Invalid username or password")
      }

    } catch (error: unknown) {
        console.error("Login error:", error);
      // Provide more specific error messages if possible
      if (error instanceof TypeError && error.message.includes('fetch')) {
           setError("Network error: Could not connect to the server.");
      } else if (error instanceof Error) {
        setError(error.message || "An error occurred during login");
      } else {
        setError("An unexpected error occurred during login");
      }
    }
  }

  // Handler for radio button changes
  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(event.target.value as UserRole);
  };

  return (
    <Card className="max-w-md mx-auto">
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {/* Role Selection using HTML radio buttons */}
          <div className="space-y-2">
            <Label>Login As</Label>
            <div className="flex space-x-4 pt-1">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="role-patient"
                  name="role"
                  value="patient"
                  checked={selectedRole === 'patient'}
                  onChange={handleRoleChange}
                  className="cursor-pointer"
                />
                <Label htmlFor="role-patient" className="font-normal cursor-pointer">
                  Patient
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="role-doctor"
                  name="role"
                  value="doctor"
                  checked={selectedRole === 'doctor'}
                  onChange={handleRoleChange}
                   className="cursor-pointer"
                />
                <Label htmlFor="role-doctor" className="font-normal cursor-pointer">
                   Doctor
                </Label>
              </div>
            </div>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" required />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Login as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
          </Button>
        </CardFooter>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4 mx-6 mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </Card>
  )
}