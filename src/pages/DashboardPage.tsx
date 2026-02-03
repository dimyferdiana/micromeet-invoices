import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { IconFileInvoice, IconShoppingCart, IconReceipt, IconCash } from "@tabler/icons-react"

export function DashboardPage() {
  const invoices = useQuery(api.invoices.list, {})
  const purchaseOrders = useQuery(api.purchaseOrders.list, {})
  const receipts = useQuery(api.receipts.list)

  const totalInvoices = invoices?.reduce((sum, inv) => sum + inv.total, 0) || 0
  const totalPO = purchaseOrders?.reduce((sum, po) => sum + po.total, 0) || 0
  const totalReceipts = receipts?.reduce((sum, r) => sum + r.amount, 0) || 0

  const paidInvoices = invoices?.filter((inv) => inv.status === "paid") || []
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)

  const pendingInvoices = invoices?.filter((inv) => inv.status === "sent") || []
  const overdueInvoices = invoices?.filter((inv) => inv.status === "overdue") || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Ringkasan dokumen dan transaksi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoice
            </CardTitle>
            <IconFileInvoice className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices?.length || 0}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalInvoices)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Purchase Order
            </CardTitle>
            <IconShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOrders?.length || 0}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalPO)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Kwitansi
            </CardTitle>
            <IconReceipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receipts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalReceipts)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Invoice Lunas
            </CardTitle>
            <IconCash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices.length}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Menunggu Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingInvoices.length === 0 ? (
              <p className="text-muted-foreground">Tidak ada invoice menunggu pembayaran</p>
            ) : (
              <div className="space-y-3">
                {pendingInvoices.slice(0, 5).map((inv) => (
                  <div key={inv._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{inv.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">{inv.customer.name}</p>
                    </div>
                    <span className="font-semibold">{formatCurrency(inv.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Invoice Jatuh Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            {overdueInvoices.length === 0 ? (
              <p className="text-muted-foreground">Tidak ada invoice jatuh tempo</p>
            ) : (
              <div className="space-y-3">
                {overdueInvoices.slice(0, 5).map((inv) => (
                  <div key={inv._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{inv.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">{inv.customer.name}</p>
                    </div>
                    <span className="font-semibold text-destructive">
                      {formatCurrency(inv.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
