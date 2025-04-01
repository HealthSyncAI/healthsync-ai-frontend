// Client-side API functions that include JWT authentication
import type { Doctor, HealthRecord } from "./type"

// Helper function to get the JWT token from localStorage
function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("jwt_token")
  }
  return null
}

// Fetch doctors with authentication
export async function fetchDoctors(): Promise<Doctor[]> {
  const token = getAuthToken()

  if (!token) {
    throw new Error("Authentication token not found")
  }

  try {
    const response = await fetch("http://localhost:8000/api/appointment/doctors", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please log in again")
      }
      throw new Error("Failed to fetch doctors")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching doctors:", error)
    throw error
  }
}

// Fetch health records with authentication
export async function fetchHealthRecords(): Promise<HealthRecord[]> {
  const token = getAuthToken()

  if (!token) {
    throw new Error("Authentication token not found")
  }

  try {
    const response = await fetch("http://localhost:8000/api/health-record", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please log in again")
      }
      throw new Error("Failed to fetch health records")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching health records:", error)
    throw error
  }
}

// Fetch a specific health record by ID with authentication
export async function fetchHealthRecordById(id: number): Promise<HealthRecord | null> {
  const token = getAuthToken()

  if (!token) {
    throw new Error("Authentication token not found")
  }

  try {
    const response = await fetch(`http://localhost:8000/api/health-record/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please log in again")
      }
      throw new Error(`Failed to fetch health record with ID ${id}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching health record with ID ${id}:`, error)
    throw error
  }
}

