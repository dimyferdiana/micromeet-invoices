import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { InvoiceFormData } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { statusColors, statusLabels } from "@/lib/types"

interface InvoicePreviewProps {
  data: InvoiceFormData
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  const companySettings = useQuery(api.companySettings.getWithUrls)
  const defaultBankAccount = useQuery(api.bankAccounts.getDefault)

  return (
    <div className="bg-white p-8 shadow-lg max-w-4xl mx-auto" id="invoice-preview">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-start gap-4">
          {companySettings?.logoUrl && (
            <img
              src={companySettings.logoUrl}
              alt="Company Logo"
              className="max-h-16 max-w-32 object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">INVOICE</h1>
            <p className="text-lg font-semibold">{data.invoiceNumber}</p>
          </div>
        </div>
        <Badge className={statusColors[data.status]}>{statusLabels[data.status]}</Badge>
      </div>

      {/* Company and Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* From */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">DARI</h3>
          <p className="font-semibold text-lg">{data.company.name}</p>
          <p className="text-muted-foreground whitespace-pre-line">{data.company.address}</p>
          {data.company.phone && <p className="text-muted-foreground">Tel: {data.company.phone}</p>}
          {data.company.email && (
            <p className="text-muted-foreground">Email: {data.company.email}</p>
          )}
          {data.company.taxId && <p className="text-muted-foreground">NPWP: {data.company.taxId}</p>}
        </div>

        {/* To */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">KEPADA</h3>
          <p className="font-semibold text-lg">{data.customer.name}</p>
          <p className="text-muted-foreground whitespace-pre-line">{data.customer.address}</p>
          {data.customer.phone && (
            <p className="text-muted-foreground">Tel: {data.customer.phone}</p>
          )}
          {data.customer.email && (
            <p className="text-muted-foreground">Email: {data.customer.email}</p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">TANGGAL INVOICE</h3>
          <p className="font-medium">{formatDate(data.date)}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">JATUH TEMPO</h3>
          <p className="font-medium">{formatDate(data.dueDate)}</p>
        </div>
      </div>

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

      {/* Bank Account Info */}
      {defaultBankAccount && (
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">INFORMASI PEMBAYARAN</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Bank</p>
              <p className="font-medium">{defaultBankAccount.bankName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nomor Rekening</p>
              <p className="font-medium">{defaultBankAccount.accountNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Atas Nama</p>
              <p className="font-medium">{defaultBankAccount.accountHolder}</p>
            </div>
            {defaultBankAccount.branch && (
              <div>
                <p className="text-sm text-muted-foreground">Cabang</p>
                <p className="font-medium">{defaultBankAccount.branch}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div className="border-t pt-6 mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">CATATAN</h3>
          <p className="text-muted-foreground whitespace-pre-line">{data.notes}</p>
        </div>
      )}

      {/* Signature and Stamp Section */}
      {(companySettings?.signatureUrl || companySettings?.stampUrl) && (
        <div className="flex justify-end mt-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Hormat kami,</p>
            <div className="relative min-h-24 min-w-40 flex items-center justify-center">
              {companySettings?.stampUrl && (
                <img
                  src={companySettings.stampUrl}
                  alt="Company Stamp"
                  className="absolute max-h-24 max-w-32 object-contain opacity-80"
                />
              )}
              {companySettings?.signatureUrl && (
                <img
                  src={companySettings.signatureUrl}
                  alt="Signature"
                  className="relative max-h-16 max-w-28 object-contain z-10"
                />
              )}
            </div>
            <p className="font-medium mt-2">{data.company.name}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
        <p>Terima kasih atas kepercayaan Anda</p>
      </div>
    </div>
  )
}
