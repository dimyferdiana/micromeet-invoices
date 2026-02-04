import type { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

export interface AuthContext {
  userId: Id<"users">;
  organizationId: Id<"organizations">;
  role: "owner" | "admin" | "member";
}

/**
 * Get the current user's auth context including their organization.
 * Throws an error if the user is not authenticated or doesn't belong to an organization.
 */
export async function getAuthContext(ctx: QueryCtx | MutationCtx): Promise<AuthContext> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Unauthorized: Please log in");
  }

  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!membership) {
    throw new Error("No organization found. Please complete registration.");
  }

  return {
    userId,
    organizationId: membership.organizationId,
    role: membership.role,
  };
}

/**
 * Get auth context but return null instead of throwing if not authenticated.
 * Useful for queries that should return empty results for unauthenticated users.
 */
export async function getAuthContextOptional(ctx: QueryCtx | MutationCtx): Promise<AuthContext | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!membership) return null;

  return {
    userId,
    organizationId: membership.organizationId,
    role: membership.role,
  };
}

/**
 * Check if user can edit a document (owner/admin can edit all, member can only edit their own)
 */
export function canEditDocument(
  authContext: AuthContext,
  documentCreatedBy: Id<"users"> | undefined
): boolean {
  if (authContext.role === "owner" || authContext.role === "admin") {
    return true;
  }
  // Members can only edit their own documents
  return documentCreatedBy === authContext.userId;
}

/**
 * Check if user can delete a document (same rules as edit)
 */
export function canDeleteDocument(
  authContext: AuthContext,
  documentCreatedBy: Id<"users"> | undefined
): boolean {
  return canEditDocument(authContext, documentCreatedBy);
}

/**
 * Check if user can manage organization (only owner and admin)
 */
export function canManageOrganization(authContext: AuthContext): boolean {
  return authContext.role === "owner" || authContext.role === "admin";
}

/**
 * Check if user can manage members (only owner and admin)
 */
export function canManageMembers(authContext: AuthContext): boolean {
  return authContext.role === "owner" || authContext.role === "admin";
}
