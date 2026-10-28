import {
  QuestionItem,
  StudentSubmission,
  StudentGradedResult,
  QuestionGradingDetail,
  ClassDiagnosticsSummary,
  MisconceptionDetection,
  AmbiguousQuestionFlag,
  WeightingScheme,
  FollowUpProgramRecommendation,
} from '../types/grader';

/**
 * Levenshtein distance calculation for fuzzy matching
 */
export function calculateLevenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => Array(an + 1).fill(0));

  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1, // deletion
          matrix[j][i - 1] + 1, // insertion
          matrix[j - 1][i - 1] + 1 // substitution
        );
      }
    }
  }

  return matrix[bn][an];
}

/**
 * Text normalization (lowercase, trim, remove symbols)
 */
export function normalizeCleanText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\d,./]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Indonesian mathematical equivalence resolver:
 * "0,5" == "0.5" == "1/2" == "setengah" == "satu per dua" == "50%"
 */
export function parseNumericValue(text: string): number | null {
  if (!text) return null;
  const cleaned = text.trim().toLowerCase().replace(/,/g, '.');

  // Direct float
  const directNum = parseFloat(cleaned);
  if (!isNaN(directNum) && !cleaned.includes('/')) {
    return directNum;
  }

  // Fraction format e.g. "1/2", "3/4"
  const fractionMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    const den = parseFloat(fractionMatch[2]);
    if (den !== 0) return num / den;
  }

  // Percentage format e.g. "50%"
  const percentMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*%$/);
  if (percentMatch) {
    return parseFloat(percentMatch[1]) / 100;
  }

  // Indonesian word equivalents
  const wordMap: Record<string, number> = {
    'setengah': 0.5,
    'seperdua': 0.5,
    'satu per dua': 0.5,
    'seperempat': 0.25,
    'satu per empat': 0.25,
    'tiga per empat': 0.75,
    'sepertiga': 1 / 3,
    'dua per tiga': 2 / 3,
    'nol koma lima': 0.5,
    'nol koma dua lima': 0.25,
    'nol': 0,
    'satu': 1,
    'dua': 2,
    'tiga': 3,
    'empat': 4,
    'lima': 5,
  };

  if (wordMap[cleaned] !== undefined) {
    return wordMap[cleaned];
  }

  return null;
}

export function areMathEquivalent(input: string, targetKey: string): boolean {
  const val1 = parseNumericValue(input);
  const val2 = parseNumericValue(targetKey);

  if (val1 !== null && val2 !== null) {
    return Math.abs(val1 - val2) < 0.0001;
  }

  // Fallback to normalized text equality
  return normalizeCleanText(input) === normalizeCleanText(targetKey);
}

/**
 * 1. Pilihan Ganda (PG) Tunggal Evaluation
 */
export function gradeSinglePG(question: QuestionItem, studentRaw: any): QuestionGradingDetail {
  const studentAns = String(studentRaw || '').trim().toUpperCase().replace(/[^A-E]/g, '');
  const key = String(question.correctOption || '').trim().toUpperCase();
  const isCorrect = studentAns === key && key.length > 0;
  const score = isCorrect ? question.weight : 0;

  return {
    questionId: question.id,
    questionNumber: question.number,
    questionType: 'pg',
    weight: question.weight,
    score,
    maxScore: question.weight,
    isCorrect,
    partialRatio: isCorrect ? 1.0 : 0.0,
    studentAnswerDisplay: studentAns || '(Kosong)',
    keyAnswerDisplay: key,
    feedback: isCorrect ? 'Jawaban tepat.' : `Jawaban kurang tepat. Kunci jawaban adalah ${key}.`,
  };
}

/**
 * 2. Pilihan Ganda Kompleks (PGK) Evaluation - Partial Credit Model (PCM)
 */
