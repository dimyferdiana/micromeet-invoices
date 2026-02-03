# Product Requirements Document (PRD)
# Micromeet Invoices - Fitur Lanjutan

**Versi:** 1.0
**Tanggal:** Februari 2026
**Status:** Draft

---

## 1. Introduction / Overview

**Micromeet Invoices** adalah aplikasi web untuk membuat dan mengelola dokumen bisnis (Invoice, Purchase Order, dan Kwitansi) dengan tampilan profesional dan mudah digunakan.

### Masalah yang Diselesaikan

Pelaku usaha di Indonesia sering menghadapi kesulitan dalam:
- Membuat dokumen bisnis yang profesional dan konsisten
- Melacak status pembayaran invoice
- Menyimpan dan mencari dokumen yang sudah dibuat
- Mengirim dokumen ke pelanggan dalam format yang tepat

### Solusi

Aplikasi ini menyediakan platform all-in-one untuk membuat, mengelola, mencetak, dan mengirim dokumen bisnis dengan fitur:
- Template dokumen profesional dalam Bahasa Indonesia
- Manajemen status dokumen (Draft → Terkirim → Lunas)
- Export PDF dan cetak langsung
- Integrasi email untuk pengiriman dokumen
- Dashboard statistik untuk monitoring bisnis

---

## 2. Goals

### Primary Goals

| No | Goal | Metric |
|----|------|--------|
| G1 | Mempercepat pembuatan dokumen bisnis | Waktu buat dokumen < 2 menit |
| G2 | Meningkatkan profesionalisme dokumen | Template konsisten & branded |
| G3 | Memudahkan tracking pembayaran | Status dokumen real-time |
| G4 | Menyediakan berbagai cara distribusi dokumen | PDF, Print, Email tersedia |

### Secondary Goals

| No | Goal | Metric |
|----|------|--------|
| G5 | Memberikan insight bisnis | Dashboard dengan statistik |
| G6 | Branding perusahaan | Logo & tanda tangan di dokumen |
| G7 | Mengurangi kesalahan input | Auto-fill dari data tersimpan |

---

## 3. Target Users

### User Personas

#### Persona 1: Pemilik UMKM
- **Profil:** Usaha kecil 1-5 karyawan
- **Kebutuhan:** Buat invoice cepat, cetak untuk pelanggan offline
- **Pain Point:** Tidak punya waktu belajar software kompleks

#### Persona 2: Freelancer / Pekerja Mandiri
- **Profil:** Bekerja sendiri, klien beragam
- **Kebutuhan:** Dokumen profesional, kirim via email
- **Pain Point:** Tidak punya staf admin

#### Persona 3: Bisnis Menengah
- **Profil:** 5-50 karyawan, volume transaksi tinggi
- **Kebutuhan:** Tracking status, laporan statistik
- **Pain Point:** Sulit monitor invoice pending

---

## 4. User Stories

### Manajemen Dokumen

| ID | User Story | Priority |
|----|------------|----------|
| US-01 | Sebagai pengguna, saya ingin mengubah status invoice dari Draft ke Terkirim, agar saya tahu dokumen mana yang sudah dikirim | High |
| US-02 | Sebagai pengguna, saya ingin menandai invoice sebagai Lunas, agar saya tahu pembayaran mana yang sudah masuk | High |
| US-03 | Sebagai pengguna, saya ingin mengedit dokumen yang sudah tersimpan, agar saya bisa memperbaiki kesalahan | High |
| US-04 | Sebagai pengguna, saya ingin menghapus dokumen yang tidak diperlukan, agar daftar dokumen tetap rapi | High |

### Export & Distribusi

