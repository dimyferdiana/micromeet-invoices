import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Shared item schema for line items
const lineItemValidator = v.object({
  description: v.string(),
  quantity: v.number(),
  unitPrice: v.number(),
  amount: v.number(),
});

// Company/business info validator
const companyInfoValidator = v.object({
  name: v.string(),
  address: v.string(),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  website: v.optional(v.string()),
  taxId: v.optional(v.string()),
  logo: v.optional(v.string()),
});

// Customer/client info validator
const customerInfoValidator = v.object({
  name: v.string(),
  address: v.string(),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
});

export default defineSchema({
  // Customers table for reusable customer data
  customers: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  // Company settings (single record for business info)
  companySettings: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    taxId: v.optional(v.string()),
    logo: v.optional(v.string()),
    logoFileId: v.optional(v.id("_storage")),
    signatureFileId: v.optional(v.id("_storage")),
    stampFileId: v.optional(v.id("_storage")),
    // Legacy bank fields (kept for backwards compatibility)
    bankName: v.optional(v.string()),
    bankAccount: v.optional(v.string()),
    bankAccountName: v.optional(v.string()),
    // Watermark settings
    watermarkEnabled: v.optional(v.boolean()),
    watermarkText: v.optional(v.string()), // Custom text, defaults to company name
    watermarkOpacity: v.optional(v.number()), // 0-100, defaults to 10
  }),

  // Bank accounts for multiple bank account support
  bankAccounts: defineTable({
    bankName: v.string(),
    accountNumber: v.string(),
    accountHolder: v.string(),
    branch: v.optional(v.string()),
    swiftCode: v.optional(v.string()),
    isDefault: v.boolean(),
    createdAt: v.number(),
  }).index("by_default", ["isDefault"]),

  // Invoices table
  invoices: defineTable({
    invoiceNumber: v.string(),
    date: v.string(),
    dueDate: v.string(),
    company: companyInfoValidator,
    customer: customerInfoValidator,
    items: v.array(lineItemValidator),
    subtotal: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    total: v.number(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()), // Soft delete timestamp
  })
    .index("by_number", ["invoiceNumber"])
    .index("by_status", ["status"])
    .index("by_date", ["date"])
    .index("by_deleted", ["deletedAt"]),

  // Purchase Orders table
  purchaseOrders: defineTable({
    poNumber: v.string(),
    date: v.string(),
    expectedDeliveryDate: v.optional(v.string()),
    company: companyInfoValidator,
    vendor: customerInfoValidator,
    items: v.array(lineItemValidator),
    subtotal: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    total: v.number(),
    shippingAddress: v.optional(v.string()),
    notes: v.optional(v.string()),
    terms: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("confirmed"),
      v.literal("received"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()), // Soft delete timestamp
  })
    .index("by_number", ["poNumber"])
    .index("by_status", ["status"])
    .index("by_date", ["date"])
    .index("by_deleted", ["deletedAt"]),

  // Receipts (Kwitansi) table
  receipts: defineTable({
    receiptNumber: v.string(),
    date: v.string(),
    company: companyInfoValidator,
    mode: v.optional(v.union(v.literal("receive"), v.literal("send"))), // "receive" = company receives money (default), "send" = company sends money
    receivedFrom: v.string(), // In "send" mode, this is the recipient name
    amount: v.number(),
    amountInWords: v.string(),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("transfer"),
      v.literal("check"),
      v.literal("other")
    ),
    paymentFor: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()), // Soft delete timestamp
  })
    .index("by_number", ["receiptNumber"])
    .index("by_date", ["date"])
    .index("by_deleted", ["deletedAt"]),

  // Document counter for auto-generating numbers
  documentCounters: defineTable({
    type: v.union(
      v.literal("invoice"),
      v.literal("purchaseOrder"),
      v.literal("receipt")
    ),
    prefix: v.string(),
    lastNumber: v.number(),
    year: v.number(),
  }).index("by_type_year", ["type", "year"]),

  // Email settings (SMTP configuration)
  emailSettings: defineTable({
    smtpHost: v.string(),
    smtpPort: v.number(),
    smtpSecure: v.boolean(), // true for SSL/TLS
    smtpUser: v.string(),
    smtpPassword: v.string(), // encrypted in production
    senderName: v.string(),
    senderEmail: v.string(),
    replyToEmail: v.optional(v.string()),
    isConfigured: v.boolean(),
    lastTestedAt: v.optional(v.number()),
    testStatus: v.optional(v.union(v.literal("success"), v.literal("failed"))),
    // Email template settings
    emailHeaderColor: v.optional(v.string()), // Primary color for email header
    emailFooterText: v.optional(v.string()), // Custom footer text
    includePaymentInfo: v.optional(v.boolean()), // Include bank account info in email
    // Auto-reminder settings
    reminderEnabled: v.optional(v.boolean()), // Enable auto-reminders (default: false)
    reminderDaysBeforeDue: v.optional(v.number()), // Days before due date to send reminder
    reminderDaysAfterDue: v.optional(v.number()), // Days after due date for overdue reminder
    reminderSubject: v.optional(v.string()), // Custom reminder email subject
    reminderMessage: v.optional(v.string()), // Custom reminder email message
  }),

  // Email logs for tracking sent emails
  emailLogs: defineTable({
    documentType: v.union(
      v.literal("invoice"),
      v.literal("purchaseOrder"),
      v.literal("receipt")
    ),
    documentId: v.string(),
    documentNumber: v.string(),
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),
    subject: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
    sentAt: v.number(),
  })
    .index("by_document", ["documentType", "documentId"])
    .index("by_status", ["status"]),
});
