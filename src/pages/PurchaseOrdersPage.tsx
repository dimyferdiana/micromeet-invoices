import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Header } from "@/components/layout/Header"
import { PurchaseOrderForm } from "@/components/forms/PurchaseOrderForm"
import { PurchaseOrderPreview } from "@/components/previews/PurchaseOrderPreview"
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
import type { POFormData } from "@/lib/types"
import { statusColors, statusLabels } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { IconArrowLeft, IconPrinter, IconEye, IconTrash } from "@tabler/icons-react"
import type { Id } from "../../convex/_generated/dataModel"

type ViewMode = "list" | "create" | "preview"

export function PurchaseOrdersPage() {
  const purchaseOrders = useQuery(api.purchaseOrders.list, {})
  const deletePO = useMutation(api.purchaseOrders.remove)

  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [previewData, setPreviewData] = useState<POFormData | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handlePreview = (data: POFormData) => {
    setPreviewData(data)
    setViewMode("preview")
  }

  const handleSaved = () => {
    setViewMode("list")
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deletePO({ id: deleteId as Id<"purchaseOrders"> })
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

      {!purchaseOrders || purchaseOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            Belum ada purchase order. Buat PO pertama Anda!
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
                    <Badge className={statusColors[po.status]}>
                      {statusLabels[po.status]}
                    </Badge>
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
