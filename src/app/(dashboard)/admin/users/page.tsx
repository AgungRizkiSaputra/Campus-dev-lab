'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import {
  Users,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Search,
  UserPlus,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { getAllUsers, saveAllUsers, type AuthUser } from '@/lib/auth';

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State for Adding New Penjoki
  const [isAddPenjokiOpen, setIsAddPenjokiOpen] = useState(false);
  const [newPenjokiName, setNewPenjokiName] = useState('');
  const [newPenjokiEmail, setNewPenjokiEmail] = useState('');
  const [newPenjokiPhone, setNewPenjokiPhone] = useState('');
  const [newPenjokiEducation, setNewPenjokiEducation] = useState('S2 Magister / Master');
  const [newPenjokiExpertise, setNewPenjokiExpertise] = useState('');
  const [newPenjokiPassword, setNewPenjokiPassword] = useState('joki123456');
  const [showPenjokiPassword, setShowPenjokiPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog State for Deleting Account
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setUsers(getAllUsers());
  }, []);

  const buyers = users.filter((u) => u.role === 'buyer');
  const sellers = users.filter((u) => u.role === 'seller');
  const verifiedSellers = sellers.filter((s) => s.kycStatus === 'VERIFIED');

  // Filtered lists based on search
  const filteredBuyers = buyers.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      (b.university && b.university.toLowerCase().includes(q)) ||
      (b.major && b.major.toLowerCase().includes(q)) ||
      (b.phone && b.phone.includes(q))
    );
  });

  const filteredSellers = sellers.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.expertise && s.expertise.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q))
    );
  });

  // Toggle user active / suspended status
  const handleToggleStatus = (targetUser: AuthUser) => {
    const newStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updated = users.map((u) =>
      u.id === targetUser.id ? { ...u, status: newStatus as 'ACTIVE' | 'SUSPENDED' } : u
    );
    saveAllUsers(updated);
    setUsers(updated);
    toast({
      type: newStatus === 'ACTIVE' ? 'success' : 'warning',
      title: 'Status Akun Diperbarui',
      message: `Akun ${targetUser.name} kini berstatus ${newStatus === 'ACTIVE' ? 'Aktif' : 'Ditangguhkan'}.`,
    });
  };

  // Quick KYC verification approval for penjoki
  const handleVerifyKyc = (targetId: string, approve: boolean) => {
    const updated = users.map((u) =>
      u.id === targetId
        ? {
            ...u,
            kycStatus: (approve ? 'VERIFIED' : 'REJECTED') as 'VERIFIED' | 'REJECTED',
            isVerified: approve,
          }
        : u
    );
    saveAllUsers(updated);
    setUsers(updated);
    toast({
      type: approve ? 'success' : 'error',
      title: approve ? 'KYC Disetujui' : 'KYC Ditolak',
      message: approve
        ? 'Penjoki kini telah terverifikasi dan dapat mengambil orderan.'
        : 'Status KYC ditolak.',
    });
  };

  // Open delete dialog
  const promptDeleteUser = (targetUser: AuthUser) => {
    setUserToDelete(targetUser);
  };

  // Confirm delete user
  const handleConfirmDelete = () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    setTimeout(() => {
      const updated = users.filter((u) => u.id !== userToDelete.id);
      saveAllUsers(updated);
      setUsers(updated);
      setIsDeleting(false);

      toast({
        type: 'success',
        title: 'Akun Berhasil Dihapus',
        message: `Akun ${userToDelete.name} (${userToDelete.email}) telah dihapus permanen dari sistem.`,
      });

      setUserToDelete(null);
    }, 400);
  };

  // Add new Penjoki directly
  const handleCreatePenjoki = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPenjokiName || !newPenjokiEmail || !newPenjokiPhone || !newPenjokiExpertise) {
      toast({
        type: 'error',
        title: 'Form Belum Lengkap',
        message: 'Mohon isi semua data penjoki yang wajib.',
      });
      return;
    }

    setIsSubmitting(true);
    let cleanPhone = newPenjokiPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone;

    const newPenjoki: AuthUser = {
      id: `seller-${Date.now()}`,
      name: newPenjokiName,
      email: newPenjokiEmail.toLowerCase().trim(),
      phone: cleanPhone,
      password: newPenjokiPassword || 'joki123456',
      role: 'seller',
      educationLevel: newPenjokiEducation,
      expertise: newPenjokiExpertise,
      kycStatus: 'VERIFIED',
      isVerified: true,
      completedTasks: 0,
      rating: 5.0,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
    };

    const updated = [newPenjoki, ...users];
    saveAllUsers(updated);
    setUsers(updated);
    setIsSubmitting(false);
    setIsAddPenjokiOpen(false);

    // Reset Form
    setNewPenjokiName('');
    setNewPenjokiEmail('');
    setNewPenjokiPhone('');
    setNewPenjokiExpertise('');
    setNewPenjokiPassword('joki123456');

    toast({
      type: 'success',
      title: 'Mitra Penjoki Ditambahkan',
      message: `Akun ${newPenjoki.name} berhasil didaftarkan dan langsung berstatus aktif.`,
    });
  };

  return (
    <div className="space-y-8 text-left pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Kelola Pengguna &amp; Mitra Penjoki
            </h1>
            <Badge variant="burgundy">Super Admin</Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Direktori data akun Mahasiswa (Klien) dan Tim Mitra Penjoki terdaftar di sistem Jokiskripsiku.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddPenjokiOpen(true)}
            className="rounded-xl shadow-xs"
          >
            <UserPlus className="h-4 w-4 mr-1.5" /> Tambah Mitra Penjoki
          </Button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Pengguna
            </span>
            <Users className="h-5 w-5 text-forest-800" />
          </div>
          <p className="mt-3 font-serif text-2xl font-bold text-gray-900">
            {users.length} Akun
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Tersimpan di basis data platform</span>
        </Card>

        <Card className="p-5 border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Mahasiswa (Klien)
            </span>
            <GraduationCap className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="mt-3 font-serif text-2xl font-bold text-emerald-900">
            {buyers.length} Mahasiswa
          </p>
          <span className="text-[11px] text-emerald-700/80 mt-1 block">Pemesan jasa tugas &amp; skripsi</span>
        </Card>

        <Card className="p-5 border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Mitra Penjoki (Pengerja)
            </span>
            <Sparkles className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-3 font-serif text-2xl font-bold text-amber-900">
            {sellers.length} Penjoki
          </p>
          <span className="text-[11px] text-amber-700/80 mt-1 block">Didaftarkan oleh Super Admin</span>
        </Card>

        <Card className="p-5 border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Penjoki Terverifikasi
            </span>
            <ShieldCheck className="h-5 w-5 text-forest-800" />
          </div>
          <p className="mt-3 font-serif text-2xl font-bold text-forest-900">
            {verifiedSellers.length} Terverifikasi
          </p>
          <span className="text-[11px] text-forest-700 mt-1 block">Lolos seleksi uji KYC</span>
        </Card>
      </div>

      {/* Main Table Card with Tabs */}
      <Card className="border-gray-200 shadow-xs bg-white rounded-2xl overflow-hidden">
        {/* Navigation Tabs & Search Toolbar */}
        <div className="border-b border-gray-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          {/* Role Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('buyer');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'buyer'
                  ? 'bg-forest-900 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Akun Mahasiswa ({buyers.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('seller');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'seller'
                  ? 'bg-forest-900 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Akun Mitra Penjoki ({sellers.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Input
              type="text"
              placeholder={
                activeTab === 'buyer'
                  ? 'Cari nama, email, kampus...'
                  : 'Cari nama, email, spesialisasi...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-white text-xs"
            />
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Tab 1: Akun Mahasiswa */}
        {activeTab === 'buyer' && (
          <div className="overflow-x-auto">
            {filteredBuyers.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <GraduationCap className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">Tidak ada akun mahasiswa yang cocok</p>
                <p className="text-xs text-gray-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-5">Mahasiswa</th>
                    <th className="py-3.5 px-5">Asal Kampus &amp; Jurusan</th>
                    <th className="py-3.5 px-5">Kontak WhatsApp</th>
                    <th className="py-3.5 px-5">Tgl Terdaftar</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBuyers.map((buyer) => (
                    <tr key={buyer.id} className="hover:bg-forest-50/20 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-900 text-white font-bold text-xs flex-shrink-0">
                            {buyer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{buyer.name}</p>
                            <p className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" /> {buyer.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <p className="font-semibold text-gray-800">
                          {buyer.university || 'Belum diisi'}
                        </p>
                        <p className="text-gray-500 text-[11px] mt-0.5">
                          {buyer.faculty ? `${buyer.faculty} • ` : ''}
                          {buyer.major || 'Umum'}
                        </p>
                      </td>

                      <td className="py-4 px-5">
                        {buyer.phone ? (
                          <a
                            href={`https://wa.me/${buyer.phone}?text=Halo%20${encodeURIComponent(buyer.name)},%20kami%20dari%20Admin%20Jokiskripsiku`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <Phone className="h-3 w-3" /> {buyer.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-gray-500">
                        {new Date(buyer.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            buyer.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          {buyer.status === 'ACTIVE' ? 'Aktif' : 'Ditangguhkan'}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(buyer)}
                          className={`h-8 px-2 text-xs ${
                            buyer.status === 'ACTIVE' ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {buyer.status === 'ACTIVE' ? 'Tangguhkan' : 'Aktifkan'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => promptDeleteUser(buyer)}
                          className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="Hapus akun"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Akun Mitra Penjoki */}
        {activeTab === 'seller' && (
          <div className="overflow-x-auto">
            {filteredSellers.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Sparkles className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">Tidak ada akun penjoki yang cocok</p>
                <p className="text-xs text-gray-400 mt-1">Klik tombol &ldquo;Tambah Mitra Penjoki&rdquo; untuk mendaftarkan akun baru.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-5">Mitra Penjoki</th>
                    <th className="py-3.5 px-5">Pendidikan &amp; Spesialisasi</th>
                    <th className="py-3.5 px-5">Status KYC</th>
                    <th className="py-3.5 px-5">Performa</th>
                    <th className="py-3.5 px-5">Kontak WhatsApp</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-800 text-white font-bold text-xs flex-shrink-0">
                            {seller.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{seller.name}</p>
                            <p className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" /> {seller.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 max-w-xs">
                        <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold text-[10px] mb-1">
                          {seller.educationLevel || 'S1 Sarjana'}
                        </span>
                        <p className="font-medium text-gray-800 text-xs line-clamp-2">
                          {seller.expertise || 'Tugas & Skripsi Umum'}
                        </p>
                      </td>

                      <td className="py-4 px-5">
                        {seller.kycStatus === 'VERIFIED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified
                          </span>
                        ) : seller.kycStatus === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                            <XCircle className="h-3 w-3 text-red-600" /> Ditolak
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            ⏳ Menunggu KYC
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <p className="font-bold text-gray-900">⭐ {seller.rating || 5.0} / 5.0</p>
                        <p className="text-gray-500 text-[11px] mt-0.5">
                          {seller.completedTasks || 0} Tugas Selesai
                        </p>
                      </td>

                      <td className="py-4 px-5">
                        {seller.phone ? (
                          <a
                            href={`https://wa.me/${seller.phone}?text=Halo%20${encodeURIComponent(seller.name)},%20kami%20dari%20Admin%20Jokiskripsiku`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <Phone className="h-3 w-3" /> {seller.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            seller.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          {seller.status === 'ACTIVE' ? 'Aktif' : 'Ditangguhkan'}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right space-x-1 whitespace-nowrap">
                        {seller.kycStatus === 'PENDING' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleVerifyKyc(seller.id, true)}
                            className="text-xs py-1 h-8"
                          >
                            Approve KYC
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(seller)}
                          className={`h-8 px-2 text-xs ${
                            seller.status === 'ACTIVE' ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {seller.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => promptDeleteUser(seller)}
                          className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="Hapus akun penjoki"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>

      {/* Confirmation Dialog: Hapus Akun */}
      <Dialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Hapus Akun Pengguna"
        description="Konfirmasi penghapusan akun dari sistem Jokiskripsiku."
      >
        <div className="space-y-4 pt-2 text-left text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-red-950">Tindakan ini permanen!</p>
              <p className="text-red-800 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <strong>{userToDelete?.name}</strong> ({userToDelete?.email})? Seluruh riwayat akun ini akan dibersihkan agar basis data tidak menumpuk.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUserToDelete(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
            >
              Hapus Permanen
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Modal Dialog: Tambah Mitra Penjoki Baru */}
      <Dialog
        isOpen={isAddPenjokiOpen}
        onClose={() => setIsAddPenjokiOpen(false)}
        title="Daftarkan Mitra Penjoki Baru"
        description="Tambahkan akun pengerja terverifikasi yang telah lulus seleksi tim inti Jokiskripsiku."
      >
        <form onSubmit={handleCreatePenjoki} className="space-y-4 pt-2 text-left">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Nama Lengkap &amp; Gelar <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Rian Pratama, S.Si., M.Sc."
              value={newPenjokiName}
              onChange={(e) => setNewPenjokiName(e.target.value)}
              required
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="penjoki@jokiskripsi.com"
                value={newPenjokiEmail}
                onChange={(e) => setNewPenjokiEmail(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder="08123456789"
                value={newPenjokiPhone}
                onChange={(e) => setNewPenjokiPhone(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Jenjang Pendidikan Terakhir <span className="text-red-500">*</span>
            </label>
            <select
              value={newPenjokiEducation}
              onChange={(e) => setNewPenjokiEducation(e.target.value)}
              className="w-full h-10 rounded-xl border border-gray-200 px-3 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-forest-800"
            >
              <option value="S1 Sarjana">S1 Sarjana</option>
              <option value="S2 Magister / Master">S2 Magister / Master</option>
              <option value="S3 Doktor">S3 Doktor</option>
              <option value="D4 Sarjana Terapan">D4 Sarjana Terapan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Bidang Spesialisasi Penulisan <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Skripsi IT, Analisis Kualitatif/Kuantitatif, Hukum, Makalah Manajemen"
              value={newPenjokiExpertise}
              onChange={(e) => setNewPenjokiExpertise(e.target.value)}
              required
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Kata Sandi Awal Akun <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPenjokiPassword ? 'text' : 'password'}
                value={newPenjokiPassword}
                onChange={(e) => setNewPenjokiPassword(e.target.value)}
                required
                className="h-10 text-xs rounded-xl pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPenjokiPassword(!showPenjokiPassword)}
                className="text-gray-400 hover:text-gray-600 absolute right-3 top-2.5 p-0.5 rounded transition-colors"
                aria-label={showPenjokiPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPenjokiPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Kata sandi ini dapat diubah sendiri oleh penjoki setelah berhasil masuk ke akunnya.
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddPenjokiOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Simpan &amp; Verifikasi Akun
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
