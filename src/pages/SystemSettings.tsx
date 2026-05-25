import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/gas_script';
import { 
  Settings, 
  Database, 
  Trash2, 
  Copy, 
  Check, 
  UserCheck, 
  BookOpen, 
  CloudLightning,
  UserPlus,
  Lock,
  Calendar,
  Layers,
  X,
  RefreshCw
} from 'lucide-react';

export default function SystemSettings() {
  const { 
    state, 
    user, 
    gasUrl, 
    setGasUrlConfig, 
    syncWithGas, 
    addUser, 
    deleteUser, 
    resetDatabase,
    showToast 
  } = useApp();

  const { users, log_aktivitas } = state;

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [activeSubTab, setActiveSubTab] = useState<'api' | 'staff' | 'logs'>('api');

  // GAS Configurations
  const [inputUrl, setInputUrl] = useState(gasUrl);
  const [isCopied, setIsCopied] = useState(false);

  // New Admin form variables
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminRole, setAdminRole] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN');
  const [adminPhone, setAdminPhone] = useState('');

  const handleSaveGasUrlConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await setGasUrlConfig(inputUrl);
    if (success) {
      // URL registered successfully
    }
  };

  const handleCopyGasCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setIsCopied(true);
    showToast('Kode Google Apps Script disalin ke papan klip!', 'success');
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminUsername.trim() || !adminPass.trim() || !adminPhone.trim()) {
      alert('Mohon isi seluruh baris.');
      return;
    }
    
    // Check if user already exists
    if (users.some(u => u.username.toLowerCase() === adminUsername.trim().toLowerCase())) {
      alert('Username admin ini sudah digunakan warga atau staff lain!');
      return;
    }

    await addUser({
      nama: adminName.trim(),
      username: adminUsername.trim().toLowerCase(),
      password: adminPass,
      role: adminRole,
      no_hp: adminPhone.trim()
    });

    setShowAddAdminModal(false);
    setAdminName('');
    setAdminUsername('');
    setAdminPass('');
    setAdminRole('ADMIN');
    setAdminPhone('');
  };

  const handleDeleteAdminClick = async (targetId: string, targetName: string, targetUser: string) => {
    if (targetUser === 'superadmin') {
      alert('Super Admin bawaan tidak dapat dihapus demi keamanan sistem.');
      return;
    }
    const yes = window.confirm(`Apakah Anda yakin ingin memblokir dan menghapus akses pengurus "${targetName}"?`);
    if (yes) {
      await deleteUser(targetId);
    }
  };

  const handleResetDbClick = () => {
    if (!isSuperAdmin) {
      alert('Hanya Ketua RT (Super Admin) yang diizinkan mereset database.');
      return;
    }
    const check1 = window.confirm('PERINGATAN KRITIS: Anda akan mengosongkan / mereset seluruh database sistem Tabungan RT ke data bawaan simulasi. Semua iuran, setoran baru, dan data warga tambahan akan dihapus permanen.');
    if (check1) {
      const check2 = window.prompt('Tulis kata kunci konfirmasi "RESET DATABASE" untuk melanjutkan tindakan:');
      if (check2 === 'RESET DATABASE') {
        resetDatabase();
      } else {
        alert('Tindakan dibatalkan. Kata kunci salah.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Sistem & Keamanan Keuangan</h2>
        <p className="text-xs text-slate-400 mt-0.5">Atur database Google Spreadsheet, amankan role penanggung jawab, and audit log aktivitas</p>
      </div>

      {/* Settings Sub-navigation tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2.5 rounded-2xl md:w-max gap-1">
        <button
          onClick={() => setActiveSubTab('api')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeSubTab === 'api' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Spreadsheet & API GAS
        </button>
        <button
          onClick={() => setActiveSubTab('staff')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeSubTab === 'staff' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Kelola Staff (Admin RT)
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeSubTab === 'logs' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Audit Log Aktivitas
          </button>
        )}
      </div>

      {/* TAB SUB 1: API & SPREADSHEET CONFIGS */}
      {activeSubTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input configurations */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Hubungkan Ke Google Spreadsheet</h3>
                <p className="text-xs text-slate-400 mt-1">Gunakan deploy tautan Google Apps Script Web App untuk mengaktifkan real-time Sinkronisasi.</p>
              </div>

              <form onSubmit={handleSaveGasUrlConfig} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Web App URL</label>
                  <input
                    type="url"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm cursor-pointer text-center"
                  >
                    Simpan & Test Koneksi
                  </button>
                  {gasUrl && (
                    <button
                      type="button"
                      onClick={() => setGasUrlConfig('')}
                      className="py-3 px-4 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                    >
                      Putuskan
                    </button>
                  )}
                </div>
              </form>

              {gasUrl && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <CloudLightning className="h-5 w-5 text-emerald-600 shrink-0 animate-bounce" />
                  <div className="text-[11px] text-emerald-800 leading-normal">
                    <p className="font-bold">Aplikasi Terkoneksi Realtime!</p>
                    <p className="mt-0.5">Semua data iuran and tabungan sedang disinkronkan langsung ke Spreadsheet rujukan secara aman.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Reset database section */}
            {isSuperAdmin && (
              <div className="bg-red-50/50 border border-red-150/50 rounded-3xl p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-extrabold text-red-800 uppercase tracking-wider font-mono">Pusat Reset Sistem & DB</h4>
                  <p className="text-xs text-red-600/80 mt-1">Tindakan pembersihan yang mengosongkan semua data dan file sekunder, membersihkan token login lokal, dan kembali ke data evaluasi ketua RT semula.</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetDbClick}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Reset Seluruh Database Sistem
                </button>
              </div>
            )}
          </div>

          {/* Right: Copyable GAS Instruction script */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-none">Template Kode Google Apps Script (GAS)</h3>
                  <p className="text-xs text-slate-400 mt-1.5">Salin kode di bawah ini, letakkan di Menu Extensions Apps Script pada Spreadsheet Anda, dan Deploy sebagai Web App.</p>
                </div>

                <button
                  onClick={handleCopyGasCode}
                  className="flex items-center gap-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 border rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{isCopied ? 'Tersalin' : 'Salin Kode'}</span>
                </button>
              </div>

              {/* Code container scrolling */}
              <div className="bg-slate-900 rounded-2xl p-4 overflow-x-auto border border-slate-800 text-left">
                <pre className="text-[10px] font-mono text-slate-300 leading-relaxed max-h-80 overflow-y-auto">
                  <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-150 text-[11px] text-slate-500 leading-relaxed">
              <strong>Catatan Autentikasi:</strong> Apps Script bertindak sebagai jembatan pembawa (API gateway) yang membaca/menulis data warga terenkripsi ke tab sheet USERS, WARGA, TRANSAKSI, TARGET_KAS, PENGUMUMAN, LOG_AKTIVITAS.
            </div>
          </div>
        </div>
      )}

      {/* TAB SUB 2: MANAGE STAFF ADMINISTRATORS */}
      {activeSubTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Kelola Pengurus RT (Staff Admin)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daftar staff bendahara RT dengan hak akses audit, pencatatan transaksi iuran, and pembuatan program.</p>
            </div>
            
            {isSuperAdmin && (
              <button
                onClick={() => setShowAddAdminModal(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3.5 rounded-xl text-xs font-semibold cursor-pointer transition shadow-xs"
              >
                <UserPlus className="h-4 w-4" /> Daftarkan Staff Baru
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.filter(u => u.role !== 'WARGA').map((adm) => (
              <div 
                key={adm.id} 
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-xs transition"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center font-bold">
                      {adm.role === 'SUPER_ADMIN' ? 'SA' : 'AD'}
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                      adm.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {adm.role}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{adm.nama}</h4>
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">Username: @{adm.username}</span>
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">No HP: {adm.no_hp}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t flex justify-end">
                  {isSuperAdmin && adm.username !== 'superadmin' ? (
                    <button
                      onClick={() => handleDeleteAdminClick(adm.id, adm.nama, adm.username)}
                      className="text-[10.5px] font-bold text-red-650 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 border border-red-100 rounded-xl cursor-pointer transition"
                    >
                      Hapus Akses Staff
                    </button>
                  ) : (
                    <span className="text-[9.5px] font-mono text-slate-400 italic">Pengguna Tetap Sistem</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB SUB 3: ACTIVITY LOGGER */}
      {activeSubTab === 'logs' && isSuperAdmin && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b bg-slate-50/50">
            <h3 className="text-sm font-extrabold text-slate-900">Audit Rekaman Log Aktivitas Pengguna</h3>
            <p className="text-xs text-slate-400 mt-0.5">Catatan audit log mencatat login masuk, operasi CRUD warga, input iuran, dan setting spreadsheet (Max 50 logs terakhir)</p>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {log_aktivitas.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2 hover:bg-slate-50/30 transition">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800">{log.aktivitas}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Oleh ID Staff: <strong className="text-slate-600">@{log.user}</strong></p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 shrink-0">
                  {new Date(log.waktu).toLocaleString('id-ID')}
                </span>
              </div>
            ))}

            {log_aktivitas.length === 0 && (
              <p className="text-xs text-slate-400 py-10 text-center">Belum ada aktivitas tercatat.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD ADMIN */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900 font-mono">Daftarkan Staff Admin Baru</h3>
              <button onClick={() => setShowAddAdminModal(false)} className="p-1 hover:bg-slate-200 rounded-xl transition cursor-pointer">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleAddAdminSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Nama Staff Lengkap</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  placeholder="Contoh: Heri Sunandar"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Username Log Masuk</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  placeholder="Contoh: heri_bendahara"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value.replace(/\s/g, ''))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Password Sandi</label>
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  placeholder="Password sandi..."
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Tanggung Jawab (Role)</label>
                <select
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value as any)}
                >
                  <option value="ADMIN">Admin (Bendahara Pembantu)</option>
                  <option value="SUPER_ADMIN">Super Admin (Wakil Ketua RT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-mono">Nomor Handphone</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900"
                  placeholder="Contoh: 0812..."
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1 py-3 text-xs font-semibold bg-slate-100 rounded-xl text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-semibold bg-emerald-600 rounded-xl text-white shadow-md cursor-pointer"
                >
                  Simpan Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
