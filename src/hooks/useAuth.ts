import { useConvexAuth, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const user = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  )

  return {
    isLoading: isLoading || (isAuthenticated && user === undefined),
    isAuthenticated,
    user: user ?? null,
  }
}