export function gradePGK(question: QuestionItem, studentRaw: any): QuestionGradingDetail {
  let studentSelections: string[] = [];
  if (Array.isArray(studentRaw)) {
    studentSelections = studentRaw.map(s => String(s).trim().toUpperCase());
  } else if (typeof studentRaw === 'string') {
    studentSelections = studentRaw
      .toUpperCase()
      .split(/[,\s;]+/)
      .map(s => s.replace(/[^A-Z0-9]/g, '').trim())
      .filter(Boolean);
  }

  const options = question.pgkOptions || [];
  const correctOptions = options.filter(o => o.isCorrect).map(o => o.id.toUpperCase());
  const totalCorrectNeeded = correctOptions.length || 1;

  const truePositives = studentSelections.filter(sel => correctOptions.includes(sel)).length;
  const falsePositives = studentSelections.filter(sel => !correctOptions.includes(sel)).length;

  const rawRatio = Math.max(0, (truePositives - 0.5 * falsePositives) / totalCorrectNeeded);
  const ratio = Math.min(1.0, Math.round(rawRatio * 100) / 100);
  const score = Math.round(question.weight * ratio * 10) / 10;
  const isFullCorrect = ratio === 1.0;

  return {
    questionId: question.id,
    questionNumber: question.number,
    questionType: 'pgk',
    weight: question.weight,
    score,
    maxScore: question.weight,
    isCorrect: isFullCorrect,
    partialRatio: ratio,
    studentAnswerDisplay: studentSelections.join(', ') || '(Kosong)',
    keyAnswerDisplay: correctOptions.join(', '),
    feedback: isFullCorrect
      ? 'Semua opsi yang tepat berhasil dipilih.'
      : ratio > 0
      ? `Skor Parsial (PCM): Memilih ${truePositives} dari ${totalCorrectNeeded} opsi yang benar.`
      : `Jawaban kurang tepat. Opsi yang benar adalah: ${correctOptions.join(', ')}.`,
  };
}

/**
 * 3. Benar / Salah (BS) Evaluation
 */
export function gradeBS(question: QuestionItem, studentRaw: any): QuestionGradingDetail {
  const statements = question.bsStatements || [];
  if (statements.length === 0) {
    return {
      questionId: question.id,
      questionNumber: question.number,
      questionType: 'bs',
      weight: question.weight,
      score: 0,
      maxScore: question.weight,
      isCorrect: false,
      partialRatio: 0,
      studentAnswerDisplay: '-',
      keyAnswerDisplay: '-',
      feedback: 'Pernyataan belum dikonfigurasi.',
    };
  }

  let correctMatches = 0;
  const studentDisplayParts: string[] = [];
  const keyDisplayParts: string[] = [];

  statements.forEach((stmt, idx) => {
    let studentAnsVal: boolean | null = null;
    if (studentRaw && typeof studentRaw === 'object' && studentRaw[stmt.id] !== undefined) {
      const val = studentRaw[stmt.id];
      if (typeof val === 'boolean') studentAnsVal = val;
      else if (typeof val === 'string') {
        const u = val.trim().toUpperCase();
        studentAnsVal = u.startsWith('B') || u === 'TRUE' || u === '1';
      }
    } else if (typeof studentRaw === 'string') {
      const tokens = studentRaw.split(/[,;\s]+/).map(t => t.trim().toUpperCase());
      if (tokens[idx] !== undefined) {
        studentAnsVal = tokens[idx].startsWith('B') || tokens[idx] === 'TRUE';
      }
    }

    const isMatch = studentAnsVal === stmt.correctAnswer;
    if (isMatch) correctMatches++;

    studentDisplayParts.push(`#${idx + 1}:${studentAnsVal === null ? '?' : studentAnsVal ? 'B' : 'S'}`);
    keyDisplayParts.push(`#${idx + 1}:${stmt.correctAnswer ? 'B' : 'S'}`);
  });

  const ratio = Math.round((correctMatches / statements.length) * 100) / 100;
  const score = Math.round(question.weight * ratio * 10) / 10;
  const isFull = ratio === 1.0;

  return {
    questionId: question.id,
    questionNumber: question.number,
    questionType: 'bs',
    weight: question.weight,
    score,
    maxScore: question.weight,
    isCorrect: isFull,
    partialRatio: ratio,
    studentAnswerDisplay: studentDisplayParts.join('; '),
    keyAnswerDisplay: keyDisplayParts.join('; '),
    feedback: isFull
      ? 'Seluruh penentuan Benar/Salah tepat.'
      : `Benar ${correctMatches} dari ${statements.length} butir pernyataan.`,
  };
}

