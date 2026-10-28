# SmartGrader AI Engine — Sistem Koreksi Penilaian Hibrida & Analisis Hasil Belajar

Sistem kecerdasan buatan komprehensif untuk guru dalam mengelola perangkat evaluasi (kunci jawaban & rubrik analitis), mengoreksi jawaban siswa secara hibrida (otomatis deterministik + semantic AI + proses hitungan), mendeteksi miskonsepsi kelompok, mengaudit kualitas butir soal, serta mencetak laporan hasil belajar resmi berstandar sekolah.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Pengguna yang Telah Dikonfirmasi (Phase 1):**
> 1. **Titik Awal (Inisialisasi):** Mulai dari **Lembar Kosong** (Input Soal dan Kunci dari Awal), disertai tombol opsi "Muat Contoh Soal Cepat" jika guru ingin menguji coba alur tanpa mengetik manual.
> 2. **Alur Koreksi Esai & Hitungan:** **Koreksi Otomatis AI dengan Opsi Override Nilai Manual** — Guru memiliki kontrol penuh untuk merevisi skor per butir dengan rekalkulasi instan nilai akhir.
> 3. **Format Output Cetak:** **Format Resmi Standar Sekolah** dengan Kop Surat resmi, pemisah halaman siswa (`---PAGE_BREAK---` / CSS `@media print`), tabel rekapitulasi KKM, dan kolom pengesahan tanda tangan.

---

### 1. Overview & Core Concept

- **Apa yang Dibangun**: Aplikasi web full-stack modern terintegrasi berkecepatan tinggi yang menggabungkan:
  - **Manajer Perangkat Soal Dinamis**: Mendukung 6 jenis soal (PG Tunggal, PGK/Menjodohkan PCM, Benar/Salah, Isian Singkat Fuzzy & Ekuivalensi Matematika, Esai Semantic NLP Rubrik, dan Hitungan Berbasis Langkah/Proses).
  - **Multi-Source Data Ingestion**: Impor tabel CSV/Excel, Impor Teks Digital / Form, serta Impor Hasil OCR/Scan dengan filter pembersih noise teks otomatis.
  - **Hybrid Grading Engine**: Pengoreksian instan deterministik di client-side (fuzzy string distance, PCM proporsional, normalisasi ekuivalensi "0,5" = "1/2") dipadukan dengan Gemini AI server-side untuk penilaian esai analitis, evaluasi tahapan matematis, deteksi miskonsepsi kelompok (≥30%), dan identifikasi ambiguitas soal (`[FLAG_SOAL_AMBIGU]`).
  - **Teacher Override & Review Station**: Antarmuka interaktif bagi guru untuk meninjau justifikasi skor, mengedit nilai per butir soal, dan memberikan umpan balik personal.
  - **Print-Ready Official School Reports**: Tampilan laporan standar dinas pendidikan (Kop Surat Sekolah, Lembar Rekap Kelas, dan Lembar Individual Siswa berpaginasi rapi per halaman siap cetak PDF).

- **Target Pengguna**: Guru SD, SMP, SMA/SMK, Tim Kurikulum, dan Pengawas Sekolah.
- **Nilai Utama**: Menghemat jam kerja guru dalam memeriksa puluhan lembar jawaban, mengeliminasi bias koreksi, memberikan diagnostik pembelajaran akurat, serta memproduksi rapor evaluasi resmi tanpa formatting manual di spreadsheet/word processor.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **Langkah 1 — Pengaturan Asesmen & Identitas Sekolah**:
   - Guru mengisi Identitas Ujian (Nama Sekolah, Mata Pelajaran, Kelas/Fase, KKM, Semester, Nama Guru Pengampu, NIP).
   - Menentukan bobot dan mengonfigurasi perangkat soal (PG, PGK, Benar/Salah, Isian, Esai, Hitungan).
