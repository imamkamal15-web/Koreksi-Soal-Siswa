import React from 'react';
import { Printer, Play, Sparkles, Monitor, Smartphone } from 'lucide-react';

interface NavbarProps {
  activeTab: 'config' | 'import' | 'results' | 'diagnostics' | 'remedial' | 'print';
  setActiveTab: (tab: 'config' | 'import' | 'results' | 'diagnostics' | 'remedial' | 'print') => void;
  onRunGrading: () => void;
  isGrading: boolean;
  hasResults: boolean;
  onOpenPrint: () => void;
  totalStudents: number;
  schoolLogoUrl?: string;
  schoolName?: string;
  deviceMode?: 'responsive' | 'desktop' | 'mobile';
  setDeviceMode?: (mode: 'responsive' | 'desktop' | 'mobile') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRunGrading,
  isGrading,
  hasResults,
  onOpenPrint,
  totalStudents,
  schoolLogoUrl,
  schoolName,
  deviceMode = 'responsive',
  setDeviceMode,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            {schoolLogoUrl && (
              <img
                src={schoolLogoUrl}
                alt="Logo Sekolah"
                className="w-8 h-8 object-contain rounded shrink-0"
              />
            )}
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              SmartGrader AI Engine
            </span>
            <span className="hidden sm:inline text-xs text-slate-400">·</span>
            <span className="hidden sm:inline text-xs font-medium text-slate-500 whitespace-nowrap">
              {schoolName || 'Koreksi Hibrida & Diagnostik Belajar'}
            </span>
          </div>

          {/* Zone 2: 4–6 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('config')}
              className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'config'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Perangkat Soal
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'import'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Impor Jawaban {totalStudents > 0 ? `(${totalStudents})` : ''}
            </button>
            <button
              onClick={() => setActiveTab('results')}
              disabled={!hasResults}
              className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
                !hasResults
                  ? 'text-slate-300 cursor-not-allowed'
                  : activeTab === 'results'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hasil &amp; Override
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              disabled={!hasResults}
              className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
                !hasResults
                  ? 'text-slate-300 cursor-not-allowed'
                  : activeTab === 'diagnostics'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diagnostik Kelas
            </button>
            <button
              onClick={() => setActiveTab('remedial')}
              disabled={!hasResults}
              className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
                !hasResults
                  ? 'text-slate-300 cursor-not-allowed'
                  : activeTab === 'remedial'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Remedial &amp; Pengayaan
            </button>
            <button
              onClick={() => setActiveTab('print')}
              disabled={!hasResults}
              className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
                !hasResults
                  ? 'text-slate-300 cursor-not-allowed'
                  : activeTab === 'print'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laporan Cetak
            </button>
          </nav>

          {/* Zone 3: Primary action button & View Switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* View Mode Switcher (Desktop vs Mobile) */}
            {setDeviceMode && (
              <div className="hidden sm:inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setDeviceMode('desktop')}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    deviceMode === 'desktop'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilan Mode Desktop (LMS Sidebar & Grid Dashboard)"
                >
                  <Monitor className="w-3 h-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode('mobile')}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    deviceMode === 'mobile'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilan Mode HP / Mobile (Profil Guru & Bottom Navigation)"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>HP (Mobile)</span>
                </button>
              </div>
            )}

            {hasResults && (
              <button
                onClick={onOpenPrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                title="Cetak Laporan PDF Resmi"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Cetak PDF</span>
              </button>
            )}

            <button
              onClick={onRunGrading}
              disabled={isGrading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0"
            >
              {isGrading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengoreksi...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Jalankan Koreksi AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
