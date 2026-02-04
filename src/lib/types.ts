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

// Receipt mode: receive (company receives money) or send (company sends money)
export type ReceiptMode = "receive" | "send"

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
  terms?: string
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
  mode: ReceiptMode // "receive" = company receives money, "send" = company sends money
  receivedFrom: string // In "send" mode, this becomes "sendTo" (recipient name)
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

// Receipt mode labels
export const receiptModeLabels: Record<ReceiptMode, string> = {
  receive: "Terima Uang",
  send: "Kirim Uang",
}

// Bank account information
export interface BankAccount {
  _id: string
  bankName: string
  accountNumber: string
  accountHolder: string
  branch?: string
  swiftCode?: string
  isDefault: boolean
  createdAt: number
}

// Company settings with branding
export interface CompanySettings {
  _id: string
  name: string
  address: string
  phone?: string
  email?: string
  website?: string
  taxId?: string
  logo?: string
  logoFileId?: string
  signatureFileId?: string
  stampFileId?: string
  // Watermark settings
  watermarkEnabled?: boolean
  watermarkText?: string
  watermarkOpacity?: number
}

// Email settings (SMTP configuration)
export interface EmailSettings {
  _id: string
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string
  smtpPassword: string // Masked in UI
  senderName: string
  senderEmail: string
  replyToEmail?: string
  isConfigured: boolean
  lastTestedAt?: number
  testStatus?: "success" | "failed"
}

// Email log entry
export interface EmailLog {
  _id: string
  documentType: DocumentType
  documentId: string
  documentNumber: string
  recipientEmail: string
  recipientName?: string
  subject: string
  status: "pending" | "sent" | "failed"
  errorMessage?: string
  sentAt: number
}

// Email status labels
export const emailStatusLabels: Record<string, string> = {
  pending: "Menunggu",
  sent: "Terkirim",
  failed: "Gagal",
}

// Email status colors
export const emailStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
}
