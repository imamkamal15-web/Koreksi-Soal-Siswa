import React from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle,
  BarChart3,
  BookOpen,
  Printer,
  Sparkles,
  Smartphone,
  Monitor,
  Zap,
} from 'lucide-react';
import { SchoolAssessmentMeta } from '../types/grader';

interface DesktopSidebarProps {
  activeTab: 'config' | 'import' | 'results' | 'diagnostics' | 'remedial' | 'print';
  setActiveTab: (tab: 'config' | 'import' | 'results' | 'diagnostics' | 'remedial' | 'print') => void;
  hasResults: boolean;
  totalStudents: number;
  totalQuestions: number;
  meta: SchoolAssessmentMeta;
  deviceMode: 'responsive' | 'desktop' | 'mobile';
  setDeviceMode: (mode: 'responsive' | 'desktop' | 'mobile') => void;
  onRunGrading?: () => void;
  isGrading?: boolean;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  setActiveTab,
  hasResults,
  totalStudents,
  totalQuestions,
  meta,
  deviceMode,
  setDeviceMode,
  onRunGrading,
  isGrading,
}) => {
  const navItems = [
    {
      id: 'config' as const,
      label: 'Perangkat Soal',
      icon: FileText,
      badge: totalQuestions > 0 ? `${totalQuestions} Soal` : null,
      disabled: false,
    },
    {
      id: 'import' as const,
      label: 'Impor & Scan OCR',
      icon: UploadCloud,
      badge: totalStudents > 0 ? `${totalStudents} Siswa` : null,
      disabled: false,
    },
    {
      id: 'results' as const,
      label: 'Hasil Koreksi',
      icon: CheckCircle,
      badge: hasResults ? 'Siap' : null,
      disabled: !hasResults,
    },
    {
      id: 'diagnostics' as const,
      label: 'Diagnostik Kelas',
      icon: BarChart3,
      badge: null,
      disabled: !hasResults,
    },
    {
      id: 'remedial' as const,
      label: 'Remedial & Pengayaan',
      icon: BookOpen,
      badge: null,
      disabled: !hasResults,
    },
    {
      id: 'print' as const,
      label: 'Laporan Cetak (PDF)',
      icon: Printer,
      badge: null,
      disabled: !hasResults,
    },
  ];

  return (
    <aside className="no-print hidden md:flex flex-col w-20 lg:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 sticky top-0 h-screen transition-all select-none">
      {/* Brand Top */}
      <div className="h-16 flex items-center px-4 lg:px-5 border-b border-slate-800/80 gap-3">
        {meta.schoolLogoUrl ? (
          <img
            src={meta.schoolLogoUrl}
            alt="Logo"
            className="w-9 h-9 object-contain rounded-lg p-0.5 bg-white/10 shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            SG
          </div>
        )}
        <div className="hidden lg:block overflow-hidden">
          <div className="font-bold text-sm text-white truncate tracking-tight">SmartGrader</div>
          <div className="text-[10px] text-blue-400 font-medium truncate">
            {meta.schoolName || 'SD Negeri Gentan'}
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-2 lg:px-3 space-y-1.5 overflow-y-auto">
        <div className="hidden lg:block px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Navigasi Utama
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              disabled={item.disabled}
              title={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : item.disabled
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline truncate">{item.label}</span>

              {item.badge && (
                <span className={`hidden lg:inline-flex ml-auto text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-blue-300'
                }`}>
                  {item.badge}
                </span>
              )}

              {isActive && (
                <div className="lg:hidden absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r" />
              )}
            </button>
          );
        })}

        {/* Action Button: Jalankan Koreksi AI (If questions and submissions are present) */}
        {totalQuestions > 0 && totalStudents > 0 && onRunGrading && (
          <div className="pt-4 hidden lg:block">
            <button
              onClick={onRunGrading}
              disabled={isGrading}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isGrading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Sedang Mengoreksi...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Jalankan Koreksi AI</span>
                </>
              )}
            </button>
          </div>
        )}
      </nav>

      {/* Device Mode Switcher (Growly reference: Mobile & Desktop View) */}
      <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950/20">
        <div className="hidden lg:flex items-center justify-between text-[10px] text-slate-400 mb-1.5 px-1 font-semibold">
          <span>Mode Tampilan:</span>
          <span className="uppercase text-blue-400 font-mono">{deviceMode}</span>
        </div>
        <div className="grid grid-cols-2 gap-1 bg-slate-800/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setDeviceMode('responsive')}
            title="Tampilan Desktop / Responsif Layar Penuh"
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors ${
              deviceMode !== 'mobile'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            title="Simulasi Layar Smartphone (Growly LMS)"
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors ${
              deviceMode === 'mobile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">HP (Mobile)</span>
          </button>
        </div>
      </div>

      {/* Teacher Profile Footer (Growly LMS reference) */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-800 shrink-0">
              {meta.teacherName ? meta.teacherName.charAt(0) : 'G'}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </div>

          <div className="hidden lg:block overflow-hidden flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {meta.teacherName || 'Guru Pengampu'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {meta.gradeClass || 'Kelas 5B'} · {meta.subject || 'IPAS'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
