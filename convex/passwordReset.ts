import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Generate a random token
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Request password reset - creates token and sends email
export const requestReset = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true };
    }

    // Invalidate any existing tokens for this user
    const existingTokens = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const token of existingTokens) {
      await ctx.db.patch(token._id, { used: true });
    }

    // Create new token (expires in 1 hour)
    const token = generateToken();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    await ctx.db.insert("passwordResetTokens", {
      userId: user._id,
      token,
      expiresAt,
      used: false,
    });

    // Schedule email sending
    await ctx.scheduler.runAfter(0, internal.passwordResetNode.sendResetEmail, {
      email: args.email,
      token,
      userName: user.name || "User",
    });

    return { success: true };
  },
});

// Verify reset token
export const verifyToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!resetToken) {
      return { valid: false, error: "Token tidak valid" };
    }

    if (resetToken.used) {
      return { valid: false, error: "Token sudah digunakan" };
    }

    if (resetToken.expiresAt < Date.now()) {
      return { valid: false, error: "Token sudah kedaluwarsa" };
    }

    return { valid: true, userId: resetToken.userId };
  },
});

// Reset password with token
export const resetPassword = mutation({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify token first
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!resetToken || resetToken.used || resetToken.expiresAt < Date.now()) {
      throw new Error("Token tidak valid atau sudah kedaluwarsa");
    }

    // Mark token as used
    await ctx.db.patch(resetToken._id, { used: true });

    // Note: Password update needs to be handled by Convex Auth
    // This returns the userId so the frontend can use it with the auth system
    return {
      success: true,
      userId: resetToken.userId,
      message: "Token verified. Please use the auth system to update password.",
    };
  },
});
