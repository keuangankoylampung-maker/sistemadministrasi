import React, { useState } from 'react';
import { Siswa, Tagihan, LogPembayaran, SchoolIdentity, AdminSettings } from '../types';
import { getAcademicYearAndSemester, getAvailableAcademicYears } from '../utils/schoolYear';
import { 
  Printer, 
  Receipt, 
  Calendar, 
  DollarSign, 
  Filter, 
  Search, 
  FileText, 
  CheckCircle,
  Download,
  School,
  FileCheck,
  Tag,
  CreditCard,
  User,
  Layers,
  ChevronRight
} from 'lucide-react';

interface RekapPenerimaanTabProps {
  siswaList: Siswa[];
  tagihanList: Tagihan[];
  logList: LogPembayaran[];
  schoolIdentity: SchoolIdentity;
  adminSettings: AdminSettings;
}

export default function RekapPenerimaanTab({
  siswaList,
  tagihanList,
  logList,
  schoolIdentity,
  adminSettings
}: RekapPenerimaanTabProps) {
  // Filters State
  const [filterTahunAjaran, setFilterTahunAjaran] = useState<string>('Semua');
  const [filterSemester, setFilterSemester] = useState<string>('Semua');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [filterJenjang, setFilterJenjang] = useState<string>('Semua');
  const [filterMetode, setFilterMetode] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Print popup state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Helper formatting currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Extract unique filter items
  const availableYears = getAvailableAcademicYears(tagihanList);
  const availableCategories = Array.from(
    new Set(tagihanList.filter(t => t.namaJenis).map(t => t.namaJenis as string))
  ).sort();
  const availableMethods = Array.from(
    new Set(logList.map(l => l.metodeBayar))
  ).sort();

  // Helper matching log with its tagihan info
  const enrichedLogs = logList.map(log => {
    const associatedTagihan = tagihanList.find(t => t.idTagihan === log.idTagihan);
    const associatedSiswa = siswaList.find(s => s.nisn === log.nisn);
    
    // Get TA/Semester based on the billing's month-year
    const { tahunAjaran, semester } = getAcademicYearAndSemester(
      associatedTagihan?.bulanTahun || '07-2026'
    );

    return {
      ...log,
      jenjang: associatedSiswa?.jenjang || associatedTagihan?.idTagihan?.includes('-SMP-') ? 'SMP' : 'SMA',
      kelas: associatedSiswa?.kelas || 'N/A',
      kategori: associatedTagihan?.namaJenis || 'SPP Bulanan',
      tahunAjaran,
      semester,
      bulanTahun: associatedTagihan?.bulanTahun || 'N/A'
    };
  });

  // Filter logs based on selection
  const filteredLogs = enrichedLogs.filter(log => {
    const matchesTahunAjaran = filterTahunAjaran === 'Semua' || log.tahunAjaran === filterTahunAjaran;
    const matchesSemester = filterSemester === 'Semua' || log.semester === filterSemester;
    const matchesKategori = filterKategori === 'Semua' || log.kategori === filterKategori;
    const matchesJenjang = filterJenjang === 'Semua' || log.jenjang === filterJenjang;
    const matchesMetode = filterMetode === 'Semua' || log.metodeBayar === filterMetode;

    const matchesSearch = 
      log.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.noKuitansi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.penerima || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTahunAjaran && matchesSemester && matchesKategori && matchesJenjang && matchesMetode && matchesSearch;
  });

  // Consolidated Aggregations
  const totalRevenue = filteredLogs.reduce((sum, log) => sum + log.jumlahBayar, 0);
  const transactionCount = filteredLogs.length;
  const uniqueReceiptsCount = Array.from(new Set(filteredLogs.map(l => l.noKuitansi))).length;

  // Breakdown by Kategori
  const categorySummary = (() => {
    const map: Record<string, number> = {};
    filteredLogs.forEach(log => {
      map[log.kategori] = (map[log.kategori] || 0) + log.jumlahBayar;
    });
    return Object.entries(map).map(([kategori, total]) => ({
      kategori,
      total,
      percent: totalRevenue > 0 ? (total / totalRevenue) * 100 : 0
    })).sort((a, b) => b.total - a.total);
  })();

  // Breakdown by Jenjang / Kelas
  const levelSummary = (() => {
    const map: Record<string, number> = {};
    filteredLogs.forEach(log => {
      const label = `${log.jenjang} - Kelas ${log.kelas}`;
      map[label] = (map[label] || 0) + log.jumlahBayar;
    });
    return Object.entries(map).map(([label, total]) => ({
      label,
      total,
      percent: totalRevenue > 0 ? (total / totalRevenue) * 100 : 0
    })).sort((a, b) => b.total - a.total);
  })();

  // Breakdown by Metode Pembayaran
  const methodSummary = (() => {
    const map: Record<string, number> = {};
    filteredLogs.forEach(log => {
      map[log.metodeBayar] = (map[log.metodeBayar] || 0) + log.jumlahBayar;
    });
    return Object.entries(map).map(([metode, total]) => ({
      metode,
      total,
      percent: totalRevenue > 0 ? (total / totalRevenue) * 100 : 0
    })).sort((a, b) => b.total - a.total);
  })();

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            Rekapitasi Penerimaan Keuangan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Menu audit internal, filter setoran, dan penyusunan laporan penerimaan cetak siap serah bendahara.
          </p>
        </div>

        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100 cursor-pointer border border-indigo-700/40"
        >
          <Printer className="w-4 h-4" />
          Cetak Rekapitasi ({filteredLogs.length} Transaksi)
        </button>
      </div>

      {/* Filter Options Widget */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-4">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-sans">
          Parameter Filter Pembukuan
        </span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Filter TA */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Tahun Ajaran
            </label>
            <select
              value={filterTahunAjaran}
              onChange={(e) => setFilterTahunAjaran(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold text-slate-705 p-2 rounded focus:outline-hidden transition-colors"
            >
              <option value="Semua">Semua TA</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>TA {yr}</option>
              ))}
            </select>
          </div>

          {/* Filter Semester */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              Semester
            </label>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold text-slate-705 p-2 rounded focus:outline-hidden transition-colors"
            >
              <option value="Semua font-semibold">Semua Semester</option>
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>

          {/* Filter Jenis Tagihan */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              Kategori Tagihan
            </label>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold text-slate-705 p-2 rounded focus:outline-hidden transition-colors"
            >
              <option value="Semua">Semua Kategori</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Filter Jenjang */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <School className="w-3 h-3 text-slate-400" />
              Jenjang Siswa
            </label>
            <select
              value={filterJenjang}
              onChange={(e) => setFilterJenjang(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold text-slate-705 p-2 rounded focus:outline-hidden transition-colors"
            >
              <option value="Semua">Semua Jenjang</option>
              <option value="SMP">SMP Saja</option>
              <option value="SMA">SMA Saja</option>
            </select>
          </div>

          {/* Filter Metode Bayar */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-slate-400" />
              Metode Bayar
            </label>
            <select
              value={filterMetode}
              onChange={(e) => setFilterMetode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold text-slate-705 p-2 rounded focus:outline-hidden transition-colors"
            >
              <option value="Semua">Semua Metode</option>
              {availableMethods.map(mt => (
                <option key={mt} value={mt}>{mt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative pt-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4 mt-1" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari transaksi berdasarkan No Kuitansi, Nama Siswa, NISN, atau Nama Staff Penerima..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white text-xs py-2 px-9.5 rounded focus:outline-hidden focus:border-slate-300 transition-colors placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Total Setoran Terkumpul</p>
              <h3 className="text-xl font-bold font-mono text-indigo-950 mt-1">{formatRupiah(totalRevenue)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center text-blue-600">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Jumlah Baris Setor</p>
              <h3 className="text-xl font-bold font-mono text-blue-950 mt-1">{transactionCount} Baris</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-150 flex items-center justify-center text-emerald-600">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Kuitansi Unik Terbit</p>
              <h3 className="text-xl font-bold font-mono text-emerald-950 mt-1">{uniqueReceiptsCount} Bundel</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            Penerimaan Berdasarkan Kategori
          </h4>
          <div className="space-y-3.5">
            {categorySummary.length > 0 ? (
              categorySummary.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                      {item.kategori}
                    </span>
                    <span className="font-mono text-slate-900">{formatRupiah(item.total)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex items-center">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.percent}%` }} />
                    <span className="text-[9px] font-bold text-slate-400 ml-2 font-mono">{Math.round(item.percent)}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">Tidak ada data transaksi</p>
            )}
          </div>
        </div>

        {/* Levels Breakdown */}
        <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            Penerimaan Berdasarkan Tingkatan Kelas
          </h4>
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {levelSummary.length > 0 ? (
              levelSummary.slice(0, 5).map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                      {item.label}
                    </span>
                    <span className="font-mono text-slate-900">{formatRupiah(item.total)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex items-center">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.percent}%` }} />
                    <span className="text-[9px] font-bold text-slate-400 ml-2 font-mono">{Math.round(item.percent)}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">Tidak ada data transaksi</p>
            )}
            {levelSummary.length > 5 && (
              <p className="text-[10px] text-slate-400 text-center font-medium italic pt-2 border-t border-slate-50">
                + {levelSummary.length - 5} Tingkatan kelas lainnya...
              </p>
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            Saluran / Metode Setor Pembayaran
          </h4>
          <div className="space-y-3.5">
            {methodSummary.length > 0 ? (
              methodSummary.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      {item.metode}
                    </span>
                    <span className="font-mono text-slate-900">{formatRupiah(item.total)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex items-center">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.percent}%` }} />
                    <span className="text-[9px] font-bold text-slate-400 ml-2 font-mono">{Math.round(item.percent)}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">Tidak ada data transaksi</p>
            )}
          </div>
        </div>

      </div>

      {/* Screen Ledger List Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-2">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">
            Daftar Setor Kas Terbit ({filteredLogs.length} Records)
          </span>
          <div className="text-[10px] font-semibold text-slate-400">
            *Menampilkan transaksi sesuai parameter filter di atas.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-550 uppercase tracking-wider">
                <th className="py-3 px-4">No Kuitansi</th>
                <th className="py-3 px-4">Waktu Setor</th>
                <th className="py-3 px-4">Siswa / NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Item Tagihan</th>
                <th className="py-3 px-4 text-center">Periode</th>
                <th className="py-3 px-4 text-center">Metode</th>
                <th className="py-3 px-4 text-right">Jumlah Setoran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-750 font-medium">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr key={`${log.noKuitansi}-${log.idTagihan}-${idx}`} className="hover:bg-slate-50/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-[10.5px]">{log.noKuitansi}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap text-[10.5px]">{log.tanggal}</td>
                    <td className="py-3 px-4">
                      <p className="font-extrabold text-slate-800 tracking-tight leading-tight">{log.nama}</p>
                      <span className="text-[10px] text-slate-450 font-mono">{log.nisn}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">{log.jenjang} - {log.kelas}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{log.kategori}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">{log.bulanTahun}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 border rounded-full text-[9px] font-extrabold bg-slate-100 border-slate-200 text-slate-600 font-sans uppercase">
                        {log.metodeBayar}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-950 text-xs">
                      {formatRupiah(log.jumlahBayar)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 px-4 text-center text-slate-400 italic">
                    Tidak ditemukan baris setoran keuangan yang cocok dengan filter parameter terpilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL PRINT DIALOG OVERLAY (A4 Printer-optimized letterhead document) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in no-print-backdrop">
          <div className="bg-white border border-slate-300 shadow-2xl rounded w-full max-w-4xl flex flex-col justify-between my-8 animate-fade-in">
            
            {/* Action Header controls (Hidden during print natively) */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Pratinjau Laporan Rekapitulasi (Siap Cetak A4)
                </h4>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-700 font-sans font-bold text-white text-[11px] px-4 py-2.5 rounded flex items-center gap-1.5 uppercase tracking-wider border border-indigo-700/40 cursor-pointer shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Kirim ke Printer (Print)
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="bg-slate-150 hover:bg-slate-200 font-sans font-bold text-slate-700 text-[11px] px-3.5 py-2.5 rounded cursor-pointer uppercase tracking-wider"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable Frame Area (This area is white paper width) */}
            <div className="p-6 md:p-8 overflow-y-auto max-w-full bg-slate-100 flex justify-center flex-1">
              <div className="bg-white border border-slate-300 p-10 w-[210mm] min-h-[297mm] shadow-lg text-black text-[11px] space-y-6 relative font-sans text-left">
                
                {/* 1. KOP SURAT (Letterhead Khas Indonesia) */}
                <div className="flex justify-between items-center border-b-4 border-double border-slate-950 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-base shadow-inner uppercase">
                      {schoolIdentity.logoInitial}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wide leading-tight text-slate-900">
                        {schoolIdentity.namaYayasan}
                      </h3>
                      <h4 className="text-base font-black text-indigo-950 leading-tight">
                        {schoolIdentity.namaSekolah}
                      </h4>
                      <p className="text-[9px] text-slate-550 leading-relaxed font-semibold mt-1">
                        {schoolIdentity.alamat} &bull; Telp: {schoolIdentity.telp} &bull; Email: {schoolIdentity.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right border-l pl-4 border-slate-300 font-mono hidden sm:block">
                    <span className="text-[8px] font-extrabold bg-slate-900 text-white px-2 py-0.5 tracking-widest rounded-sm uppercase whitespace-nowrap">
                      REKAP DOKUMEN
                    </span>
                    <p className="text-[9px] font-bold text-indigo-650 mt-1">LAP-KAS-{new Date().toISOString().substring(2,7).replace('-', '')}</p>
                  </div>
                </div>

                {/* 2. DOKUMEN HEADER & PARAMETERS */}
                <div className="text-center space-y-1">
                  <h2 className="text-sm font-black tracking-wider uppercase text-slate-900 underline">
                    LAPORAN REKAPITULASI PENERIMAAN KAS SEKOLAH
                  </h2>
                  <p className="text-[9.5px] font-bold text-slate-500 whitespace-pre-line leading-relaxed">
                    Tahun Ajaran: {filterTahunAjaran === 'Semua' ? 'Semua TA Berjalan' : `TA ${filterTahunAjaran}`} &bull; 
                    Semester: {filterSemester === 'Semua' ? 'Ganjil & Genap' : `Semester ${filterSemester}`} &bull; 
                    Kategori Tagihan: {filterKategori === 'Semua' ? 'Seluruh Pos Penerimaan' : filterKategori}
                  </p>
                </div>

                {/* 3. CONS_METRICS (Informasi Ringkasan Utama) */}
                <div className="grid grid-cols-4 gap-4 bg-slate-50 border border-slate-300 rounded p-4">
                  <div className="col-span-2 border-r border-slate-200">
                    <span className="text-[8px] tracking-wider uppercase font-extrabold text-slate-400 block">
                      TOTAL PENERIMAAN BERSIH (NET COLLECTION)
                    </span>
                    <p className="text-[15px] font-black font-mono text-emerald-700 tracking-tight mt-1">
                      {formatRupiah(totalRevenue)}
                    </p>
                    <span className="text-[8px] text-slate-500 font-semibold uppercase mt-0.5 block italic leading-none">
                      # {totalRevenue > 0 ? 'Sesuai dengan lampiran rincian kas buku penerimaan' : 'Kas Kosong / Tanpa Mutasi'} #
                    </span>
                  </div>
                  <div className="border-r border-slate-200 pl-2">
                    <span className="text-[8px] tracking-wider uppercase font-extrabold text-slate-400 block">
                      VOLUME TRANSAKSI
                    </span>
                    <p className="text-xs font-extrabold font-mono text-slate-905 mt-1">
                      {transactionCount} Baris Setor
                    </p>
                    <span className="text-[8.5px] text-slate-500 font-semibold block uppercase mt-1">
                      {uniqueReceiptsCount} Bundel Kuitansi
                    </span>
                  </div>
                  <div className="pl-2">
                    <span className="text-[8px] tracking-wider uppercase font-extrabold text-slate-400 block">
                      RATA-RATA TRANSAKSI
                    </span>
                    <p className="text-xs font-bold font-mono text-slate-800 mt-1">
                      {formatRupiah(transactionCount > 0 ? Math.round(totalRevenue / transactionCount) : 0)}
                    </p>
                    <span className="text-[8px] text-slate-500 font-medium block uppercase mt-1">
                      Per Transaksi Siswa
                    </span>
                  </div>
                </div>

                {/* 4. BREAKDOWN TABLES (Sampingan Kategori & Metode) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Print table */}
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-100 text-[8.5px] font-black uppercase text-slate-700 py-1.5 px-3 border-b border-slate-300 font-sans tracking-wide">
                      A. Rincian Penerimaan Berdasarkan Kategori Pos
                    </div>
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-250 text-[8px] font-extrabold text-slate-500 uppercase tracking-tight">
                          <th className="py-1.5 px-3">Nama Pos Kategori</th>
                          <th className="py-1.5 px-3 text-right">Total Sektor</th>
                          <th className="py-1.5 px-3 text-right">Rasio (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {categorySummary.length > 0 ? (
                          categorySummary.map((item, id) => (
                            <tr key={id}>
                              <td className="py-1.5 px-3 font-semibold text-slate-800">{item.kategori}</td>
                              <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-950">{formatRupiah(item.total)}</td>
                              <td className="py-1.5 px-3 text-right font-mono text-slate-500">{Math.round(item.percent)}%</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={3} className="py-2 text-center text-slate-400 italic">Nihil</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Payment Method Print table */}
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-100 text-[8.5px] font-black uppercase text-slate-705 py-1.5 px-3 border-b border-slate-300 font-sans tracking-wide">
                      B. Rincian Penerimaan Berdasarkan Metode Setor
                    </div>
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-250 text-[8px] font-extrabold text-slate-500 uppercase tracking-tight">
                          <th className="py-1.5 px-3">Saluran Pembayaran</th>
                          <th className="py-1.5 px-3 text-right">Total Sektor</th>
                          <th className="py-1.5 px-3 text-right">Rasio (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 font-medium">
                        {methodSummary.length > 0 ? (
                          methodSummary.map((item, id) => (
                            <tr key={id}>
                              <td className="py-1.5 px-3 font-semibold text-slate-800 uppercase">{item.metode}</td>
                              <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-950">{formatRupiah(item.total)}</td>
                              <td className="py-1.5 px-3 text-right font-mono text-slate-500">{Math.round(item.percent)}%</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={3} className="py-2 text-center text-slate-400 italic">Nihil</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5. LEDGER DETAILS (Daftar rincian kuitansi berjalan) */}
                <div className="space-y-1.5">
                  <span className="text-[8.5px] font-extrabold tracking-wide uppercase text-slate-400 block font-sans">
                    C. Lampiran Rincian Buku Kas Buku Pembantu Penerimaan (Transaksi Terkait):
                  </span>
                  
                  <div className="border border-slate-350 rounded overflow-hidden">
                    <table className="w-full text-left text-[9.5px] border-collapse leading-tight">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-350 text-[7px] font-extrabold text-slate-600 uppercase tracking-wider">
                          <th className="p-2 text-center">No</th>
                          <th className="p-2">No Kuitansi</th>
                          <th className="p-2">Waktu Sektor</th>
                          <th className="p-2">Siswa / NISN</th>
                          <th className="p-2">Kelas</th>
                          <th className="p-2">Keterangan Tagihan</th>
                          <th className="p-2 text-center">Metode</th>
                          <th className="p-2 text-right">Rupiah Sektor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-205 font-medium">
                        {filteredLogs.slice(0, 45).map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 text-center text-slate-400 font-mono text-[8px]">{idx + 1}</td>
                            <td className="p-2 font-mono font-bold text-slate-900 text-[8.5px]">{log.noKuitansi}</td>
                            <td className="p-2 text-[8px] font-mono whitespace-nowrap text-slate-550">{log.tanggal}</td>
                            <td className="p-2 text-slate-900 font-extrabold">
                              {log.nama} <span className="text-[7.5px] text-slate-400 block font-mono">{log.nisn}</span>
                            </td>
                            <td className="p-2 font-semibold text-slate-600">{log.jenjang} &bull; {log.kelas}</td>
                            <td className="p-2 text-slate-550 italic text-[9px]">
                              {log.kategori} ({log.bulanTahun})
                            </td>
                            <td className="p-2 text-center text-[7.5px] uppercase font-mono">{log.metodeBayar}</td>
                            <td className="p-2 text-right font-mono font-bold text-slate-900">
                              {formatRupiah(log.jumlahBayar)}
                            </td>
                          </tr>
                        ))}
                        {filteredLogs.length > 45 && (
                          <tr className="bg-slate-50">
                            <td colSpan={8} className="p-2 text-center italic text-slate-500 font-bold font-sans text-[9px]">
                              *Data dibatasi hingga 45 baris teratas demi tata letak A4 yang rapi. Terdapat total {filteredLogs.length - 45} transaksi lainnya tidak tertera pada kertas pengesahan ini.
                            </td>
                          </tr>
                        )}
                        <tr className="bg-slate-100 font-bold border-t border-slate-350">
                          <td colSpan={7} className="p-2.5 text-right font-sans text-[8px] tracking-widest uppercase text-slate-650">
                            TOTAL PENERIMAAN KAS TERPADU
                          </td>
                          <td className="p-2.5 text-right font-mono text-[11px] font-black text-slate-950">
                            {formatRupiah(totalRevenue)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. SIGNATURE CO-SIGN BLOCK */}
                <div className="pt-10 grid grid-cols-3 gap-6 text-[10.5px]">
                  <div className="text-left flex flex-col justify-between h-[95px] pl-2 border-l border-dashed border-slate-205">
                    <div>
                      <p className="text-[9px] text-slate-450 font-medium">Disiapkan Oleh,</p>
                      <p className="font-bold text-slate-800 mt-0.5">Kasir Penerima (TATA USAHA)</p>
                    </div>
                    <div className="border-t border-slate-950 pt-1.5 w-44">
                      <p className="font-extrabold text-slate-900">{filteredLogs[0]?.penerima || adminSettings.namaKasirDefault}</p>
                      <p className="text-[8px] text-slate-450 uppercase font-mono tracking-wider">Pelaksana Harian Kasir</p>
                    </div>
                  </div>

                  <div className="text-left flex flex-col justify-between h-[95px] pl-2 border-l border-dashed border-slate-205">
                    <div>
                      <p className="text-[9px] text-slate-450 font-medium">Mengetahui & Memverifikasi,</p>
                      <p className="font-bold text-slate-800 mt-0.5">Bendahara Sekolah</p>
                    </div>
                    <div className="border-t border-slate-950 pt-1.5 w-44">
                      <p className="font-extrabold text-slate-900">{adminSettings.namaBendahara}</p>
                      <p className="text-[8px] text-slate-450 uppercase font-mono tracking-wider">{adminSettings.nipBendahara}</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-between items-end h-[95px] pr-2">
                    <div>
                      <p className="text-[9px] text-slate-450 font-medium">{schoolIdentity.alamat.split(',')[1]?.trim() || 'Jakarta'}, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                      <p className="font-bold text-slate-800 mt-0.5">Mengesahkan (KEPALA SEKOLAH),</p>
                    </div>
                    <div className="border-t border-slate-950 pt-1.5 w-44 text-right">
                      <p className="font-extrabold text-slate-900">{adminSettings.namaKepsek}</p>
                      <p className="text-[8px] text-slate-455 uppercase font-mono tracking-wider">{adminSettings.nipKepsek}</p>
                    </div>
                  </div>
                </div>

                {/* Print system print tags */}
                <div className="border-t border-dashed border-slate-250 pt-4 text-[8.5px] text-slate-400 leading-relaxed italic flex items-center justify-between">
                  <p>*Laporan Rekapitulasi ini dihasilkan secara digital oleh SchoolPay Pro menggunakan modul integrasi Google Sheets Apps Script.</p>
                  <p className="font-mono not-italic text-[8px] font-bold text-slate-400">CETAKAN: {new Date().toISOString().substring(11, 19)} UTC</p>
                </div>

              </div>
            </div>

            {/* Hint Banner bottom */}
            <div className="p-4 border-t border-slate-200 text-slate-500 text-xs bg-slate-50 rounded-b italic text-center font-medium no-print">
              *Gunakan tombol <strong>"Kirim ke Printer"</strong> di kanan atas untuk mencetak lembar rekapitasi atau mengekspornya langsung ke format PDF.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
