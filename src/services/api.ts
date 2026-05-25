import { User, Warga, Transaksi, TargetKas, Pengumuman, LogAktivitas } from '../types';

const STORAGE_KEYS = {
  GAS_URL: 'tabungan_rt_gas_url',
  USERS: 'tabungan_rt_users',
  WARGA: 'tabungan_rt_warga',
  TRANSAKSI: 'tabungan_rt_transaksi',
  TARGET_KAS: 'tabungan_rt_targets',
  PENGUMUMAN: 'tabungan_rt_announcements',
  LOG_AKTIVITAS: 'tabungan_rt_logs',
};

// INITIAL BOOTSTRAP DATA INDONESIAN METROPOLIS RT 03/04
const INITIAL_USERS: User[] = [
  {
    id: 'U-001',
    nama: 'Budi Setyawan (Ketua RT)',
    username: 'superadmin',
    password: 'password123',
    role: 'SUPER_ADMIN',
    no_hp: '081234567890',
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'U-002',
    nama: 'Siti Rahayu (Bendahara RT)',
    username: 'admin',
    password: 'password123',
    role: 'ADMIN',
    no_hp: '081298765432',
    created_at: '2026-01-02T09:30:00Z',
  },
  {
    id: 'U-03374110502880001',
    nama: 'Prasetyo Utomo',
    username: '3374110502880001',
    role: 'WARGA',
    no_hp: '081344556677',
    created_at: '2026-01-10T14:20:00Z',
  },
];

const INITIAL_WARGA: Warga[] = [
  {
    id: '3374110502880001',
    nama: 'Prasetyo Utomo',
    alamat: 'Jl. Anggrek No. 12, RT 03/RW 04',
    no_hp: '081344556677',
    status: 'Aktif',
    created_at: '2026-01-10T14:20:00Z',
  },
  {
    id: '3374110502880002',
    nama: 'Anisa Lestari',
    alamat: 'Jl. Anggrek No. 15, RT 03/RW 04',
    no_hp: '081399887766',
    status: 'Aktif',
    created_at: '2026-01-12T10:15:00Z',
  },
  {
    id: '3374110502880003',
    nama: 'Bambang Wijaya',
    alamat: 'Jl. Mawar No. 3A, RT 03/RW 04',
    no_hp: '081288223344',
    status: 'Aktif',
    created_at: '2026-01-15T11:00:00Z',
  },
  {
    id: '3374110502880004',
    nama: 'Dewi Chandrawati',
    alamat: 'Jl. Anggrek No. 19, RT 03/RW 04',
    no_hp: '081255556666',
    status: 'Aktif',
    created_at: '2026-01-18T16:45:00Z',
  },
  {
    id: '3374110502880005',
    nama: 'Joko Supriyanto',
    alamat: 'Jl. Melati No. 42, RT 03/RW 04',
    no_hp: '085600001111',
    status: 'Nonaktif',
    created_at: '2026-01-20T09:00:00Z',
  }
];

const INITIAL_TRANSAKSI: Transaksi[] = [
  {
    id: 'TRX-20260501-001',
    tanggal: '2026-05-01',
    warga_id: '3374110502880001',
    tipe: 'Setoran',
    jumlah: 500000,
    keterangan: 'Setoran tabungan sukarela awal Mei',
    admin_input: 'admin',
  },
  {
    id: 'TRX-20260502-001',
    tanggal: '2026-05-02',
    warga_id: '3374110502880002',
    tipe: 'Iuran',
    jumlah: 50000,
    keterangan: 'Iuran Kebersihan & Keamanan Bulanan Mei',
    admin_input: 'admin',
  },
  {
    id: 'TRX-20260505-001',
    tanggal: '2026-05-05',
    warga_id: '3374110502880003',
    tipe: 'Donasi',
    jumlah: 1000000,
    keterangan: 'Sumbangan Santunan Anak Yatim',
    admin_input: 'superadmin',
  },
  {
    id: 'TRX-20260510-001',
    tanggal: '2026-05-10',
    warga_id: '3374110502880001',
    tipe: 'Penarikan',
    jumlah: 200000,
    keterangan: 'Penarikan tabungan darurat rumah tangga',
    admin_input: 'admin',
  },
  {
    id: 'TRX-20260515-001',
    tanggal: '2026-05-15',
    warga_id: '3374110502880004',
    tipe: 'Kas Sosial',
    jumlah: 300000,
    keterangan: 'Iuran Kas Sosial duka cita warga tetangga',
    admin_input: 'superadmin',
  },
  {
    id: 'TRX-20260518-001',
    tanggal: '2026-05-18',
    warga_id: '3374110502880002',
    tipe: 'Setoran',
    jumlah: 150000,
    keterangan: 'Setoran pembangunan pos ronda baru',
    admin_input: 'admin',
  },
  {
    id: 'TRX-20260520-001',
    tanggal: '2026-05-20',
    warga_id: '3374110502880003',
    tipe: 'Iuran',
    jumlah: 50000,
    keterangan: 'Iuran Kebersihan & Keamanan Bulanan Mei',
    admin_input: 'admin',
  }
];

