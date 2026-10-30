import React from 'react';
import { SchoolAssessmentMeta, WeightingScheme } from '../types/grader';
import {
  Scale,
  Sliders,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  Sparkles,
  Calculator,
  Percent,
} from 'lucide-react';

interface WeightingSchemeEditorProps {
  meta: SchoolAssessmentMeta;
  onChange: (updated: SchoolAssessmentMeta) => void;
}

export const WeightingSchemeEditor: React.FC<WeightingSchemeEditorProps> = ({ meta, onChange }) => {
  const currentScheme: WeightingScheme = meta.weightingScheme || {
    mode: 'direct',
    pgPercentage: 70,
    esaiPercentage: 30,
  };

  const handleModeChange = (mode: 'direct' | 'composite') => {
    onChange({
      ...meta,
      weightingScheme: {
        mode,
        pgPercentage: currentScheme.pgPercentage ?? 70,
        esaiPercentage: currentScheme.esaiPercentage ?? 30,
      },
    });
  };

  const handlePercentageChange = (field: 'pgPercentage' | 'esaiPercentage', val: number) => {
    const clamped = Math.max(0, Math.min(100, val || 0));
    const adjustedOpposite = 100 - clamped;

    const newPg = field === 'pgPercentage' ? clamped : adjustedOpposite;
    const newEsai = field === 'esaiPercentage' ? clamped : adjustedOpposite;

    onChange({
      ...meta,
      weightingScheme: {
        mode: 'composite',
        pgPercentage: newPg,
        esaiPercentage: newEsai,
      },
    });
  };

  const handleKkmChange = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val || 0));
    onChange({
      ...meta,
      kkm: clamped,
    });
  };

  const isComposite = currentScheme.mode === 'composite';
  const pgPct = currentScheme.pgPercentage ?? 70;
  const esaiPct = currentScheme.esaiPercentage ?? 30;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-5 shadow-xs space-y-4 sm:space-y-6">
      {/* Header Bagian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-50 text-indigo-700">
              <Scale className="w-4 h-4" />
            </span>
            <h3 className="text-xs sm:text-base font-bold text-slate-900">
              Skema Bobot Nilai &amp; KKM
            </h3>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
            Atur proporsi nilai raport (misal: 70% PG &amp; 30% Uraian) dan batas tuntas KKM.
          </p>
        </div>

        {/* KKM Badge */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl self-start sm:self-auto">
          <span className="text-[10px] sm:text-xs text-slate-600 font-medium">KKM Acuan:</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200">
            {meta.kkm}
          </span>
        </div>
      </div>

      {/* 1. Pengaturan KKM */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <label className="text-[11px] sm:text-xs font-bold text-slate-900 block">
              Kriteria Ketuntasan Minimal (KKM)
            </label>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Nilai &lt; KKM masuk <strong>Remedial</strong>, nilai &ge; KKM masuk <strong>Pengayaan</strong>.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {[70, 75, 80].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleKkmChange(preset)}
                className={`px-2 py-0.5 text-[11px] sm:text-xs font-bold rounded-lg border transition-colors ${
                  meta.kkm === preset
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset}
              </button>
            ))}

            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-0.5">
              <input
                type="number"
                min={0}
                max={100}
                value={meta.kkm}
                onChange={(e) => handleKkmChange(Number(e.target.value))}
                className="w-10 text-center text-xs font-bold font-mono text-slate-900 outline-none"
              />
              <span className="text-[9px] text-slate-400 font-medium">pt</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pilihan Skema Pembobotan (Standar vs Komposit) */}
      <div className="space-y-3">
        <label className="text-[11px] sm:text-xs font-bold text-slate-900 block">
          Metode Perhitungan Nilai:
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Card 1: Standar Poin Langsung */}
          <div
            onClick={() => handleModeChange('direct')}
            className={`cursor-pointer rounded-xl p-3 sm:p-4 border-2 transition-all relative ${
              !isComposite
                ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <input
                type="radio"
                name="weightingSchemeMode"
                checked={!isComposite}
                onChange={() => handleModeChange('direct')}
                className="mt-0.5 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    Poin Murni (Standar)
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600 mt-1">
                  Akumulasi skor perolehan dibagi total bobot seluruh soal:
                </p>
                <div className="mt-1.5 p-1.5 bg-white rounded-lg border border-slate-200 font-mono text-[10px] text-slate-700 truncate">
                  Nilai = (Total Skor Benar / Total Maksimal) &times; 100
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pembobotan Komposit Kategori */}
          <div
            onClick={() => handleModeChange('composite')}
            className={`cursor-pointer rounded-xl p-3 sm:p-4 border-2 transition-all relative ${
              isComposite
                ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <input
                type="radio"
                name="weightingSchemeMode"
                checked={isComposite}
                onChange={() => handleModeChange('composite')}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Percent className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    Bobot Komposit
                  </span>
                  <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded-full">
                    {pgPct}% PG : {esaiPct}% Uraian
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600 mt-1">
                  Proporsi gabungan objektif &amp; subjektif:
                </p>
                <div className="mt-1.5 p-1.5 bg-white rounded-lg border border-slate-200 font-mono text-[10px] text-indigo-900 truncate">
                  Nilai = ({pgPct}% &times; PG) + ({esaiPct}% &times; Uraian)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Interaktif Pengaturan Persentase Komposit (Tampil jika Komposit Aktif) */}
        {isComposite && (
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3 sm:p-4 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-700" />
                <span>Rasio Persentase (Total 100%)</span>
              </span>
              <span className="text-[11px] font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Total: {pgPct + esaiPct}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Box 1: Objektif / PG */}
              <div className="bg-white p-3 rounded-xl border border-indigo-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800">
                    Objektif (PG/PGK/BS/Isian)
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-blue-700">
                    {pgPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={pgPct}
                  onChange={(e) => handlePercentageChange('pgPercentage', Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span>0%</span>
                  <span>50%</span>
                  <span className="text-blue-700 font-bold">70%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Box 2: Subjektif / Uraian */}
              <div className="bg-white p-3 rounded-xl border border-indigo-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800">
                    Subjektif (Uraian/Hitungan)
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-indigo-700">
                    {esaiPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={esaiPct}
                  onChange={(e) => handlePercentageChange('esaiPercentage', Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span>0%</span>
                  <span className="text-indigo-700 font-bold">30%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-indigo-900">Preset:</span>
              {[
                { label: '70% : 30%', full: '70% PG - 30% Uraian', pg: 70, esai: 30 },
                { label: '60% : 40%', full: '60% PG - 40% Uraian', pg: 60, esai: 40 },
                { label: '80% : 20%', full: '80% PG - 20% Uraian', pg: 80, esai: 20 },
                { label: '50% : 50%', full: '50% PG - 50% Uraian', pg: 50, esai: 50 },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange({
                      ...meta,
                      weightingScheme: {
                        mode: 'composite',
                        pgPercentage: p.pg,
                        esaiPercentage: p.esai,
                      },
                    });
                  }}
                  className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-lg border transition-colors ${
                    pgPct === p.pg && esaiPct === p.esai
                      ? 'bg-indigo-700 text-white border-indigo-700'
                      : 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-100'
                  }`}
                  title={p.full}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Panduan Fleksibilitas Koreksi Uraian (Kasus 1 Guru Didukung Penuh) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 space-y-2">
        <div className="flex items-center gap-1.5">
          <FileCheck2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-900">
            Fleksibilitas Koreksi Uraian
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
            <span className="font-bold text-blue-800 block">
              1. Input Skor Fisik Manual
            </span>
            <p className="text-slate-600 leading-snug">
              Ketik angka skor langsung (misal: <code className="bg-slate-100 px-1 py-0.2 rounded text-blue-700 font-bold">8</code> atau <code className="bg-slate-100 px-1 py-0.2 rounded text-blue-700 font-bold">15/20</code>) di kolom jawaban uraian siswa.
            </p>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
            <span className="font-bold text-indigo-800 block">
              2. Koreksi Otomatis AI
            </span>
            <p className="text-slate-600 leading-snug">
              Bila teks uraian diinput/discan, AI menilai esensi konsep, kata kunci, dan rubrik analitis (Anti-Fluffing).
            </p>
          </div>
        </div>

        <div className="text-[9px] sm:text-[10px] text-slate-500 italic flex items-center gap-1 pt-0.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>Guru dapat mengoreksi/mengoverride nilai kapan saja di tabel hasil.</span>
        </div>
      </div>
    </div>
  );
};
