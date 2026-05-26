import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KategoriTransaksi } from '../types';
import { 
  Tags, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  Info,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  Heart,
  Activity
} from 'lucide-react';

export default function KategoriTransactionsPage() {
  const { state, addKategori, editKategori, deleteKategori, user } = useApp();
  const kategoriList = state.kategori || [];

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [nama, setNama] = useState('');
  const [tipe, setTipe] = useState<'Setoran' | 'Penarikan' | 'Iuran' | 'Donasi' | 'Kas Sosial'>('Iuran');
  const [deskripsi, setDeskripsi] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<KategoriTransaksi | null>(null);

  const resetForm = () => {
    setNama('');
    setTipe('Iuran');
    setDeskripsi('');
    setSelectedKategori(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;
    await addKategori({
      nama: nama.trim(),
      tipe,
      deskripsi: deskripsi.trim() || undefined
    });
    resetForm();
    setShowAddModal(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKategori || !nama.trim()) return;
    await editKategori({
      ...selectedKategori,
      nama: nama.trim(),
      tipe,
      deskripsi: deskripsi.trim() || undefined
    });
    resetForm();
    setShowEditModal(false);
  };

  const openEditModal = (k: KategoriTransaksi) => {
    setSelectedKategori(k);
    setNama(k.nama);
    setTipe(k.tipe);
    setDeskripsi(k.deskripsi || '');
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
      await deleteKategori(id);
    }
  };

  // Helper type counters
  const categoriesByType = kategoriList.reduce((acc, curr) => {
    acc[curr.tipe] = (acc[curr.tipe] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getTipeBadgeClass = (t: string) => {
    switch (t) {
      case 'Setoran':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Penarikan':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Iuran':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Donasi':
        return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'Kas Sosial':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-slate-50 text-slate-755 border-slate-100';
    }
  };

  const getTipeIcon = (t: string) => {
    switch (t) {
      case 'Setoran':
        return <ArrowDownLeft className="h-4 w-4 text-emerald-500" />;
      case 'Penarikan':
        return <ArrowUpRight className="h-4 w-4 text-amber-500" />;
      case 'Iuran':
        return <Coins className="h-4 w-4 text-blue-500" />;
      case 'Donasi':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'Kas Sosial':
        return <Activity className="h-4 w-4 text-purple-500" />;
      default:
        return <Layers className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Tags className="h-6 w-6 text-emerald-600" />
            Kategori Transaksi Kas RT
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi tipe pembiayaan dan tabungan RT secara dinamis untuk pencatatan kas lebih rapi.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/10 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tambah Kategori
          </button>
        )}
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Setoran (Tabungan)', value: categoriesByType['Setoran'] || 0, color: 'emerald', icon: <ArrowDownLeft /> },
          { label: 'Penarikan (Tabungan)', value: categoriesByType['Penarikan'] || 0, color: 'amber', icon: <ArrowUpRight /> },
          { label: 'Iuran Bulanan', value: categoriesByType['Iuran'] || 0, color: 'blue', icon: <Coins /> },
          { label: 'Donasi Sukarela', value: categoriesByType['Donasi'] || 0, color: 'pink', icon: <Heart /> },
          { label: 'Kas Sosial (Duka)', value: categoriesByType['Kas Sosial'] || 0, color: 'purple', icon: <Activity /> },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center space-x-3">
            <div className={`p-2 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
              {React.cloneElement(stat.icon, { className: `h-4 w-4 text-${stat.color}-500` })}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                {stat.label.split(' ')[0]}
              </p>
              <h4 className="text-lg font-black text-slate-900 mt-1 tracking-tight">
                {stat.value} <span className="text-[10px] font-medium text-slate-400">item</span>
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Table & Empty State */}
      <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest font-mono">
            Daftar Kategori Terdaftar ({kategoriList.length})
          </h3>
          <span className="text-[10.5px] bg-emerald-50 text-emerald-700 py-1 px-2.5 rounded-lg font-bold font-mono">
            RT 03 / RW 04
          </span>
        </div>

        {kategoriList.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto">
            <div className="p-4 bg-slate-50 w-fit rounded-full mx-auto mb-4">
              <Layers className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-xs font-bold text-slate-700">Belum Ada Kategori Transaksi</p>
            <p className="text-[11px] text-slate-450 mt-1">
              Hubungi Pengurus RT untuk menginisiasi kategori transaksi dinamis pada aplikasi.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest font-mono border-b">
                  <th className="py-3 px-6">ID Kategori</th>
                  <th className="py-3 px-6">Nama Kategori</th>
                  <th className="py-3 px-6">Tipe Induk</th>
                  <th className="py-3 px-6">Deskripsi Keterangan</th>
                  {isAdmin && <th className="py-3 px-6 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y text-xs text-slate-700">
                {kategoriList.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/65 transition group">
                    <td className="py-3.5 px-6 font-mono font-bold text-[10.5px] text-slate-400">
                      {k.id}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {k.nama}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 border rounded-lg text-[10.5px] font-bold ${getTipeBadgeClass(k.tipe)}`}>
                        {getTipeIcon(k.tipe)}
                        {k.tipe}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 max-w-xs truncate">
                      {k.deskripsi || <span className="text-slate-300 font-mono italic">Tidak ada deskripsi</span>}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex gap-1.5 opacity-90 group-hover:opacity-100 transition">
                          <button
                            onClick={() => openEditModal(k)}
                            className="p-1 px-2 hover:bg-slate-100 border border-slate-150 rounded-lg text-slate-600 hover:text-indigo-600 transition duration-150 cursor-pointer"
                            title="Edit Kategori"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(k.id, k.nama)}
                            className="p-1 px-2 hover:bg-red-50 border border-red-100 hover:border-red-200 rounded-lg text-red-500 hover:text-red-700 transition duration-150 cursor-pointer"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div className="px-6 py-4.5 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Tambah Kategori Transaksi Baru
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-200 rounded-xl transition cursor-pointer text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Arisan PKK Bulanan, Iuran Keamanan RT"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition font-medium"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                  Tipe Induk (Kelompok Transaksi)
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition"
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value as any)}
                >
                  <option value="Setoran">Setoran (Tabungan)</option>
                  <option value="Penarikan">Penarikan (Tabungan)</option>
                  <option value="Iuran">Iuran Bulanan</option>
                  <option value="Donasi">Donasi Sukarela</option>
                  <option value="Kas Sosial">Kas Sosial (Musibah / Duka)</option>
                </select>
                <div className="mt-1.5 p-2 bg-slate-50 border rounded-lg text-[10px] text-slate-500 flex items-start gap-1.5 leading-relaxed">
                  <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Pastikan tipe yang dipilih sesuai dengan kategori. Setoran/Penarikan memotong saldo tabungan individu warga, sedangkan Iuran/Donasi memotong/menyumbang kas bersama warga.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                  Deskripsi Keterangan
                </label>
                <textarea
                  placeholder="Opsional: masukkan keterangan lingkup penggunaan iuran/transaksi ini..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition min-h-[75px]"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                />
              </div>

              <div className="pt-3.5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white shadow-md shadow-emerald-600/10 transition cursor-pointer"
                >
                  Inisiasi Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedKategori && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div className="px-6 py-4.5 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Edit Kategori Transaksi
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-slate-200 rounded-xl transition cursor-pointer text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                  ID Kategori
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 text-slate-400 font-mono text-xs rounded-xl py-2 px-3 focus:outline-none"
                  value={selectedKategori.id}
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Arisan PKK Bulanan, Iuran Keamanan RT"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition font-medium"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                  Tipe Induk (Kelompok Transaksi)
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition"
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value as any)}
                >
                  <option value="Setoran">Setoran (Tabungan)</option>
                  <option value="Penarikan">Penarikan (Tabungan)</option>
                  <option value="Iuran">Iuran Bulanan</option>
                  <option value="Donasi">Donasi Sukarela</option>
                  <option value="Kas Sosial">Kas Sosial (Musibah / Duka)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                  Deskripsi Keterangan
                </label>
                <textarea
                  placeholder="Masukkan keterangan lingkup penggunaan iuran/transaksi ini..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition min-h-[75px]"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                />
              </div>

              <div className="pt-3.5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white shadow-md shadow-emerald-600/10 transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
