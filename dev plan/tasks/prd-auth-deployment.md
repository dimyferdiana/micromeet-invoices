# PRD: Authentication & Deployment
## Micromeet Invoices - Phase 2

**Versi:** 2.0
**Tanggal:** Februari 2026
**Status:** Draft

---

## 1. Introduction / Overview

### Latar Belakang
Micromeet Invoices saat ini adalah aplikasi single-user tanpa autentikasi. Untuk production deployment dan penggunaan oleh multiple user/perusahaan, diperlukan sistem login dan manajemen organisasi.

### Masalah yang Diselesaikan
1. **Keamanan**: Data bisnis bisa diakses siapa saja tanpa login
2. **Multi-tenancy**: Tidak bisa digunakan oleh banyak perusahaan sekaligus
3. **Kolaborasi**: Tidak bisa invite tim untuk akses bersama
4. **Deployment**: Belum bisa di-deploy ke production (Vercel)

### Solusi
1. Implementasi Convex Auth dengan email/password + Google OAuth
2. Sistem Organization untuk multi-tenancy
3. Role-based access (Owner, Admin, Member)
4. Deploy ke Vercel untuk production

---

## 2. Goals

### Primary Goals

| No | Goal | Metric |
|----|------|--------|
| G1 | User bisa register dan login dengan aman | Auth success rate > 99% |
| G2 | Data terisolasi per organization | Zero data leak antar org |
| G3 | Owner bisa invite dan manage tim | Invite acceptance rate tracked |
| G4 | Aplikasi live di production (Vercel) | 99.9% uptime |

### Secondary Goals

| No | Goal | Metric |
|----|------|--------|
| G5 | Login mudah dengan Google | > 50% user pakai Google |
| G6 | Password reset berfungsi | Reset email delivered |
| G7 | Migrasi data existing lancar | Zero data loss |

---

## 3. User Stories

### Authentication

| ID | User Story | Priority |
|----|------------|----------|
| US-01 | Sebagai user baru, saya ingin register dengan email dan password, agar saya bisa menggunakan aplikasi | High |
| US-02 | Sebagai user baru, saya ingin register dengan Google account, agar lebih cepat dan tidak perlu ingat password baru | High |
| US-03 | Sebagai user existing, saya ingin login dengan email/password atau Google, agar saya bisa akses dokumen saya | High |
| US-04 | Sebagai user yang lupa password, saya ingin reset password via email, agar saya bisa akses akun kembali | High |
| US-05 | Sebagai user yang sudah login, saya ingin logout, agar akun saya aman saat berbagi device | High |

### Organization Management

| ID | User Story | Priority |
|----|------------|----------|
| US-06 | Sebagai user pertama kali register, saya ingin otomatis dibuatkan organization, agar saya langsung bisa mulai | High |
| US-07 | Sebagai Owner, saya ingin invite anggota tim via email, agar mereka bisa akses dokumen bersama | High |
| US-08 | Sebagai Owner/Admin, saya ingin mengubah role member, agar saya bisa kontrol akses | Medium |
| US-09 | Sebagai Owner/Admin, saya ingin remove member dari organization, agar orang yang keluar tidak bisa akses lagi | Medium |
| US-10 | Sebagai Member, saya ingin melihat daftar anggota organization, agar saya tahu siapa saja timnya | Low |

### Data Access by Role

| ID | User Story | Priority |
|----|------------|----------|
| US-11 | Sebagai Owner, saya bisa akses dan edit semua dokumen di organization | High |
| US-12 | Sebagai Admin, saya bisa akses dan edit semua dokumen di organization | High |
| US-13 | Sebagai Member, saya bisa buat dokumen baru dan edit dokumen yang saya buat | High |
| US-14 | Sebagai Member, saya bisa lihat semua dokumen tapi tidak bisa edit yang bukan milik saya | Medium |

---

## 4. Functional Requirements

### FR-1: User Registration

