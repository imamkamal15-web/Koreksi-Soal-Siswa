import React, { useState } from 'react';
import { StudentGradedResult, QuestionItem, SchoolAssessmentMeta } from '../types/grader';
import { Download, Edit3, CheckCircle2, AlertTriangle, Search, Filter } from 'lucide-react';

interface GradingResultsViewProps {
  meta: SchoolAssessmentMeta;
  questions: QuestionItem[];
  results: StudentGradedResult[];
  onOpenOverride: (student: StudentGradedResult) => void;
  onOpenDiagnostics: () => void;
  onOpenPrint: () => void;
}

export const GradingResultsView: React.FC<GradingResultsViewProps> = ({
  meta,
  questions,
  results,
  onOpenOverride,
  onOpenDiagnostics,
  onOpenPrint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'tuntas' | 'remedial'>('all');

  // Summary Metrics
  const totalStudents = results.length;
  const scores = results.map(r => r.percentageScore);
  const avgScore = totalStudents > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / totalStudents) * 10) / 10 : 0;
  const maxScore = totalStudents > 0 ? Math.max(...scores) : 0;
  const minScore = totalStudents > 0 ? Math.min(...scores) : 0;
  const passCount = results.filter(r => r.status === 'Tuntas').length;
  const passRate = totalStudents > 0 ? Math.round((passCount / totalStudents) * 100) : 0;

  // Filtered students
  const filtered = results.filter(r => {
    const matchSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nisn.includes(searchQuery);
    if (!matchSearch) return false;

    if (statusFilter === 'tuntas') return r.status === 'Tuntas';
    if (statusFilter === 'remedial') return r.status === 'Remedial';
    return true;
  });

  // Export to CSV
  const handleExportCsv = () => {
    const isComposite = meta.weightingScheme?.mode === 'composite';
    const headers = [
      'No',
      'NISN',
      'Nama_Siswa',
      ...questions.map(q => `Q${q.number}_Score`),
      ...(isComposite ? ['Skor_Objektif', 'Skor_Subjektif'] : []),
      'Total_Skor',
      'Nilai_Akhir',
      'Status_KKM',
      'Program_Tindak_Lanjut',
      'Catatan_Evaluasi',
    ];

    const rows = results.map((r, idx) => {
      const qScores = questions.map(q => r.questionScores[q.id]?.score ?? 0);
      return [
        idx + 1,
        `"${r.nisn}"`,
        `"${r.studentName}"`,
        ...qScores,
        ...(isComposite ? [r.objectiveScore ?? 0, r.subjectiveScore ?? 0] : []),
        r.totalScore,
        r.percentageScore,
        r.status,
        `"${r.followUpProgram?.title || '-'}"`,
        `"${r.personalFeedbackNotes.replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = 'sep=;\r\n\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Nilai_${meta.subject}_${meta.gradeClass}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Rata-Rata Kelas
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {avgScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            KKM Target: <strong className="font-mono text-blue-700">{meta.kkm}</strong>
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Ketuntasan Belajar
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${passRate >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {passRate}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({passCount} dari {totalStudents} siswa)
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {passRate >= 75 ? 'Memenuhi Standar Klasikal' : 'Perlu Pendampingan Remidial'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Nilai Tertinggi
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {maxScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Capaian Maksimum Siswa
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Nilai Terendah
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
              {minScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Batas Pembinaan Remedial
          </span>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama / NISN siswa..."
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-52 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({totalStudents})
            </button>
            <button
              onClick={() => setStatusFilter('tuntas')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'tuntas'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tuntas ({passCount})
            </button>
            <button
              onClick={() => setStatusFilter('remedial')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'remedial'
                  ? 'bg-white text-rose-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Remedial ({totalStudents - passCount})
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDiagnostics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            <span>Lihat Diagnostik</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold font-mono">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Peserta Didik</th>
                <th className="py-3 px-4 w-28">NISN</th>
                <th className="py-3 px-3 text-center">Skor Objektif</th>
                <th className="py-3 px-3 text-center">Skor Esai/Proses</th>
                <th className="py-3 px-3 text-center font-bold">Total / 100</th>
                <th className="py-3 px-4 text-center w-28">Status</th>
                <th className="py-3 px-4 text-center w-36">Aksi Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((student, idx) => {
                // Compute sub-scores for breakdown
                let objScore = 0;
                let subjScore = 0;

                Object.values(student.questionScores).forEach(q => {
                  if (q.questionType === 'esai' || q.questionType === 'hitungan') {
                    subjScore += q.score;
                  } else {
                    objScore += q.score;
                  }
                });

                const isOverridden = Object.values(student.questionScores).some(q => q.isOverridden);

                return (
                  <tr key={student.studentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{student.studentName}</span>
                        {isOverridden && (
                          <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-mono">
                            Override
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{student.nisn}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700 tabular-nums">
                      {Math.round(objScore * 10) / 10}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700 tabular-nums">
                      {Math.round(subjScore * 10) / 10}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-sm text-slate-900 tabular-nums">
                      {student.percentageScore}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {student.status === 'Tuntas' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tuntas</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-800 font-semibold text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Remedial</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onOpenOverride(student)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Tinjau &amp; Override</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                    Tidak ditemukan data siswa yang cocok dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