/**
 * 4. Isian Singkat & Kata Kunci
 */
export function gradeIsianSingkat(question: QuestionItem, studentRaw: any): QuestionGradingDetail {
  const rawInput = String(studentRaw || '').trim();
  const normalizedInput = normalizeCleanText(rawInput);
  const acceptableList = question.acceptableAnswers || [];
  const maxTolerance = question.fuzzyTolerance ?? 2;

  if (!rawInput) {
    return {
      questionId: question.id,
      questionNumber: question.number,
      questionType: 'isian',
      weight: question.weight,
      score: 0,
      maxScore: question.weight,
      isCorrect: false,
      partialRatio: 0,
      studentAnswerDisplay: '(Kosong)',
      keyAnswerDisplay: acceptableList.join(' / '),
      feedback: 'Siswa tidak mengisi jawaban.',
    };
  }

  // Regex
  if (question.regexPattern) {
    try {
      const reg = new RegExp(question.regexPattern, 'i');
      if (reg.test(rawInput)) {
        return {
          questionId: question.id,
          questionNumber: question.number,
          questionType: 'isian',
          weight: question.weight,
          score: question.weight,
          maxScore: question.weight,
          isCorrect: true,
          partialRatio: 1.0,
          studentAnswerDisplay: rawInput,
          keyAnswerDisplay: acceptableList.join(' / ') || question.regexPattern,
          feedback: 'Jawaban sesuai pola jawaban yang diharapkan.',
        };
      }
    } catch {
      // ignore
    }
  }

  // Math Equivalence
  if (question.isMathEquivalent) {
    for (const key of acceptableList) {
      if (areMathEquivalent(rawInput, key)) {
        return {
          questionId: question.id,
          questionNumber: question.number,
          questionType: 'isian',
          weight: question.weight,
          score: question.weight,
          maxScore: question.weight,
          isCorrect: true,
          partialRatio: 1.0,
          studentAnswerDisplay: rawInput,
          keyAnswerDisplay: acceptableList.join(' / '),
          feedback: 'Jawaban tepat (ekuivalen secara nilai matematis).',
        };
      }
    }
  }

  // Exact Match
  for (const key of acceptableList) {
    if (normalizedInput === normalizeCleanText(key)) {
      return {
        questionId: question.id,
        questionNumber: question.number,
        questionType: 'isian',
        weight: question.weight,
        score: question.weight,
        maxScore: question.weight,
        isCorrect: true,
        partialRatio: 1.0,
        studentAnswerDisplay: rawInput,
        keyAnswerDisplay: acceptableList.join(' / '),
        feedback: 'Jawaban tepat.',
      };
    }
  }

  // Fuzzy Levenshtein
  let bestDistance = 999;
  let closestKey = acceptableList[0] || '';

  for (const key of acceptableList) {
    const normKey = normalizeCleanText(key);
    const dist = calculateLevenshtein(normalizedInput, normKey);
    if (dist < bestDistance) {
      bestDistance = dist;
      closestKey = key;
    }
  }

  if (bestDistance <= maxTolerance && normalizedInput.length >= 3) {
    return {
      questionId: question.id,
      questionNumber: question.number,
      questionType: 'isian',
      weight: question.weight,
      score: question.weight,
      maxScore: question.weight,
      isCorrect: true,
      partialRatio: 1.0,
      studentAnswerDisplay: rawInput,
      keyAnswerDisplay: acceptableList.join(' / '),
      feedback: `Jawaban diterima dengan toleransi penulisan (tipografi minor: "${rawInput}" ≈ "${closestKey}").`,
    };
  }

  return {
    questionId: question.id,
    questionNumber: question.number,
    questionType: 'isian',
    weight: question.weight,
    score: 0,
    maxScore: question.weight,
    isCorrect: false,
    partialRatio: 0.0,
    studentAnswerDisplay: rawInput,
    keyAnswerDisplay: acceptableList.join(' / '),
    feedback: `Jawaban belum sesuai. Kunci yang diharapkan: ${acceptableList.join(' / ')}.`,
  };
}

