import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  Calculator, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Award
} from 'lucide-react';

export default function Reports() {
  const { state } = useApp();
  const { transaksi, warga } = state;

  // Selected statement filter
  const [monthFilter, setMonthFilter] = useState('2026-05'); // default current month

  // Filter transactions by selected month
  const monthlyTrxs = transaksi.filter((t) => t.tanggal.startsWith(monthFilter));

  const totalSetoran = monthlyTrxs.filter(t => t.tipe === 'Setoran').reduce((sum, item) => sum + item.jumlah, 0);
  const totalPenarikan = monthlyTrxs.filter(t => t.tipe === 'Penarikan').reduce((sum, item) => sum + item.jumlah, 0);
  const totalIuran = monthlyTrxs.filter(t => t.tipe === 'Iuran').reduce((sum, item) => sum + item.jumlah, 0);
  const totalDonasi = monthlyTrxs.filter(t => t.tipe === 'Donasi').reduce((sum, item) => sum + item.jumlah, 0);
  const totalKasSosial = monthlyTrxs.filter(t => t.tipe === 'Kas Sosial').reduce((sum, item) => sum + item.jumlah, 0);

  const totalInflow = totalSetoran + totalIuran + totalDonasi + totalKasSosial;
  const totalOutflow = totalPenarikan;
  const netSurplus = totalInflow - totalOutflow;

  // Compile individual resident balances for "REKAP IURAN & TABUNGAN" table
  const residentReportRows = warga.map((w) => {
    const pTrxs = transaksi.filter(t => t.warga_id === w.id);
    const pSetoran = pTrxs.filter(t => t.tipe === 'Setoran').reduce((sum, item) => sum + item.jumlah, 0);
    const pPenarikan = pTrxs.filter(t => t.tipe === 'Penarikan').reduce((sum, item) => sum + item.jumlah, 0);
    const pIuran = pTrxs.filter(t => t.tipe === 'Iuran').reduce((sum, item) => sum + item.jumlah, 0);
    const pDonasi = pTrxs.filter(t => t.tipe === 'Donasi' || t.tipe === 'Kas Sosial').reduce((sum, item) => sum + item.jumlah, 0);
    
    return {
      nik: w.id,
      nama: w.nama,
      setoran: pSetoran,
      penarikan: pPenarikan,
      iuran: pIuran,
      donasi: pDonasi,
      tabungan: pSetoran - pPenarikan
    };
  });

  // Export spreadsheet rekap to CSV
  const handleExportExcel = () => {
    const headers = 'NIK,Nama Warga,Total Setoran Hari,Total Penarikan Hari,Dues Iuran Terbayar,Donasi Sosial,Saldo Tabungan Aktif\n';
    const rows = residentReportRows.map((r) => {
      return `${r.nik},"${r.nama.replace(/"/g, '""')}",${r.setoran},${r.penarikan},${r.iuran},${r.donasi},${r.tabungan}`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Laporan_Kas_RT_03_${monthFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    if (printWindow) {
      const compiledRowsHtml = residentReportRows.map((r, i) => `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <td style="padding: 10px;">${i + 1}</td>
          <td style="padding: 10px;"><b>${r.nama}</b><br><small style="color:#64748b">${r.nik}</small></td>
          <td style="padding: 10px; font-family: monospace;">Rp ${r.setoran.toLocaleString('id-ID')}</td>
          <td style="padding: 10px; font-family: monospace;">Rp ${r.penarikan.toLocaleString('id-ID')}</td>
          <td style="padding: 10px; font-family: monospace;">Rp ${r.iuran.toLocaleString('id-ID')}</td>
          <td style="padding: 10px; font-family: monospace;">Rp ${r.donasi.toLocaleString('id-ID')}</td>
          <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #047857;">Rp ${r.tabungan.toLocaleString('id-ID')}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Laporan Keuangan RT 003 - Bulan ${monthFilter}</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
              .header { border-bottom: 4px double #10b981; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
              .stat-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 5px; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 30px; }
              th { background-color: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
              .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; }
              .sig { border-bottom: 1px solid #64748b; width: 180px; margin-top: 60px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 style="margin: 0; text-transform: uppercase; letter-spacing: 1px;">RUKUN TETANGGA 003 / RW 004</h2>
              <p style="margin: 3px 0 0 0; color: #475569; font-size: 12px;">Perumahan Sukasari Elok, Kelurahan Sukasari, Semarang Tengah</p>
              <h3 style="margin: 15px 0 0 0; color: #047857; text-transform: uppercase; font-size: 14px;">LAPORAN REKAPITULASI DANA WARGA - BULAN ${monthFilter}</h3>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
              <div class="stat-box">
                <span style="font-size: 9px; color: #64748b; font-weight: bold; display: block;">PEMASUKAN BULANAN</span>
                <span style="font-size: 15px; font-weight: bold; color: #047857;">Rp ${totalInflow.toLocaleString('id-ID')}</span>
              </div>
              <div class="stat-box">
                <span style="font-size: 9px; color: #64748b; font-weight: bold; display: block;">PENARIKAN BULANAN</span>
                <span style="font-size: 15px; font-weight: bold; color: #dc2626;">Rp ${totalOutflow.toLocaleString('id-ID')}</span>
              </div>
              <div class="stat-box" style="background-color: #ecfdf5;">
                <span style="font-size: 9px; color: #047857; font-weight: bold; display: block;">SURPLUS KAS RT</span>
                <span style="font-size: 15px; font-weight: bold; color: #065f46;">Rp ${netSurplus.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 40px;">No</th>
                  <th>Nama Warga (NIK/ID)</th>
                  <th>Total Setoran</th>
                  <th>Penarikan</th>
                  <th>Iuran Wajib</th>
                  <th>Donasi/Donasi</th>
                  <th>Saldo Tabungan</th>
                </tr>
              </thead>
              <tbody>
                ${compiledRowsHtml}
              </tbody>
            </table>

            <div class="footer">
              <div style="text-align: center;">
                <p style="margin: 0;">Ketua Rukun Tetangga (RT 03),</p>
                <div class="sig"></div>
                <p style="margin: 5px 0 0 0;">Budi Setyawan</p>
              </div>

              <div style="text-align: center;">
                <p style="margin: 0;">Bendahara RT,</p>
                <div class="sig"></div>
                <p style="margin: 5px 0 0 0;">Siti Rahayu</p>
              </div>
            </div>

            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top section overview */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Laporan Keuangan & Audit RT</h2>
          <p className="text-xs text-slate-400 mt-0.5">Pantau ringkasan saldo, rekap kebersihan/wajib dues, dan rekam laporan ke dalam PDF/Spreadsheet</p>
        </div>

        {/* Date statement parameter selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0 ml-1.5" />
          <input
            type="month"
            className="text-xs font-bold text-slate-800 focus:outline-none bg-transparent"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Triple stat report cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Inflows */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/40 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase block">TOTAL PEMASUKAN HARI INI</span>
            <h3 className="text-lg font-extrabold text-slate-900 font-mono">Rp {totalInflow.toLocaleString('id-ID')}</h3>
            <span className="text-[9.5px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-0.5 w-max">
              <ArrowUpRight className="h-3 w-3" /> Setoran, Iuran, Donasi
            </span>
          </div>
          <Calculator className="h-7 w-7 text-slate-350 shrink-0" />
        </div>

        {/* Outflows */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/40 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase block">PENARIKAN BULAN INI SEMENTARA</span>
            <h3 className="text-lg font-extrabold text-slate-900 font-mono">Rp {totalOutflow.toLocaleString('id-ID')}</h3>
            <span className="text-[9.5px] text-red-650 font-bold bg-red-50/50 px-2.5 py-0.5 rounded-md border border-red-100 flex items-center gap-0.5 w-max">
              <ArrowDownRight className="h-3 w-3" /> Penarikan Tabungan Mandiri
            </span>
          </div>
          <Calculator className="h-7 w-7 text-slate-350 shrink-0" />
        </div>

        {/* Remaining Surplus balance */}
        <div className="bg-[#0f172a] text-[#f8fafc] rounded-2xl p-5 border border-[#1e293b] shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase block">SURPLUS BERSIH BULAN INI</span>
            <h3 className="text-lg font-extrabold text-emerald-400 font-mono">Rp {netSurplus.toLocaleString('id-ID')}</h3>
            <span className="text-[9.5px] text-emerald-300 font-bold bg-emerald-950/45 px-2.5 py-0.5 rounded-md border border-emerald-800/40 flex items-center gap-0.5 w-max">
              <Sparkles className="h-3 w-3" /> Dana Kas RT Sehat
            </span>
          </div>
          <Award className="h-7 w-7 text-emerald-400 shrink-0 animate-pulse" />
        </div>
      </div>

      {/* Main statistical spreadsheet report table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Rekapitulasi Saldo & Iuran Warga</h3>
            <p className="text-xs text-slate-400 mt-0.5">Kombinasi total dana kumulatif seluruh warga rukun tetangga</p>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none py-2 px-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="h-4 w-4" /> Dowload Rekap Excel (CSV)
            </button>
            <button
              onClick={handlePrintReport}
              className="flex-1 sm:flex-none py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10"
            >
              <Printer className="h-4 w-4" /> Cetak PDF Lembar Penandatanganan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest font-semibold border-b font-sans">
                <th className="py-3 px-5">Nama Warga</th>
                <th className="py-3 px-5">Total Setoran</th>
                <th className="py-3 px-5">Total Penarikan</th>
                <th className="py-3 px-5">Iuran Kebersihan</th>
                <th className="py-3 px-5">Sumbangan/Kas Sosial</th>
                <th className="py-3 px-5">Sisa Saldo Tabungan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {residentReportRows.map((r) => (
                <tr key={r.nik} className="hover:bg-slate-50/20 transition">
                  {/* citizen design */}
                  <td className="py-3.5 px-5 font-sans">
                    <span className="font-extrabold text-slate-900 block leading-tight">{r.nama}</span>
                    <span className="text-[10px] text-slate-450 font-mono block mt-0.5">NIK: {r.nik}</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-750">Rp {r.setoran.toLocaleString('id-ID')}</td>
                  <td className="py-3.5 px-5 text-red-600">Rp {r.penarikan.toLocaleString('id-ID')}</td>
                  <td className="py-3.5 px-5 text-slate-750">Rp {r.iuran.toLocaleString('id-ID')}</td>
                  <td className="py-3.5 px-5 text-slate-700">Rp {r.donasi.toLocaleString('id-ID')}</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-700">Rp {r.tabungan.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
