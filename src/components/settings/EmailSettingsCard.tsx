import { useState, useEffect } from "react"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IconDeviceFloppy,
  IconCheck,
  IconPlugConnected,
  IconLoader2,
  IconMail,
  IconInfoCircle,
} from "@tabler/icons-react"
import { toast } from "sonner"

interface EmailFormData {
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string
  smtpPassword: string
  senderName: string
  senderEmail: string
  replyToEmail: string
}

const defaultEmailForm: EmailFormData = {
  smtpHost: "",
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: "",
  smtpPassword: "",
  senderName: "",
  senderEmail: "",
  replyToEmail: "",
}

// Preset SMTP configurations
const smtpPresets = {
  gmail: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
  },
  yahoo: {
    host: "smtp.mail.yahoo.com",
    port: 587,
    secure: false,
  },
  outlook: {
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
  },
  custom: {
    host: "",
    port: 587,
    secure: false,
  },
}

export function EmailSettingsCard() {
  const emailSettings = useQuery(api.emailSettings.get)
  const upsertEmailSettings = useMutation(api.emailSettings.upsert)
  const testConnection = useAction(api.emails.testConnection)
  const testConnectionWithStoredPassword = useAction(api.emails.testConnectionWithStoredPassword)

  const [formData, setFormData] = useState<EmailFormData>(defaultEmailForm)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>("custom")

  // Load existing settings
  useEffect(() => {
    if (emailSettings) {
      setFormData({
        smtpHost: emailSettings.smtpHost || "",
        smtpPort: emailSettings.smtpPort || 587,
        smtpSecure: emailSettings.smtpSecure || false,
        smtpUser: emailSettings.smtpUser || "",
        smtpPassword: emailSettings.smtpPassword || "",
        senderName: emailSettings.senderName || "",
        senderEmail: emailSettings.senderEmail || "",
        replyToEmail: emailSettings.replyToEmail || "",
      })

      // Detect preset
      if (emailSettings.smtpHost === "smtp.gmail.com") {
        setSelectedPreset("gmail")
      } else if (emailSettings.smtpHost === "smtp.mail.yahoo.com") {
        setSelectedPreset("yahoo")
      } else if (emailSettings.smtpHost === "smtp-mail.outlook.com") {
        setSelectedPreset("outlook")
      } else {
        setSelectedPreset("custom")
      }
    }
  }, [emailSettings])

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    const config = smtpPresets[preset as keyof typeof smtpPresets]
    if (config) {
      setFormData((prev) => ({
        ...prev,
        smtpHost: config.host,
        smtpPort: config.port,
        smtpSecure: config.secure,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await upsertEmailSettings({
        smtpHost: formData.smtpHost,
        smtpPort: formData.smtpPort,
        smtpSecure: formData.smtpSecure,
        smtpUser: formData.smtpUser,
        smtpPassword: formData.smtpPassword || undefined,
        senderName: formData.senderName,
        senderEmail: formData.senderEmail,
        replyToEmail: formData.replyToEmail || undefined,
      })
      setSaveSuccess(true)
      toast.success("Pengaturan email berhasil disimpan")
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to save email settings:", error)
      toast.error("Gagal menyimpan pengaturan email")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!formData.smtpHost || !formData.smtpUser) {
      toast.error("Lengkapi semua field SMTP untuk menguji koneksi")
      return
    }

    setIsTesting(true)
    try {
      let result;

      // If password is masked (********) or empty, use stored password from database
      if (!formData.smtpPassword || formData.smtpPassword === "********") {
        // Test with stored credentials
        result = await testConnectionWithStoredPassword()
      } else {
        // Test with form data (new password entered)
        result = await testConnection({
          smtpHost: formData.smtpHost,
          smtpPort: formData.smtpPort,
          smtpSecure: formData.smtpSecure,
          smtpUser: formData.smtpUser,
          smtpPassword: formData.smtpPassword,
          senderEmail: formData.senderEmail,
        })
      }

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Failed to test connection:", error)
      toast.error("Gagal menguji koneksi SMTP")
    } finally {
      setIsTesting(false)
    }
  }

  const updateField = <K extends keyof EmailFormData>(field: K, value: EmailFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconMail className="h-5 w-5" />
              Pengaturan Email (SMTP)
            </CardTitle>
            <CardDescription>
              Konfigurasi SMTP untuk mengirim invoice dan dokumen via email
            </CardDescription>
          </div>
          {emailSettings?.testStatus && (
            <Badge
              className={
                emailSettings.testStatus === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {emailSettings.testStatus === "success" ? "Terkoneksi" : "Gagal"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tutorial Accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="tutorial">
            <AccordionTrigger className="text-sm">
              <span className="flex items-center gap-2">
                <IconInfoCircle className="h-4 w-4" />
                Panduan Konfigurasi SMTP
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Gmail</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Buka Google Account &gt; Security</li>
                  <li>Aktifkan 2-Step Verification</li>
                  <li>Buat App Password: Security &gt; App passwords</li>
                  <li>Pilih "Mail" dan "Other (Custom name)"</li>
                  <li>Gunakan password yang dihasilkan sebagai SMTP Password</li>
                </ol>
                <p className="mt-2 text-xs text-blue-600">
                  Host: smtp.gmail.com | Port: 587 | Security: STARTTLS
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Yahoo Mail</h4>
                <ol className="list-decimal list-inside space-y-1 text-purple-700">
                  <li>Buka Yahoo Account Info &gt; Account Security</li>
                  <li>Aktifkan 2-Step Verification</li>
                  <li>Generate App Password</li>
                  <li>Gunakan App Password sebagai SMTP Password</li>
                </ol>
                <p className="mt-2 text-xs text-purple-600">
                  Host: smtp.mail.yahoo.com | Port: 587 | Security: STARTTLS
                </p>
              </div>

              <div className="p-4 bg-cyan-50 rounded-lg">
                <h4 className="font-semibold text-cyan-800 mb-2">Outlook/Microsoft 365</h4>
                <ol className="list-decimal list-inside space-y-1 text-cyan-700">
                  <li>Buka Microsoft Account &gt; Security</li>
                  <li>Aktifkan 2-Step Verification</li>
                  <li>Buat App Password di Advanced Security Options</li>
                  <li>Gunakan App Password sebagai SMTP Password</li>
                </ol>
                <p className="mt-2 text-xs text-cyan-600">
                  Host: smtp-mail.outlook.com | Port: 587 | Security: STARTTLS
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">SMTP Lainnya</h4>
                <p className="text-gray-700">
                  Hubungi provider email Anda untuk mendapatkan konfigurasi SMTP yang benar.
                  Biasanya tersedia di dokumentasi atau panel pengaturan email.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider Preset */}
          <div className="space-y-2">
            <Label>Provider Email</Label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="yahoo">Yahoo Mail</SelectItem>
                <SelectItem value="outlook">Outlook / Microsoft 365</SelectItem>
                <SelectItem value="custom">Custom SMTP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SMTP Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host *</Label>
              <Input
                id="smtpHost"
                placeholder="smtp.gmail.com"
                value={formData.smtpHost}
                onChange={(e) => updateField("smtpHost", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="smtpPort">Port *</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={formData.smtpPort}
                  onChange={(e) => updateField("smtpPort", parseInt(e.target.value) || 587)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpSecure">Security</Label>
                <Select
                  value={formData.smtpSecure ? "ssl" : "starttls"}
                  onValueChange={(v) => updateField("smtpSecure", v === "ssl")}
                >
                  <SelectTrigger id="smtpSecure">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starttls">STARTTLS</SelectItem>
                    <SelectItem value="ssl">SSL/TLS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpUser">Username/Email *</Label>
              <Input
                id="smtpUser"
                type="email"
                placeholder="your-email@gmail.com"
                value={formData.smtpUser}
                onChange={(e) => updateField("smtpUser", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">Password/App Password *</Label>
              <Input
                id="smtpPassword"
                type="password"
                placeholder="••••••••••••••••"
                value={formData.smtpPassword}
                onChange={(e) => updateField("smtpPassword", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Gunakan App Password, bukan password akun biasa
              </p>
            </div>
          </div>

          {/* Sender Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senderName">Nama Pengirim *</Label>
              <Input
                id="senderName"
                placeholder="PT. Contoh Perusahaan"
                value={formData.senderName}
                onChange={(e) => updateField("senderName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderEmail">Email Pengirim *</Label>
              <Input
                id="senderEmail"
                type="email"
                placeholder="invoice@perusahaan.com"
                value={formData.senderEmail}
                onChange={(e) => updateField("senderEmail", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="replyToEmail">Reply-To Email (Opsional)</Label>
            <Input
              id="replyToEmail"
              type="email"
              placeholder="support@perusahaan.com"
              value={formData.replyToEmail}
              onChange={(e) => updateField("replyToEmail", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Email yang akan menerima balasan dari pelanggan
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting || !formData.smtpHost || !formData.smtpUser}
            >
              {isTesting ? (
                <>
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menguji...
                </>
              ) : (
                <>
                  <IconPlugConnected className="h-4 w-4 mr-2" />
                  Test Koneksi
                </>
              )}
            </Button>

            <Button type="submit" disabled={isSaving}>
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
      </CardContent>
    </Card>
  )
}
