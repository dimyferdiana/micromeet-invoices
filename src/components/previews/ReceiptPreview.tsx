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
    <div className="bg-white p-4 md:p-8 shadow-lg max-w-full md:max-w-2xl mx-auto" id="receipt-preview">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex items-start gap-3 md:gap-4">
          {companySettings?.logoUrl && (
            <img
              src={companySettings.logoUrl}
              alt="Company Logo"
              className="max-h-12 md:max-h-16 max-w-24 md:max-w-32 object-contain"
            />
          )}
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-primary">KWITANSI</h1>
            <p className="font-heading text-sm md:text-lg font-semibold mt-1">{data.receiptNumber}</p>
          </div>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground">{formatDate(data.date)}</p>
      </div>

      {/* Company Info - Responsive */}
      <div className="mb-4 md:mb-6">
        <p className="font-heading font-bold text-base md:text-lg">{data.company.name}</p>
        <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-line">{data.company.address}</p>
        {data.company.phone && (
          <p className="text-xs md:text-sm text-muted-foreground">Tel: {data.company.phone}</p>
        )}
      </div>

      {/* Receipt Content Box - Responsive */}
      <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
        <div className="mb-3 md:mb-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            {data.mode === "send" ? "Sudah kirim kepada:" : "Sudah terima dari:"}
          </p>
          <p className="font-heading text-lg md:text-xl font-bold">{data.receivedFrom}</p>
        </div>

        <div className="mb-3 md:mb-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Uang sejumlah:</p>
          <p className="font-heading text-xl md:text-2xl font-bold text-primary">{formatCurrency(data.amount)}</p>
        </div>

        <p className="text-xs md:text-sm font-semibold italic">({data.amountInWords})</p>
      </div>

      {/* Payment Details - Responsive */}
      <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Untuk Pembayaran</h3>
          <p className="text-sm md:text-base whitespace-pre-line">{data.paymentFor}</p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Metode Pembayaran</h3>
          <p className="text-sm md:text-base">{paymentMethodLabels[data.paymentMethod]}</p>
        </div>
      </div>

      {/* Notes - Responsive */}
      {data.notes && (
        <div className="mb-4 md:mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Catatan</h3>
          <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-line">{data.notes}</p>
        </div>
      )}

      {/* Signature Section - Responsive */}
      <div className="flex justify-end mt-8 md:mt-10">
        <div className="w-40 md:w-44 text-center">
          <p className="text-xs md:text-sm text-muted-foreground mb-2">
            {data.mode === "send" ? "Pengirim," : "Penerima,"}
          </p>
          <div className="relative min-h-16 md:min-h-20 flex items-center justify-center mb-2">
            {companySettings?.stampUrl && (
              <img
                src={companySettings.stampUrl}
                alt="Company Stamp"
                className="absolute max-h-16 md:max-h-20 max-w-24 md:max-w-28 object-contain opacity-80"
              />
            )}
            {companySettings?.signatureUrl && (
              <img
                src={companySettings.signatureUrl}
                alt="Signature"
                className="relative max-h-12 md:max-h-14 max-w-20 md:max-w-24 object-contain z-10"
              />
            )}
          </div>
          {!(companySettings?.signatureUrl || companySettings?.stampUrl) && (
            <div className="border-b-2 border-gray-300 h-12 md:h-16 mb-2"></div>
          )}
          <p className="text-xs md:text-sm">{data.company.name}</p>
        </div>
      </div>

      {/* Footer - Responsive */}
      <div className="mt-6 md:mt-8 pt-3 md:pt-4 border-t text-center text-xs text-muted-foreground">
        <p>Kwitansi ini sah sebagai bukti pembayaran</p>
      </div>
    </div>
  )
}
