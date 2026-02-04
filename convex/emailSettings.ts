import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthContext, getAuthContextOptional, canManageOrganization } from "./authHelpers";

// Get email settings
export const get = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return null;

    const settings = await ctx.db
      .query("emailSettings")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .first();

    if (!settings) {
      return null;
    }
    // Don't expose password in queries for security
    return {
      ...settings,
      smtpPassword: settings.smtpPassword ? "********" : "",
    };
  },
});

// Get email settings with password (internal use only for sending emails)
export const getWithPassword = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return null;

    return await ctx.db
      .query("emailSettings")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .first();
  },
});

// Get email settings by organization ID (for internal/scheduled actions without auth context)
export const getByOrgId = internalQuery({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailSettings")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .first();
  },
});

// Save/update email settings
export const upsert = mutation({
  args: {
    smtpHost: v.string(),
    smtpPort: v.number(),
    smtpSecure: v.boolean(),
    smtpUser: v.string(),
    smtpPassword: v.optional(v.string()),
    senderName: v.string(),
    senderEmail: v.string(),
    replyToEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);

    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can update email settings");
    }

    const existing = await ctx.db
      .query("emailSettings")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .first();

    const data = {
      smtpHost: args.smtpHost,
      smtpPort: args.smtpPort,
      smtpSecure: args.smtpSecure,
      smtpUser: args.smtpUser,
      senderName: args.senderName,
      senderEmail: args.senderEmail,
      replyToEmail: args.replyToEmail,
      isConfigured: true,
    };

    if (existing) {
      const updateData = args.smtpPassword && args.smtpPassword !== "********"
        ? { ...data, smtpPassword: args.smtpPassword }
        : data;

      await ctx.db.patch(existing._id, updateData);
      return existing._id;
    } else {
      if (!args.smtpPassword) {
        throw new Error("Password is required for new email settings");
      }
      return await ctx.db.insert("emailSettings", {
        ...data,
        smtpPassword: args.smtpPassword,
        organizationId: auth.organizationId,
      });
    }
  },
});

// Update test status
export const updateTestStatus = mutation({
  args: {
    status: v.union(v.literal("success"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);

    const existing = await ctx.db
      .query("emailSettings")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        testStatus: args.status,
        lastTestedAt: Date.now(),
      });
    }
  },
});

// Delete email settings
export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContext(ctx);

    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can delete email settings");
    }

    const existing = await ctx.db
      .query("emailSettings")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// Update email template settings
export const updateTemplate = mutation({
  args: {
    emailHeaderColor: v.optional(v.string()),
    emailFooterText: v.optional(v.string()),
    includePaymentInfo: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);

    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can update email settings");
    }

    const existing = await ctx.db
      .query("emailSettings")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .first();

    if (!existing) {
      throw new Error("Email settings not found. Please configure SMTP first.");
    }
    await ctx.db.patch(existing._id, {
      emailHeaderColor: args.emailHeaderColor,
      emailFooterText: args.emailFooterText,
      includePaymentInfo: args.includePaymentInfo,
    });
    return existing._id;
  },
});

// Update auto-reminder settings
export const updateReminder = mutation({
  args: {
    reminderEnabled: v.boolean(),
    reminderDaysBeforeDue: v.optional(v.number()),
    reminderDaysAfterDue: v.optional(v.number()),
    reminderSubject: v.optional(v.string()),
    reminderMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);

    if (!canManageOrganization(auth)) {
      throw new Error("Unauthorized: Only owner or admin can update email settings");
    }

    const existing = await ctx.db
      .query("emailSettings")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .first();

    if (!existing) {
      throw new Error("Email settings not found. Please configure SMTP first.");
    }
    await ctx.db.patch(existing._id, {
      reminderEnabled: args.reminderEnabled,
      reminderDaysBeforeDue: args.reminderDaysBeforeDue,
      reminderDaysAfterDue: args.reminderDaysAfterDue,
      reminderSubject: args.reminderSubject,
      reminderMessage: args.reminderMessage,
    });
    return existing._id;
  },
});