| ID | User Story | Priority |
|----|------------|----------|
| US-05 | Sebagai pengguna, saya ingin download dokumen sebagai PDF, agar saya bisa mengirimnya via WhatsApp/email | High |
| US-06 | Sebagai pengguna, saya ingin mencetak dokumen langsung dari browser, agar saya bisa memberikan hardcopy ke pelanggan | High |
| US-07 | Sebagai pengguna, saya ingin mengirim dokumen via email langsung dari aplikasi, agar tidak perlu buka email terpisah | Medium |

### Pencarian & Filter

| ID | User Story | Priority |
|----|------------|----------|
| US-08 | Sebagai pengguna, saya ingin mencari dokumen berdasarkan nomor atau nama pelanggan, agar saya cepat menemukan dokumen | Medium |
| US-09 | Sebagai pengguna, saya ingin memfilter dokumen berdasarkan status, agar saya fokus pada invoice pending | Medium |

### Dashboard & Statistik

| ID | User Story | Priority |
|----|------------|----------|
| US-10 | Sebagai pengguna, saya ingin melihat total pendapatan bulan ini, agar saya tahu performa bisnis | Medium |
| US-11 | Sebagai pengguna, saya ingin melihat invoice yang sudah jatuh tempo, agar saya bisa follow up | Medium |

### Branding

| ID | User Story | Priority |
|----|------------|----------|
| US-12 | Sebagai pengguna, saya ingin upload logo perusahaan, agar muncul di semua dokumen | Medium |
| US-13 | Sebagai pengguna, saya ingin upload tanda tangan digital, agar dokumen terlihat resmi | Medium |
| US-14 | Sebagai pengguna, saya ingin menambahkan informasi rekening bank, agar pelanggan tahu cara transfer | Medium |

---

## 5. Functional Requirements

### FR-1: Manajemen Status Dokumen

| ID | Requirement | Details |
|----|-------------|---------|
| FR-1.1 | Sistem harus menyediakan status dokumen | Status: `draft`, `sent`, `paid`, `cancelled`, `overdue` |
| FR-1.2 | User harus bisa mengubah status dokumen | Dropdown atau tombol aksi di halaman list/detail |
| FR-1.3 | Status harus ditampilkan dengan badge berwarna | Draft=Gray, Sent=Blue, Paid=Green, Cancelled=Red, Overdue=Orange |
| FR-1.4 | Sistem harus otomatis menandai invoice overdue | Jika melewati tanggal jatuh tempo dan belum paid |

### FR-2: Edit Dokumen

| ID | Requirement | Details |
|----|-------------|---------|
| FR-2.1 | User harus bisa mengedit dokumen yang tersimpan | Tombol Edit di halaman list dan detail |
| FR-2.2 | Form edit harus pre-fill dengan data existing | Load data dari database |
| FR-2.3 | Perubahan harus tersimpan ke database | Update mutation di Convex |
| FR-2.4 | Dokumen dengan status `paid` tidak boleh diedit | Tampilkan pesan warning |

### FR-3: Hapus Dokumen

| ID | Requirement | Details |
|----|-------------|---------|
| FR-3.1 | User harus bisa menghapus dokumen | Tombol Delete dengan konfirmasi |
| FR-3.2 | Konfirmasi harus ditampilkan sebelum hapus | Dialog: "Apakah Anda yakin ingin menghapus [nama dokumen]?" |
| FR-3.3 | Dokumen yang dihapus tidak bisa dikembalikan | Hard delete dari database |

### FR-4: Export PDF

| ID | Requirement | Details |
|----|-------------|---------|
| FR-4.1 | User harus bisa download dokumen sebagai PDF | Tombol "Download PDF" di halaman preview/detail |
| FR-4.2 | PDF harus sesuai dengan tampilan preview | Gunakan library html2pdf.js |
| FR-4.3 | Nama file PDF harus descriptive | Format: `{TYPE}-{NUMBER}.pdf` (contoh: INV-2026-0001.pdf) |
| FR-4.4 | PDF harus include logo dan tanda tangan jika ada | Render dari company settings |

### FR-5: Cetak Dokumen

