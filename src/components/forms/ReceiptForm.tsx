import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CompanyInfoFields } from "./CompanyInfoFields"
import type { ReceiptFormData, CompanyInfo, PaymentMethod } from "@/lib/types"
import { formatCurrency, getTodayDate, numberToWords } from "@/lib/utils"
import { IconDeviceFloppy, IconEye } from "@tabler/icons-react"

interface ReceiptFormProps {
  onPreview?: (data: ReceiptFormData) => void
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

export function ReceiptForm({ onPreview, onSaved }: ReceiptFormProps) {
  const nextNumber = useQuery(api.documentNumbers.getNextNumber, { type: "receipt" })
  const companySettings = useQuery(api.companySettings.get)
  const createReceipt = useMutation(api.receipts.create)
  const incrementCounter = useMutation(api.documentNumbers.incrementCounter)

  const [formData, setFormData] = useState<ReceiptFormData>({
    receiptNumber: "",
    date: getTodayDate(),
    company: defaultCompany,
    receivedFrom: "",
    amount: 0,
    amountInWords: "",
    paymentMethod: "cash",
    paymentFor: "",
    notes: "",
  })

  const [isSaving, setIsSaving] = useState(false)

  // Set receipt number from counter
  useEffect(() => {
    if (nextNumber?.number) {
      setFormData((prev) => ({ ...prev, receiptNumber: nextNumber.number }))
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

  // Update amount in words when amount changes
  useEffect(() => {
    if (formData.amount > 0) {
      setFormData((prev) => ({
        ...prev,
        amountInWords: numberToWords(formData.amount),
      }))
    }
  }, [formData.amount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await createReceipt(formData)
      await incrementCounter({ type: "receipt" })
      onSaved?.()
    } catch (error) {
      console.error("Failed to save receipt:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    onPreview?.(formData)
  }

  const updateCompany = (company: CompanyInfo) => {
    setFormData((prev) => ({ ...prev, company }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buat Kwitansi Baru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receiptNumber">Nomor Kwitansi</Label>
              <Input
                id="receiptNumber"
                value={formData.receiptNumber}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, receiptNumber: e.target.value }))
                }
                placeholder="KWT-2024-0001"
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
          </div>

          <Separator />

          {/* Company Info */}
          <CompanyInfoFields
            company={formData.company}
            onChange={updateCompany}
            title="Informasi Penerima (Perusahaan)"
          />

          <Separator />

          {/* Payment Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Informasi Pembayaran</h3>

            <div className="space-y-2">
              <Label htmlFor="receivedFrom">Diterima Dari *</Label>
              <Input
                id="receivedFrom"
                placeholder="Nama pembayar"
                value={formData.receivedFrom}
                onChange={(e) => setFormData((prev) => ({ ...prev, receivedFrom: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah Uang *</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: Number(e.target.value) || 0 }))
                  }
                  required
                />
                <p className="text-sm text-muted-foreground">{formatCurrency(formData.amount)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value: PaymentMethod) =>
                    setFormData((prev) => ({ ...prev, paymentMethod: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="check">Cek/Giro</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountInWords">Terbilang</Label>
              <Input
                id="amountInWords"
                value={formData.amountInWords}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amountInWords: e.target.value }))
                }
                placeholder="Terbilang dalam huruf..."
                className="italic"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentFor">Untuk Pembayaran *</Label>
              <Textarea
                id="paymentFor"
                placeholder="Deskripsi pembayaran..."
                value={formData.paymentFor}
                onChange={(e) => setFormData((prev) => ({ ...prev, paymentFor: e.target.value }))}
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                placeholder="Catatan tambahan..."
                value={formData.notes || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>
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
          {isSaving ? "Menyimpan..." : "Simpan Kwitansi"}
        </Button>
      </div>
    </form>
  )
}