| ID | Requirement | Details |
|----|-------------|---------|
| FR-1.1 | Sistem harus menyediakan halaman registrasi | Form: nama, email, password, konfirmasi password |
| FR-1.2 | Email harus unik (tidak boleh duplikat) | Validasi di backend |
| FR-1.3 | Password minimal 8 karakter | Dengan kombinasi huruf dan angka |
| FR-1.4 | User baru otomatis dibuatkan Organization | Dengan nama default = nama user |
| FR-1.5 | User baru otomatis jadi Owner org tersebut | Role: owner |

### FR-2: Google OAuth

| ID | Requirement | Details |
|----|-------------|---------|
| FR-2.1 | Sistem harus menyediakan tombol "Login dengan Google" | Di halaman login dan register |
| FR-2.2 | Jika email Google sudah terdaftar, langsung login | Linking ke akun existing |
| FR-2.3 | Jika email Google belum terdaftar, buat akun baru | Auto-register dengan data dari Google |
| FR-2.4 | Ambil nama dan foto profil dari Google | Untuk display di UI |

### FR-3: Login & Logout

| ID | Requirement | Details |
|----|-------------|---------|
| FR-3.1 | Sistem harus menyediakan halaman login | Form: email, password + tombol Google |
| FR-3.2 | Session harus persist sampai logout | Menggunakan Convex Auth session |
| FR-3.3 | Tombol logout harus ada di sidebar/header | Clear session dan redirect ke login |
| FR-3.4 | Redirect ke login jika session expired | Auto-detect session status |

### FR-4: Password Reset

| ID | Requirement | Details |
|----|-------------|---------|
| FR-4.1 | Sistem harus menyediakan link "Lupa Password" di login | Redirect ke halaman reset |
| FR-4.2 | User input email untuk minta reset link | Kirim email dengan token |
| FR-4.3 | Email berisi link reset yang expire dalam 1 jam | Security measure |
| FR-4.4 | Halaman reset password untuk input password baru | Validasi token, update password |
| FR-4.5 | Gunakan SMTP yang sudah dikonfigurasi di Settings | Reuse existing email infrastructure |

### FR-5: Organization Management

| ID | Requirement | Details |
|----|-------------|---------|
| FR-5.1 | Owner bisa edit nama organization | Di halaman Settings > Organization |
| FR-5.2 | Owner/Admin bisa invite member via email | Kirim invitation link |
| FR-5.3 | Invitation berlaku 7 hari | Expire after that |
| FR-5.4 | New member bisa join via invitation link | Accept dan register/login |
| FR-5.5 | Owner/Admin bisa ubah role member | Dropdown: Admin, Member |
| FR-5.6 | Owner/Admin bisa remove member | Dengan konfirmasi |
| FR-5.7 | Owner tidak bisa remove dirinya sendiri | Harus transfer ownership dulu |

### FR-6: Role-Based Access Control

| ID | Requirement | Details |
|----|-------------|---------|
| FR-6.1 | **Owner**: Full access ke semua fitur | CRUD semua dokumen, manage org, manage members |
| FR-6.2 | **Admin**: CRUD semua dokumen, manage members | Tidak bisa delete org atau transfer ownership |
| FR-6.3 | **Member**: Create dokumen, edit/delete dokumen sendiri | View all documents, tapi tidak bisa edit milik orang lain |
| FR-6.4 | Semua role bisa akses Settings perusahaan | Tapi hanya Owner/Admin bisa edit |

### FR-7: Data Scoping

| ID | Requirement | Details |
|----|-------------|---------|
| FR-7.1 | Semua dokumen harus memiliki `organizationId` | Foreign key ke organizations table |
| FR-7.2 | Semua dokumen harus memiliki `createdBy` | Foreign key ke users table |
| FR-7.3 | Query dokumen harus filter by organizationId | User hanya lihat dokumen org-nya |
| FR-7.4 | companySettings harus per organization | Setiap org punya settings sendiri |
| FR-7.5 | bankAccounts harus per organization | Setiap org punya rekening sendiri |

### FR-8: Data Migration