const INITIAL_TARGET_KAS: TargetKas[] = [
  {
    id: 'TGT-001',
    nama_program: 'Pembangunan Pos Satpam RT 03',
    kategori: 'pembangunan',
    target: 15000000,
    terkumpul: 12500000,
    status: 'aktif',
    deadline: '2026-06-30',
  },
  {
    id: 'TGT-002',
    nama_program: 'Pengadaan Inventaris Tenda & Kursi RT',
    kategori: 'kegiatan',
    target: 8000000,
    terkumpul: 8200000,
    status: 'tercapai',
    deadline: '2026-05-15',
  },
  {
    id: 'TGT-003',
    nama_program: 'Santunan Sembako Darurat Warga Isoman',
    kategori: 'darurat',
    target: 5000000,
    terkumpul: 3400000,
    status: 'aktif',
    deadline: '2026-07-10',
  },
  {
    id: 'TGT-004',
    nama_program: 'Piknik Bersama Warga RT 03 ke JungleLand',
    kategori: 'kegiatan',
    target: 12000000,
    terkumpul: 0,
    status: 'batal',
    deadline: '2026-08-01',
  },
];

const INITIAL_PENGUMUMAN: Pengumuman[] = [
  {
    id: 'ANN-001',
    judul: 'Kerja Bakti Akbar Menyambut HUT RI',
    isi: 'Dihimbau kepada seluruh warga RT 03/RW 04 untuk dapat berpartisipasi dalam kegiatan kerja bakti lingkungan menyambut HUT RI pada hari Minggu besok pukul 06.30 WIB sampai selesai. Harap membawa peralatan kebersihan masing-masing. Hidangan ringan disediakan oleh Ibu-Ibu PKK.',
    tanggal: '2026-05-24',
  },
  {
    id: 'ANN-002',
    judul: 'Sosialisasi Keamanan Lingkungan & CCTV RT',
    isi: 'Akan diadakan pertemuan warga pada hari Jumat tanggal 29 Mei 2026 pukul 19.30 WIB di Saung RT atau Pos Ronda Utama. Agenda utama meliputi sosialisasi pembatasan portal keamanan baru malam hari dan rencana pengadaan titik kamera CCTV tambahan di wilayah rawan.',
    tanggal: '2026-05-22',
  },
];

const INITIAL_LOGS: LogAktivitas[] = [
  {
    id: 'LOG-001',
    user: 'superadmin',
    aktivitas: 'Menginisialisasi sistem database Tabungan Warga RT 03.',
    waktu: '2026-05-25T10:00:00Z',
  },
  {
    id: 'LOG-002',
    user: 'admin',
    aktivitas: 'Mendaftarkan warga baru: Prasetyo Utomo',
    waktu: '2026-05-25T11:30:00Z',
  },
  {
    id: 'LOG-003',
    user: 'admin',
    aktivitas: 'Menginput setoran tunai Prasetyo Utomo sebesar Rp 500.000 (TRX-20260501-001)',
    waktu: '2026-05-25T12:15:00Z',
  },
];

export interface AppState {
  users: User[];
  warga: Warga[];
  transaksi: Transaksi[];
  target_kas: TargetKas[];
  pengumuman: Pengumuman[];
  log_aktivitas: LogAktivitas[];
}

