import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { IconDeviceFloppy, IconCheck, IconBell, IconAlertTriangle } from "@tabler/icons-react"
import { toast } from "sonner"

export function ReminderSettingsCard() {
  const emailSettings = useQuery(api.emailSettings.get)
  const updateReminder = useMutation(api.emailSettings.updateReminder)

  const [enabled, setEnabled] = useState(false)
  const [daysBeforeDue, setDaysBeforeDue] = useState(3)
  const [daysAfterDue, setDaysAfterDue] = useState(1)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load existing settings
  useEffect(() => {
    if (emailSettings) {
      setEnabled(emailSettings.reminderEnabled || false)
      setDaysBeforeDue(emailSettings.reminderDaysBeforeDue ?? 3)
      setDaysAfterDue(emailSettings.reminderDaysAfterDue ?? 1)
      setSubject(emailSettings.reminderSubject || "")
      setMessage(emailSettings.reminderMessage || "")
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
      await updateReminder({
        reminderEnabled: enabled,
        reminderDaysBeforeDue: daysBeforeDue,
        reminderDaysAfterDue: daysAfterDue,
        reminderSubject: subject || undefined,
        reminderMessage: message || undefined,
      })
      setSaveSuccess(true)
      toast.success("Pengaturan reminder berhasil disimpan")
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to save reminder settings:", error)
      toast.error("Gagal menyimpan pengaturan reminder")
    } finally {
      setIsSaving(false)
    }
  }

  const isDisabled = !emailSettings?.isConfigured

  const defaultSubject = "Pengingat: Invoice {invoiceNumber} akan jatuh tempo"
  const defaultMessage = `Yth. {customerName},

Ini adalah pengingat bahwa invoice {invoiceNumber} dengan total {total} akan jatuh tempo pada {dueDate}.

Mohon untuk segera melakukan pembayaran sebelum tanggal jatuh tempo.

Terima kasih.`

  return (
    <Card className={isDisabled ? "opacity-60" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconBell className="h-5 w-5" />
          Auto-Reminder Invoice
        </CardTitle>
        <CardDescription>
          Kirim email pengingat otomatis untuk invoice yang akan jatuh tempo atau sudah jatuh tempo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isDisabled && (
          <p className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg">
            Konfigurasi SMTP terlebih dahulu untuk mengatur auto-reminder.
          </p>
        )}

        <div className="flex items-center gap-3">
          <Checkbox
            id="reminder-enabled"
            checked={enabled}
            onCheckedChange={(checked) => setEnabled(checked === true)}
            disabled={isDisabled}
          />
          <div className="space-y-0.5">
            <Label htmlFor="reminder-enabled" className="cursor-pointer">
              Aktifkan Auto-Reminder
            </Label>
            <p className="text-sm text-muted-foreground">
              Sistem akan otomatis mengirim email pengingat ke pelanggan
            </p>
          </div>
        </div>

        {enabled && (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2">
                <IconAlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Catatan Penting</p>
                  <p className="mt-1">
                    Auto-reminder akan berjalan setiap hari pada pukul 08:00 WIB.
                    Email hanya akan dikirim ke invoice dengan status "Terkirim" (sent) atau "Jatuh Tempo" (overdue).
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daysBeforeDue">Hari Sebelum Jatuh Tempo</Label>
                <Input
                  id="daysBeforeDue"
                  type="number"
                  min={0}
                  max={30}
                  value={daysBeforeDue}
                  onChange={(e) => setDaysBeforeDue(parseInt(e.target.value) || 0)}
                  disabled={isDisabled}
                />
                <p className="text-xs text-muted-foreground">
                  Kirim pengingat X hari sebelum jatuh tempo
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="daysAfterDue">Hari Setelah Jatuh Tempo</Label>
                <Input
                  id="daysAfterDue"
                  type="number"
                  min={0}
                  max={30}
                  value={daysAfterDue}
                  onChange={(e) => setDaysAfterDue(parseInt(e.target.value) || 0)}
                  disabled={isDisabled}
                />
                <p className="text-xs text-muted-foreground">
                  Kirim pengingat X hari setelah jatuh tempo
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-subject">Subjek Email (Opsional)</Label>
              <Input
                id="reminder-subject"
                placeholder={defaultSubject}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isDisabled}
              />
              <p className="text-xs text-muted-foreground">
                Variabel: {"{invoiceNumber}"}, {"{customerName}"}, {"{total}"}, {"{dueDate}"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-message">Pesan Pengingat (Opsional)</Label>
              <Textarea
                id="reminder-message"
                placeholder={defaultMessage}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                disabled={isDisabled}
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan untuk menggunakan template default. Variabel yang tersedia: {"{invoiceNumber}"}, {"{customerName}"}, {"{total}"}, {"{dueDate}"}, {"{companyName}"}
              </p>
            </div>
          </>
        )}

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
                Simpan Reminder
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
