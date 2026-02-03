import type { POFormData } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { statusColors, statusLabels } from "@/lib/types"

interface PurchaseOrderPreviewProps {
  data: POFormData
}

export function PurchaseOrderPreview({ data }: PurchaseOrderPreviewProps) {
  return (
    <div className="bg-white p-8 shadow-lg max-w-4xl mx-auto" id="po-preview">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">PURCHASE ORDER</h1>
          <p className="text-lg font-semibold">{data.poNumber}</p>
        </div>
        <Badge className={statusColors[data.status]}>{statusLabels[data.status]}</Badge>
      </div>

      {/* Company and Vendor Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* From (Buyer) */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">DARI (PEMBELI)</h3>
          <p className="font-semibold text-lg">{data.company.name}</p>
          <p className="text-muted-foreground whitespace-pre-line">{data.company.address}</p>
          {data.company.phone && <p className="text-muted-foreground">Tel: {data.company.phone}</p>}
          {data.company.email && (
            <p className="text-muted-foreground">Email: {data.company.email}</p>
          )}
          {data.company.taxId && <p className="text-muted-foreground">NPWP: {data.company.taxId}</p>}
        </div>

        {/* To (Vendor) */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">KEPADA (VENDOR)</h3>
          <p className="font-semibold text-lg">{data.vendor.name}</p>
          <p className="text-muted-foreground whitespace-pre-line">{data.vendor.address}</p>
          {data.vendor.phone && <p className="text-muted-foreground">Tel: {data.vendor.phone}</p>}
          {data.vendor.email && <p className="text-muted-foreground">Email: {data.vendor.email}</p>}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">TANGGAL PO</h3>
          <p className="font-medium">{formatDate(data.date)}</p>
        </div>
        {data.expectedDeliveryDate && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">
              TANGGAL PENGIRIMAN
            </h3>
            <p className="font-medium">{formatDate(data.expectedDeliveryDate)}</p>
          </div>
        )}
      </div>

      {/* Shipping Address */}
      {data.shippingAddress && (
        <div className="mb-8 p-4 bg-muted/30 rounded-lg">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">ALAMAT PENGIRIMAN</h3>
          <p className="whitespace-pre-line">{data.shippingAddress}</p>
        </div>
      )}

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-primary">
            <th className="text-left py-3 font-semibold">Deskripsi</th>
            <th className="text-center py-3 font-semibold w-20">Qty</th>
            <th className="text-right py-3 font-semibold w-32">Harga Satuan</th>
            <th className="text-right py-3 font-semibold w-32">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-3">{item.description}</td>
              <td className="text-center py-3">{item.quantity}</td>
              <td className="text-right py-3">{formatCurrency(item.unitPrice)}</td>
              <td className="text-right py-3">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-72">
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Pajak ({data.taxRate}%)</span>
            <span>{formatCurrency(data.taxAmount)}</span>
          </div>
          <div className="flex justify-between py-3 border-t-2 border-primary font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      {data.terms && (
        <div className="mb-8 p-4 border rounded-lg">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">SYARAT & KETENTUAN</h3>
          <p className="text-muted-foreground whitespace-pre-line text-sm">{data.terms}</p>
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">CATATAN</h3>
          <p className="text-muted-foreground whitespace-pre-line">{data.notes}</p>
        </div>
      )}

      {/* Signature Section */}
      <div className="mt-12 grid grid-cols-2 gap-8">
        <div className="text-center">
          <div className="border-b-2 border-dashed h-20 mb-2"></div>
          <p className="font-medium">Disetujui Oleh</p>
          <p className="text-sm text-muted-foreground">(Pembeli)</p>
        </div>
        <div className="text-center">
          <div className="border-b-2 border-dashed h-20 mb-2"></div>
          <p className="font-medium">Diterima Oleh</p>
          <p className="text-sm text-muted-foreground">(Vendor)</p>
        </div>
      </div>
    </div>
  )
}
