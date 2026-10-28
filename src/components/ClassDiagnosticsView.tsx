import React from 'react';
import {
  ClassDiagnosticsSummary,
  QuestionItem,
  StudentGradedResult,
  SchoolAssessmentMeta,
} from '../types/grader';
import {
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface ClassDiagnosticsViewProps {
  meta: SchoolAssessmentMeta;
  questions: QuestionItem[];
  results: StudentGradedResult[];
  diagnostics: ClassDiagnosticsSummary;
  onRefreshDiagnostics: () => void;
  isAnalyzing: boolean;
}

export const ClassDiagnosticsView: React.FC<ClassDiagnosticsViewProps> = ({
  meta,
  questions,
  results,
  diagnostics,
  onRefreshDiagnostics,
  isAnalyzing,
}) => {
  const totalStudents = results.length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Analisis Diagnostik Kelas &amp; Psikometri Butir Soal
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mendeteksi miskonsepsi kelompok (kesalahan ≥ 30%), mengaudit butir soal ambigu, dan menyusun strategi pembelajaran remedial.
          </p>
        </div>

        <button
          onClick={onRefreshDiagnostics}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isAnalyzing ? 'Menganalisis Ulang...' : 'Segarkan Diagnostik AI'}</span>
        </button>
      </div>

      {/* Heatmap Penguasaan Materi Per Butir Soal */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Heatmap Tingkat Penguasaan Siswa Per Butir Soal</span>
          <span className="text-[11px] font-mono text-slate-400 lowercase">
            target kkm: {meta.kkm}%
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {questions.map((q) => {
            let correctCount = 0;
            results.forEach((r) => {
              const qs = r.questionScores[q.id];
              if (qs && qs.partialRatio >= 0.7) correctCount++;
            });

            const successRate = totalStudents > 0 ? Math.round((correctCount / totalStudents) * 100) : 0;
            const isCritical = successRate < 50;
            const isWarning = successRate >= 50 && successRate < 70;

            return (
              <div
                key={q.id}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isCritical
                    ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                    : isWarning
                    ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                    : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="font-bold">Soal #{q.number}</span>
                  <span className="uppercase text-[9px] font-semibold opacity-75">{q.type}</span>
                </div>
                <div className="text-lg font-bold font-mono my-0.5 tabular-nums">
                  {successRate}%
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {correctCount}/{totalStudents} Siswa Tuntas
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Group Misconceptions & Ambiguous Question Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Deteksi Miskonsepsi Berkelompok (>=30%) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Deteksi Miskonsepsi Berkelompok (Tingkat Kesalahan ≥ 30%)
              </h3>
            </div>

            {diagnostics.misconceptions.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Tidak terdeteksi adanya miskonsepsi massal. Tingkat pemahaman kelas pada seluruh indikator soal tergolong baik.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {diagnostics.misconceptions.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-rose-50/50 rounded-lg border border-rose-100 text-xs text-rose-950 space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-rose-900 font-bold">
                        Soal #{m.questionNumber}: {m.conceptName}
                      </span>
                      <span className="text-rose-700 font-mono text-[11px] bg-rose-100 px-1.5 py-0.5 rounded">
                        {m.errorPercentage}% Salah ({m.affectedCount} siswa)
                      </span>
                    </div>

                    <div className="text-slate-700 leading-relaxed text-[11px]">
                      <strong className="text-slate-900">Akar Masalah: </strong>
                      {m.rootCause}
                    </div>

                    <div className="text-blue-900 bg-white/80 p-2 rounded border border-rose-100 text-[11px]">
                      <strong className="text-blue-950">Saran Remedial Guru: </strong>
                      {m.pedagogicalRemedy}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Audit Kualitas Soal [FLAG_SOAL_AMBIGU] */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Audit Kualitas Soal Ambigu [FLAG_SOAL_AMBIGU]
              </h3>
            </div>

            {diagnostics.ambiguousQuestions.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  Seluruh butir soal menunjukkan daya pembeda positif yang sehat. Tidak ada indikasi butir soal ambigu atau jebakan multitafsir.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {diagnostics.ambiguousQuestions.map((flag, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-amber-900 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Soal #{flag.questionNumber}
                      </span>
                      <span className="font-mono text-[10px] text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded font-bold">
                        {flag.flag}
                      </span>
                    </div>

                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {flag.reason}
                    </p>

                    <div className="bg-white/80 p-2 rounded border border-amber-100 text-[11px] text-slate-800">
                      <strong>Rekomendasi Redaksi: </strong>
                      {flag.recommendationForTeacher}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rekomendasi Tindak Lanjut Guru */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-blue-600" />
          <span>Rekomendasi Tindak Lanjut &amp; Diferensiasi Pembelajaran Guru</span>
        </h3>

        <ul className="space-y-2 text-xs text-slate-700">
          {diagnostics.remedialSuggestions.map((sug, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-mono text-blue-700 font-bold shrink-0">{idx + 1}.</span>
              <span className="leading-relaxed">{sug}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
