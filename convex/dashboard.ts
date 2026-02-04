import { query } from "./_generated/server";

// Get dashboard statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").collect();
    const purchaseOrders = await ctx.db.query("purchaseOrders").collect();
    const receipts = await ctx.db.query("receipts").collect();

    // Current month calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter invoices for current month (paid)
    const currentMonthPaidInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.date);
      return (
        invDate.getMonth() === currentMonth &&
        invDate.getFullYear() === currentYear &&
        inv.status === "paid"
      );
    });

    const totalRevenueThisMonth = currentMonthPaidInvoices.reduce(
      (sum, inv) => sum + inv.total,
      0
    );

    // Count by status
    const pendingInvoices = invoices.filter(
      (inv) => inv.status === "sent" || inv.status === "draft"
    ).length;

    const overdueInvoices = invoices.filter((inv) => {
      if (inv.status === "paid" || inv.status === "cancelled") return false;
      const dueDate = new Date(inv.dueDate);
      return dueDate < now;
    }).length;

    const paidInvoices = invoices.filter((inv) => inv.status === "paid").length;

    // Total amounts
    const totalInvoiceAmount = invoices
      .filter((inv) => inv.status !== "cancelled")
      .reduce((sum, inv) => sum + inv.total, 0);

    const totalPaidAmount = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.total, 0);

    const totalPendingAmount = invoices
      .filter((inv) => inv.status === "sent" || inv.status === "draft")
      .reduce((sum, inv) => sum + inv.total, 0);

    return {
      totalRevenueThisMonth,
      pendingInvoices,
      overdueInvoices,
      paidInvoices,
      totalInvoices: invoices.length,
      totalPurchaseOrders: purchaseOrders.length,
      totalReceipts: receipts.length,
      totalInvoiceAmount,
      totalPaidAmount,
      totalPendingAmount,
    };
  },
});

// Get revenue data for the last 6 months
export const getRevenueChart = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").collect();

    const now = new Date();
    const months: { month: string; revenue: number; count: number }[] = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("id-ID", { month: "short" });
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthInvoices = invoices.filter((inv) => {
        const invDate = new Date(inv.date);
        return (
          invDate.getMonth() === month &&
          invDate.getFullYear() === year &&
          inv.status === "paid"
        );
      });

      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);

      months.push({
        month: monthName,
        revenue,
        count: monthInvoices.length,
      });
    }

    return months;
  },
});

// Get top customers by total invoice amount
export const getTopCustomers = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").collect();

    // Group by customer name
    const customerTotals: Record<string, { name: string; total: number; count: number }> = {};

    invoices
      .filter((inv) => inv.status !== "cancelled")
      .forEach((inv) => {
        const customerName = inv.customer.name;
        if (!customerTotals[customerName]) {
          customerTotals[customerName] = { name: customerName, total: 0, count: 0 };
        }
        customerTotals[customerName].total += inv.total;
        customerTotals[customerName].count += 1;
      });

    // Sort by total and take top 5
    const topCustomers = Object.values(customerTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return topCustomers;
  },
});

// Get recent documents
export const getRecentDocuments = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").order("desc").take(5);
    const purchaseOrders = await ctx.db.query("purchaseOrders").order("desc").take(5);
    const receipts = await ctx.db.query("receipts").order("desc").take(5);

    // Combine and sort by creation date
    const allDocs = [
      ...invoices.map((inv) => ({
        id: inv._id,
        type: "invoice" as const,
        number: inv.invoiceNumber,
        name: inv.customer.name,
        amount: inv.total,
        date: inv.date,
        status: inv.status,
        createdAt: inv.createdAt,
      })),
      ...purchaseOrders.map((po) => ({
        id: po._id,
        type: "purchaseOrder" as const,
        number: po.poNumber,
        name: po.vendor.name,
        amount: po.total,
        date: po.date,
        status: po.status,
        createdAt: po.createdAt,
      })),
      ...receipts.map((r) => ({
        id: r._id,
        type: "receipt" as const,
        number: r.receiptNumber,
        name: r.receivedFrom,
        amount: r.amount,
        date: r.date,
        status: null,
        createdAt: r.createdAt,
      })),
    ];

    return allDocs.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  },
});
