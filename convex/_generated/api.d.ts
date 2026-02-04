/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
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
import type * as http from "../http.js";
import type * as invitations from "../invitations.js";
import type * as invitationsNode from "../invitationsNode.js";
import type * as invoices from "../invoices.js";
import type * as members from "../members.js";
import type * as passwordReset from "../passwordReset.js";
import type * as passwordResetNode from "../passwordResetNode.js";
import type * as profileActions from "../profileActions.js";
import type * as purchaseOrders from "../purchaseOrders.js";
import type * as receipts from "../receipts.js";
import type * as termsTemplates from "../termsTemplates.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authHelpers: typeof authHelpers;
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
  http: typeof http;
  invitations: typeof invitations;
  invitationsNode: typeof invitationsNode;
  invoices: typeof invoices;
  members: typeof members;
  passwordReset: typeof passwordReset;
  passwordResetNode: typeof passwordResetNode;
  profileActions: typeof profileActions;
  purchaseOrders: typeof purchaseOrders;
  receipts: typeof receipts;
  termsTemplates: typeof termsTemplates;
  users: typeof users;
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
