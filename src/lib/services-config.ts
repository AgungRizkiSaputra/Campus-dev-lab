export interface ServiceConfig {
  value: string;
  name: string;
  subtitle: string;
  tag: string;
  defaultMilestones: number;
  minBudget: number;
  maxBudget: number;
  defaultDays: number;
  step2Title: string;
  step2Desc: string;
  titlePlaceholder: string;
  descPlaceholder: string;
  draftHelper: string;
  stages: {
    num: number;
    title: string;
    desc: string;
  }[];
}

export const SERVICES_CONFIG: Record<string, ServiceConfig> = {
  SEMPRO: {
    value: 'SEMPRO',
    name: 'SEMPRO (Seminar Proposal)',
    subtitle: 'Seminar Proposal Bab 1–3',
    tag: 'Bab 1–3',
    defaultMilestones: 3,
    minBudget: 800000,
    maxBudget: 1500000,
    defaultDays: 14,
    step2Title: 'Instruksi Seminar Proposal (Bab 1–3)',
    step2Desc: 'Tuliskan topik riset, rumusan masalah, dan ketentuan proposal dari kampus Anda.',
    titlePlaceholder: 'Contoh: Proposal Penelitian Pengaruh Brand Equity terhadap Loyalitas Konsumen',
    descPlaceholder: 'Tuliskan rincian: rumusan masalah, teori utama yang ingin digunakan (Bab 2), pendekatan metodologi riset (kuantitatif / kualitatif), dan ketentuan pedoman fakultas...',
    draftHelper: 'Tautan Google Drive matriks penelitian, jurnal acuan dari dosen pembimbing, atau panduan proposal kampus.',
    stages: [
      { num: 1, title: 'Bab 1: Pendahuluan & Rumusan Masalah', desc: 'Latar belakang ilmiah, gap penelitian, dan tujuan riset' },
      { num: 2, title: 'Bab 2: Tinjauan Pustaka & Kerangka Teori', desc: 'Landasan teori, kajian jurnal terdahulu & hipotesis' },
      { num: 3, title: 'Bab 3: Metodologi Penelitian & Instrumen', desc: 'Desain penelitian, populasi/sampel & teknik analisis data' },
      { num: 4, title: 'Uji Turnitin & Finalisasi Sempro', desc: 'Sertifikat Turnitin resmi < 20% siap maju seminar proposal' },
    ],
  },
  SKRIPSI: {
    value: 'SKRIPSI',
    name: 'SKRIPSI (Lengkap Bab 1–5)',
    subtitle: 'Skripsi Lengkap Bab 1–5',
    tag: 'Paket Lengkap',
    defaultMilestones: 3,
    minBudget: 1800000,
    maxBudget: 3500000,
    defaultDays: 28,
    step2Title: 'Instruksi Skripsi Lengkap (Bab 1–5)',
    step2Desc: 'Tuliskan judul skripsi, metodologi riset, dan arahan khusus dari dosen pembimbing.',
    titlePlaceholder: 'Contoh: Analisis Kinerja Sistem dengan Algoritma Klasifikasi Random Forest',
    descPlaceholder: 'Tuliskan instruksi lengkap: jumlah bab/halaman yang diminta, software olah data (SPSS / SmartPLS / Python / R), instrumen kuesioner atau dataset yang sudah ada, serta catatan revisi pembimbing sebelumnya...',
    draftHelper: 'Tautan draf bab yang sudah ada, instrumen penelitian, atau pedoman penulisan skripsi kampus Anda.',
    stages: [
      { num: 1, title: 'Bab 1 & 2: Pendahuluan & Landasan Teori', desc: 'Penyusunan latar belakang masalah, gap ilmiah, dan kajian teori' },
      { num: 2, title: 'Bab 3: Metodologi Penelitian & Desain Sistem', desc: 'Metode pengumpulan data, perancangan model & skema pengujian' },
      { num: 3, title: 'Bab 4: Pengolahan Data & Pembahasan Hasil', desc: 'Kalkulasi statistik / implementasi sistem & interpretasi ilmiah' },
      { num: 4, title: 'Bab 5, Turnitin & Kelayakan Sidang', desc: 'Kesimpulan, saran, uji Turnitin < 20% & persiapan sidang munaqasyah' },
    ],
  },
  TUGAS: {
    value: 'TUGAS',
    name: 'TUGAS (Tugas Kuliah Harian / Mingguan)',
    subtitle: 'Tugas Kuliah Harian',
    tag: 'Cepat & Akurat',
    defaultMilestones: 3,
    minBudget: 150000,
    maxBudget: 400000,
    defaultDays: 3,
    step2Title: 'Instruksi Pengerjaan Tugas Kuliah',
    step2Desc: 'Masukkan soal tugas, studi kasus, atau format laporan yang diberikan dosen.',
    titlePlaceholder: 'Contoh: Analisis Kasus Manajemen Risiko Perbankan di Masa Krisis',
    descPlaceholder: 'Tuliskan rincian soal tugas: jumlah nomor soal/halaman, format file yang diminta (Word / PDF / Excel), aturan pengutipan referensi, dan panduan penilaian dosen...',
    draftHelper: 'Tautan file PDF lembar soal dari dosen, modul materi kuliah, atau template tugas.',
    stages: [
      { num: 1, title: 'Pembedahan Soal & Studi Kasus', desc: 'Analisis bobot pertanyaan dan pengumpulan literatur acuan' },
      { num: 2, title: 'Penyusunan Jawaban & Pembahasan', desc: 'Penyelesaian soal secara komprehensif, runtut dan analitis' },
      { num: 3, title: 'Pengecekan Format & Standar Kampus', desc: 'Pemeriksaan sitasi, format margin, tabel, dan tata bahasa' },
      { num: 4, title: 'Penyerahan File Siap Submit', desc: 'Dokumen final rapi siap diunggah ke portal e-learning kampus' },
    ],
  },
  UTS_UAS: {
    value: 'UTS_UAS',
    name: 'UTS / UAS (Ujian Semester)',
    subtitle: 'Ujian Tengah & Akhir Semester',
    tag: 'Fast Response',
    defaultMilestones: 3,
    minBudget: 200000,
    maxBudget: 600000,
    defaultDays: 2,
    step2Title: 'Instruksi Pengerjaan Ujian UTS / UAS',
    step2Desc: 'Cantumkan mata kuliah, instruksi take-home exam, dan batas jam pengumpulan.',
    titlePlaceholder: 'Contoh: Ujian Akhir Semester - Teori Ekonomi Makro Lanjutan',
    descPlaceholder: 'Tuliskan jam tenggat pengumpulan (sangat penting!), jenis soal (analisis esai / hitungan / studi kasus), dan petunjuk teknis ujian dari dosen pengampu...',
    draftHelper: 'Tautan lembar soal ujian atau RPS mata kuliah terkait.',
    stages: [
      { num: 1, title: 'Review Kisi-Kisi & Lembar Soal Ujian', desc: 'Pemetaan materi pokok dan ketentuan format jawaban' },
      { num: 2, title: 'Penyelesaian Jawaban Presisi', desc: 'Perumusan argumen teoritis dan kalkulasi akurat' },
      { num: 3, title: 'Validasi Jawaban & Quality Control', desc: 'Pemeriksaan ketepatan logika, rumus, dan referensi' },
      { num: 4, title: 'Pengiriman Berkas Final Tepat Waktu', desc: 'Penyerahan lembar jawaban siap kirim sebelum batas waktu' },
    ],
  },
  MAKALAH: {
    value: 'MAKALAH',
    name: 'MAKALAH (Karya Tulis Ilmiah)',
    subtitle: 'Karya Tulis Ilmiah Mahasiswa',
    tag: 'Rapi & Terstruktur',
    defaultMilestones: 3,
    minBudget: 250000,
    maxBudget: 600000,
    defaultDays: 5,
    step2Title: 'Instruksi Penulisan Makalah Ilmiah',
    step2Desc: 'Tentukan tema makalah, target jumlah halaman, dan gaya sitasi (APA / IEEE / Chicago).',
    titlePlaceholder: 'Contoh: Makalah Perkembangan Hukum Siber di Era Kecerdasan Buatan',
    descPlaceholder: 'Tuliskan instruksi makalah: jumlah halaman/kata, jumlah minimal jurnal referensi (nasional SINTA / internasional Scopus), serta struktur bab yang ditentukan dosen...',
    draftHelper: 'Tautan silabus mata kuliah atau pedoman format penulisan makalah kampus.',
    stages: [
      { num: 1, title: 'Penetapan Topik & Penelusuran Jurnal', desc: 'Pengumpulan referensi primer terakreditasi dan kerangka outline' },
      { num: 2, title: 'Penyusunan Isi & Pembahasan Makalah', desc: 'Penulisan analisis kritis topik berdasarkan teori ilmiah mutakhir' },
      { num: 3, title: 'Format Sitasi Mendeley & Tata Letak', desc: 'Standarisasi APA/IEEE style, daftar pustaka dan tata bahasa PUEBI' },
      { num: 4, title: 'Uji Turnitin & Penyerahan Makalah', desc: 'Pengecekan sertifikat Turnitin resmi dan naskah final siap cetak' },
    ],
  },
  PPT: {
    value: 'PPT',
    name: 'PPT (Slide Presentasi Sidang & Seminar)',
    subtitle: 'Slide Presentasi Sidang',
    tag: 'Desain Modern',
    defaultMilestones: 3,
    minBudget: 150000,
    maxBudget: 400000,
    defaultDays: 4,
    step2Title: 'Instruksi Slide Presentasi Sidang (PPT)',
    step2Desc: 'Tentukan perkiraan jumlah slide, warna/template kampus, dan poin utama materi.',
    titlePlaceholder: 'Contoh: Slide Presentasi Sidang Skripsi - Jurusan Teknik Informatika',
    descPlaceholder: 'Tuliskan instruksi pembuatan PPT: perkiraan jumlah slide (misal 15–20 slide), preferensi template/warna khas kampus Anda, poin yang ingin difokuskan saat presentasi, serta apakah memerlukan catatan bicara presenter (Speaker Notes)...',
    draftHelper: 'Tautan berkas Word naskah skripsi/makalah yang materinya akan dirangkum menjadi slide PPT.',
    stages: [
      { num: 1, title: 'Perumusan Struktur & Outline Slide', desc: 'Ekstraksi poin-poin inti naskah skripsi menjadi alur presentasi efektif' },
      { num: 2, title: 'Desain Visual & Layout Infografis', desc: 'Pembuatan slide estetis kelas profesional dengan diagram visual yang jelas' },
      { num: 3, title: 'Catatan Presenter & Speaker Notes', desc: 'Penyusunan narasi panduan bicara saat mahasiswa tampil di hadapan penguji' },
      { num: 4, title: 'Finalisasi File PPTX & PDF Siap Sidang', desc: 'Pengecekan animasi, tipografi, dan gladi bersih kesiapan slide presentasi' },
    ],
  },
  WEBSITE_APP: {
    value: 'WEBSITE_APP',
    name: 'WEB & APLIKASI (Coding Tugas & Skripsi IT)',
    subtitle: 'Coding Tugas & Skripsi IT',
    tag: 'Full-Stack',
    defaultMilestones: 3,
    minBudget: 1500000,
    maxBudget: 3500000,
    defaultDays: 21,
    step2Title: 'Instruksi Proyek Web & Aplikasi',
    step2Desc: 'Jelaskan bahasa pemrograman, framework, dan fitur sistem yang ingin dibangun.',
    titlePlaceholder: 'Contoh: Sistem Informasi Manajemen Klinik Berbasis Web (Laravel & React)',
    descPlaceholder: 'Tuliskan tech stack yang diminta kampus (misal: Laravel / Next.js / Flutter / Python ML), daftar modul fitur wajib, skema database (MySQL / PostgreSQL), dan kebutuhan deployment...',
    draftHelper: 'Tautan Google Drive dokumen rancangan use case, DFD, ERD, atau mockup desain Figma jika ada.',
    stages: [
      { num: 1, title: 'Desain Arsitektur & Skema Database', desc: 'Perancangan diagram use-case, ERD basis data & wireframe antarmuka' },
      { num: 2, title: 'Pengembangan Fitur & Integrasi API', desc: 'Implementasi backend, frontend interaktif, dan fungsionalitas sistem' },
      { num: 3, title: 'Pengujian Sistem & Dokumentasi Kode', desc: 'Black-box testing, perbaikan bug & pembuatan panduan instalasi' },
      { num: 4, title: 'Serah Terima Source Code & Demo', desc: 'Penyerahan repositori kode lengkap siap untuk simulasi sidang skripsi' },
    ],
  },
  UNDANGAN_DIGITAL: {
    value: 'UNDANGAN_DIGITAL',
    name: 'UNDANGAN DIGITAL (Web Custom & Interaktif)',
    subtitle: 'Desain Custom & Interaktif',
    tag: 'Mobile Responsive',
    defaultMilestones: 3,
    minBudget: 250000,
    maxBudget: 750000,
    defaultDays: 4,
    step2Title: 'Instruksi Desain Undangan Digital',
    step2Desc: 'Pilih tema desain, fitur audio/video, galeri foto, dan formulir RSVP kehadiran.',
    titlePlaceholder: 'Contoh: Undangan Digital Acara Pernikahan Modern - Tema Emerald Green',
    descPlaceholder: 'Tuliskan nama acara/mempelai, tanggal dan lokasi acara, fitur yang diinginkan (navigasi Google Maps, musik latar, hitung mundur, amplop digital/QRIS, buku tamu online)...',
    draftHelper: 'Tautan foto galeri atau detail rundown acara yang ingin dimuat.',
    stages: [
      { num: 1, title: 'Konsep Desain & Input Data Acara', desc: 'Penyusunan teks, aset foto, musik latar, dan rundown kegiatan' },
      { num: 2, title: 'Pengembangan Web Interaktif Responsif', desc: 'Integrasi animasi buka undangan, Google Maps, RSVP & amplop digital' },
      { num: 3, title: 'Uji Kompatibilitas Layar Smartphone', desc: 'Memastikan tampilan responsif sempurna di Android & iOS' },
      { num: 4, title: 'Peluncuran Tautan Undangan Siap Sebar', desc: 'Tautan website undangan aktif dan siap disebarkan ke tamu' },
    ],
  },
  CEK_PLAGIASI: {
    value: 'CEK_PLAGIASI',
    name: 'CEK PLAGIASI (Uji Turnitin No-Repository)',
    subtitle: 'Uji Turnitin Resmi No-Repository',
    tag: 'No-Repository',
    defaultMilestones: 2,
    minBudget: 50000,
    maxBudget: 150000,
    defaultDays: 1,
    step2Title: 'Instruksi Pengecekan Plagiasi Turnitin',
    step2Desc: 'Unggah naskah skripsi/makalah untuk diuji similarity tanpa tersimpan di database.',
    titlePlaceholder: 'Contoh: Pengecekan Turnitin Lengkap Naskah Skripsi Bab 1-5',
    descPlaceholder: 'Tuliskan instruksi khusus: apakah daftar pustaka dan lampiran di-exclude, batas waktu penerbitan laporan, dan kampus asal agar setting filter sesuai standar...',
    draftHelper: 'Tautan naskah Word (.docx) atau PDF yang akan diperiksa tingkat plagiasinya.',
    stages: [
      { num: 1, title: 'Verifikasi Berkas & Setting Filter', desc: 'Pemeriksaan naskah dan konfigurasi exclude bibliography/quotes' },
      { num: 2, title: 'Pemindaian Turnitin No-Repository', desc: 'Pengecekan resmi tanpa risiko karya tersimpan di repository publik' },
      { num: 3, title: 'Analisis Sumber Duplikasi', desc: 'Pemetaan kalimat yang terdeteksi serupa dengan sumber internet/jurnal' },
      { num: 4, title: 'Penerbitan Sertifikat Turnitin PDF', desc: 'Pengiriman sertifikat hasil uji similarity berwarna resmi' },
    ],
  },
  TURUNIN_PLAGIASI: {
    value: 'TURUNIN_PLAGIASI',
    name: 'TURUNIN PLAGIASI (Parafrase Garansi Lolos)',
    subtitle: 'Parafrase Lolos Uji Turnitin',
    tag: 'Garansi < 20%',
    defaultMilestones: 3,
    minBudget: 350000,
    maxBudget: 850000,
    defaultDays: 5,
    step2Title: 'Instruksi Penurunan Plagiasi Turnitin',
    step2Desc: 'Kirimkan laporan Turnitin awal dan target persentase kelolosan yang diminta kampus.',
    titlePlaceholder: 'Contoh: Parafrase Penurunan Turnitin Skripsi dari 38% Menjadi di Bawah 15%',
    descPlaceholder: 'Tuliskan persentase Turnitin awal, target persentase yang diwajibkan kampus (misal: di bawah 20% atau di bawah 15%), bab yang paling tinggi kesamaannya...',
    draftHelper: 'Tautan laporan Turnitin sebelumnya dan naskah mentah Word yang perlu diparafrase.',
    stages: [
      { num: 1, title: 'Analisis Laporan Similarity Awal', desc: 'Pemetaan paragraf dengan tingkat kemiripan tinggi yang perlu diparafrase' },
      { num: 2, title: 'Parafrase Akademis Manual', desc: 'Penulisan ulang kalimat secara akademis tanpa merusak makna penelitian' },
      { num: 3, title: 'Uji Verifikasi Turnitin Ulang', desc: 'Pemindaian berkala hingga persentase similarity mencapai batas aman' },
      { num: 4, title: 'Penyerahan Naskah Bersih & Garansi', desc: 'Penyerahan berkas Word revisi lengkap dengan bukti Turnitin lolos uji' },
    ],
  },
};

export function getServiceConfig(serviceType?: string): ServiceConfig {
  if (!serviceType) return SERVICES_CONFIG.SKRIPSI;
  const key = serviceType.toUpperCase();
  return SERVICES_CONFIG[key] || SERVICES_CONFIG.SKRIPSI;
}

/**
 * Uji Turnitin hanya relevan dan diwajibkan untuk:
 * - SKRIPSI (Lengkap Bab 1-5)
 * - SEMPRO (Seminar Proposal Bab 1-3)
 * - CEK_PLAGIASI (Uji Turnitin No-Repository)
 * - TURUNIN_PLAGIASI (Parafrase Turnitin)
 *
 * Layanan praktis lainnya (PPT, TUGAS, UTS_UAS, MAKALAH, WEBSITE_APP, UNDANGAN_DIGITAL)
 * TIDAK memerlukan pengecekan Turnitin.
 */
export function serviceRequiresTurnitin(serviceType?: string): boolean {
  if (!serviceType) return false;
  const upper = serviceType.toUpperCase();
  return (
    upper === 'SKRIPSI' ||
    upper === 'SEMPRO' ||
    upper === 'CEK_PLAGIASI' ||
    upper === 'TURUNIN_PLAGIASI'
  );
}