| ID | Requirement | Details |
|----|-------------|---------|
| FR-5.1 | User harus bisa mencetak dokumen langsung | Tombol "Print" di halaman preview/detail |
| FR-5.2 | Layout cetak harus optimal untuk kertas A4 | CSS print media query |
| FR-5.3 | Elemen UI (tombol, navigasi) tidak boleh tercetak | Hide non-printable elements |

### FR-6: Cari & Filter Dokumen

| ID | Requirement | Details |
|----|-------------|---------|
| FR-6.1 | User harus bisa mencari dokumen | Search input di halaman list |
| FR-6.2 | Pencarian harus mencakup nomor dokumen dan nama pelanggan | Full-text search |
| FR-6.3 | User harus bisa filter berdasarkan status | Dropdown/tabs filter |
| FR-6.4 | User harus bisa filter berdasarkan rentang tanggal | Date range picker |

### FR-7: Dashboard Statistik

| ID | Requirement | Details |
|----|-------------|---------|
| FR-7.1 | Dashboard harus menampilkan total pendapatan bulan ini | Sum of paid invoices |
| FR-7.2 | Dashboard harus menampilkan jumlah invoice pending | Count of sent invoices |
| FR-7.3 | Dashboard harus menampilkan invoice overdue | Count and list |
| FR-7.4 | Dashboard harus menampilkan grafik pendapatan 6 bulan | Bar/line chart |
| FR-7.5 | Dashboard harus menampilkan top 5 pelanggan | By total transaction value |

### FR-8: Informasi Bank

| ID | Requirement | Details |
|----|-------------|---------|
| FR-8.1 | User harus bisa menambahkan informasi rekening bank | Di halaman pengaturan perusahaan |
| FR-8.2 | Informasi bank meliputi: nama bank, nomor rekening, nama pemilik | Form input |
| FR-8.3 | Informasi bank harus muncul di invoice | Section "Pembayaran dapat ditransfer ke:" |
| FR-8.4 | User bisa memiliki multiple rekening bank | Support array of bank accounts |

### FR-9: Upload Logo Perusahaan

| ID | Requirement | Details |
|----|-------------|---------|
| FR-9.1 | User harus bisa upload logo perusahaan | Image upload di pengaturan |
| FR-9.2 | Format yang didukung: PNG, JPG, SVG | Max size 2MB |
| FR-9.3 | Logo harus muncul di header dokumen | Preview component update |
| FR-9.4 | Logo harus disimpan di Convex file storage | Use Convex file upload |

### FR-10: Upload Tanda Tangan / Cap

| ID | Requirement | Details |
|----|-------------|---------|
| FR-10.1 | User harus bisa upload tanda tangan digital | Image upload di pengaturan |
| FR-10.2 | User bisa upload cap/stempel perusahaan | Optional, separate field |
| FR-10.3 | Tanda tangan harus muncul di footer dokumen | Signature section |
| FR-10.4 | Background tanda tangan harus transparan | Accept PNG with transparency |

### FR-11: Kirim Email (dengan Tutorial Setup)

| ID | Requirement | Details |
|----|-------------|---------|
| FR-11.1 | User harus bisa mengirim dokumen via email | Tombol "Kirim Email" di detail/preview |
| FR-11.2 | User harus setup SMTP credentials | Form di halaman pengaturan |
| FR-11.3 | Aplikasi harus menyediakan tutorial setup | Step-by-step guide untuk Gmail, Yahoo, dll |
| FR-11.4 | Email harus include PDF attachment | Generate PDF dan attach |
| FR-11.5 | Email template harus customizable | Subject dan body default dengan placeholder |
| FR-11.6 | Status email harus ditrack | sent, failed dengan error message |

---

## 6. Non-Goals (Out of Scope)

Fitur berikut **TIDAK** termasuk dalam scope PRD ini:

| No | Feature | Reason |
|----|---------|--------|
| 1 | Multi-currency support | Fokus pada pasar Indonesia (IDR) |
| 2 | Payment gateway integration | Kompleksitas tinggi, phase berikutnya |
| 3 | Accounting software integration | Memerlukan third-party API |
| 4 | Mobile native app | Web responsive sudah cukup |
| 5 | Invoice recurring/subscription | Nice to have, phase berikutnya |
| 6 | Multi-user / team collaboration | Single user untuk MVP |
| 7 | Dark mode | Nice to have, tidak critical |

---

## 7. Design Considerations

### UI/UX Guidelines

- **Konsistensi:** Gunakan shadcn/ui components yang sudah ada
- **Responsive:** Optimal untuk desktop, usable di tablet
- **Bahasa:** Semua label dalam Bahasa Indonesia
- **Feedback:** Toast notification untuk setiap aksi (save, delete, send)

### Component yang Perlu Dibuat

| Component | Location | Description |
|-----------|----------|-------------|
| `StatusBadge` | `src/components/ui/` | Badge berwarna untuk status dokumen |
| `StatusDropdown` | `src/components/forms/` | Dropdown untuk ubah status |
| `SearchInput` | `src/components/ui/` | Input dengan icon search |
| `DateRangePicker` | `src/components/ui/` | Picker untuk filter tanggal |
| `StatCard` | `src/components/dashboard/` | Card untuk statistik |
| `Chart` | `src/components/dashboard/` | Line/bar chart (recharts) |
| `FileUpload` | `src/components/ui/` | Upload untuk logo/signature |
| `EmailDialog` | `src/components/forms/` | Dialog untuk kirim email |

### Page yang Perlu Dibuat/Update

| Page | Route | Changes |
|------|-------|---------|
| Dashboard | `/` | Tambah statistik cards dan chart |
| Invoice List | `/invoices` | Tambah search, filter, status dropdown |
| Invoice Detail | `/invoices/:id` | Tambah tombol edit, delete, status, PDF, print, email |
| Settings | `/settings` | Tambah logo upload, signature upload, bank info, SMTP setup |

---

## 8. Technical Considerations

### Tech Stack (Existing)

- **Frontend:** React 19, Vite 7, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Database:** Convex.dev (real-time)
- **Icons:** Tabler Icons

### New Dependencies

| Package | Purpose | Installation |
|---------|---------|--------------|
| `html2pdf.js` | Generate PDF dari HTML | `npm install html2pdf.js` |
| `recharts` | Dashboard charts | `npm install recharts` |
| `nodemailer` | Send emails (backend) | Convex action |
| `@tanstack/react-table` | Table with sorting/filtering | Optional |

### Database Schema Updates

```typescript
// convex/schema.ts additions

// Bank accounts
bankAccounts: defineTable({
  bankName: v.string(),
  accountNumber: v.string(),
  accountName: v.string(),
  isDefault: v.boolean(),
})

// Email settings
emailSettings: defineTable({
  smtpHost: v.string(),
  smtpPort: v.number(),
  smtpUser: v.string(),
  smtpPassword: v.string(), // encrypted
  fromEmail: v.string(),
  fromName: v.string(),
})

// Email logs
emailLogs: defineTable({
  documentType: v.string(),
  documentId: v.id("invoices"), // or purchaseOrders, receipts
  recipientEmail: v.string(),
  subject: v.string(),
  status: v.string(), // sent, failed
  errorMessage: v.optional(v.string()),
  sentAt: v.number(),
})

// File storage for logo and signature
// Use Convex built-in file storage
```

### API Endpoints (Convex Mutations/Queries)

