import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { ReceiptFormData } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { paymentMethodLabels } from "@/lib/types"

interface ReceiptPreviewProps {
  data: ReceiptFormData
}

export function ReceiptPreview({ data }: ReceiptPreviewProps) {
  const companySettings = useQuery(api.companySettings.getWithUrls)

  return (
    <div className="bg-white p-8 shadow-lg max-w-2xl mx-auto" id="receipt-preview">
      {/* Header - Logo and Title side by side, Date on right */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start gap-4">
          {companySettings?.logoUrl && (
            <img
              src={companySettings.logoUrl}
              alt="Company Logo"
              className="max-h-16 max-w-32 object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-primary">KWITANSI</h1>
            <p className="text-lg font-semibold mt-1">{data.receiptNumber}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{formatDate(data.date)}</p>
      </div>

      {/* Company Info */}
      <div className="mb-6">
        <p className="font-bold text-lg">{data.company.name}</p>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{data.company.address}</p>
        {data.company.phone && (
          <p className="text-sm text-muted-foreground">Tel: {data.company.phone}</p>
        )}
      </div>

      {/* Receipt Content Box - matches PDF gray box */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-1">
            {data.mode === "send" ? "Sudah kirim kepada:" : "Sudah terima dari:"}
          </p>
          <p className="text-xl font-bold">{data.receivedFrom}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-1">Uang sejumlah:</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(data.amount)}</p>
        </div>

        <p className="text-sm font-semibold italic">({data.amountInWords})</p>
      </div>

      {/* Payment Details */}
      <div className="space-y-4 mb-6">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Untuk Pembayaran</h3>
          <p className="whitespace-pre-line">{data.paymentFor}</p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Metode Pembayaran</h3>
          <p>{paymentMethodLabels[data.paymentMethod]}</p>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Catatan</h3>
          <p className="text-muted-foreground whitespace-pre-line text-sm">{data.notes}</p>
        </div>
      )}

      {/* Signature Section - Right aligned like PDF */}
      <div className="flex justify-end mt-10">
        <div className="w-44 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {data.mode === "send" ? "Pengirim," : "Penerima,"}
          </p>
          <div className="relative min-h-20 flex items-center justify-center mb-2">
            {companySettings?.stampUrl && (
              <img
                src={companySettings.stampUrl}
                alt="Company Stamp"
                className="absolute max-h-20 max-w-28 object-contain opacity-80"
              />
            )}
            {companySettings?.signatureUrl && (
              <img
                src={companySettings.signatureUrl}
                alt="Signature"
                className="relative max-h-14 max-w-24 object-contain z-10"
              />
            )}
          </div>
          {!(companySettings?.signatureUrl || companySettings?.stampUrl) && (
            <div className="border-b-2 border-gray-300 h-16 mb-2"></div>
          )}
          <p className="text-sm">{data.company.name}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
        <p>Kwitansi ini sah sebagai bukti pembayaran</p>
      </div>
    </div>
  )
}
