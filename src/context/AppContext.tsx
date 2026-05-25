import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Warga, Transaksi, TargetKas, Pengumuman, LogAktivitas, UserRole } from '../types';
import { DatabaseService, AppState, getGasUrl, saveGasUrl } from '../services/api';

interface AppContextProps {
  user: User | null;
  state: AppState;
  loading: boolean;
  error: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  gasUrl: string;
  login: (usernameOrNik: string, passwordOrPhone: string) => Promise<boolean>;
  logout: () => void;
  setGasUrlConfig: (url: string) => Promise<boolean>;
  syncWithGas: () => Promise<boolean>;
  addWarga: (w: Omit<Warga, 'created_at'>) => Promise<void>;
  editWarga: (w: Warga) => Promise<void>;
  deleteWarga: (id: string) => Promise<void>;
  addTransaction: (t: Omit<Transaksi, 'id' | 'tanggal' | 'admin_input'>) => Promise<void>;
  editTransaction: (t: Transaksi) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addTargetKas: (t: Omit<TargetKas, 'id' | 'terkumpul'>) => Promise<void>;
  editTargetKas: (t: TargetKas) => Promise<void>;
  deleteTargetKas: (id: string) => Promise<void>;
  addPengumuman: (p: Omit<Pengumuman, 'id' | 'tanggal'>) => Promise<void>;
  editPengumuman: (p: Pengumuman) => Promise<void>;
  deletePengumuman: (id: string) => Promise<void>;
  addUser: (u: Omit<User, 'id' | 'created_at'>) => Promise<void>;
  editUser: (u: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetDatabase: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<AppState>(DatabaseService.loadLocalState());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gasUrl, setGasUrl] = useState<string>(getGasUrl());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Check login session in localStorage on mount
  useEffect(() => {
    const session = localStorage.getItem('tabungan_rt_session');
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch (e) {
        localStorage.removeItem('tabungan_rt_session');
      }
    }
    
    // Initial fetch from GAS if URL is present
    if (gasUrl) {
      loadDataFromGAS(gasUrl);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadDataFromGAS = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const gasState = await DatabaseService.fetchFromGas(url);
      if (gasState) {
        setState(gasState);
        DatabaseService.saveLocalState(gasState);
        showToast('Berhasil memuat data realtime dari Google Spreadsheet!', 'success');
      } else {
        setError('Format data Apps Script tidak valid. Menggunakan data lokal.');
        showToast('Format data Spreadsheet salah. Menampilkan data lokal.', 'error');
      }
    } catch (e) {
      setError('Gagal terhubung dengan Spreadsheet. Menggunakan data lokal offline.');
      showToast('Koneksi Apps Script gagal. Mode offline aktif.', 'info');
    } finally {
      setLoading(false);
    }
  };

