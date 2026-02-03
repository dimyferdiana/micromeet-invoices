/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as companySettings from "../companySettings.js";
import type * as customers from "../customers.js";
import type * as documentNumbers from "../documentNumbers.js";
import type * as invoices from "../invoices.js";
import type * as purchaseOrders from "../purchaseOrders.js";
import type * as receipts from "../receipts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  companySettings: typeof companySettings;
  customers: typeof customers;
  documentNumbers: typeof documentNumbers;
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
