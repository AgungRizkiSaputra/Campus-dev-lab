import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  FileCheck2,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  Wallet,
  BookOpen,
  FileText,
  HelpCircle,
  Laptop,
  Mail,
  SearchCheck,
  FileSearch,
  MessageCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  const services = [
    {
      num: 1,
      title: 'SEMPRO',
      subtitle: 'Seminar Proposal',
      desc: 'Bantuan penyusunan seminar proposal dari perumusan judul, latar belakang, hingga siap diseminarkan dengan percaya diri.',
      tag: 'Favorit Mahasiswa',
      icon: BookOpen,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      num: 2,
      title: 'SKRIPSI',
      subtitle: 'Skripsi Lengkap Bab 1–5',
      desc: 'Pengerjaan dan bimbingan skripsi lengkap & berkualitas tinggi dari awal rancangan hingga bab kesimpulan akhir.',
      tag: 'Paket Lengkap',
      icon: GraduationCap,
      color: 'bg-forest-50 text-forest-800 border-forest-200',
    },
    {
      num: 3,
      title: 'TUGAS',
      subtitle: 'Tugas Kuliah Harian',
      desc: 'Mengerjakan berbagai tugas kuliah harian atau mingguan sesuai instruksi dosen dengan ketelitian dan hasil terbaik.',
      tag: 'Semua Jurusan',
      icon: FileText,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      num: 4,
      title: 'UTS / UAS',
      subtitle: 'Ujian Tengah & Akhir Semester',
      desc: 'Bantuan pengerjaan soal UTS & UAS dengan analisis akurat, jawaban terstruktur, serta ketepatan waktu pengumpulan.',
      tag: 'Fast Response',
      icon: Clock,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      num: 5,
      title: 'MAKALAH',
      subtitle: 'Karya Tulis Ilmiah',
      desc: 'Penyusunan makalah terstruktur, tinjauan pustaka komprehensif, rapi, dan sesuai dengan kaidah penulisan kampus.',
      tag: 'Rapi & Sistematis',
      icon: FileCheck2,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    {
      num: 6,
      title: 'PPT',
      subtitle: 'Desain Presentasi Sidang',
      desc: 'Pembuatan slide presentasi menarik, visual profesional, siap disajikan untuk sempro, tugas, maupun sidang skripsi.',
      tag: 'Desain Modern',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    {
      num: 7,
      title: 'WEBSITE & APLIKASI',
      subtitle: 'Coding Tugas & Skripsi IT',
      desc: 'Pembuatan website, aplikasi mobile, dan sistem informasi custom sesuai kebutuhan riset dan tugas akhir Anda.',
      tag: 'Full-Stack / Coding',
      icon: Laptop,
      color: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      num: 8,
      title: 'UNDANGAN DIGITAL',
      subtitle: 'Desain Custom & Interaktif',
      desc: 'Pembuatan undangan digital estetik, custom, responsif di berbagai perangkat smartphone, dan elegan.',
      tag: 'Custom Design',
      icon: Mail,
      color: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    {
      num: 9,
      title: 'CEK PLAGIASI',
      subtitle: 'Uji Turnitin No-Repository',
      desc: 'Pengecekan tingkat plagiasi karya tulis ilmiah Anda secara cepat dan akurat menggunakan akun Turnitin resmi.',
      tag: 'Turnitin Resmi',
      icon: SearchCheck,
      color: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    },
    {
      num: 10,
      title: 'TURUNIN PLAGIASI',
      subtitle: 'Parafrase Lolos Turnitin',
      desc: 'Menurunkan persentase kesamaan (similarity) secara aman dan efektif lewat teknik parafrase manual tanpa mengubah arti.',
      tag: 'Garansi Lolos < 20%',
      icon: FileSearch,
      color: 'bg-burgundy-50 text-burgundy-800 border-burgundy-200',
    },
  ];

  const pillars = [
    {
      title: 'PROFESIONAL',
      subtitle: 'Dikerjakan oleh Tim Berpengalaman',
      desc: 'Dikerjakan langsung oleh tim internal kami yang berpendidikan sarjana dan berpengalaman menangani berbagai bidang disiplin ilmu.',
      icon: Award,
      badge: 'Standar Tinggi',
    },
    {
      title: 'TEPAT WAKTU',
      subtitle: 'Pengerjaan Sesuai Deadline',
      desc: 'Manajemen waktu ketat. Kami memastikan draf tugas dan skripsi diserahkan tepat pada jadwal yang telah Anda tentukan.',
      icon: Clock,
      badge: 'Tepat Jadwal',
    },
    {
      title: 'HASIL TERBAIK',
      subtitle: 'Kualitas Terbaik Tanpa Drama',
      desc: 'Hasil pengerjaan terstruktur, referensi mutakhir, bebas plagiasi liar, dan siap menghadapi pertanyaan dosen pembimbing.',
      icon: CheckCircle2,
      badge: 'Garansi Revisi',
    },
    {
      title: 'HARGA TERJANGKAU',
      subtitle: 'Bersahabat & Negotiable',
      desc: 'Biaya disesuaikan dengan tingkat kerumitan dan tenggat waktu. Sangat ramah untuk kantong mahasiswa dan bisa dinegosiasikan.',
      icon: Wallet,
      badge: 'Harga Pelajar',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-muted text-gray-900 selection:bg-forest-800 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-800 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-forest-950 block leading-tight">
                Jokiskripsiku
              </span>
              <span className="text-[10px] font-bold tracking-wider text-burgundy-700 uppercase flex items-center gap-1">
                <span>@jokiskripsiku.tng</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-600">
            <a href="#layanan" className="hover:text-forest-800 transition-colors">10 Layanan</a>
            <a href="#keunggulan" className="hover:text-forest-800 transition-colors">Keunggulan Tim</a>
            <a href="#sistem-rekber" className="hover:text-forest-800 transition-colors">Sistem Rekber</a>
            <a href="#tim-ahli" className="hover:text-forest-800 transition-colors">Tentang Kami</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Tim%20Jokiskripsiku,%20saya%20ingin%20konsultasi%20mengenai%20skripsi/tugas%20saya"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex"
            >
              <Button variant="outline" size="sm" className="border-forest-200 text-forest-800 hover:bg-forest-50">
                <MessageCircle className="h-4 w-4 mr-1.5 text-emerald-600" /> Tanya WhatsApp
              </Button>
            </a>
            <Link href="/login">
              <Button variant="ghost" size="sm">Masuk</Button>
            </Link>
            <Link href="/buyer/create-project">
              <Button variant="primary" size="sm" className="font-bold shadow-sm">
                Pesan Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-surface-muted to-forest-50/20 px-4 pt-14 pb-20 sm:px-6 lg:px-8 lg:pt-20 lg:pb-28 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-forest-50/90 px-4 py-1.5 text-xs font-bold text-forest-900 shadow-sm">
            <Sparkles className="h-4 w-4 text-forest-700" />
            <span>SOLUSI TUGAS & SKRIPSI ANDA — SELESAI, CEPAT, & AMANAH!</span>
          </div>

          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-forest-950 sm:text-5xl lg:text-6xl leading-[1.15]">
            Tugas Berat? <br className="hidden sm:inline" />
            <span className="text-forest-800 underline decoration-burgundy-600/40 decoration-wavy">
              Biar Tim Kami Yang Beresin!
            </span> 🎓✨
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-600 leading-relaxed font-sans">
            Mau urusan akademik atau kebutuhan digital, kami punya solusi lengkapnya! 
            Dari tugas harian sampai skripsi tuntas, semuanya dikerjakan langsung oleh 
            <strong className="text-forest-950"> Tim Ahli Inti Berpengalaman</strong> dengan amanah, cepat, dan transparan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link href="/buyer/create-project" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold text-sm shadow-md">
                Pilih Layanan & Pesan <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Tim%20Jokiskripsiku,%20mau%20konsultasi%20tugas%20kuliah/skripsi%20saya"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold border-forest-300 text-forest-900 bg-white hover:bg-forest-50">
                <MessageCircle className="h-4 w-4 mr-2 text-emerald-600" /> Konsultasi Langsung via WhatsApp
              </Button>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-8 text-xs text-gray-500 font-medium">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-700 shadow-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Dikerjakan Langsung oleh Tim Internal (Bukan Calo Liar) • Rekber Aman 100%
            </span>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars (Pilar Keunggulan) */}
      <section id="keunggulan" className="px-4 py-16 sm:px-6 lg:px-8 bg-white border-y border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-2 mb-12">
            <Badge variant="forest">Komitmen Layanan</Badge>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Kenapa Mempercayakan Tugas Pada Kami?
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
              Standar mutu tinggi untuk menjamin kenyamanan dan kesuksesan akademik Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200 bg-surface-muted/50 p-6 transition-all duration-200 hover:border-forest-300 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-800 text-white shadow-xs">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-forest-100/70 px-2.5 py-1 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-forest-950">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-burgundy-700 mt-1">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10 Daftar Jasa Kami (Exact Showcase from Poster) */}
      <section id="layanan" className="px-4 py-20 sm:px-6 lg:px-8 bg-surface-muted">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs font-bold">
              <span>DAFTAR JASA KAMI</span>
            </div>
            <h2 className="font-serif text-3xl font-extrabold text-forest-950 sm:text-4xl">
              10 Layanan Solutif untuk Kebutuhan Akademik & Digital
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Pilih layanan yang Anda butuhkan. Tim kami siap mendampingi pengerjaan dari tahap awal hingga selesai tuntas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
            {services.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.num}
                  className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-forest-600 hover:shadow-md"
                >
                  <div>
                    {/* Header with Number & Tag */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-800 text-xs font-bold text-white shadow-xs">
                        {srv.num}
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {srv.tag}
                      </span>
                    </div>

                    {/* Service Icon */}
                    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border ${srv.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="font-serif text-base font-bold text-gray-900 group-hover:text-forest-900 transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-forest-700 mt-0.5 mb-2">
                      {srv.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>

                  {/* Order Button inside Card */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link
                      href={`/buyer/create-project?service=${encodeURIComponent(srv.title)}`}
                      className="inline-flex w-full items-center justify-between text-xs font-bold text-forest-800 group-hover:text-forest-950 transition-colors"
                    >
                      <span>Pesan Jasa Ini</span>
                      <ChevronRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice under services */}
          <div className="mt-10 rounded-xl border border-forest-200 bg-forest-50/70 p-4 text-center max-w-2xl mx-auto">
            <p className="text-xs text-forest-900 font-medium">
              💡 <strong>Butuh paket khusus atau pengerjaan kilat?</strong> Diskusikan langsung dengan tim kami untuk mendapatkan estimasi waktu dan negosiasi biaya terbaik.
            </p>
          </div>
        </div>
      </section>

      {/* Exclusive Team Model (Kenapa Kami, Bukan Calo Liar) */}
      <section id="tim-ahli" className="px-4 py-20 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4 text-left">
              <Badge variant="forest">Kredibilitas Tim Inti</Badge>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950 leading-tight">
                Dikerjakan Langsung oleh Tim Kami Sendiri. Bukan Calo, Bukan Pihak Ketiga.
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Di luaran sana, banyak jasa yang sekadar melempar tugas Anda ke freelance acak tanpa kontrol kualitas, sehingga sering terjadi salah paham, hasil asal-asalan, hingga risiko kabur saat revisi.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Di <strong className="text-forest-950">Jokiskripsiku</strong>, seluruh pengerjaan ditangani langsung oleh kami (tim ahli internal yang berdedikasi). Kami menjaga komunikasi 1 pintu, bertanggung jawab penuh atas hasil, dan mendampingi sampai Anda tuntas.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-gray-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Komunikasi 1 pintu langsung dengan pengerja tugas</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Garansi revisi sampai tuntas sesuai instruksi awal</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Bukti cek Turnitin resmi bebas plagiasi liar</span>
                </div>
              </div>
            </div>

            {/* Team Guarantee Card */}
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-forest-900 to-forest-950 p-8 text-white shadow-lg text-left space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Garansi Amanah & Kualitas</h3>
                  <p className="text-xs text-forest-200">#TugasBeresKamiPuas</p>
                </div>
              </div>

              <blockquote className="text-sm text-gray-200 italic leading-relaxed border-l-2 border-emerald-400 pl-4">
                &ldquo;Tugas Anda adalah prioritas kami. Kami berkomitmen memberikan hasil terbaik dengan ketelitian tinggi agar Anda lulus tanpa drama.&rdquo;
              </blockquote>

              <div className="grid grid-cols-2 gap-4 border-t border-forest-800 pt-4 text-xs">
                <div>
                  <p className="text-forest-300 uppercase tracking-widest font-bold text-[10px]">Lokasi Tim</p>
                  <p className="font-semibold text-white mt-0.5">Tangerang & Jabodetabek</p>
                </div>
                <div>
                  <p className="text-forest-300 uppercase tracking-widest font-bold text-[10px]">Instagram</p>
                  <p className="font-semibold text-white mt-0.5">@jokiskripsiku.tng</p>
                </div>
              </div>

              <a
                href="https://wa.me/6281234567890?text=Halo%20Tim%20Jokiskripsiku,%20saya%20ingin%20tanya%20layanan"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5">
                  <MessageCircle className="h-4 w-4 mr-1.5" /> Hubungi Tim Langsung via WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Escrow System */}
      <section id="sistem-rekber" className="px-4 py-20 sm:px-6 lg:px-8 bg-surface-muted border-b border-gray-200">
        <div className="mx-auto max-w-5xl text-center space-y-4">
          <Badge variant="burgundy">Sistem Rekber Amanah</Badge>
          <h2 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
            Bagaimana Dana dan Tugas Anda Terlindungi?
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Transaksi aman dan transparan. Tidak ada transfer langsung tanpa hasil nyata.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest-800 text-white mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-gray-900">1. Setor ke Rekber Resmi</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Anda mentransfer biaya ke rekening bersama resmi platform (BCA 8801928371 a.n PT Joki Skripsi Indonesia). Dana berstatus <strong>HELD</strong> aman.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy-700 text-white mb-4">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-gray-900">2. Pengerjaan & Cek Turnitin</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Tim mengerjakan tugas/skripsi sesuai instruksi Anda, menyertakan uji plagiasi Turnitin, dan mengunggah draf ke portal dokumen aman.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700 text-white mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-gray-900">3. ACC & Rilis Dana</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Anda memeriksa hasil pengerjaan. Jika masih ada revisi, tim segera perbaiki. Dana baru dicairkan setelah Anda puas dan menyetujui (Approved).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner (Poster Theme) */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-forest-950 text-white text-center relative overflow-hidden">
        <div className="mx-auto max-w-4xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold text-emerald-300">
            <span>#TUGASBERESKAMIPUAS</span>
          </div>

          <h2 className="font-serif text-3xl font-extrabold sm:text-4xl text-white">
            Kerjakan Tugas Anda Bersama Kami!<br />
            <span className="text-emerald-400">Hasil Maksimal Tanpa Drama!</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            Percayakan tugasmu pada yang ahli! Konsultasikan judul, kendala bab skripsi, atau tugas harianmu sekarang juga.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/buyer/create-project" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold bg-emerald-600 hover:bg-emerald-500 text-white">
                Pesan Tugas / Skripsi Sekarang <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Tim%20Jokiskripsiku,%20mau%20order%20jasa%20tugas/skripsi"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold border-gray-600 text-white bg-forest-900 hover:bg-forest-850">
                <MessageCircle className="h-4 w-4 mr-2 text-emerald-400" /> Chat WhatsApp Tim Kami
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-12 sm:px-6 lg:px-8 text-xs text-gray-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-800 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-serif text-base font-bold text-forest-900">Jokiskripsiku</p>
              <p className="text-[10px] text-gray-400 font-medium">Solusi Tugas & Skripsi Anda — Selesai, Cepat, & Amanah!</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-600">
            <a href="#layanan" className="hover:text-forest-900 transition-colors">10 Layanan</a>
            <a href="#sistem-rekber" className="hover:text-forest-900 transition-colors">Sistem Rekber</a>
            <a
              href="https://instagram.com/jokiskripsiku.tng"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-forest-900 font-semibold transition-colors flex items-center gap-1 text-burgundy-700"
            >
              Instagram: @jokiskripsiku.tng <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <p className="text-gray-400 text-center sm:text-right">
            &copy; 2026 Jokiskripsiku Indonesia. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