| ID | Requirement | Details |
|----|-------------|---------|
| FR-8.1 | User pertama yang register dapat semua data existing | Assign organizationId ke dokumen lama |
| FR-8.2 | createdBy untuk data existing di-set ke user pertama | Ownership jelas |
| FR-8.3 | Migration hanya terjadi sekali | Flag untuk track sudah migrasi |

### FR-9: Vercel Deployment

| ID | Requirement | Details |
|----|-------------|---------|
| FR-9.1 | Aplikasi harus bisa di-build untuk production | `npm run build` tanpa error |
| FR-9.2 | Environment variables harus dikonfigurasi di Vercel | VITE_CONVEX_URL, Google OAuth credentials |
| FR-9.3 | Domain custom bisa di-setup (optional) | Via Vercel dashboard |
| FR-9.4 | Preview deployment untuk setiap PR | Auto-deploy by Vercel |

---

## 5. Non-Goals (Out of Scope)

| No | Feature | Reason |
|----|---------|--------|
| 1 | Multiple organizations per user | Kompleks, bisa ditambah nanti |
| 2 | Organization billing/subscription | Belum perlu monetization |
| 3 | Audit log untuk semua aksi | Nice to have, phase berikutnya |
| 4 | Two-factor authentication (2FA) | Bisa ditambah nanti |
| 5 | Apple/GitHub OAuth | Fokus Google dulu yang paling umum |
| 6 | Email verification saat register | Simplified flow untuk MVP |
| 7 | Custom permission per dokumen | Role-based sudah cukup |

---

## 6. Design Considerations

### UI Pages yang Perlu Dibuat

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Form email/password + Google button |
| Register | `/register` | Form registrasi + Google button |
| Forgot Password | `/forgot-password` | Input email untuk reset |
| Reset Password | `/reset-password` | Form password baru (dengan token) |
| Accept Invitation | `/invite/:token` | Join organization |
| Organization Settings | `/settings/organization` | Manage org name, members |

### UI Components yang Perlu Dibuat

| Component | Location | Description |
|-----------|----------|-------------|
| `AuthLayout` | `src/layouts/` | Layout untuk halaman auth (tanpa sidebar) |
| `GoogleButton` | `src/components/auth/` | Tombol login dengan Google |
| `UserMenu` | `src/components/layout/` | Dropdown user di sidebar (nama, logout) |
| `MemberList` | `src/components/settings/` | List member organization |
| `InviteDialog` | `src/components/settings/` | Dialog untuk invite member |
| `RoleDropdown` | `src/components/settings/` | Dropdown untuk ubah role |

### Sidebar Update
- Tambah avatar/nama user di bagian bawah sidebar
- Tambah menu "Organization" di Settings tab
- Tombol logout

---

## 7. Technical Considerations

### Tech Stack Additions

| Package | Purpose | Documentation |
|---------|---------|---------------|
| `@convex-dev/auth` | Convex Auth library | https://docs.convex.dev/auth/convex-auth |
| `@auth/core` | Auth.js core (untuk OAuth) | Dependency of convex-auth |

### Database Schema Updates

```typescript
// convex/schema.ts - New tables

// Users table (managed by Convex Auth)
users: defineTable({
  name: v.string(),
  email: v.string(),
  image: v.optional(v.string()), // Google profile picture
  emailVerified: v.optional(v.number()),
})
  .index("by_email", ["email"]),

// Organizations table
organizations: defineTable({
  name: v.string(),
  ownerId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_owner", ["ownerId"]),

// Organization members (many-to-many)
organizationMembers: defineTable({
  organizationId: v.id("organizations"),
  userId: v.id("users"),
  role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  joinedAt: v.number(),
})
  .index("by_org", ["organizationId"])
  .index("by_user", ["userId"])
  .index("by_org_user", ["organizationId", "userId"]),

// Invitations
invitations: defineTable({
  organizationId: v.id("organizations"),
  email: v.string(),
  role: v.union(v.literal("admin"), v.literal("member")),
  invitedBy: v.id("users"),
  token: v.string(),
  expiresAt: v.number(),
  status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired")),
})
  .index("by_token", ["token"])
  .index("by_org", ["organizationId"])
  .index("by_email", ["email"]),

// Password reset tokens
passwordResetTokens: defineTable({
  userId: v.id("users"),
  token: v.string(),
  expiresAt: v.number(),
  used: v.boolean(),
})
  .index("by_token", ["token"])
  .index("by_user", ["userId"]),

// Update existing tables - add these fields:
// invoices, purchaseOrders, receipts, customers:
//   + organizationId: v.id("organizations")
//   + createdBy: v.id("users")
// companySettings, bankAccounts, emailSettings:
//   + organizationId: v.id("organizations")
```

