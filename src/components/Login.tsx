import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogIn, KeyRound, Phone, Users, ShieldAlert, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { login, loading } = useApp();
  const [tab, setTab] = useState<'staff' | 'warga'>('staff');
  
  // Staff credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Warga credentials
  const [nikOrPhone, setNikOrPhone] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmitStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!username.trim() || !password.trim()) {
      setFormError('Lengkapi Username dan Password.');
      return;
    }
    const success = await login(username, password);
    if (!success) {
      setFormError('Kombinasi Username dan Password salah.');
    }
  };

  const handleSubmitWarga = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!nikOrPhone.trim()) {
      setFormError('Lengkapi NIK atau Nomor HP Anda.');
      return;
    }
    const success = await login(nikOrPhone, '');
    if (!success) {
      setFormError('NIK atau Nomor HP tidak terdaftar atau nonaktif.');
    }
  };

  // Quick action fill buttons to help evaluation
  const handleQuickFill = (role: 'super' | 'admin' | 'warga') => {
    if (role === 'super') {
      setTab('staff');
      setUsername('superadmin');
      setPassword('password123');
    } else if (role === 'admin') {
      setTab('staff');
      setUsername('admin');
      setPassword('password123');
    } else {
      setTab('warga');
      setNikOrPhone('3374110502880001');
    }
  };

  return (
    <div className="min-h-screen bg-radial from-emerald-50 via-slate-50 to-slate-100 flex flex-col justify-between p-4 relative overflow-hidden">
      
      {/* Decorative vectors */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-emerald-200/25 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-15%] left-[-15%] w-[45rem] h-[45rem] rounded-full bg-teal-100/30 blur-3xl pointer-events-none"></div>

      {/* Top logo */}
      <div className="max-w-md w-full mx-auto pt-6 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 rounded-full border border-emerald-200/40 shadow-xs mb-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-emerald-800 tracking-wider uppercase font-mono">RT 03 / RW 04 SUKASARI</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          TABUNGAN <span className="text-emerald-700">WARGA</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1 max-w-xs mx-auto">
          Portal Keuangan, Iuran, Donasi & Tabungan Warga RT Digital Terintegrasi Google Spreadsheet
        </p>
      </div>

      {/* Form Container */}
      <div className="max-w-md w-full mx-auto my-6 z-10">
        <div className="bg-white/80 rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden glass-panel">
          
          {/* Custom Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-2">
            <button
              onClick={() => { setTab('staff'); setFormError(null); }}
              className={`flex-1 py-3 text-center rounded-2xl text-xs font-bold transition duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                tab === 'staff'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="h-4 w-4" /> Pengurus RT (Staff)
            </button>
            <button
              onClick={() => { setTab('warga'); setFormError(null); }}
              className={`flex-1 py-3 text-center rounded-2xl text-xs font-bold transition duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                tab === 'warga'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="h-4 w-4" /> Warga RT
            </button>
          </div>

          <div className="p-6">
            {formError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs font-medium flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0"></span>
                <span>{formError}</span>
              </div>
            )}

            {tab === 'staff' ? (
              <form onSubmit={handleSubmitStaff} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                    Username Admin
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition duration-200"
                      placeholder="Masukkan username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                    Password
                  </label>
                  <div className="relative">
                    <LogIn className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition duration-200"
                      placeholder="Password admin"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/10 hover:shadow-emerald-700/20 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Memproses...' : 'Ases Masuk Admin'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitWarga} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                    NIK / Nomor Handphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition duration-200"
                      placeholder="NIK (3374...) atau No Hp (0813...)"
                      value={nikOrPhone}
                      onChange={(e) => setNikOrPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-emerald-800 leading-relaxed">
                  <p className="font-semibold">Bantuan Masuk Warga:</p>
                  <p className="mt-0.5">Warga RT 03 berstatus aktif dapat langsung masuk menggunakan **NIK KTP** atau **Nomor HP** yang terdaftar di database pengurus RT tanpa membutuhkan password.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/10 hover:shadow-emerald-700/20 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Memproses...' : 'Masuk Kartu Tabungan'}
                </button>
              </form>
            )}

            {/* Eval panel shortcut */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-1.5 mb-2.5">
                <HelpCircle className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wider uppercase">DEMO LOGIN INSTAN (KLIK):</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleQuickFill('super')}
                  className="py-1 px-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#b45309] text-[9.5px] font-semibold rounded-lg cursor-pointer transition text-center"
                >
                  Super Admin
                </button>
                <button
                  onClick={() => handleQuickFill('admin')}
                  className="py-1 px-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[9.5px] font-semibold rounded-lg cursor-pointer transition text-center"
                >
                  Admin RT
                </button>
                <button
                  onClick={() => handleQuickFill('warga')}
                  className="py-1 px-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9.5px] font-semibold rounded-lg cursor-pointer transition text-center"
                >
                  Warga Biasa
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Brand footer */}
      <div className="text-center z-10 py-4 border-t border-slate-200/40 text-[10px] text-slate-400 font-mono tracking-widest uppercase">
        Pengembangan Aplikasi Kas Premium &copy; 2026
      </div>
    </div>
  );
}
