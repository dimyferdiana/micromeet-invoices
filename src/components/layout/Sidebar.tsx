import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import logo from "@/assets/logo.png"
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
  IconUser,
  IconChevronUp,
} from "@tabler/icons-react"

export type ActiveView =
  | "dashboard"
  | "invoices"
  | "purchase-orders"
  | "receipts"
  | "customers"
  | "settings"

interface UserInfo {
  name?: string
  email?: string
  image?: string
  organization?: {
    id: string
    name: string
  } | null
}

interface SidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  user?: UserInfo | null
  onNavigateToProfile?: () => void
}

const menuItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: IconHome },
  { id: "invoices" as const, label: "Invoice", icon: IconFileInvoice },
  { id: "purchase-orders" as const, label: "Purchase Order", icon: IconShoppingCart },
  { id: "receipts" as const, label: "Kwitansi", icon: IconReceipt },
  { id: "customers" as const, label: "Pelanggan", icon: IconUsers },
  { id: "settings" as const, label: "Pengaturan", icon: IconSettings },
]

export function Sidebar({ activeView, onViewChange, user, onNavigateToProfile }: SidebarProps) {
  const { signOut } = useAuthActions()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen hidden md:flex md:flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <img src={logo} alt="Micromeet" className="h-8 object-contain" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-10",
              activeView === item.id &&
                "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            )}
            onClick={() => onViewChange(item.id)}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* User Info & Dropdown */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-2 py-1.5 w-full rounded-md hover:bg-sidebar-accent transition-colors text-left">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <IconUser className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.name || "User"}
                  </p>
                  {user.organization && (
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {user.organization.name}
                    </p>
                  )}
                </div>
                <IconChevronUp className="h-4 w-4 text-sidebar-foreground/40 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
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
        )}
        <p className="text-xs text-sidebar-foreground/50 text-center">
          Micromeet Invoices v1.0
        </p>
      </div>
    </aside>
  )
}
