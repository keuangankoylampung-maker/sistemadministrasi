import React, { useState } from 'react';
import { LogPembayaran, Siswa, Tagihan, SchoolIdentity, AdminSettings } from '../types';
import { 
  History, 
  Search, 
  Printer, 
  FileText,
  XCircle
} from 'lucide-react';
import { formatRupiah } from './DashboardOverview';
import { terbilangIndonesian } from './LoketPembayaranTab';

interface LogPembayaranTabProps {
  logList: LogPembayaran[];
  siswaList: Siswa[];
  tagihanList: Tagihan[];
  onDeleteLogEntry?: (kuitansiNo: string) => void;
  onCancelPembayaran?: (noKuitansi: string) => boolean;
  schoolIdentity: SchoolIdentity;
  adminSettings: AdminSettings;
}

export default function LogPembayaranTab({
  logList,
  siswaList,
  tagihanList,
  onDeleteLogEntry,
  onCancelPembayaran,
  schoolIdentity,
  adminSettings
}: LogPembayaranTabProps) {
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [metodeFilter, setMetodeFilter] = useState('Semua');
  const [voidKuitansiNo, setVoidKuitansiNo] = useState('');
  
  // Receipt popup reload state
  const [receiptLog, setReceiptLog] = useState<LogPembayaran | null>(null);

  // Filter logs logic
  const filteredLogs = logList.filter(log => {
    const matchesSearch = log.nama.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
                          log.nisn.includes(logSearchQuery) ||
                          log.noKuitansi.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
                          log.penerima.toLowerCase().includes(logSearchQuery.toLowerCase());
    
    const matchesMetode = metodeFilter === 'Semua' || log.metodeBayar === metodeFilter;

    return matchesSearch && matchesMetode;
  });

  const getMethodsList = () => {
    const methods = logList.map(l => l.metodeBayar);
    return ['Semua', ...Array.from(new Set(methods))];
  };

  const handleOpenReprint = (log: LogPembayaran) => {
    setReceiptLog(log);
  };

  const handleDirectVoid = (e: React.FormEvent) => {
    e.preventDefault();
    const query = voidKuitansiNo.trim();
    if (!query) return;
    if (onCancelPembayaran) {
      const res = onCancelPembayaran(query);
      if (res) {
        setVoidKuitansiNo('');
      }
    }
  };

  // Find associated tagihan and student status for the receipt re-print
  const associatedSiswa = receiptLog ? siswaList.find(s => s.nisn === receiptLog.nisn) : null;
  const associatedTagihan = receiptLog ? tagihanList.find(t => t.idTagihan === receiptLog.idTagihan) : null;

  return (
    <div className="space-y-6 text-left">
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Audit Log Pembayaran (Sheet [Log_Pembayaran])
          </h3>
          <p className="text-xs text-slate-505">Mencatat riwayat penerimaan kasir secara kronologis.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Cari Kuitansi, Nama, atau Kasir..."
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded py-2 pl-9 pr-4 text-xs font-semibold focus:outline-hidden focus:border-blue-500 text-slate-705 placeholder-slate-400 font-sans"
            />
          </div>

          <select
            value={metodeFilter}
            onChange={(e) => setMetodeFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500"
          >
            {getMethodsList().map(m => (
              <option key={m} value={m}>{m === 'Semua' ? 'Semua Metode' : m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Pembatalan Kuitansi / Quick Void Card */}
      <div className="bg-rose-50 border border-rose-205 rounded p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in shadow-xs">
        <div className="space-y-1 max-w-2xl text-left">
          <h4 className="text-[11px] font-black text-rose-800 uppercase tracking-widest flex items-center gap-2">
            <XCircle className="w-4.5 h-4.5 text-rose-650" />
            Menu Pembatalan & Koreksi Transaksi (Void Kuitansi)
          </h4>
          <p className="text-[11px] text-rose-700 leading-relaxed font-sans">
            Jika terjadi kesalahan input atau pengetikan nominal saat pembayaran, masukkan atau paste nomor kuitansi di samping untuk membatalkan seluruh transaksi yang terhubung. Sisa tunggakan tagihan siswa akan dipulihkan secara otomatis.
          </p>
        </div>
        <form onSubmit={handleDirectVoid} className="flex gap-2 w-full md:w-auto flex-shrink-0">
          <input
            type="text"
            placeholder="Contoh: KWT-YYYYMMDD-XXXX"
            value={voidKuitansiNo}
            onChange={(e) => setVoidKuitansiNo(e.target.value)}
            className="bg-white border border-rose-300 hover:border-rose-400 rounded py-2 px-3 text-xs font-bold focus:outline-hidden focus:border-rose-500 text-rose-900 placeholder-rose-300 w-full md:w-56 font-mono tracking-widest uppercase shadow-2xs"
            required
          />
          <button
            type="submit"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase px-4 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs border border-rose-700/30 flex-shrink-0"
          >
            <XCircle className="w-3.5 h-3.5" />
            Void Kuitansi
          </button>
        </form>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                <th className="py-4 px-4">No_Kuitansi</th>
                <th className="py-4 px-4">Tanggal Masuk</th>
                <th className="py-4 px-4 font-mono">NISN</th>
                <th className="py-4 px-4">Nama Penyetor</th>
                <th className="py-4 px-4 text-right">Nominal Sektor</th>
                <th className="py-4 px-4 text-center">Metode Bayar</th>
                <th className="py-4 px-4">Penerima (Kasir)</th>
                <th className="py-4 px-4">Keterangan</th>
                <th className="py-4 px-4 text-center">Aksi / Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-705 font-medium">
              {filteredLogs.length > 0 ? (
                [...filteredLogs].sort((a,b) => b.noKuitansi.localeCompare(a.noKuitansi)).map((log, idx) => (
                  <tr key={`${log.noKuitansi}-${log.idTagihan}-${idx}`} className="hover:bg-slate-50/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-[10px]">{log.noKuitansi}</td>
                    <td className="py-3.5 px-4 text-slate-450 text-[11px] font-mono">{log.tanggal}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{log.nisn}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.nama}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">+{formatRupiah(log.jumlahBayar)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                        {log.metodeBayar}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-650 font-bold">{log.penerima}</td>
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-[180px] truncate" title={log.keterangan}>
                      {log.keterangan}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenReprint(log)}
                          className="px-2 py-1 text-[10px] text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded flex items-center gap-1 font-bold uppercase transition-all cursor-pointer shadow-2xs"
                          title="Re-print Kuitansi"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Re-Print</span>
                        </button>
                        
                        {onCancelPembayaran && (
                          <button
                            onClick={() => onCancelPembayaran(log.noKuitansi)}
                            className="px-2 py-1 text-[10px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded flex items-center gap-1 font-bold uppercase transition-all cursor-pointer shadow-2xs"
                            title="Batalkan Seluruh Pembayaran di Kuitansi ini"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Batal</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-405">
                    <History className="w-8 h-8 text-slate-202 mx-auto mb-2" />
                    Belum ada log bukti pembayaran terdaftar atau tidak cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPRINT POPUP DIALOG */}
      {receiptLog && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 animate-fade-in no-print">
          <div className="bg-white border border-slate-200 shadow-2xl rounded w-full max-w-2xl max-h-[92vh] flex flex-col justify-between">
            
            {/* Modal header options */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600 animate-pulse" />
                <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Re-Print Kuitansi Pembayaran</h4>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 font-bold text-white text-[11px] px-3 py-1.5 rounded flex items-center gap-1.5 uppercase tracking-wider border border-blue-700/40 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Cetakan
                </button>
                <button
                  onClick={() => setReceiptLog(null)}
                  className="bg-slate-100 hover:bg-slate-205 font-bold text-slate-700 text-[11px] px-2.5 py-1.5 rounded cursor-pointer uppercase tracking-wider"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Receipt Printable Area */}
            <div className="p-8 overflow-y-auto max-w-full bg-slate-100 flex-1 flex justify-center">
              <div className="bg-white border border-slate-200 p-8 w-[210mm] min-h-[148mm] shadow-lg text-black text-xs space-y-5 relative font-sans text-left">
                                {/* Header Kop */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold bg-slate-900 text-white px-2 py-0.5 tracking-widest rounded-sm uppercase font-mono">Re-Print Copy</span>
                    <h3 className="text-base font-extrabold tracking-tight">{schoolIdentity.namaYayasan}</h3>
                    <p className="text-[10px] leading-relaxed text-slate-600 font-medium">
                      {schoolIdentity.namaSekolah} &bull; {schoolIdentity.alamat}
                      <br />
                      Telp: {schoolIdentity.telp} &bull; Email: {schoolIdentity.email}
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <h2 className="text-lg font-black tracking-widest text-slate-900 leading-none">KUITANSI</h2>
                    <p className="text-[10px] font-bold text-amber-600 mt-2">{receiptLog.noKuitansi}</p>
                  </div>
                </div>

                {/* Metadata Fields Body */}
                <div className="grid grid-cols-6 gap-x-2 gap-y-2.5 pt-1 text-slate-800">
                  <div className="col-span-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wide">Telah Diterima Dari</div>
                  <div className="col-span-4 border-b border-slate-200 pb-0.5 font-bold text-slate-900">: &nbsp; {receiptLog.nama}</div>

                  <div className="col-span-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wide">NISN / Jenjang Kelas</div>
                  <div className="col-span-4 border-b border-slate-200 pb-0.5 font-mono font-bold">: &nbsp; {receiptLog.nisn} &nbsp; (&bull;&nbsp; Kelas {associatedSiswa?.kelas || 'N/A'} {associatedSiswa?.jenjang || 'SMP/SMA'})</div>

                  <div className="col-span-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wide">Metode Pembayaran</div>
                  <div className="col-span-4 border-b border-slate-200 pb-0.5 font-bold">: &nbsp; {receiptLog.metodeBayar}</div>
                </div>

                {/* Detailed Table Breakdown of payments */}
                <div className="border border-slate-300 rounded overflow-hidden mt-4 animate-fade-in">
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 text-[9px] font-extrabold text-slate-600 uppercase tracking-widest">
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Item Tagihan</th>
                        <th className="py-2.5 px-3 text-center">Periode</th>
                        <th className="py-2.5 px-3">Keterangan Detail</th>
                        <th className="py-2.5 px-3 text-right">Rupiah Sektor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {logList.filter(l => l.noKuitansi === receiptLog.noKuitansi).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-[11px]">
                            {tagihanList.find(t => t.idTagihan === row.idTagihan)?.namaJenis || 'SPP Bulanan'}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-medium">{tagihanList.find(t => t.idTagihan === row.idTagihan)?.bulanTahun}</td>
                          <td className="py-2 px-3 text-slate-500 italic text-[10px]">{row.keterangan}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {formatRupiah(row.jumlahBayar)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t border-slate-300">
                        <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-[9px] tracking-widest text-slate-600 font-sans">Total Setoran</td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs font-black text-slate-950">
                          {formatRupiah(logList.filter(l => l.noKuitansi === receiptLog.noKuitansi).reduce((sum, r) => sum + r.jumlahBayar, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="grid grid-cols-6 gap-x-2 pt-1 text-slate-800">
                  <div className="col-span-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wide mt-1">Banyaknya Uang</div>
                  <div className="col-span-4 border-b border-slate-200 pb-1 font-bold bg-slate-55 p-2 rounded italic text-[11px] text-slate-950 border border-slate-200 capitalize leading-tight">
                    : &nbsp; {terbilangIndonesian(logList.filter(l => l.noKuitansi === receiptLog.noKuitansi).reduce((sum, r) => sum + r.jumlahBayar, 0))} Rupiah
                  </div>
                </div>

                {/* Calculations summary and Signatures */}
                <div className="pt-4 grid grid-cols-2 gap-4">
                  
                  {/* Left Bottom corner: Remaining Outstanding reminder list */}
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Sisa Pembukuan Terkait:</p>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[10.5px] leading-relaxed">
                      {tagihanList.filter(t => t.nisn === receiptLog.nisn && t.status !== 'Lunas').length > 0 ? (
                        <div className="space-y-1">
                          <p className="font-bold text-amber-700">Terdapat Sisa Tunggakan Lain:</p>
                          <ul className="list-disc pl-4 text-slate-600 font-medium">
                            {tagihanList
                              .filter(t => t.nisn === receiptLog.nisn && t.status !== 'Lunas')
                              .slice(0, 3)
                              .map((t, i) => (
                                <li key={i}>{t.namaJenis || 'SPP'} ({t.bulanTahun}): <span className="font-mono">{formatRupiah(t.sisaTunggakan)}</span></li>
                              ))
                            }
                            {tagihanList.filter(t => t.nisn === receiptLog.nisn && t.status !== 'Lunas').length > 3 && (
                              <li>...dan {tagihanList.filter(t => t.nisn === receiptLog.nisn && t.status !== 'Lunas').length - 3} tagihan lainnya.</li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-emerald-705 font-extrabold flex items-center gap-1">
                          ✓ DISK GOLONGAN LUNAS SEPENUHNYA!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Bottom corner: Staff TU kasir */}
                  <div className="text-right flex flex-col justify-between items-end h-[95px] pr-2">
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">Jakarta, {receiptLog.tanggal.split(' ')[0]}</p>
                      <p className="text-[10px] font-bold text-slate-800 mt-0.5">Kasir Penerima,</p>
                    </div>
                    <div className="border-t border-dashed border-slate-300 pt-1.5 w-44">
                      <p className="font-extrabold text-slate-900 text-[11px]">{receiptLog.penerima}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Bendahara Keuangan</p>
                    </div>
                  </div>

                </div>

                {/* Footer Notes Disclaimer */}
                <div className="border-t border-dashed border-slate-200 pt-3 text-[9px] text-slate-400 leading-relaxed italic flex items-center justify-between">
                  <p>*Kuitansi ini dicetak ulang dari arsip digital basis data utama {schoolIdentity.namaSekolah}.<br />Sah digunakan sebagai rujukan pelunasan.</p>
                  <p className="font-mono not-italic text-[10px] font-bold text-slate-300 font-mono text-slate-400">RE-PRINT ID: {receiptLog.noKuitansi}</p>
                </div>

              </div>
            </div>

            {/* Tip Banner bottom */}
            <div className="p-4 border-t border-slate-200 text-slate-500 text-[11px] bg-slate-50 rounded-b italic text-center font-medium">
              *Dokumen salinan kuitansi ini identik dengan aslinya dan siap dicetak kembali.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
