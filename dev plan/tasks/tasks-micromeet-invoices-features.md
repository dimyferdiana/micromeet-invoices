# Task List: Micromeet Invoices - Fitur Lanjutan

Berdasarkan PRD: [prd-micromeet-invoices.md](./prd-micromeet-invoices.md)

---

## Relevant Files

### UI Components

- `src/components/ui/status-badge.tsx` - Badge component untuk menampilkan status dokumen dengan warna
- `src/components/ui/search-input.tsx` - Input dengan icon search untuk pencarian
- `src/components/ui/file-upload.tsx` - Component untuk upload file (logo, signature)
- `src/components/ui/stat-card.tsx` - Card untuk menampilkan statistik di dashboard

### Form Components

- `src/components/forms/StatusDropdown.tsx` - Dropdown untuk mengubah status dokumen
- `src/components/forms/EmailDialog.tsx` - Dialog untuk mengirim email dengan dokumen

### Pages

- `src/pages/InvoicesPage.tsx` - Update: tambah search, filter, status management
- `src/pages/PurchaseOrdersPage.tsx` - Update: tambah search, filter, status management
- `src/pages/ReceiptsPage.tsx` - Update: tambah search, filter, status management
- `src/pages/DashboardPage.tsx` - New/Update: halaman dashboard dengan statistik
- `src/pages/SettingsPage.tsx` - Update: tambah bank info, logo, signature, SMTP settings

### Preview Components

- `src/components/previews/InvoicePreview.tsx` - Update: tambah logo, signature, bank info
- `src/components/previews/POPreview.tsx` - Update: tambah logo, signature
- `src/components/previews/ReceiptPreview.tsx` - Update: tambah logo, signature

### Convex Backend

- `convex/schema.ts` - Update: tambah bankAccounts, emailSettings, emailLogs tables
- `convex/invoices.ts` - Update: tambah update, updateStatus, remove, search functions
- `convex/purchaseOrders.ts` - Update: tambah update, updateStatus, remove, search functions
- `convex/receipts.ts` - Update: tambah update, remove, search functions
- `convex/bankAccounts.ts` - New: CRUD untuk informasi bank
- `convex/emailSettings.ts` - New: get/set SMTP settings
- `convex/emails.ts` - New: action untuk kirim email
- `convex/dashboard.ts` - New: queries untuk statistik
- `convex/files.ts` - New: upload/get logo dan signature
- `convex/crons.ts` - New: scheduled job untuk auto-overdue check

### Lib/Utils

- `src/lib/types.ts` - Update: tambah types untuk status, bank, email
- `src/lib/pdf.ts` - New: utility untuk generate PDF
- `src/lib/print.ts` - New: utility untuk print

---

## Notes

- Gunakan `html2pdf.js` untuk generate PDF dari HTML preview
- Gunakan `recharts` untuk chart di dashboard
- File upload menggunakan Convex built-in file storage
- SMTP password harus disimpan dengan aman (encrypted)
- Status `overdue` dihitung otomatis berdasarkan tanggal jatuh tempo

---

## Instructions for Completing Tasks

**IMPORTANT:** Saat menyelesaikan setiap task, tandai dengan mengubah `- [ ]` menjadi `- [x]`. Update file ini setelah menyelesaikan setiap sub-task.

Contoh:

- `- [ ] 1.1 Buat component` → `- [x] 1.1 Buat component` (setelah selesai)

---

## Tasks

### Phase 1: Core Document Management

- [X] **0.0 Create feature branch**

  - [X] 0.1 Create and checkout branch: `git checkout -b feature/document-management`
- [X] **1.0 Implement Document Status Management (FR-1)**

  - [X] 1.1 Update `convex/schema.ts` - pastikan field `status` ada di semua document tables
  - [X] 1.2 Create `src/components/ui/status-badge.tsx` - badge dengan warna sesuai status
  - [X] 1.3 Create `src/components/forms/StatusDropdown.tsx` - dropdown untuk ubah status
  - [X] 1.4 Add `invoices.updateStatus` mutation di `convex/invoices.ts`
  - [X] 1.5 Add `purchaseOrders.updateStatus` mutation di `convex/purchaseOrders.ts`
  - [X] 1.6 Update `InvoicesPage.tsx` - tampilkan StatusBadge dan StatusDropdown
  - [X] 1.7 Update `PurchaseOrdersPage.tsx` - tampilkan StatusBadge dan StatusDropdown
  - [X] 1.8 Update `ReceiptsPage.tsx` - tampilkan StatusBadge (receipt tidak perlu status flow)
  - [X] 1.9 Implement auto-overdue logic - cek invoice yang melewati due date (cron job + dashboard refresh)
