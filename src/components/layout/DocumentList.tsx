import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { statusColors, statusLabels } from "@/lib/types"
import { IconEye, IconTrash, IconEdit } from "@tabler/icons-react"

interface DocumentListProps<T> {
  documents: T[]
  type: "invoice" | "purchaseOrder" | "receipt"
  onView?: (doc: T) => void
  onEdit?: (doc: T) => void
  onDelete?: (id: string) => void
  emptyMessage?: string
}

export function DocumentList<
  T extends {
    _id: string
    date: string
    total?: number
    amount?: number
    status?: string
    invoiceNumber?: string
    poNumber?: string
    receiptNumber?: string
    customer?: { name: string }
    vendor?: { name: string }
    receivedFrom?: string
  }
>({
  documents,
  type,
  onView,
  onEdit,
  onDelete,
  emptyMessage = "Belum ada dokumen",
}: DocumentListProps<T>) {
  if (documents.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    )
  }

  const getDocNumber = (doc: T) => {
    if (type === "invoice") return doc.invoiceNumber
    if (type === "purchaseOrder") return doc.poNumber
    return doc.receiptNumber
  }

  const getRecipient = (doc: T) => {
    if (type === "invoice") return doc.customer?.name
    if (type === "purchaseOrder") return doc.vendor?.name
    return doc.receivedFrom
  }

  const getAmount = (doc: T) => {
    return doc.total ?? doc.amount ?? 0
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc._id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-semibold">{getDocNumber(doc)}</span>
                {doc.status && (
                  <Badge className={statusColors[doc.status] || ""}>
                    {statusLabels[doc.status] || doc.status}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {getRecipient(doc)} • {formatDate(doc.date)}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-semibold text-lg">{formatCurrency(getAmount(doc))}</span>

              <div className="flex gap-1">
                {onView && (
                  <Button variant="ghost" size="icon" onClick={() => onView(doc)}>
                    <IconEye className="h-4 w-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button variant="ghost" size="icon" onClick={() => onEdit(doc)}>
                    <IconEdit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(doc._id)}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
