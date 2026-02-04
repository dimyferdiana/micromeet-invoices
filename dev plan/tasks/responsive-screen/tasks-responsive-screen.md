# Tasks: Responsive Screen Design — All Screens

## Relevant Files

### New Files to Create

- `src/hooks/useBreakpoint.ts` - Custom hook for detecting current breakpoint (mobile, tablet, desktop)
- `src/components/layout/BottomTabBar.tsx` - Mobile bottom navigation with 5 tabs + More menu
- `src/components/layout/MobileActionBar.tsx` - Sticky bottom action bar for preview pages on mobile
- `src/components/forms/MobileLineItemCard.tsx` - Card-based line item layout for mobile forms

### Existing Files to Modify

- `index.html` - Add/update viewport meta tag for proper mobile rendering
- `src/index.css` - Add safe area insets, global responsive utilities, mobile-specific base styles
- `src/App.tsx` - Integrate BottomTabBar, responsive shell, conditional sidebar rendering
- `src/components/layout/Header.tsx` - Make sidebar component responsive (collapsible on tablet, hidden on mobile)
- `src/components/layout/Sidebar.tsx` - Add collapse/expand state and logic for tablet
- `src/components/layout/DocumentList.tsx` - Optimize cards for mobile touch targets

### Pages

- `src/pages/DashboardPage.tsx` - Responsive stat cards, charts, document counts grids
- `src/pages/InvoicesPage.tsx` - Responsive filter bar, form layout, FAB
- `src/pages/PurchaseOrdersPage.tsx` - Responsive filter bar, form layout, FAB
- `src/pages/ReceiptsPage.tsx` - Responsive filter bar, form layout, FAB
- `src/pages/CustomersPage.tsx` - Responsive list and filters
- `src/pages/SettingsPage.tsx` - Scrollable tabs, responsive settings cards
- `src/pages/LoginPage.tsx` - Mobile-optimized auth layout
- `src/pages/RegisterPage.tsx` - Mobile-optimized auth layout
- `src/pages/ForgotPasswordPage.tsx` - Mobile-optimized auth layout
- `src/pages/ResetPasswordPage.tsx` - Mobile-optimized auth layout
- `src/pages/AcceptInvitationPage.tsx` - Mobile-optimized auth layout

### Forms

- `src/components/forms/InvoiceForm.tsx` - Stacked layout, responsive field grids
- `src/components/forms/PurchaseOrderForm.tsx` - Stacked layout, responsive field grids
- `src/components/forms/ReceiptForm.tsx` - Stacked layout, responsive field grids
- `src/components/forms/LineItemsEditor.tsx` - Mobile card-based layout using MobileLineItemCard
- `src/components/forms/CompanyInfoFields.tsx` - Responsive grid (grid-cols-1 on mobile, grid-cols-2 on tablet+)
- `src/components/forms/CustomerInfoFields.tsx` - Responsive grid (grid-cols-1 on mobile, grid-cols-2 on tablet+)
- `src/components/forms/CustomerSelector.tsx` - Full-width on mobile, touch-friendly
- `src/components/forms/PayerSelector.tsx` - Full-width on mobile, touch-friendly
- `src/components/forms/EmailDialog.tsx` - Full-width modal on mobile
- `src/components/forms/StatusDropdown.tsx` - Touch-friendly sizing

### Previews

- `src/components/previews/InvoicePreview.tsx` - Responsive scaling, stacked info grid on mobile
- `src/components/previews/PurchaseOrderPreview.tsx` - Responsive scaling, stacked info grid on mobile
- `src/components/previews/ReceiptPreview.tsx` - Responsive scaling, stacked info grid on mobile

### Settings Components

- `src/components/settings/ProfileSettingsCard.tsx` - Responsive form fields
- `src/components/settings/OrganizationSettingsCard.tsx` - Responsive form fields
- `src/components/settings/TeamManagementCard.tsx` - Card-based team member list on mobile
- `src/components/settings/EmailSettingsCard.tsx` - Responsive form fields
- `src/components/settings/EmailTemplateCard.tsx` - Responsive form fields
- `src/components/settings/ReminderSettingsCard.tsx` - Responsive form fields
- `src/components/settings/WatermarkSettingsCard.tsx` - Responsive form fields
- `src/components/settings/TermsTemplatesCard.tsx` - Responsive form fields
- `src/components/settings/ChangePasswordCard.tsx` - Responsive form fields
- `src/components/settings/InviteMemberDialog.tsx` - Full-width modal on mobile

### Notes

