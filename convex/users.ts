import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Get user's organization membership
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    let organization = null;
    if (membership) {
      organization = await ctx.db.get(membership.organizationId);
    }

    return {
      ...user,
      organizationId: membership?.organizationId ?? null,
      role: membership?.role ?? null,
      organization: organization
        ? { id: organization._id, name: organization.name }
        : null,
    };
  },
});

// Create organization for new user (called after registration)
export const createOrganizationForUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Check if user already has an organization
    const existingMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingMembership) {
      return existingMembership.organizationId;
    }

    // Check if this is the first user (for data migration)
    const migrationFlag = await ctx.db
      .query("migrations")
      .withIndex("by_name", (q) => q.eq("name", "assign_existing_data"))
      .first();

    // Create new organization
    const orgName = user.name ? `${user.name}'s Organization` : "My Organization";
    const organizationId = await ctx.db.insert("organizations", {
      name: orgName,
      createdAt: Date.now(),
    });

    // Add user as owner
    await ctx.db.insert("organizationMembers", {
      organizationId,
      userId,
      role: "owner",
      joinedAt: Date.now(),
    });

    // If first user and no migration done, migrate existing data
    if (!migrationFlag) {
      await migrateExistingData(ctx, userId, organizationId);

      // Mark migration as complete
      await ctx.db.insert("migrations", {
        name: "assign_existing_data",
        completedAt: Date.now(),
      });
    }

    return organizationId;
  },
});

// Helper to migrate existing data to first user
async function migrateExistingData(
  ctx: any,
  userId: any,
  organizationId: any
) {
  // Migrate invoices
  const invoices = await ctx.db
    .query("invoices")
    .filter((q: any) => q.eq(q.field("organizationId"), undefined))
    .collect();
  for (const invoice of invoices) {
    await ctx.db.patch(invoice._id, { organizationId, createdBy: userId });
  }

  // Migrate purchase orders
  const purchaseOrders = await ctx.db
    .query("purchaseOrders")
    .filter((q: any) => q.eq(q.field("organizationId"), undefined))
    .collect();
  for (const po of purchaseOrders) {
    await ctx.db.patch(po._id, { organizationId, createdBy: userId });
  }

  // Migrate receipts
  const receipts = await ctx.db
    .query("receipts")
    .filter((q: any) => q.eq(q.field("organizationId"), undefined))
    .collect();
  for (const receipt of receipts) {
    await ctx.db.patch(receipt._id, { organizationId, createdBy: userId });
  }

  // Migrate customers
  const customers = await ctx.db
    .query("customers")
    .filter((q: any) => q.eq(q.field("organizationId"), undefined))
    .collect();
  for (const customer of customers) {
    await ctx.db.patch(customer._id, { organizationId, createdBy: userId });
  }

  // Migrate company settings
  const companySettings = await ctx.db
    .query("companySettings")
    .filter((q: any) => q.eq(q.field("organizationId"), undefined))
    .collect();
  for (const settings of companySettings) {
    await ctx.db.patch(settings._id, { organizationId });
  }

  // Migrate bank accounts
  const bankAccounts = await ctx.db
    .query("bankAccounts")
    .filter((q: any) => q.eq(q.field("organizationId"), undefined))
    .collect();
  for (const account of bankAccounts) {
    await ctx.db.patch(account._id, { organizationId });
  }

  // Migrate email settings
  const emailSettings = await ctx.db
    .query("emailSettings")
    .filter((q: any) => q.eq(q.field("organizationId"), undefined))
    .collect();
  for (const settings of emailSettings) {
    await ctx.db.patch(settings._id, { organizationId });
  }

  // Migrate document counters
  const documentCounters = await ctx.db
    .query("documentCounters")
    .filter((q: any) => q.eq(q.field("organizationId"), undefined))
    .collect();
  for (const counter of documentCounters) {
    await ctx.db.patch(counter._id, { organizationId });
  }
}

// Get user profile with auth method info
export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Get organization membership
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    let organization = null;
    if (membership) {
      organization = await ctx.db.get(membership.organizationId);
    }

    // Detect auth methods from authAccounts table
    const authAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect();

    const authMethods = authAccounts.map((a) => a.provider);
    const hasPasswordAuth = authMethods.includes("password");
    const hasGoogleAuth = authMethods.includes("google");

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      organizationId: membership?.organizationId ?? null,
      role: membership?.role ?? null,
      organization: organization
        ? { _id: organization._id, name: organization.name }
        : null,
      authMethods,
      hasPasswordAuth,
      hasGoogleAuth,
    };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.image !== undefined) updates.image = args.image;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(userId, updates);
    }

    return await ctx.db.get(userId);
  },
});

// Update organization name (owner only)
export const updateOrganizationName = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!membership) throw new Error("No organization found");
    if (membership.role !== "owner") {
      throw new Error("Hanya pemilik yang dapat mengubah nama organisasi");
    }

    await ctx.db.patch(membership.organizationId, { name: args.name });
    return await ctx.db.get(membership.organizationId);
  },
});

// Internal query to get user email (used by password change action)
export const getUserEmail = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user ? { email: user.email } : null;
  },
});
