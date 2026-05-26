import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateCitizenBalance } from '../services/api';
import { 
  DollarSign, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Calendar, 
  Megaphone, 
  TrendingUp, 
  Award,
  Wallet,
  PiggyBank,
  CheckCircle2,
  FileSpreadsheet,
  PlusCircle,
  Eye,
  Sparkles
} from 'lucide-react';
import SavingsCard from '../components/SavingsCard';
import InvoicePrint from '../components/InvoicePrint';
import { motion } from 'motion/react';
import { Transaksi } from '../types';

export default function Dashboard() {
  const { state, user, addTransaction } = useApp();
  const { transaksi, warga, target_kas, pengumuman } = state;

  const [selectedInvoiceTrx, setSelectedInvoiceTrx] = useState<Transaksi | null>(null);

  // Common stat calculations
  const totalWargaAktif = warga.filter((w) => w.status === 'Aktif').length;
  
  const totalSetoran = transaksi.filter((t) => t.tipe === 'Setoran').reduce((sum, item) => sum + item.jumlah, 0);
  const totalPenarikan = transaksi.filter((t) => t.tipe === 'Penarikan').reduce((sum, item) => sum + item.jumlah, 0);
  const totalIuran = transaksi.filter((t) => t.tipe === 'Iuran').reduce((sum, item) => sum + item.jumlah, 0);
  const totalDonasi = transaksi.filter((t) => t.tipe === 'Donasi').reduce((sum, item) => sum + item.jumlah, 0);
  const totalKasSosial = transaksi.filter((t) => t.tipe === 'Kas Sosial').reduce((sum, item) => sum + item.jumlah, 0);

  // Total Savings of residents
  const totalTabunganWarga = totalSetoran - totalPenarikan;
  // Total community cash (All inputs minus withdrawals)
  const totalKasRT = (totalSetoran + totalIuran + totalDonasi + totalKasSosial) - totalPenarikan;

  // Monthly stats (Month of May 2026 based on timestamp 2026-05)
  const monthlyTrxs = transaksi.filter((t) => t.tanggal.startsWith('2026-05'));
  const countMonthly = monthlyTrxs.length;

  const monthlyIncome = monthlyTrxs
    .filter((t) => t.tipe !== 'Penarikan')
    .reduce((sum, item) => sum + item.jumlah, 0);

  const monthlyExpense = monthlyTrxs
    .filter((t) => t.tipe === 'Penarikan')
    .reduce((sum, item) => sum + item.jumlah, 0);

  // Filter latest transactions
  const latestTransactions = transaksi.slice(0, 5);

  // Filter active program targets
  const activeTargets = target_kas.filter((t) => t.status === 'aktif').slice(0, 3);

  // If user is a Warga, we display a specialized Personal Dashboard containing their digital card, simple list, announcements
  const isWarga = user?.role === 'WARGA';
  const wargaNIK = user?.username;
  const personalWarga = warga.find(w => String(w.id).trim() === String(wargaNIK).trim());
  const personalTrxs = transaksi.filter(t => String(t.warga_id).trim() === String(wargaNIK).trim());

  // Personal metrics
  const pSetoran = personalTrxs.filter(t => t.tipe === 'Setoran').reduce((sum, item) => sum + item.jumlah, 0);
  const pPenarikan = personalTrxs.filter(t => t.tipe === 'Penarikan').reduce((sum, item) => sum + item.jumlah, 0);
  const pIuran = personalTrxs.filter(t => t.tipe === 'Iuran' || t.tipe === 'Kas Sosial').reduce((sum, item) => sum + item.jumlah, 0);
  const pDonasi = personalTrxs.filter(t => t.tipe === 'Donasi').reduce((sum, item) => sum + item.jumlah, 0);
  
  const personalSaldo = calculateCitizenBalance(personalWarga?.id || wargaNIK || '', transaksi);
  const personalTotalKontribusi = pIuran + pDonasi;

  const getKategoriColor = (kat: string) => {
    switch (kat) {
      case 'pembangunan': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'sosial': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'kegiatan': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-purple-50 text-purple-700 border-purple-100';
    }
  };

  const getTipeIconClass = (tipe: string) => {
    switch (tipe) {
      case 'Setoran': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Penarikan': return 'bg-red-50 text-red-650 border-red-100';
      case 'Iuran': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Donasi': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  if (isWarga) {
    return (
      <div className="space-y-6">
        
        {/* Welcome Section */}
        <div className="bg-emerald-800 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] w-[18rem] h-[18rem] rounded-full bg-emerald-600 opacity-30 blur-2xl"></div>
          <div className="relative z-10">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Selamat Datang, Bapak/Ibu {personalWarga?.nama}!</h1>
            <p className="text-emerald-100 text-xs mt-1 max-w-md leading-relaxed">
              Anda terdaftar sebagai warga RT 03/RW 04 Semarang Tengah. Di sini Anda dapat memantau saldo tabungan, histori setoran, and program target pembangunan RT secara realtime.
            </p>
          </div>
        </div>

        {/* Triple grid section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Cards */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Kartu Digital Anda</h3>
            {personalWarga ? (
              <SavingsCard warga={personalWarga} transaksi={transaksi} />
            ) : (
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl text-sm">
                Gagal memuat profil warga. Kontak admin.
              </div>
            )}
            
            {/* Personal overview mini summary */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Activity className="h-4 w-4 text-emerald-600" /> Ringkasan Anda
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Total Setoran Tabungan</span>
                  <span className="font-semibold text-slate-800 font-mono">Rp {pSetoran.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Penarikan Tabungan</span>
                  <span className="font-semibold text-red-650 font-mono">Rp {pPenarikan.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Dukungan Iuran RT</span>
                  <span className="font-semibold text-slate-800 font-mono">Rp {pIuran.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Sumur Donasi Sukarela</span>
                  <span className="font-semibold text-slate-800 font-mono">Rp {pDonasi.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Transaction History & Announcements */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Personal History */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center justify-between mb-4">
                <span>Histori Transaksi Terakhir Anda</span>
                <span className="text-xs font-mono font-bold text-slate-400">Total: {personalTrxs.length} TRX</span>
              </h3>

              {personalTrxs.length === 0 ? (
                <div className="text-center py-10">
                  <Wallet className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Belum ada riwayat transaksi terdaftar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b">
                        <th className="py-3 px-4 rounded-l-xl">No. TRX</th>
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4">Jenis</th>
                        <th className="py-3 px-4">Jumlah</th>
                        <th className="py-3 px-4">Keterangan</th>
                        <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {personalTrxs.slice(0, 5).map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{t.id}</td>
                          <td className="py-3.5 px-4 text-slate-400 shrink-0">{t.tanggal}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-md border font-semibold text-[10px] ${getTipeIconClass(t.tipe)}`}>
                              {t.tipe}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            Rp {t.jumlah.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 max-w-[150px] truncate">{t.keterangan}</td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setSelectedInvoiceTrx(t)}
                              className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-250 border border-slate-200 rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center justify-center gap-1 mx-auto"
                            >
                              <Eye className="h-3 w-3" /> Bukti
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Announcements Group */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2 mb-4">
                <Megaphone className="h-5 w-5 text-emerald-600 animate-bounce" />
                <span>Pengumuman RT Terbaru</span>
              </h3>
              
              {pengumuman.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Tidak ada pengumuman terbaru.</p>
              ) : (
                <div className="space-y-4">
                  {pengumuman.slice(0, 3).map((p) => (
                    <div key={p.id} className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/40">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-extrabold text-slate-800 tracking-tight">{p.judul}</h4>
                        <span className="text-[10px] font-mono font-semibold text-emerald-600 whitespace-nowrap bg-emerald-100/60 px-2 py-0.5 rounded-md">{p.tanggal}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed break-words">{p.isi}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Invoice Receipt Modal if open */}
        {selectedInvoiceTrx && (
          <InvoicePrint
            transaksi={selectedInvoiceTrx}
            warga={personalWarga}
            onClose={() => setSelectedInvoiceTrx(null)}
          />
        )}
      </div>
    );
  }

  // Otherwise, display detailed supervisor / admin Dashboard with charts and general stats
  return (
    <div className="space-y-6">
      
      {/* Overview Stat Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Kas RT */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest font-bold uppercase block">TOTAL SALDO KAS RT</span>
            <h2 className="text-xl font-black text-slate-800 mt-1 font-mono">
              Rp {totalKasRT.toLocaleString('id-ID')}
            </h2>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md mt-1.5 inline-flex items-center gap-0.5 border border-emerald-100 leading-none">
              <Sparkles className="h-2.5 w-2.5" /> Total Kas Komunitas
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        {/* Citizens Savings card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest font-bold uppercase block">TOTAL TABUNGAN WARGA</span>
            <h2 className="text-xl font-black text-slate-800 mt-1 font-mono">
              Rp {totalTabunganWarga.toLocaleString('id-ID')}
            </h2>
            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-md mt-1.5 inline-flex items-center gap-0.5 border border-indigo-100 leading-none">
              <PiggyBank className="h-2.5 w-2.5" /> Milik Warga Aktif
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <PiggyBank className="h-6 w-6" />
          </div>
        </div>

        {/* Citizens actives count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest font-bold uppercase block">WARGA AKTIF RT</span>
            <h2 className="text-xl font-black text-slate-800 mt-1 font-mono">
              {totalWargaAktif} Jiwa
            </h2>
            <p className="text-[9.5px] text-slate-400 mt-1">Mengelola {warga.length} data KK/warga terdata</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Transactions of the month count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest font-bold uppercase block">TRANSAKSI MEI 2026</span>
            <h2 className="text-xl font-black text-slate-800 mt-1 font-mono">
              {countMonthly} Transaksi
            </h2>
            <p className="text-[9.5px] text-slate-400 mt-1">Histori kas bulan berjalan</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Mid section: Monthly trends and targets program chart with high visual accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly statistic graphics */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4 gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-600" /> Profil Aliran Kas Bulanan
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Grafik perbandingan saldo pemasukan versus pengeluaran ditarik</p>
            </div>
            
            {/* Legend section */}
            <div className="flex items-center gap-3 text-[10.5px] font-bold">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Pemasukan RT
              </span>
              <span className="flex items-center gap-1 text-red-500">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span> Pengeluaran Warga
              </span>
            </div>
          </div>

          {/* Simple custom vector dashboard chart */}
          <div className="h-56 w-full flex flex-col justify-between pt-2">
            {/* Chart Area */}
            <div className="flex-1 w-full flex items-end gap-1.5 border-b border-l border-slate-100 pb-2 relative font-mono">
              {/* Backgrid reference lines */}
              <div className="absolute inset-y-0 right-0 w-full flex flex-col justify-between pointer-events-none text-[8.5px] text-slate-300">
                <div className="border-t border-slate-100/60 w-full pt-1 text-right">Rp 2.500.000</div>
                <div className="border-t border-slate-100/60 w-full pt-1 text-right">Rp 1.000.000</div>
                <div className="border-t border-slate-100/60 w-full pt-1 text-right">Rp 500.000</div>
                <div className="border-t border-slate-100/60 w-full pt-1 text-right">Rp 100.000</div>
              </div>

              {/* Handcrafted bar representatives representing different periods or types */}
              {/* Setoran */}
              <div className="flex-1 flex flex-col items-center justify-end h-full text-center group">
                <div className="w-8 bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all cursor-pointer relative" style={{ height: '70%' }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white font-mono text-[9px] rounded px-1 group-hover:block hidden z-25 whitespace-nowrap shadow-md">
                    Rp {totalSetoran.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="w-8 bg-red-400 hover:bg-red-500 rounded-t-md transition-all cursor-pointer relative" style={{ height: '30%' }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white font-mono text-[9px] rounded px-1 group-hover:block hidden z-25 whitespace-nowrap shadow-md">
                    Rp {totalPenarikan.toLocaleString('id-ID')}
                  </div>
                </div>
                <span className="text-[9.5px] text-slate-500 font-semibold tracking-tight mt-1.5 truncate text-center w-full">Setoran/Tarik</span>
              </div>

              {/* Iuran */}
              <div className="flex-1 flex flex-col items-center justify-end h-full text-center group">
                <div className="w-8 bg-emerald-500 hover:bg-emerald-600 rounded-t-md relative" style={{ height: '40%' }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white font-mono text-[9px] rounded-md px-1 group-hover:block hidden z-25 whitespace-nowrap">
                    Rp {totalIuran.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="w-8 bg-slate-100 rounded-t-sm" style={{ height: '0%' }}></div>
                <span className="text-[9.5px] text-slate-500 font-semibold tracking-tight mt-1.5 truncate text-center w-full">Iuran Bulan</span>
              </div>

              {/* Donasi */}
              <div className="flex-1 flex flex-col items-center justify-end h-full text-center group">
                <div className="w-8 bg-emerald-500 hover:bg-emerald-600 rounded-t-md relative" style={{ height: '75%' }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white font-mono text-[9px] rounded-md px-1 group-hover:block hidden z-25 whitespace-nowrap">
                    Rp {totalDonasi.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="w-8 bg-slate-100 rounded-t-sm" style={{ height: '0%' }}></div>
                <span className="text-[9.5px] text-slate-500 font-semibold tracking-tight mt-1.5 truncate text-center w-full">Donasi Sosial</span>
              </div>

              {/* Kas RT */}
              <div className="flex-1 flex flex-col items-center justify-end h-full text-center group">
                <div className="w-8 bg-emerald-500 hover:bg-emerald-600 rounded-t-md relative" style={{ height: '35%' }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white font-mono text-[9px] rounded-md px-1 group-hover:block hidden z-25 whitespace-nowrap">
                    Rp {totalKasSosial.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="w-8 bg-slate-100 rounded-t-sm" style={{ height: '0%' }}></div>
                <span className="text-[9.5px] text-slate-500 font-semibold tracking-tight mt-1.5 truncate text-center w-full">Kas Sukarela</span>
              </div>
            </div>

            {/* Quick summary status values banner below */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="text-center font-mono">
                <span className="text-[9px] text-slate-400 block uppercase font-mono font-bold leading-none">TOTAL PEMASUKAN</span>
                <span className="text-xs font-bold text-slate-800 block mt-1">
                  Rp {(totalSetoran + totalIuran + totalDonasi + totalKasSosial).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-center font-mono">
                <span className="text-[9px] text-slate-400 block uppercase font-mono font-bold leading-none">PENGELUARAN WARGA</span>
                <span className="text-xs font-bold text-red-600 block mt-1">
                  Rp {totalPenarikan.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-center font-mono">
                <span className="text-[9px] text-slate-400 block uppercase font-mono font-bold leading-none">SELISIH KAS BERSIH</span>
                <span className="text-xs font-bold text-emerald-600 block mt-1">
                  Rp {totalKasRT.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Target active programs progress */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-600" /> Target Kas RT
            </h3>
            <p className="text-xs text-slate-400 mb-4 pb-2 border-b">Progress penggalangan program</p>

            <div className="space-y-4">
              {activeTargets.map((tg) => {
                const percent = Math.min(100, Math.round((tg.terkumpul / tg.target) * 100));
                return (
                  <div key={tg.id} className="space-y-1.5 pb-3 border-b border-slate-50 last:border-b-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate block max-w-[70%] leading-tight">
                        {tg.nama_program}
                      </span>
                      <span className={`text-[8.5px] px-1.5 rounded-md font-bold uppercase ${getKategoriColor(tg.kategori)} border`}>
                        {tg.kategori}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 font-mono">
                      <span>Rp {tg.terkumpul.toLocaleString('id-ID')} / {tg.target.toLocaleString('id-ID')}</span>
                      <span className="text-emerald-600 font-bold">{percent}%</span>
                    </div>
                  </div>
                );
              })}
              
              {activeTargets.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">Tidak ada target program kas aktif.</p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[10.5px] text-slate-500 mt-4 leading-relaxed">
            Target program kas digunakan untuk membantu merencanakan proyek rukun tetangga seperti perbaikan saluran pembuangan, perayaan, atau bantuan darurat kemanusiaan.
          </div>
        </div>
      </div>

      {/* Bottom section: Recent transactions list */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center justify-between mb-4 pb-2 border-b">
          <span>Riwayat Transaksi Terbaru</span>
          <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5 font-mono">Bulan Mei 2026</span>
        </h3>

        {latestTransactions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xs text-slate-400">Tidak ada riwayat transaksi terdata.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest font-semibold border-b">
                  <th className="py-3 px-4 rounded-l-xl">No. TRX</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama Warga</th>
                  <th className="py-3 px-4">Tipe Aliran</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Jumlah</th>
                  <th className="py-3 px-4 rounded-r-xl text-center">Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {latestTransactions.map((t) => {
                  const citizen = warga.find((w) => String(w.id).trim() === String(t.warga_id).trim());
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{t.id}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{t.tanggal}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{citizen ? citizen.nama : 'Umum (Bukan Warga)'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getTipeIconClass(t.tipe)}`}>
                          {t.tipe}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">{t.keterangan || '-'}</td>
                      <td className="py-3 px-4 font-mono font-extrabold text-slate-950">
                        Rp {t.jumlah.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedInvoiceTrx(t)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-bold cursor-pointer transition flex items-center justify-center gap-1 mx-auto"
                        >
                          <Eye className="h-3 w-3 text-slate-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice modal if any */}
      {selectedInvoiceTrx && (
        <InvoicePrint
          transaksi={selectedInvoiceTrx}
          warga={warga.find((w) => String(w.id).trim() === String(selectedInvoiceTrx.warga_id).trim())}
          onClose={() => setSelectedInvoiceTrx(null)}
        />
      )}

    </div>
  );
}
