"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Calendar, UserRound } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string | null
  qualifications: string | null
  email: string
  is_available: boolean
  years_experience: number
  bio: string
  rating: number
}

export default function HealthRecords() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [doctors, setDoctors] = useState<Record<number, Doctor>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get patient ID from session
        const patientId = localStorage.getItem("user_id")
        // Get token from localStorage
        const token = localStorage.getItem("auth_token")

        if (!patientId) {
          throw new Error("Patient ID not found in session")
        }

        if (!token) {
          throw new Error("Authentication token not found")
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }

        // Fetch health records
        const recordsResponse = await fetch(`${apiUrl}/api/health-record/patient/${patientId}`, {
          headers,
        })

        if (!recordsResponse.ok) {
          throw new Error(`Failed to fetch health records: ${recordsResponse.status}`)
        }

        const recordsData = await recordsResponse.json()
        setRecords(recordsData)

        // Fetch doctors data
        const doctorsResponse = await fetch(`${apiUrl}/api/appointment/doctors`, {
          headers,
        })

        if (!doctorsResponse.ok) {
          throw new Error(`Failed to fetch doctors: ${doctorsResponse.status}`)
        }

        const doctorsData = await doctorsResponse.json()
        
        // Create a map of doctor IDs to doctor objects for easy lookup
        const doctorsMap = doctorsData.reduce((acc: Record<number, Doctor>, doctor: Doctor) => {
          acc[doctor.id] = doctor
          return acc
        }, {})
        
        setDoctors(doctorsMap)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case "doctor_note":
        return { label: "Doctor Note", color: "bg-blue-100 text-blue-800" }
      case "at_triage":
        return { label: "AI Triage", color: "bg-purple-100 text-purple-800" }
      default:
        return { label: type, color: "bg-gray-100 text-gray-800" }
    }
  }

  const getDoctorName = (doctorId: number) => {
    const doctor = doctors[doctorId]
    return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : `Doctor ID: ${doctorId}`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-6">Health Records</h1>
        {[1, 2].map((i) => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Health Records</h1>

      {records.length === 0 ? (
        <p className="text-muted-foreground">No health records found.</p>
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const recordType = getRecordTypeLabel(record.record_type)

            return (
              <Card key={record.id} className="mb-4">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{record.title}</CardTitle>
                      <CardDescription className="mt-1">{record.summary}</CardDescription>
                    </div>
                    <Badge className={recordType.color}>{recordType.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {record.symptoms && record.symptoms.length > 0 && (
                      <AccordionItem value="symptoms">
                        <AccordionTrigger>Symptoms</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-3">
                            {record.symptoms.map((symptom, index) => (
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
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {record.diagnosis && record.diagnosis.length > 0 && (
                      <AccordionItem value="diagnosis">
                        <AccordionTrigger>Diagnosis</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-3">
                            {record.diagnosis.map((diagnosis, index) => (
                              <li key={index} className="border-l-2 border-primary pl-4 py-1">
                                <div className="font-medium">{diagnosis.name}</div>
                                {diagnosis.icd10_code && <div className="text-sm">ICD-10: {diagnosis.icd10_code}</div>}
                                {diagnosis.description && (
                                  <div className="text-sm text-muted-foreground">{diagnosis.description}</div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {record.treatment_plan && record.treatment_plan.length > 0 && (
                      <AccordionItem value="treatment">
                        <AccordionTrigger>Treatment Plan</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-3">
                            {record.treatment_plan.map((plan, index) => (
                              <li key={index} className="border-l-2 border-primary pl-4 py-1">
                                <div className="font-medium">{plan.description}</div>
                                {plan.duration && <div className="text-sm">Duration: {plan.duration}</div>}
                                {plan.follow_up && (
                                  <div className="text-sm text-muted-foreground">Follow-up: {plan.follow_up}</div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {record.medication && record.medication.length > 0 && (
                      <AccordionItem value="medication">
                        <AccordionTrigger>Medication</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-3">
                            {record.medication.map((med, index) => (
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
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {record.triage_recommendation && (
                      <AccordionItem value="triage">
                        <AccordionTrigger>Triage Recommendation</AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-4 py-1">
                            <div className="font-medium capitalize">
                              {record.triage_recommendation.replace(/_/g, " ")}
                            </div>
                            {record.confidence_score && (
                              <div className="text-sm">Confidence: {(record.confidence_score * 100).toFixed(0)}%</div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(record.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserRound className="h-4 w-4" />
                    <span>{getDoctorName(record.doctor_id)}</span>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}