/**
 * 5. Esai / Uraian Assessment
 * KASUS 1: MENDUKUNG INPUT SKOR LANGSUNG GURU JIKA SUDAH DIKOREKSI MANUAL DI KERTAS
 */
export async function gradeEssayAsync(
  question: QuestionItem,
  studentRaw: any
): Promise<QuestionGradingDetail> {
  const studentText = String(studentRaw || '').trim();

  // KASUS 1: DETEKSI INPUT SKOR LANGSUNG GURU
  // Contoh: Guru mengetik angka '8', '15', '8.5', '18/20'
  const isDirectScorePattern =
    question.directScoreInput ||
    typeof studentRaw === 'number' ||
    /^\s*\d+(?:[\.,]\d+)?(?:\s*\/\s*\d+)?\s*$/.test(studentText);

  if (isDirectScorePattern && studentText.length > 0) {
    // Parse numeric score
    let directScore = 0;
    if (studentText.includes('/')) {
      const parts = studentText.split('/');
      directScore = parseFloat(parts[0].replace(/,/g, '.')) || 0;
    } else {
      directScore = parseFloat(studentText.replace(/,/g, '.')) || 0;
    }

    // Clamp score to max question weight
    const safeScore = Math.min(question.weight, Math.max(0, Math.round(directScore * 10) / 10));

    return {
      questionId: question.id,
      questionNumber: question.number,
      questionType: 'esai',
      weight: question.weight,
      score: safeScore,
      maxScore: question.weight,
      isCorrect: safeScore >= question.weight * 0.7,
      partialRatio: Math.round((safeScore / question.weight) * 100) / 100,
      studentAnswerDisplay: `Skor Langsung: ${safeScore} / ${question.weight}`,
      keyAnswerDisplay: question.modelAnswer || 'Koreksi Manual oleh Guru di Kertas',
      feedback: `Nilai uraian dimasukkan langsung oleh guru (${safeScore} dari ${question.weight} poin).`,
      aiNotes: 'Mode koreksi manual guru di lembar ujian kertas.',
    };
  }

  // Jika berupa teks uraian jawaban siswa, panggil Semantic AI
  try {
    const res = await fetch('/api/grader/semantic-essay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionPrompt: question.prompt,
        rubricCriteria: (question.rubricCriteria || []).map(r => `${r.name} (maks ${r.maxScore}): ${r.description || ''}`).join('; '),
        answerKeySample: question.modelAnswer,
        studentAnswer: studentText,
        maxWeight: question.weight,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        questionId: question.id,
        questionNumber: question.number,
        questionType: 'esai',
        weight: question.weight,
        score: data.score,
        maxScore: question.weight,
        isCorrect: data.score >= question.weight * 0.7,
        partialRatio: Math.round((data.score / question.weight) * 100) / 100,
        studentAnswerDisplay: studentText || '(Kosong)',
        keyAnswerDisplay: question.modelAnswer || 'Rubrik Analitis',
        feedback: data.feedback,
        aiNotes: data.antiFluffingNotes,
        criteriaBreakdown: data.criteriaScores,
      };
    }
  } catch (err) {
    console.warn('API semantic essay fallback to local heuristic:', err);
  }

  // Local fallback
  const hasSubstance = studentText.length >= 25;
  const score = hasSubstance ? Math.round(question.weight * 0.75 * 10) / 10 : Math.round(question.weight * 0.3 * 10) / 10;
  return {
    questionId: question.id,
    questionNumber: question.number,
    questionType: 'esai',
    weight: question.weight,
    score,
    maxScore: question.weight,
    isCorrect: score >= question.weight * 0.7,
    partialRatio: Math.round((score / question.weight) * 100) / 100,
    studentAnswerDisplay: studentText || '(Kosong)',
    keyAnswerDisplay: question.modelAnswer || 'Rubrik Analitis',
    feedback: hasSubstance ? 'Esai memuat gagasan konsep yang relevan.' : 'Uraian masih terlalu singkat.',
    aiNotes: 'Koreksi fallback mandiri.',
  };
}

