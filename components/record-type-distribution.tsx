"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { HealthRecord } from "../lib/type"

Chart.register(...registerables)

interface RecordTypeDistributionProps {
  healthRecords: HealthRecord[]
}

export default function RecordTypeDistribution({ healthRecords }: RecordTypeDistributionProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    // Count record types
    const recordTypeCounts: Record<string, number> = {}

    healthRecords.forEach((record) => {
      const type = record.record_type || "unknown"
      recordTypeCounts[type] = (recordTypeCounts[type] || 0) + 1
    })

    const labels = Object.keys(recordTypeCounts).map((type) =>
      type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    )

    const data = Object.values(recordTypeCounts)

    // Colors for different record types
    const backgroundColors = [
      "rgba(59, 130, 246, 0.7)", // Blue
      "rgba(234, 88, 12, 0.7)", // Orange
      "rgba(16, 185, 129, 0.7)", // Green
      "rgba(139, 92, 246, 0.7)", // Purple
      "rgba(249, 115, 22, 0.7)", // Orange-red
    ]

    // Create chart
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels,
            datasets: [
              {
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
            plugins: {
              legend: {
                position: "right",
                labels: {
                  boxWidth: 15,
                  padding: 15,
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || ""
                    const value = context.raw as number
                    const total = (context.dataset.data as number[]).reduce((a, b) => a + (b as number), 0)
                    const percentage = Math.round((value / total) * 100)
                    return `${label}: ${value} (${percentage}%)`
                  },
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

