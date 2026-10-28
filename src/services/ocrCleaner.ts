/**
 * OCR Noise Cleaner & Scanner Text Normalizer
 * Menangani anomali pemindaian kamera, LJK, dan tulisan tangan siswa.
 */

export interface CleanedScanResult {
  studentName: string;
  nisn: string;
  cleanedAnswers: Record<string, string>;
  cleanedLog: string[];
}

export function cleanOcrNoiseString(rawText: string): string {
  if (!rawText) return '';

  let cleaned = rawText;

  // 1. Bersihkan karakter anomali scanner umum
  cleaned = cleaned.replace(/[\^~|`_\\]/g, ' ');

  // 2. Normalisasi kutip dan backtick
  cleaned = cleaned.replace(/['"“”‘’]/g, '');

  // 3. Rapikan spasi berlebih
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Normalisasi jawaban pilihan ganda dari OCR:
 * Contoh: '(A)' -> 'A', '1. A' -> 'A', 'Opsi: C' -> 'C'
 */
export function normalizeOcrOption(input: string): string {
  if (!input) return '';
  const trimmed = input.trim().toUpperCase();

  // Pola tunggal A-Z
  const singleMatch = trimmed.match(/^[(\[]?([A-E])[)\]\.]?$/);
  if (singleMatch) return singleMatch[1];

  // Pola di dalam kalimat: e.g. "Jawaban: B"
  const wordMatch = trimmed.match(/\b([A-E])\b/);
  if (wordMatch) return wordMatch[1];

  return trimmed;
}

/**
 * Parse teks masukan bebas (OCR / Form Scan / Baris Teks)
 * Contoh masukan:
 * Nama: Andi Pratama
 * 1. A
 * 2. C, D
 * 3. Fotosintesis
 * 4. 0,5
 * 5. Mitokondria berfungsi sebagai penghasil energi...
 */
export function parseRawOcrSubmission(rawBatchText: string, expectedCount: number = 5): CleanedScanResult[] {
  if (!rawBatchText.trim()) return [];

  // Pisahkan jika ada pemisah multi-siswa (misal "---" atau baris baru ganda dengan kata "Nama:")
  const studentChunks = rawBatchText.split(/(?:---|===|\n(?=(?:Nama|Nama Siswa|SISWA):))/i);
  const results: CleanedScanResult[] = [];

  studentChunks.forEach((chunk, index) => {
    const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    let studentName = `Siswa ${index + 1}`;
    let nisn = `100${index + 1}`;
    const cleanedAnswers: Record<string, string> = {};
    const cleanedLog: string[] = [];

    lines.forEach(line => {
      // Deteksi Nama Siswa
      const nameMatch = line.match(/^(?:Nama|Nama Siswa|Student Name)[:\s]+(.+)$/i);
      if (nameMatch) {
        studentName = cleanOcrNoiseString(nameMatch[1]);
        return;
      }

      // Deteksi NISN / No Absen
      const nisnMatch = line.match(/^(?:NISN|No|Absen)[:\s]+(\d+)/i);
      if (nisnMatch) {
        nisn = nisnMatch[1];
        return;
      }

      // Deteksi Baris Jawaban: contoh "1. A", "Soal 2 = B, C", "3: fotosintesis"
      const questionMatch = line.match(/^(?:Q|Soal|No\.?)?\s*(\d+)[\.\:=)\s]+(.+)$/i);
      if (questionMatch) {
        const qNum = questionMatch[1];
        let ansText = cleanOcrNoiseString(questionMatch[2]);

        // Bersihkan anomali angka: bila jawaban berupa digit 'l' diganti '1'
        if (/^[lI]$/.test(ansText)) {
          ansText = '1';
          cleanedLog.push(`Soal #${qNum}: Mengoreksi karakter noise '${ansText}' menjadi angka '1'`);
        }

        cleanedAnswers[qNum] = ansText;
      }
    });

    // Jika tidak ada nomor eksplisit, petakan baris per baris
    if (Object.keys(cleanedAnswers).length === 0) {
      lines.forEach((line, lineIdx) => {
        if (lineIdx < expectedCount) {
          const qNum = String(lineIdx + 1);
          cleanedAnswers[qNum] = cleanOcrNoiseString(line);
        }
      });
    }

    results.push({
      studentName,
      nisn,
      cleanedAnswers,
      cleanedLog,
    });
  });

  return results;
}
