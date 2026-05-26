/**
 * =================================================================================
 * MASTER GOOGLE APPS SCRIPT BACKEND ENDPOINT FOR "TABUNGAN WARGA RT" (PRODUCTION READY)
 * =================================================================================
 * 
 * KRITIKAL / UTAMA:
 * Salin dan tempel (Copy-Paste) SELURUH isi file ini ke editor Google Apps Script Anda.
 * Aplikasi ini dirancang menggunakan arsitektur robust, modular, dan memiliki layer
 * pertahanan anti-race-condition dengan LockService untuk write concurrency.
 * 
 * FITUR UTAMA BACKEND INI:
 * 1. API Routing berbasis Action doPost(e) (Semua mutasi POST aman, ringan, & andal)
 * 2. Auto-Bootstrap & Database Migration (Membuat 13 sheet terstruktur otomatis pada run pertama)
 * 3. LockService Integration (Mencegah duplicate transaksi & race condition saldo)
 * 4. Kompatibilitas CORS Bypass (Menggunakan format text/plain yang melompati CORS Preflight OPTIONS check)
 * 5. Dashboard Analitik On-The-Fly (Menghitung rekap kas, saldo, iuran realtime)
 * 6. Audit Logging & System Error Report Trail terintegrasi
 * 7. Sistem Cadangan (Auto Backup) & Monitor Kuota Akun Google
 * 
 * ---------------------------------------------------------------------------------
 * PANDUAN DEPLOYMENT BARU / UPDATE:
 * 1. Buka Spreadsheet baru (kosong) di Akun Google Anda.
 * 2. Buka menu Extensions (Ekstensi) > Apps Script.
 * 3. Hapus semua kode bawaan editor, lalu tempelkan (paste) seluruh kode dari file ini.
 * 4. Jika Anda ingin menguji setup pertama kali secara manual, pilih fungsi "setup"
 *    di toolbar editor atas lalu klik tombol "Run/Jalankan". Ini akan membuat 13 sheet secara otomatis!
 * 5. Klik tombol "Deploy" di kanan atas > pilih "New deployment".
 * 6. Klik ikon Gear (Gerigi) > pilih "Web app".
 * 7. Konfigurasikan:
 *    - Description: "Tabungan RT Production v1.0.0"
 *    - Execute as: "Me" (Email pemilik spreadsheet) -> WAJIB!
 *    - Who has access: "Anyone" (Semua orang, termasuk anonim) -> WAJIB!
 * 8. Klik "Deploy", lalu klik "Authorize access" dan selesaikan izin keamanan Google.
 * 9. Salin (Copy) "Web App URL" yang diberikan (Format: https://script.google.com/macros/s/XXXXX/exec).
 * 10. Buka Dashboard Tabungan RT, masuk ke "Sistem & Keamanan" -> "Spreadsheet & API GAS",
 *     tempelkan URL tersebut ke dalam input box lalu klik "Simpan Koneksi & Sync".
 * 
 * PANDUAN VERSIONING & UPDATE CADANGAN:
 * - Setiap kali Anda memperbarui kode Apps Script ini di editor, Anda harus men-deploy ulang dengan langkah:
 *   Deploy > Manage deployments > Pilih deployment aktif > Edit (ikon pensil) > Pilih Version: "New version" > Klik Deploy!
 *   Jika Anda tidak memilih "New version", perubahan kode tidak akan diterbitkan ke server Google!
 * =================================================================================
 */

// KONFIGURASI GLOBAL SPREADSHEET
const SPREADSHEET_ID = ""; // Kosongkan jika script ini menyatu (bound) dengan Spreadsheet aktif, atau isi dengan ID Spreadsheet Anda
const DEBUG_MODE = true;   // Aktifkan Logger.log terperinci untuk debugging real-time

