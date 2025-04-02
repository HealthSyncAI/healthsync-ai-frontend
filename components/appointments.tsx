"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Calendar, Clock, ExternalLink, Video } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format, parseISO } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  start_time: string
  end_time: string
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  telemedicine_url: string | null
  health_record_id?: number
}

interface Symptom {
  name: string
  severity: number | null
  duration: string | null
  description: string | null
}

interface Diagnosis {
  name: string
  icd10_code: string | null
  description: string | null
  confidence: number | null
}

interface TreatmentPlan {
  description: string
  duration: string | null
  follow_up: string | null
}

interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  notes: string | null
}

interface HealthRecord {
  id: number
  title: string
  summary: string
  patient_id: number
  doctor_id: number
  record_type: string
  symptoms: Symptom[] | null
  diagnosis: Diagnosis[] | null
  treatment_plan: TreatmentPlan[] | null
  medication: Medication[] | null
  triage_recommendation: string | null
  confidence_score: number | null
  created_at: string
  updated_at: string
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [healthRecord, setHealthRecord] = useState<HealthRecord | null>(null)
  const [recordLoading, setRecordLoading] = useState(false)
  const [recordError, setRecordError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Get auth token and user ID from localStorage
        const token = localStorage.getItem("auth_token")
        const patientId = localStorage.getItem("user_id")

        if (!token) {
          throw new Error("Authentication token not found")
        }

        if (!patientId) {
          throw new Error("User ID not found")
        }

        const response = await fetch("http://localhost:8000/api/appointment/my-appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch appointments: ${response.status}`)
        }

        const data = await response.json()
        setAppointments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, "EEEE, MMMM d, yyyy")
    } catch {
      return dateString
    }
  }

  const isUpcoming = (appointment: Appointment) => {
    return appointment.status === "scheduled" && new Date(appointment.start_time) > new Date()
  }


  const fetchHealthRecord = async (appointmentId: number) => {
    setRecordLoading(true)
    setRecordError(null)

    try {
      const token = localStorage.getItem("auth_token")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      // First try to fetch using the appointment ID as the health record ID
      // This assumes there's a 1:1 relationship between appointments and health records
      const response = await fetch(`http://localhost:8000/api/health-record/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        // If the direct fetch fails, we might need to get all health records and find the matching one
        if (response.status === 404) {
          // Fetch all health records for the patient
          const patientId = localStorage.getItem("user_id")
          const allRecordsResponse = await fetch(`http://localhost:8000/api/health-record/patient/${patientId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!allRecordsResponse.ok) {
            throw new Error(`Failed to fetch health records: ${allRecordsResponse.status}`)
          }

          const allRecords = await allRecordsResponse.json()
          const selectedAppointmentData = appointments.find((app) => app.id === appointmentId)

          if (!selectedAppointmentData) {
            throw new Error("Appointment not found")
          }

          // Find a record that matches the appointment's doctor_id and has a close date
          const matchingRecord = allRecords.find((record: HealthRecord) => {
            const appointmentDate = new Date(selectedAppointmentData.start_time)
            const recordDate = new Date(record.created_at)
            const timeDiff = Math.abs(appointmentDate.getTime() - recordDate.getTime())
            const daysDiff = timeDiff / (1000 * 3600 * 24)

            return record.doctor_id === selectedAppointmentData.doctor_id && daysDiff < 1
          })

          if (matchingRecord) {
            setHealthRecord(matchingRecord)
          } else {
            throw new Error("No health record found for this appointment")
          }
        } else {
          throw new Error(`Failed to fetch health record: ${response.status}`)
        }
      } else {
        const data = await response.json()
        setHealthRecord(data)
      }
    } catch (err) {
      setRecordError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setRecordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-1/4" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Group appointments by upcoming and past
  const upcomingAppointments = appointments.filter(isUpcoming)
  const pastAppointments = appointments.filter((app) => !isUpcoming(app))

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>

      {appointments.length === 0 ? (
        <p className="text-muted-foreground">No appointments found.</p>
      ) : (
        <div className="space-y-8">
          {upcomingAppointments.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onClick={() => {
                      setSelectedAppointment(appointment)
                      fetchHealthRecord(appointment.id)
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {pastAppointments.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onClick={() => {
                      setSelectedAppointment(appointment)
                      fetchHealthRecord(appointment.id)
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <Dialog open={selectedAppointment !== null} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {recordLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading health record...</p>
            </div>
          ) : recordError ? (
            <div className="py-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{recordError}</AlertDescription>
              </Alert>
            </div>
          ) : healthRecord ? (
            <>
              <DialogHeader>
                <DialogTitle>{healthRecord.title}</DialogTitle>
                <DialogDescription>{healthRecord.summary}</DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                {healthRecord.symptoms && healthRecord.symptoms.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Symptoms</h3>
                    <ul className="space-y-3">
                      {healthRecord.symptoms.map((symptom, index) => (
                        <li key={index} className="border-l-2 border-primary pl-4 py-1">
                          <div className="font-medium">{symptom.name}</div>
                          {symptom.severity && <div className="text-sm">Severity: {symptom.severity}/10</div>}
                          {symptom.duration && <div className="text-sm">Duration: {symptom.duration}</div>}
                          {symptom.description && (
                            <div className="text-sm text-muted-foreground">{symptom.description}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {healthRecord.diagnosis && healthRecord.diagnosis.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Diagnosis</h3>
                    <ul className="space-y-3">
                      {healthRecord.diagnosis.map((diagnosis, index) => (
                        <li key={index} className="border-l-2 border-primary pl-4 py-1">
                          <div className="font-medium">{diagnosis.name}</div>
                          {diagnosis.icd10_code && <div className="text-sm">ICD-10: {diagnosis.icd10_code}</div>}
                          {diagnosis.description && (
                            <div className="text-sm text-muted-foreground">{diagnosis.description}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {healthRecord.treatment_plan && healthRecord.treatment_plan.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Treatment Plan</h3>
                    <ul className="space-y-3">
                      {healthRecord.treatment_plan.map((plan, index) => (
                        <li key={index} className="border-l-2 border-primary pl-4 py-1">
                          <div className="font-medium">{plan.description}</div>
                          {plan.duration && <div className="text-sm">Duration: {plan.duration}</div>}
                          {plan.follow_up && (
                            <div className="text-sm text-muted-foreground">Follow-up: {plan.follow_up}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {healthRecord.medication && healthRecord.medication.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Medication</h3>
                    <ul className="space-y-3">
                      {healthRecord.medication.map((med, index) => (
                        <li key={index} className="border-l-2 border-primary pl-4 py-1">
                          <div className="font-medium">
                            {med.name} - {med.dosage}
                          </div>
                          <div className="text-sm">Frequency: {med.frequency}</div>
                          <div className="text-sm">Duration: {med.duration}</div>
                          {med.notes && <div className="text-sm text-muted-foreground">Notes: {med.notes}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-between text-sm text-muted-foreground pt-4 border-t">
                  <div>Record ID: {healthRecord.id}</div>
                  <div>Created: {formatDate(healthRecord.created_at)}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-6 text-center">
              <p>No health record found for this appointment.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface AppointmentCardProps {
  appointment: Appointment
  onClick: () => void
}

function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, "EEEE, MMMM d, yyyy")
    } catch {
      return dateString
    }
  }

  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, "h:mm a")
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      case "no_show":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">No Show</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const isUpcoming = (appointment: Appointment) => {
    return appointment.status === "scheduled" && new Date(appointment.start_time) > new Date()
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Appointment with Doctor #{appointment.doctor_id}</CardTitle>
            <CardDescription>Appointment ID: {appointment.id}</CardDescription>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(appointment.start_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
            </span>
          </div>
          {appointment.telemedicine_url && (
            <div className="flex items-center gap-2 text-primary">
              <Video className="h-4 w-4" />
              <span>Telemedicine appointment</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {appointment.telemedicine_url && isUpcoming(appointment) ? (
          <Button
            variant="outline"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation() // Prevent the card click event
              if (appointment.telemedicine_url) {
                window.open(appointment.telemedicine_url, "_blank")
              }
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Join Meeting
          </Button>
        ) : (
          <div></div>
        )}

      </CardFooter>
    </Card>
  )
}

