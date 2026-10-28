import React from 'react';
import {
  SchoolAssessmentMeta,
  QuestionItem,
  StudentGradedResult,
  ClassDiagnosticsSummary,
} from '../types/grader';
import { Printer, ArrowLeft } from 'lucide-react';

interface PrintReportViewProps {
  meta: SchoolAssessmentMeta;
  questions: QuestionItem[];
  results: StudentGradedResult[];
  diagnostics: ClassDiagnosticsSummary;
  onBack: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  meta,
  questions,
  results,
  diagnostics,
  onBack,
}) => {
  const handlePrintTrigger = () => {
    window.print();
  };

  const totalStudents = results.length;
  const passCount = results.filter((r) => r.status === 'Tuntas').length;

  return (
    <div className="space-y-6">
      {/* Screen toolbar (hidden in print) */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Ukuran Cetak Baku: Kertas A4 Portrait
          </span>
          <button
            onClick={handlePrintTrigger}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Sekarang (PDF)</span>
          </button>
        </div>
      </div>

      {/* PRINT CONTAINER */}
      <div className="bg-white text-black p-4 sm:p-8 rounded-xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none">
        
        {/* ============================================================== */}
        {/* DOKUMEN 1: REKAPITULASI HASIL PENILAIAN ASESMEN KELAS           */}
        {/* ============================================================== */}
        <section className="page-break-after mb-12 print:mb-0">
          {/* KOP SURAT RESMI */}
          <div className="pb-3 mb-6">
            <div className="flex items-center gap-4">
              {meta.showLogoInLetterhead && meta.schoolLogoUrl && (
                <div className="shrink-0 w-20 h-20 flex items-center justify-center">
                  <img
                    src={meta.schoolLogoUrl}
                    alt="Logo Sekolah"
                    className="max-h-20 max-w-20 object-contain print:max-h-20"
                  />
                </div>
              )}
              <div className="flex-1 text-center">
                <h1 className="text-base font-bold uppercase tracking-wide leading-tight text-slate-800">
                  PEMERINTAH KABUPATEN SLEMAN / DINAS PENDIDIKAN
                </h1>
                <h2 className="text-xl font-extrabold uppercase tracking-wider leading-tight text-slate-950 mt-0.5">
                  {meta.schoolName || 'SATUAN PENDIDIKAN RESMI'}
                </h2>
                <p className="text-xs text-slate-700 mt-1">
                  {meta.schoolAddress} · NPSN: {meta.npsn}
                </p>
              </div>
              {/* Spacer penyeimbang simetri */}
              {meta.showLogoInLetterhead && meta.schoolLogoUrl && (
                <div className="shrink-0 w-20 h-20 hidden sm:block invisible" aria-hidden="true" />
              )}
            </div>
            {/* Garis Ganda Baku Kop Dinas Pendidikan (Tebal atas, Tipis bawah) */}
            <div className="border-t-2 border-black mt-3"></div>
            <div className="border-t border-black mt-0.5"></div>
          </div>

          {/* JUDUL LAPORAN */}
          <div className="text-center mb-6">
            <h3 className="text-base font-bold uppercase underline">
              LAPORAN HASIL PENILAIAN &amp; KETUNTASAN BELAJAR
            </h3>
            <p className="text-xs text-slate-700 mt-0.5 font-mono">
              Tahun Ajaran {meta.academicYear} · Semester {meta.semester}
            </p>
          </div>

          {/* TABEL IDENTITAS ASESMEN */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6 border border-black p-3 bg-slate-50/50 print:bg-transparent">
            <div className="space-y-1">
              <div>
                <span className="font-semibold text-slate-700">Mata Pelajaran: </span>
                <span className="font-bold text-slate-900">{meta.subject}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Kelas / Fase: </span>
                <span className="text-slate-900">{meta.gradeClass}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Tanggal Asesmen: </span>
                <span className="text-slate-900">{meta.date}</span>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div>
                <span className="font-semibold text-slate-700">KKM Acuan: </span>
                <span className="font-mono font-bold text-slate-900">{meta.kkm}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Rata-Rata Kelas: </span>
                <span className="font-mono font-bold text-slate-900">{diagnostics.averageScore}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Ketuntasan Klasikal: </span>
                <span className="font-mono font-bold text-slate-900">
                  {diagnostics.passPercentage}% ({passCount}/{totalStudents} Siswa)
                </span>
              </div>
            </div>
          </div>

          {/* TABEL REKAPITULASI NILAI KELAS */}
          <div className="mb-8">
            <table className="w-full text-xs text-left border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100 print:bg-slate-200 border-b border-black font-semibold text-center font-mono">
                  <th className="border border-black py-2 px-2 w-10">No</th>
                  <th className="border border-black py-2 px-4 text-left">Nama Lengkap Siswa</th>
                  <th className="border border-black py-2 px-3 w-28">NISN</th>
                  <th className="border border-black py-2 px-3 w-20">Skor Obj</th>
                  <th className="border border-black py-2 px-3 w-20">Skor Esai</th>
                  <th className="border border-black py-2 px-3 w-20 font-bold">Nilai Akhir</th>
                  <th className="border border-black py-2 px-3 w-24">Status KKM</th>
                </tr>
              </thead>
              <tbody>
                {results.map((st, idx) => {
                  let objScore = 0;
                  let subjScore = 0;
                  Object.values(st.questionScores).forEach((q) => {
                    if (q.questionType === 'esai' || q.questionType === 'hitungan') {
                      subjScore += q.score;
                    } else {
                      objScore += q.score;
                    }
                  });

                  return (
                    <tr key={st.studentId} className="border-b border-black text-center font-mono">
                      <td className="border border-black py-1.5 px-2">{idx + 1}</td>
                      <td className="border border-black py-1.5 px-4 text-left font-sans font-medium">
                        {st.studentName}
                      </td>
                      <td className="border border-black py-1.5 px-3">{st.nisn}</td>
                      <td className="border border-black py-1.5 px-3 tabular-nums">{Math.round(objScore * 10) / 10}</td>
                      <td className="border border-black py-1.5 px-3 tabular-nums">{Math.round(subjScore * 10) / 10}</td>
                      <td className="border border-black py-1.5 px-3 font-bold text-sm tabular-nums">
                        {st.percentageScore}
                      </td>
                      <td className="border border-black py-1.5 px-3 font-semibold font-sans">
                        {st.status === 'Tuntas' ? (
                          <span className="text-emerald-800">TUNTAS</span>
                        ) : (
                          <span className="text-rose-800">REMEDIAL</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DIAGNOSTIK KELAS SINGKAT PADA LEMBAR REKAP */}
          {diagnostics.misconceptions.length > 0 && (
            <div className="border border-black p-3 mb-8 text-xs bg-slate-50/50 print:bg-transparent">
              <span className="font-bold block mb-1">
                Catatan Diagnostik Guru &amp; Analisis Miskonsepsi:
              </span>
              <ul className="list-disc pl-4 space-y-1">
                {diagnostics.misconceptions.map((m, idx) => (
                  <li key={idx}>
                    <strong>Soal #{m.questionNumber} ({m.errorPercentage}% Salah):</strong> {m.rootCause} — <em>Tindak Lanjut: {m.pedagogicalRemedy}</em>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TANDA TANGAN PENGESAHAN */}
          <div className="grid grid-cols-2 gap-8 text-xs text-center mt-12 avoid-break-inside">
            <div>
              <p className="text-slate-600 mb-16">
                Mengetahui,<br />
                Kepala Satuan Pendidikan
              </p>
              <p className="font-bold underline uppercase">{meta.principalName || '........................................'}</p>
              <p className="font-mono text-[11px] text-slate-700">NIP. {meta.principalNip || '-'}</p>
            </div>

            <div>
              <p className="text-slate-600 mb-16">
                {meta.date ? `Diperiksa pada ${meta.date}` : 'Guru Mata Pelajaran'},<br />
                Guru Pengampu
              </p>
              <p className="font-bold underline uppercase">{meta.teacherName || '........................................'}</p>
              <p className="font-mono text-[11px] text-slate-700">NIP. {meta.teacherNip || '-'}</p>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* DOKUMEN 2: LEMBAR RAPOR EVALUASI INDIVIDUAL PER SISWA          */}
        {/* (Setiap siswa dipisahkan dengan page-break-after: always)       */}
        {/* ============================================================== */}
        {results.map((student) => (
          <section
            key={student.studentId}
            className="page-break-after pt-8 print:pt-4 border-t-2 border-dashed border-slate-300 print:border-none print:mt-0"
          >
            {/* Header Mini Rapor dengan Logo */}
            <div className="pb-2 mb-4">
              <div className="flex items-center gap-3">
                {meta.showLogoInLetterhead && meta.schoolLogoUrl && (
                  <div className="shrink-0 w-14 h-14 flex items-center justify-center">
                    <img
                      src={meta.schoolLogoUrl}
                      alt="Logo Sekolah"
                      className="max-h-14 max-w-14 object-contain print:max-h-14"
                    />
                  </div>
                )}
                <div className="flex-1 text-center">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">{meta.schoolName}</h2>
                  <h3 className="text-base font-extrabold uppercase underline text-slate-950">
                    LEMBAR EVALUASI &amp; DIAGNOSTIK HASIL BELAJAR SISWA
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Mata Pelajaran: <strong>{meta.subject}</strong> · Kelas: <strong>{meta.gradeClass}</strong> · KKM: <strong>{meta.kkm}</strong>
                  </p>
                </div>
                {meta.showLogoInLetterhead && meta.schoolLogoUrl && (
                  <div className="shrink-0 w-14 h-14 hidden sm:block invisible" aria-hidden="true" />
                )}
              </div>
              <div className="border-t-2 border-black mt-2"></div>
              <div className="border-t border-black mt-0.5"></div>
            </div>

            {/* Identitas Siswa & Capaian */}
            <div className="grid grid-cols-2 gap-4 border border-black p-3 text-xs mb-4">
              <div>
                <div>Nama Siswa: <strong className="text-slate-900">{student.studentName}</strong></div>
                <div>NISN: <span className="font-mono font-semibold">{student.nisn}</span></div>
                <div>Tanggal Evaluasi: {meta.date}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-600">Nilai Akhir:</div>
                <div className="text-2xl font-bold font-mono">
                  {student.percentageScore} <span className="text-xs text-slate-500 font-sans">/ 100</span>
                </div>
                <div>
                  Status Ketuntasan:{' '}
                  <strong className={student.status === 'Tuntas' ? 'text-emerald-800' : 'text-rose-800'}>
                    {student.status.toUpperCase()}
                  </strong>
                </div>
              </div>
            </div>

            {/* Rincian Koreksi Per Soal */}
            <div className="mb-4">
              <span className="text-xs font-bold block mb-1.5 uppercase tracking-wide">
                Rincian Evaluasi Jawaban Per Butir Soal:
              </span>
              <table className="w-full text-[11px] text-left border-collapse border border-black">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200 border-b border-black font-semibold text-center font-mono">
                    <th className="border border-black py-1.5 px-2 w-8">No</th>
                    <th className="border border-black py-1.5 px-2 w-16">Tipe</th>
                    <th className="border border-black py-1.5 px-3 text-left">Jawaban Siswa</th>
                    <th className="border border-black py-1.5 px-3 text-left">Kunci / Acuan</th>
                    <th className="border border-black py-1.5 px-2 w-14">Skor</th>
                    <th className="border border-black py-1.5 px-3 text-left">Catatan / Umpan Balik Perbaikan</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => {
                    const detail = student.questionScores[q.id];
                    if (!detail) return null;

                    return (
                      <tr key={q.id} className="border-b border-black align-top">
                        <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">
                          {q.number}
                        </td>
                        <td className="border border-black py-1.5 px-2 text-center uppercase font-mono text-[10px]">
                          {q.type}
                        </td>
                        <td className="border border-black py-1.5 px-3 font-mono">
                          {detail.studentAnswerDisplay || '(Kosong)'}
                        </td>
                        <td className="border border-black py-1.5 px-3 font-mono text-slate-700">
                          {detail.keyAnswerDisplay}
                        </td>
                        <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">
                          {detail.score} / {detail.maxScore}
                        </td>
                        <td className="border border-black py-1.5 px-3 text-slate-800">
                          {detail.feedback}
                          {detail.isOverridden && (
                            <div className="text-[10px] text-amber-900 italic mt-0.5">
                              [Override Guru]: {detail.overrideReason}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Catatan Evaluasi Personal Siswa */}
            <div className="border border-black p-3 text-xs mb-4 bg-slate-50/40 print:bg-transparent">
              <span className="font-bold block mb-1">Catatan Motivasi &amp; Tindak Lanjut Siswa:</span>
              <p className="leading-relaxed text-slate-800">
                {student.personalFeedbackNotes}
              </p>
            </div>

            {/* Rekomendasi Program Tindak Lanjut (Remedial / Pengayaan) */}
            {student.followUpProgram && (
              <div className="border border-black p-3 text-xs mb-8 bg-slate-50/30 print:bg-transparent avoid-break-inside">
                <div className="flex items-center justify-between border-b border-black/30 pb-1.5 mb-2">
                  <span className="font-bold uppercase tracking-wider text-slate-900">
                    Program Tindak Lanjut:{' '}
                    <span className={student.followUpProgram.type === 'Remedial' ? 'text-rose-900' : 'text-emerald-900'}>
                      {student.followUpProgram.type.toUpperCase()} ({student.followUpProgram.activityCategory})
                    </span>
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-700">
                    Target: {student.followUpProgram.completionTarget}
                  </span>
                </div>

                <div className="font-semibold text-slate-900 mb-1">
                  {student.followUpProgram.title}
                </div>
                <p className="text-slate-800 leading-relaxed mb-2 text-[11px]">
                  {student.followUpProgram.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-black/20 text-[11px]">
                  <div>
                    <span className="font-semibold text-slate-700">Materi / Indikator Fokus: </span>
                    <span className="text-slate-900">
                      {student.followUpProgram.focusTopics.length > 0
                        ? student.followUpProgram.focusTopics.join('; ')
                        : 'Pemahaman konsep menyeluruh'}
                    </span>
                  </div>
                  {student.followUpProgram.peerTutor && (
                    <div className="text-right sm:text-right text-left">
                      <span className="font-semibold text-slate-700">Rekan Tutor Sebaya: </span>
                      <span className="font-bold text-blue-900">{student.followUpProgram.peerTutor}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kolom Tanda Tangan Orang Tua & Guru */}
            <div className="grid grid-cols-2 gap-8 text-xs text-center mt-12 avoid-break-inside">
              <div>
                <p className="text-slate-600 mb-16">
                  Mengetahui,<br />
                  Orang Tua / Wali Murid
                </p>
                <p className="underline">( ................................................. )</p>
              </div>

              <div>
                <p className="text-slate-600 mb-16">
                  {meta.date},<br />
                  Guru Mata Pelajaran
                </p>
                <p className="font-bold underline uppercase">{meta.teacherName}</p>
                <p className="font-mono text-[11px] text-slate-700">NIP. {meta.teacherNip || '-'}</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
