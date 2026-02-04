import { query } from "./_generated/server";
import { getAuthContextOptional } from "./authHelpers";

// Get dashboard statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthContextOptional(ctx);
    if (!auth) {
      return {
        totalRevenueThisMonth: 0,
        pendingInvoices: 0,
        overdueInvoices: 0,
        paidInvoices: 0,
        totalInvoices: 0,
        totalPurchaseOrders: 0,
        totalReceipts: 0,
        totalInvoiceAmount: 0,
        totalPaidAmount: 0,
        totalPendingAmount: 0,
      };
    }

    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();
    const purchaseOrders = await ctx.db
      .query("purchaseOrders")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();
    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();

    // Filter out deleted
    const activeInvoices = invoices.filter((inv) => !inv.deletedAt);
    const activePOs = purchaseOrders.filter((po) => !po.deletedAt);
    const activeReceipts = receipts.filter((r) => !r.deletedAt);

    // Current month calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter invoices for current month (paid)
    const currentMonthPaidInvoices = activeInvoices.filter((inv) => {
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
    const pendingInvoices = activeInvoices.filter(
      (inv) => inv.status === "sent" || inv.status === "draft"
    ).length;

    const overdueInvoices = activeInvoices.filter((inv) => {
      if (inv.status === "paid" || inv.status === "cancelled") return false;
      const dueDate = new Date(inv.dueDate);
      return dueDate < now;
    }).length;

    const paidInvoices = activeInvoices.filter((inv) => inv.status === "paid").length;

    // Total amounts
    const totalInvoiceAmount = activeInvoices
      .filter((inv) => inv.status !== "cancelled")
      .reduce((sum, inv) => sum + inv.total, 0);

    const totalPaidAmount = activeInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.total, 0);

    const totalPendingAmount = activeInvoices
      .filter((inv) => inv.status === "sent" || inv.status === "draft")
      .reduce((sum, inv) => sum + inv.total, 0);

    return {
      totalRevenueThisMonth,
      pendingInvoices,
      overdueInvoices,
      paidInvoices,
      totalInvoices: activeInvoices.length,
      totalPurchaseOrders: activePOs.length,
      totalReceipts: activeReceipts.length,
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
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();

    const activeInvoices = invoices.filter((inv) => !inv.deletedAt);
    const now = new Date();
    const months: { month: string; revenue: number; count: number }[] = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("id-ID", { month: "short" });
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthInvoices = activeInvoices.filter((inv) => {
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
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .collect();

    const activeInvoices = invoices.filter((inv) => !inv.deletedAt);

    // Group by customer name
    const customerTotals: Record<string, { name: string; total: number; count: number }> = {};

    activeInvoices
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
    const auth = await getAuthContextOptional(ctx);
    if (!auth) return [];

    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .order("desc")
      .take(10);

    const purchaseOrders = await ctx.db
      .query("purchaseOrders")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .order("desc")
      .take(10);

    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_org", (q) => q.eq("organizationId", auth.organizationId))
      .order("desc")
      .take(10);

    // Filter out deleted and combine
    const allDocs = [
      ...invoices
        .filter((inv) => !inv.deletedAt)
        .map((inv) => ({
          id: inv._id,
          type: "invoice" as const,
          number: inv.invoiceNumber,
          name: inv.customer.name,
          amount: inv.total,
          date: inv.date,
          status: inv.status,
          createdAt: inv.createdAt,
        })),
      ...purchaseOrders
        .filter((po) => !po.deletedAt)
        .map((po) => ({
          id: po._id,
          type: "purchaseOrder" as const,
          number: po.poNumber,
          name: po.vendor.name,
          amount: po.total,
          date: po.date,
          status: po.status,
          createdAt: po.createdAt,
        })),
      ...receipts
        .filter((r) => !r.deletedAt)
        .map((r) => ({
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
