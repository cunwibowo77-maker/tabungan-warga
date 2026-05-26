/**
 * GOOGLE APPS SCRIPT DATABASE ENDPOINT FOR "TABUNGAN WARGA RT"
 * 
 * Instructions:
 * 1. Create a new Google Spreadsheet.
 * 2. Rename the default sheet into 6 sheets: "USERS", "WARGA", "TRANSAKSI", "TARGET_KAS", "PENGUMUMAN", "LOG_AKTIVITAS".
 *    (Or just let setup() automatically create and configure them on first run!)
 * 3. Open Extensions > Apps Script.
 * 4. Replace all default code with this script.
 * 5. Click 'Deploy' > 'New deployment'. Set type: 'Web app', Execute as: 'Me' (your account), Who has access: 'Anyone'.
 * 6. Click Deploy, authorize permissions, and copy the Web App URL.
 * 7. Paste the Web App URL into the "Pengaturan Keamanan & API" in the application dashboard.
 */

const SPREADSHEET_ID = ""; // Leave blank if bound to the active spreadsheet, or paste Spreadsheet ID here

function getSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function setup() {
  const ss = getSpreadsheet();
  if (!ss) {
    throw new Error("Spreadsheet tidak ditemukan. Pastikan script ini dipasang langsung (bound) di Spreadsheet Anda atau SPREADSHEET_ID telah diisi.");
  }

  const sheetsInfo = {
    "USERS": ["id", "nama", "username", "password", "role", "no_hp", "created_at"],
    "WARGA": ["id", "nama", "alamat", "no_hp", "status", "password", "created_at"],
    "TRANSAKSI": ["id", "tanggal", "warga_id", "tipe", "jumlah", "keterangan", "admin_input", "kategori_id"],
    "TARGET_KAS": ["id", "nama_program", "kategori", "target", "terkumpul", "status", "deadline"],
    "PENGUMUMAN": ["id", "judul", "isi", "tanggal"],
    "LOG_AKTIVITAS": ["id", "user", "aktivitas", "waktu"],
    "KATEGORI": ["id", "nama", "tipe", "deskripsi", "created_at"]
  };
  
  const sheets = ss.getSheets();
  if (sheets.length === 1) {
    const mainName = sheets[0].getName();
    if (mainName.indexOf("Sheet") === 0 || mainName === "Mulai" || mainName === "Sheet1") {
      sheets[0].setName("USERS");
    }
  }

  for (const name in sheetsInfo) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const expectedHeaders = sheetsInfo[name];

    if (values.length === 0 || (values.length === 1 && values[0][0] === "")) {
      // Clear empty sheet before writing headers
      sheet.clear();
      sheet.appendRow(expectedHeaders);
    } else {
      // Sheet already exists. Validate headers to make sure none are missing.
      const currentHeaders = values[0];
      const missingHeaders = [];
      for (let i = 0; i < expectedHeaders.length; i++) {
        const expected = expectedHeaders[i];
        if (currentHeaders.indexOf(expected) === -1) {
          missingHeaders.push(expected);
        }
      }

      if (missingHeaders.length > 0) {
        // Safe migration: append new columns to the end
        const finalHeaders = [...currentHeaders, ...missingHeaders];
        sheet.getRange(1, 1, 1, finalHeaders.length).setValues([finalHeaders]);
      }
    }
  }
}

function corsResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const ss = getSpreadsheet();
    setup(); // Automatically setup / migrate database structures if needed
    const action = e.parameter.action || "get_all";
    
    if (action === "get_all") {
      const data = {
        users: getSheetData(ss, "USERS"),
        warga: getSheetData(ss, "WARGA"),
        transaksi: getSheetData(ss, "TRANSAKSI"),
        target_kas: getSheetData(ss, "TARGET_KAS"),
        pengumuman: getSheetData(ss, "PENGUMUMAN"),
        log_aktivitas: getSheetData(ss, "LOG_AKTIVITAS")
      };
      return corsResponse({ success: true, data: data });
    }
    
    return corsResponse({ success: false, error: "Action not recognized in GET" });
  } catch (err) {
    return corsResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const ss = getSpreadsheet();
    setup(); // Automatically setup / migrate database structures if needed
    
    let postData;
    try {
      postData = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return corsResponse({ success: false, error: "Gagal memproses data JSON: " + parseErr.toString() });
    }

    const action = postData.action;
    if (!action) {
      return corsResponse({ success: false, error: "No action provided" });
    }
    
    // Read all sheets
    if (action === "get_all") {
      const data = {
        users: getSheetData(ss, "USERS"),
        warga: getSheetData(ss, "WARGA"),
        transaksi: getSheetData(ss, "TRANSAKSI"),
        target_kas: getSheetData(ss, "TARGET_KAS"),
        pengumuman: getSheetData(ss, "PENGUMUMAN"),
        log_aktivitas: getSheetData(ss, "LOG_AKTIVITAS"),
        kategori: getSheetData(ss, "KATEGORI")
      };
      return corsResponse({ success: true, data: data });
    }
    
    // Save state completely (Mirroring the client local storage state)
    if (action === "sync_all") {
      const payload = postData.payload;
      if (!payload) {
        return corsResponse({ success: false, error: "No payload provided for sync" });
      }
      
      if (payload.users) writeSheetData(ss, "USERS", payload.users);
      if (payload.warga) writeSheetData(ss, "WARGA", payload.warga);
      if (payload.transaksi) writeSheetData(ss, "TRANSAKSI", payload.transaksi);
      if (payload.target_kas) writeSheetData(ss, "TARGET_KAS", payload.target_kas);
      if (payload.pengumuman) writeSheetData(ss, "PENGUMUMAN", payload.pengumuman);
      if (payload.log_aktivitas) writeSheetData(ss, "LOG_AKTIVITAS", payload.log_aktivitas);
      if (payload.kategori) writeSheetData(ss, "KATEGORI", payload.kategori);
      
      return corsResponse({ success: true, message: "Sync successful" });
    }
    
    return corsResponse({ success: false, error: "Action not supported: " + action });
  } catch (err) {
    return corsResponse({ success: false, error: err.toString() });
  }
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  const headers = values[0];
  const items = [];
  
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const obj = {};
    let emptyRow = true;
    for (let c = 0; c < headers.length; c++) {
      const val = row[c];
      if (val !== undefined && val !== null && val !== "") {
        emptyRow = false;
      }
      obj[headers[c]] = val;
    }
    if (!emptyRow) {
      // Parse numbers if applicable
      if (obj.jumlah !== undefined) obj.jumlah = Number(obj.jumlah) || 0;
      if (obj.target !== undefined) obj.target = Number(obj.target) || 0;
      if (obj.terkumpul !== undefined) obj.terkumpul = Number(obj.terkumpul) || 0;
      items.push(obj);
    }
  }
  return items;
}

function writeSheetData(ss, sheetName, dataList) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  const sheetsInfo = {
    "USERS": ["id", "nama", "username", "password", "role", "no_hp", "created_at"],
    "WARGA": ["id", "nama", "alamat", "no_hp", "status", "password", "created_at"],
    "TRANSAKSI": ["id", "tanggal", "warga_id", "tipe", "jumlah", "keterangan", "admin_input", "kategori_id"],
    "TARGET_KAS": ["id", "nama_program", "kategori", "target", "terkumpul", "status", "deadline"],
    "PENGUMUMAN": ["id", "judul", "isi", "tanggal"],
    "LOG_AKTIVITAS": ["id", "user", "aktivitas", "waktu"],
    "KATEGORI": ["id", "nama", "tipe", "deskripsi", "created_at"]
  };

  const headers = sheetsInfo[sheetName] || (dataList.length > 0 ? Object.keys(dataList[0]) : []);
  if (headers.length === 0) return;
  
  sheet.appendRow(headers);
  if (dataList.length === 0) return;
  
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
