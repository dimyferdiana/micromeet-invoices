import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthContext, getAuthContextOptional } from "./authHelpers";

export const getNextNumber = query({
  args: {
    type: v.union(
      v.literal("invoice"),
      v.literal("purchaseOrder"),
      v.literal("receipt")
    ),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) {
      const prefixes = {
        invoice: "INV",
        purchaseOrder: "PO",
        receipt: "KWT",
      };
      const currentYear = new Date().getFullYear();
      return {
        number: `${prefixes[args.type]}-${currentYear}-0001`,
        nextSequence: 1,
      };
    }

    const currentYear = new Date().getFullYear();
    const counter = await ctx.db
      .query("documentCounters")
      .withIndex("by_org_type_year", (q) =>
        q
          .eq("organizationId", auth.organizationId)
          .eq("type", args.type)
          .eq("year", currentYear)
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
    const auth = await getAuthContext(ctx);

    const currentYear = new Date().getFullYear();
    const counter = await ctx.db
      .query("documentCounters")
      .withIndex("by_org_type_year", (q) =>
        q
          .eq("organizationId", auth.organizationId)
          .eq("type", args.type)
          .eq("year", currentYear)
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
        organizationId: auth.organizationId,
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
    const auth = await getAuthContext(ctx);

    const currentYear = new Date().getFullYear();
    const counter = await ctx.db
      .query("documentCounters")
      .withIndex("by_org_type_year", (q) =>
        q
          .eq("organizationId", auth.organizationId)
          .eq("type", args.type)
          .eq("year", currentYear)
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
        organizationId: auth.organizationId,
      });
    }
  },
});
