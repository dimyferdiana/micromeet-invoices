import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthContext, canManageMembers } from "./authHelpers";

// List all members of the current organization
export const list = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContext(ctx);

    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          _id: m._id,
          userId: m.userId,
          name: user?.name || "Unknown",
          email: user?.email || "",
          image: user?.image,
          role: m.role,
          joinedAt: m.joinedAt,
          isCurrentUser: m.userId === auth.userId,
        };
      })
    );

    return members;
  },
});

// Update member role (owner/admin only)
export const updateRole = mutation({
  args: {
    memberId: v.id("organizationMembers"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    if (!canManageMembers(auth)) {
      throw new Error("Hanya Owner atau Admin yang dapat mengubah role anggota");
    }

    const membership = await ctx.db.get(args.memberId);
    if (!membership) throw new Error("Anggota tidak ditemukan");
    if (membership.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized");
    }

    // Cannot change owner's role
    if (membership.role === "owner") {
      throw new Error("Tidak dapat mengubah role pemilik organisasi");
    }

    // Admin cannot change another admin's role (only owner can)
    if (membership.role === "admin" && auth.role !== "owner") {
      throw new Error("Hanya Owner yang dapat mengubah role Admin");
    }

    await ctx.db.patch(args.memberId, { role: args.role });
    return args.memberId;
  },
});

// Remove member from organization (owner/admin only)
export const remove = mutation({
  args: {
    memberId: v.id("organizationMembers"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthContext(ctx);
    if (!canManageMembers(auth)) {
      throw new Error("Hanya Owner atau Admin yang dapat menghapus anggota");
    }

    const membership = await ctx.db.get(args.memberId);
    if (!membership) throw new Error("Anggota tidak ditemukan");
    if (membership.organizationId !== auth.organizationId) {
      throw new Error("Unauthorized");
    }

    // Cannot remove owner
    if (membership.role === "owner") {
      throw new Error("Tidak dapat menghapus pemilik organisasi");
    }

    // Owner cannot remove themselves
    if (membership.userId === auth.userId) {
      throw new Error("Anda tidak dapat menghapus diri sendiri dari organisasi");
    }

    // Admin cannot remove another admin (only owner can)
    if (membership.role === "admin" && auth.role !== "owner") {
      throw new Error("Hanya Owner yang dapat menghapus Admin");
    }

    await ctx.db.delete(args.memberId);
  },
});
