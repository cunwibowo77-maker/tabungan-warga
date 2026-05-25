import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Wallet, 
  TrendingUp, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  CloudLightning,
  CloudOff,
  UserCheck,
  RefreshCw,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ activeTab, setActiveTab, children }: DashboardLayoutProps) {
  const { user, logout, gasUrl, syncWithGas, loading } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!user) return null;

  // Define navigation items based on User Role permissions
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['SUPER_ADMIN', 'ADMIN', 'WARGA'] },
    { id: 'warga', label: 'Kelola Warga', icon: <Users className="h-5 w-5" />, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'transaksi', label: 'Kas & Transaksi', icon: <Wallet className="h-5 w-5" />, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'target', label: 'Target Program Kas', icon: <TrendingUp className="h-5 w-5" />, roles: ['SUPER_ADMIN', 'ADMIN', 'WARGA'] },
    { id: 'laporan', label: 'Laporan RT', icon: <FileText className="h-5 w-5" />, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'pengaturan', label: 'Sistem & Keamanan', icon: <Settings className="h-5 w-5" />, roles: ['SUPER_ADMIN', 'ADMIN'] },
  ];

  const allowedNavs = navItems.filter(item => item.roles.includes(user.role));

  const handleSyncClick = async () => {
    await syncWithGas();
  };

  // Convert Role string to display badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin (Ketua RT)';
      case 'ADMIN': return 'Admin (Bendahara)';
      default: return 'Warga RT (Sukarela)';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-200 shrink-0 select-none">
        {/* Header Branding */}
        <div className="p-6 flex items-center gap-3 bg-emerald-700 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <div className="w-4 h-4 bg-emerald-700 rounded-sm"></div>
          </div>
          <span className="font-bold text-base tracking-tight text-white uppercase font-sans">TABUNGAN RT</span>
        </div>

        {/* API GAS Connection indicator */}
        <div className="px-6 py-3.5 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 font-mono tracking-wider font-bold">DATABASE API:</span>
            {gasUrl ? (
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold font-mono bg-emerald-950/45 px-2 py-0.5 rounded-md border border-emerald-800/40">
                <CloudLightning className="h-3 w-3 animate-pulse" /> ONLINE
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[9px] text-amber-500 font-bold font-mono bg-amber-950/45 px-2 py-0.5 rounded-md border border-amber-800/40">
                <CloudOff className="h-3 w-3" /> LOKAL
              </span>
            )}
          </div>
          {gasUrl && (
            <button
              onClick={handleSyncClick}
              disabled={loading}
              className="mt-2 w-full bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-white rounded-lg py-1.5 px-2.5 text-[10px] font-bold transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/40"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Sinkronisasi...' : 'Sinkronisasi Manual'}
            </button>
          )}
        </div>

        {/* Navigation panel */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {allowedNavs.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className={`shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile details at footer */}
        <div className="p-4 border-t border-slate-800 mb-4 select-none">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800/30">
            <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white/20 flex items-center justify-center font-bold text-white uppercase text-xs shrink-0">
              {user.nama.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{getRoleLabel(user.role)}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.nama}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
          </div>
          <button
            onClick={logout}
            className="mt-3.5 w-full bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/10 rounded-xl py-2 px-3 text-xs font-semibold transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header & Navigation drawer toggle */}
      <header className="md:hidden bg-slate-900 text-white px-5 py-4 flex justify-between items-center z-30 select-none">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wider uppercase">TABUNGAN RT</h1>
            <span className="text-[8px] text-emerald-400 font-mono font-bold leading-none tracking-tight block">EMERALD ONLINE</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gasUrl && (
            <button
              onClick={handleSyncClick}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-400"
              title="Sinkronisasi ke Spreadsheet"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Floating menu wrapper for Mobile devices */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-slate-900 border-b border-slate-800 text-slate-300 z-20 overflow-hidden"
          >
            <div className="px-5 py-3 space-y-1">
              {allowedNavs.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer ${
                      isActive
                        ? 'bg-emerald-650/30 text-emerald-400'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="border-t border-slate-800 pt-3 pb-4 mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center font-mono text-[10px] font-bold">
                    RT
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-none">{user.nama}</p>
                    <span className="text-[10px] text-slate-500 font-mono">{getRoleLabel(user.role)}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-900/10 rounded-lg text-xs font-bold transition duration-200 cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <h2 className="text-sm md:text-base font-extrabold text-slate-900 tracking-tight truncate uppercase">
              KAS RT 03/04 SUKASARI
            </h2>
            <span className={`text-[9px] px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-extrabold shrink-0 font-mono ${getRoleBadge(user.role)}`}>
              {getRoleLabel(user.role)}
            </span>
          </div>

          {/* Time & Clock Section */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 select-none">
            <span className="hidden lg:inline text-slate-400 text-[10px] font-medium">{formatDate(time)}</span>
            <span className="flex items-center gap-1.5 font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-mono leading-none">
              <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              {formatTime(time)}
            </span>
          </div>
        </header>

        {/* Page Inner Content */}
        <div className="flex-1 p-5 md:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