- Follow the adaptive approach: define distinct layouts per breakpoint rather than fluid scaling
- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) as primary mechanism
- Minimum touch target size: 44x44px on mobile
- Minimum font size for inputs: 16px (to prevent iOS zoom)
- Bottom tab bar height: 56-64px
- Support safe area insets for notched devices
- All responsive changes must not break print functionality
- Verify dark mode works at all breakpoints

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [X] 0.0 Create feature branch

  - [X] 0.1 Create and checkout a new branch `feature/responsive-screen`
- [X] 1.0 Build responsive infrastructure

  - [X] 1.1 Read `index.html` and update/add viewport meta tag with `width=device-width, initial-scale=1.0, viewport-fit=cover`
  - [X] 1.2 Read `src/index.css` to understand current global styles and print styles
  - [X] 1.3 Add CSS safe area inset variables to `src/index.css` (e.g., `env(safe-area-inset-bottom)` for notched devices)
  - [X] 1.4 Add global mobile-specific utilities to `src/index.css` (e.g., `.pb-safe` for bottom padding, touch target sizing utilities)
  - [X] 1.5 Create `src/hooks/useBreakpoint.ts` hook that detects current breakpoint using window.matchMedia for mobile (<768px), tablet (768-1023px), desktop (1024px+)
  - [X] 1.6 Test `useBreakpoint` hook in browser DevTools at 320px, 768px, 1024px, 1280px
- [X] 2.0 Implement adaptive navigation

  - [X] 2.1 Create `src/components/layout/BottomTabBar.tsx` component with 5 tabs (Dashboard, Invoice, PO, Receipt, More)
  - [X] 2.2 Implement "More" tab dropdown menu in BottomTabBar with Customers, Settings, Logout options
  - [X] 2.3 Style BottomTabBar with `fixed bottom-0`, height 56-64px, safe area insets, active state highlighting, `print:hidden`
  - [X] 2.4 Read `src/components/layout/Header.tsx` to understand current Sidebar implementation
  - [X] 2.5 Add collapse/expand state to Sidebar component for tablet breakpoint (icon-only `w-16` by default, expandable to `w-64`)
  - [X] 2.6 Read `src/App.tsx` to understand current layout structure
  - [X] 2.7 Integrate BottomTabBar into `App.tsx` — visible on mobile (<768px), hidden on tablet/desktop
  - [X] 2.8 Update Sidebar visibility in `App.tsx` — hidden on mobile (<768px), collapsible on tablet (768-1023px), full on desktop (1024px+)
  - [X] 2.9 Adjust main content area padding in `App.tsx` — `p-4 pb-20` on mobile, `p-6` on tablet, `p-8` on desktop
  - [X] 2.10 Test navigation switching at breakpoints in DevTools (mobile bottom bar, tablet collapsible sidebar, desktop full sidebar)
