import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Warga } from '../types';
import { 
  Plus, 
  Search, 
  UserPlus, 
  MapPin, 
  Phone, 
  Calendar, 
  Trash2, 
  Edit3, 
  Download, 
  UserCheck, 
  X, 
  Eye, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import SavingsCard from '../components/SavingsCard';

export default function WargaList() {
  const { state, addWarga, editWarga, deleteWarga } = useApp();
  const { warga, transaksi } = state;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Aktif' | 'Nonaktif'>('All');

  // Form modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form variables
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [noHp, setNoHp] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  // Active items for edit/detail
  const [activeWarga, setActiveWarga] = useState<Warga | null>(null);

  const resetForm = () => {
    setNik('');
    setNama('');
    setAlamat('');
    setNoHp('');
    setStatus('Aktif');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik.trim() || !nama.trim() || !alamat.trim() || !noHp.trim()) {
      alert('Mohon lengkapi semua baris.');
      return;
    }
    // NIK validation (16 digits in Indonesia)
    if (nik.trim().length < 10) {
      alert('NIK tidak valid! Harap masukkan NIK resmi.');
      return;
    }
    // Check duplication
    if (warga.some((w) => w.id === nik.trim())) {
      alert('Warga dengan NIK ini sudah terdaftar!');
      return;
    }

    await addWarga({
      id: nik.trim(),
      nama: nama.trim(),
      alamat: alamat.trim(),
      no_hp: noHp.trim(),
      status
    });

    setShowAddModal(false);
    resetForm();
  };

  const handleEditOpen = (w: Warga) => {
    setActiveWarga(w);
    setNik(w.id);
    setNama(w.nama);
    setAlamat(w.alamat);
    setNoHp(w.no_hp);
    setStatus(w.status);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWarga) return;
    if (!nama.trim() || !alamat.trim() || !noHp.trim()) {
      alert('Mohon lengkapi seluruh isian.');
      return;
    }

    await editWarga({
      id: activeWarga.id,
      nama: nama.trim(),
      alamat: alamat.trim(),
      no_hp: noHp.trim(),
      status,
      created_at: activeWarga.created_at
    });

    setShowEditModal(false);
    setActiveWarga(null);
    resetForm();
  };

  const handleDeleteWarga = async (id: string, name: string) => {
    const doubleCheck = window.confirm(`Apakah Anda yakin ingin menghapus warga "${name}"? Akun log masuk mereka juga akan dicabut.`);
    if (doubleCheck) {
      await deleteWarga(id);
    }
  };

  // CSV Export functions
  const handleExportCSV = () => {
    const csvHeaders = 'NIK,Nama,Alamat,No HP,Status,Tanggal Terdaftar\n';
    const csvRows = warga.map((w) => {
      // Escape commas
      const nameEscaped = `"${w.nama.replace(/"/g, '""')}"`;
      const addrEscaped = `"${w.alamat.replace(/"/g, '""')}"`;
      return `${w.id},${nameEscaped},${addrEscaped},${w.no_hp},${w.status},${w.created_at.slice(0, 10)}`;
    }).join('\n');

    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Daftar_Warga_RT_03_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter residents
  const filteredWarga = warga.filter((w) => {
    const matchSearch = 
      w.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.id.includes(searchQuery) ||
      w.alamat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.no_hp.includes(searchQuery);

    const matchStatus = 
      statusFilter === 'All' || 
      w.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header operations bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Kependudukan Warga RT 03</h2>
          <p className="text-xs text-slate-400 mt-0.5">Total Warga Terdata: {warga.length} Kepala (Aktif: {warga.filter(w => w.status==='Aktif').length})</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-100 ring-1 ring-slate-200 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/10 hover:shadow-emerald-700/20 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> Daftar Warga Baru
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition duration-200"
            placeholder="Cari warga NIK, Nama, Alamat, atau No HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter status tab */}
        <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
              statusFilter === 'All' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter('Aktif')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
              statusFilter === 'Aktif' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setStatusFilter('Nonaktif')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
              statusFilter === 'Nonaktif' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Nonaktif
          </button>
        </div>
      </div>

      {/* LIST OR CARDS DISPLAY */}
      <div className="bg-white rounded-3xl border border-slate-250/60 shadow-xs overflow-hidden">
        {filteredWarga.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-10 w-10 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Tidak ada data warga ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest font-semibold border-b">
                  <th className="py-3 px-5">Info Warga / NIK</th>
                  <th className="py-3 px-5">Alamat KTP</th>
                  <th className="py-3 px-5">Nomor Telepon</th>
                  <th className="py-3 px-5">Keanggotaan</th>
                  <th className="py-3 px-5">Terdaftar</th>
                  <th className="py-3 px-5 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredWarga.map((w) => {
                  
                  // Calculate savings balance specifically to display right on list
                  const pTrxs = transaksi.filter((t) => t.warga_id === w.id);
                  const deposits = pTrxs.filter(t => t.tipe === 'Setoran').reduce((sum, item) => sum + item.jumlah, 0);
                  const withdraws = pTrxs.filter(t => t.tipe === 'Penarikan').reduce((sum, item) => sum + item.jumlah, 0);
                  const currentBalance = deposits - withdraws;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/40 transition">
                      
                      {/* Family/Name with NIK */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center font-bold tracking-tight shrink-0">
                            {w.nama.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-900">{w.nama}</p>
                            <span className="text-[10px] font-mono tracking-wider text-slate-400 mt-0.5 block">{w.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-4 px-5 text-slate-500 max-w-[200px] truncate">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          {w.alamat}
                        </span>
                      </td>

                      {/* Phone No */}
                      <td className="py-4 px-5 text-slate-600 font-mono">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                          {w.no_hp}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1">
                          {w.status === 'Aktif' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 uppercase tracking-widest w-max leading-none">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" /> Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 uppercase tracking-widest w-max leading-none">
                              <AlertCircle className="h-3 w-3 text-slate-400 shrink-0" /> Nonaktif
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-emerald-600 font-mono">
                            Rp {currentBalance.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </td>

                      {/* Created date */}
                      <td className="py-4 px-5 text-slate-400 font-mono text-[10px]">
                        {w.created_at.slice(0, 10)}
                      </td>

                      {/* Detail operations buttons */}
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => { setActiveWarga(w); setShowDetailModal(true); }}
                            className="p-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg text-[10.5px] font-bold cursor-pointer transition flex items-center gap-1"
                            title="Lihat Tabungan Digital"
                          >
                            <Eye className="h-3 w-3" /> Info Card
                          </button>
                          <button
                            onClick={() => handleEditOpen(w)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg cursor-pointer transition"
                            title="Edit Data Warga"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWarga(w.id, w.nama)}
                            className="p-1.5 bg-red-50 hover:bg-red-100/70 text-red-600 border border-red-100 rounded-lg cursor-pointer transition"
                            title="Hapus Warga"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD CITIZEN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900">Registrasi Warga RT Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-200 rounded-xl transition cursor-pointer">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">NIK KTP (16 Digit)</label>
                <input
                  type="text"
                  maxLength={16}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition"
                  placeholder="Contoh: 3374110502..."
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Nama Lengkap Warga</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition"
                  placeholder="Nama sesuai KTP"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Alamat Domisili RT</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition"
                  placeholder="Contoh: Jl. Anggrek No. 12"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Nomor WA / Handphone</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition"
                  placeholder="Contoh: 081234567890"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Status Keanggotaan</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif (Pindah/Meninggal)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-xs font-semibold bg-slate-100 hover:bg-slate-250 rounded-xl text-slate-600 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white shadow-md transition cursor-pointer"
                >
                  Submit Registrasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CITIZEN */}
      {showEditModal && activeWarga && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900">Perbarui Profil Warga</h3>
              <button onClick={() => { setShowEditModal(false); setActiveWarga(null); }} className="p-1 hover:bg-slate-200 rounded-xl transition cursor-pointer">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">NIK KTP (Permanen)</label>
                <input
                  type="text"
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-500"
                  value={nik}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Nama Lengkap</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Alamat Domisili</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Nomor Handphone</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Status Keanggotaan</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3.5">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setActiveWarga(null); }}
                  className="flex-1 py-3 text-xs font-semibold bg-slate-100 rounded-xl text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-semibold bg-emerald-600 rounded-xl text-white shadow-md cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CITIZEN SAVINGS STATIONS STATEMENT DETAIL */}
      {showDetailModal && activeWarga && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900">Kartu Tabungan & Riwayat Individu</h3>
              <button onClick={() => { setShowDetailModal(false); setActiveWarga(null); }} className="p-1 hover:bg-slate-200 rounded-xl transition cursor-pointer">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
              {/* Savings Card widget embedded! Live printing available inside. */}
              <SavingsCard warga={activeWarga} transaksi={transaksi} />

              <div className="border-t pt-4">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest font-mono mb-3">5 Transaksi Terakhir</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {transaksi.filter(t => t.warga_id === activeWarga.id).length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">Belum ada riwayat transaksi</p>
                  ) : (
                    transaksi
                      .filter(t => t.warga_id === activeWarga.id)
                      .slice(0, 5)
                      .map(t => (
                        <div key={t.id} className="flex justify-between items-start text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100 font-mono">
                          <div>
                            <span className="font-bold text-slate-700 block">{t.id}</span>
                            <span className="text-[10px] text-slate-400">{t.tanggal} • {t.tipe}</span>
                          </div>
                          <span className={`font-bold ${t.tipe === 'Penarikan' ? 'text-red-650' : 'text-emerald-650'}`}>
                            {t.tipe === 'Penarikan' ? '-' : '+'}Rp {t.jumlah.toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
