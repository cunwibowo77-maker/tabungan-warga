import React, { useRef } from 'react';
import { Transaksi, Warga } from '../types';
import { X, Printer, CheckCircle, FileText, Calendar, Compass, User, DollarSign } from 'lucide-react';

interface InvoicePrintProps {
  transaksi: Transaksi;
  warga: Warga | undefined;
  onClose: () => void;
}

export default function InvoicePrint({ transaksi, warga, onClose }: InvoicePrintProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContents = printAreaRef.current?.innerHTML;
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=800,toolbar=0,scrollbars=0,status=0');
    if (windowPrint && printContents) {
      windowPrint.document.write(`
        <html>
          <head>
            <title>Kwitansi ${transaksi.id} - RT 03/RW 04</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; }
              .stamp { border: 3px double #10b981; color: #10b981; transform: rotate(-5deg); font-weight: 800; font-family: 'Courier New', monospace; }
            </style>
          </head>
          <body>
            ${printContents}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }
            </script>
          </body>
        </html>
      `);
      windowPrint.document.close();
    }
  };

  const getTipeBadgeClass = (tipe: string) => {
    switch (tipe) {
      case 'Setoran': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Penarikan': return 'bg-red-100 text-red-800 border-red-200';
      case 'Iuran': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Donasi': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Kas Sosial': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:max-h-[90vh]">
        {/* Header toolbar */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center no-print">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Bukti Transaksi Digital</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition"
            >
              <Printer className="h-4 w-4" /> Cetak Kwitansi
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Layout */}
        <div 
          ref={printAreaRef}
          className="p-8 bg-white flex-1 overflow-y-auto text-slate-800 font-sans"
        >
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-6 mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shrink-0">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">RUKUN TETGANGGA 03</h2>
                <p className="text-xs text-slate-500">Perumahan Sukasari Elok, RW 04, Kel. Sukasari</p>
                <p className="text-[10px] text-slate-400 font-mono">Kec. Semarang Tengah, Kota Semarang</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500">KWITANSI PEMBAYARAN</h3>
              <p className="text-base font-bold text-emerald-600 font-mono mt-1">{transaksi.id}</p>
              <p className="text-[11px] text-slate-500 flex items-center sm:justify-end gap-1 font-mono mt-0.5">
                <Calendar className="h-3 w-3" /> Tanggal: {transaksi.tanggal}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 mb-6">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <h4 className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2 font-bold">INFO WARGA / PENYETOR</h4>
              <p className="text-sm font-bold text-slate-900">{warga?.nama || 'Umum (Bukan Warga)'}</p>
              <p className="text-xs text-slate-500 mt-1">Alamat: {warga?.alamat || '-'}</p>
              <p className="text-xs text-slate-500 font-mono mt-1">No HP: {warga?.no_hp || '-'}</p>
              <p className="text-xs text-slate-500 font-mono">NIK: {warga?.id || '-'}</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative overflow-hidden flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2 font-bold">STATUS TRANSAKSI</h4>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTipeBadgeClass(transaksi.tipe)}`}>
                    {transaksi.tipe}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <CheckCircle className="h-4 w-4" /> Berhasil
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Metode: Tunai / Transfer Kas RT</p>
            </div>
          </div>

          {/* Money Info details table */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-mono border-b border-slate-100">
                  <th className="py-3 px-4">Deskripsi Pembayaran</th>
                  <th className="py-3 px-4 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-slate-900">{transaksi.tipe} Kas RT</p>
                    <p className="text-xs text-slate-500 mt-0.5 italic">" {transaksi.keterangan || `Transaksi ${transaksi.tipe}`} "</p>
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                    Rp {transaksi.jumlah.toLocaleString('id-ID')}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="py-3 px-4 text-right font-bold text-slate-500">TOTAL PEMBAYARAN</td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600 text-base">
                    Rp {transaksi.jumlah.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terrbilang / Spelling Indonesian */}
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <span className="font-bold text-slate-500 font-mono uppercase block mb-1">Terbilang:</span>
            <span className="capitalize text-slate-700 font-semibold italic">
              {spelledIndonesian(transaksi.jumlah)} Rupiah
            </span>
          </div>

          {/* Footer Signature */}
          <div className="flex justify-between items-center pt-8 border-t">
            <div className="text-center w-1/3">
              <p className="text-xs text-slate-400 font-mono">Penerima/Warga,</p>
              <div className="h-14"></div>
              <p className="text-xs font-bold text-slate-700 underline">{warga?.nama || '................'}</p>
            </div>

            {/* Custom Stamp image simulation for fun */}
            <div className="text-center flex justify-center items-center">
              <div className="stamp border-3 border-double border-emerald-500/80 rounded-xl px-3 py-1 text-emerald-500/80 text-[10px] font-extrabold uppercase font-mono select-none pointer-events-none transform -rotate-6">
                LUNAS RT 03
                <div className="text-[8px] font-normal leading-none font-sans">Semarang Tengah</div>
              </div>
            </div>

            <div className="text-center w-1/3">
              <p className="text-xs text-slate-400 font-mono">Bendahara RT,</p>
              <div className="h-10 text-[10px] flex justify-center items-center font-mono text-emerald-600 italic">
                Digitally Signed
              </div>
              <p className="text-xs font-bold text-slate-700 underline">
                {transaksi.admin_input === 'superadmin' ? 'Budi Setyawan (Ketua RT)' : 'Siti Rahayu (Bendahara)'}
              </p>
              <p className="text-[9px] text-slate-400 font-mono leading-none">ID Staff: @{transaksi.admin_input}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Convert numbers into spelled words in Indonesian
function spelledIndonesian(num: number): string {
  const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  
  if (num === 0) return 'Nol';
  
  function helper(n: number): string {
    if (n < 12) return units[n];
    if (n < 20) return helper(n - 10) + ' Belas';
    if (n < 100) return helper(Math.floor(n / 10)) + ' Puluh ' + helper(n % 10);
    if (n < 200) return 'Seratus ' + helper(n - 100);
    if (n < 1000) return helper(Math.floor(n / 100)) + ' Ratus ' + helper(n % 100);
    if (n < 2000) return 'Seribu ' + helper(n - 1000);
    if (n < 1000000) return helper(Math.floor(n / 1000)) + ' Ribu ' + helper(n % 1000);
    if (n < 1000000000) return helper(Math.floor(n / 1000000)) + ' Juta ' + helper(n % 1000000);
    return 'Besar Sekali';
  }

  // Quick space formatting cleaner
  return helper(num).replace(/\s+/g, ' ').trim();
}
