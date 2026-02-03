import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { statusLabels } from "@/lib/types"
import type { InvoiceStatus, POStatus } from "@/lib/types"
import type { Id } from "../../../convex/_generated/dataModel"
import { IconChevronDown } from "@tabler/icons-react"
import { toast } from "sonner"

// Invoice statuses for workflow
const invoiceStatuses: InvoiceStatus[] = ["draft", "sent", "paid", "overdue", "cancelled"]

// Purchase Order statuses for workflow
const poStatuses: POStatus[] = ["draft", "sent", "confirmed", "received", "cancelled"]

interface StatusDropdownProps {
  documentType: "invoice" | "purchaseOrder"
  documentId: string
  currentStatus: InvoiceStatus | POStatus
  disabled?: boolean
}

export function StatusDropdown({
  documentType,
  documentId,
  currentStatus,
  disabled = false,
}: StatusDropdownProps) {
  const updateInvoiceStatus = useMutation(api.invoices.updateStatus)
  const updatePOStatus = useMutation(api.purchaseOrders.updateStatus)

  const statuses = documentType === "invoice" ? invoiceStatuses : poStatuses

  const handleStatusChange = async (newStatus: InvoiceStatus | POStatus) => {
    if (newStatus === currentStatus) return

    try {
      if (documentType === "invoice") {
        await updateInvoiceStatus({
          id: documentId as Id<"invoices">,
          status: newStatus as InvoiceStatus,
        })
      } else {
        await updatePOStatus({
          id: documentId as Id<"purchaseOrders">,
          status: newStatus as POStatus,
        })
      }
      toast.success(`Status diubah menjadi ${statusLabels[newStatus]}`)
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Gagal mengubah status")
    }
  }

  if (disabled) {
    return <StatusBadge status={currentStatus} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 cursor-pointer focus:outline-none">
        <StatusBadge status={currentStatus} />
        <IconChevronDown className="h-3 w-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleStatusChange(status)}
            className={currentStatus === status ? "bg-accent" : ""}
          >
            <StatusBadge status={status} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
