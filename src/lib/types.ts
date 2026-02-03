// Line item for invoices and purchase orders
export interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

// Company information
export interface CompanyInfo {
  name: string
  address: string
  phone?: string
  email?: string
  website?: string
  taxId?: string
  logo?: string
}

// Customer/Client information
export interface CustomerInfo {
  name: string
  address: string
  phone?: string
  email?: string
}

// Invoice status
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"

// Purchase Order status
export type POStatus = "draft" | "sent" | "confirmed" | "received" | "cancelled"

// Payment method for receipts
export type PaymentMethod = "cash" | "transfer" | "check" | "other"

// Document types
export type DocumentType = "invoice" | "purchaseOrder" | "receipt"

// Invoice form data
export interface InvoiceFormData {
  invoiceNumber: string
  date: string
  dueDate: string
  company: CompanyInfo
  customer: CustomerInfo
  items: LineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes?: string
  status: InvoiceStatus
}

// Purchase Order form data
export interface POFormData {
  poNumber: string
  date: string
  expectedDeliveryDate?: string
  company: CompanyInfo
  vendor: CustomerInfo
  items: LineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  shippingAddress?: string
  notes?: string
  terms?: string
  status: POStatus
}

// Receipt form data
export interface ReceiptFormData {
  receiptNumber: string
  date: string
  company: CompanyInfo
  receivedFrom: string
  amount: number
  amountInWords: string
  paymentMethod: PaymentMethod
  paymentFor: string
  notes?: string
}

// Status badge colors
export const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-300 text-gray-600",
  confirmed: "bg-purple-100 text-purple-800",
  received: "bg-green-100 text-green-800",
}

// Status labels in Indonesian
export const statusLabels: Record<string, string> = {
  draft: "Draft",
  sent: "Terkirim",
  paid: "Lunas",
  overdue: "Jatuh Tempo",
  cancelled: "Dibatalkan",
  confirmed: "Dikonfirmasi",
  received: "Diterima",
}

// Payment method labels
export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Tunai",
  transfer: "Transfer Bank",
  check: "Cek/Giro",
  other: "Lainnya",
}
