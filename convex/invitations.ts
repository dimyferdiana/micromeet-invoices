import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthContext, getAuthContextOptional, canManageMembers } from "./authHelpers";
import { getAuthUserId } from "@convex-dev/auth/server";

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// List pending invitations for the current organization
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();

    // Filter to only pending and not expired
    const pending = invitations.filter(
      (inv) => inv.status === "pending" && inv.expiresAt > Date.now()
    );

    // Enrich with inviter name
    const enriched = await Promise.all(
      pending.map(async (inv) => {
        const inviter = await ctx.db.get(inv.invitedBy);
        return {
          _id: inv._id,
          email: inv.email,
          role: inv.role,
          invitedByName: inviter?.name || "Unknown",
          expiresAt: inv.expiresAt,
        };
      })
    );

    return enriched;
  },
});

// Create invitation and send email
export const create = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    if (!canManageMembers(auth)) {
      throw new Error("Hanya Owner atau Admin yang dapat mengundang anggota");
    }

    const normalizedEmail = args.email.toLowerCase().trim();

    // Check if email already belongs to a member of this org
    const existingMembers = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();

    for (const member of existingMembers) {
      const user = await ctx.db.get(member.userId);
      if (user?.email?.toLowerCase() === normalizedEmail) {
        throw new Error("Email ini sudah terdaftar sebagai anggota organisasi");
      }
    }

    // Check for existing pending invitation to same email in same org
    const existingInvitations = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .collect();

    const existingPending = existingInvitations.find(
      (inv) =>
        inv.organizationId === auth.organizationId &&
        inv.status === "pending" &&
        inv.expiresAt > Date.now()
    );

    if (existingPending) {
      throw new Error("Undangan untuk email ini sudah dikirim dan masih aktif");
    }

    // Get org name and inviter name for email
    const org = await ctx.db.get(auth.organizationId);
    const inviter = await ctx.db.get(auth.userId);

    // Create invitation (7-day expiry)
    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    const invitationId = await ctx.db.insert("invitations", {
      organizationId: auth.organizationId,
      email: normalizedEmail,
      role: args.role,
      invitedBy: auth.userId,
      token,
      expiresAt,
      status: "pending",
    });

    // Schedule invitation email
    await ctx.scheduler.runAfter(0, internal.invitationsNode.sendInvitationEmail, {
      email: normalizedEmail,
      token,
      organizationName: org?.name || "Organisasi",
      inviterName: inviter?.name || "Admin",
      role: args.role,
    });

    return invitationId;
  },
});

// Cancel/revoke a pending invitation
export const cancel = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    if (!canManageMembers(auth)) {
      throw new Error("Unauthorized");
    }

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Undangan tidak ditemukan");
    if (invitation.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.invitationId, { status: "expired" as const });
  },
});

// Resend invitation email (resets expiry with new token)
export const resend = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    if (!canManageMembers(auth)) {
      throw new Error("Unauthorized");
    }

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Undangan tidak ditemukan");
    if (invitation.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized");
    }
    if (invitation.status !== "pending") {
      throw new Error("Undangan sudah tidak aktif");
    }

    // Generate new token and reset expiry
    const newToken = generateToken();
    const newExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.invitationId, {
      token: newToken,
      expiresAt: newExpiresAt,
    });

    const org = await ctx.db.get(auth.organizationId);
    const inviter = await ctx.db.get(auth.userId);

    await ctx.scheduler.runAfter(0, internal.invitationsNode.sendInvitationEmail, {
      email: invitation.email,
      token: newToken,
      organizationName: org?.name || "Organisasi",
      inviterName: inviter?.name || "Admin",
      role: invitation.role,
    });
  },
});

// Verify invitation token (public - no auth required)
export const verifyToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      return { valid: false as const, error: "Token undangan tidak valid" };
    }

    if (invitation.status === "accepted") {
      return { valid: false as const, error: "Undangan sudah digunakan" };
    }

    if (invitation.status === "expired") {
      return { valid: false as const, error: "Undangan sudah dibatalkan" };
    }

    if (invitation.expiresAt < Date.now()) {
      return { valid: false as const, error: "Undangan sudah kedaluwarsa" };
    }

    const org = await ctx.db.get(invitation.organizationId);

    return {
      valid: true as const,
      email: invitation.email,
      role: invitation.role,
      organizationName: org?.name || "Organisasi",
    };
  },
});

// Accept invitation (requires authentication)
export const accept = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Anda harus login terlebih dahulu untuk menerima undangan");
    }

    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      throw new Error("Token undangan tidak valid");
    }

    if (invitation.status !== "pending") {
      throw new Error("Undangan sudah tidak aktif");
    }

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: "expired" as const });
      throw new Error("Undangan sudah kedaluwarsa");
    }

    // Verify the accepting user's email matches the invitation
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User tidak ditemukan");

    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error(
        "Email akun Anda tidak sesuai dengan undangan. Silakan login dengan email yang diundang."
      );
    }

    // Check if user already belongs to this org
    const existingMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", invitation.organizationId).eq("userId", userId)
      )
      .first();

    if (existingMembership) {
      // Already a member - just mark invitation as accepted
      await ctx.db.patch(invitation._id, { status: "accepted" as const });
      return { success: true, alreadyMember: true };
    }

    // Check if user belongs to another org - remove from old one (single-org model)
    const currentMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (currentMembership) {
      await ctx.db.delete(currentMembership._id);
    }

    // Add to new organization
    await ctx.db.insert("organizationMembers", {
      organizationId: invitation.organizationId,
      userId,
      role: invitation.role,
      joinedAt: Date.now(),
    });

    // Mark invitation as accepted
    await ctx.db.patch(invitation._id, { status: "accepted" as const });

    return { success: true, alreadyMember: false };
  },
});
