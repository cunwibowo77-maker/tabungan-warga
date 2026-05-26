import React, { useRef } from 'react';
import { Warga, Transaksi } from '../types';
import { CreditCard, QrCode, Sparkles, Building2, Printer, Check } from 'lucide-react';
import { calculateCitizenBalance } from '../services/api';

interface SavingsCardProps {
  warga: Warga;
  transaksi: Transaksi[];
}

export default function SavingsCard({ warga, transaksi }: SavingsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate stats specifically for this citizen
  const personalTrxs = transaksi.filter((t) => String(t.warga_id).trim() === String(warga.id).trim());
  
  const totalSetoran = personalTrxs
    .filter((t) => t.tipe === 'Setoran')
    .reduce((sum, item) => sum + item.jumlah, 0);

  const totalPenarikan = personalTrxs
    .filter((t) => t.tipe === 'Penarikan')
    .reduce((sum, item) => sum + item.jumlah, 0);

  const totalIuran = personalTrxs
    .filter((t) => t.tipe === 'Iuran' || t.tipe === 'Kas Sosial')
    .reduce((sum, item) => sum + item.jumlah, 0);

  const totalDonasi = personalTrxs
    .filter((t) => t.tipe === 'Donasi')
    .reduce((sum, item) => sum + item.jumlah, 0);

  const sisaTabungan = calculateCitizenBalance(warga.id, transaksi);

  const handlePrintCard = () => {
    const printContent = cardRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
      if (windowPrint) {
        windowPrint.document.write(`
          <html>
            <head>
              <title>Print Kartu Tabungan Digital - ${warga.nama}</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                body { font-family: 'Inter', sans-serif; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f8fafc; }
                .card-print { width: 450px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; border-radius: 1.5rem; padding: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); relative; overflow: hidden; }
              </style>
            </head>
            <body>
              <div class="card-print">
                ${printContent}
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
        windowPrint.document.close();
      }
    }
  };

  // NIK masker
  const formatNIK = (nik: string) => {
    if (nik.length < 12) return nik;
    return `${nik.slice(0, 6)} - ****** - ${nik.slice(12)}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Visual Card Section */}
      <div 
        ref={cardRef}
        className="w-full max-w-sm mx-auto aspect-[1.586/1] emerald-gradient rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden emerald-hologram print-card-shadow"
      >
        {/* Holographic glowing stripes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 opacity-20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-teal-300 opacity-15 rounded-full blur-3xl"></div>

        {/* Top brand */}
        <div className="flex justify-between items-start z-10">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider leading-none">Tabungan Warga</h4>
              <span className="text-[9px] text-emerald-100 opacity-80 font-mono">RT 03 / RW 04, Sukasari</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 rounded-lg text-[9px] font-mono backdrop-blur-md border border-white/10 uppercase tracking-widest text-emerald-100">
            <Check className="h-3 w-3 text-emerald-300" /> Aktif
          </div>
        </div>

        {/* Chip and contact-less indicator */}
        <div className="flex justify-between items-center my-1 z-10">
          {/* Simulated Golden Chip */}
          <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-300 border border-amber-400/40 shadow-inner flex flex-col justify-between p-1">
            <div className="flex justify-between">
              <div className="w-1.5 h-1.5 bg-black/10 rounded-xs"></div>
              <div className="w-1.5 h-1.5 bg-black/10 rounded-xs"></div>
            </div>
            <div className="h-0.5 w-full bg-black/10"></div>
            <div className="flex justify-between">
              <div className="w-1.5 h-1.5 bg-black/10 rounded-xs"></div>
              <div className="w-1.5 h-1.5 bg-black/10 rounded-xs"></div>
            </div>
          </div>
          <CreditCard className="h-5 w-5 text-emerald-200/80" />
        </div>

        {/* Tabungan balance display */}
        <div className="my-1 z-10">
          <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-medium font-mono">SISA DEPOSIT TABUNGAN</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-sans mt-0.5">
            Rp {sisaTabungan.toLocaleString('id-ID')}
          </h2>
        </div>

        {/* Cardholder details */}
        <div className="flex justify-between items-end mt-2 z-10">
          <div className="max-w-[70%]">
            <p className="text-[9px] text-emerald-200 font-mono tracking-wider">PEMILIK KARTU</p>
            <h3 className="text-sm font-bold tracking-wide uppercase truncate leading-tight mt-0.5">
              {warga.nama}
            </h3>
            <span className="text-[10px] text-emerald-100/90 font-mono tracking-widest block mt-0.5">
              {formatNIK(warga.id)}
            </span>
          </div>
          {/* Simulated QR logo */}
          <div className="h-12 w-12 bg-white rounded-xl p-1 shadow-md flex items-center justify-center border border-emerald-100/30">
            <QrCode className="h-10 w-10 text-emerald-950" />
          </div>
        </div>
      </div>

      {/* Stats and Action panel below the card */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-3 border border-slate-100">
        <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 text-center">
          <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Setoran</span>
          <span className="text-xs font-semibold text-emerald-600 font-mono mt-1 block">
            +{totalSetoran.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 text-center">
          <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Ditarik</span>
          <span className="text-xs font-semibold text-red-600 font-mono mt-1 block">
            -{totalPenarikan.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 text-center">
          <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Iuran & Kas</span>
          <span className="text-xs font-semibold text-slate-700 font-mono mt-1 block">
            {totalIuran.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      <button
        onClick={handlePrintCard}
        className="no-print w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 ring-1 ring-slate-200 hover:bg-slate-200 text-slate-700 font-medium text-xs transition duration-200 cursor-pointer shadow-xs"
      >
        <Printer className="h-4 w-4" /> Cetak Kartu Tabungan Digital
      </button>
    </div>
  );
}
