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
import { LineItemsEditor } from "./LineItemsEditor"
import type { InvoiceFormData, LineItem, CompanyInfo, CustomerInfo } from "@/lib/types"
import { formatCurrency, getTodayDate, getDefaultDueDate } from "@/lib/utils"
import { IconDeviceFloppy, IconEye } from "@tabler/icons-react"

interface InvoiceFormProps {
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

export function InvoiceForm({ onPreview, onSaved }: InvoiceFormProps) {
  const nextNumber = useQuery(api.documentNumbers.getNextNumber, { type: "invoice" })
  const companySettings = useQuery(api.companySettings.get)
  const createInvoice = useMutation(api.invoices.create)
  const incrementCounter = useMutation(api.documentNumbers.incrementCounter)

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

  // Set invoice number from counter
  useEffect(() => {
    if (nextNumber?.number) {
      setFormData((prev) => ({ ...prev, invoiceNumber: nextNumber.number }))
    }
  }, [nextNumber])

  // Set company info from settings
  useEffect(() => {
    if (companySettings) {
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
  }, [companySettings])

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
      await createInvoice(formData)
      await incrementCounter({ type: "invoice" })
      onSaved?.()
    } catch (error) {
      console.error("Failed to save invoice:", error)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buat Invoice Baru</CardTitle>
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
            <CustomerInfoFields
              customer={formData.customer}
              onChange={updateCustomer}
              title="Kepada"
            />
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
          {isSaving ? "Menyimpan..." : "Simpan Invoice"}
        </Button>
      </div>
    </form>
  )
}
