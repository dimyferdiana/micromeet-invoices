"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import nodemailer from "nodemailer";

// Send email action
export const sendEmail = action({
  args: {
    to: v.string(),
    toName: v.optional(v.string()),
    subject: v.string(),
    html: v.string(),
    documentType: v.union(
      v.literal("invoice"),
      v.literal("purchaseOrder"),
      v.literal("receipt")
    ),
    documentId: v.string(),
    documentNumber: v.string(),
    // PDF attachment as base64
    pdfBase64: v.optional(v.string()),
    pdfFilename: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get email settings
    const settings = await ctx.runQuery(api.emailSettings.getWithPassword);

    if (!settings || !settings.isConfigured) {
      throw new Error("Email belum dikonfigurasi. Silakan atur SMTP di Pengaturan.");
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });

    try {
      // Build email options
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${settings.senderName}" <${settings.senderEmail}>`,
        replyTo: settings.replyToEmail || settings.senderEmail,
        to: args.toName ? `"${args.toName}" <${args.to}>` : args.to,
        subject: args.subject,
        html: args.html,
      };

      // Add PDF attachment if provided
      if (args.pdfBase64 && args.pdfFilename) {
        mailOptions.attachments = [
          {
            filename: args.pdfFilename,
            content: Buffer.from(args.pdfBase64, "base64"),
            contentType: "application/pdf",
          },
        ];
      }

      // Send email
      await transporter.sendMail(mailOptions);

      // Log success
      await ctx.runMutation(internal.emailLogs.insertEmailLog, {
        documentType: args.documentType,
        documentId: args.documentId,
        documentNumber: args.documentNumber,
        recipientEmail: args.to,
        recipientName: args.toName,
        subject: args.subject,
        status: "sent",
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Log failure
      await ctx.runMutation(internal.emailLogs.insertEmailLog, {
        documentType: args.documentType,
        documentId: args.documentId,
        documentNumber: args.documentNumber,
        recipientEmail: args.to,
        recipientName: args.toName,
        subject: args.subject,
        status: "failed",
        errorMessage,
      });

      throw new Error(`Gagal mengirim email: ${errorMessage}`);
    }
  },
});

// Test SMTP connection
export const testConnection = action({
  args: {
    smtpHost: v.string(),
    smtpPort: v.number(),
    smtpSecure: v.boolean(),
    smtpUser: v.string(),
    smtpPassword: v.string(),
    senderEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const transporter = nodemailer.createTransport({
      host: args.smtpHost,
      port: args.smtpPort,
      secure: args.smtpSecure,
      auth: {
        user: args.smtpUser,
        pass: args.smtpPassword,
      },
    });

    try {
      await transporter.verify();

      // Update test status
      await ctx.runMutation(api.emailSettings.updateTestStatus, {
        status: "success",
      });

      return { success: true, message: "Koneksi SMTP berhasil!" };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Update test status
      await ctx.runMutation(api.emailSettings.updateTestStatus, {
        status: "failed",
      });

      return { success: false, message: `Koneksi gagal: ${errorMessage}` };
    }
  },
});
