import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Header } from "@/components/layout/Header"
import { InvoiceForm } from "@/components/forms/InvoiceForm"
import { InvoicePreview } from "@/components/previews/InvoicePreview"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { InvoiceFormData } from "@/lib/types"
import { statusColors, statusLabels } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { IconArrowLeft, IconPrinter, IconEye, IconTrash } from "@tabler/icons-react"
import type { Id } from "../../convex/_generated/dataModel"

type ViewMode = "list" | "create" | "preview"

export function InvoicesPage() {
  const invoices = useQuery(api.invoices.list, {})
  const deleteInvoice = useMutation(api.invoices.remove)

  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [previewData, setPreviewData] = useState<InvoiceFormData | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handlePreview = (data: InvoiceFormData) => {
    setPreviewData(data)
    setViewMode("preview")
  }

  const handleSaved = () => {
    setViewMode("list")
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteInvoice({ id: deleteId as Id<"invoices"> })
      setDeleteId(null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (viewMode === "create") {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setViewMode("list")} className="mb-4">
          <IconArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar
        </Button>
        <InvoiceForm onPreview={handlePreview} onSaved={handleSaved} />
      </div>
    )
  }

  if (viewMode === "preview" && previewData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center print:hidden">
          <Button variant="ghost" onClick={() => setViewMode("create")}>
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Form
          </Button>
          <Button onClick={handlePrint}>
            <IconPrinter className="h-4 w-4 mr-2" />
            Cetak
          </Button>
        </div>
        <InvoicePreview data={previewData} />
      </div>
    )
  }

  return (
    <div>
      <Header
        title="Invoice"
        subtitle="Kelola semua invoice Anda"
        onCreateNew={() => setViewMode("create")}
        createLabel="Buat Invoice"
      />

      {!invoices || invoices.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            Belum ada invoice. Buat invoice pertama Anda!
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Card key={invoice._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{invoice.invoiceNumber}</span>
                    <Badge className={statusColors[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {invoice.customer.name} • {formatDate(invoice.date)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold text-lg">
                    {formatCurrency(invoice.total)}
                  </span>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setPreviewData({
                          invoiceNumber: invoice.invoiceNumber,
                          date: invoice.date,
                          dueDate: invoice.dueDate,
                          company: invoice.company,
                          customer: invoice.customer,
                          items: invoice.items,
                          subtotal: invoice.subtotal,
                          taxRate: invoice.taxRate,
                          taxAmount: invoice.taxAmount,
                          total: invoice.total,
                          notes: invoice.notes,
                          status: invoice.status,
                        })
                        setViewMode("preview")
                      }}
                    >
                      <IconEye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(invoice._id)}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Invoice akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