  const login = async (usernameOrNik: string, passwordOrPhone: string): Promise<boolean> => {
    setLoading(true);
    try {
      // 1. Check Super Admin & Admin users first
      const adminUser = state.users.find(
        (u) => 
          u.username.toLowerCase() === usernameOrNik.toLowerCase() && 
          u.password === passwordOrPhone && 
          (u.role === 'SUPER_ADMIN' || u.role === 'ADMIN')
      );

      if (adminUser) {
        const loggedInUser = { ...adminUser };
        delete loggedInUser.password; // strip password for safety
        setUser(loggedInUser);
        localStorage.setItem('tabungan_rt_session', JSON.stringify(loggedInUser));
        
        // Add activity log
        const updated = DatabaseService.addLog(
          loggedInUser.username,
          `Login berhasil sebagai ${loggedInUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}`,
          state
        );
        setState(updated);
        
        showToast(`Selamat datang kembali, ${loggedInUser.nama}!`, 'success');
        setLoading(false);
        return true;
      }

      // 2. Check Warga user (Using NIK (id) OR no_hp & username matching)
      // NIK can be usernameOrNik, or no_hp can be passwordOrPhone
      const resident = state.warga.find(
        (w) => 
          (w.id === usernameOrNik || w.no_hp === usernameOrNik || w.no_hp === passwordOrPhone) &&
          w.status === 'Aktif'
      );

      if (resident) {
        const wargaUser: User = {
          id: `U-${resident.id}`,
          nama: resident.nama,
          username: resident.id,
          role: 'WARGA',
          no_hp: resident.no_hp,
          created_at: resident.created_at
        };
        setUser(wargaUser);
        localStorage.setItem('tabungan_rt_session', JSON.stringify(wargaUser));
        
        // Add activity log
        const updated = DatabaseService.addLog(
          wargaUser.username,
          `Login berhasil sebagai Warga (NIK: ${resident.id})`,
          state
        );
        setState(updated);

        showToast(`Selamat datang, Bpk/Ibu ${resident.nama}!`, 'success');
        setLoading(false);
        return true;
      }

      // Handle custom check if citizen is inactive
      const inactiveResident = state.warga.find(
        (w) => (w.id === usernameOrNik || w.no_hp === usernameOrNik) && w.status === 'Nonaktif'
      );
      if (inactiveResident) {
        showToast('Akun warga ini berstatus Nonaktif. Silakan hubungi RT.', 'error');
        setLoading(false);
        return false;
      }

      showToast('Login gagal! Periksa kembali Username/NIK atau Password/No HP.', 'error');
      setLoading(false);
      return false;
    } catch (e) {
      showToast('Terjadi kesalahan sistem saat login.', 'error');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    if (user) {
      const updated = DatabaseService.addLog(user.username, 'Melakukan logout dari sistem', state);
      setState(updated);
    }
    setUser(null);
    localStorage.removeItem('tabungan_rt_session');
    showToast('Anda telah logout dengan aman.', 'info');
  };

  const setGasUrlConfig = async (url: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (!url.trim()) {
        saveGasUrl('');
        setGasUrl('');
        showToast('Tautan API Google Sheets dinonaktifkan. Mode lokal aktif.', 'info');
        setLoading(false);
        return true;
      }

      // test fetch
      const testState = await DatabaseService.fetchFromGas(url);
      if (testState) {
        saveGasUrl(url);
        setGasUrl(url);
        setState(testState);
        DatabaseService.saveLocalState(testState);
        showToast('Berhasil terhubung ke Google Spreadsheet!', 'success');
        setLoading(false);
        return true;
      } else {
        showToast('Gagal memvalidasi data dari Apps Script. Periksa kode script Anda.', 'error');
        setLoading(false);
        return false;
      }
    } catch (e) {
      showToast('Koneksi ditolak atau URL salah. Pastikan deploy sebagai "Anyone".', 'error');
      setLoading(false);
      return false;
    }
  };

  const syncWithGas = async (): Promise<boolean> => {
    if (!gasUrl) {
      showToast('Gagal sinkronisasi: Tidak ada tautan API Google Sheets yang dikonfigurasi.', 'info');
      return false;
    }
    setLoading(true);
    try {
      const success = await DatabaseService.syncToGas(gasUrl, state);
      if (success) {
        showToast('Seluruh data berhasil disinkronkan ke Spreadsheet!', 'success');
        setLoading(false);
        return true;
      }
      throw new Error('Sync failed');
    } catch (e) {
      showToast('Sinkronisasi gagal. Menggunakan mode buffer lokal offline.', 'error');
      setLoading(false);
      return false;
    }
  };

  const autoSyncIfNeeded = async (updatedState: AppState) => {
    DatabaseService.saveLocalState(updatedState);
    if (gasUrl) {
      try {
        await DatabaseService.syncToGas(gasUrl, updatedState);
        console.log('Auto sync succeed');
      } catch (e) {
        console.warn('Auto sync failed, buffered locally', e);
      }
    }
  };

  // WARGA CRUD
  const addWarga = async (w: Omit<Warga, 'created_at'>) => {
    const newWarga: Warga = {
      ...w,
      created_at: new Date().toISOString()
    };
    
    // Also create matching login username for them automatically inside state.users list
    const matchingUser: User = {
      id: `U-${w.id}`,
      nama: w.nama,
      username: w.id, // NIK
      role: 'WARGA',
      no_hp: w.no_hp,
      created_at: new Date().toISOString()
    };

    const updatedState: AppState = {
      ...state,
      warga: [...state.warga, newWarga],
      users: [...state.users.filter(u => u.username !== w.id), matchingUser]
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Menambahkan warga baru: ${w.nama} (NIK: ${w.id})`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Warga ${w.nama} berhasil didaftarkan!`, 'success');
  };

