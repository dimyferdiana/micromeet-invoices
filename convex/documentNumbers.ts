import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getNextNumber = query({
  args: {
    type: v.union(
      v.literal("invoice"),
      v.literal("purchaseOrder"),
      v.literal("receipt")
    ),
  },
  handler: async (ctx, args) => {
    const currentYear = new Date().getFullYear();
    const counter = await ctx.db
      .query("documentCounters")
      .withIndex("by_type_year", (q) =>
        q.eq("type", args.type).eq("year", currentYear)
      )
      .first();

    const prefixes = {
      invoice: "INV",
      purchaseOrder: "PO",
      receipt: "KWT",
    };

    const nextNumber = counter ? counter.lastNumber + 1 : 1;
    const prefix = counter?.prefix || prefixes[args.type];

    return {
      number: `${prefix}-${currentYear}-${String(nextNumber).padStart(4, "0")}`,
      nextSequence: nextNumber,
    };
  },
});

export const incrementCounter = mutation({
  args: {
    type: v.union(
      v.literal("invoice"),
      v.literal("purchaseOrder"),
      v.literal("receipt")
    ),
  },
  handler: async (ctx, args) => {
    const currentYear = new Date().getFullYear();
    const counter = await ctx.db
      .query("documentCounters")
      .withIndex("by_type_year", (q) =>
        q.eq("type", args.type).eq("year", currentYear)
      )
      .first();

    const prefixes = {
      invoice: "INV",
      purchaseOrder: "PO",
      receipt: "KWT",
    };

    if (counter) {
      await ctx.db.patch(counter._id, {
        lastNumber: counter.lastNumber + 1,
      });
      return counter.lastNumber + 1;
    } else {
      await ctx.db.insert("documentCounters", {
        type: args.type,
        prefix: prefixes[args.type],
        lastNumber: 1,
        year: currentYear,
      });
      return 1;
    }
  },
});

export const updatePrefix = mutation({
  args: {
    type: v.union(
      v.literal("invoice"),
      v.literal("purchaseOrder"),
      v.literal("receipt")
    ),
    prefix: v.string(),
  },
  handler: async (ctx, args) => {
    const currentYear = new Date().getFullYear();
    const counter = await ctx.db
      .query("documentCounters")
      .withIndex("by_type_year", (q) =>
        q.eq("type", args.type).eq("year", currentYear)
      )
      .first();

    if (counter) {
      await ctx.db.patch(counter._id, { prefix: args.prefix });
    } else {
      await ctx.db.insert("documentCounters", {
        type: args.type,
        prefix: args.prefix,
        lastNumber: 0,
        year: currentYear,
      });
    }
  },
});
