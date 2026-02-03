import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Internal mutation to insert email log (called from action)
export const insertEmailLog = internalMutation({
  args: {
    documentType: v.union(
      v.literal("invoice"),
      v.literal("purchaseOrder"),
      v.literal("receipt")
    ),
    documentId: v.string(),
    documentNumber: v.string(),
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),
    subject: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailLogs", {
      ...args,
      sentAt: Date.now(),
    });
  },
});

// Query email logs for a document
export const getLogsForDocument = query({
  args: {
    documentType: v.union(
      v.literal("invoice"),
      v.literal("purchaseOrder"),
      v.literal("receipt")
    ),
    documentId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailLogs")
      .withIndex("by_document", (q) =>
        q.eq("documentType", args.documentType).eq("documentId", args.documentId)
      )
      .order("desc")
      .collect();
  },
});