2. **Langkah 2 — Unggah / Masukkan Jawaban Siswa**:
   - Guru memilih metode input: Upload CSV/Excel, Tempel Teks Jawaban (Form Digital), atau Unggah Teks Hasil Scan OCR dengan filter noise cleaner.
   - Sistem memvalidasi kesesuaian jumlah kolom dan butir soal.
3. **Langkah 3 — Eksekusi SmartGrader Engine**:
   - Sistem menjalankan penilaian hibrida berkecepatan tinggi: pencocokan eksak, kalkulasi PCM, fuzzy distance tolerance (typo ≤ 2 karakter), ekuivalensi ekspresi matematika, serta semantic assessment melalui server Gemini AI.
4. **Langkah 4 — Analisis Diagnostik Kelas & Audit Soal**:
   - Guru melihat dashboard ringkasan statistik (rata-rata, tertinggi, terendah, tingkat ketuntasan KKM).
   - Muncul panel deteksi miskonsepsi jika ≥30% siswa salah di indikator tertentu, lengkap dengan akar penyebab dan rekomendasi remedi.
   - Peringatan `[FLAG_SOAL_AMBIGU]` otomatis muncul jika siswa peringkat atas banyak yang keliru pada butir tertentu (Daya Pembeda Negatif).
5. **Langkah 5 — Verifikasi & Override Guru**:
   - Guru dapat mengeklik siswa mana pun untuk membuka laci koreksi individual, meninjau per butir, menaikkan/menurunkan skor, dan menambah catatan penguatan.
6. **Langkah 6 — Cetak & Ekspor Laporan Resmi (PDF/Print)**:
   - Tombol "Cetak Laporan Lengkap" mengaktifkan mode cetak berstandar kedinasan:
     - Halaman 1: Rekapitulasi Nilai Kelas & Pengesahan Kepala Sekolah.
     - Halaman 2 dst: Lembar Laporan Individual per siswa (1 siswa per lembar dengan pemutus halaman cetak otomatis).
   - Ekspor data CSV Rekap Nilai untuk arsip administrasi guru.