### Convex Functions Structure

```
convex/
├── auth.ts              # Convex Auth configuration
├── users.ts             # User queries/mutations
├── organizations.ts     # Org management
├── invitations.ts       # Invitation system
├── passwordReset.ts     # Password reset logic
└── (existing files)     # Update with org scoping
```

### Environment Variables (Vercel)

```
VITE_CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOYMENT=xxx
AUTH_GOOGLE_ID=xxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=xxx
```

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Registration success rate | > 95% | Successful registrations / attempts |
| Login success rate | > 99% | Successful logins / attempts |
| Google OAuth adoption | > 50% | Google logins / total logins |
| Password reset completion | > 80% | Resets completed / resets requested |
| Invitation acceptance | > 70% | Invites accepted / invites sent |
| Zero data leak | 100% | Security audit |
| Deployment uptime | > 99.9% | Vercel monitoring |

---

## 9. Implementation Phases

### Phase 1: Core Authentication (Week 1) ✅
- [x] Setup Convex Auth
- [x] Create users table
- [x] Login/Register pages (email/password)
- [x] Logout functionality
- [x] Protected routes

### Phase 2: Google OAuth (Week 1-2) ✅
- [x] Configure Google OAuth in Convex
- [x] Google login button
- [x] Account linking
> Note: Code ready, requires Google OAuth credentials in Convex dashboard

#### Detailed Setup Steps

**A. Google Cloud Console (Buat OAuth Client)**
1. Buka Google Cloud Console dan pilih/create project.
2. Konfigurasi OAuth consent screen:
   - Tipe: **External** (kecuali hanya untuk Workspace internal).
   - Isi App name, user support email, developer contact email.
   - Scope minimal: `openid`, `email`, `profile`.
   - Jika app belum dipublish: tambahkan test users.
3. Buat OAuth Client ID:
   - `APIs & Services` → `Credentials` → `Create Credentials` → `OAuth client ID`.
   - Tipe aplikasi: **Web application**.
   - **Authorized JavaScript origins**:
     - Dev: `http://localhost:3000` (atau port dev yang dipakai).
     - Prod: `https://your-domain.com`.
   - **Authorized redirect URIs**:
     - Ambil URL dari Convex (lihat langkah B), lalu tempelkan di sini.
4. Simpan, lalu catat:
   - `Client ID`
   - `Client Secret`

**B. Convex Dashboard (Provider Google)**
1. Buka Convex Dashboard untuk project ini.
2. Masuk ke **Auth / Providers** (atau Authentication).
3. Tambahkan provider **Google**:
   - Paste `Client ID` dan `Client Secret`.
   - Copy **OAuth redirect URL** yang ditampilkan oleh Convex.
4. Kembali ke Google Cloud Console dan pastikan redirect URL tersebut sudah ditambahkan.
5. Simpan semua perubahan.

**C. Konfigurasi App**
1. Pastikan `.env` berisi URL Convex yang benar:
   - `VITE_CONVEX_URL=...` (atau sesuai framework).
2. Pastikan button login Google memanggil provider `google`.
3. Pastikan alur login redirect kembali ke app setelah Convex callback sukses.

**D. Verifikasi**
1. Jalankan app di local.
2. Klik login Google → login → redirect balik ke app.
3. Cek Convex dashboard/logs untuk event auth sukses.
4. Uji account linking:
   - Login ulang dengan email yang sama harus mengarah ke user yang sama.

