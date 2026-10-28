import React, { useState } from 'react';
import {
  StudentGradedResult,
  SchoolAssessmentMeta,
  QuestionItem,
} from '../types/grader';
import {
  BookOpen,
  Award,
  Users,
  Calendar,
  Download,
  Printer,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';

interface RemedialPengayaanViewProps {
  meta: SchoolAssessmentMeta;
  questions: QuestionItem[];
  results: StudentGradedResult[];
  onOpenOverride: (student: StudentGradedResult) => void;
  onOpenPrint: () => void;
}

export const RemedialPengayaanView: React.FC<RemedialPengayaanViewProps> = ({
  meta,
  questions,
  results,
  onOpenOverride,
  onOpenPrint,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'remedial' | 'pengayaan'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const remedialStudents = results.filter(r => r.status === 'Remedial');
  const pengayaanStudents = results.filter(r => r.status === 'Tuntas');

  const filteredStudents = results.filter(r => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nisn.includes(searchQuery);
    if (!matchesSearch) return false;

    if (activeSubTab === 'remedial') return r.status === 'Remedial';
    if (activeSubTab === 'pengayaan') return r.status === 'Tuntas';
    return true;
  });

  // Ekspor Dokumen Program Remedial & Pengayaan ke CSV
  const handleExportRemedialCsv = () => {
    const headers = [
      'No',
      'NISN',
      'Nama_Siswa',
      'Nilai_Asesmen',
      'Status_KKM',
      'Jenis_Program',
      'Kategori_Kegiatan',
      'Topik_Fokus_Materi',
      'Tutor_Sebaya_Pendamping',
      'Rencana_Aktivitas',
      'Target_Penyelesaian',
    ];

    const rows = results.map((r, idx) => {
      const prog = r.followUpProgram;
      return [
        idx + 1,
        `"${r.nisn}"`,
        `"${r.studentName}"`,
        r.percentageScore,
        r.status,
        prog?.type || '-',
        `"${prog?.activityCategory || '-'}"`,
        `"${(prog?.focusTopics || []).join('; ')}"`,
        `"${prog?.peerTutor || '-'}"`,
        `"${prog?.description?.replace(/"/g, '""') || '-'}"`,
        `"${prog?.completionTarget || '-'}"`,
      ].join(';');
    });

    const csvContent = 'sep=;\r\n\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Program_Remedial_Pengayaan_${meta.subject}_${meta.gradeClass}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-700" />
            <h2 className="text-base font-bold text-slate-900">
              Rekomendasi Program Remedial &amp; Pengayaan Siswa
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Sistem merekomendasikan program tindak lanjut individual sesuai capaian: bimbingan perorangan, lembar kerja terarah, tutor sebaya, atau proyek HOTS.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportRemedialCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor Agenda Remedial</span>
          </button>
          <button
            type="button"
            onClick={onOpenPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-blue-700" />
            <span>Cetak Rapor + Tindak Lanjut</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Perlu Remedial</span>
            <div className="text-2xl font-bold font-mono text-rose-700">
              {remedialStudents.length} <span className="text-xs text-slate-400 font-sans">siswa</span>
            </div>
            <span className="text-[11px] text-slate-500">Nilai di bawah KKM ({meta.kkm})</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Mengikuti Pengayaan</span>
            <div className="text-2xl font-bold font-mono text-emerald-700">
              {pengayaanStudents.length} <span className="text-xs text-slate-400 font-sans">siswa</span>
            </div>
            <span className="text-[11px] text-slate-500">Tuntas melampaui KKM ({meta.kkm})</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Tutor Sebaya Siap</span>
            <div className="text-2xl font-bold font-mono text-indigo-700">
              {results.filter(r => r.percentageScore >= 85).length} <span className="text-xs text-slate-400 font-sans">siswa</span>
            </div>
            <span className="text-[11px] text-slate-500">Siswa penguasaan materi tinggi (≥85)</span>
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Siswa ({results.length})
            </button>
            <button
              onClick={() => setActiveSubTab('remedial')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'remedial'
                  ? 'bg-white text-rose-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Program Remedial ({remedialStudents.length})
            </button>
            <button
              onClick={() => setActiveSubTab('pengayaan')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'pengayaan'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Program Pengayaan ({pengayaanStudents.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa..."
              className="pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg w-52 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Detailed Table */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-mono">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3 w-40 font-bold font-sans">Nama Siswa</th>
                <th className="py-2.5 px-3 w-20 text-center">Nilai</th>
                <th className="py-2.5 px-3 w-24 text-center">Status</th>
                <th className="py-2.5 px-3 w-44 font-semibold">Bentuk Program</th>
                <th className="py-2.5 px-3">Rencana Kegiatan &amp; Fokus Materi</th>
                <th className="py-2.5 px-3 w-36">Pendamping / Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st, idx) => {
                const prog = st.followUpProgram;
                const isRem = st.status === 'Remedial';

                return (
                  <tr key={st.studentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{st.studentName}</div>
                      <div className="text-[10px] font-mono text-slate-400">NISN: {st.nisn}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-sm">
                      <span className={isRem ? 'text-rose-700' : 'text-emerald-700'}>
                        {st.percentageScore}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isRem ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {isRem ? 'REMEDIAL' : 'TUNTAS'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-800">{prog?.activityCategory}</div>
                      <div className="text-[10px] text-indigo-700 font-medium">{prog?.type}</div>
                    </td>
                    <td className="py-2.5 px-3 space-y-1">
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        {prog?.description}
                      </p>
                      {prog?.focusTopics && prog.focusTopics.length > 0 && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Fokus: {prog.focusTopics.join(' · ')}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 space-y-0.5 text-[11px]">
                      {prog?.peerTutor && (
                        <div className="flex items-center gap-1 text-slate-700">
                          <Users className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span>Tutor: <strong>{prog.peerTutor}</strong></span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{prog?.completionTarget}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                    Tidak ada siswa pada kategori ini.
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
