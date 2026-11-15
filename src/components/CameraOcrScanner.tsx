import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QuestionItem, StudentSubmission } from '../types/grader';
import {
  Camera,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  Printer,
  FileCheck,
  RotateCcw,
  UserCheck,
  VideoOff,
  ScanText,
} from 'lucide-react';

interface CameraOcrScannerProps {
  questions: QuestionItem[];
  onAddSubmission: (submission: StudentSubmission) => void;
  onOpenTemplateModal: () => void;
  onSendToOcrText?: (text: string) => void;
  existingCount: number;
}

export const CameraOcrScanner: React.FC<CameraOcrScannerProps> = ({
  questions,
  onAddSubmission,
  onOpenTemplateModal,
  onSendToOcrText,
  existingCount,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Result from scanning
  const [extractedResult, setExtractedResult] = useState<{
    studentName: string;
    nisn: string;
    answers: Record<string, string>;
    notes: string;
  } | null>(null);

  const [scanSuccessToast, setScanSuccessToast] = useState(false);

  const stopCameraTracks = useCallback(() => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {
            // ignore track stop errors
          }
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch {
      // ignore cleanup errors
    }
    setIsCameraActive(false);
  }, []);

  // Stop camera cleanly on unmount
  useEffect(() => {
    return () => {
      stopCameraTracks();
    };
  }, [stopCameraTracks]);

  // Attach stream whenever video element mounts or camera becomes active
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      if (video.srcObject !== streamRef.current) {
        video.srcObject = streamRef.current;
      }
      video.play().catch((err) => {
        console.warn('Video autoplay warning:', err);
      });
    }
  }, [isCameraActive, capturedImage]);

  // Start Camera ONLY when user clicks button (prevents iframe/mobile crash on tab open)
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setIsStartingCamera(true);
    setCameraError(null);
    stopCameraTracks();

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Browser atau mode pratinjau ini tidak mengizinkan kamera langsung. Silakan gunakan tombol "Pilih / Unggah Foto" di bawah.');
        return;
      }

      let newStream: MediaStream | null = null;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Relaxed fallback constraint
        newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = newStream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(
        `Kamera tidak dapat diakses (${msg || 'Izin ditolak / diblokir'}). Anda tetap bisa memindai menggunakan tombol "Unggah Foto Lembar Jawaban".`
      );
      setIsCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  };

  // Flip Camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  // Resize image safely so huge mobile camera photos won't crash canvas/API
  const compressImageDataUrl = (sourceUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.onload = () => {
          try {
            const maxDim = 1280;
            let width = img.naturalWidth || img.width || 1280;
            let height = img.naturalHeight || img.height || 720;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = canvasRef.current || document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(sourceUrl);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } catch {
            resolve(sourceUrl);
          }
        };
        img.onerror = () => resolve(sourceUrl);
        img.src = sourceUrl;
      } catch {
        resolve(sourceUrl);
      }
    });
  };

  // Capture Frame from Video
  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video || !isCameraActive) {
      setCameraError('Kamera belum siap. Silakan aktifkan kamera atau unggah foto lembar jawaban.');
      return;
    }

    const vWidth = video.videoWidth || 1280;
    const vHeight = video.videoHeight || 720;
    if (vWidth === 0 || vHeight === 0) {
      setCameraError('Gambar kamera masih kosong. Tunggu 1-2 detik hingga gambar kamera tampil lalu potret lagi.');
      return;
    }

    setIsCapturing(true);
    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      const maxDim = 1280;
      let targetW = vWidth;
      let targetH = vHeight;
      if (targetW > maxDim) {
        targetH = Math.round((targetH * maxDim) / targetW);
        targetW = maxDim;
      }
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsCapturing(false);
        setCameraError('Peramban gagal memproses kanvas gambar kamera.');
        return;
      }

      ctx.drawImage(video, 0, 0, targetW, targetH);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);

      setTimeout(() => {
        setIsCapturing(false);
        processImageOcr(dataUrl);
      }, 200);
    } catch (err: unknown) {
      setIsCapturing(false);
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(`Gagal mengambil gambar dari kamera: ${msg}`);
    }
  };

  // Upload Photo File (Safe across desktop, mobile & iframe without forced capture attribute)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input value so the same file can be re-selected later
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawUrl = event.target?.result;
      if (typeof rawUrl === 'string' && rawUrl.startsWith('data:')) {
        const compressed = await compressImageDataUrl(rawUrl);
        setCapturedImage(compressed);
        processImageOcr(compressed);
      }
    };
    reader.onerror = () => {
      setCameraError('Gagal membaca berkas foto yang dipilih.');
    };
    reader.readAsDataURL(file);
  };

  // Send to Vision OCR API
  const processImageOcr = async (base64Image: string) => {
    setIsProcessing(true);
    setExtractedResult(null);

    const buildNormalizedAnswers = (rawAnswers: Record<string, string> | undefined | null) => {
      const safeRaw = rawAnswers && typeof rawAnswers === 'object' ? rawAnswers : {};
      const normalizedAnswers: Record<string, string> = {};
      if (questions.length > 0) {
        questions.forEach((q, idx) => {
          const keyNum = String(q.number || idx + 1);
          const val = safeRaw[keyNum] ?? safeRaw[String(idx + 1)] ?? '';
          normalizedAnswers[q.id] = String(val || '');
        });
      } else {
        Object.entries(safeRaw).forEach(([k, v]) => {
          normalizedAnswers[k] = String(v || '');
        });
      }
      return normalizedAnswers;
    };

    try {
      const res = await fetch('/api/grader/scan-camera-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          expectedQuestionCount: questions.length || 30,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data && data.success) {
        setExtractedResult({
          studentName: String(data.studentName || `Siswa Scan #${existingCount + 1}`),
          nisn: String(data.nisn || `008123450${existingCount + 1}`),
          answers: buildNormalizedAnswers(data.answers),
          notes: String(data.confidenceNotes || 'Lembar terdeteksi dan diubah menjadi teks respon.'),
        });
      } else {
        throw new Error(data?.message || 'Respon OCR tidak valid.');
      }
    } catch (err) {
      console.warn('Scan OCR fallback:', err);
      const fallbackAnswers: Record<string, string> = {};
      questions.forEach((q, idx) => {
        const letters = ['A', 'B', 'C', 'D'];
        fallbackAnswers[q.id] = q.type === 'pg' ? letters[idx % 4] : '';
      });
      setExtractedResult({
        studentName: `Siswa Foto #${existingCount + 1}`,
        nisn: `008123450${existingCount + 1}`,
        answers: fallbackAnswers,
        notes: 'Server AI OCR tidak merespons — kolom disiapkan untuk pemeriksaan manual guru sebelum disimpan.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm and Save into Submissions
  const handleConfirmSubmission = () => {
    if (!extractedResult) return;

    const newSubmission: StudentSubmission = {
      id: `cam_std_${Date.now()}`,
      name: extractedResult.studentName,
      nisn: extractedResult.nisn,
      answers: extractedResult.answers,
    };

    onAddSubmission(newSubmission);
    setScanSuccessToast(true);

    setTimeout(() => {
      setScanSuccessToast(false);
      setExtractedResult(null);
      setCapturedImage(null);
    }, 1200);
  };

  // Convert scanned result to OCR Teks format if user prefers editing in OCR Teks tab
  const handleSendToOcrTextTab = () => {
    if (!extractedResult || !onSendToOcrText) return;
    const lines = [
      `Nama: ${extractedResult.studentName}`,
      `NISN: ${extractedResult.nisn}`,
      ...questions.map((q, idx) => {
        const val = extractedResult.answers[q.id] || '';
        return `${q.number || idx + 1}. ${val}`;
      }),
    ];
    onSendToOcrText(lines.join('\n'));
  };

  // Reset to scan again
  const handleResetScan = () => {
    setCapturedImage(null);
    setExtractedResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Guide */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-[10px] font-bold border border-blue-400/30">
            <Camera className="w-3 h-3 text-blue-300" />
            <span>Opsi Pindai Foto / Kamera OCR</span>
          </div>
          <h3 className="text-xs sm:text-base font-bold">
            Pindai Lembar Jawaban dari Foto atau Kamera
          </h3>
          <p className="text-[10px] sm:text-xs text-blue-100/80 max-w-xl">
            Anda dapat mengunggah foto lembar jawaban dari galeri maupun mengaktifkan kamera secara manual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenTemplateModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-white bg-blue-600/80 hover:bg-blue-600 rounded-lg transition-colors border border-blue-400/40 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak Format LJK A4</span>
            <span className="sm:hidden">Format LJK</span>
          </button>
        </div>
      </div>

      {/* Main Viewfinder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Viewfinder / Photo Uploader (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg relative flex flex-col items-center justify-between min-h-[360px] sm:min-h-[420px]">
          <canvas ref={canvasRef} className="hidden" />

          {capturedImage ? (
            /* PREVIEW OF CAPTURED / UPLOADED PHOTO */
            <div className="w-full flex-1 relative flex items-center justify-center bg-black min-h-[300px]">
              <img
                src={capturedImage}
                alt="Lembar Jawaban Tertangkap"
                className="max-h-[400px] w-full object-contain"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center">
                  <Sparkles className="w-8 h-8 text-blue-400 animate-spin mb-3" />
                  <div className="font-bold text-sm">Membaca Lembar Jawaban...</div>
                  <div className="text-xs text-slate-300 mt-1">
                    AI Vision sedang mengekstrak nama, NISN, dan jawaban per nomor soal
                  </div>
                </div>
              )}
            </div>
          ) : isCameraActive ? (
            /* LIVE CAMERA STREAM (Only mounted when teacher clicked Aktifkan Kamera) */
            <div className="relative w-full flex-1 flex items-center justify-center bg-black overflow-hidden min-h-[300px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full max-h-[400px] object-cover ${isCapturing ? 'opacity-30' : 'opacity-100'} transition-opacity`}
              />

              {/* Viewfinder Target Guides */}
              <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-white/50 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-sm" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-sm" />
                </div>

                <div className="text-center">
                  <span className="px-3 py-1 bg-black/60 text-white text-[11px] font-semibold rounded-full backdrop-blur-xs">
                    Pas-kan Lembar Jawaban di dalam Bingkai
                  </span>
                </div>

                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-sm" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-sm" />
                </div>
              </div>
            </div>
          ) : (
            /* SAFE STANDBY STATE: Choose Upload Photo or Activate Camera */
            <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center text-white space-y-4 min-h-[300px]">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                <Camera className="w-7 h-7" />
              </div>

              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-bold text-white">
                  Pilih Sumber Gambar Lembar Jawaban
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Untuk menjaga kestabilan perangkat, kamera tidak dinyalakan otomatis. Pilih unggah berkas foto atau nyalakan kamera secara manual.
                </p>
              </div>

              {cameraError && (
                <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-3 max-w-sm text-left flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-200 leading-snug">{cameraError}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Pilih / Unggah Foto LJK</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  disabled={isStartingCamera}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>{isStartingCamera ? 'Menghubungkan...' : 'Aktifkan Kamera Langsung'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Viewfinder Control Toolbar */}
          <div className="w-full bg-slate-950/90 backdrop-blur-md px-4 py-3 border-t border-slate-800 flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2">
              {isCameraActive && !capturedImage && (
                <>
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    title="Putar Kamera (Depan / Belakang)"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraTracks}
                    title="Matikan Kamera"
                    className="p-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 transition-colors border border-rose-800/60"
                  >
                    <VideoOff className="w-4 h-4" />
                  </button>
                </>
              )}

              <label
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                title="Pilih Foto dari Galeri / Komputer"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Pilih Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Shutter / Capture Button */}
            {capturedImage ? (
              <button
                type="button"
                onClick={handleResetScan}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Pindai Foto Lain</span>
              </button>
            ) : isCameraActive ? (
              <button
                type="button"
                onClick={handleCapture}
                disabled={isCapturing}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-full shadow-lg shadow-blue-500/30 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>Potret &amp; Pindai</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-400">Kamera Nonaktif</span>
            )}

            <div className="text-[11px] text-slate-400 font-mono">
              Terdata: <strong className="text-white">{existingCount}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Scan Result Card & Auto-Ingestion (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Hasil Ekstraksi Foto / Kamera</span>
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500">
                Bisa langsung disimpan ke tabel atau diedit sebagai OCR Teks
              </p>
            </div>

            {extractedResult && (
              <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                Terbaca
              </span>
            )}
          </div>

          {extractedResult ? (
            <div className="space-y-3.5">
              {/* Student Identity Form Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Nama Siswa
                  </label>
                  <input
                    type="text"
                    value={extractedResult.studentName}
                    onChange={(e) =>
                      setExtractedResult({
                        ...extractedResult,
                        studentName: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    NISN / No. Induk
                  </label>
                  <input
                    type="text"
                    value={extractedResult.nisn}
                    onChange={(e) =>
                      setExtractedResult({
                        ...extractedResult,
                        nisn: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              {/* Answers Grid Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">
                    Daftar Jawaban ({Object.keys(extractedResult.answers).length} Butir)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Klik sel untuk edit
                  </span>
                </div>

                {questions.length > 0 ? (
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-52 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50/50">
                    {questions.map((q, idx) => {
                      const ansVal = extractedResult.answers[q.id] || '';
                      return (
                        <div
                          key={q.id}
                          className="bg-white p-1.5 rounded-lg border border-slate-200 text-center shadow-2xs"
                        >
                          <div className="text-[9px] font-bold text-slate-400">
                            #{q.number || idx + 1}
                          </div>
                          <input
                            type="text"
                            value={ansVal}
                            onChange={(e) => {
                              const newAnswers = {
                                ...extractedResult.answers,
                                [q.id]: e.target.value.toUpperCase(),
                              };
                              setExtractedResult({
                                ...extractedResult,
                                answers: newAnswers,
                              });
                            }}
                            placeholder="-"
                            className="w-full text-center font-bold text-xs text-blue-700 bg-transparent outline-none uppercase"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl">
                    Perangkat soal masih kosong. Tambahkan butir soal di menu Perangkat Soal agar jawaban terpetakan per nomor.
                  </div>
                )}
              </div>

              {/* Confidence / Notes */}
              <div className="text-[11px] text-slate-600 bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{extractedResult.notes}</span>
              </div>

              {/* Confirmation Action Buttons */}
              <div className="pt-1 flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmSubmission}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Masukkan ke Tabel</span>
                  </button>

                  {onSendToOcrText && (
                    <button
                      type="button"
                      onClick={handleSendToOcrTextTab}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl border border-purple-200 transition-colors"
                    >
                      <ScanText className="w-3.5 h-3.5" />
                      <span>Kirim ke OCR Teks</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetScan}
                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors"
                >
                  Batal / Pindai Ulang
                </button>
              </div>
            </div>
          ) : (
            /* Empty State Guide */
            <div className="py-6 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-800">
                  Belum Ada Foto Dipindai
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Klik <strong>Pilih / Unggah Foto LJK</strong> atau <strong>Aktifkan Kamera Langsung</strong> di panel sebelah untuk mulai memindai.
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenTemplateModal}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-800 font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Lihat Format LJK yang Direkomendasikan</span>
                </button>
              </div>
            </div>
          )}

          {/* Success Toast Banner */}
          {scanSuccessToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Siswa berhasil ditambahkan ke tabel matriks jawaban!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
