import { Badge } from "@/components/ui/badge"
import { statusColors, statusLabels } from "@/lib/types"
import type { InvoiceStatus, POStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: InvoiceStatus | POStatus
  className?: string
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <Badge className={`${statusColors[status]} ${className}`}>
      {statusLabels[status]}
    </Badge>
  )
}