**Pitfall Umum**
- Redirect URI tidak persis sama (paling sering).
- Consent screen belum publish dan test user belum ditambahkan.
- Salah port pada `localhost`.
- Salah deployment URL (dev vs prod) di Convex.

### Phase 3: Organization System (Week 2) ✅
- [x] Create organizations table
- [x] Auto-create org on register
- [x] Organization members table
- [x] Role assignment

### Phase 4: Data Scoping (Week 2-3) ✅
- [x] Add organizationId to all document tables
- [x] Update all queries with org filter
- [x] Migrate existing data
- [x] RBAC implementation

### Phase 5: Member Management (Week 3) ✅
- [x] Invitation system
- [x] Accept invitation flow
- [x] Manage members UI
- [x] Role change functionality

### Phase 6: Password Reset (Week 3-4) ✅
- [x] Password reset token system
- [x] Forgot password page
- [x] Reset password email
- [x] Reset password page

### Phase 7: Vercel Deployment (Week 4)
- [ ] Build optimization
- [ ] Environment configuration
- [ ] Deploy to Vercel
- [ ] Custom domain (optional)

---

## 10. Open Questions

| No | Question | Status |
|----|----------|--------|
| 1 | Apakah perlu email verification saat register? | Decided: No (MVP) |
| 2 | Timeout session berapa lama? | TBD - suggest 7 days |
| 3 | Apakah perlu "Remember me" checkbox? | TBD |
| 4 | Nama organization default apa? | Suggest: "{User's name}'s Organization" |
| 5 | Notifikasi email saat di-invite? | Yes (using existing SMTP) |

---

## 11. Verification Plan

### Testing Authentication
1. Register new user dengan email/password
2. Login dengan credentials
3. Login dengan Google
4. Reset password flow
5. Logout dan verify session cleared

### Testing Organization
1. Auto-create org saat register
2. Invite member via email
3. Accept invitation
4. Change member role
5. Remove member

### Testing Data Scoping
1. Create dokumen di org A
2. Login sebagai user org B
3. Verify dokumen org A tidak terlihat
4. Test RBAC: Member tidak bisa edit dokumen orang lain

### Testing Deployment
1. Build locally: `npm run build`
2. Deploy to Vercel preview
3. Test all features di preview
4. Deploy to production

---

## Files to Modify/Create

### New Files
- `convex/auth.ts` - Convex Auth configuration
- `convex/organizations.ts` - Organization management
- `convex/invitations.ts` - Invitation system
- `convex/passwordReset.ts` - Password reset
- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/pages/ForgotPasswordPage.tsx`
- `src/pages/ResetPasswordPage.tsx`
- `src/pages/AcceptInvitePage.tsx`
- `src/components/auth/GoogleButton.tsx`
- `src/components/layout/UserMenu.tsx`
- `src/components/settings/OrganizationSettingsCard.tsx`
- `src/components/settings/MemberList.tsx`
- `src/components/settings/InviteDialog.tsx`
- `src/hooks/useAuth.ts`
- `src/hooks/useOrganization.ts`

### Files to Modify
- `convex/schema.ts` - Add new tables, update existing
- `convex/invoices.ts` - Add org scoping
- `convex/purchaseOrders.ts` - Add org scoping
- `convex/receipts.ts` - Add org scoping
- `convex/customers.ts` - Add org scoping
- `convex/companySettings.ts` - Add org scoping
- `convex/bankAccounts.ts` - Add org scoping
- `convex/emailSettings.ts` - Add org scoping
- `src/App.tsx` - Add auth routing
- `src/main.tsx` - Add auth provider
- `src/components/layout/Sidebar.tsx` - Add user menu
- `src/pages/SettingsPage.tsx` - Add Organization tab
- `package.json` - Add dependencies
- `vercel.json` - Create for deployment

---

*Dokumen ini dibuat berdasarkan requirements gathering dengan stakeholder.*
