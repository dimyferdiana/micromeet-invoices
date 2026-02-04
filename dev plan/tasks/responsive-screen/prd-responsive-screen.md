# PRD: Responsive Screen Design — All Screens

## 1. Introduction/Overview

The Micromeet Invoices application currently has a desktop-centric layout with a fixed `w-64` sidebar and content areas designed primarily for wide screens. While some Tailwind responsive classes exist (e.g., grid breakpoints on DashboardPage), the application lacks a comprehensive responsive strategy, making it difficult to use on tablets and mobile phones.

This PRD defines the requirements for making **all 11 screens** of the application fully responsive across desktop (1280px+), tablet (768px–1279px), and mobile (320px–767px) viewports. The goal is to enable users — especially small business owners and freelancers — to generate invoices, purchase orders, and receipts directly from their phones.

### Problem Statement

- The sidebar (`w-64`) is always visible and takes significant screen space on smaller devices
- Document forms (Invoice, PO, Receipt) use side-by-side layouts that don't adapt to narrow screens
- Line item editors, tables, and previews overflow or become unusable on mobile
- Settings tabs use a 7-column grid that becomes cramped on small screens
- No mobile navigation pattern exists — users cannot access the app on phones

### Key User Selection Summary

| Decision | Selection |
|---|---|
| Mobile Navigation | Bottom tab bar (replacing sidebar on mobile) |
| Form/Preview Layout | Stacked layout (form on top, preview below) |
| Minimum Screen Width | 320px (iPhone SE) |
| Implementation Approach | Adaptive (different layouts per breakpoint) |
| Timeline | Urgent (1-2 weeks) |

---

## 2. Goals

1. **Inclusiveness** — Ensure all users can access the application regardless of device size, from 320px (iPhone SE) to ultrawide desktop monitors.
2. **Mobile Document Generation** — Enable users to create, edit, and send invoices, purchase orders, and receipts from their phones with a usable, touch-friendly interface.
3. **Adaptive Layouts** — Provide distinct, optimized layouts for each breakpoint tier (mobile, tablet, desktop) rather than simply scaling down the desktop view.
4. **Consistent Experience** — Maintain feature parity across all breakpoints — no features should be hidden or removed on mobile.
5. **Performance** — Ensure responsive changes do not degrade performance, especially on lower-end mobile devices.
6. **Urgency** — Complete implementation within 1-2 weeks.

---

## 3. User Stories

### Navigation
- **US-1:** As a mobile user, I want a bottom tab bar so I can navigate between sections with my thumb without reaching for a sidebar.
- **US-2:** As a tablet user, I want a collapsible or condensed sidebar so I have more room for content while still seeing navigation labels.
- **US-3:** As a desktop user, I want the full sidebar to remain as-is so my workflow is not disrupted.

### Document Creation
- **US-4:** As a mobile user, I want to create an invoice from my phone with a stacked form layout so I can fill in fields comfortably on a narrow screen.
- **US-5:** As a mobile user, I want to scroll down to see the document preview below the form so I can verify my invoice without switching views.
- **US-6:** As a mobile user, I want line item fields to stack vertically so I can enter item details without horizontal scrolling.

### Dashboard
- **US-7:** As a mobile user, I want stat cards to stack in a single column so I can read all metrics clearly.
- **US-8:** As a tablet user, I want stat cards in a 2-column grid so I can see more data at once without overcrowding.

### Document Lists
- **US-9:** As a mobile user, I want document list cards to be full-width and show key information (number, customer, amount, status) in a compact format.
- **US-10:** As a mobile user, I want to tap a document card to open it, with action buttons accessible via a context menu or swipe.

### Settings
- **US-11:** As a mobile user, I want settings tabs to be scrollable horizontally or displayed as a dropdown/accordion so I can access all 7 settings sections.
- **US-12:** As a mobile user, I want settings forms to stack vertically with full-width inputs.

