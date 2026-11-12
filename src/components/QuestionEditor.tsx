import React, { useState } from 'react';
import { QuestionItem, QuestionType } from '../types/grader';
import {
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  RefreshCw,
  Zap,
  KeyRound,
  Sliders,
  Scale,
} from 'lucide-react';
import { SAMPLE_QUESTIONS } from '../data/sampleAssessment';

interface QuestionEditorProps {
  questions: QuestionItem[];
  onChange: (updated: QuestionItem[]) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ questions, onChange }) => {
  // Batch Generator State with INDEPENDENT WEIGHT PER QUESTION TYPE (Bebas Mengisi Bobot)
  const [pgCount, setPgCount] = useState<number>(10);
  const [pgWeightDefault, setPgWeightDefault] = useState<number>(4);

  const [pgkCount, setPgkCount] = useState<number>(3);
  const [pgkWeightDefault, setPgkWeightDefault] = useState<number>(6);

  const [bsCount, setBsCount] = useState<number>(2);
  const [bsWeightDefault, setBsWeightDefault] = useState<number>(5);

  const [isianCount, setIsianCount] = useState<number>(3);
  const [isianWeightDefault, setIsianWeightDefault] = useState<number>(5);

  const [hitunganCount, setHitunganCount] = useState<number>(0);
  const [hitunganWeightDefault, setHitunganWeightDefault] = useState<number>(10);

  const [esaiCount, setEsaiCount] = useState<number>(2);
  const [esaiWeightDefault, setEsaiWeightDefault] = useState<number>(10);

  // Quick Key Paste Bar State
  const [quickPasteKeys, setQuickPasteKeys] = useState<string>('');
  const [showQuickKeyBar, setShowQuickKeyBar] = useState<boolean>(false);

  // Manual Question Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<QuestionType>('pg');
  const [promptText, setPromptText] = useState('');
  const [weight, setWeight] = useState(10);
  const [pgCorrect, setPgCorrect] = useState('A');
  const [pgOptions, setPgOptions] = useState<string[]>([
    'A. Opsi A',
    'B. Opsi B',
    'C. Opsi C',
    'D. Opsi D',
  ]);
  const [pgkOptions, setPgkOptions] = useState<{ id: string; label: string; isCorrect: boolean }[]>([
    { id: 'A', label: 'Pilihan Pertama', isCorrect: true },
    { id: 'B', label: 'Pilihan Kedua', isCorrect: false },
    { id: 'C', label: 'Pilihan Ketiga', isCorrect: true },
    { id: 'D', label: 'Pilihan Keempat', isCorrect: false },
  ]);
  const [bsStatements, setBsStatements] = useState<{ id: string; statement: string; correctAnswer: boolean }[]>([
    { id: 's1', statement: 'Pernyataan sains pertama', correctAnswer: true },
    { id: 's2', statement: 'Pernyataan sains kedua', correctAnswer: false },
  ]);
  const [isianAnswers, setIsianAnswers] = useState('fotosintesis, fotosintesa');
  const [isianMathEq, setIsianMathEq] = useState(false);
  const [essayAnswer, setEssayAnswer] = useState('');
  const [mathFormula, setMathFormula] = useState('v = s / t');
  const [mathFinal, setMathFinal] = useState('5 m/s');

  const totalCalculatedBatchWeight =
    pgCount * pgWeightDefault +
    pgkCount * pgkWeightDefault +
    bsCount * bsWeightDefault +
    isianCount * isianWeightDefault +
    hitunganCount * hitunganWeightDefault +
    esaiCount * esaiWeightDefault;

  const totalCurrentQuestionsWeight = questions.reduce((acc, q) => acc + q.weight, 0);

  // 1. GENERATE BATCH QUESTIONS WITH FREE CUSTOM WEIGHTS
  const handleGenerateBatch = () => {
    const totalCount = pgCount + pgkCount + bsCount + isianCount + hitunganCount + esaiCount;
    if (totalCount === 0) return;

    const newQuestions: QuestionItem[] = [];
    let currentNumber = 1;

    // Generate PG
    for (let i = 0; i < pgCount; i++) {
      newQuestions.push({
        id: `q_batch_pg_${currentNumber}`,
        number: currentNumber,
        type: 'pg',
        prompt: `Soal Pilihan Ganda No. ${currentNumber}`,
        weight: Number(pgWeightDefault) || 1,
        options: ['A. Pilihan A', 'B. Pilihan B', 'C. Pilihan C', 'D. Pilihan D'],
        correctOption: 'A',
      });
      currentNumber++;
    }

    // Generate PGK
    for (let i = 0; i < pgkCount; i++) {
      newQuestions.push({
        id: `q_batch_pgk_${currentNumber}`,
        number: currentNumber,
        type: 'pgk',
        prompt: `Soal Pilihan Ganda Kompleks No. ${currentNumber} (Pilih semua yang benar)`,
        weight: Number(pgkWeightDefault) || 1,
        pgkOptions: [
          { id: 'A', label: 'Pilihan A', isCorrect: true },
          { id: 'B', label: 'Pilihan B', isCorrect: false },
          { id: 'C', label: 'Pilihan C', isCorrect: true },
          { id: 'D', label: 'Pilihan Keempat', isCorrect: false },
        ],
      });
      currentNumber++;
    }

    // Generate BS
    for (let i = 0; i < bsCount; i++) {
      newQuestions.push({
        id: `q_batch_bs_${currentNumber}`,
        number: currentNumber,
        type: 'bs',
        prompt: `Pernyataan Benar / Salah No. ${currentNumber}`,
        weight: Number(bsWeightDefault) || 1,
        bsStatements: [
          { id: 's1', statement: `Pernyataan 1 untuk soal #${currentNumber}`, correctAnswer: true },
          { id: 's2', statement: `Pernyataan 2 untuk soal #${currentNumber}`, correctAnswer: false },
        ],
      });
      currentNumber++;
    }

    // Generate Isian
    for (let i = 0; i < isianCount; i++) {
      newQuestions.push({
        id: `q_batch_isian_${currentNumber}`,
        number: currentNumber,
        type: 'isian',
        prompt: `Pertanyaan Isian Singkat No. ${currentNumber}`,
        weight: Number(isianWeightDefault) || 1,
        acceptableAnswers: ['kunci jawaban', 'alternatif'],
        isMathEquivalent: false,
        fuzzyTolerance: 2,
      });
      currentNumber++;
    }

    // Generate Hitungan
    for (let i = 0; i < hitunganCount; i++) {
      newQuestions.push({
        id: `q_batch_hit_${currentNumber}`,
        number: currentNumber,
        type: 'hitungan',
        prompt: `Soal Hitungan / Prosedural No. ${currentNumber}`,
        weight: Number(hitunganWeightDefault) || 1,
        mathFormula: 'v = s / t',
        mathFinalAnswer: '5 m/s',
      });
      currentNumber++;
    }

    // Generate Esai
    for (let i = 0; i < esaiCount; i++) {
      newQuestions.push({
        id: `q_batch_esai_${currentNumber}`,
        number: currentNumber,
        type: 'esai',
        prompt: `Soal Uraian / Esai No. ${currentNumber}`,
        weight: Number(esaiWeightDefault) || 1,
        modelAnswer: `Kunci konsep esensial yang diharapkan pada soal uraian nomor ${currentNumber}.`,
        rubricCriteria: [
          { id: 'c1', name: 'Kesesuaian Konsep', maxScore: Math.round(Number(esaiWeightDefault) * 0.5) },
          { id: 'c2', name: 'Penalaran & Logika', maxScore: Math.round(Number(esaiWeightDefault) * 0.5) },
        ],
      });
      currentNumber++;
    }

    onChange(newQuestions);
  };

  // 2. SKALAKAN BOBOT KE 100 POIN SECARA PROPORSIONAL (OPSIONAL JIKA GURU MAU)
  const handleScaleWeightsTo100 = () => {
    if (questions.length === 0) return;
    const currentSum = questions.reduce((acc, q) => acc + q.weight, 0);
    if (currentSum === 0) return;

    let runningSum = 0;
    const scaled = questions.map((q, idx) => {
      if (idx === questions.length - 1) {
        // Last item gets remainder to ensure exact 100
        const remainder = Math.max(1, 100 - runningSum);
        return { ...q, weight: remainder };
      }
      const raw = Math.round((q.weight / currentSum) * 100);
      const w = Math.max(1, raw);
      runningSum += w;
      return { ...q, weight: w };
    });

    onChange(scaled);
  };

  // 3. EDIT BOBOT SOAL SECARA LANGSUNG PER BUTIR
  const handleUpdateSingleWeight = (qId: string, newWeight: number) => {
    const validWeight = Math.max(0.5, Math.round((Number(newWeight) || 1) * 10) / 10);
    const updated = questions.map(q => (q.id === qId ? { ...q, weight: validWeight } : q));
    onChange(updated);
  };

  // 4. QUICK PASTE KUNCI JAWABAN MASSAL
  const handleApplyQuickKeys = () => {
    if (!quickPasteKeys.trim()) return;

    const tokens = quickPasteKeys
      .replace(/[;,\t\n]/g, ' ')
      .split(/\s+/)
      .map(t => t.trim().toUpperCase())
      .filter(Boolean);

    const updated = questions.map((q, idx) => {
      const keyVal = tokens[idx];
      if (!keyVal) return q;

      if (q.type === 'pg') {
        const optionMatch = keyVal.match(/^[A-E]$/);
        return {
          ...q,
          correctOption: optionMatch ? optionMatch[0] : q.correctOption,
        };
      } else if (q.type === 'pgk') {
        // Support e.g. "A,C", "AC", "A-C", "B,D"
        const letters = Array.from(
          new Set(
            keyVal
              .replace(/[^A-E]/g, '')
              .split('')
              .filter(Boolean)
          )
        );
        const defaultOpts = [
          { id: 'A', label: 'Pilihan A', isCorrect: false },
          { id: 'B', label: 'Pilihan B', isCorrect: false },
          { id: 'C', label: 'Pilihan C', isCorrect: false },
          { id: 'D', label: 'Pilihan D', isCorrect: false },
        ];
        const existing = q.pgkOptions && q.pgkOptions.length > 0 ? [...q.pgkOptions] : defaultOpts;
        
        // Ensure all pasted letters exist
        letters.forEach(letter => {
          if (!existing.some(o => o.id === letter)) {
            existing.push({ id: letter, label: `Pilihan ${letter}`, isCorrect: true });
          }
        });

        return {
          ...q,
          pgkOptions: existing.map(o => ({
            ...o,
            isCorrect: letters.includes(o.id),
          })),
        };
      } else if (q.type === 'bs') {
        const letters = keyVal.replace(/[^BS]/g, '').split('');
        const stmts = (q.bsStatements || []).map((s, sIdx) => {
          if (letters[sIdx]) {
            return { ...s, correctAnswer: letters[sIdx] === 'B' };
          }
          return s;
        });
        return { ...q, bsStatements: stmts };
      } else if (q.type === 'isian') {
        return {
          ...q,
          acceptableAnswers: [keyVal.toLowerCase()],
        };
      } else if (q.type === 'hitungan') {
        return {
          ...q,
          mathFinalAnswer: keyVal,
        };
      }
      return q;
    });

    onChange(updated);
    setQuickPasteKeys('');
    setShowQuickKeyBar(false);
  };

  // Direct toggle for PGK options (e.g. click A, B, C, D to toggle)
  const handleTogglePgkOption = (qId: string, optId: string) => {
    const updated = questions.map(q => {
      if (q.id !== qId || q.type !== 'pgk') return q;
      const defaultOpts = [
        { id: 'A', label: 'Pilihan A', isCorrect: false },
        { id: 'B', label: 'Pilihan B', isCorrect: false },
        { id: 'C', label: 'Pilihan C', isCorrect: false },
        { id: 'D', label: 'Pilihan D', isCorrect: false },
      ];
      const opts = q.pgkOptions && q.pgkOptions.length > 0 ? [...q.pgkOptions] : defaultOpts;
      const exists = opts.some(o => o.id === optId);
      const updatedOpts = exists
        ? opts.map(o => (o.id === optId ? { ...o, isCorrect: !o.isCorrect } : o))
        : [...opts, { id: optId, label: `Pilihan ${optId}`, isCorrect: true }];

      return {
        ...q,
        pgkOptions: updatedOpts,
      };
    });
    onChange(updated);
  };

  // Direct toggle for Benar/Salah statement
  const handleToggleBsStatement = (qId: string, statementId: string) => {
    const updated = questions.map(q => {
      if (q.id !== qId || q.type !== 'bs') return q;
      const stmts = (q.bsStatements || []).map(s =>
        s.id === statementId ? { ...s, correctAnswer: !s.correctAnswer } : s
      );
      return { ...q, bsStatements: stmts };
    });
    onChange(updated);
  };

  // Quick Inline Key update
  const handleUpdateQuickKeyInline = (qId: string, newKey: string) => {
    const updated = questions.map(q => {
      if (q.id !== qId) return q;
      if (q.type === 'pg') {
        return { ...q, correctOption: newKey.toUpperCase().trim() };
      } else if (q.type === 'pgk') {
        // Parse: "A, C", "AC", "A-C", "A B C", "B,D"
        const letters = Array.from(
          new Set(
            newKey
              .toUpperCase()
              .replace(/[^A-Z]/g, '')
              .split('')
              .filter(Boolean)
          )
        );
        const defaultOpts = [
          { id: 'A', label: 'Pilihan A', isCorrect: false },
          { id: 'B', label: 'Pilihan B', isCorrect: false },
          { id: 'C', label: 'Pilihan C', isCorrect: false },
          { id: 'D', label: 'Pilihan D', isCorrect: false },
        ];
        const existing = q.pgkOptions && q.pgkOptions.length > 0 ? [...q.pgkOptions] : defaultOpts;
        
        letters.forEach(letter => {
          if (!existing.some(o => o.id === letter)) {
            existing.push({
              id: letter,
              label: `Pilihan ${letter}`,
              isCorrect: true,
            });
          }
        });

        return {
          ...q,
          pgkOptions: existing.map(o => ({
            ...o,
            isCorrect: letters.includes(o.id),
          })),
        };
      } else if (q.type === 'bs') {
        const letters = newKey.toUpperCase().replace(/[^BS]/g, '').split('');
        const stmts = (q.bsStatements || []).map((s, idx) => {
          if (letters[idx]) {
            return { ...s, correctAnswer: letters[idx] === 'B' };
          }
          return s;
        });
        return { ...q, bsStatements: stmts };
      } else if (q.type === 'isian') {
        return { ...q, acceptableAnswers: [newKey.trim()] };
      } else if (q.type === 'hitungan') {
        return { ...q, mathFinalAnswer: newKey.trim() };
      }
      return q;
    });
    onChange(updated);
  };

  const handleStartEdit = (q: QuestionItem) => {
    setEditingId(q.id);
    setActiveType(q.type);
    setPromptText(q.prompt);
    setWeight(q.weight);

    if (q.type === 'pg') {
      setPgCorrect(q.correctOption || 'A');
      setPgOptions(q.options || ['A. Pilihan A', 'B. Pilihan B', 'C. Pilihan C', 'D. Pilihan D']);
    } else if (q.type === 'pgk') {
      const defaultPgk = [
        { id: 'A', label: 'Pilihan A', isCorrect: true },
        { id: 'B', label: 'Pilihan B', isCorrect: false },
        { id: 'C', label: 'Pilihan C', isCorrect: true },
        { id: 'D', label: 'Pilihan D', isCorrect: false },
      ];
      setPgkOptions(q.pgkOptions && q.pgkOptions.length > 0 ? q.pgkOptions : defaultPgk);
    } else if (q.type === 'bs') {
      const defaultBs = [
        { id: 's1', statement: 'Pernyataan 1', correctAnswer: true },
        { id: 's2', statement: 'Pernyataan 2', correctAnswer: false },
      ];
      setBsStatements(q.bsStatements && q.bsStatements.length > 0 ? q.bsStatements : defaultBs);
    } else if (q.type === 'isian') {
      setIsianAnswers((q.acceptableAnswers || []).join(', '));
      setIsianMathEq(Boolean(q.isMathEquivalent));
    } else if (q.type === 'esai') {
      setEssayAnswer(q.modelAnswer || '');
    } else if (q.type === 'hitungan') {
      setMathFormula(q.mathFormula || '');
      setMathFinal(q.mathFinalAnswer || '');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setPromptText('');
  };

  const handleSaveQuestion = () => {
    if (!promptText.trim()) return;

    const baseQuestion: Partial<QuestionItem> = {
      type: activeType,
      prompt: promptText.trim(),
      weight: Number(weight) || 10,
    };

    if (activeType === 'pg') {
      baseQuestion.options = pgOptions;
      baseQuestion.correctOption = pgCorrect.toUpperCase().trim();
    } else if (activeType === 'pgk') {
      baseQuestion.pgkOptions = pgkOptions;
    } else if (activeType === 'bs') {
      baseQuestion.bsStatements = bsStatements;
    } else if (activeType === 'isian') {
      baseQuestion.acceptableAnswers = isianAnswers
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      baseQuestion.isMathEquivalent = isianMathEq;
      baseQuestion.fuzzyTolerance = 2;
    } else if (activeType === 'esai') {
      baseQuestion.modelAnswer = essayAnswer.trim();
      baseQuestion.rubricCriteria = [
        { id: 'c1', name: 'Substansi & Kunci Konsep', maxScore: Math.round(weight * 0.5) },
        { id: 'c2', name: 'Alur Logika & Analitis', maxScore: Math.round(weight * 0.5) },
      ];
    } else if (activeType === 'hitungan') {
      baseQuestion.mathFormula = mathFormula.trim();
      baseQuestion.mathFinalAnswer = mathFinal.trim();
    }

    if (editingId) {
      onChange(questions.map(q => (q.id === editingId ? ({ ...q, ...baseQuestion } as QuestionItem) : q)));
      setEditingId(null);
    } else {
      const newQ: QuestionItem = {
        id: `q_${Date.now()}`,
        number: questions.length + 1,
        ...baseQuestion,
      } as QuestionItem;
      onChange([...questions, newQ]);
    }
    setPromptText('');
  };

  const handleDelete = (id: string) => {
    const filtered = questions.filter(q => q.id !== id);
    const renumbered = filtered.map((q, idx) => ({ ...q, number: idx + 1 }));
    onChange(renumbered);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. KOTAK BATCH GENERATOR DENGAN KEBEBASAN BOBOT SOAL */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border-2 border-blue-200 rounded-2xl p-3 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 pb-3 border-b border-blue-200/60 mb-4">
          <div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-700" />
              <h2 className="text-xs sm:text-base font-bold text-slate-900">
                Atur Jumlah &amp; Bobot Soal
              </h2>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-600 mt-0.5">
              Kebebasan penuh menentukan jumlah dan bobot per jenis soal. Nilai akhir otomatis dihitung proporsional.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {questions.length === 0 ? (
              <button
                type="button"
                onClick={() => onChange(SAMPLE_QUESTIONS)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-blue-800 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 shadow-2xs"
                title="Muat Contoh IPAS 7 Soal"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Muat Contoh IPAS</span>
                <span className="sm:hidden">Contoh</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onChange([])}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                title="Kosongkan Soal"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kosongkan</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 KARTU BENTUK SOAL (JUMLAH + BOBOT BEBAS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 mb-4">
          {/* PG Tunggal */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-800">
              <span>1. Pilihan Ganda (PG)</span>
              <span className="text-[10px] text-blue-700 font-mono font-normal">
                Subtotal: {pgCount * pgWeightDefault} pt
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] text-slate-500 font-semibold mb-0.5 uppercase">Jumlah</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={pgCount}
                  onChange={(e) => setPgCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xs font-mono font-bold text-slate-900 px-1.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 font-semibold mb-0.5 uppercase">Bobot/Butir</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={pgWeightDefault}
                  onChange={(e) => setPgWeightDefault(Math.max(0.5, parseFloat(e.target.value) || 1))}
                  className="w-full text-xs font-mono font-bold text-blue-700 px-1.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center"
                />
              </div>
            </div>
          </div>

          {/* PGK Kompleks */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>2. PG Kompleks (PCM)</span>
              <span className="text-[11px] text-blue-700 font-mono font-normal">
                Subtotal: {pgkCount * pgkWeightDefault} pt
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jumlah Soal</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={pgkCount}
                  onChange={(e) => setPgkCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-sm font-mono font-bold text-slate-900 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Bobot per Butir</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={pgkWeightDefault}
                  onChange={(e) => setPgkWeightDefault(Math.max(0.5, parseFloat(e.target.value) || 1))}
                  className="w-full text-sm font-mono font-bold text-blue-700 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center"
                />
              </div>
            </div>
          </div>

          {/* Benar / Salah */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>3. Benar / Salah (BS)</span>
              <span className="text-[11px] text-blue-700 font-mono font-normal">
                Subtotal: {bsCount * bsWeightDefault} pt
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jumlah Soal</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={bsCount}
                  onChange={(e) => setBsCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-sm font-mono font-bold text-slate-900 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Bobot per Butir</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={bsWeightDefault}
                  onChange={(e) => setBsWeightDefault(Math.max(0.5, parseFloat(e.target.value) || 1))}
                  className="w-full text-sm font-mono font-bold text-blue-700 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center"
                />
              </div>
            </div>
          </div>

          {/* Isian Singkat */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>4. Isian Singkat</span>
              <span className="text-[11px] text-blue-700 font-mono font-normal">
                Subtotal: {isianCount * isianWeightDefault} pt
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jumlah Soal</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={isianCount}
                  onChange={(e) => setIsianCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-sm font-mono font-bold text-slate-900 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Bobot per Butir</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={isianWeightDefault}
                  onChange={(e) => setIsianWeightDefault(Math.max(0.5, parseFloat(e.target.value) || 1))}
                  className="w-full text-sm font-mono font-bold text-blue-700 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center"
                />
              </div>
            </div>
          </div>

          {/* Hitungan Proses */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>5. Hitungan Proses</span>
              <span className="text-[11px] text-blue-700 font-mono font-normal">
                Subtotal: {hitunganCount * hitunganWeightDefault} pt
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jumlah Soal</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={hitunganCount}
                  onChange={(e) => setHitunganCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-sm font-mono font-bold text-slate-900 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Bobot per Butir</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={hitunganWeightDefault}
                  onChange={(e) => setHitunganWeightDefault(Math.max(0.5, parseFloat(e.target.value) || 1))}
                  className="w-full text-sm font-mono font-bold text-blue-700 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center"
                />
              </div>
            </div>
          </div>

          {/* Esai / Uraian */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>6. Esai / Uraian</span>
              <span className="text-[11px] text-blue-700 font-mono font-normal">
                Subtotal: {esaiCount * esaiWeightDefault} pt
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jumlah Soal</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={esaiCount}
                  onChange={(e) => setEsaiCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-sm font-mono font-bold text-slate-900 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Bobot per Butir</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={esaiWeightDefault}
                  onChange={(e) => setEsaiWeightDefault(Math.max(0.5, parseFloat(e.target.value) || 1))}
                  className="w-full text-sm font-mono font-bold text-blue-700 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Generator Action & Live Total Weight */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-white/80 p-2.5 sm:p-3.5 rounded-xl border border-blue-200">
          <div className="text-[10px] sm:text-xs text-slate-700 flex items-center gap-1.5 flex-wrap">
            <span>Rencana: </span>
            <strong className="font-mono text-xs sm:text-sm text-slate-900">
              {pgCount + pgkCount + bsCount + isianCount + hitunganCount + esaiCount} Soal
            </strong>
            <span className="text-slate-300">·</span>
            <span>Total Bobot: </span>
            <strong className="font-mono text-xs sm:text-sm text-blue-700 font-bold">
              {totalCalculatedBatchWeight} Poin
            </strong>
          </div>

          <button
            type="button"
            onClick={handleGenerateBatch}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>
              Buat {pgCount + pgkCount + bsCount + isianCount + hitunganCount + esaiCount} Soal
            </span>
          </button>
        </div>
      </div>

      {/* 2. STRIP KUNCI JAWABAN & BOBOT MASSAL (BISA DI-EDIT LANGSUNG DI SINI) */}
      {questions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-xs space-y-2.5 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <h3 className="text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider">
                Kunci Jawaban &amp; Bobot ({questions.length} Butir)
              </h3>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Optional Scale to 100 button */}
              <button
                type="button"
                onClick={handleScaleWeightsTo100}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                title="Bagi bobot secara proporsional agar total pas 100 poin"
              >
                <Scale className="w-3 h-3 text-blue-700" />
                <span className="hidden sm:inline">Ratakan ke 100 Poin</span>
                <span className="sm:hidden">Ratakan 100</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQuickKeyBar(!showQuickKeyBar)}
                className="text-[10px] sm:text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                {showQuickKeyBar ? 'Tutup Tempel' : '📋 Tempel Kunci'}
              </button>
            </div>
          </div>

          {/* Quick Paste Bar */}
          {showQuickKeyBar && (
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-2">
              <label className="block text-[11px] font-semibold text-emerald-950">
                Tempel Kunci Jawaban (Pisahkan spasi atau koma):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={quickPasteKeys}
                  onChange={(e) => setQuickPasteKeys(e.target.value)}
                  placeholder="Contoh: B C D A B C A D B C fotosintesis"
                  className="flex-1 text-xs font-mono px-3 py-1.5 bg-white border border-emerald-300 rounded-lg uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyQuickKeys}
                  className="px-4 py-1.5 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 shrink-0 text-xs"
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}

          {/* Horizontal Scrollable Strip: Set Key AND Set Weight directly per question! */}
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-2.5 min-w-max">
              {questions.map((q) => {
                const currentKey =
                  q.type === 'pg'
                    ? q.correctOption || 'A'
                    : q.type === 'pgk'
                    ? q.pgkOptions?.filter(o => o.isCorrect).map(o => o.id).join(',') || 'A,C'
                    : q.type === 'bs'
                    ? q.bsStatements?.map(s => s.correctAnswer ? 'B' : 'S').join(',') || 'B,S'
                    : q.type === 'isian'
                    ? q.acceptableAnswers?.[0] || 'Jawaban'
                    : q.type === 'hitungan'
                    ? q.mathFinalAnswer || '5'
                    : 'Esai/Rubrik';

                return (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/90 hover:bg-white hover:border-blue-300 transition-colors flex flex-col items-center w-32 shrink-0 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between w-full text-[10px] font-mono">
                      <span className="font-bold text-slate-800">#{q.number}</span>
                      <span className="uppercase text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-semibold">
                        {q.type}
                      </span>
                    </div>

                    {/* Key Input */}
                    {q.type === 'pg' ? (
                      <select
                        value={q.correctOption || 'A'}
                        onChange={(e) => handleUpdateQuickKeyInline(q.id, e.target.value)}
                        className="w-full text-xs font-mono font-bold text-center py-1 bg-white border border-slate-300 rounded text-blue-700 cursor-pointer"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                      </select>
                    ) : q.type === 'pgk' ? (
                      <div className="w-full space-y-1">
                        {/* 1-Click Toggles for A, B, C, D, (E) */}
                        <div className="flex items-center justify-center gap-0.5">
                          {(q.pgkOptions && q.pgkOptions.length > 0 ? q.pgkOptions : [
                            { id: 'A', label: 'A', isCorrect: false },
                            { id: 'B', label: 'B', isCorrect: false },
                            { id: 'C', label: 'C', isCorrect: false },
                            { id: 'D', label: 'D', isCorrect: false },
                          ]).slice(0, 5).map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleTogglePgkOption(q.id, opt.id)}
                              className={`w-5 h-5 text-[10px] font-bold font-mono rounded flex items-center justify-center transition-all border ${
                                opt.isCorrect
                                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs scale-105'
                                  : 'bg-white text-slate-500 hover:bg-slate-100 border-slate-200'
                              }`}
                              title={`Klik untuk ${opt.isCorrect ? 'batalkan' : 'jadikan'} kunci ${opt.id}`}
                            >
                              {opt.id}
                            </button>
                          ))}
                        </div>
                        {/* Inline Key text field */}
                        <input
                          type="text"
                          value={currentKey}
                          onChange={(e) => handleUpdateQuickKeyInline(q.id, e.target.value)}
                          placeholder="misal: A,C"
                          className="w-full text-[10px] font-mono font-bold text-center py-0.5 px-1 bg-emerald-50/70 border border-emerald-300 rounded text-emerald-800"
                          title="Ketik huruf kunci PGK (misal: A, C atau B, D)"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={currentKey}
                        onChange={(e) => handleUpdateQuickKeyInline(q.id, e.target.value)}
                        className="w-full text-[11px] font-mono text-center py-1 px-1 bg-white border border-slate-300 rounded truncate"
                        title={currentKey}
                      />
                    )}

                    {/* Freedom of Weight Input per Question */}
                    <div className="flex items-center justify-between w-full text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      <span className="text-slate-400 font-sans">Bobot:</span>
                      <div className="flex items-center gap-0.5 font-mono">
                        <input
                          type="number"
                          step={0.5}
                          min={0.5}
                          value={q.weight}
                          onChange={(e) => handleUpdateSingleWeight(q.id, parseFloat(e.target.value) || 1)}
                          className="w-10 text-center font-bold text-slate-900 border-b border-blue-400 focus:outline-none"
                        />
                        <span className="text-slate-400">pt</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. RINGKASAN BOBOT AKTIF */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs">
          <span>Jumlah Soal Aktif: <strong className="text-slate-900 font-mono">{questions.length} Butir</strong></span>
          <span className="text-slate-300">·</span>
          <span>
            Total Bobot Maksimal: <strong className="font-mono text-blue-700 font-bold text-sm">{totalCurrentQuestionsWeight} Poin</strong>
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 font-sans">
            (Skor siswa dihitung: Skor Diperoleh / {totalCurrentQuestionsWeight} × 100)
          </span>
        </div>

        <button
          type="button"
          onClick={handleScaleWeightsTo100}
          className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-semibold"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Ingin Total Pas 100 Poin? Klik di Sini</span>
        </button>
      </div>

      {/* 4. DAFTAR KARTU BUTIR SOAL */}
      {questions.length > 0 && (
        <div className="space-y-3">
          {questions.map((q) => {
            const isEditing = editingId === q.id;
            return (
              <div
                key={q.id}
                className={`bg-white rounded-xl border p-4 transition-colors ${
                  isEditing ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900 font-mono">Soal #{q.number}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded text-[11px] uppercase">
                        {q.type}
                      </span>
                      <span className="text-slate-300">·</span>
                      {/* Inline Editable Weight */}
                      <div className="flex items-center gap-1 font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        <span>Bobot:</span>
                        <input
                          type="number"
                          step={0.5}
                          min={0.5}
                          value={q.weight}
                          onChange={(e) => handleUpdateSingleWeight(q.id, parseFloat(e.target.value) || 1)}
                          className="w-12 text-center font-bold text-slate-900 bg-white border border-slate-300 rounded"
                        />
                        <span>poin</span>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-slate-800 leading-relaxed">
                      {q.prompt}
                    </p>

                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
                      {q.type === 'pg' && (
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-slate-500 font-medium">Kunci Jawaban:</span>
                          <strong className="text-emerald-700 font-mono text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {q.correctOption}
                          </strong>
                        </div>
                      )}

                      {q.type === 'pgk' && (
                        <div className="space-y-1.5 font-sans">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-700 text-[11px]">Kunci PGK:</span>
                            {(q.pgkOptions && q.pgkOptions.length > 0 ? q.pgkOptions : [
                              { id: 'A', label: 'Pilihan A', isCorrect: false },
                              { id: 'B', label: 'Pilihan B', isCorrect: false },
                              { id: 'C', label: 'Pilihan C', isCorrect: false },
                              { id: 'D', label: 'Pilihan D', isCorrect: false },
                            ]).map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleTogglePgkOption(q.id, opt.id)}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-all border ${
                                  opt.isCorrect
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-300'
                                }`}
                                title={`Klik untuk ${opt.isCorrect ? 'batalkan' : 'jadikan'} kunci ${opt.id}`}
                              >
                                {opt.id} {opt.isCorrect ? '✓' : ''}
                              </button>
                            ))}
                            <span className="text-[10px] text-slate-400 italic">
                              (Klik huruf untuk ubah kunci)
                            </span>
                          </div>

                          {q.pgkOptions && q.pgkOptions.some((o) => o.label && o.label !== `Pilihan ${o.id}`) && (
                            <div className="text-[10px] text-slate-600 pl-1 space-y-0.5 pt-1 border-t border-slate-200/60">
                              {q.pgkOptions.map((o) => (
                                <div key={o.id} className={o.isCorrect ? 'font-semibold text-emerald-800' : 'text-slate-500'}>
                                  <span className="font-mono">{o.id}.</span> {o.label} {o.isCorrect ? '★ (Kunci)' : ''}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {q.type === 'bs' && (
                        <div className="space-y-1 font-sans">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-700 text-[11px]">Kunci Benar/Salah:</span>
                            {(q.bsStatements || []).map((s, idx) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleToggleBsStatement(q.id, s.id)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-all border ${
                                  s.correctAnswer
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                    : 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                                }`}
                                title={`Pernyataan #${idx + 1}: Klik untuk ubah ke ${s.correctAnswer ? 'SALAH' : 'BENAR'}`}
                              >
                                #{idx + 1}: {s.correctAnswer ? 'B' : 'S'}
                              </button>
                            ))}
                            <span className="text-[10px] text-slate-400 italic">(Klik untuk ubah B/S)</span>
                          </div>
                        </div>
                      )}

                      {q.type === 'isian' && (
                        <div>
                          <span>Kunci Diterima: <strong className="text-emerald-700">{q.acceptableAnswers?.join(' / ')}</strong></span>
                          {q.isMathEquivalent && <span className="ml-2 text-[10px] text-blue-600 font-sans">(Ekuivalen Matematika Aktif)</span>}
                        </div>
                      )}

                      {q.type === 'hitungan' && (
                        <div>
                          <span>Hasil Akhir: <strong className="text-emerald-700">{q.mathFinalAnswer}</strong></span>
                          <span className="text-slate-300 mx-2">|</span>
                          <span>Rumus: <code className="text-blue-700">{q.mathFormula}</code></span>
                        </div>
                      )}

                      {q.type === 'esai' && (
                        <div>
                          <span className="font-sans font-semibold text-slate-600">Acuan Jawaban Guru:</span>
                          <p className="font-sans text-slate-800 italic mt-0.5">{q.modelAnswer || 'Belum diisi'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(q)}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Naskah & Rubrik"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      title="Hapus Soal Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Form Modal/Section jika guru klik Edit Soal */}
      {editingId && (
        <div className="bg-white rounded-xl border-2 border-blue-400 p-4 sm:p-6 shadow-md">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Edit Soal #{questions.find((q) => q.id === editingId)?.number} ({activeType.toUpperCase()})
            </h3>
            <button
              onClick={handleCancelEdit}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Batalkan
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teks Pertanyaan</label>
              <textarea
                rows={2}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bobot Nilai (Poin)</label>
                <input
                  type="number"
                  step={0.5}
                  min={0.5}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-700"
                />
              </div>

              {activeType === 'pg' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kunci Jawaban Tunggal</label>
                  <select
                    value={pgCorrect}
                    onChange={(e) => setPgCorrect(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700 bg-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
              )}
            </div>

            {/* Pilihan Ganda Kompleks (PGK) Multi-Key Editor */}
            {activeType === 'pgk' && (
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-emerald-950">
                      Kunci Jawaban Pilihan Ganda Kompleks (PGK)
                    </label>
                    <p className="text-[11px] text-emerald-800">
                      Centang kotak pada opsi yang merupakan jawaban <strong>BENAR</strong> (bisa lebih dari satu).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextChar = String.fromCharCode(65 + pgkOptions.length);
                      setPgkOptions([
                        ...pgkOptions,
                        { id: nextChar, label: `Pilihan ${nextChar}`, isCorrect: false },
                      ]);
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs"
                  >
                    + Tambah Opsi
                  </button>
                </div>

                <div className="space-y-2">
                  {pgkOptions.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border transition-colors ${
                        opt.isCorrect
                          ? 'bg-emerald-100/80 border-emerald-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`edit_pgk_opt_${opt.id}`}
                        checked={opt.isCorrect}
                        onChange={(e) => {
                          const updated = pgkOptions.map((o, i) =>
                            i === idx ? { ...o, isCorrect: e.target.checked } : o
                          );
                          setPgkOptions(updated);
                        }}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                      />
                      <label
                        htmlFor={`edit_pgk_opt_${opt.id}`}
                        className={`w-6 text-center font-mono font-bold text-xs cursor-pointer ${
                          opt.isCorrect ? 'text-emerald-900' : 'text-slate-600'
                        }`}
                      >
                        {opt.id}
                      </label>
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => {
                          const updated = pgkOptions.map((o, i) =>
                            i === idx ? { ...o, label: e.target.value } : o
                          );
                          setPgkOptions(updated);
                        }}
                        placeholder={`Teks pilihan ${opt.id}...`}
                        className="flex-1 text-xs px-2.5 py-1 bg-white border border-slate-200 rounded"
                      />
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          opt.isCorrect
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {opt.isCorrect ? 'BENAR (Kunci)' : 'Salah'}
                      </span>
                      {pgkOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setPgkOptions(pgkOptions.filter((_, i) => i !== idx));
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Hapus opsi ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  💡 <strong>Kunci Terpilih: </strong>
                  <strong className="text-emerald-700 font-mono">
                    {pgkOptions.filter((o) => o.isCorrect).map((o) => o.id).join(', ') || 'Belum ada (Pilih minimal 1)'}
                  </strong>
                  <span className="text-slate-400 text-[10px] block mt-0.5">
                    Siswa dinilai proporsional menggunakan Partial Credit Model (PCM).
                  </span>
                </div>
              </div>
            )}

            {/* Benar / Salah (BS) Statement Editor */}
            {activeType === 'bs' && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900">
                    Pernyataan Benar / Salah (BS)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextId = `s_${Date.now()}`;
                      setBsStatements([
                        ...bsStatements,
                        { id: nextId, statement: `Pernyataan #${bsStatements.length + 1}`, correctAnswer: true },
                      ]);
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    + Tambah Pernyataan
                  </button>
                </div>

                <div className="space-y-2">
                  {bsStatements.map((stmt, idx) => (
                    <div key={stmt.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-xs font-mono font-bold text-slate-600">#{idx + 1}</span>
                      <input
                        type="text"
                        value={stmt.statement}
                        onChange={(e) => {
                          const updated = bsStatements.map((s, i) =>
                            i === idx ? { ...s, statement: e.target.value } : s
                          );
                          setBsStatements(updated);
                        }}
                        className="flex-1 text-xs px-2.5 py-1 border border-slate-200 rounded"
                        placeholder="Isi teks pernyataan..."
                      />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = bsStatements.map((s, i) =>
                              i === idx ? { ...s, correctAnswer: true } : s
                            );
                            setBsStatements(updated);
                          }}
                          className={`px-2 py-0.5 text-xs font-bold rounded ${
                            stmt.correctAnswer ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Benar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = bsStatements.map((s, i) =>
                              i === idx ? { ...s, correctAnswer: false } : s
                            );
                            setBsStatements(updated);
                          }}
                          className={`px-2 py-0.5 text-xs font-bold rounded ${
                            !stmt.correctAnswer ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Salah
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Isian Singkat */}
            {activeType === 'isian' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Kunci Jawaban Isian Singkat (Pisahkan dengan koma jika ada alternatif kata)
                </label>
                <input
                  type="text"
                  value={isianAnswers}
                  onChange={(e) => setIsianAnswers(e.target.value)}
                  placeholder="Contoh: fotosintesis, fotosintesa, fotosintesis tumbuhan"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="math_eq_chk"
                    checked={isianMathEq}
                    onChange={(e) => setIsianMathEq(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <label htmlFor="math_eq_chk" className="text-xs text-slate-700 cursor-pointer">
                    Aktifkan toleransi ekuivalensi matematika (misal: "0,5" = "1/2" = "50%" = "setengah")
                  </label>
                </div>
              </div>
            )}

            {/* Hitungan */}
            {activeType === 'hitungan' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rumus Acuan</label>
                  <input
                    type="text"
                    value={mathFormula}
                    onChange={(e) => setMathFormula(e.target.value)}
                    placeholder="misal: v = s / t"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hasil Akhir Target</label>
                  <input
                    type="text"
                    value={mathFinal}
                    onChange={(e) => setMathFinal(e.target.value)}
                    placeholder="misal: 5 m/s"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>
            )}

            {/* Esai */}
            {activeType === 'esai' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Model Jawaban / Konsep Kunci Acuan Penilaian
                </label>
                <textarea
                  rows={3}
                  value={essayAnswer}
                  onChange={(e) => setEssayAnswer(e.target.value)}
                  placeholder="Tuliskan poin-poin konsep esensial yang diharapkan muncul pada jawaban siswa..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-700 rounded-md hover:bg-blue-800 shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
