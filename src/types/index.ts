export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'WARGA';

export interface User {
  id: string;
  nama: string;
  username: string;
  password?: string;
  role: UserRole;
  no_hp: string;
  created_at: string;
}

export interface Warga {
  id: string; // can match NIK or generate custom WA-XXX
  nama: string;
  alamat: string;
  no_hp: string;
  status: 'Aktif' | 'Nonaktif';
  password?: string;
  created_at: string;
}

export interface Transaksi {
  id: string; // TRX-YYYYMMDD-00X
  tanggal: string;
  warga_id: string;
  tipe: 'Setoran' | 'Penarikan' | 'Iuran' | 'Donasi' | 'Kas Sosial';
  kategori_id?: string; // Reference to dynamic category
  jumlah: number;
  keterangan: string;
  admin_input: string; // username of admin
}

export interface KategoriTransaksi {
  id: string;
  nama: string;
  tipe: 'Setoran' | 'Penarikan' | 'Iuran' | 'Donasi' | 'Kas Sosial';
  deskripsi?: string;
  created_at: string;
}

export interface TargetKas {
  id: string;
  nama_program: string;
  kategori: 'pembangunan' | 'sosial' | 'kegiatan' | 'darurat';
  target: number;
  terkumpul: number;
  status: 'aktif' | 'tercapai' | 'batal';
  deadline: string;
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
}

export interface LogAktivitas {
  id: string;
  user: string;
  aktivitas: string;
  waktu: string;
}
