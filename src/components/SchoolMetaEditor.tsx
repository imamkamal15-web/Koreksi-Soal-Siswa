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
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-lg bg-blue-50 text-blue-700">
              <Building2 className="w-4 h-4" />
            </span>
            <h2 className="text-xs sm:text-base font-bold text-slate-900">Identitas Satuan Pendidikan &amp; Kop Surat</h2>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
            Data sekolah, kelas, mapel, guru, dan kepala sekolah untuk kop dokumen cetak resmi.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 self-start sm:self-auto font-mono">
          <span>NPSN:</span>
          <span className="font-bold text-blue-800">{meta.npsn || '20401650'}</span>
        </div>
      </div>

      {/* SECTION: PENGATURAN LOGO RESMI SEKOLAH / KOP SURAT */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Logo Preview Box */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
              {meta.schoolLogoUrl ? (
                <img
                  src={meta.schoolLogoUrl}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon className="w-5 h-5 mx-auto stroke-1" />
                  <span className="text-[8px] block mt-0.5">Tanpa Logo</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] sm:text-xs font-bold text-slate-900">Logo Kop Surat</span>
                {meta.schoolLogoUrl ? (
                  <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.2 rounded">
                    Terpasang
                  </span>
                ) : (
                  <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1 py-0.2 rounded">
                    Kosong
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Otomatis tercetak di sisi kiri Kop Surat lembar rekapitulasi nilai PDF.
              </p>

              <div className="flex items-center gap-1.5 mt-1.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={meta.showLogoInLetterhead ?? true}
                    onChange={(e) => handleChange('showLogoInLetterhead', e.target.checked)}
                    className="rounded text-blue-700 focus:ring-blue-600 w-3.5 h-3.5"
                  />
                  <span className="text-[10px] sm:text-[11px] font-medium">Tampilkan di Kop Surat cetak</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {/* Upload File Input */}
            <label className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs cursor-pointer transition-colors">
              <Upload className="w-3 h-3 text-blue-700" />
              <span>Unggah Logo</span>
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
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              title="Gunakan Logo Resmi SD Negeri Gentan"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Logo SDN Gentan</span>
            </button>

            {meta.schoolLogoUrl && (
              <button
                type="button"
                onClick={() => handleChange('schoolLogoUrl', '')}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                title="Hapus Logo"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Satuan Pendidikan */}
        <div>
          <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Nama Satuan Pendidikan / Sekolah
          </label>
          <input
            type="text"
            value={meta.schoolName}
            onChange={(e) => handleChange('schoolName', e.target.value)}
            className="w-full text-[11px] sm:text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Contoh: SD Negeri Gentan"
          />
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Alamat Sekolah
          </label>
          <input
            type="text"
            value={meta.schoolAddress}
            onChange={(e) => handleChange('schoolAddress', e.target.value)}
            className="w-full text-[11px] sm:text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Alamat lengkap satuan pendidikan"
          />
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            NPSN
          </label>
          <input
            type="text"
            value={meta.npsn}
            onChange={(e) => handleChange('npsn', e.target.value)}
            className="w-full text-[11px] sm:text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-mono"
            placeholder="Contoh: 20401650"
          />
        </div>

        {/* Kurikulum & Mata Pelajaran */}
        <div>
          <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            Mata Pelajaran
          </label>
          <input
            type="text"
            value={meta.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="w-full text-[11px] sm:text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Contoh: IPAS"
          />
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            Kelas / Fase / Rombel
          </label>
          <input
            type="text"
            value={meta.gradeClass}
            onChange={(e) => handleChange('gradeClass', e.target.value)}
            className="w-full text-[11px] sm:text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Contoh: Kelas 5B (Fase C)"
          />
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            Kriteria Ketuntasan Minimal (KKM)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={meta.kkm}
            onChange={(e) => handleChange('kkm', e.target.value)}
            className="w-full text-[11px] sm:text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-mono"
          />
        </div>

        {/* Tanggal & Pendidik */}
        <div>
          <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Tanggal Pelaksanaan Ujian
          </label>
          <input
            type="text"
            value={meta.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full text-[11px] sm:text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Contoh: 27 Oktober 2026"
          />
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            Guru Pengampu &amp; NIP
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="text"
              value={meta.teacherName}
              onChange={(e) => handleChange('teacherName', e.target.value)}
              className="w-full text-[11px] sm:text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              placeholder="Nama Guru"
            />
            <input
              type="text"
              value={meta.teacherNip}
              onChange={(e) => handleChange('teacherNip', e.target.value)}
              className="w-full text-[11px] sm:text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-mono"
              placeholder="NIP Guru"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            Kepala Sekolah &amp; NIP
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="text"
              value={meta.principalName}
              onChange={(e) => handleChange('principalName', e.target.value)}
              className="w-full text-[11px] sm:text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              placeholder="Nama Kepala Sekolah"
            />
            <input
              type="text"
              value={meta.principalNip}
              onChange={(e) => handleChange('principalNip', e.target.value)}
              className="w-full text-[11px] sm:text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-mono"
              placeholder="NIP Kepala Sekolah"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
