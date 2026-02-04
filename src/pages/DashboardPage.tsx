import { useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Card } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { statusLabels, statusColors } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  IconFileInvoice,
  IconClock,
  IconAlertTriangle,
  IconCurrencyDollar,
  IconReceipt,
  IconShoppingCart,
} from "@tabler/icons-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function DashboardPage() {
  const stats = useQuery(api.dashboard.getStats)
  const revenueChart = useQuery(api.dashboard.getRevenueChart)
  const topCustomers = useQuery(api.dashboard.getTopCustomers)
  const recentDocs = useQuery(api.dashboard.getRecentDocuments)
  const refreshOverdue = useMutation(api.invoices.refreshOverdueStatus)

  // Check for overdue invoices when dashboard loads
  useEffect(() => {
    refreshOverdue()
  }, [refreshOverdue])

  if (!stats || !revenueChart || !topCustomers || !recentDocs) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Ringkasan bisnis Anda</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const documentTypeLabels: Record<string, string> = {
    invoice: "Invoice",
    purchaseOrder: "PO",
    receipt: "Kwitansi",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan bisnis Anda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pendapatan Bulan Ini"
          value={formatCurrency(stats.totalRevenueThisMonth)}
          icon={<IconCurrencyDollar className="h-5 w-5" />}
        />
        <StatCard
          title="Invoice Pending"
          value={stats.pendingInvoices}
          subtitle={formatCurrency(stats.totalPendingAmount)}
          icon={<IconClock className="h-5 w-5" />}
        />
        <StatCard
          title="Invoice Jatuh Tempo"
          value={stats.overdueInvoices}
          icon={<IconAlertTriangle className="h-5 w-5" />}
          className={stats.overdueInvoices > 0 ? "border-red-200 bg-red-50" : ""}
        />
        <StatCard
          title="Invoice Lunas"
          value={stats.paidInvoices}
          subtitle={formatCurrency(stats.totalPaidAmount)}
          icon={<IconFileInvoice className="h-5 w-5" />}
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-semibold mb-4">Pendapatan 6 Bulan Terakhir</h2>
          <div className="h-64 w-full" style={{ minWidth: 300, minHeight: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("id-ID", {
                      notation: "compact",
                      compactDisplay: "short",
                    }).format(value)
                  }
                  className="text-xs"
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value) || 0), "Pendapatan"]}
                  labelFormatter={(label) => `Bulan: ${label}`}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Customers */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Top 5 Pelanggan</h2>
          {topCustomers.length === 0 ? (
            <p className="text-muted-foreground text-sm">Belum ada data pelanggan</p>
          ) : (
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={customer.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-5">
                      {index + 1}.
                    </span>
                    <div>
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.count} invoice
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(customer.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Document Counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Invoice"
          value={stats.totalInvoices}
          icon={<IconFileInvoice className="h-5 w-5" />}
        />
        <StatCard
          title="Total Purchase Order"
          value={stats.totalPurchaseOrders}
          icon={<IconShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          title="Total Kwitansi"
          value={stats.totalReceipts}
          icon={<IconReceipt className="h-5 w-5" />}
        />
      </div>

      {/* Recent Documents */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Dokumen Terbaru</h2>
        {recentDocs.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada dokumen</p>
        ) : (
          <div className="space-y-3">
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{documentTypeLabels[doc.type]}</Badge>
                  <div>
                    <p className="font-medium">{doc.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.name} • {formatDate(doc.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{formatCurrency(doc.amount)}</span>
                  {doc.status && (
                    <Badge className={statusColors[doc.status]}>
                      {statusLabels[doc.status]}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
