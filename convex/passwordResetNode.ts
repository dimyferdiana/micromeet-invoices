"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Internal action to send reset email (Node.js runtime)
export const sendResetEmail = internalAction({
  args: {
    email: v.string(),
    token: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    // Get email settings
    const emailSettings = await ctx.runQuery(api.emailSettings.getWithPassword);

    if (!emailSettings || !emailSettings.isConfigured) {
      console.error("Email settings not configured, cannot send reset email");
      return;
    }

    // Import nodemailer dynamically
    const nodemailer = await import("nodemailer");

    const transporter = nodemailer.createTransport({
      host: emailSettings.smtpHost,
      port: emailSettings.smtpPort,
      secure: emailSettings.smtpSecure,
      auth: {
        user: emailSettings.smtpUser,
        pass: emailSettings.smtpPassword,
      },
    });

    // Build reset URL - use the origin from env or default
    const baseUrl = process.env.SITE_URL || "http://localhost:5173";
    const resetUrl = `${baseUrl}?resetToken=${args.token}`;

    const mailOptions = {
      from: `"${emailSettings.senderName}" <${emailSettings.senderEmail}>`,
      to: args.email,
      subject: "Reset Password - Micromeet Invoices",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Halo ${args.userName},</h2>
          <p>Kami menerima permintaan untuk reset password akun Anda di Micromeet Invoices.</p>
          <p>Klik tombol di bawah ini untuk mengatur password baru:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #4F46E5; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Link ini akan kedaluwarsa dalam 1 jam.<br/>
            Jika Anda tidak meminta reset password, abaikan email ini.
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
      console.log("Password reset email sent to:", args.email);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }
  },
});
