import React, { useState } from 'react';
import { StudentGradedResult, QuestionItem, QuestionGradingDetail, WeightingScheme } from '../types/grader';
import { calculateStudentTotals } from '../services/graderEngine';
import { X, Check, Undo2, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

interface StudentOverrideDrawerProps {
  student: StudentGradedResult | null;
  questions: QuestionItem[];
  kkm: number;
  weightingScheme?: WeightingScheme;
  isOpen: boolean;
  onClose: () => void;
  onSaveOverride: (updatedStudent: StudentGradedResult) => void;
}

export const StudentOverrideDrawer: React.FC<StudentOverrideDrawerProps> = ({
  student,
  questions,
  kkm,
  weightingScheme,
  isOpen,
  onClose,
  onSaveOverride,
}) => {
  if (!isOpen || !student) return null;

  // Local state for modified question details
  const [localScores, setLocalScores] = useState<Record<string, QuestionGradingDetail>>({
    ...student.questionScores,
  });

  const [personalNotes, setPersonalNotes] = useState(student.personalFeedbackNotes || '');

  // Calculate live preview totals
  const liveTotals = calculateStudentTotals(
    student.studentId,
    student.nisn,
    student.studentName,
    localScores,
    kkm,
    personalNotes,
    weightingScheme,
    questions
  );

  const handleScoreChange = (qId: string, newScore: number) => {
    const current = localScores[qId];
    if (!current) return;

    const clamped = Math.max(0, Math.min(current.maxScore, Math.round(newScore * 10) / 10));
    const wasOverridden = current.originalScore !== undefined ? current.originalScore !== clamped : current.score !== clamped;

    setLocalScores({
      ...localScores,
      [qId]: {
        ...current,
        score: clamped,
        partialRatio: Math.round((clamped / current.maxScore) * 100) / 100,
        isCorrect: clamped >= current.maxScore * 0.7,
        isOverridden: wasOverridden,
        originalScore: current.originalScore ?? current.score,
        overrideReason: current.overrideReason || 'Penyesuaian manual oleh Guru Mata Pelajaran',
      },
    });
  };

  const handleReasonChange = (qId: string, reason: string) => {
    const current = localScores[qId];
    if (!current) return;

    setLocalScores({
      ...localScores,
      [qId]: {
        ...current,
        overrideReason: reason,
      },
    });
  };

  const handleResetScore = (qId: string) => {
    const current = localScores[qId];
    if (!current || current.originalScore === undefined) return;

    setLocalScores({
      ...localScores,
      [qId]: {
        ...current,
        score: current.originalScore,
        partialRatio: Math.round((current.originalScore / current.maxScore) * 100) / 100,
        isCorrect: current.originalScore >= current.maxScore * 0.7,
        isOverridden: false,
        overrideReason: undefined,
      },
    });
  };

  const handleSave = () => {
    onSaveOverride(liveTotals);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="px-3.5 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xs sm:text-base font-bold text-slate-900">
                Koreksi &amp; Override Nilai
              </h2>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] sm:text-xs text-blue-700 font-bold">{student.studentName}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 mt-0.5 flex-wrap">
              <span>NISN: <strong className="font-mono text-slate-700">{student.nisn}</strong></span>
              <span>·</span>
              <span>
                Nilai Baru: <strong className={`font-mono font-bold ${liveTotals.percentageScore >= kkm ? 'text-emerald-700' : 'text-rose-700'}`}>{liveTotals.percentageScore}</strong>
              </span>
              <span>·</span>
              <span>Status: <strong className={liveTotals.status === 'Tuntas' ? 'text-emerald-700' : 'text-rose-700'}>{liveTotals.status}</strong></span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 flex-1">
          <div className="flex items-center gap-2 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg text-[10px] sm:text-xs text-blue-900">
            <Sparkles className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>
              Sesuaikan skor pada butir soal di bawah. Nilai dan status KKM dihitung seketika.
            </span>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {questions.map((q) => {
              const detail = localScores[q.id];
              if (!detail) return null;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    detail.isOverridden
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-slate-900">Soal #{q.number}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-medium text-slate-500 uppercase text-[10px]">
                          {q.type}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 font-mono">Bobot: {detail.maxScore} poin</span>
                        {detail.isOverridden && (
                          <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-mono font-bold">
                            Telah Di-override
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        {q.prompt}
                      </p>
                    </div>

                    {/* Score Control */}
                    <div className="flex items-center gap-2 shrink-0 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <div className="text-right">
                        <label className="block text-[10px] text-slate-500 uppercase font-semibold">
                          Skor Siswa
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={detail.maxScore}
                            step={0.5}
                            value={detail.score}
                            onChange={(e) => handleScoreChange(q.id, parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded text-center"
                          />
                          <span className="text-xs font-mono text-slate-400">/ {detail.maxScore}</span>
                        </div>
                      </div>

                      {detail.isOverridden && (
                        <button
                          type="button"
                          onClick={() => handleResetScore(q.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                          title="Kembalikan ke Skor Asli AI"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Student Answer vs Key */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                        Jawaban Siswa:
                      </span>
                      <p className="text-slate-900 font-mono text-xs break-words">
                        {detail.studentAnswerDisplay || '(Kosong)'}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                        Kunci Jawaban / Acuan:
                      </span>
                      <p className="text-slate-800 font-mono text-xs break-words">
                        {detail.keyAnswerDisplay}
                      </p>
                    </div>
                  </div>

                  {/* Feedback & AI Notes */}
                  {detail.feedback && (
                    <div className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 mt-2 space-y-1">
                      <div className="flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span><strong>Umpan Balik:</strong> {detail.feedback}</span>
                      </div>
                      {detail.aiNotes && (
                        <div className="text-[11px] text-slate-500 pl-5">
                          <em>Analisis AI: {detail.aiNotes}</em>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Override Reason Input */}
                  {detail.isOverridden && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <input
                        type="text"
                        value={detail.overrideReason || ''}
                        onChange={(e) => handleReasonChange(q.id, e.target.value)}
                        placeholder="Alasan penyesuaian nilai guru..."
                        className="w-full text-xs px-2.5 py-1 bg-white border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-amber-950"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Personal Teacher Evaluation Notes */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
              Catatan Evaluasi Personal untuk Rapor Siswa:
            </label>
            <textarea
              rows={2}
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Berikan catatan personal atau rekomendasi pengayaan/remedial bagi siswa..."
            />
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Nilai Akhir Baru:{' '}
            <strong className="font-mono text-sm text-slate-900">
              {liveTotals.percentageScore}
            </strong>{' '}
            ({liveTotals.status})
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Perubahan &amp; Rekalkulasi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
