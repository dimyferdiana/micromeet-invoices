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
import type { POFormData, LineItem, CompanyInfo, CustomerInfo } from "@/lib/types"
import { formatCurrency, getTodayDate } from "@/lib/utils"
import { IconDeviceFloppy, IconEye } from "@tabler/icons-react"

interface PurchaseOrderFormProps {
  onPreview?: (data: POFormData) => void
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

const defaultVendor: CustomerInfo = {
  name: "",
  address: "",
  phone: "",
  email: "",
}

export function PurchaseOrderForm({ onPreview, onSaved }: PurchaseOrderFormProps) {
  const nextNumber = useQuery(api.documentNumbers.getNextNumber, { type: "purchaseOrder" })
  const companySettings = useQuery(api.companySettings.get)
  const createPO = useMutation(api.purchaseOrders.create)
  const incrementCounter = useMutation(api.documentNumbers.incrementCounter)

  const [formData, setFormData] = useState<POFormData>({
    poNumber: "",
    date: getTodayDate(),
    expectedDeliveryDate: "",
    company: defaultCompany,
    vendor: defaultVendor,
    items: [{ description: "", quantity: 1, unitPrice: 0, amount: 0 }],
    subtotal: 0,
    taxRate: 11,
    taxAmount: 0,
    total: 0,
    shippingAddress: "",
    notes: "",
    terms: "1. Barang yang sudah dibeli tidak dapat dikembalikan.\n2. Pembayaran dilakukan dalam waktu 30 hari setelah barang diterima.",
    status: "draft",
  })

  const [isSaving, setIsSaving] = useState(false)

  // Set PO number from counter
  useEffect(() => {
    if (nextNumber?.number) {
      setFormData((prev) => ({ ...prev, poNumber: nextNumber.number }))
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
        shippingAddress: companySettings.address,
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
      await createPO(formData)
      await incrementCounter({ type: "purchaseOrder" })
      onSaved?.()
    } catch (error) {
      console.error("Failed to save purchase order:", error)
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

  const updateVendor = (vendor: CustomerInfo) => {
    setFormData((prev) => ({ ...prev, vendor }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buat Purchase Order Baru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="poNumber">Nomor PO</Label>
              <Input
                id="poNumber"
                value={formData.poNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, poNumber: e.target.value }))}
                placeholder="PO-2024-0001"
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
              <Label htmlFor="expectedDeliveryDate">Tanggal Pengiriman</Label>
              <Input
                id="expectedDeliveryDate"
                type="date"
                value={formData.expectedDeliveryDate || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, expectedDeliveryDate: e.target.value }))
                }
              />
            </div>
          </div>

          <Separator />

          {/* Company and Vendor Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <CompanyInfoFields
              company={formData.company}
              onChange={updateCompany}
              title="Dari (Pembeli)"
            />
            <CustomerInfoFields
              customer={formData.vendor}
              onChange={updateVendor}
              title="Kepada (Vendor)"
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

          {/* Shipping Address */}
          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Alamat Pengiriman</Label>
            <Textarea
              id="shippingAddress"
              placeholder="Alamat tujuan pengiriman barang..."
              value={formData.shippingAddress || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, shippingAddress: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <Label htmlFor="terms">Syarat & Ketentuan</Label>
            <Textarea
              id="terms"
              placeholder="Syarat dan ketentuan pembelian..."
              value={formData.terms || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, terms: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan untuk PO ini..."
              value={formData.notes || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={2}
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
          {isSaving ? "Menyimpan..." : "Simpan PO"}
        </Button>
      </div>
    </form>
  )
}
