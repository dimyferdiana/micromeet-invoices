import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthContext, getAuthContextOptional, canManageOrganization } from "./authHelpers";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return null;

    const settings = await ctx.db
      .query("companySettings")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .first();
    return settings;
  },
});

// Get company settings with file URLs
export const getWithUrls = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return null;

    const settings = await ctx.db
      .query("companySettings")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .first();
    if (!settings) return null;

    let logoUrl: string | null = null;
    let signatureUrl: string | null = null;
    let stampUrl: string | null = null;

    if (settings.logoFileId) {
      logoUrl = await ctx.storage.getUrl(settings.logoFileId);
    }
    if (settings.signatureFileId) {
      signatureUrl = await ctx.storage.getUrl(settings.signatureFileId);
    }
    if (settings.stampFileId) {
      stampUrl = await ctx.storage.getUrl(settings.stampFileId);
    }

    return {
      ...settings,
      logoUrl,
      signatureUrl,
      stampUrl,
    };
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
    // Watermark settings
    watermarkEnabled: v.optional(v.boolean()),
    watermarkText: v.optional(v.string()),
    watermarkOpacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);

    // Only owner/admin can update company settings
    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can update company settings");
    }

    const existing = await ctx.db
      .query("companySettings")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("companySettings", {
        ...args,
        organizationId: auth.organizationId,
      });
    }
  },
});

// Update watermark settings only
export const updateWatermark = mutation({
  args: {
    enabled: v.boolean(),
    text: v.optional(v.string()),
    opacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);

    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can update watermark settings");
    }

    const existing = await ctx.db
      .query("companySettings")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .first();

    if (!existing) {
      throw new Error("Company settings not found. Please set up company info first.");
    }

    await ctx.db.patch(existing._id, {
      watermarkEnabled: args.enabled,
      watermarkText: args.text,
      watermarkOpacity: args.opacity,
    });
    return existing._id;
  },
});
