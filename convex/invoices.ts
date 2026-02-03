import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const lineItemValidator = v.object({
  description: v.string(),
  quantity: v.number(),
  unitPrice: v.number(),
  amount: v.number(),
});

const companyInfoValidator = v.object({
  name: v.string(),
  address: v.string(),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  website: v.optional(v.string()),
  taxId: v.optional(v.string()),
  logo: v.optional(v.string()),
});

const customerInfoValidator = v.object({
  name: v.string(),
  address: v.string(),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
});

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("sent"),
        v.literal("paid"),
        v.literal("overdue"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("invoices")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("invoices").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("invoices", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("invoices"),
    invoiceNumber: v.optional(v.string()),
    date: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    company: v.optional(companyInfoValidator),
    customer: v.optional(customerInfoValidator),
    items: v.optional(v.array(lineItemValidator)),
    subtotal: v.optional(v.number()),
    taxRate: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    total: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("sent"),
        v.literal("paid"),
        v.literal("overdue"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Invoice not found");
    }
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("invoices"),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const search = query({
  args: {
    searchTerm: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("sent"),
        v.literal("paid"),
        v.literal("overdue"),
        v.literal("cancelled")
      )
    ),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let invoices;

    if (args.status) {
      invoices = await ctx.db
        .query("invoices")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      invoices = await ctx.db.query("invoices").order("desc").collect();
    }

    if (args.searchTerm && args.searchTerm.trim()) {
      const term = args.searchTerm.toLowerCase().trim();
      invoices = invoices.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(term) ||
          inv.customer.name.toLowerCase().includes(term)
      );
    }

    // Filter by date range
    if (args.startDate) {
      invoices = invoices.filter((inv) => inv.date >= args.startDate!);
    }
    if (args.endDate) {
      invoices = invoices.filter((inv) => inv.date <= args.endDate!);
    }

    return invoices;
  },
});

// Check and update overdue invoices
// This internal mutation checks all invoices with status "draft" or "sent"
// and marks them as "overdue" if the due date has passed
// Called by cron job daily at 00:00 UTC
export const checkOverdueInvoices = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Get all invoices that could potentially be overdue
    const draftInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_status", (q) => q.eq("status", "draft"))
      .collect();

    const sentInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_status", (q) => q.eq("status", "sent"))
      .collect();

    const potentiallyOverdue = [...draftInvoices, ...sentInvoices];
    let updatedCount = 0;

    for (const invoice of potentiallyOverdue) {
      // Check if due date has passed (dueDate < today)
      if (invoice.dueDate < today) {
        await ctx.db.patch(invoice._id, {
          status: "overdue",
          updatedAt: Date.now(),
        });
        updatedCount++;
      }
    }

    return { updatedCount };
  },
});

// Public mutation to manually trigger overdue check (can be called from UI)
export const refreshOverdueStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];

    const draftInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_status", (q) => q.eq("status", "draft"))
      .collect();

    const sentInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_status", (q) => q.eq("status", "sent"))
      .collect();

    const potentiallyOverdue = [...draftInvoices, ...sentInvoices];
    let updatedCount = 0;

    for (const invoice of potentiallyOverdue) {
      if (invoice.dueDate < today) {
        await ctx.db.patch(invoice._id, {
          status: "overdue",
          updatedAt: Date.now(),
        });
        updatedCount++;
      }
    }

    return { updatedCount };
  },
});