| Function | Type | Description |
|----------|------|-------------|
| `invoices.update` | mutation | Update invoice data |
| `invoices.updateStatus` | mutation | Update status only |
| `invoices.remove` | mutation | Delete invoice |
| `invoices.search` | query | Search invoices |
| `dashboard.getStats` | query | Get dashboard statistics |
| `bankAccounts.list` | query | List bank accounts |
| `bankAccounts.create` | mutation | Add bank account |
| `emailSettings.get` | query | Get SMTP settings |
| `emailSettings.set` | mutation | Save SMTP settings |
| `emails.send` | action | Send email with attachment |

---

## 9. Email Setup Tutorial (FR-11.3)

### Tutorial Content to Include

#### Gmail SMTP Setup
1. Enable 2-Factor Authentication
2. Generate App Password
3. SMTP Settings:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Encryption: TLS
4. Paste App Password in settings

#### Yahoo Mail SMTP Setup
1. Generate App Password
2. SMTP Settings:
   - Host: `smtp.mail.yahoo.com`
   - Port: `587`
   - Encryption: TLS

#### Custom Domain (Hosting Provider)
1. Check hosting documentation
2. Common settings format

### UI for Tutorial
- Collapsible accordion sections
- Copy buttons for SMTP values
- Test connection button
- Clear error messages if connection fails

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Document creation time | < 2 minutes | Time from open form to save |
| PDF download success rate | > 99% | Downloads without error |
| Email delivery rate | > 95% | Successful email sends |
| User can find document | < 30 seconds | Using search/filter |
| Dashboard load time | < 2 seconds | Page load complete |

---

## 11. Implementation Phases

### Phase 1: Core Document Management (Week 1-2)
- [ ] FR-1: Manajemen Status Dokumen
- [ ] FR-2: Edit Dokumen
- [ ] FR-3: Hapus Dokumen

### Phase 2: Export & Print (Week 2-3)
- [ ] FR-4: Export PDF
- [ ] FR-5: Cetak Dokumen

### Phase 3: Search & Dashboard (Week 3-4)
- [ ] FR-6: Cari & Filter Dokumen
- [ ] FR-7: Dashboard Statistik

### Phase 4: Branding (Week 4-5)
- [ ] FR-8: Informasi Bank
- [ ] FR-9: Upload Logo
- [ ] FR-10: Upload Tanda Tangan

### Phase 5: Email Integration (Week 5-6)
- [ ] FR-11: Kirim Email dengan Tutorial

---

## 12. Open Questions

| No | Question | Owner | Status |
|----|----------|-------|--------|
| 1 | Apakah perlu soft delete untuk dokumen? | Product | Open |
| 2 | Apakah logo harus ada watermark option? | Design | Open |
| 3 | Email template apakah support HTML atau plain text saja? | Dev | Open |
| 4 | Apakah perlu reminder otomatis untuk invoice overdue? | Product | Open |
| 5 | Statistik dashboard apakah perlu export ke Excel? | Product | Open |

---

## Appendix A: Status Flow Diagram

```
┌─────────┐    ┌─────────┐    ┌─────────┐
│  DRAFT  │───▶│  SENT   │───▶│  PAID   │
└─────────┘    └─────────┘    └─────────┘
     │              │
     │              ▼
     │         ┌─────────┐
     └────────▶│CANCELLED│
               └─────────┘
                    ▲
                    │
               ┌─────────┐
               │ OVERDUE │ (auto, from SENT if past due date)
               └─────────┘
```

---

## Appendix B: Email Template Default

**Subject:**
```
[Micromeet] Invoice #{invoiceNumber} dari {companyName}
```

**Body:**
```
Yth. {customerName},

Terlampir invoice dengan detail sebagai berikut:

Nomor Invoice: {invoiceNumber}
Tanggal: {date}
Jatuh Tempo: {dueDate}
Total: {total}

Mohon untuk melakukan pembayaran sebelum tanggal jatuh tempo.

Terima kasih atas kerjasamanya.

Hormat kami,
{companyName}
{companyPhone}
{companyEmail}
```

---

*Dokumen ini dibuat berdasarkan Development Plan dan feedback dari stakeholder.*
