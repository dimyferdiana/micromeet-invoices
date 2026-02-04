import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthContext, getAuthContextOptional, canEditDocument, canDeleteDocument } from "./authHelpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    return await ctx.db
      .query("customers")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return null;

    const customer = await ctx.db.get(args.id);
    if (!customer || customer.organizationId !== auth.organizationId) {
      return null;
    }
    return customer;
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();

    const term = args.searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    return await ctx.db.insert("customers", {
      ...args,
      organizationId: auth.organizationId,
      createdBy: auth.userId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("customers"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);

    if (!existing) {
      throw new Error("Customer not found");
    }

    if (existing.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Customer belongs to a different organization");
    }

    if (!canEditDocument(auth, existing.createdBy)) {
      throw new Error("Unauthorized: You can only edit customers you created");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Customer not found");
    }

    if (existing.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Customer belongs to a different organization");
    }

    if (!canDeleteDocument(auth, existing.createdBy)) {
      throw new Error("Unauthorized: You can only delete customers you created");
    }

    await ctx.db.delete(args.id);
  },
});
