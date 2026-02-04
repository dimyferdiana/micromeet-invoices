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
    <div className="space-y-3 md:space-y-4">
      {documents.map((doc) => (
        <Card key={doc._id} className="p-5 md:p-6 hover:shadow-lg transition-all duration-200 active:scale-[0.99]">
          <div className="flex flex-col gap-4">
            {/* Top section - Document number, status, and amount */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-base md:text-lg text-foreground">{getDocNumber(doc)}</span>
                  {doc.status && (
                    <Badge className={`${statusColors[doc.status] || ""} text-xs`}>
                      {statusLabels[doc.status] || doc.status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm md:text-base text-muted-foreground font-medium">
                  {getRecipient(doc)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(doc.date)}
                </p>
              </div>

              {/* Amount - prominent on the right */}
              <div className="text-right">
                <p className="text-lg md:text-xl font-bold text-primary">
                  {formatCurrency(getAmount(doc))}
                </p>
              </div>
            </div>

            {/* Bottom section - Action buttons */}
            <div className="flex gap-2 pt-2 border-t border-border/50">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(doc)}
                  className="flex-1 h-11 md:h-9 md:flex-none font-medium"
                >
                  <IconEye className="h-4 w-4 mr-2" />
                  <span className="md:inline">Lihat</span>
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(doc)}
                  className="flex-1 h-11 md:h-9 md:flex-none font-medium"
                >
                  <IconEdit className="h-4 w-4 mr-2" />
                  <span className="md:inline">Edit</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-11 md:h-9 md:flex-none text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30 font-medium"
                  onClick={() => onDelete(doc._id)}
                >
                  <IconTrash className="h-4 w-4 mr-2" />
                  <span className="md:inline">Hapus</span>
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
