import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IconDeviceFloppy, IconCheck } from "@tabler/icons-react"

interface CompanyFormData {
  name: string
  address: string
  phone: string
  email: string
  website: string
  taxId: string
  bankName: string
  bankAccount: string
  bankAccountName: string
}

const defaultCompany: CompanyFormData = {
  name: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  taxId: "",
  bankName: "",
  bankAccount: "",
  bankAccountName: "",
}

export function SettingsPage() {
  const companySettings = useQuery(api.companySettings.get)
  const upsertSettings = useMutation(api.companySettings.upsert)

  const [formData, setFormData] = useState<CompanyFormData>(defaultCompany)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load existing settings
  useEffect(() => {
    if (companySettings) {
      setFormData({
        name: companySettings.name || "",
        address: companySettings.address || "",
        phone: companySettings.phone || "",
        email: companySettings.email || "",
        website: companySettings.website || "",
        taxId: companySettings.taxId || "",
        bankName: companySettings.bankName || "",
        bankAccount: companySettings.bankAccount || "",
        bankAccountName: companySettings.bankAccountName || "",
      })
    }
  }, [companySettings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await upsertSettings(formData)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">
          Kelola informasi perusahaan yang akan digunakan pada dokumen
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Perusahaan</CardTitle>
            <CardDescription>
              Data ini akan otomatis digunakan saat membuat invoice, PO, atau kwitansi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Perusahaan *</Label>
                <Input
                  id="name"
                  placeholder="PT. Contoh Perusahaan"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat *</Label>
                <Textarea
                  id="address"
                  placeholder="Jl. Contoh No. 123, Jakarta Selatan, DKI Jakarta 12345"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    placeholder="021-12345678"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@perusahaan.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="www.perusahaan.com"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">NPWP</Label>
                  <Input
                    id="taxId"
                    placeholder="00.000.000.0-000.000"
                    value={formData.taxId}
                    onChange={(e) => updateField("taxId", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Bank</CardTitle>
            <CardDescription>
              Data rekening bank untuk pembayaran invoice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Nama Bank</Label>
              <Input
                id="bankName"
                placeholder="Bank Central Asia"
                value={formData.bankName}
                onChange={(e) => updateField("bankName", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Nomor Rekening</Label>
                <Input
                  id="bankAccount"
                  placeholder="1234567890"
                  value={formData.bankAccount}
                  onChange={(e) => updateField("bankAccount", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountName">Atas Nama</Label>
                <Input
                  id="bankAccountName"
                  placeholder="PT. Contoh Perusahaan"
                  value={formData.bankAccountName}
                  onChange={(e) => updateField("bankAccountName", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="w-40">
            {saveSuccess ? (
              <>
                <IconCheck className="h-4 w-4 mr-2" />
                Tersimpan!
              </>
            ) : isSaving ? (
              "Menyimpan..."
            ) : (
              <>
                <IconDeviceFloppy className="h-4 w-4 mr-2" />
                Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
