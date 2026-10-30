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

  // Quick Inline Key update
  const handleUpdateQuickKeyInline = (qId: string, newKey: string) => {
    const updated = questions.map(q => {
      if (q.id !== qId) return q;
      if (q.type === 'pg') {
        return { ...q, correctOption: newKey.toUpperCase().trim() };
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
      setPgOptions(q.options || ['A. ', 'B. ', 'C. ', 'D. ']);
    } else if (q.type === 'pgk') {
      setPgkOptions(q.pgkOptions || []);
    } else if (q.type === 'bs') {
      setBsStatements(q.bsStatements || []);
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

                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
                      {q.type === 'pg' && (
                        <span>Kunci: <strong className="text-emerald-700">{q.correctOption}</strong></span>
                      )}
                      {q.type === 'pgk' && (
                        <span>Kunci: <strong className="text-emerald-700">{q.pgkOptions?.filter(o => o.isCorrect).map(o => o.id).join(', ')}</strong></span>
                      )}
                      {q.type === 'bs' && (
                        <span>Pernyataan: {q.bsStatements?.map((s, idx) => `#${idx + 1}:${s.correctAnswer ? 'B' : 'S'}`).join(' · ')}</span>
                      )}
                      {q.type === 'isian' && (
                        <span>Kunci: <strong>{q.acceptableAnswers?.join(' / ')}</strong></span>
                      )}
                      {q.type === 'hitungan' && (
                        <span>Hasil: <strong className="text-emerald-700">{q.mathFinalAnswer}</strong> | Rumus: {q.mathFormula}</span>
                      )}
                      {q.type === 'esai' && (
                        <span>Acuan Konsep: {q.modelAnswer}</span>
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
        <div className="bg-white rounded-xl border border-blue-400 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Edit Teks &amp; Rubrik Soal #{questions.find(q => q.id === editingId)?.number}
            </h3>
            <button
              onClick={handleCancelEdit}
              className="text-xs text-slate-500 hover:text-slate-800"
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
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bobot Nilai (Poin)</label>
                <input
                  type="number"
                  step={0.5}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              {activeType === 'pg' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kunci Jawaban</label>
                  <select
                    value={pgCorrect}
                    onChange={(e) => setPgCorrect(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-700"
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-md"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-700 rounded-md hover:bg-blue-800"
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
