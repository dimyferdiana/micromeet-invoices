import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthActions } from "@convex-dev/auth/react"
import {
  IconFileInvoice,
  IconShoppingCart,
  IconReceipt,
  IconSettings,
  IconUsers,
  IconHome,
  IconLogout,
  IconDotsVertical,
  IconUser,
} from "@tabler/icons-react"
import type { ActiveView } from "@/components/layout/Sidebar"

interface UserInfo {
  name?: string
  email?: string
  image?: string
  organization?: {
    id: string
    name: string
  } | null
}

interface BottomTabBarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  user?: UserInfo | null
  onNavigateToProfile?: () => void
}

const primaryTabs = [
  { id: "dashboard" as const, label: "Home", icon: IconHome },
  { id: "invoices" as const, label: "Invoice", icon: IconFileInvoice },
  { id: "purchase-orders" as const, label: "PO", icon: IconShoppingCart },
  { id: "receipts" as const, label: "Receipt", icon: IconReceipt },
]

export function BottomTabBar({ activeView, onViewChange, user, onNavigateToProfile }: BottomTabBarProps) {
  const { signOut } = useAuthActions()
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
  }

  const isMoreActive = activeView === "customers" || activeView === "settings"

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border print:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {/* Primary tabs */}
        {primaryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 gap-1 h-full touch-target transition-colors",
              activeView === tab.id
                ? "text-sidebar-primary"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
            )}
          >
            <tab.icon className="h-6 w-6" strokeWidth={activeView === tab.id ? 2.5 : 2} />
            <span className="font-sans text-xs font-medium">{tab.label}</span>
          </button>
        ))}

        {/* More menu tab */}
        <DropdownMenu open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 h-full touch-target transition-colors",
                isMoreActive
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
              )}
            >
              <IconDotsVertical className="h-6 w-6" strokeWidth={isMoreActive ? 2.5 : 2} />
              <span className="font-sans text-xs font-medium">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-56 mb-2">
            {/* User info section */}
            {user && (
              <>
                <div className="px-2 py-3 flex items-center gap-3">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="h-10 w-10 rounded-full shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <IconUser className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.name || "User"}
                    </p>
                    {user.organization && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.organization.name}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Navigation items */}
            <DropdownMenuItem
              onClick={() => {
                onViewChange("customers")
                setIsMoreMenuOpen(false)
              }}
              className={cn(
                activeView === "customers" && "bg-accent text-accent-foreground font-medium"
              )}
            >
              <IconUsers className="h-4 w-4 mr-2" />
              Pelanggan
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onViewChange("settings")
                setIsMoreMenuOpen(false)
              }}
              className={cn(
                activeView === "settings" && "bg-accent text-accent-foreground font-medium"
              )}
            >
              <IconSettings className="h-4 w-4 mr-2" />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onNavigateToProfile}>
              <IconUser className="h-4 w-4 mr-2" />
              Profil Saya
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              <IconLogout className="h-4 w-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