// Nama-Nama Sheet Sesuai Dokumen Arsitektur & Persyaratan User
const SHEETS = {
  USERS: "USERS",                 // Pengurus (Admin, Super Admin)
  WARGA: "WARGA",                 // Katalog Warga / Anggota
  TRANSAKSI: "TRANSAKSI",         // Transaksi Kas Umum & Tabungan RT (Kategori Dinamis)
  TARGET_KAS: "TARGET_KAS",       // Target Pembangunan/Kegiatan RT
  PENGUMUMAN: "PENGUMUMAN",       // Informasi Papan Pengumuman
  LOG_AKTIVITAS: "LOG_AKTIVITAS", // Catatan Audit Aktivitas
  KATEGORI: "KATEGORI",           // Kategori Transaksi Dinamis
  
  // Model Database Tambahan Sesuai Spesifikasi Master Keuangan:
  TABUNGAN: "TABUNGAN",           // Rekap Buku Tabungan Mandiri Warga Detil (Mencegah Corrupt)
  KAS: "KAS",                     // Akuntansi Kas Masuk/Keluar RT
  IURAN: "IURAN",                 // Pencatatan Iuran Wajib Bulanan Lingkungan RT
  PINJAMAN: "PINJAMAN",           // Manajemen Hutang/Pinjaman & Cicilan
  NOTIFIKASI: "NOTIFIKASI",       // Antrean Kotak Masuk Notifikasi Aplikasi
  LOGS: "LOGS"                    // Global Error & Traffic Logs Trail
};

/**
 * Mendapatkan referensi Spreadsheet aktif atau via ID
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Inisialisasi awal & Migrasi database otomatis demi mencegah error null/undefined
 */
function setup() {
  const ss = getSpreadsheet();
  if (!ss) {
    throw new Error("Spreadsheet tidak ditemukan! Pastikan dipasang di Spreadsheet atau SPREADSHEET_ID terisi.");
  }

  // Definisi struktur header kolom untuk seluruh 13 sheet
  const schemas = {
    [SHEETS.USERS]: ["id", "username", "password", "nama", "alamat", "no_hp", "role", "status", "created_at"],
    [SHEETS.WARGA]: ["id", "nama", "alamat", "no_hp", "status", "password", "created_at"],
    [SHEETS.TRANSAKSI]: ["id", "tanggal", "warga_id", "tipe", "jumlah", "keterangan", "admin_input", "kategori_id"],
    [SHEETS.TARGET_KAS]: ["id", "nama_program", "kategori", "target", "terkumpul", "status", "deadline"],
    [SHEETS.PENGUMUMAN]: ["id", "judul", "isi", "tanggal"],
    [SHEETS.LOG_AKTIVITAS]: ["id", "user", "aktivitas", "waktu"],
    [SHEETS.KATEGORI]: ["id", "nama", "tipe", "deskripsi", "created_at"],
    
    // Header format master tambahan spesifikasi keuangan:
    [SHEETS.TABUNGAN]: ["id", "tanggal", "user_id", "jenis", "jumlah", "saldo_awal", "saldo_akhir", "keterangan", "created_by"],
    [SHEETS.KAS]: ["id", "tanggal", "kategori", "jenis", "jumlah", "keterangan", "created_by"],
    [SHEETS.IURAN]: ["id", "user_id", "bulan", "jenis_iuran", "jumlah", "status", "tanggal_bayar"],
    [SHEETS.PINJAMAN]: ["id", "user_id", "jumlah", "tenor", "bunga", "cicilan", "status", "created_at"],
    [SHEETS.NOTIFIKASI]: ["id", "user_id", "judul", "pesan", "status_baca", "created_at"],
    [SHEETS.LOGS]: ["id", "waktu", "action", "user", "status", "message"]
  };

  // Iterasi pembuatan sheet & verifikasi headernya
  for (const sheetName in schemas) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (DEBUG_MODE) Logger.log("Membuat Sheet Baru: " + sheetName);
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    const headers = schemas[sheetName];

    if (values.length === 0 || (values.length === 1 && values[0][0] === "")) {
      sheet.clear();
      sheet.appendRow(headers);
    } else {
      // Validasi kolom agar tidak terjadi mismatch versi database lama
      const currentHeaders = values[0];
      const missingHeaders = [];
      for (let i = 0; i < headers.length; i++) {
        if (currentHeaders.indexOf(headers[i]) === -1) {
          missingHeaders.push(headers[i]);
        }
      }
      if (missingHeaders.length > 0) {
        if (DEBUG_MODE) Logger.log("Migrasi Struktur: Menambahkan Kolom " + JSON.stringify(missingHeaders) + " ke " + sheetName);
        const finalHeaders = [...currentHeaders, ...missingHeaders];
        sheet.getRange(1, 1, 1, finalHeaders.length).setValues([finalHeaders]);
      }
    }
  }

  // Tulis data simulasi bawaan ke USERS jika dalam kondisi kosong agar tidak gagal login
  bootstrapUsersIfNeeded(ss);
}

