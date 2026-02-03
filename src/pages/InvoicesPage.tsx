import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Header } from "@/components/layout/Header"
import { InvoiceForm } from "@/components/forms/InvoiceForm"
import { InvoicePreview } from "@/components/previews/InvoicePreview"
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
import type { InvoiceFormData, InvoiceStatus } from "@/lib/types"
import { statusLabels } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { downloadInvoicePdf } from "@/lib/pdf"
import { IconArrowLeft, IconPrinter, IconEye, IconTrash, IconEdit, IconMail, IconLoader2 } from "@tabler/icons-react"
import type { Id } from "../../convex/_generated/dataModel"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/useDebounce"

type ViewMode = "list" | "create" | "edit" | "preview"

export function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 300)

  const searchArgs = useMemo(() => ({
    searchTerm: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [debouncedSearch, statusFilter, startDate, endDate])

  const invoices = useQuery(api.invoices.search, searchArgs)
  const defaultBankAccount = useQuery(api.bankAccounts.getDefault)
  const companySettings = useQuery(api.companySettings.getWithUrls)
  const deleteInvoice = useMutation(api.invoices.remove)

  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [previewData, setPreviewData] = useState<InvoiceFormData | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  const handlePreview = (data: InvoiceFormData) => {
    setPreviewData(data)
    setViewMode("preview")
  }

  const handleSaved = () => {
    setViewMode("list")
    setEditId(null)
  }

  const handleEdit = (invoiceId: string) => {
    setEditId(invoiceId)
    setViewMode("edit")
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteInvoice({ id: deleteId as Id<"invoices"> })
        toast.success("Invoice berhasil dihapus")
      } catch (error) {
        toast.error("Gagal menghapus invoice")
        console.error("Failed to delete invoice:", error)
      }
      setDeleteId(null)
    }
  }

  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = async () => {
    if (!previewData) return

    setIsPrinting(true)
    try {
      const bankAccount = defaultBankAccount ? {
        bankName: defaultBankAccount.bankName,
        accountNumber: defaultBankAccount.accountNumber,
        accountHolder: defaultBankAccount.accountHolder,
        branch: defaultBankAccount.branch,
      } : undefined

      // Watermark options from company settings
      const watermark = companySettings?.watermarkEnabled ? {
        enabled: true,
        text: companySettings.watermarkText || companySettings.name,
        opacity: companySettings.watermarkOpacity ?? 10,
      } : undefined

      await downloadInvoicePdf(
        previewData,
        `${previewData.invoiceNumber}.pdf`,
        bankAccount,
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
        <Button variant="ghost" onClick={() => setViewMode("list")} className="mb-4">
          <IconArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar
        </Button>
        <InvoiceForm onPreview={handlePreview} onSaved={handleSaved} />
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
        <InvoiceForm editId={editId} onPreview={handlePreview} onSaved={handleSaved} />
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEmailDialogOpen(true)}>
              <IconMail className="h-4 w-4 mr-2" />
              Kirim Email
            </Button>
            <Button onClick={handlePrint} disabled={isPrinting}>
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
        <InvoicePreview data={previewData} />

        {/* Email Dialog */}
        <EmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          documentType="invoice"
          documentId={previewId || ""}
          documentNumber={previewData.invoiceNumber}
          recipientEmail={previewData.customer.email}
          recipientName={previewData.customer.name}
          total={previewData.total}
          dueDate={previewData.dueDate}
          companyName={previewData.company.name}
          invoiceData={previewData}
          bankAccount={defaultBankAccount ? {
            bankName: defaultBankAccount.bankName,
            accountNumber: defaultBankAccount.accountNumber,
            accountHolder: defaultBankAccount.accountHolder,
            branch: defaultBankAccount.branch,
          } : undefined}
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
        title="Invoice"
        subtitle="Kelola semua invoice Anda"
        onCreateNew={() => setViewMode("create")}
        createLabel="Buat Invoice"
      />

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Cari nomor invoice atau pelanggan..."
          className="flex-1 min-w-50"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as InvoiceStatus | "all")}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="draft">{statusLabels.draft}</SelectItem>
            <SelectItem value="sent">{statusLabels.sent}</SelectItem>
            <SelectItem value="paid">{statusLabels.paid}</SelectItem>
            <SelectItem value="overdue">{statusLabels.overdue}</SelectItem>
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

      {!invoices || invoices.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Tidak ada invoice yang cocok dengan pencarian."
              : "Belum ada invoice. Buat invoice pertama Anda!"}
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
                    <StatusDropdown
                      documentType="invoice"
                      documentId={invoice._id}
                      currentStatus={invoice.status}
                      disabled={invoice.status === "paid"}
                    />
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
                      onClick={() => handleEdit(invoice._id)}
                      disabled={invoice.status === "paid"}
                      title={invoice.status === "paid" ? "Invoice lunas tidak dapat diedit" : "Edit invoice"}
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
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
                        setPreviewId(invoice._id)
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
