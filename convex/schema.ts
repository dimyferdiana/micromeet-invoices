import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

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
  // ========================
  // AUTH TABLES (from Convex Auth)
  // ========================
  ...authTables,

  // ========================
  // ORGANIZATION TABLES
  // ========================

  // Organizations table
  organizations: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }),

  // Organization members (many-to-many relationship)
  organizationMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_org_user", ["organizationId", "userId"]),

  // Invitations for joining organizations
  invitations: defineTable({
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
    invitedBy: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired")),
  })
    .index("by_token", ["token"])
    .index("by_org", ["organizationId"])
    .index("by_email", ["email"]),

  // Password reset tokens
  passwordResetTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  // Migration flag to track if existing data has been migrated
  migrations: defineTable({
    name: v.string(),
    completedAt: v.number(),
  }).index("by_name", ["name"]),

  // ========================
  // BUSINESS DATA TABLES
  // ========================

  // Customers table for reusable customer data
  customers: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    // Organization scoping (optional for backwards compatibility)
    organizationId: v.optional(v.id("organizations")),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_name", ["name"])
    .index("by_org", ["organizationId"]),

  // Company settings (per organization)
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
    watermarkText: v.optional(v.string()),
    watermarkOpacity: v.optional(v.number()),
    // Organization scoping (optional for backwards compatibility)
    organizationId: v.optional(v.id("organizations")),
  }).index("by_org", ["organizationId"]),

  // Bank accounts for multiple bank account support
  bankAccounts: defineTable({
    bankName: v.string(),
    accountNumber: v.string(),
    accountHolder: v.string(),
    branch: v.optional(v.string()),
    swiftCode: v.optional(v.string()),
    isDefault: v.boolean(),
    createdAt: v.number(),
    // Organization scoping (optional for backwards compatibility)
    organizationId: v.optional(v.id("organizations")),
  })
    .index("by_default", ["isDefault"])
    .index("by_org", ["organizationId"]),

  // Terms & Conditions templates
  termsTemplates: defineTable({
    name: v.string(),
    content: v.string(),
    type: v.union(v.literal("invoice"), v.literal("purchaseOrder"), v.literal("both")),
    isDefault: v.boolean(),
    organizationId: v.optional(v.id("organizations")),
    createdAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_org_type", ["organizationId", "type"]),

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
    terms: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
    // Organization scoping (optional for backwards compatibility)
    organizationId: v.optional(v.id("organizations")),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_number", ["invoiceNumber"])
    .index("by_status", ["status"])
    .index("by_date", ["date"])
    .index("by_deleted", ["deletedAt"])
    .index("by_org", ["organizationId"]),

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
    deletedAt: v.optional(v.number()),
    // Organization scoping (optional for backwards compatibility)
    organizationId: v.optional(v.id("organizations")),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_number", ["poNumber"])
    .index("by_status", ["status"])
    .index("by_date", ["date"])
    .index("by_deleted", ["deletedAt"])
    .index("by_org", ["organizationId"]),

  // Receipts (Kwitansi) table
  receipts: defineTable({
    receiptNumber: v.string(),
    date: v.string(),
    company: companyInfoValidator,
    mode: v.optional(v.union(v.literal("receive"), v.literal("send"))),
    receivedFrom: v.string(),
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
    deletedAt: v.optional(v.number()),
    // Organization scoping (optional for backwards compatibility)
    organizationId: v.optional(v.id("organizations")),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_number", ["receiptNumber"])
    .index("by_date", ["date"])
    .index("by_deleted", ["deletedAt"])
    .index("by_org", ["organizationId"]),

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
    // Organization scoping (optional for backwards compatibility)
    organizationId: v.optional(v.id("organizations")),
  })
    .index("by_type_year", ["type", "year"])
    .index("by_org_type_year", ["organizationId", "type", "year"]),

  // Email settings (SMTP configuration, per organization)
  emailSettings: defineTable({
    smtpHost: v.string(),
    smtpPort: v.number(),
    smtpSecure: v.boolean(),
    smtpUser: v.string(),
    smtpPassword: v.string(),
    senderName: v.string(),
    senderEmail: v.string(),
    replyToEmail: v.optional(v.string()),
    isConfigured: v.boolean(),
    lastTestedAt: v.optional(v.number()),
    testStatus: v.optional(v.union(v.literal("success"), v.literal("failed"))),
    // Email template settings
    emailHeaderColor: v.optional(v.string()),
    emailFooterText: v.optional(v.string()),
    includePaymentInfo: v.optional(v.boolean()),
    // Auto-reminder settings
    reminderEnabled: v.optional(v.boolean()),
    reminderDaysBeforeDue: v.optional(v.number()),
    reminderDaysAfterDue: v.optional(v.number()),
    reminderSubject: v.optional(v.string()),
    reminderMessage: v.optional(v.string()),
    // Organization scoping (optional for backwards compatibility)
    organizationId: v.optional(v.id("organizations")),
  }).index("by_org", ["organizationId"]),

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
    // Organization scoping (optional for backwards compatibility)
    organizationId: v.optional(v.id("organizations")),
  })
    .index("by_document", ["documentType", "documentId"])
    .index("by_status", ["status"])
    .index("by_org", ["organizationId"]),
});