### Authentication
- **US-13:** As a mobile user, I want login/register/forgot-password pages to be centered and fit comfortably on small screens.

---

## 4. Functional Requirements

### 4.1 Breakpoint Definitions

| Tier | Range | Tailwind Prefix | Description |
|---|---|---|---|
| Mobile | 320px – 639px | (default) | Phone-optimized layout |
| Mobile Large | 640px – 767px | `sm:` | Large phones / small tablets |
| Tablet | 768px – 1023px | `md:` | Tablet portrait |
| Tablet Large | 1024px – 1279px | `lg:` | Tablet landscape / small laptops |
| Desktop | 1280px+ | `xl:` / `2xl:` | Full desktop experience |

### 4.2 Global Layout & Navigation

**FR-1:** The application shell (`App.tsx`) MUST implement three distinct navigation patterns:
- **Mobile (< 768px):** Bottom tab bar with 5 primary icons (Dashboard, Invoice, PO, Receipt, More). The "More" tab opens a menu with Customers, Settings, and Logout.
- **Tablet (768px – 1023px):** Collapsible sidebar — icon-only by default (`w-16`), expandable to full width (`w-64`) on hover or toggle.
- **Desktop (1024px+):** Full sidebar as currently implemented (`w-64`).

**FR-2:** The bottom tab bar MUST:
- Be fixed to the bottom of the viewport (`fixed bottom-0`)
- Have a height of 56-64px for comfortable touch targets
- Show icon + short label for each tab
- Highlight the active tab with the primary color
- Be hidden during printing (`print:hidden`)
- Support safe area insets for notched devices (`pb-safe`)

**FR-3:** The main content area MUST adjust padding based on breakpoint:
- Mobile: `p-4` with `pb-20` (to clear bottom tab bar)
- Tablet: `p-6`
- Desktop: `p-8` (current)

### 4.3 Dashboard Page

**FR-4:** The stat cards grid MUST adapt:
- Mobile: `grid-cols-1` (single column, full width)
- Tablet: `grid-cols-2`
- Desktop: `grid-cols-4` (current)

**FR-5:** The charts section MUST adapt:
- Mobile: `grid-cols-1` (charts stack vertically, full width)
- Tablet: `grid-cols-2` (2 charts per row)
- Desktop: `grid-cols-3` (current)

**FR-6:** The document count cards MUST adapt:
- Mobile: `grid-cols-1`
- Tablet: `grid-cols-3` (current)
- Desktop: `grid-cols-3` (current)

**FR-7:** Dashboard page header (title + date filter) MUST stack vertically on mobile with full-width date filter.

### 4.4 Document List Pages (Invoices, Purchase Orders, Receipts)

**FR-8:** The filter/action bar (search, filters, create button) MUST adapt:
- Mobile: Stack vertically — search full width on top, filters and create button below
- Tablet: Search and filters inline, create button on the right
- Desktop: All inline (current)

**FR-9:** Document list cards MUST be full-width on mobile with:
- Key info (document number, customer name, total amount, status badge) visible
- Date in a secondary line or compact format
- Touch target minimum 44px height

**FR-10:** The create button on mobile SHOULD be a floating action button (FAB) in the bottom-right corner (positioned above the bottom tab bar) as an alternative or supplement to the in-toolbar button.

### 4.5 Document Forms (Invoice, PO, Receipt)

**FR-11:** The form layout MUST be stacked on all breakpoints below desktop:
- Mobile/Tablet: Form fields on top, document preview below (scrollable)
- Desktop: Side-by-side layout if currently implemented, or stacked

**FR-12:** Form field grids MUST adapt:
- Mobile: All fields full-width (`grid-cols-1`)
- Tablet: Two fields per row where logical (`grid-cols-2`)
- Desktop: Current layout

**FR-13:** The `CompanyInfoFields` and `CustomerInfoFields` sections MUST:
- Stack vertically on mobile (currently `grid-cols-2`)
- Show at 2 columns on tablet and desktop

