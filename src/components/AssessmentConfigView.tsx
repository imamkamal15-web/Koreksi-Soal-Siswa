import React, { useState } from 'react';
import { SchoolAssessmentMeta, QuestionItem } from '../types/grader';
import { SchoolMetaEditor } from './SchoolMetaEditor';
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
  ShieldCheck,
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
  // Contextual Headbar Sub-tab State
  const [activeSection, setActiveSection] = useState<'all' | 'meta' | 'weight' | 'questions'>('all');

  const totalCalculatedWeight = questions.reduce((sum, q) => sum + (Number(q.weight) || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. DEDICATED CONTEXTUAL FEATURE HEADBAR (Headbar Khusus Fitur Perangkat Soal) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-bold text-blue-800 bg-blue-50 rounded-full border border-blue-200">
                Fitur Perangkat Soal
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {questions.length} Butir Soal Terdaftar
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1">
              Konfigurasi Perangkat Soal &amp; Skema Penilaian
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur identitas kop surat sekolah, bobot skor (komposit/bebas), dan kunci jawaban setiap nomor soal.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {questions.length === 0 ? (
              <button
                type="button"
                onClick={() => {
                  setMeta(DEFAULT_SCHOOL_META);
                  setQuestions(SAMPLE_QUESTIONS);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Muat Contoh Perangkat (30 Soal)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setQuestions([])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Soal</span>
              </button>
            )}

            {questions.length > 0 && (
              <button
                type="button"
                onClick={onProceedToImport}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors"
              >
                <span>Lanjut ke Impor Jawaban</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Feature Sub-Bar Navigation (Tiga Fitur Utama Sesuai Request Guru) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-colors ${
              activeSection === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Semua Bagian</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('meta')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-colors ${
              activeSection === 'meta'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Identitas Asesmen &amp; Kop Sekolah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('weight')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-colors ${
              activeSection === 'weight'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>2. Skema Pembobotan Nilai</span>
            <span className="text-[10px] bg-indigo-200/60 px-1.5 py-0.5 rounded-full font-mono">
              {meta.weightingScheme?.mode === 'composite'
                ? `${meta.weightingScheme.pgPercentage}% PG / ${meta.weightingScheme.esaiPercentage}% Esai`
                : 'Standar'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('questions')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-colors ${
              activeSection === 'questions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>3. Kunci Jawaban &amp; Butir Soal</span>
            <span className="text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded-full font-mono">
              {questions.length} Soal
            </span>
          </button>
        </div>
      </div>

      {/* 2. RENDER SUB-COMPONENTS ACCORDING TO SELECTED FEATURE */}
      {(activeSection === 'all' || activeSection === 'meta' || activeSection === 'weight') && (
        <SchoolMetaEditor meta={meta} onChange={setMeta} />
      )}

      {(activeSection === 'all' || activeSection === 'questions') && (
        <QuestionEditor questions={questions} onChange={setQuestions} />
      )}
    </div>
  );
};
