import React, { useState } from 'react';
import { SchoolAssessmentMeta, StudentGradedResult } from '../types/grader';
import { BookOpen, Users, ChevronDown, ChevronUp, Award, CheckCircle2 } from 'lucide-react';

interface MobileProfileHeaderProps {
  meta: SchoolAssessmentMeta;
  results: StudentGradedResult[];
  totalQuestions: number;
  totalStudents: number;
}

export const MobileProfileHeader: React.FC<MobileProfileHeaderProps> = ({
  meta,
  results,
  totalQuestions,
  totalStudents,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const passCount = results.filter((r) => r.status === 'Tuntas').length;
  const passRate = totalStudents > 0 ? Math.round((passCount / totalStudents) * 100) : 0;
  const scores = results.map((r) => r.percentageScore);
  const avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;

  return (
    <div className="no-print block md:hidden mb-3">
      {/* Sleek Compact Bar with Optional Expand */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-2.5 sm:p-3 text-white shadow-xs border border-blue-700/40">
        <div className="flex items-center justify-between gap-2.5">
          {/* Left: Avatar & Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 ring-1 ring-white/20 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
              {meta.schoolLogoUrl ? (
                <img
                  src={meta.schoolLogoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs font-bold text-white">
                  {meta.teacherName ? meta.teacherName.charAt(0) : 'I'}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {meta.teacherName || 'Imam Fadlun Kamal, S.Pd., M.Pd.'}
              </div>
              <div className="text-[10px] text-blue-200 truncate mt-0.5">
                {meta.gradeClass || 'Kelas 5B'} · {meta.subject || 'IPAS'} · KKM: <span className="font-mono font-bold text-white">{meta.kkm}</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Stats & Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-lg font-mono font-bold text-blue-100">
              {totalStudents} Siswa
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-blue-200 transition-colors"
              title={isExpanded ? 'Tutup Detail' : 'Buka Detail Profil'}
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Section with Detailed Metrics */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-white/15 space-y-2.5 animate-in fade-in">
            <div className="text-[11px] text-blue-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{meta.schoolName || 'SD Negeri Gentan'}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 rounded-xl py-2 px-1">
                <span className="text-[9px] text-blue-200 block uppercase">KKM Acuan</span>
                <span className="text-sm font-bold font-mono text-white">{meta.kkm}</span>
              </div>

              <div className="bg-white/10 rounded-xl py-2 px-1">
                <span className="text-[9px] text-blue-200 block uppercase">Soal Ujian</span>
                <span className="text-sm font-bold font-mono text-white">{totalQuestions}</span>
              </div>

              <div className="bg-white/10 rounded-xl py-2 px-1">
                <span className="text-[9px] text-blue-200 block uppercase">Ketuntasan</span>
                <span className="text-sm font-bold font-mono text-emerald-300">
                  {results.length > 0 ? `${passRate}%` : '-'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
