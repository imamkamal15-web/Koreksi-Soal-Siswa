import { QuestionItem, SchoolAssessmentMeta, StudentSubmission } from '../types/grader';

export const DEFAULT_SCHOOL_META: SchoolAssessmentMeta = {
  schoolName: 'SD Negeri Gentan',
  schoolAddress: 'Gentan, Sinduharjo, Ngaglik, Sleman',
  npsn: '20401650',
  subject: 'IPAS',
  gradeClass: 'Kelas 5B (Fase C)',
  semester: 'Ganjil',
  academicYear: '2026/2027',
  date: '27 Oktober 2026',
  kkm: 75,
  teacherName: 'Imam Fadlun Kamal, S.Pd., M.Pd.',
  teacherNip: '19950501 201903 1 006',
  principalName: 'Sri Wartini, S.Pd.SD.',
  principalNip: '19700605 2005011010',
  schoolLogoUrl: '/assets/aistudio/LOGO_SDN_GENTAN_a0440fa5',
  showLogoInLetterhead: true,
};

export const SAMPLE_QUESTIONS: QuestionItem[] = [
  {
    id: 'q1',
    number: 1,
    type: 'pg',
    prompt: 'Dalam suatu rantai makanan di sawah, organisme yang berperan sebagai produsen utama adalah...',
    weight: 10,
    options: [
      'A. Belalang',
      'B. Padi',
      'C. Katak',
      'D. Ular',
    ],
    correctOption: 'B',
  },
  {
    id: 'q2',
    number: 2,
    type: 'pgk',
    prompt: 'Manakah dari sumber energi berikut yang tergolong sebagai energi terbarukan (ramah lingkungan)? [Pilih semua yang benar]',
    weight: 15,
    pgkOptions: [
      { id: 'A', label: 'Energi Panas Matahari (Surya)', isCorrect: true },
      { id: 'B', label: 'Minyak Bumi', isCorrect: false },
      { id: 'C', label: 'Energi Angin (Bayu)', isCorrect: true },
      { id: 'D', label: 'Aliran Air Sungai (PLTA)', isCorrect: true },
      { id: 'E', label: 'Batubara', isCorrect: false },
    ],
  },
  {
    id: 'q3',
    number: 3,
    type: 'bs',
    prompt: 'Tentukan kebenaran dari masing-masing pernyataan sifat cahaya berikut (Benar atau Salah):',
    weight: 15,
    bsStatements: [
      { id: 's1', statement: 'Cahaya merambat lurus dan dapat menembus benda bening.', correctAnswer: true },
      { id: 's2', statement: 'Sendok yang tampak patah saat dimasukkan ke dalam gelas berisi air merupakan contoh pemantulan cahaya.', correctAnswer: false },
      { id: 's3', statement: 'Pelangi terbentuk karena adanya proses pembiasan dan penguraian cahaya matahari oleh titik-titik air hujan.', correctAnswer: true },
    ],
  },
  {
    id: 'q4',
    number: 4,
    type: 'isian',
    prompt: 'Berapakah nilai desimal dari pecahan satu per dua (tuliskan angka desimalnya)?',
    weight: 10,
    acceptableAnswers: ['0,5', '0.5', '1/2', 'setengah', '50%'],
    isMathEquivalent: true,
    fuzzyTolerance: 2,
  },
  {
    id: 'q5',
    number: 5,
    type: 'isian',
    prompt: 'Sebutkan proses pembuatan zat makanan pada tumbuhan hijau dengan bantuan energi cahaya matahari!',
    weight: 10,
    acceptableAnswers: ['fotosintesis', 'photosynthesis', 'fotosintesa'],
    isMathEquivalent: false,
    fuzzyTolerance: 2,
  },
  {
    id: 'q6',
    number: 6,
    type: 'hitungan',
    prompt: 'Sebuah mobil mainan menempuh jarak 30 meter dalam waktu 6 detik. Berapakah kecepatan mobil mainan tersebut? (Gunakan rumus v = s / t)',
    weight: 20,
    mathFormula: 'v = s / t',
    mathFinalAnswer: '5 m/s',
    mathStepRubric: 'Rumus v = s/t (50%), substitusi v = 30/6 (30%), hasil akhir 5 m/s (20%)',
  },
  {
    id: 'q7',
    number: 7,
    type: 'esai',
    prompt: 'Jelaskan perbedaan mendasar antara peredaran darah besar dan peredaran darah kecil pada tubuh manusia beserta alirannya!',
    weight: 20,
    modelAnswer: 'Peredaran darah besar mengalirkan darah dari bilik kiri jantung menuju ke seluruh tubuh dan kembali ke serambi kanan. Peredaran darah kecil mengalirkan darah dari bilik kanan jantung menuju ke paru-paru lalu kembali ke serambi kiri.',
    rubricCriteria: [
      { id: 'rc1', name: 'Jalur Aliran Seluruh Tubuh vs Paru-paru', maxScore: 8, description: 'Menjelaskan tujuan organ tubuh' },
      { id: 'rc2', name: 'Ruang Jantung Bilik Kiri vs Bilik Kanan', maxScore: 8, description: 'Menyebutkan ruang awal sirkulasi dengan tepat' },
      { id: 'rc3', name: 'Fungsi Oksigen dan Karbondioksida', maxScore: 4, description: 'Kaitan pertukaran udara pernapasan' },
    ],
  },
];