- [X] **2.0 Implement Edit Document Feature (FR-2)**

  - [X] 2.1 Add `invoices.get` query untuk fetch single invoice by ID
  - [X] 2.2 Add `invoices.update` mutation di `convex/invoices.ts`
  - [X] 2.3 Add `purchaseOrders.get` query untuk fetch single PO by ID
  - [X] 2.4 Add `purchaseOrders.update` mutation di `convex/purchaseOrders.ts`
  - [X] 2.5 Add `receipts.get` query untuk fetch single receipt by ID
  - [X] 2.6 Add `receipts.update` mutation di `convex/receipts.ts`
  - [X] 2.7 Update `InvoiceForm.tsx` - support edit mode dengan pre-fill data
  - [X] 2.8 Update `PurchaseOrderForm.tsx` - support edit mode dengan pre-fill data
  - [X] 2.9 Update `ReceiptForm.tsx` - support edit mode dengan pre-fill data
  - [X] 2.10 Add edit button dan routing di halaman list masing-masing
  - [X] 2.11 Prevent edit untuk dokumen dengan status `paid`
- [X] **3.0 Implement Delete Document Feature (FR-3)**

  - [X] 3.1 Add `invoices.remove` mutation di `convex/invoices.ts`
  - [X] 3.2 Add `purchaseOrders.remove` mutation di `convex/purchaseOrders.ts`
  - [X] 3.3 Add `receipts.remove` mutation di `convex/receipts.ts`
  - [X] 3.4 Create delete confirmation dialog component
  - [X] 3.5 Add delete button di `InvoicesPage.tsx` dengan konfirmasi
  - [X] 3.6 Add delete button di `PurchaseOrdersPage.tsx` dengan konfirmasi
  - [X] 3.7 Add delete button di `ReceiptsPage.tsx` dengan konfirmasi
  - [X] 3.8 Show toast notification setelah delete berhasil

---

### Phase 2: Export & Print

- [X] **4.0 Implement PDF Export Feature (FR-4)**

  - [X] 4.1 Install `html2pdf.js`: `npm install html2pdf.js`
  - [X] 4.2 Create `src/lib/pdf.ts` - utility function untuk generate PDF
  - [X] 4.3 Add "Download PDF" button di `InvoicesPage.tsx` (preview mode)
  - [X] 4.4 Add "Download PDF" button di `PurchaseOrdersPage.tsx` (preview mode)
  - [X] 4.5 Add "Download PDF" button di `ReceiptsPage.tsx` (preview mode)
  - [X] 4.6 Implement PDF generation dengan nama file: `{TYPE}-{NUMBER}.pdf`
  - [X] 4.7 Test PDF output - pastikan layout sesuai preview
- [X] **5.0 Implement Print Document Feature (FR-5)**

  - [X] 5.1 Create `src/lib/print.ts` - utility function untuk print
  - [X] 5.2 Add CSS print styles di `src/index.css` - hide non-printable elements
  - [X] 5.3 Print button already exists in `InvoicesPage.tsx`
  - [X] 5.4 Print button already exists in `PurchaseOrdersPage.tsx`
  - [X] 5.5 Print button already exists in `ReceiptsPage.tsx`
  - [X] 5.6 Test print output - pastikan layout optimal untuk A4

---

### Phase 3: Search & Dashboard

- [X] **6.0 Implement Search & Filter Documents (FR-6)**

  - [X] 6.1 Create `src/components/ui/search-input.tsx` - input dengan icon search
  - [X] 6.2 Add `invoices.search` query di `convex/invoices.ts`
  - [X] 6.3 Add `purchaseOrders.search` query di `convex/purchaseOrders.ts`
  - [X] 6.4 Add `receipts.search` query di `convex/receipts.ts`
  - [X] 6.5 Update `InvoicesPage.tsx` - add search input dan filter by status
  - [X] 6.6 Update `PurchaseOrdersPage.tsx` - add search input dan filter by status
  - [X] 6.7 Update `ReceiptsPage.tsx` - add search input
  - [X] 6.8 Implement debounced search untuk performa
  - [X] 6.9 Add filter by date range
