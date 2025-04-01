"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCog, Calendar, MessageSquare, FileText, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "@/components/ui/chart"

// Define the statistics interface
interface Statistics {
  total_users: number
  total_doctors: number
  total_patients: number
  total_appointments: number
  total_chat_sessions: number
  total_health_records: number
  total_triage_records: number
  total_doctor_notes: number
}

export default function PatientDashboard() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true)
        // In a production environment, you would use an environment variable for the API URL
        const response = await fetch("http://localhost:8000/api/statistics/")

        if (!response.ok) {
          throw new Error(`Error fetching statistics: ${response.status}`)
        }

        const data = await response.json()
        setStatistics(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch statistics:", err)
        setError("Failed to load your health data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  // Colors for the charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  // Prepare data for the pie chart
  const communicationData = statistics
    ? [
        { name: "Chat Sessions", value: statistics.total_chat_sessions },
        { name: "Appointments", value: statistics.total_appointments },
      ]
    : []

  // Prepare data for the records pie chart
  const recordsData = statistics
    ? [
        { name: "Health Records", value: statistics.total_health_records },
        { name: "Triage Records", value: statistics.total_triage_records },
        { name: "Doctor Notes", value: statistics.total_doctor_notes },
      ]
    : []

  // Prepare data for the bar chart
  const allRecordsData = statistics
    ? [
        { name: "Chat Sessions", value: statistics.total_chat_sessions },
        { name: "Appointments", value: statistics.total_appointments },
        { name: "Health Records", value: statistics.total_health_records },
        { name: "Triage Records", value: statistics.total_triage_records },
        { name: "Doctor Notes", value: statistics.total_doctor_notes },
      ]
    : []

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading your health dashboard...</span>
      </div>
    )
  }

  if (!statistics) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Could not load health data. Please try again later.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-[#F5F5F5] h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Health Dashboard</h1>
        <p className="text-muted-foreground">View health information at a glance</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">Health Records</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Health Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doctors</CardTitle>
                <UserCog className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.total_doctors}</div>
                <p className="text-xs text-muted-foreground">Available healthcare providers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.total_appointments}</div>
                <p className="text-xs text-muted-foreground">Scheduled medical visits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.total_chat_sessions}</div>
                <p className="text-xs text-muted-foreground">Conversations with doctors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Records</CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.total_health_records}</div>
                <p className="text-xs text-muted-foreground">Your medical documents</p>
              </CardContent>
            </Card>
          </div>

          {/* Communication Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Your Communications</CardTitle>
              <CardDescription>Chat sessions and appointments</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={communicationData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
                  >
                    {communicationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, ""]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Records Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Your Health Records</CardTitle>
                <CardDescription>Distribution of your medical records</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={recordsData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
                    >
                      {recordsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}`, ""]} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* All Records Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>All Records</CardTitle>
                <CardDescription>Overview of all your health data</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={allRecordsData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, ""]} labelFormatter={(label) => `${label}`} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="value" fill="#8884d8" minPointSize={3}>
                      {allRecordsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Health Data Summary</CardTitle>
                <CardDescription>Overview of your medical information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium">Communication</h3>
                      <ul className="mt-2 space-y-2">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Chat Sessions:</span>
                          <span className="font-medium">{statistics.total_chat_sessions}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Appointments:</span>
                          <span className="font-medium">{statistics.total_appointments}</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Medical Records</h3>
                      <ul className="mt-2 space-y-2">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Health Records:</span>
                          <span className="font-medium">{statistics.total_health_records}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Triage Records:</span>
                          <span className="font-medium">{statistics.total_triage_records}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Doctor Notes:</span>
                          <span className="font-medium">{statistics.total_doctor_notes}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium">Healthcare Network</h3>
                    <ul className="mt-2 space-y-2">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Available Doctors:</span>
                        <span className="font-medium">{statistics.total_doctors}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Total Patients:</span>
                        <span className="font-medium">{statistics.total_patients}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

