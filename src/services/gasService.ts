import {
  GasConfig,
  GasSyncResponse,
  SchoolAssessmentMeta,
  QuestionItem,
  StudentSubmission,
  StudentGradedResult,
} from '../types/grader';

const GAS_CONFIG_STORAGE_KEY = 'smartgrader_gas_config';

export const DEFAULT_GAS_CONFIG: GasConfig = {
  webAppUrl: '',
  spreadsheetName: '',
  spreadsheetId: '',
  isConnected: false,
  autoSync: false,
};

// Retrieve stored GAS configuration from localStorage
export function loadGasConfig(): GasConfig {
  try {
    const raw = localStorage.getItem(GAS_CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_GAS_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to load GAS config:', err);
  }
  return DEFAULT_GAS_CONFIG;
}

// Persist GAS configuration
export function saveGasConfig(config: GasConfig): void {
  try {
    localStorage.setItem(GAS_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save GAS config:', err);
  }
}

/**
 * Call GAS Web App via server-side proxy to handle Google 302 redirects and CORS safely
 */
export async function callGasApi<T = any>(
  webAppUrl: string,
  action: string,
  payload: Record<string, any> = {}
): Promise<GasSyncResponse> {
  const cleanUrl = webAppUrl.trim();
  if (!cleanUrl) {
    return {
      success: false,
      message: 'URL Web App Google Apps Script belum diisi.',
    };
  }

  if (!cleanUrl.startsWith('https://script.google.com/')) {
    return {
      success: false,
      message: 'Format URL tidak valid. Pastikan diawali dengan https://script.google.com/macros/s/.../exec',
    };
  }

  try {
    const response = await fetch('/api/gas/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webAppUrl: cleanUrl,
        action,
        payload,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errJson.message || `Gagal menghubungi server proxy (${response.status})`,
      };
    }

    const data: GasSyncResponse = await response.json();
    return data;
  } catch (err: any) {
    console.error('Error invoking GAS proxy:', err);
    return {
      success: false,
      message: err.message || 'Terjadi kesalahan jaringan saat menghubungi Google Apps Script.',
    };
  }
}

/**
 * Test Connection with Google Apps Script
 */
export async function testGasConnection(webAppUrl: string): Promise<GasSyncResponse> {
  return await callGasApi(webAppUrl, 'PING', {});
}

/**
 * Pull Students & Answers from Google Spreadsheet
 */
export async function pullStudentsFromGas(webAppUrl: string): Promise<{
  success: boolean;
  message: string;
  students?: StudentSubmission[];
  rawCount?: number;
}> {
  const res = await callGasApi(webAppUrl, 'GET_STUDENTS', {});
  if (!res.success) {
    return { success: false, message: res.message };
  }

  const rawStudents = res.data?.students || [];
  const mapped: StudentSubmission[] = rawStudents.map((s: any, idx: number) => ({
    id: s.id || `gas_std_${Date.now()}_${idx}`,
    nisn: String(s.nisn || `008123450${idx + 1}`),
    name: s.name || `Siswa #${idx + 1}`,
    answers: s.answers || {},
  }));

  return {
    success: true,
    message: res.message || `Berhasil menarik ${mapped.length} data siswa dari Spreadsheet.`,
    students: mapped,
    rawCount: mapped.length,
  };
}

/**
 * Push Graded Assessment Results directly to Google Spreadsheet
 */
export async function pushResultsToGas(
  webAppUrl: string,
  meta: SchoolAssessmentMeta,
  questions: QuestionItem[],
  results: StudentGradedResult[]
): Promise<GasSyncResponse> {
  return await callGasApi(webAppUrl, 'SAVE_RESULTS', {
    meta,
    questions: questions.map((q) => ({
      id: q.id,
      number: q.number,
      type: q.type,
      weight: q.weight,
    })),
    results: results.map((r, idx) => ({
      no: idx + 1,
      nisn: r.nisn,
      studentName: r.studentName,
      totalScore: r.totalScore,
      percentageScore: r.percentageScore,
      status: r.status,
      questionScores: r.questionScores,
      followUpProgram: r.followUpProgram?.title || '-',
      personalFeedback: r.personalFeedbackNotes || '-',
    })),
  });
}

/**
 * Push Assessment Questions & Keys to Google Spreadsheet
 */
export async function pushQuestionsToGas(
  webAppUrl: string,
  meta: SchoolAssessmentMeta,
  questions: QuestionItem[]
): Promise<GasSyncResponse> {
  return await callGasApi(webAppUrl, 'SAVE_QUESTIONS', {
    meta,
    questions,
  });
}

/**
 * Pull Questions & Keys from Google Spreadsheet
 */
export async function pullQuestionsFromGas(webAppUrl: string): Promise<{
  success: boolean;
  message: string;
  questions?: QuestionItem[];
}> {
  const res = await callGasApi(webAppUrl, 'GET_QUESTIONS', {});
  if (!res.success) {
    return { success: false, message: res.message };
  }

  const list = res.data?.questions || [];
  return {
    success: true,
    message: res.message || `Berhasil mengambil ${list.length} butir soal dari Spreadsheet.`,
    questions: list,
  };
}

/**
 * Clean & Production-Ready Google Apps Script (Code.gs) Source Code for Teachers
 * Dapat langsung di-copy dan di-paste ke Google Sheets > Extensions > Apps Script
 */
export const GAS_SCRIPT_TEMPLATE = `/**
 * ============================================================================
 * SMARTGRADER AI ENGINE - BACKEND GOOGLE APPS SCRIPT (GAS)
 * ============================================================================
 * Skrip ini bertindak sebagai backend cloud terintegrasi untuk aplikasi SmartGrader.
 * Menghubungkan Google Spreadsheet sekolah secara dua arah:
 * 1. Menerima rekap nilai hasil koreksi (otomatis dibuatkan sheet 'Rekap_Nilai')
 * 2. Menyediakan data siswa & jawaban (sheet 'Data_Siswa')
 * 3. Menyimpan & mengambil bank soal & kunci jawaban (sheet 'Kunci_Soal')
 * 
 * CARA MEMASANG:
 * 1. Buka Google Spreadsheet baru di Google Drive Anda.
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus kode default, lalu tempel (Paste) seluruh kode ini.
 * 4. Klik tombol Simpan (ikon disket).
 * 5. Klik 'Terapkan' (Deploy) > 'Penerapan baru' (New deployment).
 * 6. Pilih jenis: 'Aplikasi web' (Web app).
 * 7. Set 'Jalankan sebagai': 'Saya' (Me).
 * 8. Set 'Siapa yang memiliki akses': 'Siapa saja' (Anyone) -> WAJIB agar aplikasi bisa sync.
 * 9. Klik 'Terapkan' (Deploy), berikan izin akses Google, lalu salin URL Aplikasi Web (.exec).
 * 10. Tempelkan URL tersebut ke aplikasi SmartGrader!
 * ============================================================================
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'PING';
  return handleAction(action, e ? e.parameter : {});
}

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var action = data.action || 'PING';
    var payload = data.payload || data;
    return handleAction(action, payload);
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: 'Error memproses permintaan POST: ' + err.toString()
    });
  }
}

function handleAction(action, payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  switch (action) {
    case 'PING':
      return createJsonResponse({
        success: true,
        message: 'Koneksi ke Google Apps Script berhasil aktif!',
        data: {
          spreadsheetName: ss.getName(),
          spreadsheetId: ss.getId(),
          sheets: ss.getSheets().map(function(s) { return s.getName(); }),
          timestamp: new Date().toISOString()
        }
      });

    case 'SAVE_RESULTS':
      return saveGradingResults(ss, payload);

    case 'GET_STUDENTS':
      return getStudentsFromSheet(ss);

    case 'SAVE_STUDENTS':
      return saveStudentsToSheet(ss, payload);

    case 'SAVE_QUESTIONS':
      return saveQuestionsToSheet(ss, payload);

    case 'GET_QUESTIONS':
      return getQuestionsFromSheet(ss);

    default:
      return createJsonResponse({
        success: false,
        message: 'Aksi "' + action + '" tidak dikenali.'
      });
  }
}

/**
 * 1. SIMPAN HASIL REKAPITULASI NILAI KE SHEET 'Rekap_Nilai'
 */
function saveGradingResults(ss, payload) {
  var meta = payload.meta || {};
  var questions = payload.questions || [];
  var results = payload.results || [];

  var sheetName = 'Rekap_Nilai';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }

  // Format Judul & Kop Laporan
  sheet.getRange('A1').setValue('REKAPITULASI HASIL ASESMEN PEMBELAJARAN');
  sheet.getRange('A1:J1').merge().setFontWeight('bold').setFontSize(14).setHorizontalAlignment('center');

  sheet.getRange('A2').setValue(meta.schoolName || 'SD Negeri Gentan');
  sheet.getRange('A2:J2').merge().setFontWeight('bold').setFontSize(11).setHorizontalAlignment('center');

  var infoRow = 'Mata Pelajaran: ' + (meta.subject || '-') + ' | Kelas: ' + (meta.gradeClass || '-') + ' | KKM: ' + (meta.kkm || 75) + ' | Guru: ' + (meta.teacherName || '-');
  sheet.getRange('A3').setValue(infoRow);
  sheet.getRange('A3:J3').merge().setFontStyle('italic').setFontSize(10).setHorizontalAlignment('center');

  // Header Kolom
  var headers = ['No', 'NISN', 'Nama Siswa'];
  questions.forEach(function(q) {
    headers.push('Q' + q.number + ' (' + (q.type ? q.type.toUpperCase() : 'SOAL') + ')');
  });
  headers.push('Total Skor', 'Nilai Akhir', 'Status KKM', 'Program Tindak Lanjut', 'Catatan Guru');

  sheet.getRange(5, 1, 1, headers.length).setValues([headers]);
  var headerRange = sheet.getRange(5, 1, 1, headers.length);
  headerRange.setBackground('#1e40af')
             .setFontColor('#ffffff')
             .setFontWeight('bold')
             .setHorizontalAlignment('center');

  // Isi Data Siswa
  var rows = [];
  results.forEach(function(r, idx) {
    var row = [
      idx + 1,
      "'" + r.nisn, // tanda petik agar NISN tidak dianggap angka eksponensial
      r.studentName
    ];

    // Nilai per nomor soal
    questions.forEach(function(q) {
      var qDetail = r.questionScores ? r.questionScores[q.id] : null;
      row.push(qDetail ? qDetail.score : 0);
    });

    row.push(
      r.totalScore,
      r.percentageScore,
      r.status,
      r.followUpProgram || '-',
      r.personalFeedback || '-'
    );

    rows.push(row);
  });

  if (rows.length > 0) {
    var dataRange = sheet.getRange(6, 1, rows.length, headers.length);
    dataRange.setValues(rows);
    dataRange.setBorder(true, true, true, true, true, true);

    // Pewarnaan Status KKM
    for (var i = 0; i < rows.length; i++) {
      var statusColIndex = headers.indexOf('Status KKM') + 1;
      var statusCell = sheet.getRange(6 + i, statusColIndex);
      var val = rows[i][statusColIndex - 1];
      if (val === 'Tuntas') {
        statusCell.setBackground('#dcfce7').setFontColor('#166534').setFontWeight('bold');
      } else {
        statusCell.setBackground('#fee2e2').setFontColor('#991b1b').setFontWeight('bold');
      }
    }
  }

  sheet.autoResizeColumns(1, headers.length);

  return createJsonResponse({
    success: true,
    message: 'Berhasil menyimpan ' + results.length + ' hasil siswa ke sheet "' + sheetName + '"!',
    data: {
      rowCount: results.length,
      sheetName: sheetName
    }
  });
}

/**
 * 2. AMBIL DAFTAR SISWA & RESPON DARI SHEET 'Data_Siswa'
 */
function getStudentsFromSheet(ss) {
  var sheetName = 'Data_Siswa';
  var sheet = ss.getSheetByName(sheetName);
  
  // Jika sheet belum ada, buatkan template otomatis
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var sampleHeaders = ['No', 'NISN', 'Nama Siswa', 'Soal 1', 'Soal 2', 'Soal 3', 'Soal 4', 'Soal 5'];
    sheet.getRange(1, 1, 1, sampleHeaders.length).setValues([sampleHeaders]);
    sheet.getRange(1, 1, 1, sampleHeaders.length).setBackground('#2563eb').setFontColor('#ffffff').setFontWeight('bold');

    var sampleRows = [
      [1, "'0081234501", "Ahmad Fauzi", "A", "B", "A, C", "0,5", "fotosintesis"],
      [2, "'0081234502", "Bernadetta Larasati", "A", "C", "A, D", "1/2", "fotosintesa"],
      [3, "'0081234503", "Cahyo Wibowo", "B", "B", "A, B", "0.5", "fotosintesis"]
    ];
    sheet.getRange(2, 1, sampleRows.length, sampleHeaders.length).setValues(sampleRows);
    sheet.autoResizeColumns(1, sampleHeaders.length);
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return createJsonResponse({
      success: true,
      message: 'Sheet "Data_Siswa" kosong (hanya header).',
      data: { students: [] }
    });
  }

  var headers = data[0];
  var students = [];

  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    if (!row[1] && !row[2]) continue; // Lewati baris kosong

    var nisn = String(row[1] || '').trim();
    var name = String(row[2] || 'Siswa ' + r).trim();
    var answers = {};

    // Kolom jawaban mulai indeks 3 dst
    for (var c = 3; c < row.length; c++) {
      var headerText = String(headers[c] || 'Soal_' + (c - 2)).trim();
      var numMatch = headerText.match(/\\d+/);
      var qNumber = numMatch ? numMatch[0] : String(c - 2);
      answers['q_' + qNumber] = String(row[c] !== undefined ? row[c] : '');
    }

    students.push({
      id: 'gas_' + r,
      nisn: nisn,
      name: name,
      answers: answers
    });
  }

  return createJsonResponse({
    success: true,
    message: 'Berhasil membaca ' + students.length + ' data siswa dari sheet "' + sheetName + '".',
    data: {
      students: students,
      count: students.length
    }
  });
}

/**
 * 3. SIMPAN DAFTAR SISWA KE SHEET 'Data_Siswa'
 */
function saveStudentsToSheet(ss, payload) {
  var students = payload.students || [];
  var questions = payload.questions || [];
  var sheetName = 'Data_Siswa';

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }

  var headers = ['No', 'NISN', 'Nama Siswa'];
  questions.forEach(function(q) {
    headers.push('Soal ' + q.number + ' (' + (q.type ? q.type.toUpperCase() : 'PG') + ')');
  });

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#2563eb').setFontColor('#ffffff').setFontWeight('bold');

  var rows = [];
  students.forEach(function(s, idx) {
    var row = [
      idx + 1,
      "'" + s.nisn,
      s.name
    ];
    questions.forEach(function(q) {
      row.push(s.answers ? (s.answers[q.id] || s.answers[String(q.number)] || '') : '');
    });
    rows.push(row);
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  sheet.autoResizeColumns(1, headers.length);

  return createJsonResponse({
    success: true,
    message: 'Berhasil menyimpan ' + students.length + ' siswa ke sheet "' + sheetName + '".'
  });
}

/**
 * 4. SIMPAN KUNCI SOAL KE SHEET 'Kunci_Soal'
 */
function saveQuestionsToSheet(ss, payload) {
  var questions = payload.questions || [];
  var sheetName = 'Kunci_Soal';

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }

  var headers = ['No', 'Bentuk Soal', 'Bobot Poin', 'Kunci Jawaban', 'Pertanyaan / Teks Soal'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#059669').setFontColor('#ffffff').setFontWeight('bold');

  var rows = [];
  questions.forEach(function(q) {
    var keyDisplay = '-';
    if (q.type === 'pg') keyDisplay = q.correctOption || 'A';
    else if (q.type === 'pgk') keyDisplay = (q.pgkOptions || []).filter(function(o){ return o.isCorrect; }).map(function(o){ return o.id; }).join(', ');
    else if (q.type === 'bs') keyDisplay = (q.bsStatements || []).map(function(s){ return s.correctAnswer ? 'B' : 'S'; }).join(', ');
    else if (q.type === 'isian') keyDisplay = (q.acceptableAnswers || []).join(', ');
    else if (q.type === 'hitungan') keyDisplay = q.mathFinalAnswer || q.mathFormula || '-';
    else if (q.type === 'esai') keyDisplay = q.modelAnswer || 'Rubrik Analitis';

    rows.push([
      q.number,
      (q.type || '').toUpperCase(),
      q.weight,
      keyDisplay,
      q.prompt || '-'
    ]);
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  sheet.autoResizeColumns(1, headers.length);

  return createJsonResponse({
    success: true,
    message: 'Berhasil mengekspor ' + questions.length + ' butir soal ke sheet "' + sheetName + '".'
  });
}

/**
 * 5. AMBIL KUNCI SOAL DARI SHEET 'Kunci_Soal'
 */
function getQuestionsFromSheet(ss) {
  var sheetName = 'Kunci_Soal';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return createJsonResponse({
      success: false,
      message: 'Sheet "' + sheetName + '" belum dibuat. Silakan ekspor soal terlebih dahulu.'
    });
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return createJsonResponse({
      success: true,
      message: 'Sheet "' + sheetName + '" kosong.',
      data: { questions: [] }
    });
  }

  var list = [];
  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var num = parseInt(row[0]) || r;
    var type = String(row[1] || 'PG').toLowerCase();
    var weight = parseFloat(row[2]) || 10;
    var key = String(row[3] || '');
    var prompt = String(row[4] || 'Soal No. ' + num);

    list.push({
      id: 'q_' + num,
      number: num,
      type: type,
      weight: weight,
      prompt: prompt,
      correctOption: type === 'pg' ? key.toUpperCase() : undefined,
      acceptableAnswers: type === 'isian' ? key.split(',').map(function(s){ return s.trim(); }) : undefined
    });
  }

  return createJsonResponse({
    success: true,
    message: 'Berhasil membaca ' + list.length + ' soal dari sheet "' + sheetName + '".',
    data: { questions: list }
  });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
