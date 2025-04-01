import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Clipboard, FileText, AlertTriangle, Calendar } from "lucide-react"
import type { HealthRecord } from "../lib/type"

interface HealthRecordsListProps {
  healthRecords: HealthRecord[]
}

export default function HealthRecordsList({ healthRecords }: HealthRecordsListProps) {
  return (
    <div className="space-y-4">
      {healthRecords.map((record) => (
        <div key={record.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {record.record_type === "doctor_note" ? (
              <FileText className="h-5 w-5" />
            ) : record.record_type === "at_triage" ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Clipboard className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{record.title}</p>
              <Badge variant={getRecordTypeBadgeVariant(record.record_type)}>
                {formatRecordType(record.record_type)}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">{record.summary}</p>

            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(record.created_at), { addSuffix: true })}</span>

              {record.symptoms && record.symptoms.length > 0 && <span>• {record.symptoms.length} symptom(s)</span>}

              {record.diagnosis && record.diagnosis.length > 0 && <span>• {record.diagnosis.length} diagnosis</span>}
            </div>
          </div>
        </div>
      ))}

      {healthRecords.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">No health records available</div>
      )}
    </div>
  )
}

function formatRecordType(type: string): string {
  switch (type) {
    case "doctor_note":
      return "Doctor Note"
    case "at_triage":
      return "Triage"
    default:
      return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }
}

function getRecordTypeBadgeVariant(type: string): "outline" | "secondary" | "default" {
  switch (type) {
    case "doctor_note":
      return "outline"
    case "at_triage":
      return "secondary"
    default:
      return "default"
  }
}

