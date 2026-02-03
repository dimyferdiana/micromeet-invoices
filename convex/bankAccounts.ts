import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bankAccounts").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("bankAccounts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getDefault = query({
  args: {},
  handler: async (ctx) => {
    const defaultAccount = await ctx.db
      .query("bankAccounts")
      .withIndex("by_default", (q) => q.eq("isDefault", true))
      .first();
    return defaultAccount;
  },
});

export const create = mutation({
  args: {
    bankName: v.string(),
    accountNumber: v.string(),
    accountHolder: v.string(),
    branch: v.optional(v.string()),
    swiftCode: v.optional(v.string()),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    // If this is set as default, unset other defaults
    if (args.isDefault) {
      const existingDefaults = await ctx.db
        .query("bankAccounts")
        .withIndex("by_default", (q) => q.eq("isDefault", true))
        .collect();

      for (const account of existingDefaults) {
        await ctx.db.patch(account._id, { isDefault: false });
      }
    }

    // If this is the first account, make it default
    const existingAccounts = await ctx.db.query("bankAccounts").collect();
    const shouldBeDefault = args.isDefault || existingAccounts.length === 0;

    return await ctx.db.insert("bankAccounts", {
      ...args,
      isDefault: shouldBeDefault,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("bankAccounts"),
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    accountHolder: v.optional(v.string()),
    branch: v.optional(v.string()),
    swiftCode: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // If setting as default, unset other defaults
    if (updates.isDefault) {
      const existingDefaults = await ctx.db
        .query("bankAccounts")
        .withIndex("by_default", (q) => q.eq("isDefault", true))
        .collect();

      for (const account of existingDefaults) {
        if (account._id !== id) {
          await ctx.db.patch(account._id, { isDefault: false });
        }
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("bankAccounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.id);

    await ctx.db.delete(args.id);

    // If deleted account was default, set another as default
    if (account?.isDefault) {
      const remaining = await ctx.db.query("bankAccounts").first();
      if (remaining) {
        await ctx.db.patch(remaining._id, { isDefault: true });
      }
    }
  },
});

export const setDefault = mutation({
  args: { id: v.id("bankAccounts") },
  handler: async (ctx, args) => {
    // Unset all defaults
    const existingDefaults = await ctx.db
      .query("bankAccounts")
      .withIndex("by_default", (q) => q.eq("isDefault", true))
      .collect();

    for (const account of existingDefaults) {
      await ctx.db.patch(account._id, { isDefault: false });
    }

    // Set new default
    await ctx.db.patch(args.id, { isDefault: true });
  },
});
