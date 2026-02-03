import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for overdue invoices every day at 00:00 UTC
crons.daily(
  "check-overdue-invoices",
  { hourUTC: 0, minuteUTC: 0 },
  internal.invoices.checkOverdueInvoices
);

export default crons;
