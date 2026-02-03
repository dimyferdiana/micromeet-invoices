import { query, mutation } from "./_generated/server";
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

const vendorInfoValidator = v.object({
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
        v.literal("confirmed"),
        v.literal("received"),
        v.literal("cancelled")
      )
    ),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let purchaseOrders;
    if (args.status) {
      purchaseOrders = await ctx.db
        .query("purchaseOrders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      purchaseOrders = await ctx.db.query("purchaseOrders").order("desc").collect();
    }
    // Filter out soft-deleted documents unless includeDeleted is true
    if (!args.includeDeleted) {
      purchaseOrders = purchaseOrders.filter((po) => !po.deletedAt);
    }
    return purchaseOrders;
  },
});

export const get = query({
  args: { id: v.id("purchaseOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    poNumber: v.string(),
    date: v.string(),
    expectedDeliveryDate: v.optional(v.string()),
    company: companyInfoValidator,
    vendor: vendorInfoValidator,
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("purchaseOrders", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("purchaseOrders"),
    poNumber: v.optional(v.string()),
    date: v.optional(v.string()),
    expectedDeliveryDate: v.optional(v.string()),
    company: v.optional(companyInfoValidator),
    vendor: v.optional(vendorInfoValidator),
    items: v.optional(v.array(lineItemValidator)),
    subtotal: v.optional(v.number()),
    taxRate: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    total: v.optional(v.number()),
    shippingAddress: v.optional(v.string()),
    notes: v.optional(v.string()),
    terms: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("sent"),
        v.literal("confirmed"),
        v.literal("received"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Purchase Order not found");
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
  args: { id: v.id("purchaseOrders") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Purchase Order not found");
    }
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Restore a soft-deleted purchase order
export const restore = mutation({
  args: { id: v.id("purchaseOrders") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Purchase Order not found");
    }
    if (!existing.deletedAt) {
      throw new Error("Purchase Order is not deleted");
    }
    await ctx.db.patch(args.id, {
      deletedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

// Permanently delete a purchase order (hard delete)
export const permanentDelete = mutation({
  args: { id: v.id("purchaseOrders") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Purchase Order not found");
    }
    await ctx.db.delete(args.id);
  },
});

// List deleted purchase orders
export const listDeleted = query({
  args: {},
  handler: async (ctx) => {
    const purchaseOrders = await ctx.db.query("purchaseOrders").order("desc").collect();
    return purchaseOrders.filter((po) => po.deletedAt);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("purchaseOrders"),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("confirmed"),
      v.literal("received"),
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
        v.literal("confirmed"),
        v.literal("received"),
        v.literal("cancelled")
      )
    ),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let purchaseOrders;

    if (args.status) {
      purchaseOrders = await ctx.db
        .query("purchaseOrders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      purchaseOrders = await ctx.db.query("purchaseOrders").order("desc").collect();
    }

    // Filter out soft-deleted documents
    purchaseOrders = purchaseOrders.filter((po) => !po.deletedAt);

    if (args.searchTerm && args.searchTerm.trim()) {
      const term = args.searchTerm.toLowerCase().trim();
      purchaseOrders = purchaseOrders.filter(
        (po) =>
          po.poNumber.toLowerCase().includes(term) ||
          po.vendor.name.toLowerCase().includes(term)
      );
    }

    // Filter by date range
    if (args.startDate) {
      purchaseOrders = purchaseOrders.filter((po) => po.date >= args.startDate!);
    }
    if (args.endDate) {
      purchaseOrders = purchaseOrders.filter((po) => po.date <= args.endDate!);
    }

    return purchaseOrders;
  },
});
