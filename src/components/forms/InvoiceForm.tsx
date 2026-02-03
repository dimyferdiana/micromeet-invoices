import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CompanyInfoFields } from "./CompanyInfoFields"
import { CustomerInfoFields } from "./CustomerInfoFields"
import { CustomerSelector } from "./CustomerSelector"
import { LineItemsEditor } from "./LineItemsEditor"
import type { InvoiceFormData, LineItem, CompanyInfo, CustomerInfo } from "@/lib/types"
import { formatCurrency, getTodayDate, getDefaultDueDate } from "@/lib/utils"
import { IconDeviceFloppy, IconEye } from "@tabler/icons-react"
import type { Id } from "../../../convex/_generated/dataModel"
import { toast } from "sonner"

interface InvoiceFormProps {
  editId?: string
  onPreview?: (data: InvoiceFormData) => void
  onSaved?: () => void
}

const defaultCompany: CompanyInfo = {
  name: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  taxId: "",
}

const defaultCustomer: CustomerInfo = {
  name: "",
  address: "",
  phone: "",
  email: "",
}

export function InvoiceForm({ editId, onPreview, onSaved }: InvoiceFormProps) {
  const isEditMode = !!editId

  const nextNumber = useQuery(api.documentNumbers.getNextNumber, { type: "invoice" })
  const companySettings = useQuery(api.companySettings.get)
  const existingInvoice = useQuery(
    api.invoices.get,
    editId ? { id: editId as Id<"invoices"> } : "skip"
  )

  const createInvoice = useMutation(api.invoices.create)
  const updateInvoice = useMutation(api.invoices.update)
  const createCustomer = useMutation(api.customers.create)
  const incrementCounter = useMutation(api.documentNumbers.incrementCounter)

  const [saveNewCustomer, setSaveNewCustomer] = useState(false)
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: "",
    date: getTodayDate(),
    dueDate: getDefaultDueDate(),
    company: defaultCompany,
    customer: defaultCustomer,
    items: [{ description: "", quantity: 1, unitPrice: 0, amount: 0 }],
    subtotal: 0,
    taxRate: 11,
    taxAmount: 0,
    total: 0,
    notes: "",
    status: "draft",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isLoaded, setIsLoaded] = useState(!isEditMode)

  // Load existing invoice data for edit mode
  useEffect(() => {
    if (isEditMode && existingInvoice) {
      setFormData({
        invoiceNumber: existingInvoice.invoiceNumber,
        date: existingInvoice.date,
        dueDate: existingInvoice.dueDate,
        company: existingInvoice.company,
        customer: existingInvoice.customer,
        items: existingInvoice.items,
        subtotal: existingInvoice.subtotal,
        taxRate: existingInvoice.taxRate,
        taxAmount: existingInvoice.taxAmount,
        total: existingInvoice.total,
        notes: existingInvoice.notes,
        status: existingInvoice.status,
      })
      setIsLoaded(true)
    }
  }, [isEditMode, existingInvoice])

  // Set invoice number from counter (only for create mode)
  useEffect(() => {
    if (!isEditMode && nextNumber?.number) {
      setFormData((prev) => ({ ...prev, invoiceNumber: nextNumber.number }))
    }
  }, [isEditMode, nextNumber])

  // Set company info from settings (only for create mode)
  useEffect(() => {
    if (!isEditMode && companySettings) {
      setFormData((prev) => ({
        ...prev,
        company: {
          name: companySettings.name,
          address: companySettings.address,
          phone: companySettings.phone,
          email: companySettings.email,
          website: companySettings.website,
          taxId: companySettings.taxId,
        },
      }))
    }
  }, [isEditMode, companySettings])

  // Calculate totals when items or tax rate changes
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = Math.round((subtotal * formData.taxRate) / 100)
    const total = subtotal + taxAmount

    setFormData((prev) => ({
      ...prev,
      subtotal,
      taxAmount,
      total,
    }))
  }, [formData.items, formData.taxRate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Save new customer if checkbox is checked
      if (saveNewCustomer && formData.customer.name) {
        await createCustomer({
          name: formData.customer.name,
          address: formData.customer.address,
          phone: formData.customer.phone || undefined,
          email: formData.customer.email || undefined,
        })
      }

      if (isEditMode && editId) {
        await updateInvoice({
          id: editId as Id<"invoices">,
          ...formData,
        })
        toast.success("Invoice berhasil diperbarui")
      } else {
        await createInvoice(formData)
        await incrementCounter({ type: "invoice" })
        toast.success("Invoice berhasil disimpan")
      }
      onSaved?.()
    } catch (error) {
      console.error("Failed to save invoice:", error)
      toast.error(isEditMode ? "Gagal memperbarui invoice" : "Gagal menyimpan invoice")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    onPreview?.(formData)
  }

  const updateItems = (items: LineItem[]) => {
    setFormData((prev) => ({ ...prev, items }))
  }

  const updateCompany = (company: CompanyInfo) => {
    setFormData((prev) => ({ ...prev, company }))
  }

  const updateCustomer = (customer: CustomerInfo) => {
    setFormData((prev) => ({ ...prev, customer }))
  }

  if (isEditMode && !isLoaded) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Memuat data invoice...</p>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Invoice" : "Buat Invoice Baru"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Nomor Invoice</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                placeholder="INV-2024-0001"
                disabled={isEditMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Jatuh Tempo</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <Separator />

          {/* Company and Customer Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <CompanyInfoFields company={formData.company} onChange={updateCompany} title="Dari" />
            <div className="space-y-4">
              <CustomerSelector
                value={formData.customer}
                onChange={updateCustomer}
                label="Kepada (Pelanggan)"
                placeholder="Pilih pelanggan tersimpan..."
                saveNewCustomer={saveNewCustomer}
                onSaveNewCustomerChange={setSaveNewCustomer}
              />
              <CustomerInfoFields
                customer={formData.customer}
                onChange={updateCustomer}
                title="Detail Pelanggan"
              />
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <LineItemsEditor items={formData.items} onChange={updateItems} />

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(formData.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pajak (%)</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.taxRate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, taxRate: Number(e.target.value) || 0 }))
                  }
                  className="w-20 text-right"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pajak</span>
                <span>{formatCurrency(formData.taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(formData.total)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan untuk invoice ini..."
              value={formData.notes || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={handlePreview}>
          <IconEye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button type="submit" disabled={isSaving}>
          <IconDeviceFloppy className="h-4 w-4 mr-2" />
          {isSaving ? "Menyimpan..." : isEditMode ? "Perbarui Invoice" : "Simpan Invoice"}
        </Button>
      </div>
    </form>
  )
}