- [X] **7.0 Implement Dashboard Statistics (FR-7)**

  - [X] 7.1 Install `recharts`: `npm install recharts`
  - [X] 7.2 Create `convex/dashboard.ts` dengan queries untuk statistik
  - [X] 7.3 Create `src/components/ui/stat-card.tsx` - card untuk menampilkan angka
  - [X] 7.4 Create/Update `DashboardPage.tsx` sebagai halaman utama
  - [X] 7.5 Implement stat: Total pendapatan bulan ini
  - [X] 7.6 Implement stat: Jumlah invoice pending
  - [X] 7.7 Implement stat: Jumlah invoice overdue
  - [X] 7.8 Implement chart: Pendapatan 6 bulan terakhir
  - [X] 7.9 Implement list: Top 5 pelanggan
  - [X] 7.10 Update navigation untuk jadikan Dashboard sebagai home

---

### Phase 4: Branding

- [X] **8.0 Implement Bank Information Feature (FR-8)**

  - [X] 8.1 Update `convex/schema.ts` - add `bankAccounts` table
  - [X] 8.2 Create `convex/bankAccounts.ts` - CRUD mutations/queries
  - [X] 8.3 Update `src/lib/types.ts` - add BankAccount type
  - [X] 8.4 Create bank account form di `SettingsPage.tsx`
  - [X] 8.5 Support multiple bank accounts
  - [X] 8.6 Update `InvoicePreview.tsx` - tampilkan informasi bank
  - [X] 8.7 Update PDF export untuk include bank info (N/A - PDF removed, using Print/Download)
- [X] **9.0 Implement Company Logo Upload (FR-9)**

  - [X] 9.1 Create `convex/files.ts` - file upload/download functions
  - [X] 9.2 Create `src/components/ui/file-upload.tsx` - upload component
  - [X] 9.3 Update `convex/companySettings.ts` - add logoFileId field
  - [X] 9.4 Add logo upload section di `SettingsPage.tsx`
  - [X] 9.5 Update `InvoicePreview.tsx` - tampilkan logo di header
  - [X] 9.6 Update `POPreview.tsx` - tampilkan logo di header
  - [X] 9.7 Update `ReceiptPreview.tsx` - tampilkan logo di header
  - [X] 9.8 Validate file type (PNG, JPG, SVG) dan max size (2MB)
- [X] **10.0 Implement Signature/Stamp Upload (FR-10)**

  - [X] 10.1 Update `convex/companySettings.ts` - add signatureFileId, stampFileId fields
  - [X] 10.2 Add signature upload section di `SettingsPage.tsx`
  - [X] 10.3 Add stamp upload section di `SettingsPage.tsx` (optional)
  - [X] 10.4 Update `InvoicePreview.tsx` - tampilkan signature di footer
  - [X] 10.5 Update `POPreview.tsx` - tampilkan signature di footer
  - [X] 10.6 Update `ReceiptPreview.tsx` - tampilkan signature di footer
  - [X] 10.7 Support transparent PNG untuk signature

---

### Phase 5: Email Integration

- [ ] **11.0 Implement Email Integration with Tutorial (FR-11)**
  - [ ] 11.1 Update `convex/schema.ts` - add `emailSettings` dan `emailLogs` tables
  - [ ] 11.2 Create `convex/emailSettings.ts` - get/set SMTP settings
  - [ ] 11.3 Create `convex/emails.ts` - action untuk kirim email dengan Nodemailer
  - [ ] 11.4 Update `src/lib/types.ts` - add EmailSettings, EmailLog types
  - [ ] 11.5 Create SMTP settings form di `SettingsPage.tsx`
  - [ ] 11.6 Create email tutorial component dengan accordion (Gmail, Yahoo, Custom)
  - [ ] 11.7 Add "Test Connection" button untuk verify SMTP
  - [ ] 11.8 Create `src/components/forms/EmailDialog.tsx` - dialog kirim email
  - [ ] 11.9 Add "Kirim Email" button di invoice detail/preview
  - [ ] 11.10 Implement email dengan PDF attachment
  - [ ] 11.11 Create default email template dengan placeholders
  - [ ] 11.12 Log email status (sent/failed) ke emailLogs table
  - [ ] 11.13 Show email history di detail dokumen (optional)

---

## Completion Checklist

- [ ] All 11 parent tasks completed
- [ ] All sub-tasks marked as done
- [ ] TypeScript build passes: `npm run build`
- [ ] No console errors in browser
- [ ] Features tested on different document types (Invoice, PO, Receipt)
- [ ] PDF export tested
- [ ] Print tested
- [ ] Email send tested (with test SMTP)
- [ ] Code committed and pushed to feature branch
- [ ] Ready for code review / merge to main

---

*Generated from PRD: prd-micromeet-invoices.md*
*Created: Februari 2026*
