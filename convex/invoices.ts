import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthContext, getAuthContextOptional, canEditDocument, canDeleteDocument } from "./authHelpers";

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
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    let invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .order("desc")
      .collect();

    // Filter by status if provided
    if (args.status) {
      invoices = invoices.filter((inv) => inv.status === args.status);
    }

    // Filter out soft-deleted documents unless includeDeleted is true
    if (!args.includeDeleted) {
      invoices = invoices.filter((inv) => !inv.deletedAt);
    }
    return invoices;
  },
});

export const get = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return null;

    const invoice = await ctx.db.get(args.id);
    // Ensure user can only access their organization's invoices
    if (!invoice || invoice.organizationId !== auth.organizationId) {
      return null;
    }
    return invoice;
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
    terms: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    const now = Date.now();
    return await ctx.db.insert("invoices", {
      ...args,
      organizationId: auth.organizationId,
      createdBy: auth.userId,
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
    terms: v.optional(v.string()),
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
    const auth = await getAuthContext(ctx);
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);

    if (!existing) {
      throw new Error("Invoice not found");
    }

    // Check organization access
    if (existing.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Invoice belongs to a different organization");
    }

    // Check edit permission (owner/admin can edit all, member can only edit their own)
    if (!canEditDocument(auth, existing.createdBy)) {
      throw new Error("Unauthorized: You can only edit invoices you created");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

// Soft delete - sets deletedAt timestamp instead of removing
export const remove = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Invoice not found");
    }

    if (existing.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Invoice belongs to a different organization");
    }

    if (!canDeleteDocument(auth, existing.createdBy)) {
      throw new Error("Unauthorized: You can only delete invoices you created");
    }

    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Restore a soft-deleted invoice
export const restore = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Invoice not found");
    }

    if (existing.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Invoice belongs to a different organization");
    }

    if (!existing.deletedAt) {
      throw new Error("Invoice is not deleted");
    }

    await ctx.db.patch(args.id, {
      deletedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

// Permanently delete an invoice (hard delete)
export const permanentDelete = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Invoice not found");
    }

    if (existing.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Invoice belongs to a different organization");
    }

    if (!canDeleteDocument(auth, existing.createdBy)) {
      throw new Error("Unauthorized: You can only delete invoices you created");
    }

    await ctx.db.delete(args.id);
  },
});

// List deleted invoices
export const listDeleted = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .order("desc")
      .collect();
    return invoices.filter((inv) => inv.deletedAt);
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
    const auth = await getAuthContext(ctx);
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Invoice not found");
    }

    if (existing.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Invoice belongs to a different organization");
    }

    if (!canEditDocument(auth, existing.createdBy)) {
      throw new Error("Unauthorized: You can only update invoices you created");
    }

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
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    let invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .order("desc")
      .collect();

    // Filter by status
    if (args.status) {
      invoices = invoices.filter((inv) => inv.status === args.status);
    }

    // Filter out soft-deleted documents
    invoices = invoices.filter((inv) => !inv.deletedAt);

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

// Check and update overdue invoices (internal - no auth required)
export const checkOverdueInvoices = internalMutation({
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

// Public mutation to manually trigger overdue check
export const refreshOverdueStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return { updatedCount: 0 };

    const today = new Date().toISOString().split("T")[0];

    // Only check invoices in the user's organization
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();

    const potentiallyOverdue = invoices.filter(
      (inv) => inv.status === "draft" || inv.status === "sent"
    );
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
