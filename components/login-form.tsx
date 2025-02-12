"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    }
    console.log("Form data:", data)

    const access_token = process.env.NEXT_PUBLIC_ADMIN_JWT || ""
    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const { access_token, token_type } = await response.json()
        // Store the token in localStorage or a secure cookie
        localStorage.setItem("auth_token", access_token)
        localStorage.setItem("token_type", token_type)
        router.push("/dashboard") // Redirect to dashboard or home page
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Invalid username or password")
      }
    } catch (error) {
      setError("An error occurred during login")
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
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Login
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

