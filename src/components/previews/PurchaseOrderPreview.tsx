import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { POFormData } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { statusColors, statusLabels } from "@/lib/types"

interface PurchaseOrderPreviewProps {
  data: POFormData
}

export function PurchaseOrderPreview({ data }: PurchaseOrderPreviewProps) {
  const companySettings = useQuery(api.companySettings.getWithUrls)

  return (
    <div className="bg-white p-4 md:p-8 shadow-lg max-w-full md:max-w-4xl mx-auto" id="po-preview">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 md:mb-8">
        <div className="flex items-start gap-3 md:gap-4">
          {companySettings?.logoUrl && (
            <img
              src={companySettings.logoUrl}
              alt="Company Logo"
              className="max-h-12 md:max-h-16 max-w-24 md:max-w-32 object-contain"
            />
          )}
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-primary mb-1 md:mb-2">PURCHASE ORDER</h1>
            <p className="font-heading text-sm md:text-lg font-semibold">{data.poNumber}</p>
          </div>
        </div>
        <Badge className={statusColors[data.status]}>{statusLabels[data.status]}</Badge>
      </div>

      {/* Company and Vendor Info - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
        {/* From (Buyer) */}
        <div>
          <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-2">DARI (PEMBELI)</h3>
          <p className="font-heading font-semibold text-base md:text-lg">{data.company.name}</p>
          <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-line">{data.company.address}</p>
          {data.company.phone && <p className="text-xs md:text-sm text-muted-foreground">Tel: {data.company.phone}</p>}
          {data.company.email && (
            <p className="text-xs md:text-sm text-muted-foreground">Email: {data.company.email}</p>
          )}
          {data.company.taxId && <p className="text-xs md:text-sm text-muted-foreground">NPWP: {data.company.taxId}</p>}
        </div>

        {/* To (Vendor) */}
        <div>
          <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-2">KEPADA (VENDOR)</h3>
          <p className="font-heading font-semibold text-base md:text-lg">{data.vendor.name}</p>
          <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-line">{data.vendor.address}</p>
          {data.vendor.phone && <p className="text-xs md:text-sm text-muted-foreground">Tel: {data.vendor.phone}</p>}
          {data.vendor.email && <p className="text-xs md:text-sm text-muted-foreground">Email: {data.vendor.email}</p>}
        </div>
      </div>

      {/* Dates - Responsive */}
      <div className="grid grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
        <div>
          <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-1">TANGGAL PO</h3>
          <p className="text-sm md:text-base font-medium">{formatDate(data.date)}</p>
        </div>
        {data.expectedDeliveryDate && (
          <div>
            <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-1">
              TANGGAL PENGIRIMAN
            </h3>
            <p className="text-sm md:text-base font-medium">{formatDate(data.expectedDeliveryDate)}</p>
          </div>
        )}
      </div>

      {/* Shipping Address - Responsive */}
      {data.shippingAddress && (
        <div className="mb-6 md:mb-8 p-3 md:p-4 bg-muted/30 rounded-lg">
          <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-2">ALAMAT PENGIRIMAN</h3>
          <p className="text-sm md:text-base whitespace-pre-line">{data.shippingAddress}</p>
        </div>
      )}

      {/* Items Table - Responsive with horizontal scroll on mobile */}
      <div className="overflow-x-auto mb-6 md:mb-8">
        <table className="w-full min-w-125">
        <thead>
          <tr className="bg-primary text-primary-foreground">
            <th className="text-left py-3 px-3 font-semibold">Deskripsi</th>
            <th className="text-center py-3 px-3 font-semibold w-20">Qty</th>
            <th className="text-right py-3 px-3 font-semibold w-32">Harga Satuan</th>
            <th className="text-right py-3 px-3 font-semibold w-32">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index} className={index % 2 === 1 ? "bg-gray-50" : ""}>
              <td className="py-3 px-3">{item.description}</td>
              <td className="text-center py-3 px-3">{item.quantity}</td>
              <td className="text-right py-3 px-3">{formatCurrency(item.unitPrice)}</td>
              <td className="text-right py-3 px-3">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      {/* Totals - Responsive */}
      <div className="flex justify-end mb-6 md:mb-8">
        <div className="w-full md:w-72">
          <div className="flex justify-between py-2 text-sm md:text-base">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm md:text-base">
            <span className="text-muted-foreground">Pajak ({data.taxRate}%)</span>
            <span>{formatCurrency(data.taxAmount)}</span>
          </div>
          <div className="flex justify-between py-3 border-t-2 border-primary font-bold text-base md:text-lg">
            <span>Total</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>

      {/* Terms - Responsive */}
      {data.terms && (
        <div className="mb-6 md:mb-8 p-3 md:p-4 border rounded-lg">
          <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-2">SYARAT & KETENTUAN</h3>
          <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-line">{data.terms}</p>
        </div>
      )}

      {/* Notes - Responsive */}
      {data.notes && (
        <div className="border-t pt-4 md:pt-6 mb-6 md:mb-8">
          <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-2">CATATAN</h3>
          <p className="text-sm md:text-base text-muted-foreground whitespace-pre-line">{data.notes}</p>
        </div>
      )}

      {/* Signature Section - Responsive */}
      <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        <div className="text-center">
          <div className="relative min-h-20 md:min-h-24 flex items-center justify-center border-b-2 border-dashed mb-2">
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
                className="relative max-h-12 md:max-h-16 max-w-20 md:max-w-24 object-contain z-10"
              />
            )}
          </div>
          <p className="text-sm md:text-base font-medium">Disetujui Oleh</p>
          <p className="text-xs md:text-sm text-muted-foreground">(Pembeli)</p>
        </div>
        <div className="text-center">
          <div className="border-b-2 border-dashed h-20 md:h-24 mb-2"></div>
          <p className="text-sm md:text-base font-medium">Diterima Oleh</p>
          <p className="text-xs md:text-sm text-muted-foreground">(Vendor)</p>
        </div>
      </div>
    </div>
  )
}
