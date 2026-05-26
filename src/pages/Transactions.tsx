import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Transaksi } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  Printer, 
  PlusCircle, 
  Filter, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import InvoicePrint from '../components/InvoicePrint';

export default function Transactions() {
  const { state, addTransaction, deleteTransaction, user } = useApp();
  const { transaksi, warga } = state;

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Transaksi | null>(null);

  // Filters State
  const [wargaIdFilter, setWargaIdFilter] = useState('All');
  const [tipeFilter, setTipeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');

  // New Transaction Form state
  const [wargaId, setWargaId] = useState('');
  const [tipe, setTipe] = useState<'Setoran' | 'Penarikan' | 'Iuran' | 'Donasi' | 'Kas Sosial'>('Setoran');
  const [kategoriId, setKategoriId] = useState('');
  const [jumlah, setJumlah] = useState<number>(0);
  const [keterangan, setKeterangan] = useState('');

  const resetForm = () => {
    setWargaId('');
    setTipe('Setoran');
    setKategoriId(state.kategori?.[0]?.id || '');
    setJumlah(0);
    setKeterangan('');
  };

  // Autocomplete auto suggestion generated code helper
  const getSimulatedTrxId = () => {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const todaysCount = transaksi.filter((t) => t.id.startsWith(`TRX-${todayStr}`)).length;
    return `TRX-${todayStr}-${String(todaysCount + 1).padStart(3, '0')}`;
  };

  // Get active citizen's outstanding savings balance to make sure Penarikan is allowed
  const getCitizenBalance = (cId: string) => {
    const pTrxs = transaksi.filter((t) => t.warga_id === cId);
    const deposits = pTrxs.filter(t => t.tipe === 'Setoran').reduce((sum, item) => sum + item.jumlah, 0);
    const withdraws = pTrxs.filter(t => t.tipe === 'Penarikan').reduce((sum, item) => sum + item.jumlah, 0);
    return deposits - withdraws;
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wargaId || jumlah <= 0) {
      alert('Mohon pilih warga dan masukkan nominal jumlah yang valid.');
      return;
    }

    // Checking if Penarikan is within allowed limits!
    if (tipe === 'Penarikan') {
      const currentBalance = getCitizenBalance(wargaId);
      if (jumlah > currentBalance) {
        alert(`Penarikan gagal! Saldo tabungan warga saat ini hanya Rp ${currentBalance.toLocaleString('id-ID')}.`);
        return;
      }
    }

    await addTransaction({
      warga_id: wargaId,
      tipe,
      kategori_id: kategoriId || undefined,
      jumlah,
      keterangan: keterangan.trim()
    });

    setShowAddForm(false);
    resetForm();
  };

  const handleDeleteTrx = async (id: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus catatan transaksi ${id}? Saldo kas RT dan tabungan warga terkait akan disesuaikan.`);
    if (confirmDelete) {
      await deleteTransaction(id);
    }
  };

  // Filters application
  const filteredTrxs = transaksi.filter((t) => {
    const matchesWarga = wargaIdFilter === 'All' || t.warga_id === wargaIdFilter;
    const matchesTipe = tipeFilter === 'All' || t.tipe === tipeFilter;
    
    // search text on descriptions, code, or citizen names
    const citizen = warga.find((w) => w.id === t.warga_id);
    const citizenName = citizen ? citizen.nama : 'Umum';
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      citizenName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStartDate = !startDateStr || t.tanggal >= startDateStr;
    const matchesEndDate = !endDateStr || t.tanggal <= endDateStr;

    return matchesWarga && matchesTipe && matchesSearch && matchesStartDate && matchesEndDate;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Quick additions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Perbendaharaan & Kas Transaksi</h2>
          <p className="text-xs text-slate-400 mt-0.5">Catat setoran tabungan, penarikan kas mandiri, iuran wajib bulanan, dan donasi warga</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            if (state.kategori && state.kategori.length > 0) {
              setKategoriId(state.kategori[0].id);
              setTipe(state.kategori[0].tipe);
            }
            setShowAddForm(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-emerald-600/10 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" /> Catat Transaksi Baru
        </button>
      </div>

      {/* FILTERS PANEL */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
          <Filter className="h-3.5 w-3.5" /> Filter Transaksi
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Text search */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-xs font-medium text-slate-900 focus:outline-none"
              placeholder="Cari TRX / nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Citizen Selector filter */}
          <div>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800"
              value={wargaIdFilter}
              onChange={(e) => setWargaIdFilter(e.target.value)}
            >
              <option value="All">Semua Warga</option>
              {warga.map((w) => (
                <option key={w.id} value={w.id}>{w.nama}</option>
              ))}
            </select>
          </div>

          {/* Type Filter selector */}
          <div>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800"
              value={tipeFilter}
              onChange={(e) => setTipeFilter(e.target.value)}
            >
              <option value="All">Semua Jenis Aliran</option>
              <option value="Setoran">Setoran (Tabungan)</option>
              <option value="Penarikan">Penarikan (Tabungan)</option>
              <option value="Iuran">Iuran (Wajib)</option>
              <option value="Donasi">Donasi (Sukarela)</option>
              <option value="Kas Sosial">Kas Sosial (Santunan)</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2">
            <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0 mr-1.5" />
            <input
              type="date"
              className="w-full bg-transparent border-0 text-xs py-2 font-mono"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2">
            <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0 mr-1.5" />
            <input
              type="date"
              className="w-full bg-transparent border-0 text-xs py-2 font-mono"
              value={endDateStr}
              onChange={(e) => setEndDateStr(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TRANSACTIONS TABLE LIST */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTrxs.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-10 w-10 text-slate-100 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Tidak ada data transaksi cocok dengan penyaringan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest font-semibold border-b">
                  <th className="py-3 px-5">Kode Transaksi</th>
                  <th className="py-3 px-5">Tanggal</th>
                  <th className="py-3 px-5">Nama Warga</th>
                  <th className="py-3 px-5">Jenis Aliran</th>
                  <th className="py-3 px-5">Keterangan</th>
                  <th className="py-3 px-5">Jumlah Nominal</th>
                  <th className="py-3 px-5">Operator Staff</th>
                  <th className="py-3 px-5 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredTrxs.map((t) => {
                  const citizen = warga.find((w) => w.id === t.warga_id);
                  const isExpense = t.tipe === 'Penarikan';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/40 transition">
                      
                      {/* Code TRX */}
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-700">{t.id}</td>

                      {/* Date */}
                      <td className="py-3.5 px-5 text-slate-400 font-mono">{t.tanggal}</td>

                      {/* Citizen Name */}
                      <td className="py-3.5 px-5 font-extrabold text-slate-900">
                        {citizen ? citizen.nama : 'Umum (Bukan Warga)'}
                      </td>

                      {/* Tipe Flow */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-widest leading-none ${
                            isExpense 
                              ? 'bg-red-50 text-red-650 border-red-200' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                          }`}>
                            {isExpense ? <ArrowDownRight className="h-3 w-3 text-red-500" /> : <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
                            {t.tipe}
                          </span>
                          {t.kategori_id && (
                            <div className="text-[10px] text-slate-500 font-semibold truncate max-w-[150px]">
                              🏷️ {state.kategori?.find(k => k.id === t.kategori_id)?.nama || 'Kategori Terhapus'}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Keterangan */}
                      <td className="py-3.5 px-5 text-slate-500 max-w-[150px] truncate">{t.keterangan || '-'}</td>

                      {/* Jumlah */}
                      <td className="py-3.5 px-5 font-mono font-extrabold text-slate-950">
                        <span className={isExpense ? 'text-red-650' : 'text-emerald-700'}>
                          {isExpense ? '-' : '+'}Rp {t.jumlah.toLocaleString('id-ID')}
                        </span>
                      </td>

                      {/* Operator Logged In User */}
                      <td className="py-3.5 px-5 text-slate-400 font-mono">@{t.admin_input}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedInvoice(t)}
                            className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250/60 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            title="Cetak Bukti Transaksi"
                          >
                            <Printer className="h-3.5 w-3.5" /> Kwitansi
                          </button>
                          <button
                            onClick={() => handleDeleteTrx(t.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg cursor-pointer transition text-center"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="h-3.5 w-3.5 flex items-center" />
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

      {/* TRANSAC_FORM DIALOG / DRAWER */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-slate-900">Input Transaksi Kas RT</h3>
                <p className="text-[10px] text-slate-400 font-mono">Simulasi Kode: {getSimulatedTrxId()}</p>
              </div>
              <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-slate-200 rounded-xl transition cursor-pointer">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
              {/* Citizens Selector */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">Warga Penyetor / Penarik</label>
                  {wargaId && (
                    <span className="text-[10.5px] font-semibold text-emerald-600 font-mono">
                      Saldo aktif: Rp {getCitizenBalance(wargaId).toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition"
                  value={wargaId}
                  onChange={(e) => setWargaId(e.target.value)}
                >
                  <option value="">-- Pilih Warga RT Binaan --</option>
                  {warga.filter(w=>w.status==='Aktif').map((w) => (
                    <option key={w.id} value={w.id}>{w.nama} (NIK: {w.id})</option>
                  ))}
                </select>
              </div>

              {/* Pilihan Kategori Transaksi Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Pilihan Kategori Transaksi</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition"
                  value={kategoriId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setKategoriId(selectedId);
                    const kat = state.kategori?.find(k => k.id === selectedId);
                    if (kat) {
                      setTipe(kat.tipe);
                    }
                  }}
                >
                  <option value="">-- Pilih Kategori Transaksi --</option>
                  {(state.kategori || []).map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama} ({k.tipe})
                    </option>
                  ))}
                </select>
                {kategoriId && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold font-mono">
                    <span>Terdeteksi Tipe Induk Kas:</span>
                    <span className="bg-slate-100 text-slate-700 py-0.5 px-1.5 rounded-md text-[9px] font-bold">
                      {tipe}
                    </span>
                  </div>
                )}
              </div>

              {/* Nominal amount input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Jumlah Nominal (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-extrabold text-slate-400">Rp</span>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 text-xs font-extrabold text-slate-900 focus:outline-none"
                    placeholder="Contoh: 150000"
                    value={jumlah || ''}
                    onChange={(e) => setJumlah(Number(e.target.value.replace(/\D/g, '')) || 0)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Keterangan / Deskripsi Pembayaran</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition min-h-[70px] resize-none"
                  placeholder="Iuran wajib kebersihan Mei, Sumbangan anak yatim..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 text-xs font-semibold bg-slate-100 hover:bg-slate-250 rounded-xl text-slate-600 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white shadow-md transition cursor-pointer"
                >
                  Input Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kwitansi model rendering overlay */}
      {selectedInvoice && (
        <InvoicePrint
          transaksi={selectedInvoice}
          warga={warga.find((w) => w.id === selectedInvoice.warga_id)}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

    </div>
  );
}
