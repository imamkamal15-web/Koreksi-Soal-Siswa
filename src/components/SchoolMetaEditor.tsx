import React from 'react';
import { SchoolAssessmentMeta } from '../types/grader';
import {
  Building2,
  BookOpen,
  UserCheck,
  Calendar,
  Sliders,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface SchoolMetaEditorProps {
  meta: SchoolAssessmentMeta;
  onChange: (updated: SchoolAssessmentMeta) => void;
}

export const SchoolMetaEditor: React.FC<SchoolMetaEditorProps> = ({ meta, onChange }) => {
  const handleChange = (field: keyof SchoolAssessmentMeta, value: any) => {
    onChange({
      ...meta,
      [field]: field === 'kkm' ? Math.max(0, Math.min(100, Number(value) || 0)) : value,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChange({
          ...meta,
          schoolLogoUrl: dataUrl,
          showLogoInLetterhead: true,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Identitas Asesmen &amp; Kop Laporan Sekolah</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Informasi ini digunakan pada kepala laporan cetak resmi dan kriteria ketuntasan minimal (KKM).
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>KKM Acuan:</span>
          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-sm">
            {meta.kkm}
          </span>
        </div>
      </div>

      {/* SECTION: PENGATURAN LOGO RESMI SEKOLAH / KOP SURAT */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo Preview Box */}
            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              {meta.schoolLogoUrl ? (
                <img
                  src={meta.schoolLogoUrl}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon className="w-6 h-6 mx-auto stroke-1" />
                  <span className="text-[9px] block mt-0.5">Tanpa Logo</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Logo Satuan Pendidikan (Kop Surat)</span>
                {meta.schoolLogoUrl ? (
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                    Logo Terpasang
                  </span>
                ) : (
                  <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    Belum Ada Logo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Logo akan disematkan di sisi kiri Kop Surat pada dokumen rekapitulasi nilai dan lembar evaluasi siswa siap cetak (PDF).
              </p>

              <div className="flex items-center gap-2 mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={meta.showLogoInLetterhead ?? true}
                    onChange={(e) => handleChange('showLogoInLetterhead', e.target.checked)}
                    className="rounded text-blue-700 focus:ring-blue-600"
                  />
                  <span className="text-[11px] font-medium">Tampilkan logo pada Kop Surat resmi cetak</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Upload File Input */}
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-xs cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-blue-700" />
              <span>Unggah Logo (PNG/JPG)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>

            {/* Tombol Cepat Pakai Logo SD Negeri Gentan */}
            <button
              type="button"
              onClick={() => {
                onChange({
                  ...meta,
                  schoolLogoUrl: '/assets/aistudio/LOGO_SDN_GENTAN_a0440fa5',
                  showLogoInLetterhead: true,
                });
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              title="Gunakan Logo Resmi SD Negeri Gentan"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Logo SD Negeri Gentan</span>
            </button>

            {meta.schoolLogoUrl && (
              <button
                type="button"
                onClick={() => handleChange('schoolLogoUrl', '')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                title="Hapus Logo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Satuan Pendidikan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Nama Satuan Pendidikan / Sekolah
          </label>
          <input
            type="text"
            value={meta.schoolName}
            onChange={(e) => handleChange('schoolName', e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Contoh: SMP Negeri 1 Nusantara"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Alamat Sekolah
          </label>
          <input
            type="text"
            value={meta.schoolAddress}
            onChange={(e) => handleChange('schoolAddress', e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Alamat lengkap satuan pendidikan"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            NPSN / Nomor Pokok Sekolah
          </label>
          <input
            type="text"
            value={meta.npsn}
            onChange={(e) => handleChange('npsn', e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-mono"
            placeholder="Contoh: 20108745"
          />
        </div>

        {/* Kurikulum & Mata Pelajaran */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            Mata Pelajaran
          </label>
          <input
            type="text"
            value={meta.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Contoh: IPA Terpadu"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            Kelas / Fase / Rombel
          </label>
          <input
            type="text"
            value={meta.gradeClass}
            onChange={(e) => handleChange('gradeClass', e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Contoh: Kelas VIII-A (Fase D)"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            Kriteria Ketuntasan Minimal (KKM)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={meta.kkm}
            onChange={(e) => handleChange('kkm', e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-mono"
          />
        </div>

        {/* Tanggal & Pendidik */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Tanggal Pelaksanaan Ujian
          </label>
          <input
            type="text"
            value={meta.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Contoh: 27 Oktober 2026"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            Guru Pengampu Mata Pelajaran &amp; NIP
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={meta.teacherName}
              onChange={(e) => handleChange('teacherName', e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              placeholder="Nama Guru"
            />
            <input
              type="text"
              value={meta.teacherNip}
              onChange={(e) => handleChange('teacherNip', e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-mono"
              placeholder="NIP Guru"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            Kepala Satuan Pendidikan &amp; NIP
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={meta.principalName}
              onChange={(e) => handleChange('principalName', e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              placeholder="Nama Kepala Sekolah"
            />
            <input
              type="text"
              value={meta.principalNip}
              onChange={(e) => handleChange('principalNip', e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-mono"
              placeholder="NIP Kepala Sekolah"
            />
          </div>
        </div>
      </div>

      {/* PENGATURAN SKEMA PEMBOBOTAN NILAI & KOREKSI URAIAN */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-blue-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Skema Pembobotan Nilai &amp; Opsi Koreksi Uraian (Kasus Penilaian Fleksibel)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kasus 2: Skema Pembobotan Nilai Akhir */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="text-xs font-semibold text-slate-800 block mb-1">
              Skema Pembobotan Nilai Akhir (Skala 100)
            </span>
            <p className="text-[11px] text-slate-500 mb-3">
              Pilih cara sistem mengkalkulasi nilai akhir siswa dari seluruh butir soal.
            </p>

            <div className="space-y-2 mb-4">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                <input
                  type="radio"
                  name="weightingMode"
                  checked={!meta.weightingScheme || meta.weightingScheme.mode === 'direct'}
                  onChange={() =>
                    handleChange('weightingScheme', {
                      mode: 'direct',
                      pgPercentage: 70,
                      esaiPercentage: 30,
                    })
                  }
                  className="mt-0.5 text-blue-700 focus:ring-blue-600"
                />
                <div>
                  <span className="font-semibold block">Akumulasi Poin Langsung (Standar)</span>
                  <span className="text-[11px] text-slate-500">
                    Nilai = (Total Skor Perolehan / Total Bobot Maksimal Soal) &times; 100.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                <input
                  type="radio"
                  name="weightingMode"
                  checked={meta.weightingScheme?.mode === 'composite'}
                  onChange={() =>
                    handleChange('weightingScheme', {
                      mode: 'composite',
                      pgPercentage: meta.weightingScheme?.pgPercentage ?? 70,
                      esaiPercentage: meta.weightingScheme?.esaiPercentage ?? 30,
                    })
                  }
                  className="mt-0.5 text-blue-700 focus:ring-blue-600"
                />
                <div>
                  <span className="font-semibold block">
                    Pembobotan Komposit Kategori (Contoh: 70% PG &amp; 30% Uraian)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Nilai dihitung terpisah per kelompok: persentase Soal Objektif + persentase Soal Subjektif.
                  </span>
                </div>
              </label>
            </div>

            {meta.weightingScheme?.mode === 'composite' && (
              <div className="bg-white border border-blue-200 rounded-lg p-3 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      % Bobot Soal Objektif (PG/PGK/BS/Isian)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={meta.weightingScheme.pgPercentage}
                        onChange={(e) =>
                          handleChange('weightingScheme', {
                            ...meta.weightingScheme!,
                            pgPercentage: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded font-mono font-bold text-blue-700"
                      />
                      <span className="text-xs text-slate-500">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      % Bobot Soal Subjektif (Uraian/Hitungan)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={meta.weightingScheme.esaiPercentage}
                        onChange={(e) =>
                          handleChange('weightingScheme', {
                            ...meta.weightingScheme!,
                            esaiPercentage: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded font-mono font-bold text-blue-700"
                      />
                      <span className="text-xs text-slate-500">%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Total Proporsi:</span>
                  <span
                    className={`font-mono font-bold ${
                      meta.weightingScheme.pgPercentage + meta.weightingScheme.esaiPercentage === 100
                        ? 'text-emerald-700'
                        : 'text-rose-600'
                    }`}
                  >
                    {meta.weightingScheme.pgPercentage + meta.weightingScheme.esaiPercentage}%
                    {meta.weightingScheme.pgPercentage + meta.weightingScheme.esaiPercentage !== 100 &&
                      ' (Disarankan pas 100%)'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Kasus 1: Koreksi Uraian Fleksibel (Input Skor Langsung) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 block mb-1">
                Fleksibilitas Koreksi Soal Uraian / Esai (Kasus 1)
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                Guru dapat mengoreksi soal uraian dengan 2 cara yang didukung penuh:
              </p>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <span className="font-semibold text-blue-900 block text-[11px]">
                    1. Input Skor Uraian Langsung (Koreksi Manual di Kertas)
                  </span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Jika guru sudah memeriksa fisik lembar jawaban siswa di kertas, guru cukup memasukkan angka skor (contoh: <code className="bg-slate-100 px-1 rounded text-blue-700">8</code> atau <code className="bg-slate-100 px-1 rounded text-blue-700">15/20</code>) pada kolom jawaban soal uraian. Sistem otomatis membacanya sebagai skor langsung tanpa perlu proses AI.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <span className="font-semibold text-indigo-900 block text-[11px]">
                    2. Koreksi Otomatis AI Semantik NLP
                  </span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Jika teks jawaban uraian siswa dimasukkan, AI akan mengevaluasi esensi pemahaman konsep dan kata kunci berdasarkan rubrik analitis (bebas fluffing/bukan panjang kalimat).
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic mt-3 pt-2 border-t border-slate-200">
              * Guru juga dapat mengubah nilai kapan saja lewat tombol &ldquo;Override Nilai Guru&rdquo; di tab Hasil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
