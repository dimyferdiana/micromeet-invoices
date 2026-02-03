# Development Plan - Micromeet Invoices

## Status Fitur Saat Ini

### Sudah Selesai
- [x] Buat Invoice baru
- [x] Buat Purchase Order baru
- [x] Buat Kwitansi baru
- [x] Preview dokumen
- [x] Simpan dokumen ke database (Convex)
- [x] Pengaturan perusahaan
- [x] Manajemen pelanggan (list, tambah, pilih dari dropdown)
- [x] Auto-numbering dokumen
- [x] Auto-save pelanggan/vendor baru saat simpan dokumen

---

## Fitur yang Perlu Dibuat

### Prioritas Tinggi (Wajib Ada)

| No | Fitur | Deskripsi | Status |
|----|-------|-----------|--------|
| 1 | **Manajemen Status Dokumen** | Ubah status: Draft → Terkirim → Lunas/Dibatalkan | ⏳ Belum |
| 2 | **Edit Dokumen** | Ubah invoice/PO/kwitansi yang sudah tersimpan | ⏳ Belum |
| 3 | **Hapus Dokumen** | Hapus dokumen yang tidak diperlukan | ⏳ Belum |
| 4 | **Export PDF** | Download dokumen sebagai file PDF | ⏳ Belum |
| 5 | **Cetak Dokumen** | Print langsung dari browser | ⏳ Belum |

### Prioritas Menengah (Penting)

| No | Fitur | Deskripsi | Status |
|----|-------|-----------|--------|
| 6 | **Cari & Filter Dokumen** | Cari berdasarkan nomor, pelanggan, tanggal, status | ⏳ Belum |
| 7 | **Dashboard Statistik** | Total pendapatan, invoice pending, grafik bulanan | ⏳ Belum |
| 8 | **Informasi Bank** | Rekening bank untuk pembayaran di invoice | ⏳ Belum |
| 9 | **Upload Logo Perusahaan** | Logo muncul di dokumen cetak/PDF | ⏳ Belum |
| 10 | **Upload Tanda Tangan/Cap** | Tanda tangan digital di dokumen | ⏳ Belum |

### Nice to Have (Bagus Jika Ada)

| No | Fitur | Deskripsi | Status |
|----|-------|-----------|--------|
| 11 | **Kirim Email** | Kirim dokumen langsung via email | ⏳ Belum |
| 12 | **Duplikat Dokumen** | Salin dokumen untuk template | ⏳ Belum |
| 13 | **Pembayaran Parsial** | Tracking cicilan pembayaran | ⏳ Belum |
| 14 | **Multi-Currency** | Dukungan mata uang asing (USD, EUR, dll) | ⏳ Belum |
| 15 | **Dark Mode** | Tema gelap untuk aplikasi | ⏳ Belum |
| 16 | **Export Excel** | Download laporan ke Excel | ⏳ Belum |
| 17 | **Invoice Berulang** | Invoice otomatis bulanan/mingguan | ⏳ Belum |
| 18 | **Reminder Jatuh Tempo** | Notifikasi invoice yang akan/sudah jatuh tempo | ⏳ Belum |
| 19 | **Laporan Pajak** | Rekap pajak bulanan/tahunan | ⏳ Belum |

---

## Detail Implementasi

### 1. Manajemen Status Dokumen

**Status yang tersedia:**
- `draft` - Dokumen baru dibuat, belum dikirim
- `sent` - Sudah dikirim ke pelanggan
- `paid` - Sudah dibayar/lunas
- `cancelled` - Dibatalkan
- `overdue` - Melewati jatuh tempo (untuk invoice)

**Komponen yang perlu dibuat:**
- StatusBadge component untuk menampilkan status
- StatusDropdown untuk mengubah status
- Filter by status di halaman list

### 2. Edit Dokumen

**Alur kerja:**
1. Klik tombol Edit di halaman detail atau list
2. Load data dokumen ke form
3. User edit data
4. Simpan perubahan

**Perubahan yang diperlukan:**
- Tambah mutation `update` di setiap API (invoices, purchaseOrders, receipts)
- Buat mode edit di setiap form component
- Tambah routing untuk edit page

### 3. Export PDF

**Opsi implementasi:**
- **Option A:** react-pdf/renderer - Generate PDF di client
- **Option B:** html2pdf.js - Convert HTML preview ke PDF
- **Option C:** Server-side dengan Puppeteer (lebih kompleks)

**Rekomendasi:** html2pdf.js karena sudah ada preview component

### 4. Dashboard Statistik

**Metrik yang ditampilkan:**
- Total pendapatan bulan ini
- Jumlah invoice pending
- Jumlah invoice overdue
- Grafik pendapatan 6 bulan terakhir
- Top 5 pelanggan

---

## Tech Stack

- **Frontend:** React 19 + Vite 7
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Convex.dev
- **Type Safety:** TypeScript
- **Icons:** Tabler Icons

---

## Catatan Pengembangan

- Semua form menggunakan controlled components
- Currency dalam Rupiah (IDR)
- Bahasa UI: Indonesia
- Auto-numbering format: `{PREFIX}-{YEAR}-{COUNTER}`

---

*Terakhir diperbarui: Februari 2026*
