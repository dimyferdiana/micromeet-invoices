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
    bankName: v.optional(v.string()),
    bankAccount: v.optional(v.string()),
    bankAccountName: v.optional(v.string()),
  }),

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
  })
    .index("by_number", ["invoiceNumber"])
    .index("by_status", ["status"])
    .index("by_date", ["date"]),

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
  })
    .index("by_number", ["poNumber"])
    .index("by_status", ["status"])
    .index("by_date", ["date"]),

  // Receipts (Kwitansi) table
  receipts: defineTable({
    receiptNumber: v.string(),
    date: v.string(),
    company: companyInfoValidator,
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
  })
    .index("by_number", ["receiptNumber"])
    .index("by_date", ["date"]),

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
});
