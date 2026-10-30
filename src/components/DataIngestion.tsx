import React, { useState } from 'react';
import { StudentSubmission, QuestionItem, SchoolAssessmentMeta } from '../types/grader';
import { parseRawOcrSubmission } from '../services/ocrCleaner';
import { SAMPLE_STUDENTS, DEFAULT_SCHOOL_META } from '../data/sampleAssessment';
import { AnswerSheetTemplateModal } from './AnswerSheetTemplateModal';
import {
  Upload,
  FileSpreadsheet,
  ScanText,
  CheckCircle2,
  Trash2,
  Sparkles,
  Download,
  Plus,
  ClipboardPaste,
  HelpCircle,
  Table,
  Copy,
  Check,
  CheckSquare,
  Printer,
  Camera,
} from 'lucide-react';
import { CameraOcrScanner } from './CameraOcrScanner';

interface DataIngestionProps {
  meta?: SchoolAssessmentMeta;
  questions: QuestionItem[];
  submissions: StudentSubmission[];
  onChange: (updated: StudentSubmission[]) => void;
}

export const DataIngestion: React.FC<DataIngestionProps> = ({
  meta,
  questions,
  submissions,
  onChange,
}) => {
  const [activeImportMode, setActiveImportMode] = useState<'camera' | 'table' | 'paste' | 'csv' | 'ocr'>('camera');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showAnswerSheetModal, setShowAnswerSheetModal] = useState(false);
  const [copiedClipboard, setCopiedClipboard] = useState(false);

  // Paste direct from Excel State
  const [excelPasteText, setExcelPasteText] = useState('');

  // OCR Scan State
  const [ocrRawText, setOcrRawText] = useState(
    `Nama: Rahmawati Putri
NISN: 0081234510
1. B
2. A, C, D
3. B, S, B
4. 0,5
5. fotosintesis
6. a = 25/5 = 5 m/s²
7. Peredaran darah besar mengalir dari bilik kiri jantung ke seluruh organ tubuh, peredaran darah kecil dari bilik kanan ke paru-paru.

---
Nama: Gilang Ramadhan
NISN: 0081234511
1. B
2. A, C
3. B, B, B
4. 1/2
5. fotosintesa
6. a = F/m = 25/5 = 4
7. Sirkulasi darah dari bilik kiri ke tubuh manusia dan dari bilik kanan ke paru.`
  );
  const [ocrCleanedNotes, setOcrCleanedNotes] = useState<string[]>([]);

  // CSV file raw text state
  const [csvText, setCsvText] = useState('');

  // 1. Process Direct Paste from Excel / Google Sheets
  const handleProcessExcelPaste = () => {
    if (!excelPasteText.trim()) return;

    const lines = excelPasteText.split('\n').map(l => l.trim()).filter(Boolean);
    const newStudents: StudentSubmission[] = [];

    lines.forEach((line, rowIdx) => {
      // Split by tab (standard Excel copy-paste) or semicolon or comma
      const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
      const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length === 0) return;

      // Skip header if teacher copied the header row
      if (
        cols[0]?.toLowerCase().includes('nama') ||
        cols[1]?.toLowerCase().includes('nama') ||
        cols[0]?.toLowerCase().includes('no') ||
        cols[0]?.toLowerCase().startsWith('sep=')
      ) {
        return;
      }

      // Check whether col 0 is number/absen or name
      let name = `Siswa ${submissions.length + rowIdx + 1}`;
      let nisn = `0081234${submissions.length + rowIdx + 1}`;
      let answerStartIndex = 0;

      if (/^\d+$/.test(cols[0]) && cols[1] && !/^\d+$/.test(cols[1])) {
        // [1, "Ahmad Faiz", "008123...", "A", "B", ...]
        name = cols[1];
        nisn = cols[2] && /^\d+$/.test(cols[2]) ? cols[2] : `0081234${submissions.length + rowIdx + 1}`;
        answerStartIndex = cols[2] && /^\d+$/.test(cols[2]) ? 3 : 2;
      } else if (cols[0] && !/^\d+$/.test(cols[0])) {
        // ["Ahmad Faiz", "008123...", "A", "B", ...]
        name = cols[0];
        nisn = cols[1] && /^\d+$/.test(cols[1]) ? cols[1] : `0081234${submissions.length + rowIdx + 1}`;
        answerStartIndex = cols[1] && /^\d+$/.test(cols[1]) ? 2 : 1;
      }

      const answers: Record<string, any> = {};
      questions.forEach((q, qIdx) => {
        const val = cols[answerStartIndex + qIdx] !== undefined ? cols[answerStartIndex + qIdx] : '';
        answers[q.id] = val;
      });

      newStudents.push({
        id: `paste_std_${Date.now()}_${rowIdx}`,
        nisn,
        name,
        answers,
      });
    });

    if (newStudents.length > 0) {
      onChange([...submissions, ...newStudents]);
      setExcelPasteText('');
      setActiveImportMode('table');
    }
  };

  // 2. Process CSV File Upload / Paste (Smart delimiter: ;, \t, or ,)
  const handleProcessCsv = (content: string) => {
    const rawLines = content.split('\n').map(l => l.trim()).filter(Boolean);
    if (rawLines.length === 0) return;

    // Filter comment lines & sep= directives
    const validLines = rawLines.filter(
      line => !line.startsWith('#') && !line.startsWith('//') && !line.toLowerCase().startsWith('sep=')
    );
    if (validLines.length === 0) return;

    // Detect delimiter from first non-comment line
    const firstLine = validLines[0];
    const delimiter = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';

    // Detect header
    let headerIdx = 0;
    for (let i = 0; i < Math.min(validLines.length, 5); i++) {
      const lower = validLines[i].toLowerCase();
      if (lower.includes('nama') || lower.includes('nisn') || lower.includes('soal')) {
        headerIdx = i;
        break;
      }
    }

    const headerCols = validLines[headerIdx].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    let nameColIdx = headerCols.findIndex(c => c.toLowerCase().includes('nama'));
    let nisnColIdx = headerCols.findIndex(c => c.toLowerCase().includes('nisn'));
    if (nameColIdx === -1) nameColIdx = 0;
    if (nisnColIdx === -1) nisnColIdx = 1;

    const dataLines = validLines.slice(headerIdx + 1);
    const newStudents: StudentSubmission[] = [];

    dataLines.forEach((line, rowIdx) => {
      if (line.toLowerCase().includes('contoh') || line.toLowerCase().includes('petunjuk')) return;

      const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 2) return;

      const name = cols[nameColIdx] || `Siswa ${rowIdx + 1}`;
      const nisn = cols[nisnColIdx] || `008123450${rowIdx + 1}`;

      const answers: Record<string, any> = {};
      const answerStart = Math.max(nameColIdx, nisnColIdx) + 1;

      questions.forEach((q, qIdx) => {
        const val = cols[answerStart + qIdx] !== undefined ? cols[answerStart + qIdx] : '';
        answers[q.id] = val;
      });

      newStudents.push({
        id: `csv_std_${Date.now()}_${rowIdx}`,
        nisn,
        name,
        answers,
      });
    });

    onChange([...submissions, ...newStudents]);
    setActiveImportMode('table');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        handleProcessCsv(content);
      }
    };
    reader.readAsText(file);
  };

  // 3. Process OCR Scan
  const handleProcessOcr = () => {
    if (!ocrRawText.trim()) return;
    const parsed = parseRawOcrSubmission(ocrRawText, questions.length);
    const notes: string[] = [];

    const newSubmissions: StudentSubmission[] = parsed.map((p, idx) => {
      notes.push(...p.cleanedLog);
      return {
        id: `ocr_std_${Date.now()}_${idx}`,
        nisn: p.nisn,
        name: p.studentName,
        answers: p.cleanedAnswers,
      };
    });

    setOcrCleanedNotes(notes.length > 0 ? notes : ['Normalisasi OCR berhasil tanpa kendala.']);
    onChange([...submissions, ...newSubmissions]);
    setActiveImportMode('table');
  };

  // Download Template with Semicolon (;) - Indonesian Excel Format so each item gets its OWN column A, B, C, D...
  const handleDownloadExcelTemplate = (delimiter: ';' | ',') => {
    const sep = delimiter;
    const headers = [
      'No',
      'Nama_Siswa',
      'NISN',
      ...questions.map(q => `Soal_${q.number}_${q.type.toUpperCase()}`),
    ];

    const sampleRow1 = [
      '1',
      'Ahmad Faiz Fadhlullah',
      '0081234501',
      ...questions.map(q => {
        if (q.type === 'pg') return q.correctOption || 'B';
        if (q.type === 'pgk') return 'A, C, D';
        if (q.type === 'bs') return 'B, S, B';
        if (q.type === 'isian') return q.isMathEquivalent ? '0.5' : 'fotosintesis';
        if (q.type === 'hitungan') return 'a=F/m=5';
        return 'Penjelasan jawaban siswa...';
      }),
    ];

    const sampleRow2 = [
      '2',
      'Bernadetta Larasati',
      '0081234502',
      ...questions.map(q => {
        if (q.type === 'pg') return q.correctOption || 'B';
        if (q.type === 'pgk') return 'A, C';
        if (q.type === 'bs') return 'B, B, B';
        if (q.type === 'isian') return q.isMathEquivalent ? '1/2' : 'fotosintesa';
        if (q.type === 'hitungan') return 'a=4';
        return 'Jawaban peredaran darah...';
      }),
    ];

    // Put sep=; directive on the first line so Microsoft Excel automatically breaks each into its OWN separate column!
    const csvLines = [
      `sep=${sep}`,
      headers.join(sep),
      sampleRow1.join(sep),
      sampleRow2.join(sep),
    ];

    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Template_Nilai_${questions.length}_Soal_Kolom_Terpisah.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Clean Tab-Separated Headers to Clipboard so Teacher can paste directly into Excel
  const handleCopyExcelHeaders = () => {
    const headers = [
      'No',
      'Nama_Siswa',
      'NISN',
      ...questions.map(q => `Soal_${q.number}_${q.type.toUpperCase()}`),
    ];
    const sampleRow = [
      '1',
      'Nama Siswa Contoh',
      '0081234501',
      ...questions.map(q => (q.type === 'pg' ? q.correctOption || 'A' : q.type === 'pgk' ? 'A, C' : 'Jawaban')),
    ];

    const clipboardText = headers.join('\t') + '\n' + sampleRow.join('\t');
    navigator.clipboard.writeText(clipboardText).then(() => {
      setCopiedClipboard(true);
      setTimeout(() => setCopiedClipboard(false), 3000);
    });
  };

  // Add a blank row to the table
  const handleAddBlankRow = () => {
    const newIdx = submissions.length + 1;
    const newStudent: StudentSubmission = {
      id: `row_${Date.now()}`,
      nisn: `00812345${newIdx < 10 ? '0' + newIdx : newIdx}`,
      name: `Siswa ${newIdx}`,
      answers: {},
    };
    onChange([...submissions, newStudent]);
  };

  // Update cell in table
  const handleUpdateStudentCell = (studentId: string, field: 'name' | 'nisn' | string, val: string) => {
    const updated = submissions.map(sub => {
      if (sub.id !== studentId) return sub;
      if (field === 'name') return { ...sub, name: val };
      if (field === 'nisn') return { ...sub, nisn: val };
      return {
        ...sub,
        answers: {
          ...sub.answers,
          [field]: val,
        },
      };
    });
    onChange(updated);
  };

  const handleRemoveStudent = (id: string) => {
    onChange(submissions.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-base font-bold text-slate-900">
              Impor Respon Jawaban Siswa
            </h2>
            <button
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-blue-700 hover:text-blue-900 font-semibold"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Petunjuk Kolom</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 mt-1 flex-wrap">
            <span>Siswa: <strong className="text-slate-900 font-mono">{submissions.length}</strong></span>
            <span>·</span>
            <span>Kolom Soal: <strong className="text-slate-900 font-mono">{questions.length} butir</strong></span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">1 Kolom per Soal</span>
          </div>
        </div>

        {/* Action Buttons for Template & Copy */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Copy Table Format Button */}
          <button
            type="button"
            onClick={handleCopyExcelHeaders}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shadow-2xs"
            title="Salin Kolom ke Clipboard lalu Ctrl+V di Excel / Spreadsheet"
          >
            {copiedClipboard ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Salin Format</span>
                <span className="sm:hidden">Salin</span>
              </>
            )}
          </button>

          {/* Download Excel Template */}
          <button
            type="button"
            onClick={() => handleDownloadExcelTemplate(';')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-300 shadow-2xs"
            title="Unduh File CSV yang Otomatis Terpisah Kolom A, B, C, D di Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unduh Excel</span>
            <span className="sm:hidden">Unduh</span>
          </button>

          {submissions.length === 0 ? (
            <button
              onClick={() => onChange(SAMPLE_STUDENTS)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 shadow-2xs"
              title="Muat 5 respon sampel"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Respon Sampel</span>
              <span className="sm:hidden">Sampel</span>
            </button>
          ) : (
            <button
              onClick={() => onChange([])}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Kosongkan Semua Siswa"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kosongkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Info Banner: Penjelasan Kolom Terpisah */}
      <div className="p-2.5 sm:p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-[10px] sm:text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
          <span>
            <strong>Format Mandiri:</strong> Kolom terpisah untuk <strong>No</strong>, <strong>Nama Siswa</strong>, <strong>NISN</strong>, dan tiap butir soal.
          </span>
        </div>
        <div className="text-[9px] sm:text-[10px] text-blue-800 font-mono shrink-0">
          Otomatis Kolom A, B, C, D... di Excel
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg mb-4 w-full overflow-x-auto scrollbar-none">
          {/* TAB 0: KAMERA SCAN OCR LANGSUNG (TERHUBUNG KE KAMERA HP / LAPTOP) */}
          <button
            type="button"
            onClick={() => setActiveImportMode('camera')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeImportMode === 'camera'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-blue-800 bg-blue-100/60 hover:bg-blue-100 font-semibold'
            }`}
            title="Scan Lembar Jawaban Langsung dari Kamera Ponsel/Laptop"
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span>Kamera</span>
            <span className="text-[9px] bg-blue-500 text-white px-1 py-0.2 rounded-full font-sans">Baru</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveImportMode('table')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeImportMode === 'table'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
            title="Tabel Matriks Grid Kolom Mandiri"
          >
            <Table className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Tabel</span>
            <span className="text-[9px] font-mono text-slate-400">({submissions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveImportMode('paste')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeImportMode === 'paste'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
            title="Salin dan Tempel Baris dari Excel (Ctrl+V)"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveImportMode('csv')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeImportMode === 'csv'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
            title="Unggah File Berkas .CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveImportMode('ocr')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeImportMode === 'ocr'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
            title="Tempel Teks Hasil OCR Scanner"
          >
            <ScanText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>OCR Teks</span>
          </button>
        </div>

        {/* TAB 0: CAMERA SCAN OCR (Langsung Terhubung ke Kamera) */}
        {activeImportMode === 'camera' && (
          <CameraOcrScanner
            questions={questions}
            onAddSubmission={(newSub) => onChange([...submissions, newSub])}
            onOpenTemplateModal={() => setShowAnswerSheetModal(true)}
            existingCount={submissions.length}
          />
        )}

        {/* TAB 1: SPREADSHEET MATRIX (Masing-Masing Nomor Soal Punya Kolom Sendiri-Sendiri) */}
        {activeImportMode === 'table' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-600 font-medium">
                Klik langsung pada sel mana pun untuk mengetik / mengedit jawaban siswa:
              </span>
              <button
                type="button"
                onClick={handleAddBlankRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-md shrink-0 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Baris Siswa</span>
              </button>
            </div>

            {/* Matrix Table with Explicit Separated Columns */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-xs max-h-[580px]">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 sticky top-0 z-10 font-mono">
                  <tr>
                    {/* Kolom 1: No */}
                    <th className="py-2.5 px-3 w-12 text-center border-r border-slate-300 bg-slate-100">
                      No
                    </th>

                    {/* Kolom 2: Nama Siswa */}
                    <th className="py-2.5 px-3 w-44 font-bold border-r border-slate-300 bg-slate-100 font-sans">
                      Nama Siswa
                    </th>

                    {/* Kolom 3: NISN */}
                    <th className="py-2.5 px-3 w-32 font-bold border-r border-slate-300 bg-slate-100">
                      NISN
                    </th>

                    {/* Kolom 4 s/d Seterusnya: Kolom Soal Sendiri-Sendiri */}
                    {questions.map((q) => (
                      <th
                        key={q.id}
                        className="py-2 px-3 min-w-[130px] max-w-[190px] border-r border-slate-300 align-top bg-slate-50 hover:bg-blue-50/50 transition-colors text-center"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 text-xs">
                            Soal {q.number}
                          </div>
                          <div className="text-[10px] text-blue-700 bg-blue-100/80 px-1 rounded uppercase font-semibold">
                            {q.type}
                          </div>
                          <div className="text-[9px] text-slate-400 font-sans truncate">
                            {q.type === 'pg' && 'Isi: A/B/C/D'}
                            {q.type === 'pgk' && 'Isi: A, C, D'}
                            {q.type === 'bs' && 'Isi: B, S, B'}
                            {q.type === 'isian' && 'Isi: Jawaban'}
                            {q.type === 'hitungan' && 'Isi: Hasil/Rumus'}
                            {q.type === 'esai' && 'Isi: Kalimat'}
                          </div>
                        </div>
                      </th>
                    ))}

                    <th className="py-2.5 px-3 w-12 text-center bg-slate-100">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {submissions.map((sub, idx) => (
                    <tr key={sub.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* Sel Kolom No */}
                      <td className="py-1.5 px-3 text-center font-mono text-slate-400 border-r border-slate-200 bg-slate-50/50">
                        {idx + 1}
                      </td>

                      {/* Sel Kolom Nama Siswa */}
                      <td className="py-1 px-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={sub.name}
                          onChange={(e) => handleUpdateStudentCell(sub.id, 'name', e.target.value)}
                          className="w-full text-xs font-semibold px-2 py-1 text-slate-900 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-blue-600 rounded"
                          placeholder="Nama Siswa..."
                        />
                      </td>

                      {/* Sel Kolom NISN */}
                      <td className="py-1 px-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={sub.nisn}
                          onChange={(e) => handleUpdateStudentCell(sub.id, 'nisn', e.target.value)}
                          className="w-full text-xs font-mono px-2 py-1 text-slate-600 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-blue-600 rounded"
                          placeholder="NISN..."
                        />
                      </td>

                      {/* Sel Masing-Masing Nomor Soal (Kolom Sendiri) */}
                      {questions.map((q) => {
                        const rawVal = sub.answers[q.id] ?? sub.answers[String(q.number)] ?? '';
                        const displayVal = Array.isArray(rawVal)
                          ? rawVal.join(', ')
                          : typeof rawVal === 'object' && rawVal !== null
                          ? Object.entries(rawVal)
                              .map(([k, v]) => `${k}:${v ? 'B' : 'S'}`)
                              .join(', ')
                          : String(rawVal);

                        return (
                          <td key={q.id} className="py-1 px-2 border-r border-slate-200">
                            <input
                              type="text"
                              value={displayVal}
                              onChange={(e) => handleUpdateStudentCell(sub.id, q.id, e.target.value)}
                              className="w-full text-xs font-mono text-center px-2 py-1 text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-blue-600 rounded"
                              placeholder={
                                q.type === 'pg' ? 'A/B/C/D' : q.type === 'pgk' ? 'A, C' : 'Ketik...'
                              }
                            />
                          </td>
                        );
                      })}

                      {/* Sel Aksi Hapus */}
                      <td className="py-1.5 px-3 text-center">
                        <button
                          onClick={() => handleRemoveStudent(sub.id)}
                          className="p-1 text-slate-400 hover:text-red-700 rounded transition-colors"
                          title="Hapus Baris Siswa Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan={4 + questions.length} className="py-12 text-center text-xs text-slate-500">
                        <div className="max-w-md mx-auto space-y-3">
                          <p className="font-semibold text-slate-700">Tabel jawaban siswa masih kosong.</p>
                          <p className="text-[11px] text-slate-500">
                            Bapak/Ibu dapat menambah baris baru, paste dari Excel, atau mengunduh template kolom.
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={handleAddBlankRow}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah Baris Siswa</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onChange(SAMPLE_STUDENTS)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Muat 5 Respon Sampel</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PASTE BARIS DARI EXCEL */}
        {activeImportMode === 'paste' && (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs text-indigo-950 space-y-2">
              <strong className="text-indigo-900 block font-bold text-sm">
                📋 Paste Cepat dari Microsoft Excel / Google Sheets
              </strong>
              <p className="text-[11px] text-indigo-900 leading-relaxed">
                Di file Excel Anda, cukup <strong>blok kolom</strong>: <code>Nama Siswa, NISN, Soal 1, Soal 2, Soal 3...</code> lalu tekan <strong>Ctrl+C</strong>. Kemudian klik kotak di bawah dan tekan <strong>Ctrl+V</strong> lalu klik tombol <em>Masukkan ke Tabel</em>.
              </p>
            </div>

            <textarea
              rows={6}
              value={excelPasteText}
              onChange={(e) => setExcelPasteText(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              placeholder={`Contoh baris yang di-copy dari Excel:\nAhmad Faiz\t0081234501\tB\tA, C, D\tB, S, B\t0.5\tfotosintesis\nBernadetta\t0081234502\tB\tA, C\tB, B, B\t1/2\tfotosintesa`}
            />

            <button
              type="button"
              onClick={handleProcessExcelPaste}
              disabled={!excelPasteText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 rounded-lg shadow-xs transition-colors"
            >
              <ClipboardPaste className="w-4 h-4" />
              <span>Masukkan ke Tabel Kolom</span>
            </button>
          </div>
        )}

        {/* TAB 3: UNGGAH BERKAS CSV */}
        {activeImportMode === 'csv' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <strong className="block text-sm font-bold text-emerald-900">
                  Unggah Berkas File Nilai:
                </strong>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Mendukung file CSV berpemisah titik koma (;) standar Excel Indonesia maupun koma (,).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadExcelTemplate(';')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 rounded-md hover:bg-emerald-50 font-bold text-xs shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template Excel (;)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadExcelTemplate(',')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium text-xs shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV (,)</span>
                </button>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-8 text-center bg-slate-50/50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-xs font-semibold text-blue-700 hover:underline">
                  Klik untuk pilih file .CSV
                </span>
                <span className="text-xs text-slate-500"> atau seret ke area ini</span>
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 4: SCAN OCR */}
        {activeImportMode === 'ocr' && (
          <div className="space-y-4">
            {/* BANNER TEMPLATE LJK SIAP CETAK / UNDUH */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-700 text-white rounded-xl shadow-xs shrink-0">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Template Lembar Jawaban Siswa (LJK Standar Cetak A4)
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                      Direkomendasikan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Gunakan lembar jawaban berpetak kotak huruf balok dan marker bidik kamera resmi agar foto hasil ujian dari HP dapat dipindai OCR dengan akurasi 100%.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAnswerSheetModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Unduh Template LJK A4</span>
              </button>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100 text-xs text-purple-950">
              <strong className="text-purple-900 block font-semibold mb-1">
                Filter Pembersih Noise OCR Otomatis:
              </strong>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Menghapus noise scanner (seperti simbol anomali ^, ~, |, perbaikan huruf 'l' dan angka '1') lalu memetakan ke kolom masing-masing nomor soal.
              </p>
            </div>

            <textarea
              rows={6}
              value={ocrRawText}
              onChange={(e) => setOcrRawText(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
              placeholder="Tempelkan hasil teks scan kamera..."
            />

            {ocrCleanedNotes.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Log Pembersihan OCR:</span>
                {ocrCleanedNotes.map((note, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleProcessOcr}
              disabled={!ocrRawText.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 rounded-lg transition-colors"
            >
              <ScanText className="w-3.5 h-3.5" />
              <span>Bersihkan &amp; Masukkan ke Kolom Tabel</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL PANDUAN FORMAT */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-700" />
                <span>Petunjuk Format Kolom Soal Sendiri-Sendiri</span>
              </h3>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
              >
                Tutup
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 text-xs text-slate-700">
              <p className="text-slate-600 leading-relaxed">
                Di file Excel maupun pada tabel di aplikasi, setiap butir soal menempati satu kolom tersendiri:
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
                <div>Kolom A: <strong>No</strong> (Nomor Urut / Absen)</div>
                <div>Kolom B: <strong>Nama_Siswa</strong> (Nama Lengkap)</div>
                <div>Kolom C: <strong>NISN</strong> (Nomor Induk Siswa)</div>
                <div>Kolom D dst: <strong>Soal 1</strong>, <strong>Soal 2</strong>, <strong>Soal 3</strong> ... (Satu kolom per butir soal)</div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="font-bold text-slate-900">Format Isi Sel Jawaban:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><strong>PG:</strong> Tulis 1 huruf (contoh: <code>A</code>, <code>B</code>, <code>C</code>, <code>D</code>)</li>
                  <li><strong>PGK:</strong> Tulis huruf dipisah koma (contoh: <code>A, C, D</code>)</li>
                  <li><strong>Benar/Salah:</strong> Tulis B atau S (contoh: <code>B, S, B</code>)</li>
                  <li><strong>Isian:</strong> Tulis kata kunci atau angka desimal/pecahan (contoh: <code>0.5</code> atau <code>fotosintesis</code>)</li>
                  <li><strong>Hitungan/Esai:</strong> Tuliskan langkah atau kalimat penjelasan</li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TEMPLATE LEMBAR JAWABAN SISWA (LJK CETAK A4) */}
      <AnswerSheetTemplateModal
        isOpen={showAnswerSheetModal}
        onClose={() => setShowAnswerSheetModal(false)}
        meta={meta || DEFAULT_SCHOOL_META}
        questions={questions}
      />
    </div>
  );
};