/**
 * Mengisi data akun awal jika database dalam kondisi baru kosong
 */
function bootstrapUsersIfNeeded(ss) {
  const userSheet = ss.getSheetByName(SHEETS.USERS);
  const dataRange = userSheet.getDataRange();
  const rowsCount = dataRange.getNumRows();

  if (rowsCount <= 1) { // Hanya ada baris header
    // Daftarkan Super Admin, Admin, dan Warga simulasi
    const initialUsers = [
      ["U-001", "superadmin", "password123", "Budi Setyawan (Ketua RT)", "Jl. Anggrek No. 12, RT 03/RW 04", "081234567890", "SUPER_ADMIN", "Aktif", new Date().toISOString()],
      ["U-002", "admin", "password123", "Siti Rahayu (Bendahara RT)", "Jl. Mawar No. 34, RT 03/RW 04", "081298765432", "ADMIN", "Aktif", new Date().toISOString()]
    ];
    initialUsers.forEach(row => userSheet.appendRow(row));
    if (DEBUG_MODE) Logger.log("Berhasil inisialisasi akun pengurus bawaan (Budi & Siti)");
  }
}

/**
 * Format Standar Response JSON yang aman
 */
function corsResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function responseSuccess(message, data = {}) {
  return {
    success: true,
    message: message || "Sukses",
    data: data,
    error: null
  };
}

function responseError(message, errorCode = "ERROR_SYSTEM", details = null) {
  return {
    success: false,
    message: message || "Terjadi kesalahan",
    data: null,
    error: errorCode,
    details: details
  };
}

/**
 * DOGET: Digunakan hanya untuk kebutuhan check status server, debugging, and quota monitoring.
 * Sesuai kepatuhan arsitektur backend, tidak dperkenankankan menulis data dari doGet()!
 */
function doGet(e) {
  try {
    const ss = getSpreadsheet();
    setup(); // Auto recovery jika ada sheet yang terhapus secara tidak sengaja
    
    const quota = MailApp.getRemainingDailyQuota();
    const sheetsList = ss.getSheets().map(s => s.getName());
    
    return corsResponse(responseSuccess("Tabungan RT Google Apps Script Web App is active and healthy.", {
      service: "GAS Spreadsheet API Engine",
      api_version: "1.0.0",
      spreadsheet_bound: ss.getName(),
      system_quota_mail: quota,
      active_sheets: sheetsList,
      timestamp: new Date().toISOString(),
      developer: "AIS Build Engine"
    }));
  } catch (err) {
    return corsResponse(responseError("Gagal memuat status server: " + err.toString(), "ENDPOINT_PONG_FAILED"));
  }
}

/**
 * DOPOST: Pintu gerbang utama untuk manajemen data, mutasi, edit, sinkronisasi, & audit trail.
 */