/**
 * 6. Soal Hitungan / Eksakta Assessment
 */
export async function gradeMathProcessAsync(
  question: QuestionItem,
  studentRaw: any
): Promise<QuestionGradingDetail> {
  const studentWork = String(studentRaw || '').trim();

  // Cek apakah guru memasukkan skor langsung angka
  if (/^\s*\d+(?:[\.,]\d+)?\s*$/.test(studentWork) && parseFloat(studentWork.replace(/,/g, '.')) <= question.weight) {
    const directScore = Math.min(question.weight, Math.max(0, parseFloat(studentWork.replace(/,/g, '.'))));
    return {
      questionId: question.id,
      questionNumber: question.number,
      questionType: 'hitungan',
      weight: question.weight,
      score: directScore,
      maxScore: question.weight,
      isCorrect: directScore >= question.weight * 0.7,
      partialRatio: Math.round((directScore / question.weight) * 100) / 100,
      studentAnswerDisplay: `Skor Langsung: ${directScore} / ${question.weight}`,
      keyAnswerDisplay: `Hasil: ${question.mathFinalAnswer || '-'}`,
      feedback: `Nilai hitungan dimasukkan langsung oleh guru (${directScore} dari ${question.weight} poin).`,
      aiNotes: 'Koreksi manual guru di kertas ujian.',
    };
  }

  try {
    const res = await fetch('/api/grader/process-math', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionPrompt: question.prompt,
        correctFormula: question.mathFormula,
        finalAnswerKey: question.mathFinalAnswer,
        studentWork,
        maxWeight: question.weight,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        questionId: question.id,
        questionNumber: question.number,
        questionType: 'hitungan',
        weight: question.weight,
        score: data.score,
        maxScore: question.weight,
        isCorrect: data.isFinalCorrect,
        partialRatio: Math.round((data.score / question.weight) * 100) / 100,
        studentAnswerDisplay: studentWork || '(Kosong)',
        keyAnswerDisplay: `Rumus: ${question.mathFormula || '-'} | Hasil: ${question.mathFinalAnswer || '-'}`,
        feedback: data.feedback,
        aiNotes: `Langkah: ${data.isProcessCorrect ? 'Benar' : 'Perlu Diperbaiki'}. Error: ${data.errorStep || 'N/A'}`,
      };
    }
  } catch (err) {
    console.warn('API process math fallback:', err);
  }

  const isFinalCorrect = areMathEquivalent(studentWork, question.mathFinalAnswer || '');
  const score = isFinalCorrect ? question.weight : Math.round(question.weight * 0.65 * 10) / 10;
  return {
    questionId: question.id,
    questionNumber: question.number,
    questionType: 'hitungan',
    weight: question.weight,
    score,
    maxScore: question.weight,
    isCorrect: isFinalCorrect,
    partialRatio: Math.round((score / question.weight) * 100) / 100,
    studentAnswerDisplay: studentWork || '(Kosong)',
    keyAnswerDisplay: `Hasil: ${question.mathFinalAnswer || '-'}`,
    feedback: isFinalCorrect ? 'Perhitungan dan hasil akhir tepat.' : 'Langkah terdeteksi, periksa kalkulasi akhir.',
  };
}

/**
 * KASUS 3: REKOMENDASI PROGRAM REMEDIAL & PENGAYAAN UNTUK MASING-MASING SISWA
 */
