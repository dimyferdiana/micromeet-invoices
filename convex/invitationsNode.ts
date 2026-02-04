"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import nodemailer from "nodemailer";

// Internal action to send invitation email (Node.js runtime)
export const sendInvitationEmail = internalAction({
  args: {
    email: v.string(),
    token: v.string(),
    organizationName: v.string(),
    inviterName: v.string(),
    role: v.string(),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    // Get email settings using internal query (no auth context needed)
    const emailSettings = await ctx.runQuery(internal.emailSettings.getByOrgId, {
      organizationId: args.organizationId,
    });

    if (!emailSettings || !emailSettings.isConfigured) {
      console.error("Email settings not configured, cannot send invitation email");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: emailSettings.smtpHost,
      port: emailSettings.smtpPort,
      secure: emailSettings.smtpSecure,
      auth: {
        user: emailSettings.smtpUser,
        pass: emailSettings.smtpPassword,
      },
    });

    // Build invitation URL
    const baseUrl = process.env.SITE_URL || "http://localhost:5173";
    const invitationUrl = `${baseUrl}?invitationToken=${args.token}`;

    const roleLabel = args.role === "admin" ? "Admin" : "Anggota";

    const mailOptions = {
      from: `"${emailSettings.senderName}" <${emailSettings.senderEmail}>`,
      to: args.email,
      subject: `Undangan Bergabung - ${args.organizationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Undangan Bergabung</h2>
          <p>Halo,</p>
          <p><strong>${args.inviterName}</strong> mengundang Anda untuk bergabung dengan
             <strong>${args.organizationName}</strong> sebagai <strong>${roleLabel}</strong>
             di Micromeet Invoices.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}"
               style="background-color: #4F46E5; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Terima Undangan
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Undangan ini berlaku selama 7 hari.<br/>
            Jika Anda tidak mengenal pengirim, abaikan email ini.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">
            Micromeet Invoices<br/>
            Email ini dikirim secara otomatis, mohon tidak membalas email ini.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Invitation email sent to:", args.email);
    } catch (error) {
      console.error("Failed to send invitation email:", error);
    }
  },
});
