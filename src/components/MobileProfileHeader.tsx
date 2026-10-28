import React from 'react';
import { SchoolAssessmentMeta, StudentGradedResult } from '../types/grader';
import { Award, BookOpen, Users, Sparkles, Sliders } from 'lucide-react';

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
  const passCount = results.filter((r) => r.status === 'Tuntas').length;
  const passRate = totalStudents > 0 ? Math.round((passCount / totalStudents) * 100) : 0;
  const scores = results.map((r) => r.percentageScore);
  const avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;

  return (
    <div className="no-print block md:hidden mb-4">
      {/* Growly-style Profile Card */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center relative z-10">
          {/* Avatar with Circular Ring */}
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full p-1 bg-white/20 ring-4 ring-white/30 flex items-center justify-center">
              {meta.schoolLogoUrl ? (
                <img
                  src={meta.schoolLogoUrl}
                  alt="Avatar"
                  className="w-full h-full object-contain rounded-full bg-white p-1"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-blue-900 flex items-center justify-center text-xl font-bold text-white">
                  {meta.teacherName ? meta.teacherName.charAt(0) : 'I'}
                </div>
              )}
            </div>
            <span className="absolute bottom-0 right-1 w-5 h-5 rounded-full bg-emerald-400 ring-2 ring-white flex items-center justify-center text-[10px] text-slate-900 font-bold">
              ✓
            </span>
          </div>

          <h2 className="text-base font-bold text-white tracking-tight leading-snug">
            {meta.teacherName || 'Imam Fadlun Kamal, S.Pd., M.Pd.'}
          </h2>
          <p className="text-xs text-blue-100 font-medium mt-0.5">
            Guru {meta.gradeClass || 'Kelas 5B'} · {meta.schoolName || 'SD Negeri Gentan'}
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-blue-100 mt-2 backdrop-blur-xs">
            <BookOpen className="w-3 h-3 text-blue-200" />
            <span>Mata Pelajaran: {meta.subject || 'IPAS'}</span>
          </div>

          {/* 3 Metric Pills (inspired by Technical / Soft / Experience row) */}
          <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/15">
            <div className="bg-white/10 rounded-2xl py-2 px-1">
              <span className="text-[10px] text-blue-200 block uppercase font-medium">KKM Acuan</span>
              <span className="text-base font-extrabold font-mono text-white">{meta.kkm}</span>
            </div>

            <div className="bg-white/10 rounded-2xl py-2 px-1">
              <span className="text-[10px] text-blue-200 block uppercase font-medium">Jml Siswa</span>
              <span className="text-base font-extrabold font-mono text-white">{totalStudents}</span>
            </div>

            <div className="bg-white/10 rounded-2xl py-2 px-1">
              <span className="text-[10px] text-blue-200 block uppercase font-medium">Ketuntasan</span>
              <span className="text-base font-extrabold font-mono text-emerald-300">
                {results.length > 0 ? `${passRate}%` : `${totalQuestions} Soal`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
