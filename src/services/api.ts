import { User, Warga, Transaksi, TargetKas, Pengumuman, LogAktivitas, KategoriTransaksi } from '../types';

const STORAGE_KEYS = {
  GAS_URL: 'tabungan_rt_gas_url',
  USERS: 'tabungan_rt_users',
  WARGA: 'tabungan_rt_warga',
  TRANSAKSI: 'tabungan_rt_transaksi',
  TARGET_KAS: 'tabungan_rt_targets',
  PENGUMUMAN: 'tabungan_rt_announcements',
  LOG_AKTIVITAS: 'tabungan_rt_logs',
  KATEGORI: 'tabungan_rt_categories',
};

// INITIAL TRANSACTION CATEGORIES
const INITIAL_KATEGORI: KategoriTransaksi[] = [
  {
    id: 'KAT-001',
    nama: 'Setoran Tabungan Sukarela',
    tipe: 'Setoran',
    deskripsi: 'Setoran tabungan sukarela berkala dari warga',
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'KAT-002',
    nama: 'Penarikan Tabungan Mandiri',
    tipe: 'Penarikan',
    deskripsi: 'Penarikan dana tabungan mandiri warga',
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'KAT-003',
    nama: 'Iuran Kebersihan & Keamanan',
    tipe: 'Iuran',
    deskripsi: 'Iuran wajib bulanan kelayakan lingkungan RT',
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'KAT-004',
    nama: 'Sumbangan Kas Sosial Pos Ronda',
    tipe: 'Iuran',
    deskripsi: 'Iuran sukarela pos pelayanan warga',
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'KAT-005',
    nama: 'Donasi Yatim & Bakti Sosial',
    tipe: 'Donasi',
    deskripsi: 'Santunan anak yatim piatu dan bakti sosial',
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'KAT-006',
    nama: 'Santunan Duka Cita Warga',
    tipe: 'Kas Sosial',
    deskripsi: 'Sumbangan uang duka cita tertimpa musibah',
    created_at: '2026-01-01T08:00:00Z',
  },
];

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
    password: 'password123',
    created_at: '2026-01-10T14:20:00Z',
  },
  {
    id: '3374110502880002',
    nama: 'Anisa Lestari',
    alamat: 'Jl. Anggrek No. 15, RT 03/RW 04',
    no_hp: '081399887766',
    status: 'Aktif',
    password: 'password123',
    created_at: '2026-01-12T10:15:00Z',
  },
  {
    id: '3374110502880003',
    nama: 'Bambang Wijaya',
    alamat: 'Jl. Mawar No. 3A, RT 03/RW 04',
    no_hp: '081288223344',
    status: 'Aktif',
    password: 'password123',
    created_at: '2026-01-15T11:00:00Z',
  },
  {
    id: '3374110502880004',
    nama: 'Dewi Chandrawati',
    alamat: 'Jl. Anggrek No. 19, RT 03/RW 04',
    no_hp: '081255556666',
    status: 'Aktif',
    password: 'password123',
    created_at: '2026-01-18T16:45:00Z',
  },
  {
    id: '3374110502880005',
    nama: 'Joko Supriyanto',
    alamat: 'Jl. Melati No. 42, RT 03/RW 04',
    no_hp: '085600001111',
    status: 'Nonaktif',
    password: 'password123',
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
  kategori: KategoriTransaksi[];
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

// Helper to implement abortable timeout fetch
async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}): Promise<Response> {
  const { timeout = 12000 } = options; 
  const controller = new AbortController();
  const id = setTimeout(() => {
    console.warn(`[API Trace] Fetch request to ${url} timed out after ${timeout}ms. Aborting.`);
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

// Global robust Google Apps Script requester with retry & timeout wrappers
export async function requestGasWithRetry(
  url: string,
  method: 'GET' | 'POST',
  action: string,
  payload: any = null,
  retries: number = 3,
  delayMs: number = 1000
): Promise<any> {
  if (!url || typeof url !== 'string' || !url.trim().startsWith('https://script.google.com/')) {
    console.error('[API Trace] Invalid Google Apps Script URL:', url);
    throw new Error('Endpoint URL Google Apps Script tidak valid. Harap periksa lembar pengaturan.');
  }

  const sanitizedUrl = url.trim();
  let attempt = 0;

  while (attempt < retries) {
    attempt++;
    console.log(`[API Trace] [Attempt ${attempt}/${retries}] Calling action "${action}" via ${method}`);

    try {
      let targetUrl = sanitizedUrl;
      const finalOptions: RequestInit = {
        method,
        mode: 'cors',
        credentials: 'omit', // Bypasses browser SameSite cookie policy and third-party restrictions
      };

      if (method === 'GET') {
        const queryParams = new URLSearchParams();
        queryParams.set('action', action);
        if (payload) {
          queryParams.set('payload', JSON.stringify(payload));
        }
        queryParams.set('_nocache', Date.now().toString()); // cache busting to secure fresh data

        targetUrl = targetUrl.includes('?') ? `${targetUrl}&${queryParams.toString()}` : `${targetUrl}?${queryParams.toString()}`;
      } else {
        // Simple POST Content-Type request avoids CORS preflight OPTIONS pre-check on Chrome/Firefox
        finalOptions.headers = {
          'Content-Type': 'text/plain;charset=utf-8'
        };
        finalOptions.body = JSON.stringify({
          action,
          payload,
          client_user: 'system'
        });
      }

      const response = await fetchWithTimeout(targetUrl, { ...finalOptions, timeout: method === 'GET' ? 12000 : 18000 });

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      const text = await response.text();
      let resData;
      try {
        resData = JSON.parse(text);
      } catch (jsonErr) {
        console.error('[API Trace] Non-JSON payload received from Apps Script:', text);
        throw new Error('Format response dari Google Apps Script tidak valid (Bukan JSON).');
      }

      if (resData && resData.success) {
        console.log(`[API Trace] Action "${action}" completed successfully on attempt ${attempt}.`);
        return resData.data;
      } else {
        const errorMsg = resData?.message || 'Apps Script returning success:false';
        console.warn(`[API Trace] Apps Script returned failure on action "${action}":`, errorMsg);
        throw new Error(errorMsg);
      }

    } catch (err: any) {
      console.error(`[API Trace] Attempt ${attempt} failed:`, err.message || err);
      if (attempt >= retries) {
        throw err;
      }
      const waitTime = delayMs * attempt;
      console.log(`[API Trace] Reconnecting in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Helper to compute digital balance for any citizen (Setoran - Penarikan)
export function calculateCitizenBalance(citizenId: string, transactions: Transaksi[]): number {
  if (!citizenId) return 0;
  const idStr = String(citizenId).trim();
  const personalTrxs = transactions.filter(t => String(t.warga_id).trim() === idStr);

  const deposits = personalTrxs
    .filter(t => t.tipe === 'Setoran')
    .reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);

  const withdraws = personalTrxs
    .filter(t => t.tipe === 'Penarikan')
    .reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);

  return deposits - withdraws;
}

// Core DB operations that check for Google Sheets integration
export class DatabaseService {
  
  static loadLocalState(): AppState {
    const rawWarga = getLocalData(STORAGE_KEYS.WARGA, INITIAL_WARGA);
    const sanitizedWarga = rawWarga.map((w) => ({
      ...w,
      password: w.password || 'password123'
    }));
    return {
      users: getLocalData(STORAGE_KEYS.USERS, INITIAL_USERS),
      warga: sanitizedWarga,
      transaksi: getLocalData(STORAGE_KEYS.TRANSAKSI, INITIAL_TRANSAKSI),
      target_kas: getLocalData(STORAGE_KEYS.TARGET_KAS, INITIAL_TARGET_KAS),
      pengumuman: getLocalData(STORAGE_KEYS.PENGUMUMAN, INITIAL_PENGUMUMAN),
      log_aktivitas: getLocalData(STORAGE_KEYS.LOG_AKTIVITAS, INITIAL_LOGS),
      kategori: getLocalData(STORAGE_KEYS.KATEGORI, INITIAL_KATEGORI),
    };
  }

  static saveLocalState(state: AppState) {
    saveLocalData(STORAGE_KEYS.USERS, state.users);
    saveLocalData(STORAGE_KEYS.WARGA, state.warga);
    saveLocalData(STORAGE_KEYS.TRANSAKSI, state.transaksi);
    saveLocalData(STORAGE_KEYS.TARGET_KAS, state.target_kas);
    saveLocalData(STORAGE_KEYS.PENGUMUMAN, state.pengumuman);
    saveLocalData(STORAGE_KEYS.LOG_AKTIVITAS, state.log_aktivitas);
    saveLocalData(STORAGE_KEYS.KATEGORI, state.kategori);
  }

  static async fetchFromGas(url: string): Promise<AppState | null> {
    try {
      const data = await requestGasWithRetry(url, 'GET', 'get_all') as AppState;
      if (data) {
        // Coerce all IDs to string to prevent any auto-numeric mismatch issues
        if (data.warga) {
          data.warga = data.warga.map(w => ({ ...w, id: String(w.id).trim(), no_hp: String(w.no_hp).trim() }));
        }
        if (data.transaksi) {
          data.transaksi = data.transaksi.map(t => ({ ...t, warga_id: String(t.warga_id).trim() }));
        }
        if (data.users) {
          data.users = data.users.map(u => ({ ...u, username: String(u.username).trim() }));
        }
        return data;
      }
      return null;
    } catch (e) {
      console.error('[API Trace] fetchFromGas failed:', e);
      throw e;
    }
  }

  static async syncToGas(url: string, state: AppState): Promise<boolean> {
    try {
      await requestGasWithRetry(url, 'POST', 'sync_all', state);
      return true;
    } catch (e) {
      console.error('[API Trace] syncToGas failed:', e);
      return false;
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
    localStorage.removeItem(STORAGE_KEYS.KATEGORI);
    
    const defaultState: AppState = {
      users: INITIAL_USERS,
      warga: INITIAL_WARGA,
      transaksi: INITIAL_TRANSAKSI,
      target_kas: INITIAL_TARGET_KAS,
      pengumuman: INITIAL_PENGUMUMAN,
      log_aktivitas: INITIAL_LOGS,
      kategori: INITIAL_KATEGORI
    };
    
    this.saveLocalState(defaultState);
    return defaultState;
  }
}
