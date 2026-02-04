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
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Ringkasan bisnis Anda</p>
      </div>

      {/* Stats Grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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

      {/* Charts and Lists - Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols (chart spans 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="md:col-span-2 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold mb-4">Pendapatan 6 Bulan Terakhir</h2>
          <div className="h-56 md:h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={300}>
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
        <Card className="p-4 md:p-6 md:col-span-2 lg:col-span-1">
          <h2 className="text-base md:text-lg font-semibold mb-4">Top 5 Pelanggan</h2>
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
      <Card className="p-5 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-5">Dokumen Terbaru</h2>
        {recentDocs.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada dokumen</p>
        ) : (
          <div className="space-y-3">
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="shrink-0 text-xs">{documentTypeLabels[doc.type]}</Badge>
                      <span className="font-heading font-bold text-sm md:text-base text-foreground">{doc.number}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {doc.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(doc.date)}
                    </p>
                  </div>

                  <div className="text-right flex flex-col gap-2 items-end">
                    <p className="font-heading font-bold text-base md:text-lg text-primary">{formatCurrency(doc.amount)}</p>
                    {doc.status && (
                      <Badge className={`${statusColors[doc.status]} text-xs`}>
                        {statusLabels[doc.status]}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
