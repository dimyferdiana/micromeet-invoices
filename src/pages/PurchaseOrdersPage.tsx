import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Header } from "@/components/layout/Header"
import { PurchaseOrderForm } from "@/components/forms/PurchaseOrderForm"
import { PurchaseOrderPreview } from "@/components/previews/PurchaseOrderPreview"
import { StatusDropdown } from "@/components/forms/StatusDropdown"
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
import { IconArrowLeft, IconPrinter, IconEye, IconTrash, IconEdit } from "@tabler/icons-react"
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
  const deletePO = useMutation(api.purchaseOrders.remove)

  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [previewData, setPreviewData] = useState<POFormData | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

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
        <PurchaseOrderForm onPreview={handlePreview} onSaved={handleSaved} />
      </div>
    )
  }

  if (viewMode === "edit" && editId) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setViewMode("list"); setEditId(null); }} className="mb-4">
          <IconArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar
        </Button>
        <PurchaseOrderForm editId={editId} onPreview={handlePreview} onSaved={handleSaved} />
      </div>
    )
  }

  if (viewMode === "preview" && previewData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center print:hidden">
          <Button variant="ghost" onClick={() => setViewMode(editId ? "edit" : "create")}>
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Form
          </Button>
          <Button onClick={handlePrint}>
            <IconPrinter className="h-4 w-4 mr-2" />
            Print / Download
          </Button>
        </div>
        <PurchaseOrderPreview data={previewData} />
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

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Cari nomor PO atau vendor..."
          className="flex-1 min-w-50"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as POStatus | "all")}
        >
          <SelectTrigger className="w-45">
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
          className="w-auto"
        />
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
        <div className="space-y-3">
          {purchaseOrders.map((po) => (
            <Card key={po._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{po.poNumber}</span>
                    <StatusDropdown
                      documentType="purchaseOrder"
                      documentId={po._id}
                      currentStatus={po.status}
                      disabled={po.status === "received"}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {po.vendor.name} • {formatDate(po.date)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold text-lg">{formatCurrency(po.total)}</span>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(po._id)}
                      disabled={po.status === "received"}
                      title={po.status === "received" ? "PO sudah diterima tidak dapat diedit" : "Edit PO"}
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
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
                        setViewMode("preview")
                      }}
                    >
                      <IconEye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(po._id)}
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