**FR-14:** The `LineItemsEditor` MUST adapt for mobile:
- Each line item MUST display as a card/block layout instead of a table row
- Fields within each line item (description, qty, unit, price, tax, total) MUST stack vertically or use a 2-column mini-grid
- Add/remove item buttons MUST have touch-friendly sizing (min 44px)
- Summary totals MUST be clearly visible at the bottom

**FR-15:** The `CustomerSelector` and `PayerSelector` dropdowns MUST:
- Open as full-width on mobile
- Have adequate touch target sizes

**FR-16:** Document preview section on mobile MUST:
- Be full-width
- Scale the preview content to fit the screen width
- Allow horizontal scrolling only if content exceeds minimum readable size

### 4.6 Document Previews (Invoice, PO, Receipt)

**FR-17:** Preview components MUST be responsive:
- Mobile: `max-w-full` with content scaled down, `text-xs` to `text-sm` for readability
- The 2-column company/customer info grid MUST stack on very narrow screens (< 480px)
- Tables in preview MUST use `overflow-x-auto` with horizontal scroll indicators
- Desktop: Current `max-w-4xl` layout

**FR-18:** Preview action buttons (Print, Download PDF, Email) MUST:
- Be displayed as a sticky bottom action bar on mobile
- Use icon-only or compact labels on mobile
- Remain inline on desktop

### 4.7 Settings Page

**FR-19:** The settings tab navigation MUST adapt:
- Mobile: Horizontal scrollable tab bar with icon + label, OR vertical accordion sections
- Tablet: Scrollable horizontal tabs (current `lg:inline-flex` behavior extended)
- Desktop: Inline tabs (current)

**FR-20:** All settings cards MUST be full-width on mobile with:
- Stacked form fields
- Full-width inputs and selects
- Adequate spacing between form groups

**FR-21:** The `TeamManagementCard` table MUST adapt:
- Mobile: Each team member shown as a card (name, email, role, actions)
- Desktop: Table layout (current)

**FR-22:** The `InviteMemberDialog` MUST be full-width on mobile (`max-w-full` within viewport).

### 4.8 Customers Page

**FR-23:** The customer list MUST adapt similarly to document lists:
- Mobile: Full-width cards with key info
- Search and filters stacked vertically on mobile

### 4.9 Authentication Pages (Login, Register, Forgot Password, Reset Password, Accept Invitation)

**FR-24:** Auth pages MUST:
- Be centered vertically and horizontally on all breakpoints
- Use `max-w-sm` on mobile with `px-4` padding
- Inputs MUST be full-width
- Social login buttons (Google OAuth) MUST be full-width on mobile

### 4.10 Dialogs and Modals

**FR-25:** All dialogs (EmailDialog, InviteMemberDialog, AlertDialog) MUST:
- Be full-width on mobile with max-width constraints (e.g., `max-w-[calc(100vw-2rem)]`)
- Use bottom sheet pattern on mobile if possible (slide up from bottom)
- Have full-width buttons on mobile
- Prevent body scroll when open

### 4.11 Print Styles

**FR-26:** Print styles MUST remain functional regardless of responsive state:
- Bottom tab bar MUST be hidden during print
- Mobile navigation elements MUST be hidden during print
- Print layout MUST use the full page width (A4)

### 4.12 Touch & Interaction

**FR-27:** All interactive elements on mobile MUST have:
- Minimum touch target size of 44x44px (Apple HIG recommendation)
- Adequate spacing between tappable elements (min 8px gap)
- No hover-dependent interactions without a touch alternative

**FR-28:** Form inputs on mobile MUST:
- Use appropriate input types (`type="tel"` for phone, `type="email"` for email, `inputmode="decimal"` for currency amounts)
- Avoid triggering unwanted zoom (min font size 16px for inputs on iOS)

---

