/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  SchoolAssessmentMeta,
  QuestionItem,
  StudentSubmission,
  StudentGradedResult,
  ClassDiagnosticsSummary,
  GasConfig,
} from './types/grader';
import { DEFAULT_SCHOOL_META } from './data/sampleAssessment';
import { gradeStudentSubmission, generateClassDiagnostics } from './services/graderEngine';
import {
  loadGasConfig,
  saveGasConfig,
  pullStudentsFromGas,
  pushResultsToGas,
} from './services/gasService';
import { AssessmentConfigView } from './components/AssessmentConfigView';
import { DataIngestion } from './components/DataIngestion';
import { GradingResultsView } from './components/GradingResultsView';
import { StudentOverrideDrawer } from './components/StudentOverrideDrawer';
import { ClassDiagnosticsView } from './components/ClassDiagnosticsView';
import { PrintReportView } from './components/PrintReportView';
import { RemedialPengayaanView } from './components/RemedialPengayaanView';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileProfileHeader } from './components/MobileProfileHeader';
import { GasBackendModal } from './components/GasBackendModal';
import { AlertCircle, CheckCircle2, ArrowRight, Cloud } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'config' | 'import' | 'results' | 'diagnostics' | 'remedial' | 'print'>('config');

  // Device Mode State ('responsive' = auto adapt, 'desktop' = force LMS sidebar, 'mobile' = phone frame preview)
  const [deviceMode, setDeviceMode] = useState<'responsive' | 'desktop' | 'mobile'>('responsive');

  // Assessment Config State (Defaults to blank/clean start as confirmed in Phase 1)
  const [meta, setMeta] = useState<SchoolAssessmentMeta>(DEFAULT_SCHOOL_META);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

  // Engine Output State
  const [gradedResults, setGradedResults] = useState<StudentGradedResult[]>([]);
  const [diagnostics, setDiagnostics] = useState<ClassDiagnosticsSummary>({
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    passCount: 0,
    remedialCount: 0,
    passPercentage: 0,
    misconceptions: [],
    ambiguousQuestions: [],
    remedialSuggestions: [],
  });

  // Google Apps Script (GAS) Backend State
  const [gasConfig, setGasConfig] = useState<GasConfig>(loadGasConfig);
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [isPullingGas, setIsPullingGas] = useState(false);
  const [isPushingGas, setIsPushingGas] = useState(false);

  // UI Processing States
  const [isGrading, setIsGrading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedStudentForOverride, setSelectedStudentForOverride] = useState<StudentGradedResult | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Google Apps Script Actions
  const handlePullFromGas = async () => {
    if (!gasConfig.webAppUrl) {
      setIsGasModalOpen(true);
      return;
    }

    setIsPullingGas(true);
    const res = await pullStudentsFromGas(gasConfig.webAppUrl);
    setIsPullingGas(false);

    if (res.success && res.students) {
      setSubmissions(res.students);
      const updatedConfig: GasConfig = {
        ...gasConfig,
        lastSyncTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setGasConfig(updatedConfig);
      saveGasConfig(updatedConfig);
      showToast('success', `Berhasil menarik ${res.students.length} siswa dari Google Spreadsheet!`);
    } else {
      showToast('error', res.message || 'Gagal menarik data siswa dari GAS.');
    }
  };

  const handlePushToGas = async () => {
    if (!gasConfig.webAppUrl) {
      setIsGasModalOpen(true);
      return;
    }

    if (gradedResults.length === 0) {
      showToast('error', 'Belum ada hasil koreksi yang bisa dikirim ke Sheet.');
      return;
    }

    setIsPushingGas(true);
    const res = await pushResultsToGas(gasConfig.webAppUrl, meta, questions, gradedResults);
    setIsPushingGas(false);

    if (res.success) {
      const updatedConfig: GasConfig = {
        ...gasConfig,
        lastSyncTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setGasConfig(updatedConfig);
      saveGasConfig(updatedConfig);
      showToast('success', `Berhasil menyimpan ${gradedResults.length} hasil siswa ke Google Spreadsheet!`);
    } else {
      showToast('error', res.message || 'Gagal menyimpan hasil ke Spreadsheet.');
    }
  };

  // Main Action: Run Hybrid Grading Engine
  const handleRunGrading = async () => {
    if (questions.length === 0) {
      showToast('error', 'Silakan tambahkan minimal 1 butir soal pada perangkat soal sebelum mengoreksi.');
      setActiveTab('config');
      return;
    }

    if (submissions.length === 0) {
      showToast('error', 'Belum ada lembar jawaban siswa. Silakan impor CSV, scan OCR, atau isi form.');
      setActiveTab('import');
      return;
    }

    setIsGrading(true);
    try {
      const results: StudentGradedResult[] = [];
      for (const sub of submissions) {
        const studentResult = await gradeStudentSubmission(
          sub,
          questions,
          meta.kkm,
          meta.weightingScheme
        );
        results.push(studentResult);
      }

      setGradedResults(results);

      // Run diagnostics
      const diag = await generateClassDiagnostics(questions, results, meta.kkm);
      setDiagnostics(diag);

      setActiveTab('results');
      showToast('success', `Berhasil mengoreksi ${results.length} lembar jawaban siswa secara hibrida!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Grading error:', msg);
      showToast('error', `Terjadi kendala saat koreksi: ${msg}`);
    } finally {
      setIsGrading(false);
    }
  };

  // Refresh Diagnostics
  const handleRefreshDiagnostics = async () => {
    if (gradedResults.length === 0) return;
    setIsAnalyzing(true);
    try {
      const diag = await generateClassDiagnostics(questions, gradedResults, meta.kkm);
      setDiagnostics(diag);
      showToast('success', 'Analisis diagnostik kelas dan psikometri berhasil disegarkan.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save Teacher Override
  const handleSaveOverride = (updatedStudent: StudentGradedResult) => {
    const newResults = gradedResults.map((r) =>
      r.studentId === updatedStudent.studentId ? updatedStudent : r
    );
    setGradedResults(newResults);

    // Recalculate diagnostics
    generateClassDiagnostics(questions, newResults, meta.kkm).then(setDiagnostics);
    showToast('success', `Nilai ${updatedStudent.studentName} berhasil diperbarui.`);
  };

  // Render Tab Content Component
  const renderTabContent = () => (
    <div className="space-y-6">
      {/* VIEW 1: Perangkat Soal & Identitas Asesmen (Dengan Headbar Khusus Fitur) */}
      {activeTab === 'config' && (
        <AssessmentConfigView
          meta={meta}
          setMeta={setMeta}
          questions={questions}
          setQuestions={setQuestions}
          onProceedToImport={() => setActiveTab('import')}
        />
      )}

      {/* VIEW 2: Data Ingestion (CSV / OCR Scan / Form) */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <DataIngestion
            meta={meta}
            questions={questions}
            submissions={submissions}
            onChange={setSubmissions}
            gasConfig={gasConfig}
            onOpenGasModal={() => setIsGasModalOpen(true)}
            onPullFromGas={handlePullFromGas}
            isPullingGas={isPullingGas}
          />

          {/* Next Step Banner */}
          {submissions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
              <span className="text-xs text-slate-600">
                Total <strong>{submissions.length} lembar jawaban siswa</strong> siap dikoreksi secara hibrida.
              </span>
              <button
                onClick={handleRunGrading}
                disabled={isGrading}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
              >
                <span>Mulai Koreksi Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Hasil Koreksi & Override Guru */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <GradingResultsView
            meta={meta}
            questions={questions}
            results={gradedResults}
            onOpenOverride={(student) => setSelectedStudentForOverride(student)}
            onOpenDiagnostics={() => setActiveTab('diagnostics')}
            onOpenPrint={() => setActiveTab('print')}
            gasConfig={gasConfig}
            onOpenGasModal={() => setIsGasModalOpen(true)}
            onPushToGas={handlePushToGas}
            isPushingGas={isPushingGas}
          />
        </div>
      )}

      {/* VIEW 4: Analisis Diagnostik Kelas & Miskonsepsi */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <ClassDiagnosticsView
            meta={meta}
            questions={questions}
            results={gradedResults}
            diagnostics={diagnostics}
            onRefreshDiagnostics={handleRefreshDiagnostics}
            isAnalyzing={isAnalyzing}
          />
        </div>
      )}

      {/* VIEW 5: Program Remedial & Pengayaan Personal */}
      {activeTab === 'remedial' && (
        <div className="space-y-6">
          <RemedialPengayaanView
            meta={meta}
            questions={questions}
            results={gradedResults}
            onOpenOverride={(student) => setSelectedStudentForOverride(student)}
            onOpenPrint={() => setActiveTab('print')}
          />
        </div>
      )}

      {/* VIEW 6: Laporan Cetak Resmi Siap Print/PDF */}
      {activeTab === 'print' && (
        <div className="space-y-6">
          <PrintReportView
            meta={meta}
            questions={questions}
            results={gradedResults}
            diagnostics={diagnostics}
            onBack={() => setActiveTab('results')}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. DESKTOP SIDEBAR (Visible on md+ screens when not in simulated mobile phone mode) */}
      {deviceMode !== 'mobile' && (
        <DesktopSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasResults={gradedResults.length > 0}
          totalStudents={submissions.length}
          totalQuestions={questions.length}
          meta={meta}
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
          onRunGrading={handleRunGrading}
          isGrading={isGrading}
          gasConfig={gasConfig}
          onOpenGasModal={() => setIsGasModalOpen(true)}
        />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-8">
        {/* Sleek Mobile-Only Header Bar (Only visible on small phones when sidebar is hidden) */}
        <header className="no-print md:hidden bg-slate-900 text-white px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {meta.schoolLogoUrl ? (
              <img
                src={meta.schoolLogoUrl}
                alt="Logo"
                className="w-8 h-8 object-contain rounded-lg bg-white/10 p-0.5 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                SG
              </div>
            )}
            <div className="overflow-hidden min-w-0">
              <div className="text-xs font-bold leading-tight truncate">
                {meta.schoolName || 'SD Negeri Gentan'}
              </div>
              <div className="text-[10px] text-blue-400 font-medium truncate">
                {activeTab === 'config' && 'Perangkat Soal'}
                {activeTab === 'import' && 'Impor & Scan Jawaban'}
                {activeTab === 'results' && 'Hasil Koreksi'}
                {activeTab === 'diagnostics' && 'Diagnostik Kelas'}
                {activeTab === 'remedial' && 'Remedial & Pengayaan'}
                {activeTab === 'print' && 'Laporan Cetak'}
                {' · '}{meta.gradeClass}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsGasModalOpen(true)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                gasConfig.isConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Google Sheets Backend (GAS)"
            >
              <Cloud className="w-3.5 h-3.5" />
              {gasConfig.isConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
            </button>

            {questions.length > 0 && submissions.length > 0 && (
              <button
                type="button"
                onClick={handleRunGrading}
                disabled={isGrading}
                className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-[11px] font-bold rounded-lg text-white shadow-xs transition-transform active:scale-95"
              >
                {isGrading ? 'Mengoreksi...' : '⚡ Koreksi AI'}
              </button>
            )}
          </div>
        </header>

        {/* Floating Notification Toast */}
        {toast && (
          <div className="no-print fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 bg-white border-slate-200">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className={toast.type === 'success' ? 'text-slate-900' : 'text-rose-900'}>
              {toast.message}
            </span>
          </div>
        )}

        {/* IF DEVICE MODE IS SIMULATED MOBILE (Exact Phone Screen Frame as in Reference Image!) */}
        {deviceMode === 'mobile' ? (
          <div className="py-6 px-3 flex flex-col justify-center items-center bg-slate-900/10 min-h-[calc(100vh-64px)]">
            {/* Top Toolbar to Switch Back */}
            <div className="w-full max-w-[410px] mb-2.5 flex items-center justify-between text-xs bg-slate-900 text-white px-3.5 py-2 rounded-2xl shadow-lg border border-slate-800">
              <span className="font-semibold text-blue-300 text-[11px]">📱 Tampilan Ponsel</span>
              <button
                type="button"
                onClick={() => setDeviceMode('responsive')}
                className="font-bold text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-0.5 rounded-lg transition-colors shadow-2xs"
              >
                Desktop ↗
              </button>
            </div>

            <div className="w-full max-w-[410px] bg-slate-950 p-3 rounded-[48px] shadow-2xl border-4 border-slate-800 relative">
              {/* Phone Speaker & Dynamic Island */}
              <div className="w-28 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2" />
                <div className="w-10 h-1 rounded-full bg-slate-800" />
              </div>

              {/* Phone Inner Screen Viewport */}
              <div className="bg-slate-50 rounded-[36px] overflow-hidden min-h-[740px] max-h-[820px] flex flex-col border border-slate-700/40 relative">
                {/* Mobile Status Bar */}
                <div className="px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-800 select-none bg-white/70 backdrop-blur-xs">
                  <span>9:41</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span>5G</span>
                    <div className="w-4 h-2 border border-slate-700 rounded-xs flex items-center p-0.5">
                      <div className="w-full h-full bg-slate-800 rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Mobile Scrollable Viewport Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
                  <MobileProfileHeader
                    meta={meta}
                    results={gradedResults}
                    totalQuestions={questions.length}
                    totalStudents={submissions.length}
                  />

                  {/* Render Active Tab */}
                  {renderTabContent()}
                </div>

                {/* Mobile Bottom Navigation Inside Phone */}
                <MobileBottomNav
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  hasResults={gradedResults.length > 0}
                  totalStudents={submissions.length}
                />
              </div>
            </div>
          </div>
        ) : (
          /* REGULAR RESPONSIVE OR DESKTOP VIEW */
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
            {/* Desktop Greeting Header (inspired by Growly LMS 'Good Morning' in reference) */}
            <div className="mb-5 hidden md:flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Selamat Datang, {meta.teacherName || 'Bapak/Ibu Guru'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {meta.schoolName} · {meta.gradeClass} · Mata Pelajaran: <span className="font-semibold text-blue-700">{meta.subject}</span> · KKM: <strong className="font-mono text-slate-800">{meta.kkm}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGasModalOpen(true)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
                    gasConfig.isConnected
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Konfigurasi Google Apps Script (GAS) Backend"
                >
                  <Cloud className={`w-4 h-4 ${gasConfig.isConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <div className="text-[11px] font-bold leading-none flex items-center gap-1.5">
                      <span>Google Sheets (GAS)</span>
                      <span className={`w-2 h-2 rounded-full ${gasConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      {gasConfig.isConnected ? (gasConfig.lastSyncTime ? `Sinkron ${gasConfig.lastSyncTime}` : 'Terhubung') : 'Belum Terhubung'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Profile Card on Small Screens in responsive mode */}
            <MobileProfileHeader
              meta={meta}
              results={gradedResults}
              totalQuestions={questions.length}
              totalStudents={submissions.length}
            />

            {/* Render Active Tab */}
            {renderTabContent()}
          </main>
        )}

        {/* Fixed Mobile Bottom Nav on small screens when in responsive mode */}
        {deviceMode !== 'mobile' && (
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            hasResults={gradedResults.length > 0}
            totalStudents={submissions.length}
          />
        )}
      </div>

      {/* Teacher Override Modal Drawer */}
      <StudentOverrideDrawer
        student={selectedStudentForOverride}
        questions={questions}
        kkm={meta.kkm}
        weightingScheme={meta.weightingScheme}
        isOpen={selectedStudentForOverride !== null}
        onClose={() => setSelectedStudentForOverride(null)}
        onSaveOverride={handleSaveOverride}
      />

      {/* Google Apps Script (GAS) Backend Configuration & Sync Modal */}
      <GasBackendModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
        gasConfig={gasConfig}
        setGasConfig={setGasConfig}
        meta={meta}
        questions={questions}
        submissions={submissions}
        setSubmissions={setSubmissions}
        gradedResults={gradedResults}
        onShowToast={showToast}
      />
    </div>
  );
}
