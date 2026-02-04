import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthContext, getAuthContextOptional, canManageOrganization } from "./authHelpers";

const typeValidator = v.union(v.literal("invoice"), v.literal("purchaseOrder"), v.literal("both"));

export const list = query({
  args: {
    type: v.optional(typeValidator),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    const templates = await ctx.db
      .query("termsTemplates")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .order("desc")
      .collect();

    if (args.type) {
      return templates.filter((t) => t.type === args.type || t.type === "both");
    }

    return templates;
  },
});

export const get = query({
  args: { id: v.id("termsTemplates") },
  handler: async (ctx, args) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return null;

    const template = await ctx.db.get(args.id);
    if (!template || template.organizationId !== auth.organizationId) {
      return null;
    }
    return template;
  },
});

export const getDefault = query({
  args: {
    type: typeValidator,
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return null;

    const templates = await ctx.db
      .query("termsTemplates")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();

    return templates.find((t) => t.isDefault && (t.type === args.type || t.type === "both")) || null;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    content: v.string(),
    type: typeValidator,
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);

    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can manage terms templates");
    }

    // If this is set as default, unset other defaults for the same type
    if (args.isDefault) {
      const existingTemplates = await ctx.db
        .query("termsTemplates")
        .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
        .collect();

      for (const template of existingTemplates) {
        if (template.isDefault && (template.type === args.type || template.type === "both" || args.type === "both")) {
          await ctx.db.patch(template._id, { isDefault: false });
        }
      }
    }

    // If this is the first template for this org, make it default
    const existingTemplates = await ctx.db
      .query("termsTemplates")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();
    const shouldBeDefault = args.isDefault || existingTemplates.length === 0;

    return await ctx.db.insert("termsTemplates", {
      ...args,
      isDefault: shouldBeDefault,
      organizationId: auth.organizationId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("termsTemplates"),
    name: v.optional(v.string()),
    content: v.optional(v.string()),
    type: v.optional(typeValidator),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Terms template not found");
    }

    if (existing.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Terms template belongs to a different organization");
    }

    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can manage terms templates");
    }

    // If setting as default, unset other defaults
    if (updates.isDefault) {
      const effectiveType = updates.type || existing.type;
      const existingTemplates = await ctx.db
        .query("termsTemplates")
        .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
        .collect();

      for (const template of existingTemplates) {
        if (template._id !== id && template.isDefault && (template.type === effectiveType || template.type === "both" || effectiveType === "both")) {
          await ctx.db.patch(template._id, { isDefault: false });
        }
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("termsTemplates") },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);

    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error("Terms template not found");
    }

    if (template.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Terms template belongs to a different organization");
    }

    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can manage terms templates");
    }

    await ctx.db.delete(args.id);

    // If deleted template was default, set another as default
    if (template.isDefault) {
      const remaining = await ctx.db
        .query("termsTemplates")
        .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
        .first();
      if (remaining) {
        await ctx.db.patch(remaining._id, { isDefault: true });
      }
    }
  },
});

export const setDefault = mutation({
  args: { id: v.id("termsTemplates") },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);

    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error("Terms template not found");
    }

    if (template.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized: Terms template belongs to a different organization");
    }

    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can manage terms templates");
    }

    // Unset all defaults for the same type in this organization
    const existingTemplates = await ctx.db
      .query("termsTemplates")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();

    for (const t of existingTemplates) {
      if (t.isDefault && (t.type === template.type || t.type === "both" || template.type === "both")) {
        await ctx.db.patch(t._id, { isDefault: false });
      }
    }

    // Set new default
    await ctx.db.patch(args.id, { isDefault: true });
  },
});