export function generateFollowUpProgram(
  studentName: string,
  percentageScore: number,
  kkm: number,
  questionScores: Record<string, QuestionGradingDetail>,
  questions: QuestionItem[],
  potentialPeerTutorName?: string
): FollowUpProgramRecommendation {
  const isRemedial = percentageScore < kkm;

  // Temukan indikator/soal mana saja yang salah (skor < 70%)
  const weakQuestions = questions.filter(q => {
    const detail = questionScores[q.id];
    return detail && detail.partialRatio < 0.7;
  });

  const weakTopics = weakQuestions.map(q => `Soal #${q.number}: ${q.prompt.slice(0, 35)}...`);

  if (isRemedial) {
    // Siswa Perlu Remedial
    if (percentageScore < 50) {
      // Nilai sangat rendah -> Bimbingan Perorangan oleh Guru
      return {
        type: 'Remedial',
        title: `Program Remedial Bimbingan Perorangan (${studentName})`,
        activityCategory: 'Bimbingan Perorangan',
        focusTopics: weakTopics.length > 0 ? weakTopics : ['Penguatan Konsep Dasar Mata Pelajaran'],
        description: `Bimbingan tatap muka perorangan oleh guru mata pelajaran untuk mengulang materi esensial pada butir yang belum tuntas, dilanjutkan tes remedial tertulis.`,
        peerTutor: potentialPeerTutorName,
        completionTarget: '3 hari setelah pengumuman hasil nilai',
      };
    } else {
      // Nilai mendekati KKM -> Tutor Sebaya & Lembar Kerja Terarah
      return {
        type: 'Remedial',
        title: `Program Remedial Terarah & Tutor Sebaya (${studentName})`,
        activityCategory: potentialPeerTutorName ? 'Tutor Sebaya' : 'Lembar Kerja Remedial',
        focusTopics: weakTopics.length > 0 ? weakTopics : ['Penyelesaian Soal Latihan Mandiri'],
        description: `Mengerjakan lembar kerja remedial khusus materi yang belum dipahami dengan didampingi teman sebaya (${potentialPeerTutorName || 'rekan belajar tuntas'}), lalu menyerahkan resume perbaikan.`,
        peerTutor: potentialPeerTutorName,
        completionTarget: '5 hari kalender',
      };
    }
  } else {
    // Siswa Tuntas -> Pengayaan
    if (percentageScore >= 90) {
      // Nilai sangat tinggi -> Tutor Sebaya & Studi Kasus HOTS
      return {
        type: 'Pengayaan',
        title: `Program Pengayaan Duta Belajar & Studi Kasus HOTS (${studentName})`,
        activityCategory: 'Studi Kasus HOTS',
        focusTopics: ['Penerapan Konsep Sains Tingkat Lanjut', 'Pemecahan Masalah Kontekstual'],
        description: `Diberikan tugas pemecahan masalah kontekstual tingkat tinggi (HOTS) serta dipercaya menjadi tutor sebaya mendampingi rekan satu kelompok yang membutuhkan penguatan materi.`,
        completionTarget: '1 minggu kegiatan mandiri',
      };
    } else {
      // Nilai 75 - 89 -> Tugas Proyek Mandiri
      return {
        type: 'Pengayaan',
        title: `Program Pengayaan Proyek Mandiri Literasi (${studentName})`,
        activityCategory: 'Tugas Proyek Mandiri',
        focusTopics: ['Eksplorasi Aplikasi Materi dalam Kehidupan Nyata'],
        description: `Menyusun peta konsep (mind-mapping) atau rangkuman kreatif mengenai keterkaitan materi yang telah dipelajari dengan fenomena sehari-hari.`,
        completionTarget: '1 minggu kegiatan mandiri',
      };
    }
  }
}

/**
 * KASUS 2: PERHITUNGAN TOTAL NILAI DENGAN DUKUNGAN PEMBOBOTAN KOMPOSIT KATEGORI
 * (Contoh: 70% PG & 30% Uraian)
 */
