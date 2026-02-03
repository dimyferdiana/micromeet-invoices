import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { IconDeviceFloppy, IconCheck, IconPalette } from "@tabler/icons-react"
import { toast } from "sonner"

// Common brand colors for quick selection
const brandColors = [
  { name: "Indigo", value: "#4F46E5" },
  { name: "Blue", value: "#2563EB" },
  { name: "Green", value: "#059669" },
  { name: "Red", value: "#DC2626" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Orange", value: "#EA580C" },
  { name: "Gray", value: "#4B5563" },
  { name: "Black", value: "#111827" },
]

export function EmailTemplateCard() {
  const emailSettings = useQuery(api.emailSettings.get)
  const updateTemplate = useMutation(api.emailSettings.updateTemplate)

  const [headerColor, setHeaderColor] = useState("#4F46E5")
  const [footerText, setFooterText] = useState("")
  const [includePaymentInfo, setIncludePaymentInfo] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load existing settings
  useEffect(() => {
    if (emailSettings) {
      setHeaderColor(emailSettings.emailHeaderColor || "#4F46E5")
      setFooterText(emailSettings.emailFooterText || "")
      setIncludePaymentInfo(emailSettings.includePaymentInfo ?? true)
    }
  }, [emailSettings])

  const handleSave = async () => {
    if (!emailSettings?.isConfigured) {
      toast.error("Silakan konfigurasi SMTP terlebih dahulu")
      return
    }

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await updateTemplate({
        emailHeaderColor: headerColor,
        emailFooterText: footerText || undefined,
        includePaymentInfo,
      })
      setSaveSuccess(true)
      toast.success("Template email berhasil disimpan")
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to save email template:", error)
      toast.error("Gagal menyimpan template email")
    } finally {
      setIsSaving(false)
    }
  }

  const isDisabled = !emailSettings?.isConfigured

  return (
    <Card className={isDisabled ? "opacity-60" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconPalette className="h-5 w-5" />
          Template Email
        </CardTitle>
        <CardDescription>
          Kustomisasi tampilan email yang dikirim ke pelanggan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isDisabled && (
          <p className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg">
            Konfigurasi SMTP terlebih dahulu untuk mengatur template email.
          </p>
        )}

        <div className="space-y-3">
          <Label>Warna Header Email</Label>
          <div className="flex flex-wrap gap-2">
            {brandColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setHeaderColor(color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  headerColor === color.value
                    ? "border-gray-900 ring-2 ring-offset-2 ring-gray-400"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
                disabled={isDisabled}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={headerColor}
              onChange={(e) => setHeaderColor(e.target.value)}
              className="w-12 h-8 p-0 border-0"
              disabled={isDisabled}
            />
            <Input
              type="text"
              value={headerColor}
              onChange={(e) => setHeaderColor(e.target.value)}
              placeholder="#4F46E5"
              className="w-28 font-mono text-sm"
              disabled={isDisabled}
            />
            <span className="text-sm text-muted-foreground">Warna kustom</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="footerText">Teks Footer Email</Label>
          <Textarea
            id="footerText"
            placeholder="Email ini dikirim secara otomatis."
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            rows={2}
            disabled={isDisabled}
          />
          <p className="text-xs text-muted-foreground">
            Kosongkan untuk menggunakan teks default
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="includePaymentInfo"
            checked={includePaymentInfo}
            onCheckedChange={(checked) => setIncludePaymentInfo(checked === true)}
            disabled={isDisabled}
          />
          <div className="space-y-0.5">
            <Label htmlFor="includePaymentInfo" className="cursor-pointer">
              Sertakan Informasi Pembayaran
            </Label>
            <p className="text-sm text-muted-foreground">
              Tampilkan detail rekening bank dalam email invoice
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="border rounded-lg overflow-hidden max-w-md">
            <div
              className="text-white px-4 py-3 text-center font-semibold"
              style={{ backgroundColor: headerColor }}
            >
              Nama Perusahaan
            </div>
            <div className="px-4 py-3 bg-white text-sm">
              <p className="text-gray-700">Isi pesan email akan ditampilkan di sini...</p>
              {includePaymentInfo && (
                <div className="bg-gray-50 p-3 rounded mt-3 text-xs text-gray-600">
                  <p className="font-semibold">Informasi Pembayaran:</p>
                  <p>Bank: Contoh Bank</p>
                  <p>No. Rekening: 1234567890</p>
                </div>
              )}
            </div>
            <div className="bg-gray-100 px-4 py-2 text-center text-xs text-gray-500">
              {footerText || "Email ini dikirim secara otomatis."}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving || isDisabled} className="w-40">
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
                Simpan Template
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