- [X] 3.0 Make Dashboard responsive

  - [X] 3.1 Read `src/pages/DashboardPage.tsx` to understand current grid layouts and components
  - [X] 3.2 Update stat cards grid to `grid-cols-1 md:grid-cols-2 xl:grid-cols-4`
  - [X] 3.3 Update charts section grid to `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - [X] 3.4 Update document count cards grid to `grid-cols-1 md:grid-cols-3`
  - [X] 3.5 Make dashboard page header stack vertically on mobile — title and date filter full-width
  - [X] 3.6 Test Dashboard at 320px, 768px, 1024px, 1280px — verify no horizontal overflow, all cards readable
- [X] 4.0 Make Document List pages responsive

  - [X] 4.1 Read `src/pages/InvoicesPage.tsx` to understand current filter bar and document list layout
  - [X] 4.2 Make filter/action bar responsive on InvoicesPage — stack search, filters, create button vertically on mobile, inline on tablet/desktop
  - [X] 4.3 Add optional floating action button (FAB) for "Create Invoice" on mobile, positioned bottom-right above bottom tab bar
  - [X] 4.4 Read `src/components/layout/DocumentList.tsx` to understand card structure
  - [X] 4.5 Update DocumentList cards to be full-width on mobile with compact info display, minimum 44px touch target height
  - [X] 4.6 Apply same responsive filter bar changes to `src/pages/PurchaseOrdersPage.tsx`
  - [X] 4.7 Add optional FAB for "Create PO" on PurchaseOrdersPage mobile view
  - [X] 4.8 Apply same responsive filter bar changes to `src/pages/ReceiptsPage.tsx`
  - [X] 4.9 Add optional FAB for "Create Receipt" on ReceiptsPage mobile view
  - [X] 4.10 Read `src/pages/CustomersPage.tsx` and apply same responsive filter bar and list card patterns
  - [X] 4.11 Test all document list pages at 320px, 768px, 1280px — verify search/filters usable, cards tappable
- [X] 5.0 Make Document Forms responsive

  - [X] 5.1 Read `src/components/forms/InvoiceForm.tsx` to understand current form structure
  - [X] 5.2 Implement stacked layout for InvoiceForm on mobile/tablet — form fields on top, preview below (scrollable)
  - [X] 5.3 Update form field grids in InvoiceForm — `grid-cols-1` on mobile, `grid-cols-2` on tablet where logical
  - [X] 5.4 Read `src/components/forms/CompanyInfoFields.tsx` and update to `grid-cols-1 md:grid-cols-2`
  - [X] 5.5 Read `src/components/forms/CustomerInfoFields.tsx` and update to `grid-cols-1 md:grid-cols-2`
  - [X] 5.6 Read `src/components/forms/LineItemsEditor.tsx` to understand current table-based layout
  - [X] 5.7 Create `src/components/forms/MobileLineItemCard.tsx` — card-based line item with stacked/mini-grid fields (description, qty, unit, price, tax, total)
  - [X] 5.8 Update `LineItemsEditor` to use MobileLineItemCard on mobile (<768px), table layout on tablet/desktop
  - [X] 5.9 Ensure add/remove item buttons in LineItemsEditor have min 44px touch targets on mobile
  - [X] 5.10 Update summary totals in LineItemsEditor to be clearly visible at bottom on mobile
  - [X] 5.11 Read `src/components/forms/CustomerSelector.tsx` and make it full-width on mobile with touch-friendly target sizes
  - [X] 5.12 Read `src/components/forms/PayerSelector.tsx` and make it full-width on mobile with touch-friendly target sizes
  - [X] 5.13 Apply same responsive form changes (5.2-5.12) to `src/components/forms/PurchaseOrderForm.tsx`
  - [X] 5.14 Apply same responsive form changes (5.2-5.12) to `src/components/forms/ReceiptForm.tsx`
  - [X] 5.15 Update form inputs to use `type="tel"` for phone, `type="email"` for email, `inputmode="decimal"` for currency
  - [X] 5.16 Ensure all form inputs have min font-size 16px to prevent iOS zoom
  - [X] 5.17 Create `src/components/layout/MobileActionBar.tsx` — sticky bottom action bar for preview pages (Print, Download, Email buttons)
  - [X] 5.18 Test all forms at 320px, 768px, 1280px — verify all fields accessible, line items usable, preview scrollable
- [X] 6.0 Make Document Previews responsive

  - [X] 6.1 Read `src/components/previews/InvoicePreview.tsx` to understand current preview layout
  - [X] 6.2 Update InvoicePreview to use `max-w-full` on mobile, scale content down, use `text-xs` to `text-sm` for readability
  - [X] 6.3 Make company/customer info grid in InvoicePreview stack on narrow screens (<480px) — `grid-cols-1 sm:grid-cols-2`
  - [X] 6.4 Wrap preview tables in InvoicePreview with `overflow-x-auto` for horizontal scroll on mobile
  - [X] 6.5 Integrate MobileActionBar into InvoicePreview — sticky bottom bar with Print/Download/Email buttons on mobile, inline on desktop
  - [X] 6.6 Apply same responsive preview changes (6.2-6.5) to `src/components/previews/PurchaseOrderPreview.tsx`
  - [X] 6.7 Apply same responsive preview changes (6.2-6.5) to `src/components/previews/ReceiptPreview.tsx`
  - [X] 6.8 Test all previews at 320px, 768px, 1280px — verify readable, scrollable tables, action buttons accessible
- [X] 7.0 Make Settings page responsive

  - [X] 7.1 Read `src/pages/SettingsPage.tsx` to understand current tab navigation and card layout
  - [X] 7.2 Update settings tabs to use horizontal scrollable layout on mobile — `overflow-x-auto`, show icon + label
  - [X] 7.3 Ensure tabs remain inline on desktop, scrollable on mobile/tablet
  - [X] 7.4 Read `src/components/settings/ProfileSettingsCard.tsx` and make form fields stack vertically on mobile — full-width inputs
  - [X] 7.5 Read `src/components/settings/OrganizationSettingsCard.tsx` and apply same responsive form pattern
  - [X] 7.6 Read `src/components/settings/TeamManagementCard.tsx` and update to card-based layout on mobile (name, email, role, actions), table on desktop
  - [X] 7.7 Read `src/components/settings/EmailSettingsCard.tsx` and apply responsive form pattern
  - [X] 7.8 Read `src/components/settings/EmailTemplateCard.tsx` and apply responsive form pattern
  - [X] 7.9 Read `src/components/settings/ReminderSettingsCard.tsx` and apply responsive form pattern
  - [X] 7.10 Read `src/components/settings/WatermarkSettingsCard.tsx` and apply responsive form pattern
  - [X] 7.11 Read `src/components/settings/TermsTemplatesCard.tsx` and apply responsive form pattern
  - [X] 7.12 Read `src/components/settings/ChangePasswordCard.tsx` and apply responsive form pattern
  - [X] 7.13 Read `src/components/settings/InviteMemberDialog.tsx` and make it full-width on mobile (`max-w-[calc(100vw-2rem)]`)
  - [X] 7.14 Test Settings page at 320px, 768px, 1280px — verify tabs scrollable, all cards/forms usable
- [X] 8.0 Make Auth pages responsive

  - [X] 8.1 Read `src/pages/LoginPage.tsx` to understand current layout
  - [X] 8.2 Update LoginPage to use `max-w-sm` on mobile with `px-4` padding, center vertically and horizontally at all breakpoints
  - [X] 8.3 Ensure all inputs in LoginPage are full-width with min 16px font size
  - [X] 8.4 Make Google OAuth button full-width on mobile
  - [X] 8.5 Apply same responsive auth layout (8.2-8.4) to `src/pages/RegisterPage.tsx`
  - [X] 8.6 Apply same responsive auth layout (8.2-8.4) to `src/pages/ForgotPasswordPage.tsx`
  - [X] 8.7 Apply same responsive auth layout (8.2-8.4) to `src/pages/ResetPasswordPage.tsx`
  - [X] 8.8 Apply same responsive auth layout (8.2-8.4) to `src/pages/AcceptInvitationPage.tsx`
  - [X] 8.9 Test all auth pages at 320px, 768px, 1280px — verify centered, inputs usable, buttons tappable
- [X] 9.0 Make Dialogs & Modals responsive

  - [X] 9.1 Read `src/components/forms/EmailDialog.tsx` to understand dialog structure
  - [X] 9.2 Update EmailDialog to be full-width on mobile with `max-w-[calc(100vw-2rem)]`, full-width buttons
  - [X] 9.3 Consider bottom-sheet pattern for EmailDialog on mobile (slide up from bottom) if feasible with Radix Dialog
  - [X] 9.4 Read `src/components/settings/InviteMemberDialog.tsx` and apply same responsive dialog pattern
  - [X] 9.5 Check all other dialogs in codebase (search for `<Dialog` or `<AlertDialog`) and apply responsive pattern
  - [X] 9.6 Ensure all dialogs prevent body scroll when open on mobile
  - [X] 9.7 Test all dialogs at 320px, 768px, 1280px — verify full-width on mobile, centered on desktop, usable buttons
- [ ] 10.0 Polish & cross-breakpoint QA

  - [ ] 10.1 Audit all interactive elements (buttons, links, form controls) to ensure min 44px touch target on mobile
  - [ ] 10.2 Audit all form inputs to ensure min 16px font size on mobile (prevent iOS zoom)
  - [ ] 10.3 Audit spacing between tappable elements — ensure min 8px gap on mobile
  - [ ] 10.4 Verify print styles still work — test print preview at mobile, tablet, desktop breakpoints, ensure BottomTabBar and navigation hidden
  - [ ] 10.5 Verify dark mode still works at all breakpoints — test theme toggle on mobile, tablet, desktop
  - [ ] 10.6 Test all 11 pages at 320px (iPhone SE) — verify no horizontal scrollbar, all content readable and functional
  - [ ] 10.7 Test all 11 pages at 375px (iPhone 12/13/14) — verify no horizontal scrollbar, all content readable and functional
  - [ ] 10.8 Test all 11 pages at 768px (iPad portrait) — verify tablet layout with collapsible sidebar or bottom tabs as appropriate
  - [ ] 10.9 Test all 11 pages at 1024px (iPad landscape / small laptop) — verify full sidebar visible, optimal layout
  - [ ] 10.10 Test all 11 pages at 1280px+ (desktop) — verify no regression, desktop layout identical to original
  - [ ] 10.11 Test form submission flows on mobile (create invoice, create PO, create receipt) — ensure all fields accessible, no errors
  - [ ] 10.12 Test navigation flows on mobile — bottom tab bar switches views correctly, "More" menu works, logout functions
  - [ ] 10.13 Verify no layout shift or jank on initial page load at any breakpoint
  - [ ] 10.14 Run Lighthouse mobile audit — ensure no accessibility warnings related to touch targets or contrast
  - [ ] 10.15 Document any remaining open questions or edge cases discovered during testing in PRD section 9