export function getLocalData<T>(key: string, initial: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initial;
  }
}

export function saveLocalData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Check if Apps Script is connected
export function getGasUrl(): string {
  return localStorage.getItem(STORAGE_KEYS.GAS_URL) || '';
}

export function saveGasUrl(url: string): void {
  localStorage.setItem(STORAGE_KEYS.GAS_URL, url);
}

// Core DB operations that check for Google Sheets integration
export class DatabaseService {
  
  static loadLocalState(): AppState {
    return {
      users: getLocalData(STORAGE_KEYS.USERS, INITIAL_USERS),
      warga: getLocalData(STORAGE_KEYS.WARGA, INITIAL_WARGA),
      transaksi: getLocalData(STORAGE_KEYS.TRANSAKSI, INITIAL_TRANSAKSI),
      target_kas: getLocalData(STORAGE_KEYS.TARGET_KAS, INITIAL_TARGET_KAS),
      pengumuman: getLocalData(STORAGE_KEYS.PENGUMUMAN, INITIAL_PENGUMUMAN),
      log_aktivitas: getLocalData(STORAGE_KEYS.LOG_AKTIVITAS, INITIAL_LOGS),
    };
  }

  static saveLocalState(state: AppState) {
    saveLocalData(STORAGE_KEYS.USERS, state.users);
    saveLocalData(STORAGE_KEYS.WARGA, state.warga);
    saveLocalData(STORAGE_KEYS.TRANSAKSI, state.transaksi);
    saveLocalData(STORAGE_KEYS.TARGET_KAS, state.target_kas);
    saveLocalData(STORAGE_KEYS.PENGUMUMAN, state.pengumuman);
    saveLocalData(STORAGE_KEYS.LOG_AKTIVITAS, state.log_aktivitas);
  }

  static async fetchFromGas(url: string): Promise<AppState | null> {
    try {
      // GAS Web Apps require redirection handling, fetch automatically handles redirects by default in browsers.
      // We append ?action=get_all to GET
      const targetUrl = `${url}?action=get_all`;
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error(`HTTP status error: ${response.status}`);
      const resData = await response.json();
      if (resData && resData.success && resData.data) {
        return resData.data as AppState;
      }
      return null;
    } catch (e) {
      console.error('Error fetching from GAS Web App:', e);
      throw e;
    }
  }

  static async syncToGas(url: string, state: AppState): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'no-cors', // standard workaround for direct GAS POST requests from client side without complex CORS config
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync_all',
          payload: state
        })
      });
      // with no-cors, the response is opaque, we won't get body data, but if it doesn't throw, it likely succeeded.
      return true;
    } catch (e) {
      console.error('Error syncing with GAS Web App:', e);
      // fallback POST with normal CORS in case user deployed a CORS-friendly wrapper (or custom proxy)
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'sync_all',
            payload: state
          })
        });
        const resData = await response.json();
        return !!resData.success;
      } catch (innerError) {
        throw innerError;
      }
    }
  }

  static addLog(user: string, aktivitas: string, currentState: AppState): AppState {
    const newLog: LogAktivitas = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user,
      aktivitas,
      waktu: new Date().toISOString()
    };
    const updatedState = {
      ...currentState,
      log_aktivitas: [newLog, ...currentState.log_aktivitas].slice(0, 500) // limit to 500 logs
    };
    this.saveLocalState(updatedState);
    return updatedState;
  }

  static resetDatabase(): AppState {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.WARGA);
    localStorage.removeItem(STORAGE_KEYS.TRANSAKSI);
    localStorage.removeItem(STORAGE_KEYS.TARGET_KAS);
    localStorage.removeItem(STORAGE_KEYS.PENGUMUMAN);
    localStorage.removeItem(STORAGE_KEYS.LOG_AKTIVITAS);
    
    const defaultState: AppState = {
      users: INITIAL_USERS,
      warga: INITIAL_WARGA,
      transaksi: INITIAL_TRANSAKSI,
      target_kas: INITIAL_TARGET_KAS,
      pengumuman: INITIAL_PENGUMUMAN,
      log_aktivitas: INITIAL_LOGS
    };
    
    this.saveLocalState(defaultState);
    return defaultState;
  }
}
