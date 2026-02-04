import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate upload URL for file upload
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get file URL by storage ID
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Delete file from storage
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});

// Update company logo
export const updateCompanyLogo = mutation({
  args: { logoFileId: v.id("_storage") },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("companySettings").first();

    if (settings) {
      // Delete old logo if exists
      if (settings.logoFileId) {
        try {
          await ctx.storage.delete(settings.logoFileId);
        } catch {
          // Ignore if file doesn't exist
        }
      }
      await ctx.db.patch(settings._id, { logoFileId: args.logoFileId });
    }
  },
});

// Remove company logo
export const removeCompanyLogo = mutation({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("companySettings").first();

    if (settings && settings.logoFileId) {
      try {
        await ctx.storage.delete(settings.logoFileId);
      } catch {
        // Ignore if file doesn't exist
      }
      await ctx.db.patch(settings._id, { logoFileId: undefined });
    }
  },
});

// Update company signature
export const updateCompanySignature = mutation({
  args: { signatureFileId: v.id("_storage") },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("companySettings").first();

    if (settings) {
      // Delete old signature if exists
      if (settings.signatureFileId) {
        try {
          await ctx.storage.delete(settings.signatureFileId);
        } catch {
          // Ignore if file doesn't exist
        }
      }
      await ctx.db.patch(settings._id, { signatureFileId: args.signatureFileId });
    }
  },
});

// Remove company signature
export const removeCompanySignature = mutation({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("companySettings").first();

    if (settings && settings.signatureFileId) {
      try {
        await ctx.storage.delete(settings.signatureFileId);
      } catch {
        // Ignore if file doesn't exist
      }
      await ctx.db.patch(settings._id, { signatureFileId: undefined });
    }
  },
});

// Update company stamp
export const updateCompanyStamp = mutation({
  args: { stampFileId: v.id("_storage") },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("companySettings").first();

    if (settings) {
      // Delete old stamp if exists
      if (settings.stampFileId) {
        try {
          await ctx.storage.delete(settings.stampFileId);
        } catch {
          // Ignore if file doesn't exist
        }
      }
      await ctx.db.patch(settings._id, { stampFileId: args.stampFileId });
    }
  },
});

// Remove company stamp
export const removeCompanyStamp = mutation({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("companySettings").first();

    if (settings && settings.stampFileId) {
      try {
        await ctx.storage.delete(settings.stampFileId);
      } catch {
        // Ignore if file doesn't exist
      }
      await ctx.db.patch(settings._id, { stampFileId: undefined });
    }
  },
});

// Update user profile image
export const updateProfileImage = mutation({
  args: { imageStorageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const imageUrl = await ctx.storage.getUrl(args.imageStorageId);
    if (!imageUrl) throw new Error("Failed to get image URL");

    await ctx.db.patch(userId, { image: imageUrl });
  },
});

// Remove user profile image
export const removeProfileImage = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(userId, { image: undefined });
  },
});
