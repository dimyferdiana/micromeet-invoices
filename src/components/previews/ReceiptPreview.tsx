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
      {/* Header */}
      <div className="text-center mb-8 border-b pb-6">
        {companySettings?.logoUrl && (
          <img
            src={companySettings.logoUrl}
            alt="Company Logo"
            className="max-h-16 max-w-32 object-contain mx-auto mb-4"
          />
        )}
        <h1 className="text-3xl font-bold text-primary mb-2">KWITANSI</h1>
        <p className="text-lg font-semibold">{data.receiptNumber}</p>
      </div>

      {/* Company Info */}
      <div className="text-center mb-8">
        <p className="font-bold text-xl">{data.company.name}</p>
        <p className="text-muted-foreground whitespace-pre-line">{data.company.address}</p>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground mt-1">
          {data.company.phone && <span>Tel: {data.company.phone}</span>}
          {data.company.email && <span>Email: {data.company.email}</span>}
        </div>
      </div>

      {/* Receipt Details */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-[140px_1fr] gap-2">
          <span className="font-semibold">Tanggal</span>
          <span>: {formatDate(data.date)}</span>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-2">
          <span className="font-semibold">Diterima Dari</span>
          <span>: {data.receivedFrom}</span>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
          <span className="font-semibold">Jumlah Uang</span>
          <div>
            <span className="text-2xl font-bold text-primary">: {formatCurrency(data.amount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-2">
          <span className="font-semibold">Terbilang</span>
          <span className="italic">: {data.amountInWords}</span>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-2">
          <span className="font-semibold">Metode Bayar</span>
          <span>: {paymentMethodLabels[data.paymentMethod]}</span>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-2">
          <span className="font-semibold">Untuk Pembayaran</span>
          <span className="whitespace-pre-line">: {data.paymentFor}</span>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mb-8 p-4 bg-muted/30 rounded-lg">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Catatan</h3>
          <p className="text-muted-foreground whitespace-pre-line text-sm">{data.notes}</p>
        </div>
      )}

      {/* Signature Section */}
      <div className="mt-12 flex justify-end">
        <div className="text-center w-48">
          <p className="text-sm text-muted-foreground mb-4">
            {data.company.address?.split(",")[0] || ""},<br />
            {formatDate(data.date)}
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
            <div className="border-b-2 border-dashed h-16 mb-2"></div>
          )}
          <p className="font-medium">Penerima</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
        <p>Kwitansi ini sah sebagai bukti pembayaran</p>
      </div>
    </div>
  )
}