export const SAMPLE_STUDENTS: StudentSubmission[] = [
  {
    id: 'std_01',
    nisn: '0081234501',
    name: 'Ahmad Faiz Fadhlullah',
    answers: {
      'q1': 'B',
      'q2': ['A', 'C', 'D'],
      'q3': { 's1': true, 's2': false, 's3': true },
      'q4': '0,5',
      'q5': 'fotosintesis',
      'q6': 'Diketahui: s = 30 m, t = 6 s. Rumus: v = s / t = 30 / 6 = 5 m/s',
      'q7': 'Peredaran darah besar mengalir dari bilik kiri jantung menuju ke seluruh tubuh lalu kembali ke serambi kanan. Sedangkan peredaran darah kecil mengalir dari bilik kanan ke paru-paru lalu kembali ke serambi kiri.',
    },
  },
  {
    id: 'std_02',
    nisn: '0081234502',
    name: 'Bernadetta Larasati',
    answers: {
      'q1': 'B',
      'q2': ['A', 'C'], // Partial credit
      'q3': { 's1': true, 's2': true, 's3': true },
      'q4': '1/2',
      'q5': 'fotosintesa',
      'q6': 'v = s/t = 30 / 6. Dihitung buru-buru jadi 4 m/s', // Calculation slip
      'q7': 'Peredaran darah besar mengalirkan darah ke seluruh tubuh manusia, kalau kecil mengalirkan ke paru-paru.',
    },
  },
  {
    id: 'std_03',
    nisn: '0081234503',
    name: 'Dimas Satria Wibowo',
    answers: {
      'q1': 'A', // Belalang
      'q2': ['A', 'B', 'C'],
      'q3': { 's1': false, 's2': true, 's3': false },
      'q4': 'setengah',
      'q5': 'fotosintesis daun',
      'q6': 'v = 30 / 6 = 5',
      'q7': 'Darah mengalir di tubuh manusia dipompa oleh jantung lewat pembuluh darah.',
    },
  },
  {
    id: 'std_04',
    nisn: '0081234504',
    name: 'Cut Nyak Meutia (Scan OCR)',
    answers: {
      'q1': 'B',
      'q2': ['A', 'D', 'C'],
      'q3': { 's1': true, 's2': false, 's3': true },
      'q4': '0.5',
      'q5': 'fotosintesis',
      'q6': 'v = s / t = 30 / 6 = 5 m/s',
      'q7': 'Peredaran darah besar dari bilik kiri ke tubuh, peredaran darah kecil dari bilik kanan ke paru-paru.',
    },
  },
  {
    id: 'std_05',
    nisn: '0081234505',
    name: 'Eko Prasetyo Ramadhan',
    answers: {
      'q1': 'B',
      'q2': ['B'], // Minyak bumi
      'q3': { 's1': true, 's2': true, 's3': false },
      'q4': '0,25',
      'q5': 'respirasi',
      'q6': 'v = 30 * 6 = 180',
      'q7': 'Peredaran darah besar itu darah kotor dan darah kecil darah bersih.',
    },
  },
];
