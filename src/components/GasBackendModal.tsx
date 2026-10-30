import React, { useState } from 'react';
import {
  GAS_SCRIPT_TEMPLATE,
  testGasConnection,
  pullStudentsFromGas,
  pushResultsToGas,
  saveGasConfig,
} from '../services/gasService';
import {
  SchoolAssessmentMeta,
  QuestionItem,
  StudentSubmission,
  StudentGradedResult,
  GasConfig,
} from '../types/grader';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Download,
  Upload,
  ExternalLink,
  Code2,
  FileSpreadsheet,
  HelpCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface GasBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasConfig: GasConfig;
  setGasConfig: (config: GasConfig) => void;
  meta: SchoolAssessmentMeta;
  questions: QuestionItem[];
  submissions: StudentSubmission[];
  setSubmissions: (submissions: StudentSubmission[]) => void;
  gradedResults: StudentGradedResult[];
  onShowToast: (type: 'success' | 'error', message: string) => void;
}

export const GasBackendModal: React.FC<GasBackendModalProps> = ({
  isOpen,
  onClose,
  gasConfig,
  setGasConfig,
  meta,
  questions,
  submissions,
  setSubmissions,
  gradedResults,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'code' | 'guide'>('config');
  const [urlInput, setUrlInput] = useState(gasConfig.webAppUrl || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    spreadsheetName?: string;
  }>({
    status: gasConfig.isConnected ? 'success' : 'idle',
    message: gasConfig.isConnected
      ? `Terhubung ke "${gasConfig.spreadsheetName || 'Google Spreadsheet'}"`
      : '',
    spreadsheetName: gasConfig.spreadsheetName,
  });

  const [copiedScript, setCopiedScript] = useState(false);
  const [syncing, setSyncing] = useState(false);

  if (!isOpen) return null;

  // Handle Test Connection
  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      setTestResult({
        status: 'error',
        message: 'Masukkan URL Web App Google Apps Script (.exec) terlebih dahulu.',
      });
      return;
    }

    setTesting(true);
    setTestResult({ status: 'idle', message: 'Menghubungkan ke Google Apps Script...' });

    const res = await testGasConnection(urlInput.trim());
    setTesting(false);

    if (res.success) {
      const ssName = res.data?.spreadsheetName || 'Google Spreadsheet Guru';
      const updatedConfig: GasConfig = {
        ...gasConfig,
        webAppUrl: urlInput.trim(),
        spreadsheetName: ssName,
        spreadsheetId: res.data?.spreadsheetId || '',
        isConnected: true,
        lastSyncTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setGasConfig(updatedConfig);
      saveGasConfig(updatedConfig);

      setTestResult({
        status: 'success',
        message: `Koneksi berhasil! Terhubung dengan file: "${ssName}".`,
        spreadsheetName: ssName,
      });
      onShowToast('success', `Koneksi GAS aktif: ${ssName}`);
    } else {
      setTestResult({
        status: 'error',
        message: res.message || 'Gagal terhubung. Pastikan Web App disetel akses "Siapa saja (Anyone)".',
      });
      onShowToast('error', 'Koneksi Google Apps Script gagal');
    }
  };

  // Handle Pull Students from Sheet
  const handlePullStudents = async () => {
    if (!gasConfig.webAppUrl) {
      onShowToast('error', 'Hubungkan URL GAS terlebih dahulu');
      return;
    }

    setSyncing(true);
    const res = await pullStudentsFromGas(gasConfig.webAppUrl);
    setSyncing(false);

    if (res.success && res.students) {
      setSubmissions(res.students);
      const updatedConfig: GasConfig = {
        ...gasConfig,
        lastSyncTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setGasConfig(updatedConfig);
      saveGasConfig(updatedConfig);
      onShowToast('success', `Berhasil menarik ${res.students.length} siswa dari Google Spreadsheet!`);
    } else {
      onShowToast('error', res.message || 'Gagal menarik data siswa');
    }
  };

  // Handle Push Results to Sheet
  const handlePushResults = async () => {
    if (!gasConfig.webAppUrl) {
      onShowToast('error', 'Hubungkan URL GAS terlebih dahulu');
      return;
    }

    if (gradedResults.length === 0) {
      onShowToast('error', 'Belum ada hasil koreksi yang bisa dikirim ke Sheet.');
      return;
    }

    setSyncing(true);
    const res = await pushResultsToGas(gasConfig.webAppUrl, meta, questions, gradedResults);
    setSyncing(false);

    if (res.success) {
      const updatedConfig: GasConfig = {
        ...gasConfig,
        lastSyncTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setGasConfig(updatedConfig);
      saveGasConfig(updatedConfig);
      onShowToast('success', `Berhasil menyimpan ${gradedResults.length} hasil siswa ke Google Spreadsheet!`);
    } else {
      onShowToast('error', res.message || 'Gagal menyimpan hasil ke Spreadsheet');
    }
  };

  // Copy Code.gs script
  const handleCopyScript = () => {
    navigator.clipboard.writeText(GAS_SCRIPT_TEMPLATE).then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 3000);
      onShowToast('success', 'Skrip Code.gs berhasil disalin ke clipboard!');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold">
                  Integrasi Google Apps Script (GAS) Backend
                </h2>
                {gasConfig.isConnected && (
                  <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.2 rounded-full font-bold">
                    Aktif
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-200/90 mt-0.5">
                Sinkronisasi dua arah dengan Google Spreadsheet sekolah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'config'
                ? 'bg-white text-emerald-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Koneksi Web App</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'code'
                ? 'bg-white text-emerald-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Skrip Code.gs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'guide'
                ? 'bg-white text-emerald-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>3. Panduan Pemasangan</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: KONEKSI WEB APP & SINKRONISASI */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Status Card */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : testResult.status === 'error'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-start sm:items-center gap-2.5">
                  {testResult.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                  ) : testResult.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                  ) : (
                    <Cloud className="w-5 h-5 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold">
                      {testResult.status === 'success'
                        ? 'Backend Google Apps Script Terhubung'
                        : testResult.status === 'error'
                        ? 'Koneksi Gagal'
                        : 'Belum Terhubung ke Google Apps Script'}
                    </div>
                    <div className="text-[11px] mt-0.5 opacity-90">
                      {testResult.message || 'Masukkan URL Web App dari Spreadsheet untuk mulai sinkronisasi data.'}
                    </div>
                    {gasConfig.lastSyncTime && (
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Sinkronisasi terakhir: {gasConfig.lastSyncTime} WIB
                      </div>
                    )}
                  </div>
                </div>

                {gasConfig.isConnected && (
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const resetConfig: GasConfig = {
                          webAppUrl: '',
                          spreadsheetName: '',
                          isConnected: false,
                          autoSync: false,
                        };
                        setGasConfig(resetConfig);
                        saveGasConfig(resetConfig);
                        setUrlInput('');
                        setTestResult({ status: 'idle', message: 'Koneksi telah diputus.' });
                        onShowToast('success', 'Koneksi GAS diputus.');
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                    >
                      Putuskan
                    </button>
                  </div>
                )}
              </div>

              {/* URL Input Form */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-900">
                  URL Web App Google Apps Script (.exec):
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs shrink-0 disabled:opacity-50"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menguji...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Uji Koneksi</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Didapatkan setelah menerapkan skrip (Deploy) sebagai Web App di Google Sheets dengan akses &quot;Siapa saja (Anyone)&quot;.
                </p>
              </div>

              {/* Action Buttons for Active Cloud Operations */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-900 block">
                  Aksi Sinkronisasi Data Spreadsheet:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pull Students Button */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Tarik Data Siswa dari Sheet</div>
                        <div className="text-[10px] text-slate-500">Membaca sheet &quot;Data_Siswa&quot;</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handlePullStudents}
                      disabled={!gasConfig.isConnected || syncing}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-lg border border-blue-200 transition-colors disabled:opacity-40"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{syncing ? 'Memproses...' : 'Tarik Data Siswa'}</span>
                    </button>
                  </div>

                  {/* Push Results Button */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Simpan Hasil Nilai ke Sheet</div>
                        <div className="text-[10px] text-slate-500">Tulis ke sheet &quot;Rekap_Nilai&quot;</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handlePushResults}
                      disabled={!gasConfig.isConnected || syncing || gradedResults.length === 0}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors disabled:opacity-40"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{syncing ? 'Mengunggah...' : `Simpan Rekap Nilai (${gradedResults.length})`}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKRIP CODE.GS SIAP PAKAI */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Skrip Google Apps Script (Code.gs)
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Salin skrip ini ke menu <strong>Ekstensi &gt; Apps Script</strong> pada Google Spreadsheet Anda.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors shrink-0"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Seluruh Kode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Box */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-[11px] p-4 max-h-[360px] overflow-y-auto">
                <pre className="whitespace-pre">{GAS_SCRIPT_TEMPLATE}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: PANDUAN PEMASANGAN */}
          {activeTab === 'guide' && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-blue-950 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">100% Menggunakan Akun Google Sekolah / Belajar.id</span>
                  <p className="text-[11px] text-blue-900 mt-0.5">
                    Data siswa dan nilai tetap tersimpan aman di Google Drive pribadi/sekolah Anda tanpa perantara database eksternal.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Buat Google Spreadsheet Baru</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold">sheets.new</a> di browser Anda dan beri nama (misal: <em>&quot;Nilai Asesmen IPAS Kelas 5B&quot;</em>).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Buka Apps Script &amp; Tempel Kode</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Klik menu <strong>Ekstensi (Extensions) &gt; Apps Script</strong>. Hapus isi fungsi awal, lalu tempel (Ctrl+V) kode dari tab <strong>2. Skrip Code.gs</strong> di atas. Klik <strong>Simpan (ikon disket)</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Terapkan Sebagai Web App (New Deployment)</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Klik tombol biru <strong>Terapkan (Deploy) &gt; Penerapan baru</strong>.
                      <br />• Pilih jenis: <strong>Aplikasi web (Web app)</strong>.
                      <br />• Jalankan sebagai: <strong>Saya (Me)</strong>.
                      <br />• Siapa yang memiliki akses: <strong className="text-emerald-700">Siapa saja (Anyone)</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    4
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Salin URL &amp; Tempel ke SmartGrader</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Salin URL Web App yang berakhiran <code className="bg-slate-200 px-1 py-0.2 rounded text-indigo-800 font-mono">/exec</code> dan tempelkan ke kolom URL di tab <strong>1. Koneksi Web App</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-500 font-mono">
            {gasConfig.isConnected
              ? `Terhubung: ${gasConfig.spreadsheetName || 'Spreadsheet'}`
              : 'Status: Belum Terhubung'}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
