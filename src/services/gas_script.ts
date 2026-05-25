export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT DATABASE ENDPOINT FOR "TABUNGAN WARGA RT"
 * 
 * Instructions:
 * 1. Create a new Google Spreadsheet.
 * 2. Rename the default sheet into 6 sheets: "USERS", "WARGA", "TRANSAKSI", "TARGET_KAS", "PENGUMUMAN", "LOG_AKTIVITAS".
 * 3. Add the exact header column names in Row 1:
 *    - USERS: id, nama, username, password, role, no_hp, created_at
 *    - WARGA: id, nama, alamat, no_hp, status, created_at
 *    - TRANSAKSI: id, tanggal, warga_id, tipe, jumlah, keterangan, admin_input
 *    - TARGET_KAS: id, nama_program, kategori, target, terkumpul, status, deadline
 *    - PENGUMUMAN: id, judul, isi, tanggal
 *    - LOG_AKTIVITAS: id, user, aktivitas, waktu
 * 4. Open Extensions > Apps Script.
 * 5. Replace all default code with this script.
 * 6. Click 'Deploy' > 'New deployment'. Set type: 'Web app', Execute as: 'Me' (your account), Who has access: 'Anyone'.
 * 7. Click Deploy, authorize permissions, and copy the Web App URL.
 * 8. Paste the Web App URL into the "Pengaturan Keamanan & API" in the application dashboard.
 */

const SPREADSHEET_ID = ""; // Leave blank if bound to the active spreadsheet, or paste Spreadsheet ID here

function getSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function corsResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = e.parameter.action || "get_all";
    const ss = getSpreadsheet();
    
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
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const ss = getSpreadsheet();
    
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
        log_aktivitas: getSheetData(ss, "LOG_AKTIVITAS")
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
  
  if (dataList.length === 0) {
    // Write standard headers
    let headers = [];
    if (sheetName === "USERS") headers = ["id", "nama", "username", "password", "role", "no_hp", "created_at"];
    else if (sheetName === "WARGA") headers = ["id", "nama", "alamat", "no_hp", "status", "created_at"];
    else if (sheetName === "TRANSAKSI") headers = ["id", "tanggal", "warga_id", "tipe", "jumlah", "keterangan", "admin_input"];
    else if (sheetName === "TARGET_KAS") headers = ["id", "nama_program", "kategori", "target", "terkumpul", "status", "deadline"];
    else if (sheetName === "PENGUMUMAN") headers = ["id", "judul", "isi", "tanggal"];
    else if (sheetName === "LOG_AKTIVITAS") headers = ["id", "user", "aktivitas", "waktu"];
    
    sheet.appendRow(headers);
    return;
  }
  
  const headers = Object.keys(dataList[0]);
  sheet.appendRow(headers);
  
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
`;