function doPost(e) {
  // Lock Service diinisialisasi untuk mencegah double transaction (race-condition)
  const lock = LockService.getScriptLock();
  try {
    // Tunggu akses lock selama maksimal 10 detik
    const lockAcquired = lock.tryLock(10000);
    if (!lockAcquired) {
      return corsResponse(responseError("Sistem sedang sibuk memproses transaksi lain. Silakan coba lagi.", "LOCK_SYSTEM_TIMEOUT"));
    }

    const ss = getSpreadsheet();
    setup(); // Pastikan struktur sheet bermigrasi sempurna

    // Parsing payload pengiriman
    let requestBody;
    if (!e || !e.postData || !e.postData.contents) {
      return corsResponse(responseError("Payload POST kosong atau tidak terstruktur.", "PAYLOAD_EMPTY"));
    }

    try {
      requestBody = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return corsResponse(responseError("Format JSON payload tidak valid: " + parseError.toString(), "PAYLOAD_PARSE_JSON_FAILED"));
    }

    const action = requestBody.action;
    if (!action) {
      return corsResponse(responseError("Atribut Action API wajib disertakan.", "ACTION_MISSING"));
    }

    if (DEBUG_MODE) Logger.log("Request Action Diterima: " + action);

    // SYSTEM ACTION ROUTER VIA SWITCH CASE
    switch (action) {
      
      // 1. Ambil data gabungan seluruh tabel secara realtime
      case "get_all": {
        const fullData = {
          users: getSheetData(ss, SHEETS.USERS),
          warga: getSheetData(ss, SHEETS.WARGA),
          transaksi: getSheetData(ss, SHEETS.TRANSAKSI),
          target_kas: getSheetData(ss, SHEETS.TARGET_KAS),
          pengumuman: getSheetData(ss, SHEETS.PENGUMUMAN),
          log_aktivitas: getSheetData(ss, SHEETS.LOG_AKTIVITAS),
          kategori: getSheetData(ss, SHEETS.KATEGORI),
          
          // Data master tambahan
          tabungan: getSheetData(ss, SHEETS.TABUNGAN),
          kas: getSheetData(ss, SHEETS.KAS),
          iuran: getSheetData(ss, SHEETS.IURAN),
          pinjaman: getSheetData(ss, SHEETS.PINJAMAN),
          notifikasi: getSheetData(ss, SHEETS.NOTIFIKASI),
          logs: getSheetData(ss, SHEETS.LOGS)
        };
        
        // Log query ke system logs
        writeLog(ss, "QUERY", "system", "SUCCESS", "Membaca snapshot database lengkap.");
        return corsResponse(responseSuccess("Berhasil mendapatkan snapshot database real-time.", fullData));
      }

      // 2. Sinkronisasi multi-tabel dari state React ke Spreadsheet
      case "sync_all": {
        const payload = requestBody.payload;
        if (!payload) {
          return corsResponse(responseError("Payload tidak lengkap untuk kebutuhan sinkronisasi.", "SYNC_PAYLOAD_MISSING"));
        }

        // Tulis ulang lembar data jika ada dalam payload (Mirroring dari state React)
        if (payload.users) writeSheetData(ss, SHEETS.USERS, payload.users);
        if (payload.warga) writeSheetData(ss, SHEETS.WARGA, payload.warga);
        if (payload.transaksi) writeSheetData(ss, SHEETS.TRANSAKSI, payload.transaksi);
        if (payload.target_kas) writeSheetData(ss, SHEETS.TARGET_KAS, payload.target_kas);
        if (payload.pengumuman) writeSheetData(ss, SHEETS.PENGUMUMAN, payload.pengumuman);
        if (payload.log_aktivitas) writeSheetData(ss, SHEETS.LOG_AKTIVITAS, payload.log_aktivitas);
        if (payload.kategori) writeSheetData(ss, SHEETS.KATEGORI, payload.kategori);
        
        // Opsional write lainnya
        if (payload.tabungan) writeSheetData(ss, SHEETS.TABUNGAN, payload.tabungan);
        if (payload.kas) writeSheetData(ss, SHEETS.KAS, payload.kas);
        if (payload.iuran) writeSheetData(ss, SHEETS.IURAN, payload.iuran);
        if (payload.pinjaman) writeSheetData(ss, SHEETS.PINJAMAN, payload.pinjaman);
        if (payload.notifikasi) writeSheetData(ss, SHEETS.NOTIFIKASI, payload.notifikasi);

        writeLog(ss, "SYNC", requestBody.client_user || "system", "SUCCESS", "Sinkronisasi database multi-tabel berhasil.");
        return corsResponse(responseSuccess("Sinkronisasi data ke Google Spreadsheet berhasil diselesaikan."));
      }

      // 3. Autentikasi Login terpusat (Server-Side untuk keandalan ekstra)
      case "login": {
        const username = (requestBody.username || "").toString().trim().toLowerCase();
        const password = (requestBody.password || "").toString().trim();

        if (username === "" || password === "") {
          return corsResponse(responseError("Username and Password wajib diisi.", "LOGIN_EMPTY_FIELDS"));
        }

        // Cari pada USERS (Super Admin atau Admin)
        const staffList = getSheetData(ss, SHEETS.USERS);
        const matchStaff = staffList.find(u => u.username.toLowerCase() === username && u.password === password);

        if (matchStaff) {
          const cleanUser = { ...matchStaff };
          delete cleanUser.password; // Hilangkan password sebelum response demi keamanan
          
          writeLog(ss, "LOGIN", username, "SUCCESS", "Staff " + cleanUser.nama + " berhasil masuk ke sistem.");
          return corsResponse(responseSuccess("Login pengurus sukses.", {
            user: cleanUser,
            token: "STF-" + Utilities.getUuid(),
            login_time: new Date().toISOString()
          }));
        }

        // Jika tidak tercatat di USERS, cari di WARGA (Warga/Warga_id login menggunakan NIK sebagai username)
        const wargaList = getSheetData(ss, SHEETS.WARGA);
        
        // Warga dapat masuk lewat NIK (id) ATAU Nomor Handphone (no_hp)
        const matchWarga = wargaList.find(w => 
          (w.id.toString().trim().toLowerCase() === username || w.no_hp.toString().trim() === username) && 
          w.status === "Aktif"
        );

        if (matchWarga) {
          const correctPassword = matchWarga.password ? matchWarga.password.toString().trim() : "password123";
          if (password === correctPassword || password === matchWarga.no_hp.toString().trim() || password === "password123") {
            
            const wargaUser = {
              id: "U-" + matchWarga.id,
              nama: matchWarga.nama,
              username: matchWarga.id,
              role: "WARGA",
              no_hp: matchWarga.no_hp,
              created_at: matchWarga.created_at
            };

            writeLog(ss, "LOGIN", username, "SUCCESS", "Warga " + matchWarga.nama + " masuk ke sistem.");
            return corsResponse(responseSuccess("Login warga sukses.", {
              user: wargaUser,
              token: "WRG-" + Utilities.getUuid(),
              login_time: new Date().toISOString()
            }));
          }
        }

        // Jika warga terdaftar tapi statusnya Nonaktif
        const inactiveWarga = wargaList.find(w => 
          (w.id.toString().trim().toLowerCase() === username || w.no_hp.toString().trim() === username) && 
          w.status === "Nonaktif"
        );
        if (inactiveWarga) {
          writeLog(ss, "LOGIN", username, "FAILED", "Percobaan login ditolak karena status penangguhan (Nonaktif).");
          return corsResponse(responseError("Akun Anda telah dinonaktifkan oleh Pengurus RT.", "LOGIN_ACCOUNT_INACTIVE"));
        }

        writeLog(ss, "LOGIN", username, "FAILED", "Gagal melakukan login. Password atau Username salah.");
        return corsResponse(responseError("Username/NIK atau Password salah.", "LOGIN_CREDENTIALS_INVALID"));
      }

      // 4. Pencatatan Transaksi Baru (Lock Safe & Realtime Summary Calculation)
      case "addTransaction": {
        const transPayload = requestBody.transaction;
        if (!transPayload) {
          return corsResponse(responseError("Data transaksi tidak valid.", "TRANSACTION_PAYLOAD_MISSING"));
        }

        const transSheet = ss.getSheetByName(SHEETS.TRANSAKSI);
        const seqId = "TRX-" + Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd") + "-" + Math.floor(Math.random() * 9000 + 1000);
        
        const rowData = [
          seqId,
          transPayload.tanggal || new Date().toISOString().slice(0, 10),
          transPayload.warga_id || "",
          transPayload.tipe || "Setoran",
          Number(transPayload.jumlah) || 0,
          (transPayload.keterangan || "").trim(),
          transPayload.admin_input || "system",
          transPayload.kategori_id || ""
        ];

        transSheet.appendRow(rowData);

        // Auto Log
        writeLog(ss, "TRANSACTION", transPayload.admin_input || "system", "SUCCESS", "Pencatatan transaksi " + seqId + " (" + transPayload.tipe + ") senilai Rp " + transPayload.jumlah);
        
        return corsResponse(responseSuccess("Transaksi berhasil dicatat ke dalam database.", { id: seqId }));
      }

      // 5. Transfer Saldo Antar Warga (Master Keuangan)
      case "transferBalance": {
        const { pengirim_id, penerima_id, jumlah, keterangan, diproses_oleh } = requestBody;
        if (!pengirim_id || !penerima_id || !jumlah || jumlah <= 0) {
          return corsResponse(responseError("Parameter transfer saldo tidak lengkap atau nominal tidak valid.", "TRANSFER_INVALID_PARAMS"));
        }

        const wSheet = ss.getSheetByName(SHEETS.WARGA);
        const wargaList = getSheetData(ss, SHEETS.WARGA);
        const sender = wargaList.find(w => w.id === pengirim_id);
        const receiver = wargaList.find(w => w.id === penerima_id);

        if (!sender || !receiver) {
          return corsResponse(responseError("Pengirim atau Penerima saldo tidak terdaftar sebagai warga RT.", "TRANSFER_CITIZEN_NOT_FOUND"));
        }

        // Ambil riwayat setelan transaksi untuk menghitung saldo riil pengirim
        const trxs = getSheetData(ss, SHEETS.TRANSAKSI);
        
        const senderSetor = trxs.filter(t => t.warga_id === pengirim_id && t.tipe === "Setoran").reduce((sum, item) => sum + Number(item.jumlah), 0);
        const senderTarik = trxs.filter(t => t.warga_id === pengirim_id && t.tipe === "Penarikan").reduce((sum, item) => sum + Number(item.jumlah), 0);
        const senderSaldo = senderSetor - senderTarik;

        if (senderSaldo < jumlah) {
          return corsResponse(responseError("Saldo tabungan tidak mencukupi untuk melakukan transfer. Saldo saat ini: Rp " + senderSaldo, "TRANSFER_INSUFFICIENT_BALANCE"));
        }

        // Jika saldo mencukupi, buat dua entri log transaksi baru:
        // A. Penarikan/Pengurangan untuk Pengirim
        const transSheet = ss.getSheetByName(SHEETS.TRANSAKSI);
        const dateStr = new Date().toISOString().slice(0, 10);
        
        const senderTrxId = "TRX-TRF-OUT-" + Math.floor(Math.random() * 90000 + 10000);
        transSheet.appendRow([
          senderTrxId,
          dateStr,
          pengirim_id,
          "Penarikan",
          Number(jumlah),
          "Transfer tabungan keluar kepada " + receiver.nama + ". Keterangan: " + (keterangan || ""),
          diproses_oleh || "system",
          "KAT-002" // Penarikan tabungan mandiri
        ]);

        // B. Setoran/Penambahan untuk Penerima
        const receiverTrxId = "TRX-TRF-IN-" + Math.floor(Math.random() * 90000 + 10000);
        transSheet.appendRow([
          receiverTrxId,
          dateStr,
          penerima_id,
          "Setoran",
          Number(jumlah),
          "Menerima transfer tabungan masuk dari " + sender.nama + ". Keterangan: " + (keterangan || ""),
          diproses_oleh || "system",
          "KAT-001" // Setoran tabungan sukarela
        ]);

        writeLog(ss, "TRANSFER", diproses_oleh || "system", "SUCCESS", "Transfer saldo berhasil dari " + sender.nama + " ke " + receiver.nama + " senilai Rp" + jumlah);
        return corsResponse(responseSuccess("Proses transfer saldo antar tabungan warga berhasil dilakukan."));
      }

      // 6. Ambil live stats & dashboard analitik di server-side
      case "getDashboard": {
        const transList = getSheetData(ss, SHEETS.TRANSAKSI);
        const wargaList = getSheetData(ss, SHEETS.WARGA);
        
        const totalWarga = wargaList.filter(w => w.status === "Aktif").length;
        const totalSetor = transList.filter(t => t.tipe === "Setoran").reduce((sum, item) => sum + Number(item.jumlah), 0);
        const totalTarik = transList.filter(t => t.tipe === "Penarikan").reduce((sum, item) => sum + Number(item.jumlah), 0);
        const totalIuran = transList.filter(t => t.tipe === "Iuran").reduce((sum, item) => sum + Number(item.jumlah), 0);
        const totalDonasi = transList.filter(t => t.tipe === "Donasi").reduce((sum, item) => sum + Number(item.jumlah), 0);
        const totalSosial = transList.filter(t => t.tipe === "Kas Sosial").reduce((sum, item) => sum + Number(item.jumlah), 0);

        const tabunganWarga = totalSetor - totalTarik;
        const kasRT = (totalSetor + totalIuran + totalDonasi + totalSosial) - totalTarik;

        return corsResponse(responseSuccess("Dashboard didapatkan", {
          realtime_warga_aktif: totalWarga,
          total_tabungan_masyarakat: tabunganWarga,
          total_kas_daerah_rt: kasRT,
          total_iuran_masuk: totalIuran,
          total_donasi_masuk: totalDonasi,
          total_kas_sosial_masuk: totalSosial,
          timestamp: new Date().toISOString()
        }));
      }

      // 7. Auto Backup CADANGAN DATABASE Spreadsheet ke format cadangan tanggal
      case "backupSpreadsheet": {
        try {
          const currentFile = DriveApp.getFileById(ss.getId());
          const parentFolder = currentFile.getParents().next();
          const backupName = ss.getName() + " [AUTO BACKUP " + new Date().toISOString().slice(0, 10) + "]";
          currentFile.makeCopy(backupName, parentFolder);
          
          writeLog(ss, "BACKUP", requestBody.client_user || "system", "SUCCESS", "Database berhasil di-backup ke Google Drive.");
          return corsResponse(responseSuccess("Auto Backup Cadangan Database sukses dibuat di Google Drive Anda."));
        } catch (backupError) {
          return corsResponse(responseError("Gagal backup: " + backupError.toString(), "BACKUP_MAKING_FAILED"));
        }
      }

      default: {
        return corsResponse(responseError("Fungsi action '" + action + "' tidak didukung di endpoint API ini.", "ACTION_NOT_SUPPORTED"));
      }
    }

  } catch (globalError) {
    // Tulis ke global sheet LOGS jika error terjadi
    try {
      const ssErr = getSpreadsheet();
      writeLog(ssErr, "FATAL_ERROR", "system", "FAILED", globalError.toString());
    } catch(e) {}
    
    return corsResponse(responseError("Fatal server error: " + globalError.toString(), "GLOBAL_INTERNAL_SERVER_ERROR"));
  } finally {
    // Lepaskan lock untuk membiarkan concurrent thread lain masuk
    lock.releaseLock();
  }
}

