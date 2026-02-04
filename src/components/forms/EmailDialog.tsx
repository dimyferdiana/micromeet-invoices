import { useState, useEffect } from "react"
import { useQuery, useAction } from "convex/react"
import { api } from "../../../convex/_generated/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { IconSend, IconLoader2, IconMail, IconAlertCircle, IconPaperclip } from "@tabler/icons-react"
import { toast } from "sonner"
import type { DocumentType, InvoiceFormData, POFormData, ReceiptFormData } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { emailStatusLabels, emailStatusColors } from "@/lib/types"
import { generateInvoicePdfBase64, generatePOPdfBase64, generateReceiptPdfBase64 } from "@/lib/pdf"

interface EmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentType: DocumentType
  documentId: string
  documentNumber: string
  recipientEmail?: string
  recipientName?: string
  total: number
  dueDate?: string
  companyName: string
  /** Invoice data for PDF generation */
  invoiceData?: InvoiceFormData
  /** Purchase Order data for PDF generation */
  poData?: POFormData
  /** Receipt data for PDF generation */
  receiptData?: ReceiptFormData
  /** Bank account for PDF (only for invoices) */
  bankAccount?: {
    bankName: string
    accountNumber: string
    accountHolder: string
    branch?: string
  }
  /** Company logo URL for PDF */
  logoUrl?: string
  /** Watermark settings for PDF */
  watermark?: {
    enabled: boolean
    text?: string
    opacity?: number
  }
}

