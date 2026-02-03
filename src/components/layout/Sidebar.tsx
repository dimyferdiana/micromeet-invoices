import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  IconFileInvoice,
  IconShoppingCart,
  IconReceipt,
  IconSettings,
  IconUsers,
  IconHome,
} from "@tabler/icons-react"

export type ActiveView =
  | "dashboard"
  | "invoices"
  | "purchase-orders"
  | "receipts"
  | "customers"
  | "settings"

interface SidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
}

const menuItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: IconHome },
  { id: "invoices" as const, label: "Invoice", icon: IconFileInvoice },
  { id: "purchase-orders" as const, label: "Purchase Order", icon: IconShoppingCart },
  { id: "receipts" as const, label: "Kwitansi", icon: IconReceipt },
  { id: "customers" as const, label: "Pelanggan", icon: IconUsers },
  { id: "settings" as const, label: "Pengaturan", icon: IconSettings },
]

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground flex items-center gap-2">
          <IconFileInvoice className="h-6 w-6 text-primary" />
          Micromeet
        </h1>
        <p className="text-sm text-sidebar-foreground/60 mt-1">Invoice Generator</p>
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

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 text-center">
          Micromeet Invoices v1.0
        </p>
      </div>
    </aside>
  )
}
