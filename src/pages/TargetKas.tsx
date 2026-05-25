import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TargetKas } from '../types';
import { 
  Building, 
  TrendingUp, 
  Plus, 
  X, 
  Filter, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Edit2,
  Trash
} from 'lucide-react';

export default function TargetKasPage() {
  const { state, addTargetKas, editTargetKas, deleteTargetKas, user } = useApp();
  const { target_kas } = state;

  const isWarga = user?.role === 'WARGA';

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Create / Edit State structures
  const [namaProgram, setNamaProgram] = useState('');
  const [kategori, setKategori] = useState<'pembangunan' | 'sosial' | 'kegiatan' | 'darurat'>('pembangunan');
  const [target, setTarget] = useState<number>(0);
  const [terkumpul, setTerkumpul] = useState<number>(0);
  const [status, setStatus] = useState<'aktif' | 'tercapai' | 'batal'>('aktif');
  const [deadline, setDeadline] = useState('');

  const [activeTarget, setActiveTarget] = useState<TargetKas | null>(null);

  const resetForm = () => {
    setNamaProgram('');
    setKategori('pembangunan');
    setTarget(0);
    setTerkumpul(0);
    setStatus('aktif');
    setDeadline('');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaProgram.trim() || target <= 0 || !deadline) {
      alert('Mohon isi nama program, target dana, dan tenggat waktu.');
      return;
    }

    await addTargetKas({
      nama_program: namaProgram.trim(),
      kategori,
      target,
      status,
      deadline
    });

    setShowAddModal(false);
    resetForm();
  };

  const handleEditOpen = (tg: TargetKas) => {
    setActiveTarget(tg);
    setNamaProgram(tg.nama_program);
    setKategori(tg.kategori);
    setTarget(tg.target);
    setTerkumpul(tg.terkumpul);
    setStatus(tg.status);
    setDeadline(tg.deadline);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTarget) return;
    if (!namaProgram.trim() || target <= 0 || !deadline) {
      alert('Mohon isi nama program, target anggaran, dan tenggat waktu.');
      return;
    }

    await editTargetKas({
      id: activeTarget.id,
      nama_program: namaProgram.trim(),
      kategori,
      target,
      terkumpul,
      status,
      deadline
    });

    setShowEditModal(false);
    setActiveTarget(null);
    resetForm();
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmVal = window.confirm(`Apakah Anda yakin ingin menghapus program "${name}"?`);
    if (confirmVal) {
      await deleteTargetKas(id);
    }
  };

  const getKategoriColor = (kat: string) => {
    switch (kat) {
      case 'pembangunan': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'sosial': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'kegiatan': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-purple-50 text-purple-700 border-purple-100';
    }
  };

  const getStatusBadge = (stat: string) => {
    switch (stat) {
      case 'aktif': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'tercapai': return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & quick entry section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Rencana Anggaran & Program RT</h2>
          <p className="text-xs text-slate-400 mt-0.5">Pantau target program pembangunan fisik, dana sosial, iuran kegiatan warga RT 03/RW 04</p>
        </div>

        {!isWarga && (
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-emerald-600/10 cursor-pointer animate-pulse"
          >
            <Plus className="h-4 w-4" /> Daftarkan Program Baru
          </button>
        )}
      </div>

      {/* Target Progress Card Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {target_kas.map((tg) => {
          const percent = Math.min(100, Math.round((tg.terkumpul / tg.target) * 100));
          return (
            <div key={tg.id} className="bg-white rounded-3xl border border-slate-200/85 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition duration-200 relative overflow-hidden">
              <div className="space-y-4">
                
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className={`px-2.5 py-0.5 border text-[9px] font-bold uppercase rounded-md tracking-widest ${getKategoriColor(tg.kategori)}`}>
                      {tg.kategori}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight pt-1">{tg.nama_program}</h3>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(tg.status)}`}>
                    {tg.status}
                  </span>
                </div>

                {/* Progress Visual representation */}
                <div className="space-y-1.5 pt-2">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${percent >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-emerald-600'}`} 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Pencapaian:</span>
                    <span className="text-emerald-700 font-extrabold">{percent}% Terkumpul</span>
                  </div>
                </div>

                {/* Values table */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 uppercase tracking-tight text-[9px] block">TERKUMPUL</span>
                    <span className="font-extrabold text-slate-900 block mt-0.5 text-xs">
                      Rp {tg.terkumpul.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase tracking-tight text-[9px] block">TARGET ANGGARAN</span>
                    <span className="font-extrabold text-slate-900 block mt-0.5 text-xs">
                      Rp {tg.target.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                  <Calendar className="h-4 w-4" />
                  <span>Tenggat: <strong className="text-slate-600">{tg.deadline}</strong></span>
                </div>
              </div>

              {/* Action buttons (Only for admin) */}
              {!isWarga && (
                <div className="mt-6 pt-4 border-t flex justify-end gap-2.5">
                  <button
                    onClick={() => handleEditOpen(tg)}
                    className="py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" /> Perbarui Dana / Status
                  </button>
                  <button
                    onClick={() => handleDelete(tg.id, tg.nama_program)}
                    className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-650 border border-red-100 rounded-xl transition text-center flex items-center justify-center cursor-pointer"
                    title="Hapus"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {target_kas.length === 0 && (
          <div className="col-span-3 text-center py-20 bg-white rounded-3xl border">
            <TrendingUp className="h-10 w-10 text-slate-100 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Tidak ada program terdaftar.</p>
          </div>
        )}
      </div>

      {/* MODAL: ADD TargetKas */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900">Daftarkan Program Target RT Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-200 rounded-xl transition cursor-pointer">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Nama Program Pembangunan</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  placeholder="Contoh: Pembelian CCTV Gang Barat"
                  value={namaProgram}
                  onChange={(e) => setNamaProgram(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Kategori Lingkup</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-800"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as any)}
                >
                  <option value="pembangunan">Pembangunan Fisik</option>
                  <option value="sosial">Sosial / Santunan</option>
                  <option value="kegiatan">Kegiatan Warga (17an, dll)</option>
                  <option value="darurat">Keadaan Darurat / Bencana</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Target Anggaran (Rp)</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-extrabold text-slate-900"
                  placeholder="Masukkan target dana, contoh: 5000000"
                  value={target || ''}
                  onChange={(e) => setTarget(Number(e.target.value.replace(/\D/g, '')) || 0)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Tenggat Waktu Deadline</label>
                <input
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-mono text-slate-900"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-xs font-semibold bg-slate-100 rounded-xl text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-semibold bg-emerald-600 rounded-xl text-white shadow-md cursor-pointer"
                >
                  Simpan Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TargetKas */}
      {showEditModal && activeTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900">Perbarui Program: {activeTarget.nama_program}</h3>
              <button onClick={() => { setShowEditModal(false); setActiveTarget(null); }} className="p-1 hover:bg-slate-200 rounded-xl transition cursor-pointer">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Nama Program</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900"
                  value={namaProgram}
                  onChange={(e) => setNamaProgram(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Target Anggaran (Rp)</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-extrabold text-slate-900"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value.replace(/\D/g, '')) || 0)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Dana Terkumpul Saat Ini (Rp)</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-extrabold text-emerald-800 focus:outline-none"
                  value={terkumpul}
                  onChange={(e) => setTerkumpul(Number(e.target.value.replace(/\D/g, '')) || 0)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Status Program</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="tercapai">Selesai/Tercapai</option>
                    <option value="batal">Batal / Ditunda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Kategori</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as any)}
                  >
                    <option value="pembangunan">Pembangunan</option>
                    <option value="sosial">Sosial</option>
                    <option value="kegiatan">Kegiatan</option>
                    <option value="darurat">Darurat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Tenggat Tanggal</label>
                <input
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-mono"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3.5 font-semibold">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setActiveTarget(null); }}
                  className="flex-1 py-3 text-xs bg-slate-100 rounded-xl text-slate-600 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white shadow-md transition cursor-pointer"
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
