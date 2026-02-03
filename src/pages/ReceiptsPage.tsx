import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Header } from "@/components/layout/Header"
import { ReceiptForm } from "@/components/forms/ReceiptForm"
import { ReceiptPreview } from "@/components/previews/ReceiptPreview"
import { Button } from "@/components/ui/button"
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
import type { ReceiptFormData } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { IconArrowLeft, IconPrinter, IconEye, IconTrash } from "@tabler/icons-react"
import type { Id } from "../../convex/_generated/dataModel"

type ViewMode = "list" | "create" | "preview"

export function ReceiptsPage() {
  const receipts = useQuery(api.receipts.list)
  const deleteReceipt = useMutation(api.receipts.remove)

  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [previewData, setPreviewData] = useState<ReceiptFormData | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handlePreview = (data: ReceiptFormData) => {
    setPreviewData(data)
    setViewMode("preview")
  }

  const handleSaved = () => {
    setViewMode("list")
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteReceipt({ id: deleteId as Id<"receipts"> })
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
        <ReceiptForm onPreview={handlePreview} onSaved={handleSaved} />
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
        <ReceiptPreview data={previewData} />
      </div>
    )
  }

  return (
    <div>
      <Header
        title="Kwitansi"
        subtitle="Kelola semua kwitansi Anda"
        onCreateNew={() => setViewMode("create")}
        createLabel="Buat Kwitansi"
      />

      {!receipts || receipts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            Belum ada kwitansi. Buat kwitansi pertama Anda!
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {receipts.map((receipt) => (
            <Card key={receipt._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <span className="font-semibold">{receipt.receiptNumber}</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {receipt.receivedFrom} • {formatDate(receipt.date)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold text-lg">
                    {formatCurrency(receipt.amount)}
                  </span>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setPreviewData({
                          receiptNumber: receipt.receiptNumber,
                          date: receipt.date,
                          company: receipt.company,
                          receivedFrom: receipt.receivedFrom,
                          amount: receipt.amount,
                          amountInWords: receipt.amountInWords,
                          paymentMethod: receipt.paymentMethod,
                          paymentFor: receipt.paymentFor,
                          notes: receipt.notes,
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
                      onClick={() => setDeleteId(receipt._id)}
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
            <AlertDialogTitle>Hapus Kwitansi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kwitansi akan dihapus secara permanen.
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
