import React from 'react';
import { SchoolAssessmentMeta, QuestionItem } from '../types/grader';
import { Printer, Download, X, CheckSquare, Sparkles, AlertCircle } from 'lucide-react';

interface AnswerSheetTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  meta: SchoolAssessmentMeta;
  questions: QuestionItem[];
}

export const AnswerSheetTemplateModal: React.FC<AnswerSheetTemplateModalProps> = ({
  isOpen,
  onClose,
  meta,
  questions,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Separate questions by type
  const pgQuestions = questions.filter((q) => q.type === 'pg');
  const pgkQuestions = questions.filter((q) => q.type === 'pgk');
  const bsQuestions = questions.filter((q) => q.type === 'bs');
  const isianQuestions = questions.filter((q) => q.type === 'isian');
  const nonEssayQuestions = questions.filter((q) => q.type !== 'esai');

  // Fallback to standard 20 PG + 5 Isian if questions list is empty
  const totalItemCount = questions.length > 0 ? questions.length : 25;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden my-auto">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-lg">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Template Lembar Jawaban Siswa (LJK OCR Tulisan Tangan)
              </h3>
              <p className="text-xs text-slate-400">
                Format standar A4 dengan kotak isian huruf balok dan marker bidik kamera untuk akurasi OCR maksimal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF (A4)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tip Box for Teachers */}
        <div className="no-print bg-blue-50 border-b border-blue-100 px-6 py-3 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Petunjuk Guru:</strong> Cetak lembar ini dan bagikan kepada siswa saat ujian. Minta siswa menulis huruf kapital tebal di dalam kotak. Saat ujian selesai, foto lembar jawaban tegak lurus dengan kamera HP untuk dipindai OCR.
            </span>
          </div>
        </div>

        {/* PRINTABLE A4 ANSWER SHEET CONTAINER */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div className="bg-white text-black p-6 sm:p-10 w-full max-w-[210mm] min-h-[297mm] shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 text-xs">
            
            {/* CORNER REGISTRATION MARKS FOR CAMERA OCR (Marker 4 Sudut) */}
            <div className="relative">
              <div className="absolute -top-3 -left-3 w-5 h-5 border-t-4 border-l-4 border-black" title="OCR Target Marker Top-Left" />
              <div className="absolute -top-3 -right-3 w-5 h-5 border-t-4 border-r-4 border-black" title="OCR Target Marker Top-Right" />

              {/* KOP RESMI LEMBAR JAWABAN */}
              <div className="pb-2 mb-4">
                <div className="flex items-center gap-4">
                  {meta.schoolLogoUrl && (
                    <div className="shrink-0 w-16 h-16 flex items-center justify-center">
                      <img
                        src={meta.schoolLogoUrl}
                        alt="Logo Sekolah"
                        className="max-h-16 max-w-16 object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 text-center">
                    <h1 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      PEMERINTAH KABUPATEN SLEMAN · DINAS PENDIDIKAN
                    </h1>
                    <h2 className="text-base font-extrabold uppercase tracking-wide text-black mt-0.5">
                      {meta.schoolName || 'SD NEGERI GENTAN'}
                    </h2>
                    <p className="text-[10px] text-slate-700">
                      {meta.schoolAddress} · NPSN: {meta.npsn}
                    </p>
                  </div>
                  {meta.schoolLogoUrl && (
                    <div className="shrink-0 w-16 h-16 invisible hidden sm:block" />
                  )}
                </div>
                <div className="border-t-2 border-black mt-2"></div>
                <div className="border-t border-black mt-0.5"></div>
              </div>

              {/* JUDUL LEMBAR JAWABAN */}
              <div className="text-center mb-3">
                <h3 className="text-sm font-black uppercase underline tracking-wider">
                  LEMBAR JAWABAN ASESMEN SISWA (LJK RESMI)
                </h3>
                <p className="text-[10px] text-slate-600 mt-0.5 font-mono">
                  Mata Pelajaran: <strong>{meta.subject}</strong> · Kelas: <strong>{meta.gradeClass}</strong> · Semester: {meta.semester} {meta.academicYear}
                </p>
              </div>

              {/* IDENTITAS SISWA BOX & PETUNJUK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-2 border-black p-3 mb-4 bg-slate-50/50 print:bg-transparent">
                <div className="space-y-2 text-[11px]">
                  <div>
                    <span className="font-bold text-slate-800 block text-[10px] uppercase">Nama Lengkap Siswa:</span>
                    <div className="h-7 border-b border-black flex items-center px-2 font-mono font-bold text-sm tracking-widest bg-white print:bg-transparent">
                      ...........................................................................
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-bold text-slate-800 block text-[10px] uppercase">Nomor Absen:</span>
                      <div className="h-6 border-b border-black flex items-center px-2 font-mono">
                        [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block text-[10px] uppercase">Tanggal Ujian:</span>
                      <div className="h-6 border-b border-black flex items-center px-1 font-mono text-[10px]">
                        {meta.date || '.... / .... / 2026'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-l sm:border-l-2 border-black/40 pl-3 space-y-1.5 text-[10px]">
                  <span className="font-bold text-slate-900 block uppercase">Petunjuk Pengisian Scanner OCR:</span>
                  <ol className="list-decimal pl-4 space-y-0.5 text-slate-700 leading-tight">
                    <li>Gunakan <strong>pulpen warna hitam / biru tua</strong> atau pensil 2B.</li>
                    <li>Tulis <strong>HURUF KAPITAL JELAS</strong> (A, B, C, D) tepat di dalam kotak.</li>
                    <li>Untuk soal PGK, tulis huruf pilihan dipisah koma (contoh: <code>A, C</code>).</li>
                    <li>Untuk Benar/Salah, tulis <code>B</code> atau <code>S</code> pada tiap kolom.</li>
                    <li>Jaga lembar agar <strong>tidak terlipat, basah, atau kotor</strong>.</li>
                  </ol>
                </div>
              </div>

              {/* KOTAK NISN SISWA DENGAN 10 PETAK ANGKA */}
              <div className="border border-black p-2 mb-4 flex items-center justify-between text-[11px] bg-slate-50/30 print:bg-transparent">
                <span className="font-bold uppercase text-[10px]">NISN Siswa (Tulis 1 Angka Per Kotak):</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 border-2 border-black flex items-center justify-center font-mono font-bold text-xs bg-white print:bg-transparent"
                    >
                      &nbsp;
                    </div>
                  ))}
                </div>
              </div>

              {/* GRID KOTAK LEMBAR JAWABAN (BAGIAN INTI) */}
              <div className="border-2 border-black p-3 mb-4">
                <div className="text-center font-bold uppercase tracking-wider text-[11px] border-b-2 border-black pb-1 mb-3 bg-slate-100 print:bg-transparent">
                  KOTAK ISIAN JAWABAN SISWA
                </div>

                {/* TAMPILAN 3 KOLOM SIMETRIS UNTUK EFISIENSI KERTAS A4 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                  {(questions.length > 0 ? questions : Array.from({ length: 25 }, (_, idx) => ({
                    id: `q_sample_${idx + 1}`,
                    number: idx + 1,
                    type: idx < 15 ? 'pg' : idx < 20 ? 'pgk' : 'isian',
                    prompt: '',
                    weight: 5,
                  } as QuestionItem))).map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between border border-black/60 p-1.5 rounded-xs bg-white print:bg-transparent"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs w-6 text-center">
                          {q.number}.
                        </span>
                        <span className="text-[9px] uppercase font-mono px-1 bg-slate-100 border border-slate-300 rounded-xs">
                          {q.type}
                        </span>
                      </div>

                      {/* Kotak Karakter Jawaban sesuai Tipe Soal */}
                      {q.type === 'pg' && (
                        <div className="flex items-center gap-1">
                          <div className="w-7 h-7 border-2 border-black flex items-center justify-center font-mono font-bold text-sm bg-slate-50/50 print:bg-transparent">
                            &nbsp;
                          </div>
                          <span className="text-[8px] text-slate-400 font-mono">(A/B/C/D)</span>
                        </div>
                      )}

                      {q.type === 'pgk' && (
                        <div className="flex items-center gap-0.5">
                          <div className="w-14 h-7 border-2 border-black flex items-center justify-center font-mono text-xs px-1 bg-slate-50/50 print:bg-transparent">
                            &nbsp;
                          </div>
                          <span className="text-[8px] text-slate-400 font-mono">(A,C)</span>
                        </div>
                      )}

                      {q.type === 'bs' && (
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-7 border-2 border-black flex items-center justify-center font-mono font-bold text-xs bg-slate-50/50 print:bg-transparent">
                            &nbsp;
                          </div>
                          <span className="text-[8px] text-slate-400 font-mono">(B/S)</span>
                        </div>
                      )}

                      {q.type === 'isian' && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 6 }).map((_, bi) => (
                            <div
                              key={bi}
                              className="w-4 h-6 border border-black flex items-center justify-center font-mono text-[10px]"
                            >
                              &nbsp;
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === 'hitungan' && (
                        <div className="w-16 h-7 border-2 border-black flex items-center justify-center font-mono text-[10px]">
                          &nbsp;
                        </div>
                      )}

                      {q.type === 'esai' && (
                        <div className="w-16 h-7 border-2 border-dashed border-black flex items-center justify-center text-[9px] text-slate-500 font-sans">
                          (Di Lembar Uraian)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* KOLOM TANDA TANGAN & SKOR NILAI HASIL SCAN OCR */}
              <div className="grid grid-cols-2 gap-4 border border-black p-3 text-[10px]">
                <div className="text-center">
                  <p className="text-slate-600 mb-8">Tanda Tangan Peserta Didik,</p>
                  <p className="font-bold underline">( .................................................... )</p>
                </div>
                <div className="border-l border-black/40 pl-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold block text-slate-900 uppercase">Verifikasi Pemeriksa:</span>
                    <span className="text-slate-600 block">Guru: {meta.teacherName}</span>
                    <span className="text-slate-500 font-mono text-[9px]">Status Koreksi: Scan OCR / Hibrida</span>
                  </div>
                  <div className="w-16 h-12 border-2 border-black flex flex-col items-center justify-center bg-slate-50 print:bg-transparent">
                    <span className="text-[8px] text-slate-500 uppercase">Nilai</span>
                    <span className="font-mono font-bold text-sm">.....</span>
                  </div>
                </div>
              </div>

              {/* CORNER REGISTRATION MARKS BOTTOM */}
              <div className="absolute -bottom-3 -left-3 w-5 h-5 border-b-4 border-l-4 border-black" title="OCR Target Marker Bottom-Left" />
              <div className="absolute -bottom-3 -right-3 w-5 h-5 border-b-4 border-r-4 border-black" title="OCR Target Marker Bottom-Right" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