## 5. Non-Goals (Out of Scope)

1. **Native mobile app** — This PRD covers responsive web only, not a React Native or PWA conversion.
2. **Offline support** — No offline-first or service worker implementation.
3. **Gesture-based navigation** — No swipe gestures for navigation (beyond native browser gestures).
4. **Responsive email templates** — Email template customization in settings is out of scope for this responsive pass.
5. **New features** — No new functionality is being added; this is purely a layout/UX adaptation.
6. **Backend changes** — No Convex schema/API changes needed.
7. **Dark mode adjustments** — Dark mode is already supported via CSS variables; no additional dark mode work unless responsive changes break it.

---

## 6. Design Considerations

### 6.1 Breakpoint Strategy

The app uses **Tailwind CSS v4** with standard breakpoints. The adaptive approach means we define distinct layouts per tier rather than using a single fluid scale.

### 6.2 Component Architecture

| Component | Mobile Pattern | Tablet Pattern | Desktop Pattern |
|---|---|---|---|
| Sidebar | Hidden (replaced by bottom tabs) | Collapsed icon-only (`w-16`) | Full sidebar (`w-64`) |
| Bottom Tab Bar | Visible (fixed bottom) | Hidden | Hidden |
| Stat Cards | 1 column | 2 columns | 4 columns |
| Charts | 1 column | 2 columns | 3 columns |
| Document List | Full-width cards | Full-width cards | Full-width cards |
| Form Fields | 1 column stacked | 2 columns | 2+ columns |
| Line Items | Card blocks | Compact table | Full table |
| Preview | Full-width scaled | Full-width | `max-w-4xl` centered |
| Settings Tabs | Scrollable horizontal | Scrollable horizontal | Inline tabs |
| Dialogs | Full-width / bottom sheet | Centered modal | Centered modal |

### 6.3 New Components Needed

1. **`BottomTabBar`** — Mobile navigation component with 5 tabs + "More" overflow menu
2. **`MobileLineItemCard`** — Card-based line item display for mobile forms
3. **`ResponsiveSidebar`** — Wrapper that switches between sidebar modes based on breakpoint
4. **`useBreakpoint` hook** — Custom hook to detect current breakpoint for JS-level layout switching (if needed beyond CSS)
5. **`MobileActionBar`** — Sticky bottom action bar for preview pages on mobile

### 6.4 CSS/Tailwind Approach

- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) as the primary mechanism
- Use `@media` queries in `index.css` only for global layout changes
- Avoid JavaScript-based responsive logic where CSS alone suffices
- Use `container queries` (`@container`) for component-level responsiveness if beneficial

---

## 7. Technical Considerations

### 7.1 Tech Stack Context

- **Framework:** React 19.2.0 + Vite 7.2.4
- **Styling:** Tailwind CSS v4.1.17 with `@tailwindcss/vite` plugin
- **Components:** shadcn/ui + Radix UI primitives
- **State:** Convex for backend, React state for UI
- **Routing:** Custom view state in `App.tsx` (no react-router)
- **Icons:** Tabler Icons (`@tabler/icons-react`)

### 7.2 Dependencies

- No new npm dependencies should be required
- Tailwind CSS v4 already includes all necessary responsive utilities
- The `next-themes` package handles dark mode and should not be affected

### 7.3 Key Files to Modify

