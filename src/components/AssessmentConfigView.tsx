import React, { useState } from 'react';
import { SchoolAssessmentMeta, QuestionItem } from '../types/grader';
import { SchoolMetaEditor } from './SchoolMetaEditor';
import { WeightingSchemeEditor } from './WeightingSchemeEditor';
import { QuestionEditor } from './QuestionEditor';
import { SAMPLE_QUESTIONS, DEFAULT_SCHOOL_META } from '../data/sampleAssessment';
import {
  Building2,
  Scale,
  KeyRound,
  LayoutGrid,
  CheckCircle2,
  Sparkles,
  Trash2,
  ArrowRight,
} from 'lucide-react';

interface AssessmentConfigViewProps {
  meta: SchoolAssessmentMeta;
  setMeta: (meta: SchoolAssessmentMeta) => void;
  questions: QuestionItem[];
  setQuestions: (questions: QuestionItem[]) => void;
  onProceedToImport: () => void;
}

export const AssessmentConfigView: React.FC<AssessmentConfigViewProps> = ({
  meta,
  setMeta,
  questions,
  setQuestions,
  onProceedToImport,
}) => {
  // Contextual Headbar Sub-tab State: Now clearly separated!
  // 'meta' = Identitas Sekolah & Kop
  // 'weight' = Skema Pembobotan Nilai & KKM
  // 'questions' = Kunci Jawaban & Butir Soal
  // 'all' = Tampilkan Semua
  const [activeSection, setActiveSection] = useState<'meta' | 'weight' | 'questions' | 'all'>('meta');

  const weightingMode = meta.weightingScheme?.mode || 'direct';
  const isComposite = weightingMode === 'composite';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. DEDICATED CONTEXTUAL FEATURE HEADBAR (Headbar Khusus Fitur Perangkat Soal) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
        {/* Top Info & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-blue-800 bg-blue-50 rounded-full border border-blue-200">
                Perangkat Soal
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-mono">
                {questions.length} Butir
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] sm:text-xs text-slate-600 font-medium">
                KKM: <strong className="text-blue-700 font-mono">{meta.kkm}</strong>
              </span>
            </div>
            <h2 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight mt-1">
              Perangkat Asesmen &amp; Kunci Jawaban
            </h2>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 flex-wrap">
            {questions.length === 0 ? (
              <button
                type="button"
                onClick={() => {
                  setMeta(DEFAULT_SCHOOL_META);
                  setQuestions(SAMPLE_QUESTIONS);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 shadow-2xs"
                title="Muat contoh lengkap 30 soal"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="hidden sm:inline">Contoh 30 Soal</span>
                <span className="sm:hidden">Contoh</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setQuestions([])}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200"
                title="Kosongkan Soal"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {questions.length > 0 && (
              <button
                type="button"
                onClick={onProceedToImport}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors"
                title="Lanjut Impor Jawaban Siswa"
              >
                <span>Impor</span>
                <ArrowRight className="w-3 h-3 shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* Feature Sub-Bar Tabs: TERPISAH MANDIRI & RINGKAS DENGAN ICON */}
        <div className="flex items-center gap-1 sm:gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto pb-1 scrollbar-none">
          {/* Tab 1: Identitas Sekolah & Kop Surat */}
          <button
            type="button"
            onClick={() => setActiveSection('meta')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl whitespace-nowrap transition-all shrink-0 ${
              activeSection === 'meta'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Pengaturan Identitas Satuan Pendidikan & Kop Surat Resmi"
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>Identitas</span>
            <span className={`hidden sm:inline text-[9px] px-1 py-0.2 rounded-full font-sans ${
              activeSection === 'meta' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              SDN Gentan
            </span>
          </button>

          {/* Tab 2: Skema Pembobotan Nilai & KKM (TERPISAH MANDIRI!) */}
          <button
            type="button"
            onClick={() => setActiveSection('weight')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl whitespace-nowrap transition-all shrink-0 ${
              activeSection === 'weight'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Pengaturan Skema Pembobotan Nilai dan KKM"
          >
            <Scale className="w-3.5 h-3.5 shrink-0" />
            <span>Bobot</span>
            <span className={`hidden sm:inline text-[9px] px-1 py-0.2 rounded-full font-mono font-bold ${
              activeSection === 'weight' ? 'bg-indigo-800 text-white' : 'bg-indigo-100 text-indigo-800'
            }`}>
              {isComposite ? `${meta.weightingScheme?.pgPercentage}:${meta.weightingScheme?.esaiPercentage}` : 'Standar'}
            </span>
          </button>

          {/* Tab 3: Kunci Jawaban & Butir Soal (TERPISAH MANDIRI!) */}
          <button
            type="button"
            onClick={() => setActiveSection('questions')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl whitespace-nowrap transition-all shrink-0 ${
              activeSection === 'questions'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Kelola Butir Soal dan Kunci Jawaban"
          >
            <KeyRound className="w-3.5 h-3.5 shrink-0" />
            <span>Kunci Soal</span>
            <span className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
              activeSection === 'questions' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {questions.length}
            </span>
          </button>

          {/* Tab 4: Tampilkan Semua Bagian Sekaligus */}
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl whitespace-nowrap transition-all shrink-0 ${
              activeSection === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Tampilkan Semua Bagian"
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
            <span>Semua</span>
          </button>
        </div>
      </div>

      {/* 2. RENDER SUB-KOMPONEN SECARA TERPISAH SESUAI TAB YANG DIPILIH GURU */}
      
      {/* BAGIAN 1: IDENTITAS SEKOLAH & KOP SURAT (Hanya tampil saat tab 'meta' atau 'all') */}
      {(activeSection === 'meta' || activeSection === 'all') && (
        <div className="space-y-2">
          {activeSection === 'all' && (
            <div className="px-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bagian 1: Identitas Sekolah &amp; Kop Surat
            </div>
          )}
          <SchoolMetaEditor meta={meta} onChange={setMeta} />
        </div>
      )}

      {/* BAGIAN 2: SKEMA PEMBOBOTAN NILAI & KKM (Hanya tampil saat tab 'weight' atau 'all') */}
      {(activeSection === 'weight' || activeSection === 'all') && (
        <div className="space-y-2">
          {activeSection === 'all' && (
            <div className="px-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bagian 2: Skema Pembobotan Nilai &amp; KKM
            </div>
          )}
          <WeightingSchemeEditor meta={meta} onChange={setMeta} />
        </div>
      )}

      {/* BAGIAN 3: KUNCI JAWABAN & BUTIR SOAL (Hanya tampil saat tab 'questions' atau 'all') */}
      {(activeSection === 'questions' || activeSection === 'all') && (
        <div className="space-y-2">
          {activeSection === 'all' && (
            <div className="px-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bagian 3: Kunci Jawaban &amp; Butir Soal
            </div>
          )}
          <QuestionEditor questions={questions} onChange={setQuestions} />
        </div>
      )}
    </div>
  );
};
