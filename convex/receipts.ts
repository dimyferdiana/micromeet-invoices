import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("receipts").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("receipts", {
      ...args,
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
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Receipt not found");
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
    await ctx.db.delete(args.id);
  },
});

export const search = query({
  args: {
    searchTerm: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let receipts = await ctx.db.query("receipts").order("desc").collect();

    if (args.searchTerm && args.searchTerm.trim()) {
      const term = args.searchTerm.toLowerCase().trim();
      receipts = receipts.filter(
        (receipt) =>
          receipt.receiptNumber.toLowerCase().includes(term) ||
          receipt.receivedFrom.toLowerCase().includes(term) ||
          receipt.paymentFor.toLowerCase().includes(term)
      );
    }

    // Filter by date range
    if (args.startDate) {
      receipts = receipts.filter((receipt) => receipt.date >= args.startDate!);
    }
    if (args.endDate) {
      receipts = receipts.filter((receipt) => receipt.date <= args.endDate!);
    }

    return receipts;
  },
});