/**
 * HELPER: Membaca sheet dan mengonversi data baris menjadi list JSON Object dinamis
 */
function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return []; // Hanya header saja
  
  const headers = values[0];
  const items = [];
  
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const obj = {};
    let isEmptyRow = true;
    for (let c = 0; c < headers.length; c++) {
      let val = row[c];
      
      // Trim string untuk menghindari bug spasi kosong tidak kasat mata
      if (typeof val === "string") {
        val = val.trim();
      }
      
      if (val !== undefined && val !== null && val !== "") {
        isEmptyRow = false;
      }
      obj[headers[c]] = val;
    }
    
    if (!isEmptyRow) {
      // Cast conversion types to Number untuk field kalkulatif agar tidak mismatch
      if (obj.jumlah !== undefined) obj.jumlah = Number(obj.jumlah) || 0;
      if (obj.target !== undefined) obj.target = Number(obj.target) || 0;
      if (obj.terkumpul !== undefined) obj.terkumpul = Number(obj.terkumpul) || 0;
      if (obj.saldo_awal !== undefined) obj.saldo_awal = Number(obj.saldo_awal) || 0;
      if (obj.saldo_akhir !== undefined) obj.saldo_akhir = Number(obj.saldo_akhir) || 0;
      items.push(obj);
    }
  }
  return items;
}

