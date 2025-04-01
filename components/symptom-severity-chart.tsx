"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { HealthRecord } from "../lib/type"

Chart.register(...registerables)

interface SymptomSeverityChartProps {
  healthRecords: HealthRecord[]
}

export default function SymptomSeverityChart({ healthRecords }: SymptomSeverityChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    // Extract all symptoms from health records
    const allSymptoms: { name: string; severity: number }[] = []
    healthRecords.forEach((record) => {
      if (record.symptoms) {
        record.symptoms.forEach((symptom) => {
          if (symptom.severity) {
            allSymptoms.push({
              name: symptom.name,
              severity: symptom.severity,
            })
          }
        })
      }
    })

    // Group symptoms by name and calculate average severity
    const symptomMap: Record<string, { count: number; totalSeverity: number }> = {}
    allSymptoms.forEach((symptom) => {
      if (!symptomMap[symptom.name]) {
        symptomMap[symptom.name] = {
          count: 0,
          totalSeverity: 0,
        }
      }
      symptomMap[symptom.name].count++
      symptomMap[symptom.name].totalSeverity += symptom.severity
    })

    const labels: string[] = []
    const data: number[] = []
    const backgroundColors: string[] = []

    // Generate colors based on severity
    Object.keys(symptomMap).forEach((name) => {
      const avgSeverity = symptomMap[name].totalSeverity / symptomMap[name].count
      labels.push(name)
      data.push(avgSeverity)

      // Color based on severity (red for high, yellow for medium, green for low)
      let color
      if (avgSeverity >= 7) {
        color = "rgba(239, 68, 68, 0.7)" // Red
      } else if (avgSeverity >= 4) {
        color = "rgba(234, 179, 8, 0.7)" // Yellow
      } else {
        color = "rgba(34, 197, 94, 0.7)" // Green
      }
      backgroundColors.push(color)
    })

    // Create chart
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "Average Symptom Severity",
                data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map((color) => color.replace("0.7", "1")),
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 10,
                title: {
                  display: true,
                  text: "Severity (0-10)",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Symptom",
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context) => `Severity: ${(context.raw as number).toFixed(1)}/10`,
                },
              },
            },
          },
        })
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [healthRecords])

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

