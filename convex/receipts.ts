import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthContext, getAuthContextOptional, canEditDocument, canDeleteDocument } from "./authHelpers";

const companyInfoValidator = v.object({
  name: v.string(),
  address: v.string(),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  website: v.optional(v.string()),
  taxId: v.optional(v.string()),
  logo: v.optional(v.string()),
});

export const list = query({
  args: {
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    let receipts = await ctx.db
      .query("receipts")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .order("desc")
      .collect();

    if (!args.includeDeleted) {
      receipts = receipts.filter((r) => !r.deletedAt);
    }
    return receipts;
  },
});

export const get = query({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return null;

    const receipt = await ctx.db.get(args.id);
    if (!receipt || receipt.organizationId !== auth.organizationId) {
      return null;
    }
    return receipt;
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    const now = Date.now();
    return await ctx.db.insert("receipts", {
      ...args,
      mode: args.mode || "receive",
      organizationId: auth.organizationId,
      createdBy: auth.userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("receipts"),
    receiptNumber: v.optional(v.string()),
    date: v.optional(v.string()),
    company: v.optional(companyInfoValidator),
    mode: v.optional(v.union(v.literal("receive"), v.literal("send"))),
    receivedFrom: v.optional(v.string()),
    amount: v.optional(v.number()),
    amountInWords: v.optional(v.string()),
    paymentMethod: v.optional(
      v.union(
        v.literal("cash"),
        v.literal("transfer"),
        v.literal("check"),
        v.literal("other")
      )
    ),
    paymentFor: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);

    if (!existing) {
      throw new Error("Receipt not found");
    }

    if (existing.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Receipt belongs to a different organization");
    }

    if (!canEditDocument(auth, existing.createdBy)) {
      throw new Error("Unauthorized: You can only edit receipts you created");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Receipt not found");
    }

    if (existing.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Receipt belongs to a different organization");
    }

    if (!canDeleteDocument(auth, existing.createdBy)) {
      throw new Error("Unauthorized: You can only delete receipts you created");
    }

    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const restore = mutation({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Receipt not found");
    }

    if (existing.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Receipt belongs to a different organization");
    }

    if (!existing.deletedAt) {
      throw new Error("Receipt is not deleted");
    }

    await ctx.db.patch(args.id, {
      deletedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const permanentDelete = mutation({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Receipt not found");
    }

    if (existing.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Receipt belongs to a different organization");
    }

    if (!canDeleteDocument(auth, existing.createdBy)) {
      throw new Error("Unauthorized: You can only delete receipts you created");
    }

    await ctx.db.delete(args.id);
  },
});

export const listDeleted = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .order("desc")
      .collect();
    return receipts.filter((r) => r.deletedAt);
  },
});

export const search = query({
  args: {
    searchTerm: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    let receipts = await ctx.db
      .query("receipts")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .order("desc")
      .collect();

    receipts = receipts.filter((r) => !r.deletedAt);

    if (args.searchTerm && args.searchTerm.trim()) {
      const term = args.searchTerm.toLowerCase().trim();
      receipts = receipts.filter(
        (receipt) =>
          receipt.receiptNumber.toLowerCase().includes(term) ||
          receipt.receivedFrom.toLowerCase().includes(term) ||
          receipt.paymentFor.toLowerCase().includes(term)
      );
    }

    if (args.startDate) {
      receipts = receipts.filter((receipt) => receipt.date >= args.startDate!);
    }
    if (args.endDate) {
      receipts = receipts.filter((receipt) => receipt.date <= args.endDate!);
    }

    return receipts;
  },
});