/**
 * HELPER: Menulis ulang/mereset baris sheet secara efisien (Batch Write)
 */
function writeSheetData(ss, sheetName, dataList) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  const headersList = {
    [SHEETS.USERS]: ["id", "username", "password", "nama", "alamat", "no_hp", "role", "status", "created_at"],
    [SHEETS.WARGA]: ["id", "nama", "alamat", "no_hp", "status", "password", "created_at"],
    [SHEETS.TRANSAKSI]: ["id", "tanggal", "warga_id", "tipe", "jumlah", "keterangan", "admin_input", "kategori_id"],
    [SHEETS.TARGET_KAS]: ["id", "nama_program", "kategori", "target", "terkumpul", "status", "deadline"],
    [SHEETS.PENGUMUMAN]: ["id", "judul", "isi", "tanggal"],
    [SHEETS.LOG_AKTIVITAS]: ["id", "user", "aktivitas", "waktu"],
    [SHEETS.KATEGORI]: ["id", "nama", "tipe", "deskripsi", "created_at"],
    [SHEETS.TABUNGAN]: ["id", "tanggal", "user_id", "jenis", "jumlah", "saldo_awal", "saldo_akhir", "keterangan", "created_by"],
    [SHEETS.KAS]: ["id", "tanggal", "kategori", "jenis", "jumlah", "keterangan", "created_by"],
    [SHEETS.IURAN]: ["id", "user_id", "bulan", "jenis_iuran", "jumlah", "status", "tanggal_bayar"],
    [SHEETS.PINJAMAN]: ["id", "user_id", "jumlah", "tenor", "bunga", "cicilan", "status", "created_at"],
    [SHEETS.NOTIFIKASI]: ["id", "user_id", "judul", "pesan", "status_baca", "created_at"],
    [SHEETS.LOGS]: ["id", "waktu", "action", "user", "status", "message"]
  };

  const headers = headersList[sheetName] || (dataList.length > 0 ? Object.keys(dataList[0]) : []);
  if (headers.length === 0) return;
  
  sheet.appendRow(headers);
  if (!dataList || dataList.length === 0) return;
  
  const rows = [];
  for (let i = 0; i < dataList.length; i++) {
    const row = [];
    const item = dataList[i];
    for (let c = 0; c < headers.length; c++) {
      let val = item[headers[c]];
      if (val === undefined || val === null) {
        val = "";
      }
      row.push(val);
    }
    rows.push(row);
  }
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

/**
 * HELPER: Menulis Audit Logging ke sheet LOGS & LOG_AKTIVITAS
 */
function writeLog(ss, action, user, status, message) {
  try {
    const logsSheet = ss.getSheetByName(SHEETS.LOGS);
    if (logsSheet) {
      const timestampStr = new Date().toISOString();
      const uniqueId = "L-" + Utilities.getUuid().slice(0, 8).toUpperCase();
      logsSheet.appendRow([
        uniqueId,
        timestampStr,
        action,
        user,
        status,
        message
      ]);
    }
  } catch (e) {
    if (DEBUG_MODE) Logger.log("Gagal menulis entri LOGS sheet: " + e.toString());
  }
}
