import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Header } from "@/components/layout/Header"
import { ReceiptForm } from "@/components/forms/ReceiptForm"
import { ReceiptPreview } from "@/components/previews/ReceiptPreview"
import { EmailDialog } from "@/components/forms/EmailDialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SearchInput } from "@/components/ui/search-input"
import { DateRangeFilter } from "@/components/ui/date-range-filter"
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
import { downloadReceiptPdf } from "@/lib/pdf"
import { IconArrowLeft, IconPrinter, IconEye, IconTrash, IconEdit, IconMail, IconLoader2 } from "@tabler/icons-react"
import type { Id } from "../../convex/_generated/dataModel"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/useDebounce"

type ViewMode = "list" | "create" | "edit" | "preview"

export function ReceiptsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 300)

  const searchArgs = useMemo(() => ({
    searchTerm: debouncedSearch || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [debouncedSearch, startDate, endDate])

  const receipts = useQuery(api.receipts.search, searchArgs)
  const companySettings = useQuery(api.companySettings.getWithUrls)
  const deleteReceipt = useMutation(api.receipts.remove)

  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [previewData, setPreviewData] = useState<ReceiptFormData | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePreview = (data: ReceiptFormData) => {
    setPreviewData(data)
    setViewMode("preview")
  }

  const handleSaved = () => {
    setViewMode("list")
    setEditId(null)
  }

  const handleEdit = (receiptId: string) => {
    setEditId(receiptId)
    setViewMode("edit")
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteReceipt({ id: deleteId as Id<"receipts"> })
        toast.success("Kwitansi berhasil dihapus")
      } catch (error) {
        toast.error("Gagal menghapus kwitansi")
        console.error("Failed to delete receipt:", error)
      }
      setDeleteId(null)
    }
  }

  const handlePrint = async () => {
    if (!previewData) return

    setIsPrinting(true)
    try {
      // Watermark options from company settings
      const watermark = companySettings?.watermarkEnabled ? {
        enabled: true,
        text: companySettings.watermarkText || companySettings.name,
        opacity: companySettings.watermarkOpacity ?? 10,
      } : undefined

      await downloadReceiptPdf(
        previewData,
        `${previewData.receiptNumber}.pdf`,
        companySettings?.logoUrl || undefined,
        watermark
      )
      toast.success("PDF berhasil diunduh")
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      toast.error("Gagal membuat PDF")
    } finally {
      setIsPrinting(false)
    }
  }

  if (viewMode === "create") {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setViewMode("list"); setPreviewData(null); }} className="mb-4">
          <IconArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar
        </Button>
        <ReceiptForm
          initialData={previewData || undefined}
          onPreview={handlePreview}
          onSaved={handleSaved}
        />
      </div>
    )
  }

  if (viewMode === "edit" && editId) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setViewMode("list"); setEditId(null); setPreviewData(null); }} className="mb-4">
          <IconArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar
        </Button>
        <ReceiptForm
          editId={editId}
          initialData={previewData || undefined}
          onPreview={handlePreview}
          onSaved={handleSaved}
        />
      </div>
    )
  }

  if (viewMode === "preview" && previewData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-3 md:justify-between md:items-center print:hidden">
          <Button variant="ghost" onClick={() => setViewMode(editId ? "edit" : "create")} className="w-full md:w-auto">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Form
          </Button>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => setEmailDialogOpen(true)} className="w-full md:w-auto">
              <IconMail className="h-4 w-4 mr-2" />
              <span className="md:inline">Kirim Email</span>
            </Button>
            <Button onClick={handlePrint} disabled={isPrinting} className="w-full md:w-auto">
              {isPrinting ? (
                <>
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Membuat PDF...
                </>
              ) : (
                <>
                  <IconPrinter className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
        <ReceiptPreview data={previewData} />

        {/* Email Dialog */}
        <EmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          documentType="receipt"
          documentId={previewId || ""}
          documentNumber={previewData.receiptNumber}
          recipientName={previewData.receivedFrom}
          total={previewData.amount}
          companyName={previewData.company.name}
          receiptData={previewData}
          logoUrl={companySettings?.logoUrl || undefined}
          watermark={companySettings?.watermarkEnabled ? {
            enabled: true,
            text: companySettings.watermarkText || companySettings.name,
            opacity: companySettings.watermarkOpacity ?? 10,
          } : undefined}
        />
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

      {/* Search and Filter - Mobile Optimized */}
      <div className="flex flex-col gap-3 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Cari nomor kwitansi, pembayar, atau keperluan..."
          className="w-full"
        />
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          className="w-full"
        />
      </div>

      {!receipts || receipts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {searchTerm
              ? "Tidak ada kwitansi yang cocok dengan pencarian."
              : "Belum ada kwitansi. Buat kwitansi pertama Anda!"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {receipts.map((receipt) => (
            <Card key={receipt._id} className="p-5 md:p-6 hover:shadow-lg transition-all duration-200 active:scale-[0.99]">
              <div className="flex flex-col gap-4">
                {/* Top section - Document number and amount */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <span className="font-heading font-bold text-base md:text-lg text-foreground">{receipt.receiptNumber}</span>
                    <p className="text-sm md:text-base text-muted-foreground font-medium">
                      {receipt.receivedFrom}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(receipt.date)} • {receipt.paymentFor}
                    </p>
                  </div>

                  {/* Amount - prominent on the right */}
                  <div className="text-right">
                    <p className="font-heading text-lg md:text-xl font-bold text-primary">
                      {formatCurrency(receipt.amount)}
                    </p>
                  </div>
                </div>

                {/* Bottom section - Action buttons */}
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPreviewData({
                        receiptNumber: receipt.receiptNumber,
                        date: receipt.date,
                        company: receipt.company,
                        mode: receipt.mode || "receive",
                        receivedFrom: receipt.receivedFrom,
                        amount: receipt.amount,
                        amountInWords: receipt.amountInWords,
                        paymentMethod: receipt.paymentMethod,
                        paymentFor: receipt.paymentFor,
                        notes: receipt.notes,
                      })
                      setPreviewId(receipt._id)
                      setViewMode("preview")
                    }}
                    className="flex-1 h-11 md:h-9 md:flex-none font-medium"
                  >
                    <IconEye className="h-4 w-4 mr-2" />
                    <span className="md:inline">Lihat</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(receipt._id)}
                    className="flex-1 h-11 md:h-9 md:flex-none font-medium"
                    title="Edit kwitansi"
                  >
                    <IconEdit className="h-4 w-4 mr-2" />
                    <span className="md:inline">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-11 md:h-9 md:flex-none text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30 font-medium"
                    onClick={() => setDeleteId(receipt._id)}
                  >
                    <IconTrash className="h-4 w-4 mr-2" />
                    <span className="md:inline">Hapus</span>
                  </Button>
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