  const editWarga = async (w: Warga) => {
    const updatedState: AppState = {
      ...state,
      warga: state.warga.map((item) => (item.id === w.id ? w : item)),
      // Sync names/phone numbers in users as well if their NIK is the same
      users: state.users.map((u) => {
        if (u.username === w.id) {
          return { ...u, nama: w.nama, no_hp: w.no_hp };
        }
        return u;
      })
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Mengubah data warga: ${w.nama} (${w.id})`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Data warga ${w.nama} berhasil diperbarui!`, 'success');
  };

  const deleteWarga = async (id: string) => {
    const targetWarga = state.warga.find((w) => w.id === id);
    if (!targetWarga) return;

    const updatedState: AppState = {
      ...state,
      warga: state.warga.filter((w) => w.id !== id),
      users: state.users.filter((u) => u.username !== id), // remove citizen user access
      // optionally clear transactions as well? We keep them for history or filter as inactive
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Menghapus warga: ${targetWarga.nama} (${id})`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Warga ${targetWarga.nama} berhasil dihapus dari sistem.`, 'info');
  };

  // TRANSAKSI CRUD
  const addTransaction = async (t: Omit<Transaksi, 'id' | 'tanggal' | 'admin_input'>) => {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    // Gen number TRX-YYYYMMDD-00X
    const sameDayTrxs = state.transaksi.filter(trx => trx.id.startsWith(`TRX-${todayStr}`));
    const nextSeq = sameDayTrxs.length + 1;
    const seqStr = String(nextSeq).padStart(3, '0');
    const trxId = `TRX-${todayStr}-${seqStr}`;

    const newTrx: Transaksi = {
      ...t,
      id: trxId,
      tanggal: new Date().toISOString().slice(0, 10),
      admin_input: user?.username || 'admin'
    };

    // Calculate effects on TARGET_KAS if there is relevant program matching transaction
    // (For example, setoran / donasi can reflect in increasing Target program's "terkumpul")
    let updatedTargetKas = [...state.target_kas];
    
    // Find matching citizens
    const citizen = state.warga.find(w => w.id === t.warga_id);
    const citizenName = citizen ? citizen.nama : 'Tidak Diketahui';

    const updatedState: AppState = {
      ...state,
      transaksi: [newTrx, ...state.transaksi],
      target_kas: updatedTargetKas
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Menginput transaksi ${t.tipe} Rp ${t.jumlah.toLocaleString('id-ID')} untuk ${citizenName} (${trxId})`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Transaksi ${trxId} berhasil disimpan!`, 'success');
  };

  const editTransaction = async (t: Transaksi) => {
    const updatedState: AppState = {
      ...state,
      transaksi: state.transaksi.map((item) => (item.id === t.id ? t : item))
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Mengubah data transaksi ${t.id}`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Transaksi ${t.id} berhasil diperbarui!`, 'success');
  };

  const deleteTransaction = async (id: string) => {
    const targetTrx = state.transaksi.find((t) => t.id === id);
    if (!targetTrx) return;

    const updatedState: AppState = {
      ...state,
      transaksi: state.transaksi.filter((t) => t.id !== id)
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Menghapus transaksi ${id} sebesar Rp ${targetTrx.jumlah.toLocaleString('id-ID')}`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Transaksi ${id} berhasil dihapus.`, 'info');
  };

  // TARGET KAS CRUD
  const addTargetKas = async (t: Omit<TargetKas, 'id' | 'terkumpul'>) => {
    const id = `TGT-${Date.now()}`;
    const newTarget: TargetKas = {
      ...t,
      id,
      terkumpul: 0
    };

    const updatedState: AppState = {
      ...state,
      target_kas: [...state.target_kas, newTarget]
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Membuat target program kas RT baru: "${t.nama_program}"`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Program target ${t.nama_program} berhasil didaftarkan!`, 'success');
  };

