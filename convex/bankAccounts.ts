import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthContext, getAuthContextOptional, canManageOrganization } from "./authHelpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    return await ctx.db
      .query("bankAccounts")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("bankAccounts") },
  handler: async (ctx, args) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return null;

    const account = await ctx.db.get(args.id);
    if (!account || account.organizationId !== auth.organizationId) {
      return null;
    }
    return account;
  },
});

export const getDefault = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return null;

    const accounts = await ctx.db
      .query("bankAccounts")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();

    return accounts.find((a) => a.isDefault) || null;
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
    const auth = await getAuthContext(ctx);

    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can manage bank accounts");
    }

    // If this is set as default, unset other defaults in this organization
    if (args.isDefault) {
      const existingAccounts = await ctx.db
        .query("bankAccounts")
        .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
        .collect();

      for (const account of existingAccounts) {
        if (account.isDefault) {
          await ctx.db.patch(account._id, { isDefault: false });
        }
      }
    }

    // If this is the first account for this org, make it default
    const existingAccounts = await ctx.db
      .query("bankAccounts")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();
    const shouldBeDefault = args.isDefault || existingAccounts.length === 0;

    return await ctx.db.insert("bankAccounts", {
      ...args,
      isDefault: shouldBeDefault,
      organizationId: auth.organizationId,
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
    const auth = await getAuthContext(ctx);
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Bank account not found");
    }

    if (existing.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Bank account belongs to a different organization");
    }

    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can manage bank accounts");
    }

    // If setting as default, unset other defaults
    if (updates.isDefault) {
      const existingAccounts = await ctx.db
        .query("bankAccounts")
        .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
        .collect();

      for (const account of existingAccounts) {
        if (account._id !== id && account.isDefault) {
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
    const auth = await getAuthContext(ctx);

    const account = await ctx.db.get(args.id);
    if (!account) {
      throw new Error("Bank account not found");
    }

    if (account.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Bank account belongs to a different organization");
    }

    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can manage bank accounts");
    }

    await ctx.db.delete(args.id);

    // If deleted account was default, set another as default
    if (account.isDefault) {
      const remaining = await ctx.db
        .query("bankAccounts")
        .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
        .first();
      if (remaining) {
        await ctx.db.patch(remaining._id, { isDefault: true });
      }
    }
  },
});

export const setDefault = mutation({
  args: { id: v.id("bankAccounts") },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);

    const account = await ctx.db.get(args.id);
    if (!account) {
      throw new Error("Bank account not found");
    }

    if (account.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Bank account belongs to a different organization");
    }

    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can manage bank accounts");
    }

    // Unset all defaults in this organization
    const existingAccounts = await ctx.db
      .query("bankAccounts")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();

    for (const acc of existingAccounts) {
      if (acc.isDefault) {
        await ctx.db.patch(acc._id, { isDefault: false });
      }
    }

    // Set new default
    await ctx.db.patch(args.id, { isDefault: true });
  },
});
