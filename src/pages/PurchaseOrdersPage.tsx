import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Header } from "@/components/layout/Header"
import { PurchaseOrderForm } from "@/components/forms/PurchaseOrderForm"
import { PurchaseOrderPreview } from "@/components/previews/PurchaseOrderPreview"
import { StatusDropdown } from "@/components/forms/StatusDropdown"
import { EmailDialog } from "@/components/forms/EmailDialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SearchInput } from "@/components/ui/search-input"
import { DateRangeFilter } from "@/components/ui/date-range-filter"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import type { POFormData, POStatus } from "@/lib/types"
import { statusLabels } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { downloadPOPdf } from "@/lib/pdf"
import { IconArrowLeft, IconPrinter, IconEye, IconTrash, IconEdit, IconMail, IconLoader2 } from "@tabler/icons-react"
import type { Id } from "../../convex/_generated/dataModel"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/useDebounce"

type ViewMode = "list" | "create" | "edit" | "preview"

export function PurchaseOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<POStatus | "all">("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 300)

  const searchArgs = useMemo(() => ({
    searchTerm: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [debouncedSearch, statusFilter, startDate, endDate])

  const purchaseOrders = useQuery(api.purchaseOrders.search, searchArgs)
  const companySettings = useQuery(api.companySettings.getWithUrls)
  const deletePO = useMutation(api.purchaseOrders.remove)

  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [previewData, setPreviewData] = useState<POFormData | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePreview = (data: POFormData) => {
    setPreviewData(data)
    setViewMode("preview")
  }

  const handleSaved = () => {
    setViewMode("list")
    setEditId(null)
  }

  const handleEdit = (poId: string) => {
    setEditId(poId)
    setViewMode("edit")
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deletePO({ id: deleteId as Id<"purchaseOrders"> })
        toast.success("Purchase Order berhasil dihapus")
      } catch (error) {
        toast.error("Gagal menghapus Purchase Order")
        console.error("Failed to delete PO:", error)
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

      await downloadPOPdf(
        previewData,
        `${previewData.poNumber}.pdf`,
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
        <PurchaseOrderForm
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
        <PurchaseOrderForm
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
        <PurchaseOrderPreview data={previewData} />

        {/* Email Dialog */}
        <EmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          documentType="purchaseOrder"
          documentId={previewId || ""}
          documentNumber={previewData.poNumber}
          recipientEmail={previewData.vendor.email}
          recipientName={previewData.vendor.name}
          total={previewData.total}
          companyName={previewData.company.name}
          poData={previewData}
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
        title="Purchase Order"
        subtitle="Kelola semua purchase order Anda"
        onCreateNew={() => setViewMode("create")}
        createLabel="Buat PO"
      />

      {/* Search and Filter - Mobile Optimized */}
      <div className="flex flex-col gap-3 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Cari nomor PO atau vendor..."
          className="w-full"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as POStatus | "all")}
          >
            <SelectTrigger className="w-full sm:flex-1">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="draft">{statusLabels.draft}</SelectItem>
              <SelectItem value="sent">{statusLabels.sent}</SelectItem>
              <SelectItem value="confirmed">{statusLabels.confirmed}</SelectItem>
              <SelectItem value="received">{statusLabels.received}</SelectItem>
              <SelectItem value="cancelled">{statusLabels.cancelled}</SelectItem>
            </SelectContent>
          </Select>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            className="w-full sm:flex-1"
          />
        </div>
      </div>

      {!purchaseOrders || purchaseOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Tidak ada PO yang cocok dengan pencarian."
              : "Belum ada purchase order. Buat PO pertama Anda!"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {purchaseOrders.map((po) => (
            <Card key={po._id} className="p-5 md:p-6 hover:shadow-lg transition-all duration-200 active:scale-[0.99]">
              <div className="flex flex-col gap-4">
                {/* Top section - Document number, status, and amount */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-bold text-base md:text-lg text-foreground">{po.poNumber}</span>
                      <StatusDropdown
                        documentType="purchaseOrder"
                        documentId={po._id}
                        currentStatus={po.status}
                        disabled={po.status === "received"}
                      />
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground font-medium">
                      {po.vendor.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(po.date)}
                      {po.expectedDeliveryDate && ` • Pengiriman: ${formatDate(po.expectedDeliveryDate)}`}
                    </p>
                  </div>

                  {/* Amount - prominent on the right */}
                  <div className="text-right">
                    <p className="font-heading text-lg md:text-xl font-bold text-primary">
                      {formatCurrency(po.total)}
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
                        poNumber: po.poNumber,
                        date: po.date,
                        expectedDeliveryDate: po.expectedDeliveryDate,
                        company: po.company,
                        vendor: po.vendor,
                        items: po.items,
                        subtotal: po.subtotal,
                        taxRate: po.taxRate,
                        taxAmount: po.taxAmount,
                        total: po.total,
                        shippingAddress: po.shippingAddress,
                        notes: po.notes,
                        terms: po.terms,
                        status: po.status,
                      })
                      setPreviewId(po._id)
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
                    onClick={() => handleEdit(po._id)}
                    disabled={po.status === "received"}
                    className="flex-1 h-11 md:h-9 md:flex-none font-medium disabled:opacity-50"
                    title={po.status === "received" ? "PO sudah diterima tidak dapat diedit" : "Edit PO"}
                  >
                    <IconEdit className="h-4 w-4 mr-2" />
                    <span className="md:inline">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-11 md:h-9 md:flex-none text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30 font-medium"
                    onClick={() => setDeleteId(po._id)}
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
            <AlertDialogTitle>Hapus Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Purchase Order akan dihapus secara permanen.
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