export function EmailDialog({
  open,
  onOpenChange,
  documentType,
  documentId,
  documentNumber,
  recipientEmail = "",
  recipientName = "",
  total,
  dueDate,
  companyName,
  invoiceData,
  poData,
  receiptData,
  bankAccount,
  logoUrl,
  watermark,
}: EmailDialogProps) {
  const emailSettings = useQuery(api.emailSettings.get)
  const emailLogs = useQuery(api.emailLogs.getLogsForDocument, {
    documentType,
    documentId,
  })
  const sendEmail = useAction(api.emails.sendEmail)

  const [isSending, setIsSending] = useState(false)
  const [toEmail, setToEmail] = useState(recipientEmail)
  const [toName, setToName] = useState(recipientName)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  // Document type labels
  const documentTypeLabels: Record<DocumentType, string> = {
    invoice: "Invoice",
    purchaseOrder: "Purchase Order",
    receipt: "Kwitansi",
  }

  // Generate default subject and message
  useEffect(() => {
    if (open) {
      setToEmail(recipientEmail)
      setToName(recipientName)

      const docTypeLabel = documentTypeLabels[documentType]

      setSubject(`${docTypeLabel} ${documentNumber} dari ${companyName}`)

      let defaultMessage = `Yth. ${recipientName || "Bapak/Ibu"},\n\n`
      defaultMessage += `Bersama email ini kami kirimkan ${docTypeLabel} dengan nomor ${documentNumber}.\n\n`

      if (documentType === "invoice" && dueDate) {
        defaultMessage += `Total: ${formatCurrency(total)}\n`
        defaultMessage += `Jatuh Tempo: ${formatDate(dueDate)}\n\n`
        defaultMessage += `Mohon untuk melakukan pembayaran sebelum tanggal jatuh tempo.\n\n`
      } else {
        defaultMessage += `Total: ${formatCurrency(total)}\n\n`
      }

      defaultMessage += `Jika ada pertanyaan, silakan hubungi kami.\n\n`
      defaultMessage += `Terima kasih atas kepercayaan Anda.\n\n`
      defaultMessage += `Hormat kami,\n${companyName}`

      setMessage(defaultMessage)
    }
  }, [open, recipientEmail, recipientName, documentType, documentNumber, total, dueDate, companyName])

  const handleSend = async () => {
    if (!toEmail) {
      toast.error("Email penerima harus diisi")
      return
    }

    if (!emailSettings?.isConfigured) {
      toast.error("SMTP belum dikonfigurasi. Silakan atur di Pengaturan.")
      return
    }

    setIsSending(true)

    try {
      // Generate PDF based on document type
      let pdfBase64: string | undefined
      let pdfFilename: string | undefined

      try {
        toast.info("Membuat PDF...")
        if (invoiceData && documentType === "invoice") {
          pdfBase64 = await generateInvoicePdfBase64(invoiceData, bankAccount, logoUrl, watermark)
          pdfFilename = `${documentNumber}.pdf`
        } else if (poData && documentType === "purchaseOrder") {
          pdfBase64 = await generatePOPdfBase64(poData, logoUrl, watermark)
          pdfFilename = `${documentNumber}.pdf`
        } else if (receiptData && documentType === "receipt") {
          pdfBase64 = await generateReceiptPdfBase64(receiptData, logoUrl, watermark)
          pdfFilename = `${documentNumber}.pdf`
        }
      } catch (pdfError) {
        console.error("Failed to generate PDF:", pdfError)
        toast.warning("Gagal membuat PDF, email akan dikirim tanpa lampiran")
      }

      // Convert message to HTML (simple formatting)
      const htmlMessage = message
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br>")

      const attachmentNote = pdfBase64
        ? `<p style="color: #666; font-size: 12px; margin-top: 20px;">📎 Dokumen ${documentNumber}.pdf terlampir pada email ini.</p>`
        : ""

      // Get template settings from email settings
      const headerColor = emailSettings?.emailHeaderColor || "#4F46E5"
      const footerText = emailSettings?.emailFooterText || "Email ini dikirim secara otomatis."
      const includePayment = emailSettings?.includePaymentInfo ?? true

      // Build payment info section if enabled and bank account exists
      let paymentInfoHtml = ""
      if (includePayment && bankAccount) {
        paymentInfoHtml = `
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="font-weight: bold; margin-bottom: 8px; color: #374151;">Informasi Pembayaran:</p>
            <p style="margin: 4px 0; color: #4b5563;">Bank: ${bankAccount.bankName}</p>
            <p style="margin: 4px 0; color: #4b5563;">No. Rekening: ${bankAccount.accountNumber}</p>
            <p style="margin: 4px 0; color: #4b5563;">Atas Nama: ${bankAccount.accountHolder}</p>
            ${bankAccount.branch ? `<p style="margin: 4px 0; color: #4b5563;">Cabang: ${bankAccount.branch}</p>` : ""}
          </div>
        `
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${headerColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="margin: 0;">${companyName}</h2>
          </div>
          <div style="padding: 24px; background: white; border: 1px solid #e5e7eb; border-top: none;">
            <p>${htmlMessage}</p>
            ${paymentInfoHtml}
            ${attachmentNote}
          </div>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
              ${footerText}
            </p>
          </div>
        </div>
      `

      await sendEmail({
        to: toEmail,
        toName: toName || undefined,
        subject,
        html,
        documentType,
        documentId,
        documentNumber,
        pdfBase64,
        pdfFilename,
      })

      toast.success("Email berhasil dikirim!")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to send email:", error)
      toast.error(error instanceof Error ? error.message : "Gagal mengirim email")
    } finally {
      setIsSending(false)
    }
  }

  const isConfigured = emailSettings?.isConfigured

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconMail className="h-5 w-5" />
            Kirim {documentTypeLabels[documentType]} via Email
          </DialogTitle>
          <DialogDescription>
            Kirim {documentNumber} ke pelanggan via email
          </DialogDescription>
        </DialogHeader>

        {!isConfigured ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <IconAlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">SMTP Belum Dikonfigurasi</h3>
            <p className="text-muted-foreground mb-4">
              Anda perlu mengatur konfigurasi SMTP di halaman Pengaturan sebelum dapat mengirim email.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="toEmail">Email Penerima *</Label>
                  <Input
                    id="toEmail"
                    type="email"
                    placeholder="pelanggan@email.com"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toName">Nama Penerima</Label>
                  <Input
                    id="toName"
                    placeholder="Nama Pelanggan"
                    value={toName}
                    onChange={(e) => setToName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subjek Email *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Pesan</Label>
                <Textarea
                  id="message"
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="max-h-48 overflow-y-auto resize-y"
                />
              </div>

              {/* PDF Attachment Indicator */}
              {((invoiceData && documentType === "invoice") ||
                (poData && documentType === "purchaseOrder") ||
                (receiptData && documentType === "receipt")) && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <IconPaperclip className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    PDF akan dilampirkan: <strong>{documentNumber}.pdf</strong>
                  </span>
                </div>
              )}

              {/* Email History */}
              {emailLogs && emailLogs.length > 0 && (
                <div className="border-t pt-4">
                  <Label className="mb-2 block">Riwayat Pengiriman</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {emailLogs.map((log) => (
                      <div
                        key={log._id}
                        className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                      >
                        <div>
                          <span className="font-medium">{log.recipientEmail}</span>
                          <span className="text-muted-foreground ml-2">
                            {formatDate(new Date(log.sentAt).toISOString().split("T")[0])}
                          </span>
                        </div>
                        <Badge className={emailStatusColors[log.status]}>
                          {emailStatusLabels[log.status]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button onClick={handleSend} disabled={isSending || !toEmail || !subject}>
                {isSending ? (
                  <>
                    <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <IconSend className="h-4 w-4 mr-2" />
                    Kirim Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
