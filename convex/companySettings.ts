import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("companySettings").first();
    return settings;
  },
});

export const upsert = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("companySettings").first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("companySettings", args);
    }
  },
});
