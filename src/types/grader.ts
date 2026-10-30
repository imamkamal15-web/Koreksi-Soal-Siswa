export type QuestionType = 'pg' | 'pgk' | 'bs' | 'isian' | 'esai' | 'hitungan';

export interface RubricCriterion {
  id: string;
  name: string;
  maxScore: number;
  description?: string;
}

export interface StatementItem {
  id: string;
  statement: string;
  correctAnswer: boolean; // true for Benar, false for Salah
}

export interface MatchingPair {
  id: string;
  prompt: string;
  correctMatch: string;
}

export interface QuestionItem {
  id: string;
  number: number;
  type: QuestionType;
  prompt: string;
  weight: number;
  
  // Specific for PG (Single)
  options?: string[]; // e.g., ["A. Mitokondria", "B. Ribosom", ...]
  correctOption?: string; // e.g., "A"
  
  // Specific for PGK (Multiple choice checkboxes)
  pgkOptions?: { id: string; label: string; isCorrect: boolean }[];
  
  // Specific for BS (Benar/Salah statements)
  bsStatements?: StatementItem[];
  
  // Specific for Isian Singkat
  acceptableAnswers?: string[]; // e.g. ["fotosintesis", "fotosintesa"]
  isMathEquivalent?: boolean; // enable "0,5" = "1/2" = "0.5" = "setengah"
  fuzzyTolerance?: number; // default <= 2 Levenshtein distance
  regexPattern?: string; // optional regex string
  
  // Specific for Esai / Uraian
  rubricCriteria?: RubricCriterion[];
  modelAnswer?: string;
  directScoreInput?: boolean; // Jika TRUE: Guru memasukkan skor langsung (sudah dikoreksi manual di kertas)
  
  // Specific for Hitungan (Process-based)
  mathFormula?: string;
  mathFinalAnswer?: string;
  mathStepRubric?: string;
}

export interface WeightingScheme {
  mode: 'direct' | 'composite'; // 'direct' = akumulasi bobot biasa, 'composite' = persentase per kelompok (misal 70% PG & 30% Uraian)
  pgPercentage: number; // e.g. 70
  esaiPercentage: number; // e.g. 30
}

export interface SchoolAssessmentMeta {
  schoolName: string;
  schoolAddress: string;
  npsn: string;
  subject: string;
  gradeClass: string;
  semester: string;
  academicYear: string;
  date: string;
  kkm: number;
  teacherName: string;
  teacherNip: string;
  principalName: string;
  principalNip: string;
  weightingScheme?: WeightingScheme;
  schoolLogoUrl?: string;
  showLogoInLetterhead?: boolean;
}

export interface StudentSubmission {
  id: string;
  nisn: string;
  name: string;
  // Raw answers keyed by question ID or question Number
  answers: Record<string, any>;
}

export interface QuestionGradingDetail {
  questionId: string;
  questionNumber: number;
  questionType: QuestionType;
  weight: number;
  score: number;
  maxScore: number;
  isCorrect: boolean;
  partialRatio: number; // 0.0 to 1.0
  studentAnswerDisplay: string;
  keyAnswerDisplay: string;
  feedback: string;
  aiNotes?: string;
  isOverridden?: boolean;
  originalScore?: number;
  overrideReason?: string;
  criteriaBreakdown?: { name: string; score: number; maxScore: number }[];
}

export interface FollowUpProgramRecommendation {
  type: 'Remedial' | 'Pengayaan';
  title: string;
  activityCategory: 'Bimbingan Perorangan' | 'Tutor Sebaya' | 'Tugas Proyek Mandiri' | 'Studi Kasus HOTS' | 'Lembar Kerja Remedial';
  focusTopics: string[];
  description: string;
  peerTutor?: string; // Nama siswa tutor sebaya jika remedial
  completionTarget: string; // Target waktu penyelesaian
}

export interface StudentGradedResult {
  studentId: string;
  nisn: string;
  studentName: string;
  questionScores: Record<string, QuestionGradingDetail>;
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number; // 0 - 100
  status: 'Tuntas' | 'Remedial';
  personalFeedbackNotes: string;
  followUpProgram?: FollowUpProgramRecommendation;
  
  // Breakdown scores for composite weighting
  objectiveScore?: number;
  objectiveMax?: number;
  subjectiveScore?: number;
  subjectiveMax?: number;
}

export interface MisconceptionDetection {
  questionNumber: number;
  conceptName: string;
  errorPercentage: number;
  affectedCount: number;
  rootCause: string;
  pedagogicalRemedy: string;
}

export interface AmbiguousQuestionFlag {
  questionNumber: number;
  flag: '[FLAG_SOAL_AMBIGU]';
  reason: string;
  recommendationForTeacher: string;
}

export interface ClassDiagnosticsSummary {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passCount: number;
  remedialCount: number;
  passPercentage: number;
  misconceptions: MisconceptionDetection[];
  ambiguousQuestions: AmbiguousQuestionFlag[];
  remedialSuggestions: string[];
}

export interface GasConfig {
  webAppUrl: string;
  spreadsheetName?: string;
  spreadsheetId?: string;
  isConnected: boolean;
  lastSyncTime?: string;
  autoSync: boolean;
}

export interface GasSyncResponse {
  success: boolean;
  message: string;
  data?: any;
  timestamp?: string;
  sheetName?: string;
}
