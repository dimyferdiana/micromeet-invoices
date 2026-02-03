import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { IconDeviceFloppy, IconCheck } from "@tabler/icons-react"
import { toast } from "sonner"

export function WatermarkSettingsCard() {
  const companySettings = useQuery(api.companySettings.getWithUrls)
  const updateWatermark = useMutation(api.companySettings.updateWatermark)

  const [enabled, setEnabled] = useState(false)
  const [text, setText] = useState("")
  const [opacity, setOpacity] = useState(10)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load existing settings
  useEffect(() => {
    if (companySettings) {
      setEnabled(companySettings.watermarkEnabled || false)
      setText(companySettings.watermarkText || "")
      setOpacity(companySettings.watermarkOpacity ?? 10)
    }
  }, [companySettings])

  const handleSave = async () => {
    if (!companySettings) {
      toast.error("Silakan simpan informasi perusahaan terlebih dahulu")
      return
    }

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await updateWatermark({
        enabled,
        text: text || undefined,
        opacity,
      })
      setSaveSuccess(true)
      toast.success("Pengaturan watermark berhasil disimpan")
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to save watermark settings:", error)
      toast.error("Gagal menyimpan pengaturan watermark")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watermark PDF</CardTitle>
        <CardDescription>
          Tambahkan watermark berulang dengan nama perusahaan pada dokumen PDF
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3">
          <Checkbox
            id="watermark-enabled"
            checked={enabled}
            onCheckedChange={(checked) => setEnabled(checked === true)}
          />
          <div className="space-y-0.5">
            <Label htmlFor="watermark-enabled" className="cursor-pointer">Aktifkan Watermark</Label>
            <p className="text-sm text-muted-foreground">
              Tampilkan watermark miring berulang di belakang dokumen PDF
            </p>
          </div>
        </div>

        {enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="watermark-text">Teks Watermark</Label>
              <Input
                id="watermark-text"
                placeholder={companySettings?.name || "Nama Perusahaan"}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan untuk menggunakan nama perusahaan
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="watermark-opacity">Transparansi (%)</Label>
              <Input
                id="watermark-opacity"
                type="number"
                min={5}
                max={30}
                value={opacity}
                onChange={(e) => {
                  const val = Math.min(30, Math.max(5, parseInt(e.target.value) || 10))
                  setOpacity(val)
                }}
                className="w-24"
              />
              <p className="text-xs text-muted-foreground">
                Nilai 5-30%. Semakin tinggi nilai, semakin terlihat watermark
              </p>
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="w-40">
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
                Simpan Watermark
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
