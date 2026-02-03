import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get email settings
export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("emailSettings").first();
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
    return await ctx.db.query("emailSettings").first();
  },
});

// Save/update email settings
export const upsert = mutation({
  args: {
    smtpHost: v.string(),
    smtpPort: v.number(),
    smtpSecure: v.boolean(),
    smtpUser: v.string(),
    smtpPassword: v.optional(v.string()), // Only update if provided
    senderName: v.string(),
    senderEmail: v.string(),
    replyToEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("emailSettings").first();

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
      // Only update password if a new one is provided (not masked value)
      const updateData = args.smtpPassword && args.smtpPassword !== "********"
        ? { ...data, smtpPassword: args.smtpPassword }
        : data;

      await ctx.db.patch(existing._id, updateData);
      return existing._id;
    } else {
      // For new settings, password is required
      if (!args.smtpPassword) {
        throw new Error("Password is required for new email settings");
      }
      return await ctx.db.insert("emailSettings", {
        ...data,
        smtpPassword: args.smtpPassword,
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
    const existing = await ctx.db.query("emailSettings").first();
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
    const existing = await ctx.db.query("emailSettings").first();
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
    const existing = await ctx.db.query("emailSettings").first();
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
    const existing = await ctx.db.query("emailSettings").first();
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
