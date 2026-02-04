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
import { PayerSelector, type NewPayerInfo } from "./PayerSelector"
import type { ReceiptFormData, CompanyInfo, PaymentMethod, ReceiptMode } from "@/lib/types"
import { receiptModeLabels } from "@/lib/types"
import { formatCurrency, getTodayDate, numberToWords } from "@/lib/utils"
import { IconDeviceFloppy, IconEye, IconArrowDown, IconArrowUp } from "@tabler/icons-react"
import type { Id } from "../../../convex/_generated/dataModel"
import { toast } from "sonner"

interface ReceiptFormProps {
  editId?: string
  /** Initial data to restore form state (e.g., when returning from preview) */
  initialData?: ReceiptFormData
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

export function ReceiptForm({ editId, initialData, onPreview, onSaved }: ReceiptFormProps) {
  const isEditMode = !!editId

  const nextNumber = useQuery(api.documentNumbers.getNextNumber, { type: "receipt" })
  const companySettings = useQuery(api.companySettings.get)
  const existingReceipt = useQuery(
    api.receipts.get,
    editId ? { id: editId as Id<"receipts"> } : "skip"
  )

  const createReceipt = useMutation(api.receipts.create)
  const updateReceipt = useMutation(api.receipts.update)
  const createCustomer = useMutation(api.customers.create)
  const incrementCounter = useMutation(api.documentNumbers.incrementCounter)

  const [saveNewPayer, setSaveNewPayer] = useState(false)
  const [newPayerInfo, setNewPayerInfo] = useState<NewPayerInfo>({
    name: "",
    address: "",
    phone: "",
    email: "",
  })
  const [formData, setFormData] = useState<ReceiptFormData>(
    initialData || {
      receiptNumber: "",
      date: getTodayDate(),
      company: defaultCompany,
      mode: "receive",
      receivedFrom: "",
      amount: 0,
      amountInWords: "",
      paymentMethod: "cash",
      paymentFor: "",
      notes: "",
    }
  )

  const [isSaving, setIsSaving] = useState(false)
  const [isLoaded, setIsLoaded] = useState(!!initialData || !isEditMode)

  // Load existing receipt data for edit mode
  useEffect(() => {
    if (isEditMode && existingReceipt) {
      setFormData({
        receiptNumber: existingReceipt.receiptNumber,
        date: existingReceipt.date,
        company: existingReceipt.company,
        mode: existingReceipt.mode || "receive",
        receivedFrom: existingReceipt.receivedFrom,
        amount: existingReceipt.amount,
        amountInWords: existingReceipt.amountInWords,
        paymentMethod: existingReceipt.paymentMethod,
        paymentFor: existingReceipt.paymentFor,
        notes: existingReceipt.notes,
      })
      setIsLoaded(true)
    }
  }, [isEditMode, existingReceipt])

  // Set receipt number from counter (only for create mode without initialData)
  useEffect(() => {
    if (!isEditMode && !initialData && nextNumber?.number) {
      setFormData((prev) => ({ ...prev, receiptNumber: nextNumber.number }))
    }
  }, [isEditMode, initialData, nextNumber])

  // Set company info from settings (only for create mode without initialData)
  useEffect(() => {
    if (!isEditMode && !initialData && companySettings) {
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
  }, [isEditMode, initialData, companySettings])

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
      // Save new payer if checkbox is checked
      if (saveNewPayer && formData.receivedFrom) {
        await createCustomer({
          name: formData.receivedFrom,
          address: newPayerInfo.address || "",
          phone: newPayerInfo.phone || undefined,
          email: newPayerInfo.email || undefined,
        })
        toast.success("Pelanggan baru berhasil disimpan")
      }

      if (isEditMode && editId) {
        await updateReceipt({
          id: editId as Id<"receipts">,
          ...formData,
        })
        toast.success("Kwitansi berhasil diperbarui")
      } else {
        await createReceipt(formData)
        await incrementCounter({ type: "receipt" })
        toast.success("Kwitansi berhasil disimpan")
      }
      onSaved?.()
    } catch (error) {
      console.error("Failed to save receipt:", error)
      toast.error(isEditMode ? "Gagal memperbarui kwitansi" : "Gagal menyimpan kwitansi")
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

  if (isEditMode && !isLoaded) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Memuat data kwitansi...</p>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Kwitansi" : "Buat Kwitansi Baru"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Switcher */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Label className="text-sm font-medium">Jenis Transaksi:</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.mode === "receive" ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData((prev) => ({ ...prev, mode: "receive" as ReceiptMode }))}
                className="gap-2"
              >
                <IconArrowDown className="h-4 w-4" />
                {receiptModeLabels.receive}
              </Button>
              <Button
                type="button"
                variant={formData.mode === "send" ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData((prev) => ({ ...prev, mode: "send" as ReceiptMode }))}
                className="gap-2"
              >
                <IconArrowUp className="h-4 w-4" />
                {receiptModeLabels.send}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground ml-auto">
              {formData.mode === "receive"
                ? "Perusahaan menerima uang dari pihak lain"
                : "Perusahaan mengirim uang ke pihak lain"}
            </p>
          </div>

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
          </div>

          <Separator />

          {/* Company Info */}
          <CompanyInfoFields
            company={formData.company}
            onChange={updateCompany}
            title={formData.mode === "receive" ? "Informasi Penerima (Perusahaan)" : "Informasi Pengirim (Perusahaan)"}
          />

          <Separator />

          {/* Payment Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Informasi Pembayaran</h3>

            <PayerSelector
              value={formData.receivedFrom}
              onChange={(name) => setFormData((prev) => ({ ...prev, receivedFrom: name }))}
              label={formData.mode === "receive" ? "Diterima Dari" : "Dikirim Kepada"}
              placeholder={formData.mode === "receive" ? "Pilih atau ketik nama pembayar..." : "Pilih atau ketik nama penerima..."}
              saveNewPayer={saveNewPayer}
              onSaveNewPayerChange={setSaveNewPayer}
              newPayerInfo={newPayerInfo}
              onNewPayerInfoChange={setNewPayerInfo}
            />

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
          {isSaving ? "Menyimpan..." : isEditMode ? "Perbarui Kwitansi" : "Simpan Kwitansi"}
        </Button>
      </div>
    </form>
  )
}
