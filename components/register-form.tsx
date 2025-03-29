"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function RegisterForm() {
  const [error, setError] = useState(null)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      date_of_birth: formData.get("date_of_birth"),
      gender: formData.get("gender"),
      height_cm: parseFloat(formData.get("height_cm") as string),
      weight_kg: parseFloat(formData.get("weight_kg") as string),
      blood_type: formData.get("blood_type"),
      allergies: formData.get("allergies"),
      existing_conditions: formData.get("existing_conditions"),
    }

    console.log("Form data:", data)

    const access_token = process.env.NEXT_PUBLIC_ADMIN_JWT || ""

    const response = await fetch("http://localhost:8000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`
      },
      body: JSON.stringify(data),
    })

    console.log("Response:", response)

    if (response.ok) {
      // Redirect to the dashboard instead of the login page
      router.push("/dashboard")
    } else {
      const errorData = await response.json()
      console.error("Error data:", errorData)
      setError(errorData.message || "An error occurred during registration")
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
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
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input id="date_of_birth" name="date_of_birth" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input id="gender" name="gender" required />
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
            <Label htmlFor="allergies">Allergies</Label>
            <Input id="allergies" name="allergies" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="existing_conditions">Existing Conditions</Label>
            <Input id="existing_conditions" name="existing_conditions" />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Register
          </Button>
        </CardFooter>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </Card>
  )
}

function App() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Registration Form</h1>
      <RegisterForm />
    </div>
  )
}

export default App