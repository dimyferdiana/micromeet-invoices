/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bankAccounts from "../bankAccounts.js";
import type * as companySettings from "../companySettings.js";
import type * as crons from "../crons.js";
import type * as customers from "../customers.js";
import type * as dashboard from "../dashboard.js";
import type * as documentNumbers from "../documentNumbers.js";
import type * as emailLogs from "../emailLogs.js";
import type * as emailSettings from "../emailSettings.js";
import type * as emails from "../emails.js";
import type * as files from "../files.js";
import type * as invoices from "../invoices.js";
import type * as purchaseOrders from "../purchaseOrders.js";
import type * as receipts from "../receipts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bankAccounts: typeof bankAccounts;
  companySettings: typeof companySettings;
  crons: typeof crons;
  customers: typeof customers;
  dashboard: typeof dashboard;
  documentNumbers: typeof documentNumbers;
  emailLogs: typeof emailLogs;
  emailSettings: typeof emailSettings;
  emails: typeof emails;
  files: typeof files;
  invoices: typeof invoices;
  purchaseOrders: typeof purchaseOrders;
  receipts: typeof receipts;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
