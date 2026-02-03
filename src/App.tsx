import { useState } from "react"
import { Sidebar, type ActiveView } from "@/components/layout/Sidebar"
import { DashboardPage } from "@/pages/DashboardPage"
import { InvoicesPage } from "@/pages/InvoicesPage"
import { PurchaseOrdersPage } from "@/pages/PurchaseOrdersPage"
import { ReceiptsPage } from "@/pages/ReceiptsPage"
import { CustomersPage } from "@/pages/CustomersPage"
import { SettingsPage } from "@/pages/SettingsPage"

export function App() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard")

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardPage />
      case "invoices":
        return <InvoicesPage />
      case "purchase-orders":
        return <PurchaseOrdersPage />
      case "receipts":
        return <ReceiptsPage />
      case "customers":
        return <CustomersPage />
      case "settings":
        return <SettingsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - hidden when printing */}
      <div className="print:hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{renderContent()}</div>
      </main>
    </div>
  )
}

export default App
