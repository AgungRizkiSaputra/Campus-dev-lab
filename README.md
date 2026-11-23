# Joki Skripsi — Academic Safe-Haven Marketplace (PRD v7.0)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e.svg)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-22%2F22%20Passing-brightgreen.svg)]()
[![OWASP](https://img.shields.io/badge/Security-OWASP%20Compliant-success.svg)]()

> **SSOT**: `Joki_Skripsi_PRD_v7.md`  
> Ekosistem pendampingan akademik terpercaya yang mempertemukan mahasiswa dengan konsultan akademik profesional tersertifikasi (KYC). Dilengkapi sistem **Escrow Rekber Direct Settlement**, **Blind Bidding**, **Turnitin Anti-Plagiarism Lock**, dan notifikasi transaksional **WhatsApp Gateway (Wablas)**.

---

## 🏛️ Batasan Integritas Akademik
Layanan pada platform ini dirancang khusus untuk:
- ✅ Konsultasi bimbingan penelitian & perumusan hipotesis
- ✅ Bimbingan metodologi (Kuantitatif/Kualitatif, SPSS, SEM-PLS, dsb.)
- ✅ Proofreading, tata bahasa, dan penyuntingan naskah
- ✅ Formatting sitasi (APA, IEEE, Harvard, dsb.)

🚫 **DILARANG KERAS**: Jasa pembuatan karya ilmiah instan (*ghostwriting* tanpa proses bimbingan), fabrikasi data fiktif, joki ujian/kuis, atau manipulasi file untuk menghindari deteksi plagiarisme.

---

## 🚀 Fitur Unggulan

1. **Guided Wizard**: Formulir pengajuan proyek 4-tahap dengan auto-save draft di browser.
2. **Blind Bidding**: Penawaran satu kali (*one-shot*), plafon anggaran maks 200%, rate limit 5 bid/jam, dan isolasi total antar kompetitor.
3. **Escrow Rekber Direct Settlement**: Pembayaran langsung ke rekening perusahaan (**BCA `8801928371` a.n PT Joki Skripsi Indonesia**) dengan 3-digit kode unik rekonsiliasi. *Zero third-party gateway dependencies*.
4. **Turnitin Anti-Plagiarism Lock**: Wajib menyertakan laporan resmi Turnitin dengan *similarity score* $\le 25\%$ sebelum draf bab dapat diserahkan ke mahasiswa.
5. **Admin Arbitration Portal**: Mediasi sengketa dengan audit timeline bukti digital dan hak eksekusi *Force Release* atau *Force Refund*.
6. **Encrypted Document Vault**: Akses berkas privat berbasis peran dengan URL bertanda tangan (*Signed URLs*) berdurasi aman 15 menit (900 detik).
7. **Joki KYC & Portfolio Showcase**: Verifikasi identitas KTP & ijazah sarjana sebelum diizinkan melakukan bidding, profil publik dengan badge terverifikasi dan ulasan mahasiswa.
8. **WhatsApp Transactional Gateway**: Notifikasi otomatis via Wablas untuk billing, verifikasi deposit, penyerahan draf bab, batas review, dan tiket sengketa.

---

## 🎨 UI/UX Design System (Modern Academic Professional)

- **Primary**: Forest Green (`#1B4332`)
- **Secondary**: Deep Burgundy (`#581845`)
- **Background**: Off-White (`#F8F9FA`)
- **Surface**: White (`#FFFFFF`)
- **Typography**: 
  - Headings: `Playfair Display`, serif
  - Body & UI: `Inter`, sans-serif
- **Adaptive Layout**: Desktop sidebar ($\ge 1280\text{px}$), Tablet collapsible drawer, Mobile bottom navigation ($< 768\text{px}$).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Database & Auth**: PostgreSQL via Supabase dengan Row Level Security (RLS)
- **Realtime & Storage**: Supabase Realtime (WebSockets) & Supabase Storage (Private Buckets)
- **Styling**: Tailwind CSS
- **Validation**: Zod (End-to-End type safety)
- **Notification**: Wablas WhatsApp Gateway API
- **Testing**: Jest, `ts-jest`

---

## 📁 Struktur Direktori

```
joki-skripsi/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login, Register, Verify OTP, Auth Callbacks
│   │   ├── (dashboard)/        # Layout dashboard & role routing
│   │   │   ├── admin/          # Verifikasi pembayaran, antrean KYC, mediasi arbitrase
│   │   │   ├── buyer/          # Buat proyek, daftar proyek, milestone, portal bayar
│   │   │   ├── seller/         # Eksplorasi bursa proyek, bidding, KYC, portofolio
│   │   │   └── profile/        # Profil publik konsultan akademik & ulasan
│   │   ├── shared/             # Realtime WebSocket Chat & Document Vault
│   │   └── actions/            # Next.js Server Actions (Auth, Bids, Escrow, KYC, dsb.)
│   ├── components/ui/          # 12 Komponen UI Reusable (Button, Dialog, Card, dsb.)
│   ├── hooks/                  # Custom React hooks (useAuth, dsb.)
│   ├── lib/
│   │   ├── services/           # WhatsApp Wablas notification service
│   │   ├── supabase/           # Client, Server, & Admin Supabase SDK instances
│   │   └── utils.ts            # Class merging & formatters
│   └── types/                  # TypeScript interface & enum definitions
├── supabase/
│   └── migrations/             # Migration SQL 17 tabel lengkap & aturan RLS
├── tests/
│   └── unit/                   # 5 Test Suites Jest (22 Test Cases)
├── jest.config.js              # Konfigurasi Jest untuk TypeScript
└── tailwind.config.ts          # Definisi token warna & font Playfair/Inter
```

---

## 💻 Panduan Instalasi Lokal

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd joki-skripsi
npm install
```

### 2. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Lengkapi kredensial Supabase dan Wablas:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
WABLAS_API_KEY=<your-wablas-token>
WABLAS_DOMAIN=https://jogja.wablas.com
```

### 3. Migrasi Database Supabase
Jalankan file migrasi SQL pada SQL Editor di Supabase Dashboard:
```
supabase/migrations/20261123000001_initial_schema.sql
```
*Pastikan bucket `documents` dan `kyc` di Supabase Storage telah dibuat dengan opsi Private (Non-Public).*

### 4. Eksekusi Pengujian & Build
```bash
# Jalankan pengecekan TypeScript
npm run type-check

# Jalankan 22 automated unit & integration tests
npm run test

# Jalankan kompilasi Next.js production build
npm run build

# Jalankan server lokal
npm run dev
```

Aplikasi dapat diakses pada `http://localhost:3000`.

---

## 🚀 Panduan Deployment Produksi (Vercel)

1. **Hubungkan Repository ke Vercel**:
   - Impor repositori GitHub ke Vercel Dashboard.
   - Atur Framework Preset ke **Next.js**.
2. **Atur Environment Variables**:
   - Masukkan seluruh konfigurasi dari `.env.example` ke menu *Environment Variables* di Vercel.
3. **Deploy**:
   - Klik **Deploy**. Vercel akan menjalankan build Next.js dan menghasilkan deployment live dengan proteksi Edge Middleware.

---

## 📄 Lisensi
Hak Cipta © 2026 PT Joki Skripsi Indonesia. Seluruh hak cipta dilindungi undang-undang.
