import { action } from "./_generated/server";
import { v } from "convex/values";
import { retrieveAccount, modifyAccountCredentials } from "@convex-dev/auth/server";

export const changePassword = action({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = identity.email;
    if (!email) throw new Error("Email not found");

    // Verify current password
    try {
      await retrieveAccount(ctx, {
        provider: "password",
        account: {
          id: email,
          secret: args.currentPassword,
        },
      });
    } catch {
      throw new Error("Password saat ini salah");
    }

    // Update to new password
    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: {
        id: email,
        secret: args.newPassword,
      },
    });

    return { success: true };
  },
});
