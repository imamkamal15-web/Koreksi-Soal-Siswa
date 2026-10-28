import React from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle,
  BarChart3,
  BookOpen,
  Printer,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'config' | 'import' | 'results' | 'diagnostics' | 'remedial' | 'print';
  setActiveTab: (tab: 'config' | 'import' | 'results' | 'diagnostics' | 'remedial' | 'print') => void;
  hasResults: boolean;
  totalStudents: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  hasResults,
  totalStudents,
}) => {
  const tabs = [
    { id: 'config' as const, label: 'Soal', icon: FileText, disabled: false },
    {
      id: 'import' as const,
      label: 'Impor',
      icon: UploadCloud,
      badge: totalStudents > 0 ? totalStudents : null,
      disabled: false,
    },
    { id: 'results' as const, label: 'Hasil', icon: CheckCircle, disabled: !hasResults },
    { id: 'remedial' as const, label: 'Remedial', icon: BookOpen, disabled: !hasResults },
    { id: 'diagnostics' as const, label: 'Statistik', icon: BarChart3, disabled: !hasResults },
    { id: 'print' as const, label: 'Cetak', icon: Printer, disabled: !hasResults },
  ];

  return (
    <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 shadow-lg select-none">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative min-w-[50px] ${
                isActive
                  ? 'text-blue-700 font-bold'
                  : tab.disabled
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-500 hover:text-slate-900 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-mono px-1 rounded-full ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