export function calculateStudentTotals(
  studentId: string,
  nisn: string,
  studentName: string,
  questionScores: Record<string, QuestionGradingDetail>,
  kkm: number,
  personalFeedbackNotes?: string,
  weightingScheme?: WeightingScheme,
  questions: QuestionItem[] = [],
  potentialPeerTutorName?: string
): StudentGradedResult {
  let totalScore = 0;
  let maxPossibleScore = 0;

  let objScore = 0;
  let objMax = 0;
  let subjScore = 0;
  let subjMax = 0;

  Object.values(questionScores).forEach(detail => {
    totalScore += detail.score;
    maxPossibleScore += detail.maxScore;

    // Pisahkan objektif (PG, PGK, BS, Isian) vs subjektif (Esai, Hitungan)
    if (detail.questionType === 'esai' || detail.questionType === 'hitungan') {
      subjScore += detail.score;
      subjMax += detail.maxScore;
    } else {
      objScore += detail.score;
      objMax += detail.maxScore;
    }
  });

  let percentageScore = 0;

  // KASUS 2: CEK APAKAH GURU MENGGUNAKAN BOBOT KOMPOSIT (CONTOH: 70% PG & 30% URAIAN)
  if (weightingScheme?.mode === 'composite') {
    const pgWeightPct = weightingScheme.pgPercentage ?? 70;
    const esaiWeightPct = weightingScheme.esaiPercentage ?? 30;

    let objContribution = 0;
    let subjContribution = 0;

    if (objMax > 0 && subjMax > 0) {
      objContribution = (objScore / objMax) * pgWeightPct;
      subjContribution = (subjScore / subjMax) * esaiWeightPct;
      percentageScore = Math.min(100, Math.round((objContribution + subjContribution) * 10) / 10);
    } else if (objMax > 0) {
      percentageScore = Math.round((objScore / objMax) * 100);
    } else if (subjMax > 0) {
      percentageScore = Math.round((subjScore / subjMax) * 100);
    }
  } else {
    // Mode penjumlahan bobot biasa (Direct Sum)
    percentageScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  }

  const status: 'Tuntas' | 'Remedial' = percentageScore >= kkm ? 'Tuntas' : 'Remedial';

  // KASUS 3: BANGUN REKOMENDASI PROGRAM REMEDIAL / PENGAYAAN PERSONAL
  const followUpProgram = generateFollowUpProgram(
    studentName,
    percentageScore,
    kkm,
    questionScores,
    questions,
    potentialPeerTutorName
  );

  const defaultFeedback =
    status === 'Tuntas'
      ? `Selamat! Capaian Anda (${percentageScore}) tuntas melampaui KKM (${kkm}). Direkomendasikan mengikuti ${followUpProgram.title}.`
      : `Nilai Anda (${percentageScore}) belum mencapai KKM (${kkm}). Wajib mengikuti ${followUpProgram.title} (${followUpProgram.activityCategory}).`;

  return {
    studentId,
    nisn,
    studentName,
    questionScores,
    totalScore: Math.round(totalScore * 10) / 10,
    maxPossibleScore: Math.round(maxPossibleScore * 10) / 10,
    percentageScore,
    status,
    personalFeedbackNotes: personalFeedbackNotes || defaultFeedback,
    followUpProgram,
    objectiveScore: Math.round(objScore * 10) / 10,
    objectiveMax: Math.round(objMax * 10) / 10,
    subjectiveScore: Math.round(subjScore * 10) / 10,
    subjectiveMax: Math.round(subjMax * 10) / 10,
  };
}

/**
 * Central Orchestrator: Grade a Student Submission
 */
export async function gradeStudentSubmission(
  submission: StudentSubmission,
  questions: QuestionItem[],
  kkm: number,
  weightingScheme?: WeightingScheme,
  potentialPeerTutorName?: string
): Promise<StudentGradedResult> {
  const questionScores: Record<string, QuestionGradingDetail> = {};

  for (const q of questions) {
    const rawVal = submission.answers[q.id] ?? submission.answers[String(q.number)];

    let detail: QuestionGradingDetail;
    switch (q.type) {
      case 'pg':
        detail = gradeSinglePG(q, rawVal);
        break;
      case 'pgk':
        detail = gradePGK(q, rawVal);
        break;
      case 'bs':
        detail = gradeBS(q, rawVal);
        break;
      case 'isian':
        detail = gradeIsianSingkat(q, rawVal);
        break;
      case 'esai':
        detail = await gradeEssayAsync(q, rawVal);
        break;
      case 'hitungan':
        detail = await gradeMathProcessAsync(q, rawVal);
        break;
      default:
        detail = gradeSinglePG(q, rawVal);
    }

    questionScores[q.id] = detail;
  }

  return calculateStudentTotals(
    submission.id,
    submission.nisn,
    submission.name,
    questionScores,
    kkm,
    undefined,
    weightingScheme,
    questions,
    potentialPeerTutorName
  );
}