  const editTargetKas = async (t: TargetKas) => {
    const updatedState: AppState = {
      ...state,
      target_kas: state.target_kas.map((item) => (item.id === t.id ? t : item))
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Mengubah target kas "${t.nama_program}" menjadi ${t.status}`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Program target ${t.nama_program} berhasil diperbarui!`, 'success');
  };

  const deleteTargetKas = async (id: string) => {
    const target = state.target_kas.find((t) => t.id === id);
    if (!target) return;

    const updatedState: AppState = {
      ...state,
      target_kas: state.target_kas.filter((t) => t.id !== id)
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Menghapus program target kas "${target.nama_program}"`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Program ${target.nama_program} berhasil dihapus.`, 'info');
  };

  // PENGUMUMAN CRUD
  const addPengumuman = async (p: Omit<Pengumuman, 'id' | 'tanggal'>) => {
    const id = `ANN-${Date.now()}`;
    const newAnn: Pengumuman = {
      ...p,
      id,
      tanggal: new Date().toISOString().slice(0, 10)
    };

    const updatedState: AppState = {
      ...state,
      pengumuman: [newAnn, ...state.pengumuman]
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Menyebarkan pengumuman baru: "${p.judul}"`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Pengumuman "${p.judul}" berhasil dipublikasikan!`, 'success');
  };

  const editPengumuman = async (p: Pengumuman) => {
    const updatedState: AppState = {
      ...state,
      pengumuman: state.pengumuman.map((item) => (item.id === p.id ? p : item))
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Mengubah pengumuman "${p.judul}"`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Pengumuman "${p.judul}" berhasil diperbarui!`, 'success');
  };

  const deletePengumuman = async (id: string) => {
    const target = state.pengumuman.find((p) => p.id === id);
    if (!target) return;

    const updatedState: AppState = {
      ...state,
      pengumuman: state.pengumuman.filter((p) => p.id !== id)
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Menghapus pengumuman "${target.judul}"`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Pengumuman berhasil dihapus.`, 'info');
  };

  // USERS CRUD
  const addUser = async (u: Omit<User, 'id' | 'created_at'>) => {
    const id = `USR-${Date.now()}`;
    const newUser: User = {
      ...u,
      id,
      created_at: new Date().toISOString()
    };

    const updatedState: AppState = {
      ...state,
      users: [...state.users, newUser]
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Mendaftarkan Admin sistem baru: ${u.nama} (@${u.username})`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Admin ${u.nama} berhasil didaftarkan!`, 'success');
  };

  const editUser = async (u: User) => {
    const updatedState: AppState = {
      ...state,
      users: state.users.map((item) => (item.id === u.id ? u : item))
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Mengubah data pengguna ${u.nama} (@${u.username})`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Data pengguna ${u.nama} berhasil diperbarui!`, 'success');
  };

  const deleteUser = async (id: string) => {
    const target = state.users.find((u) => u.id === id);
    if (!target) return;

    if (target.username === 'superadmin') {
      showToast('Super Admin bawaan tidak dapat dihapus!', 'error');
      return;
    }

    const updatedState: AppState = {
      ...state,
      users: state.users.filter((u) => u.id !== id)
    };

    const finalState = DatabaseService.addLog(
      user?.username || 'system',
      `Menghapus pengguna ${target.nama} (@${target.username})`,
      updatedState
    );

    setState(finalState);
    await autoSyncIfNeeded(finalState);
    showToast(`Pengguna ${target.nama} berhasil dihapus.`, 'info');
  };

  const resetDatabase = () => {
    const freshState = DatabaseService.resetDatabase();
    setState(freshState);
    // Logout simple reset
    setUser(null);
    localStorage.removeItem('tabungan_rt_session');
    showToast('Database sistem berhasil direset ke pengaturan umum!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        state,
        loading,
        error,
        toast,
        gasUrl,
        login,
        logout,
        setGasUrlConfig,
        syncWithGas,
        addWarga,
        editWarga,
        deleteWarga,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addTargetKas,
        editTargetKas,
        deleteTargetKas,
        addPengumuman,
        editPengumuman,
        deletePengumuman,
        addUser,
        editUser,
        deleteUser,
        resetDatabase,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
