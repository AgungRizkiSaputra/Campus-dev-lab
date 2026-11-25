'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getActiveSession, type AuthUser } from '@/lib/auth';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  FileCheck2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  Wallet,
  BookOpen,
  FileText,
  Laptop,
  Mail,
  SearchCheck,
  FileSearch,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export default function LandingPage() {
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setCurrentUser(getActiveSession());
  }, []);

  // Initialize GSAP + ScrollTrigger word-by-word scroll reveal
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (wordsContainerRef.current) {
      const words = wordsContainerRef.current.querySelectorAll('.gsap-word');
      gsap.fromTo(
        words,
        {
          opacity: 0.15,
          y: 25,
          filter: 'blur(4px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: wordsContainerRef.current,
            start: 'top 85%',
            end: 'top 35%',
            scrub: 0.8,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const headlineLine1 = ['Tugas', 'Berat?'];
  const headlineLine2 = ['Biar', 'Tim', 'Kami', 'Yang', 'Beresin.'];

  const workflowSteps = [
    {
      num: '01',
      title: 'Pilih Jasa & Isi Instruksi',
      desc: 'Pilih salah satu dari 10 layanan resmi, tuliskan judul tugas atau topik riset, dan unggah panduan penulisan dari dosen kampus Anda.',
    },
    {
      num: '02',
      title: 'Konfirmasi Langsung Tim Kami',
      desc: 'Tim inti meninjau instruksi tugas Anda dan menetapkan estimasi jadwal pengerjaan serta kesepakatan biaya yang bersahabat.',
    },
    {
      num: '03',
      title: 'Amankan Dana di Rekber Resmi',
      desc: 'Deposit diamankan dalam sistem Rekber Escrow platform Jokiskripsiku. Dana berstatus HELD aman 100% dan terlindungi hingga naskah tugas Anda di-ACC.',
    },
    {
      num: '04',
      title: 'Pengerjaan, Turnitin, & ACC',
      desc: 'Tim menyerahkan draf tugas lengkap dengan laporan resmi Turnitin (< 20%). Revisi dipenuhi sampai tuntas, dana baru dirilis setelah Anda ACC.',
    },
  ];

  const services = [
    {
      num: '01',
      title: 'SEMPRO',
      subtitle: 'Seminar Proposal',
      desc: 'Bantuan penyusunan seminar proposal komprehensif mulai dari formulasi judul, latar belakang ilmiah, hingga siap diseminarkan di hadapan dosen penguji.',
      tag: 'Bab 1–3',
      icon: BookOpen,
      href: '/buyer/create-project?service=SEMPRO',
    },
    {
      num: '02',
      title: 'SKRIPSI',
      subtitle: 'Skripsi Lengkap Bab 1–5',
      desc: 'Penyusunan naskah skripsi lengkap terstruktur dengan metodologi mutakhir, pengolahan data akurat, dan pembahasan mendalam hingga tuntas wisuda.',
      tag: 'Paket Lengkap',
      icon: GraduationCap,
      href: '/buyer/create-project?service=SKRIPSI',
    },
    {
      num: '03',
      title: 'TUGAS',
      subtitle: 'Tugas Kuliah Harian',
      desc: 'Pengerjaan tugas kuliah analitis, studi kasus, essay ilmiah, hingga laporan praktikum dengan ketepatan referensi dan mutu terbaik.',
      tag: 'Cepat & Akurat',
      icon: FileText,
      href: '/buyer/create-project?service=TUGAS',
    },
    {
      num: '04',
      title: 'UTS / UAS',
      subtitle: 'Ujian Semester',
      desc: 'Asistensi pengerjaan soal ujian semester dengan jawaban presisi, runtut, dan pengumpulan tepat waktu demi indeks prestasi maksimal.',
      tag: 'Fast Response',
      icon: Clock,
      href: '/buyer/create-project?service=UTS_UAS',
    },
    {
      num: '05',
      title: 'MAKALAH',
      subtitle: 'Karya Tulis Ilmiah',
      desc: 'Penyusunan makalah sistematis berbasis literatur jurnal terakreditasi nasional maupun internasional sesuai kaidah format kampus Anda.',
      tag: 'Rapi & Terstruktur',
      icon: FileCheck2,
      href: '/buyer/create-project?service=MAKALAH',
    },
    {
      num: '06',
      title: 'PPT',
      subtitle: 'Slide Presentasi Sidang',
      desc: 'Desain visual slide presentasi kelas eksekutif dengan struktur infografis bersih, alur logis, dan siap dipresentasikan di ruang sidang.',
      tag: 'Desain Modern',
      icon: Sparkles,
      href: '/buyer/create-project?service=PPT',
    },
    {
      num: '07',
      title: 'WEB & APLIKASI',
      subtitle: 'Coding Tugas/Skripsi IT',
      desc: 'Pengembangan perangkat lunak, sistem informasi, mobile app, atau machine learning custom lengkap dengan pengujian dan dokumentasi source code.',
      tag: 'Full-Stack',
      icon: Laptop,
      href: '/buyer/create-project?service=WEBSITE_APP',
    },
    {
      num: '08',
      title: 'UNDANGAN DIGITAL',
      subtitle: 'Desain Custom & Interaktif',
      desc: 'Pembuatan undangan digital berbasis web interaktif, responsif untuk seluruh layar smartphone, estetik, dan berfitur RSVP modern.',
      tag: 'Custom Design',
      icon: Mail,
      href: '/buyer/create-project?service=UNDANGAN_DIGITAL',
    },
    {
      num: '09',
      title: 'CEK PLAGIASI',
      subtitle: 'Uji Turnitin No-Repository',
      desc: 'Pengecekan tingkat kesamaan naskah ilmiah Anda secara resmi melalui akun Turnitin No-Repository tanpa risiko karya tersimpan di database.',
      tag: 'Turnitin Resmi',
      icon: SearchCheck,
      href: '/buyer/create-project?service=CEK_PLAGIASI',
    },
    {
      num: '10',
      title: 'TURUNIN PLAGIASI',
      subtitle: 'Parafrase Lolos Uji',
      desc: 'Reduksi persentase plagiasi Turnitin melalui teknik parafrase manual akademis tanpa merusak makna dan keaslian konteks riset Anda.',
      tag: 'Garansi < 20%',
      icon: FileSearch,
      href: '/buyer/create-project?service=TURUNIN_PLAGIASI',
    },
  ];

  const pillars = [
    {
      title: 'PROFESIONAL',
      subtitle: 'Dikerjakan Tim Inti Berpengalaman',
      desc: 'Ditangani langsung oleh tim internal kami yang berpendidikan akademis tinggi dan menguasai berbagai metodologi riset.',
      icon: Award,
    },
    {
      title: 'TEPAT WAKTU',
      subtitle: 'Disiplin Sesuai Jadwal Sidang',
      desc: 'Manajemen waktu ketat. Setiap draf bab diserahkan tepat pada tenggat waktu yang telah disepakati bersama.',
      icon: Clock,
    },
    {
      title: 'HASIL TERBAIK',
      subtitle: 'Standar Mutu Tinggi Tanpa Drama',
      desc: 'Penulisan mendalam, referensi primer mutakhir, bergaransi revisi tuntas sampai disetujui dosen pembimbing.',
      icon: CheckCircle2,
    },
    {
      title: 'HARGA TERJANGKAU',
      subtitle: 'Transparan & Negotiable',
      desc: 'Penawaran biaya yang adil dan sebanding dengan kompleksitas tugas. Sangat bersahabat bagi anggaran mahasiswa.',
      icon: Wallet,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-gray-900 selection:bg-forest-800 selection:text-white">
      {/* Pristine Luxury Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
              <GraduationCap className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="font-serif text-xl font-bold tracking-tight text-forest-950 block leading-tight">
                Jokiskripsiku
              </span>
              <span className="text-[10px] font-bold tracking-[0.16em] text-burgundy-700 uppercase block">
                @jokiskripsiku.tng
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold tracking-[0.14em] uppercase text-gray-500">
            <a href="#layanan" className="hover:text-forest-950 transition-colors">10 Layanan</a>
            <a href="#alur-kerja" className="hover:text-forest-950 transition-colors">Alur Pemesanan</a>
            <a href="#keunggulan" className="hover:text-forest-950 transition-colors">Keunggulan Tim</a>
            <a href="#sistem-rekber" className="hover:text-forest-950 transition-colors">Sistem Rekber</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                href={`/${currentUser.role}`}
                className="text-xs font-bold uppercase tracking-wider text-forest-900 bg-forest-50 border border-forest-200 rounded-full px-4 py-2 hover:bg-forest-100 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-forest-950 px-3 py-2 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:border-emerald-500 hover:text-emerald-800 transition-all"
                >
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Daftar</span>
                </Link>
              </>
            )}
            <Link href={currentUser ? '/buyer/create-project' : '/login?redirect=/buyer/create-project'}>
              <Button
                variant="primary"
                size="sm"
                className="rounded-full bg-forest-900 hover:bg-forest-800 text-white font-bold px-5 py-2 shadow-sm transition-all hover:shadow-md"
              >
                Pesan Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with GSAP Word-by-Word Scroll Reveal */}
      <section className="relative overflow-hidden px-6 pt-20 pb-28 lg:px-10 lg:pt-28 lg:pb-36 text-center">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Subtle Luxury Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-forest-200 bg-forest-50/70 px-4 py-1.5 text-xs font-semibold tracking-wider text-forest-900 uppercase shadow-xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-forest-700"></span>
            <span>Solusi Tugas & Skripsi Anda — Selesai, Cepat, & Amanah</span>
          </motion.div>

          {/* GSAP Word-by-Word Scroll Reveal Headline */}
          <div ref={wordsContainerRef} className="space-y-2 py-2">
            <div className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-forest-950 leading-[1.12]">
              {headlineLine1.map((word, i) => (
                <span key={i} className="inline-block mr-[0.28em]">
                  <span className="gsap-word inline-block">{word}</span>
                </span>
              ))}
            </div>
            <div className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-forest-900 leading-[1.12]">
              {headlineLine2.map((word, i) => (
                <span key={i} className="inline-block mr-[0.28em]">
                  <span className="gsap-word inline-block">{word}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto max-w-2xl text-base sm:text-lg text-gray-600 leading-relaxed font-sans"
          >
            Mau urusan akademik atau kebutuhan digital, kami punya solusi lengkapnya. 
            Dari tugas harian sampai skripsi tuntas, semuanya dikerjakan langsung oleh 
            <strong className="text-forest-950 font-semibold"> Tim Ahli Inti Berpengalaman</strong> secara 
            amanah, tepat waktu, dan bergaransi lolos Turnitin.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              href={currentUser ? '/buyer/create-project' : '/login?redirect=/buyer/create-project'}
              className="w-full sm:w-auto"
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto rounded-full bg-forest-900 hover:bg-forest-800 text-white font-bold px-8 py-3.5 shadow-md transition-all hover:scale-[1.02]"
              >
                Pilih Layanan & Pesan <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link
              href="#layanan"
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full border-gray-300 text-gray-800 bg-white hover:bg-gray-50 px-7 py-3.5 font-semibold shadow-xs transition-all hover:border-gray-400"
              >
                <BookOpen className="h-4 w-4 mr-2 text-emerald-600" /> Jelajahi 10 Layanan
              </Button>
            </Link>
          </motion.div>

          {/* High-End Trust Label */}
          <div className="pt-6">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Dikerjakan Langsung oleh Tim Internal (Bukan Calo) • Sistem Rekber 100% Amanah
            </span>
          </div>
        </div>
      </section>

      {/* 4-Step Clear Workflow Section (Alur Kerja Yang Jelas) */}
      <section id="alur-kerja" className="px-6 py-24 lg:px-10 bg-white border-y border-gray-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-forest-800 bg-forest-50 px-3.5 py-1 rounded-full border border-forest-200">
              Alur Transparan
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              Alur Pemesanan yang Jelas & Terstruktur
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Empat langkah praktis dari pengajuan tugas hingga persetujuan hasil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {workflowSteps.map((wf, idx) => (
              <motion.div
                key={wf.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-2xl border border-gray-200 bg-surface-muted/40 p-7 space-y-4 hover:border-forest-400 hover:bg-white transition-all shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-xl font-extrabold text-forest-900 bg-forest-50 px-3 py-1 rounded-xl border border-forest-200">
                    {wf.num}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Tahap {idx + 1}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">
                  {wf.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {wf.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/buyer/create-project">
              <Button variant="primary" size="lg" className="rounded-full bg-forest-900 hover:bg-forest-800 font-bold px-8 shadow-sm">
                Mulai Pesan Layanan Sekarang <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 10 Daftar Jasa Kami */}
      <section id="layanan" className="px-6 py-24 lg:px-10 bg-[#F8F9FA]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-burgundy-800 bg-burgundy-50 px-3.5 py-1 rounded-full border border-burgundy-200">
              Katalog Lengkap
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-forest-950">
              10 Layanan Solutif untuk Tugas & Skripsi
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Pilih layanan yang Anda perlukan. Dikerjakan langsung oleh tim internal kami secara privat dan terstruktur.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 text-left">
            {services.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <motion.div
                  key={srv.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:border-forest-600 hover:shadow-elevated"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-serif text-sm font-bold text-forest-900 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-100">
                        {srv.num}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {srv.tag}
                      </span>
                    </div>

                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-800 border border-forest-100 group-hover:bg-forest-900 group-hover:text-white transition-colors duration-200">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="font-serif text-base font-bold text-gray-900 group-hover:text-forest-950 transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-forest-700 mt-0.5 mb-2.5">
                      {srv.subtitle}
                    </p>

                    <p className="text-xs text-gray-500 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-gray-100">
                    <Link
                      href={currentUser ? srv.href : `/login?redirect=${encodeURIComponent(srv.href)}`}
                      className="inline-flex w-full items-center justify-between text-xs font-bold text-forest-800 group-hover:text-forest-950 transition-colors"
                    >
                      <span>Pesan Jasa Ini</span>
                      <ChevronRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl border border-forest-200 bg-forest-50/80 p-5 text-center max-w-2xl mx-auto shadow-xs">
            <p className="text-xs text-forest-950 font-medium">
              💡 <strong>Butuh pengerjaan paket khusus atau tenggat kilat?</strong> Diskusikan langsung bersama tim kami untuk estimasi timeline dan negosiasi biaya terbaik.
            </p>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Excellence */}
      <section id="keunggulan" className="px-6 py-20 lg:px-10 bg-white border-y border-gray-200/80">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-forest-800 bg-forest-50 px-3.5 py-1 rounded-full border border-forest-200">
              Komitmen Layanan
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              Standar Pengerjaan Kelas Profesional
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Dedikasi penuh demi kepuasan akademik dan kelulusan Anda tanpa kendala.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="rounded-2xl border border-gray-200 bg-surface-muted/40 p-7 transition-all duration-200 hover:border-forest-300 hover:bg-white hover:shadow-card"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-900 text-white mb-5 shadow-xs">
                    <Icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-forest-950">
                    {item.title}
                  </h3>
                  <p className="text-xs font-bold text-burgundy-700 mt-1">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Transparent Escrow System */}
      <section id="sistem-rekber" className="px-6 py-24 lg:px-10 bg-[#F8F9FA] border-b border-gray-200">
        <div className="mx-auto max-w-5xl text-center space-y-4">
          <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-burgundy-800 bg-burgundy-50 px-3.5 py-1 rounded-full border border-burgundy-200">
            Sistem Rekber Transparan
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
            Bagaimana Dana dan Tugas Anda Terlindungi?
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Transaksi aman dan transparan. Tidak ada transfer langsung tanpa hasil nyata.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-white mb-5">
                <Lock className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="font-serif font-bold text-base text-gray-900">1. Deposit Rekber Aman</h3>
              <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                Anda mendepositkan biaya ke rekening bersama resmi platform Jokiskripsiku. Dana berstatus <strong>HELD</strong> aman dan tidak dirilis sebelum Anda menyetujui hasil pengerjaan.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-burgundy-800 text-white mb-5">
                <FileCheck2 className="h-5 w-5 text-rose-300" />
              </div>
              <h3 className="font-serif font-bold text-base text-gray-900">2. Pengerjaan & Cek Turnitin</h3>
              <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                Tim mengerjakan tugas/skripsi sesuai instruksi Anda, menyertakan uji plagiasi Turnitin, dan mengunggah draf ke ruang dokumen terenkripsi.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-white mb-5">
                <ShieldCheck className="h-5 w-5 text-emerald-200" />
              </div>
              <h3 className="font-serif font-bold text-base text-gray-900">3. ACC & Rilis Dana</h3>
              <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                Anda memeriksa hasil pengerjaan. Jika masih ada revisi, tim segera perbaiki. Dana baru dicairkan setelah Anda puas dan menyetujui (Approved).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Keamanan Layanan & Sistem Rekber Escrow (Bebas Data Pribadi Publik) */}
      <section id="standar-layanan" className="px-6 py-20 lg:px-10 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-3 mb-12">
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              Standar Layanan &amp; Proteksi Mahasiswa
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-forest-950">
              Komitmen Keamanan Akademik &amp; Garansi Resmi
            </h2>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              Seluruh proses bimbingan, pengerjaan tugas, dan transaksi keuangan dilakukan secara terintegrasi melalui sistem platform resmi berstandar tinggi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left Card: Sistem Konsultasi & Ruang Kerja Terproteksi */}
            <div className="rounded-3xl border border-forest-100 bg-gradient-to-br from-forest-900 to-forest-950 text-white p-7 sm:p-9 flex flex-col justify-between shadow-card">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Layanan Terintegrasi
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white mt-1">
                    Ruang Kerja &amp; Konsultasi Terproteksi
                  </h3>
                  <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                    Setiap mahasiswa mendapatkan ruang kerja privat untuk berdiskusi materi, menyepakati instruksi dosen, dan mengunggah panduan kampus secara rahasia.
                  </p>
                </div>

                {/* 4 Brand Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-xs space-y-1">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Live Chat Privat
                    </span>
                    <p className="text-[11px] text-gray-300 leading-tight">
                      Ruang obrolan terenkripsi langsung dengan tim pengerja di dashboard pesanan Anda.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-xs space-y-1">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Bebas Revisi
                    </span>
                    <p className="text-[11px] text-gray-300 leading-tight">
                      Pendampingan revisi tanpa batas hingga naskah tugas disetujui (ACC) dosen.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-xs space-y-1">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> 100% Confidential
                    </span>
                    <p className="text-[11px] text-gray-300 leading-tight">
                      Privasi identitas mahasiswa, judul, dan data kampus dijamin terlindungi ketat.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-xs space-y-1">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Progres Real-Time
                    </span>
                    <p className="text-[11px] text-gray-300 leading-tight">
                      Pantau pengerjaan bab demi bab dan unduh berkas draf kapan saja dari dashboard.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={currentUser ? '/buyer/create-project' : '/register'}>
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                    >
                      Mulai Konsultasi &amp; Pesan Tugas &rarr;
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs text-emerald-200">
                <span>Instagram Resmi: <strong>@jokiskripsiku.tng</strong></span>
                <span className="font-medium text-gray-400">Mudah, Cepat &amp; Amanah</span>
              </div>
            </div>

            {/* Right Card: Sistem Rekber Escrow & Garansi Akademik */}
            <div className="rounded-3xl border border-gray-200 bg-surface-muted/30 p-7 sm:p-9 flex flex-col justify-between shadow-xs">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold text-burgundy-700 uppercase tracking-wider">
                    Sistem Rekber Escrow
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-gray-950 mt-1">
                    Jaminan Proteksi Dana &amp; Uji Turnitin
                  </h3>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                    Sistem rekening bersama resmi platform melindungi hak mahasiswa secara adil. Rekening transfer diverifikasi otomatis dan hanya dibuka di dashboard setelah pesanan dikonfirmasi.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-900 border border-forest-200 shrink-0">
                      <Lock className="h-5 w-5 text-forest-800" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Status Rekber HELD Protection</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Dana Anda tertahan aman di platform dan tidak diteruskan ke tim sebelum Anda menyetujui hasil pengerjaan.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 shrink-0">
                      <ShieldCheck className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Garansi Resmi Uji Turnitin (&lt; 20%)</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Naskah skripsi dan makalah riset wajib lolos pengecekan plagiarisme berstandar kampus resmi.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                      <Wallet className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Jaminan Hak Arbitrase &amp; Pengembalian</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Bila tim tidak memenuhi komitmen instruksi tugas, Anda berhak mengajukan mediasi atau refund dana.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Keamanan Transaksi:</strong> Rincian nomor rekening resmi terbit secara unik pada invoice tagihan di dashboard setelah pesanan Anda disetujui.
                  </p>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200/80 mt-6 flex items-center justify-between text-xs text-gray-500">
                <span>Status Rekber: <strong>HELD Protection Terenkripsi</strong></span>
                <span className="text-forest-900 font-semibold">Amanah &bull; Tepat Waktu &bull; Terpercaya</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-6 py-20 lg:px-10 bg-forest-950 text-white text-center relative overflow-hidden">
        <div className="mx-auto max-w-4xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold text-emerald-300">
            <span>#TUGASBERESKAMIPUAS</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Kerjakan Tugas Anda Bersama Kami.<br />
            <span className="text-emerald-400">Hasil Maksimal Tanpa Drama.</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto font-sans leading-relaxed">
            Percayakan tugas Anda pada yang ahli. Konsultasikan judul, kendala bab skripsi, atau tugas harian Anda sekarang juga.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link href="/buyer/create-project" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto rounded-full font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 shadow-lg transition-all"
              >
                Pesan Tugas / Skripsi Sekarang <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full font-semibold border-gray-600 text-white bg-forest-900 hover:bg-forest-850 px-6 py-3.5 shadow-xs"
              >
                <UserCheck className="h-4 w-4 mr-2 text-emerald-400" /> Buat Akun Mahasiswa
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full font-semibold border-gray-600 text-white bg-forest-900 hover:bg-forest-850 px-6 py-3.5 shadow-xs"
              >
                <ArrowRight className="h-4 w-4 mr-2 text-emerald-400" /> Masuk ke Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-12 lg:px-10 text-xs text-gray-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-900 text-white">
              <GraduationCap className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="font-serif text-base font-bold text-forest-950">Jokiskripsiku</p>
              <p className="text-[10px] text-gray-400 font-medium">Solusi Tugas & Skripsi Anda — Selesai, Cepat, & Amanah!</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-600">
            <a href="#layanan" className="hover:text-forest-950 transition-colors">10 Layanan</a>
            <a href="#alur-kerja" className="hover:text-forest-950 transition-colors">Alur Pemesanan</a>
            <a href="#sistem-rekber" className="hover:text-forest-950 transition-colors">Sistem Rekber</a>
            <a
              href="https://instagram.com/jokiskripsiku.tng"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-forest-950 font-semibold transition-colors flex items-center gap-1 text-burgundy-700"
            >
              Instagram: @jokiskripsiku.tng <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <p className="text-gray-400 text-center sm:text-right">
            &copy; 2026 Jokiskripsiku Indonesia. Seluruh hak cipta dilindungi undang-undang.
          </p>
        </div>
      </footer>
    </div>
  );
}