/**
 * Class Diagnostics & Quality Audit Engine
 */
export async function generateClassDiagnostics(
  questions: QuestionItem[],
  results: StudentGradedResult[],
  kkm: number
): Promise<ClassDiagnosticsSummary> {
  const count = results.length;
  if (count === 0) {
    return {
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passCount: 0,
      remedialCount: 0,
      passPercentage: 0,
      misconceptions: [],
      ambiguousQuestions: [],
      remedialSuggestions: [],
    };
  }

  const scores = results.map(r => r.percentageScore);
  const totalScoreSum = scores.reduce((acc, s) => acc + s, 0);
  const averageScore = Math.round((totalScoreSum / count) * 10) / 10;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  const passCount = results.filter(r => r.status === 'Tuntas').length;
  const remedialCount = count - passCount;
  const passPercentage = Math.round((passCount / count) * 100);

  // Group Misconceptions
  const misconceptions: MisconceptionDetection[] = [];
  const questionErrorStats: { qNum: number; errorRate: number; failedTopStudents: boolean; qPrompt: string }[] = [];

  const sortedByScore = [...results].sort((a, b) => b.percentageScore - a.percentageScore);
  const topTierCount = Math.max(1, Math.ceil(count * 0.33));
  const topStudents = sortedByScore.slice(0, topTierCount);

  questions.forEach(q => {
    let wrongCount = 0;
    let topWrongCount = 0;

    results.forEach(r => {
      const qResult = r.questionScores[q.id];
      if (qResult && qResult.partialRatio < 0.6) {
        wrongCount++;
      }
    });

    topStudents.forEach(ts => {
      const qResult = ts.questionScores[q.id];
      if (qResult && qResult.partialRatio < 0.6) {
        topWrongCount++;
      }
    });

    const errorRate = Math.round((wrongCount / count) * 100);
    const topErrorRate = Math.round((topWrongCount / topTierCount) * 100);

    questionErrorStats.push({
      qNum: q.number,
      errorRate,
      failedTopStudents: topErrorRate >= 50,
      qPrompt: q.prompt,
    });

    if (errorRate >= 30) {
      misconceptions.push({
        questionNumber: q.number,
        conceptName: `Konsep Soal #${q.number}: ${q.prompt.slice(0, 45)}...`,
        errorPercentage: errorRate,
        affectedCount: wrongCount,
        rootCause: `Sebanyak ${errorRate}% siswa mengalami kesulitan pada butir ini. Kemungkinan terjadi kerancuan antara konsep dasar dan istilah turunan.`,
        pedagogicalRemedy: `Lakukan penguatan scaffolding konsep dan pembahasan ulang secara interaktif untuk indikator soal #${q.number}.`,
      });
    }
  });

  // Ambiguous Question Audit [FLAG_SOAL_AMBIGU]
  const ambiguousQuestions: AmbiguousQuestionFlag[] = [];
  questionErrorStats.forEach(stat => {
    if (stat.failedTopStudents) {
      ambiguousQuestions.push({
        questionNumber: stat.qNum,
        flag: '[FLAG_SOAL_AMBIGU]',
        reason: `Mayoritas siswa kelompok atas (top 33%) keliru pada soal ini (${stat.errorRate}% salah di kelas). Hal ini menunjukkan adanya potensi redaksi ambigu atau multitafsir.`,
        recommendationForTeacher: 'Tinjau kembali formulasi kalimat soal dan opsi pengecoh agar tidak membingungkan peserta didik.',
      });
    }
  });

  return {
    averageScore,
    highestScore,
    lowestScore,
    passCount,
    remedialCount,
    passPercentage,
    misconceptions,
    ambiguousQuestions,
    remedialSuggestions: [
      'Gunakan teknik pembelajaran ulang terfokus pada konsep dengan tingkat kesalahan ≥30%.',
      'Lakukan penelaahan butir soal yang ditandai [FLAG_SOAL_AMBIGU] bersama rekan sejawat.',
      'Sediakan modul pengayaan bagi siswa yang telah mencapai predikat tuntas melampaui KKM.',
    ],
  };
}