#### B. Visual Identity & Theme
- **Aesthetic Direction**: *Official Academic & Modern Utilitarian* — Bersih, terstruktur, bebas clutter, bernuansa akademis profesional setara dokumen resmi Kemdikbudristek.
- **Color Palette (60-30-10 Rule)**:
  - Canvas 60%: Soft Academic White/Off-White (`#F8FAFC` slate-50).
  - Structural 30%: Crisp White surfaces (`#FFFFFF`), subtle hairline borders (`#E2E8F0` slate-200), deep navy slate headings (`#0F172A`).
  - Accent 10%: Deep Academic Blue (`#1E40AF` blue-800) untuk aksi utama, Emerald (`#059669`) untuk status Tuntas, Crimson (`#DC2626`) untuk Remedial, dan Amber (`#D97706`) untuk Flag Ambigu.
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` (SemiBold / Bold).
  - Body & Tables: `Plus Jakarta Sans` / `DM Sans`.
  - Data Numerik & Formula: `font-mono tabular-nums` (`IBM Plex Mono` style) untuk skor, persentase, dan rumus matematika.
- **Zero-Pill Discipline**:
  - Status tuntas/remedial dan metadata disajikan secara bersih dengan unboxed text + separator tipografis (`·`), bukan pill candy badge tebal.
  - Filter dan tab menggunakan segmented controls fungsional.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Arsitektur Hibrida Deterministik + AI Semantic**
  - *Pendekatan*: Evaluasi PG, PGK, Benar/Salah, dan Isian Singkat dieksekusi secara instan dan deterministik (algoritma Levenshtein, normalisasi regex, string canonicalization). Evaluasi Esai kompleks, evaluasi tahapan pengerjaan hitungan, dan analisis agregat miskonsepsi dialirkan ke Gemini 3.8 Flash di server.
  - *Alasan*: Menjamin latensi instan untuk butir objektif tanpa membebani kuota API, sambil mempertahankan pemahaman semantik mendalam (anti-fluffing) untuk soal uraian.

- **Keputusan 2: Pembersih OCR Noise Cerdas (Pre-Grading Cleanser)**
  - *Pendekatan*: Modul pembersih noise teks yang secara otomatis memperbaiki karakter substitusi umum pada scan LJK/tulisan tangan (misal: 'l'/'1'/'I', 'O'/'0', 'S'/'5', penghilangan simbol acak scanner seperti `~`, `^`, `|`).
  - *Alasan*: Hasil OCR di lapangan sering kali mengandung distorsi karakter; filter ini mencegah siswa dirugikan akibat noise pemindai.

- **Keputusan 3: Desain Cetak Dokumen Resmi (Native CSS `@media print`)**
  - *Pendekatan*: Menggunakan CSS paging modern (`@page`, `page-break-after: always;`, `break-inside: avoid;`) dengan Kop Surat standar, stempel legalitas, dan tabel terformat kaku beresolusi cetak tinggi.
  - *Alasan*: Memberikan hasil cetak PDF vektor berkualitas tinggi langsung dari browser (Ctrl+P / Simpan PDF) tanpa ketergantungan library PDF eksternal yang rawan merusak format font dan tabel.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          SMARTGRADER CLIENT                            │
│                                                                        │
│  ┌───────────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ Assessment Config     │  │ Student Ingestion│  │ Teacher Review  │  │
│  │ (School, Rubric, Keys)│  │ (CSV, OCR, Form) │  │ & Override Panel│  │
│  └───────────┬───────────┘  └────────┬─────────┘  └────────┬────────┘  │
│              │                       │                     │           │
│              ▼                       ▼                     │           │
│  ┌───────────────────────────────────────────────┐         │           │
│  │        CLIENT DETERMINISTIC ENGINE            │         │           │
│  │  - Exact Match (PG)                           │         │           │
│  │  - Partial Credit Model / PCM (PGK, Match)    │         │           │
│  │  - Fuzzy Levenshtein (Isian, typo <= 2)       │         │           │
│  │  - Math Equivalence ("0,5" = "1/2" = 0.5)     │         │           │
│  │  - OCR Noise Cleaner & Token Normalizer       │         │           │
│  └───────────────────────┬───────────────────────┘         │           │
│                          │                                 │           │
│                          ▼                                 │           │
│             Requires Semantic AI / Math Steps / Diagnostics?│           │
│              / YES                              \ NO       │           │
│             ▼                                    ▼         │           │
│  ┌───────────────────────────────┐     ┌────────────────┐  │           │
│  │ Fetch /api/grader/evaluate    │     │ Direct Tally & │  │           │
│  │ & /api/grader/diagnostics     │     │ Aggregation    │  │           │
│  └──────────────┬────────────────┘     └────────┬───────┘  │           │
│                 │                               │          │           │
│                 ▼                               ▼          ▼           │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │           CENTRAL GRADING STORE & OVERRIDE LEDGER             │     │
│  │           (Kelas, Nilai Siswa, Audit Log Guru)                │     │
│  └──────────────────────────────┬────────────────────────────────┘     │
│                                 │                                      │
│                                 ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │            PRINT-READY OFFICIAL REPORT VIEW (PDF)             │     │
│  │  - Kop Surat Sekolah & Info Penilaian                         │     │
│  │  - Tabel Rekapitulasi Kelas (KKM & Status Tuntas/Remedial)    │     │
│  │  - Lembar Rapor Individual Siswa (1 per Page Break)           │     │
│  │  - Diagnostik Guru & Rekomendasi Tindak Lanjut                │     │
│  └───────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   EXPRESS / VITE SERVER API ROUTE                      │
│                  (@google/genai SDK, Server-Only)                      │
│                                                                        │
│  - POST /api/grader/semantic-essay                                     │
│    (Analytic Rubric Scoring, Anti-Fluffing Concept Verification)       │
│                                                                        │
│  - POST /api/grader/process-math                                       │
│    (Formula verification, step-by-step partial credit calculation)     │
│                                                                        │
│  - POST /api/grader/class-diagnostics                                  │
│    (Group misconception clustering >= 30%, [FLAG_SOAL_AMBIGU] audit)   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Komponen Kunci State & Data:
1. `AssessmentConfig`:
   - `schoolInfo`: Nama Sekolah, NPSN, Alamat, Guru Pengampu, NIP, Kepala Sekolah, NIP Kepsek, Tanggal Asesmen, KKM (misal 75).
   - `questions`: Array objek soal berisi `id`, `number`, `type` (`pg` | `pgk` | `bs` | `isian` | `esai` | `hitungan`), `prompt`, `weight`, `answerKey`, `rubricCriteria`, `acceptableFuzzyKeys`, `stepWeights`.
2. `StudentSubmission`:
   - `id`, `nisn`, `studentName`, `rawAnswers`: Map `questionId -> answerText / answerArray`.
3. `GradedResult`:
   - `studentId`, `questionScores`: Map `questionId -> { score, maxScore, isCorrect, partialRatio, feedback, aiReasoning, isOverridden, overrideReason }`.
   - `totalScore`, `percentage`, `status` (`Tuntas` | `Remedial`).
4. `ClassAnalytics`:
   - `averageScore`, `highestScore`, `lowestScore`, `passRatePercentage`.
   - `misconceptions`: Array `{ questionNumber, conceptName, errorRate, rootCause, remedyRecommendation }`.
   - `ambiguousQuestions`: Array `{ questionNumber, prompt, reason, flag: '[FLAG_SOAL_AMBIGU]' }`.

---

### 5. Rencana File & Implementasi

1. **Server API (`server.ts` & Vite Integration)**:
   - Endpoint terpadu untuk evaluasi semantik esai, analisis langkah hitungan, dan diagnostik kelas berbasis `gemini-3.8-flash`.
   - Error handling tangguh dengan fallback cerdas berbasis client matcher jika jaringan terbatas.
2. **Mesin Penilaian Klien (`src/services/graderEngine.ts`)**:
   - Algoritma pencocokan eksak, Levenshtein distance, normalisasi ekspresi desimal/pecahan/kata ("0,5" = "0.5" = "1/2" = "setengah"), dan Partial Credit Model (PCM) untuk pilihan ganda kompleks.
   - Modul pembersih noise OCR otomatis (`src/services/ocrCleaner.ts`).
3. **Komponen Antarmuka**:
   - `HeaderNav.tsx`: Top bar satu baris yang bersih, logo, navigasi tab alur kerja, dan aksi cetak.
   - `SchoolConfigModal.tsx`: Pengaturan kop surat, identitas sekolah, mata pelajaran, KKM, dan data pengesahan.
   - `QuestionBuilder.tsx`: Editor soal dinamis untuk 6 bentuk soal (PG, PGK, BS, Isian, Esai, Hitungan).
   - `DataIngestionView.tsx`: Tab impor multi-format (CSV/Excel, OCR Scan Text Cleaner, Digital Form Key-Value).
   - `ClassSummaryDashboard.tsx`: KPI ketuntasan, statistik agregat, deteksi miskonsepsi kelompok, dan kartu audit soal ambigu.
   - `StudentGradingTable.tsx`: Tabel rekapitulasi nilai kelas dengan tombol laci review/override per siswa.
   - `StudentReviewDrawer.tsx`: Modal review detail jawaban siswa, justifikasi skor, dan form override guru.
   - `PrintReportView.tsx`: Template cetak resmi standar kedinasan dengan Kop Surat, tabel rekapitulasi, dan lembar per siswa (`page-break-after: always`).
4. **Validasi & Verifikasi**:
   - Uji coba kompilasi TypeScript (`compile_applet`).
   - Verifikasi perhitungan skor deterministik dan penanganan override guru.