| File | Changes |
|---|---|
| `src/App.tsx` | Add responsive shell, bottom tab bar integration, conditional sidebar |
| `src/components/layout/Header.tsx` | Make sidebar responsive (collapsible on tablet, hidden on mobile) |
| `src/components/layout/Sidebar.tsx` | Add collapse/expand logic for tablet |
| `src/pages/DashboardPage.tsx` | Adjust grid breakpoints |
| `src/pages/InvoicesPage.tsx` | Responsive filter bar, form layout |
| `src/pages/PurchaseOrdersPage.tsx` | Same as InvoicesPage |
| `src/pages/ReceiptsPage.tsx` | Same as InvoicesPage |
| `src/pages/CustomersPage.tsx` | Responsive list and filters |
| `src/pages/SettingsPage.tsx` | Responsive tabs and settings cards |
| `src/pages/LoginPage.tsx` | Mobile auth layout |
| `src/pages/RegisterPage.tsx` | Mobile auth layout |
| `src/pages/ForgotPasswordPage.tsx` | Mobile auth layout |
| `src/pages/ResetPasswordPage.tsx` | Mobile auth layout |
| `src/pages/AcceptInvitationPage.tsx` | Mobile auth layout |
| `src/components/forms/InvoiceForm.tsx` | Stacked layout, responsive fields |
| `src/components/forms/PurchaseOrderForm.tsx` | Stacked layout, responsive fields |
| `src/components/forms/ReceiptForm.tsx` | Stacked layout, responsive fields |
| `src/components/forms/LineItemsEditor.tsx` | Card-based mobile layout |
| `src/components/forms/CompanyInfoFields.tsx` | Responsive grid |
| `src/components/forms/CustomerInfoFields.tsx` | Responsive grid |
| `src/components/forms/CustomerSelector.tsx` | Full-width mobile dropdown |
| `src/components/forms/PayerSelector.tsx` | Full-width mobile dropdown |
| `src/components/forms/EmailDialog.tsx` | Full-width mobile dialog |
| `src/components/previews/InvoicePreview.tsx` | Responsive preview scaling |
| `src/components/previews/PurchaseOrderPreview.tsx` | Responsive preview scaling |
| `src/components/previews/ReceiptPreview.tsx` | Responsive preview scaling |
| `src/components/settings/*.tsx` | All 9 settings cards — responsive forms |
| `src/components/layout/DocumentList.tsx` | Mobile-optimized cards |
| `src/index.css` | Safe area insets, global responsive utilities |

### 7.4 New Files to Create

| File | Purpose |
|---|---|
| `src/components/layout/BottomTabBar.tsx` | Mobile bottom navigation component |
| `src/components/layout/MobileActionBar.tsx` | Sticky bottom actions for preview pages |
| `src/components/forms/MobileLineItemCard.tsx` | Card layout for line items on mobile |
| `src/hooks/useBreakpoint.ts` | Custom hook for JS-level breakpoint detection |

### 7.5 Testing Strategy

- Test on Chrome DevTools device emulation (320px, 375px, 768px, 1024px, 1280px, 1440px)
- Test on real devices if available (iPhone SE, iPhone 14, iPad, Android phone)
- Verify print functionality is not broken
- Verify dark mode still works at all breakpoints
- Verify all forms are submittable on mobile (no hidden fields, no overflow issues)

---

## 8. Success Metrics

1. **All 11 pages render correctly** at 320px, 768px, and 1280px without horizontal scrollbar or content overflow
2. **All forms are fully functional** on mobile — users can create and submit invoices, POs, and receipts from a 320px viewport
3. **Navigation is accessible** on all breakpoints — bottom tab bar on mobile, sidebar on desktop
4. **Touch targets meet 44px minimum** on all interactive elements
5. **No regression** in desktop layout or functionality
6. **Print functionality preserved** across all breakpoints
7. **Page load performance** is not degraded (no layout shift, no additional JS bundles > 5KB)
8. **All responsive changes pass visual review** at each breakpoint tier

---

## 9. Open Questions

1. Should the bottom tab bar "More" menu include a user profile/avatar display, or just navigation links?
2. Should charts on the dashboard be interactive (zoomable/scrollable) on mobile, or static?
3. For the line items editor on mobile, should users be able to reorder items via drag-and-drop, or only via up/down buttons?
4. Should the document preview on mobile include pinch-to-zoom functionality?
5. Is there a specific order of priority for screens (e.g., Invoice form first, then Dashboard)?
