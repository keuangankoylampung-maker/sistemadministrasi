import React, { useState, useEffect } from 'react';
import { Siswa, Tagihan, LogPembayaran, SchoolIdentity, AdminSettings } from '../types';
import { getAcademicYearAndSemester } from '../utils/schoolYear';
import { 
  Users, 
  Search, 
  CreditCard, 
  CheckCircle2, 
  FileText, 
  AlertCircle,
  Printer,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { formatRupiah } from './DashboardOverview';

interface LoketPembayaranTabProps {
  siswaList: Siswa[];
  tagihanList: Tagihan[];
  onCommitPembayaran: (pembayaran: {
    nisn: string;
    metodeBayar: string;
    penerima: string;
    keteranganUtama: string;
    itemBayar: Array<{
      idTagihan: string;
      jumlahBayar: number;
      keterangan: string;
    }>;
    tanggalManual?: string;
  }) => { success: boolean; noKuitansi: string; kuitansis: LogPembayaran[] } | null;
  activeNisnSiswaSelection?: string; 
  schoolIdentity: SchoolIdentity;
  adminSettings: AdminSettings;
}

// Terbilang Rupiah Helper
export const terbilangIndonesian = (angka: number): string => {
  const bilangan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  let temp = "";
  
  if (angka < 0) {
    return "Minus " + terbilangIndonesian(Math.abs(angka));
  }
  
  if (angka < 12) {
    temp = " " + bilangan[angka];
  } else if (angka < 20) {
    temp = terbilangIndonesian(angka - 10) + " Belas";
  } else if (angka < 100) {
    temp = terbilangIndonesian(Math.floor(angka / 10)) + " Puluh" + terbilangIndonesian(angka % 10);
  } else if (angka < 200) {
    temp = " Seratus" + terbilangIndonesian(angka - 100);
  } else if (angka < 1000) {
    temp = terbilangIndonesian(Math.floor(angka / 100)) + " Ratus" + terbilangIndonesian(angka % 100);
  } else if (angka < 2000) {
    temp = " Seribu" + terbilangIndonesian(angka - 1000);
  } else if (angka < 1000000) {
    temp = terbilangIndonesian(Math.floor(angka / 1000)) + " Ribu" + terbilangIndonesian(angka % 1000);
  } else if (angka < 1000000000) {
    temp = terbilangIndonesian(Math.floor(angka / 1000000)) + " Juta" + terbilangIndonesian(angka % 1000000);
  }
  return temp.trim();
};

export default function LoketPembayaranTab({
  siswaList,
  tagihanList,
  onCommitPembayaran,
  activeNisnSiswaSelection,
  schoolIdentity,
  adminSettings
}: LoketPembayaranTabProps) {
  // States
  const [deskSearchQuery, setDeskSearchQuery] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  
  // Payment Form Multi-state Trackers
  const [selectedTagihanMap, setSelectedTagihanMap] = useState<Record<string, boolean>>({});
  const [paymentAmountsMap, setPaymentAmountsMap] = useState<Record<string, number>>({});
  const [paymentKeterangansMap, setPaymentKeterangansMap] = useState<Record<string, string>>({});

  const [metodeBayar, setMetodeBayar] = useState('Tunai');
  const [penerima, setPenerima] = useState(adminSettings?.namaKasirDefault || 'Pak Mulyono (Staff TU)');
  const [keterangan, setKeterangan] = useState('');
  const [errorText, setErrorText] = useState('');

  // Helper to get local date-time string in YYYY-MM-DDTHH:mm format
  const getLocalDateTimeString = () => {
    const d = new Date();
    const tzoffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [tanggalBayarManual, setTanggalBayarManual] = useState(getLocalDateTimeString());

  // Update default receiver if changed in settings
  useEffect(() => {
    if (adminSettings?.namaKasirDefault) {
      setPenerima(adminSettings.namaKasirDefault);
    }
  }, [adminSettings?.namaKasirDefault]);

  // Receipt Modal Pop-up State
  const [activeReceipts, setActiveReceipts] = useState<LogPembayaran[]>([]);

  // Auto select student if navigated from dashboard
  useEffect(() => {
    if (activeNisnSiswaSelection) {
      const parentSelect = siswaList.find(s => s.nisn === activeNisnSiswaSelection);
      if (parentSelect) {
        handleSelectSiswa(parentSelect);
      }
    }
  }, [activeNisnSiswaSelection, siswaList]);

  // Handle student selections
  const handleSelectSiswa = (s: Siswa) => {
    setSelectedSiswa(s);
    // Find outstanding bills
    const unresolved = tagihanList.filter(t => t.nisn === s.nisn && t.status !== 'Lunas');
    
    const initialMap: Record<string, boolean> = {};
    const initialAmounts: Record<string, number> = {};
    const initialKeterangans: Record<string, string> = {};
    
    unresolved.forEach(t => {
      initialMap[t.idTagihan] = true;
      initialAmounts[t.idTagihan] = t.sisaTunggakan;
      initialKeterangans[t.idTagihan] = `Pembayaran ${t.namaJenis || 'SPP'} Periode ${t.bulanTahun}`;
    });
    
    setSelectedTagihanMap(initialMap);
    setPaymentAmountsMap(initialAmounts);
    setPaymentKeterangansMap(initialKeterangans);
    setKeterangan('');
    setErrorText('');
  };

  const handleToggleTagihan = (idTagihan: string) => {
    setSelectedTagihanMap(prev => ({
      ...prev,
      [idTagihan]: !prev[idTagihan]
    }));
  };

  const handleAmountChange = (idTagihan: string, val: number) => {
    setPaymentAmountsMap(prev => ({
      ...prev,
      [idTagihan]: val
    }));
  };

  const handleKeteranganChange = (idTagihan: string, val: string) => {
    setPaymentKeterangansMap(prev => ({
      ...prev,
      [idTagihan]: val
    }));
  };

  const handleSelectAll = () => {
    if (!selectedSiswa) return;
    const unresolved = tagihanList.filter(t => t.nisn === selectedSiswa.nisn && t.status !== 'Lunas');
    const updatedMap: Record<string, boolean> = {};
    unresolved.forEach(t => {
      updatedMap[t.idTagihan] = true;
    });
    setSelectedTagihanMap(updatedMap);
  };

  const handleClearAll = () => {
    setSelectedTagihanMap({});
  };

  const handleProcess = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!selectedSiswa) {
      setErrorText('Silakan pilih siswa terlebih dahulu.');
      return;
    }

    const activeOutstanding = tagihanList.filter(t => t.nisn === selectedSiswa.nisn && t.status !== 'Lunas');
    const itemsToCommit = activeOutstanding.filter(t => selectedTagihanMap[t.idTagihan])
      .map(t => {
        const amt = paymentAmountsMap[t.idTagihan] ?? 0;
        const ket = paymentKeterangansMap[t.idTagihan] || `Pembayaran ${t.namaJenis || 'SPP'} Periode ${t.bulanTahun}`;
        return {
          idTagihan: t.idTagihan,
          jumlahBayar: amt,
          keterangan: ket,
          originalRow: t
        };
      });

    if (itemsToCommit.length === 0) {
      setErrorText('Silakan pilih minimal satu jenis tagihan tunggakan untuk diproses.');
      return;
    }

    // Validation
    for (const item of itemsToCommit) {
      if (item.jumlahBayar <= 0) {
        setErrorText(`Nominal pembayaran untuk ${item.originalRow.namaJenis || 'SPP'} (${item.originalRow.bulanTahun}) harus bernilai lebih dari Rp 0.`);
        return;
      }
      if (item.jumlahBayar > item.originalRow.sisaTunggakan) {
        setErrorText(`Kelebihan nominal pembayaran! Pembayaran ${item.originalRow.namaJenis || 'SPP'} (${item.originalRow.bulanTahun}) melebihi sisa tunggakan ${formatRupiah(item.originalRow.sisaTunggakan)}.`);
        return;
      }
    }

    const formattedTanggalManual = tanggalBayarManual ? tanggalBayarManual.replace('T', ' ') + ':00' : undefined;

    const res = onCommitPembayaran({
      nisn: selectedSiswa.nisn,
      metodeBayar,
      penerima,
      keteranganUtama: keterangan || `Pembayaran Tagihan Massal Siswa ${selectedSiswa.nama}`,
      itemBayar: itemsToCommit.map(item => ({
        idTagihan: item.idTagihan,
        jumlahBayar: item.jumlahBayar,
        keterangan: item.keterangan
      })),
      tanggalManual: formattedTanggalManual
    });

    if (res && res.success) {
      // Trigger receipt layout
      setActiveReceipts(res.kuitansis);

      // Refresh states for selected student
      const refreshedSiswa = siswaList.find(s => s.nisn === selectedSiswa.nisn);
      if (refreshedSiswa) {
        handleSelectSiswa(refreshedSiswa);
      } else {
        setSelectedSiswa(null);
      }
    }
  };

  // Active student list filtering
  const matchingSiswa = siswaList.filter(s => {
    if (!deskSearchQuery.trim()) return false;
    return s.nama.toLowerCase().includes(deskSearchQuery.toLowerCase()) || 
           s.nisn.includes(deskSearchQuery);
  });

  const activeSiswaTagihanOutstanding = selectedSiswa 
    ? tagihanList.filter(t => t.nisn === selectedSiswa.nisn && t.status !== 'Lunas')
    : [];

  return (
    <div className="space-y-6 text-left">
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Student search and list */}
        <div className="lg:col-span-2 bg-white rounded border border-slate-200 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Cari Profil Siswa</h3>
            <p className="text-xs text-slate-500">Mulai transaksi loket dengan mencari NISN atau nama siswa.</p>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Masukkan Nama / NISN Siswa..."
              value={deskSearchQuery}
              onChange={(e) => setDeskSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded py-2.5 pl-9 pr-4 text-xs font-semibold focus:outline-hidden focus:border-blue-500 transition-all text-slate-705 placeholder-slate-400 font-sans"
            />
          </div>

          {/* Matches List */}
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
            {matchingSiswa.length > 0 ? (
              matchingSiswa.map(s => (
                <button
                  key={s.nisn}
                  onClick={() => handleSelectSiswa(s)}
                  className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all cursor-pointer ${
                    selectedSiswa?.nisn === s.nisn
                      ? 'bg-blue-50 border-blue-300 shadow-xs'
                      : 'bg-white border-slate-150 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded bg-slate-100 font-bold text-[10px] text-slate-700 flex items-center justify-center font-mono border border-slate-200">
                      {s.jenjang}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-850 truncate">{s.nama}</p>
                      <p className="text-[10px] text-slate-450 font-mono mt-0.5">NISN: {s.nisn} • Kelas {s.kelas}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-450" />
                </button>
              ))
            ) : deskSearchQuery ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Tidak ada siswa yang cocok.
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded">
                <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                Ketik nama atau NISN pada kolom pencarian di atas untuk memproses pembayaran kuitansi.
              </div>
            )}
          </div>

          {/* Selected Siswa Details Sheet Card */}
          {selectedSiswa && (
            <div className="bg-slate-50 rounded p-4 border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <ShieldCheck className="w-4 h-4 text-blue-650" />
                Daftar Profil Siswa Aktif
              </h4>
              <div className="space-y-1.5 font-medium text-slate-650">
                <p>Nama: <span className="font-bold text-slate-900">{selectedSiswa.nama}</span></p>
                <p>Jenjang/Kelas: <span className="font-bold text-slate-850">{selectedSiswa.jenjang} / Kelas {selectedSiswa.kelas}</span></p>
                <div className="border-t border-slate-200 mt-2 pt-2 space-y-1">
                  <p className="flex justify-between"><span>Tarif SPP Dasar:</span> <span className="font-semibold text-slate-800 font-mono">{formatRupiah(selectedSiswa.tarifSpp)}</span></p>
                  {selectedSiswa.potonganBeasiswa > 0 && (
                    <p className="text-amber-600 font-bold">Potongan Beasiswa: {selectedSiswa.potonganBeasiswa}% ({selectedSiswa.catatan || 'Beasiswa'})</p>
                  )}
                  <p className="flex justify-between items-center bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-105 font-bold">
                    <span>Harga SPP Bersih:</span> 
                    <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">{formatRupiah(Math.round(selectedSiswa.tarifSpp * (1 - (selectedSiswa.potonganBeasiswa / 105))))}</span>
                  </p>
                  <p className="flex justify-between mt-1 pt-1 border-t border-slate-200/50"><span>Tarif Uang Gedung:</span> <span className="font-semibold text-slate-850 font-mono">{formatRupiah(selectedSiswa.tarifUangGedung)}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>        {/* Right Column: Multi-billing active select and transaction form */}
        <div className="lg:col-span-3 bg-white rounded border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <form onSubmit={handleProcess} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Formulir Transaksi Multi-Tagihan (1 Kuitansi)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Dapat memproses beberapa jenis tagihan secara berbarengan dalam satu pembayaran.</p>
              </div>
              
              {selectedSiswa && activeSiswaTagihanOutstanding.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    Pilih Semua
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    Bersihkan Pilihan
                  </button>
                </div>
              )}
            </div>

            {errorText && (
              <div className="p-3 bg-rose-50 text-rose-600 rounded border border-rose-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <p>{errorText}</p>
              </div>
            )}

            {selectedSiswa ? (
              activeSiswaTagihanOutstanding.length > 0 ? (
                <div className="space-y-5">
                  
                  {/* MULTI-BILL CHECKLIST CONTAINER */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">Daftar Tagihan Berjalan (Pilih yg ingin dibayar)</label>
                    <div className="border border-slate-200 rounded divide-y divide-slate-100 max-h-[350px] overflow-y-auto bg-slate-50/50">
                      {(() => {
                        const groupsMap: Record<string, {
                          tahunAjaran: string;
                          semester: 'Ganjil' | 'Genap';
                          items: typeof activeSiswaTagihanOutstanding;
                        }> = {};

                        activeSiswaTagihanOutstanding.forEach(t => {
                          const { tahunAjaran, semester } = getAcademicYearAndSemester(t.bulanTahun);
                          const key = `${tahunAjaran}-${semester}`;
                          if (!groupsMap[key]) {
                            groupsMap[key] = { tahunAjaran, semester, items: [] };
                          }
                          groupsMap[key].items.push(t);
                        });

                        const sortedGroupKeys = Object.keys(groupsMap).sort((a, b) => a.localeCompare(b));

                        return sortedGroupKeys.map(key => {
                          const group = groupsMap[key];
                          return (
                            <div key={key} className="space-y-0.5">
                              <div className="bg-slate-100 text-slate-705 px-4 py-1.5 border-y border-slate-250/60 sticky top-0 z-10 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wide font-sans">
                                <span className="flex items-center gap-1.5">
                                  <span>Tahun Ajaran:</span>
                                  <strong className="text-blue-700 font-bold">{group.tahunAjaran}</strong>
                                </span>
                                <span className="bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 rounded text-[8px] font-bold">
                                  SEM. {group.semester.toUpperCase()}
                                </span>
                              </div>
                              <div className="divide-y divide-slate-100">
                                {group.items.map(t => {
                                  const isChecked = !!selectedTagihanMap[t.idTagihan];
                                  const currentAmount = paymentAmountsMap[t.idTagihan] ?? 0;
                                  const currentKet = paymentKeterangansMap[t.idTagihan] || '';

                                  return (
                                    <div key={t.idTagihan} className={`p-4 transition-colors ${isChecked ? 'bg-blue-50/20' : 'bg-transparent text-slate-550'}`}>
                                      <div className="flex items-start gap-3">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => handleToggleTagihan(t.idTagihan)}
                                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 mt-0.5 cursor-pointer"
                                        />
                                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                                          
                                          <div className="min-w-0 md:col-span-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span className="font-extrabold text-slate-900 font-mono text-xs">
                                                Periode {t.bulanTahun}
                                              </span>
                                              <span className="bg-slate-200/80 text-slate-700 font-bold border border-slate-300 text-[9px] py-0.5 px-1.5 rounded uppercase tracking-wide">
                                                {t.idJenis || 'SPP'}
                                              </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1">
                                              Tunggakan: <strong className="font-semibold text-slate-800 font-mono">{formatRupiah(t.sisaTunggakan)}</strong>
                                              {t.jumlahBayar > 0 && <span className="text-amber-600 ml-1">(Dicicil)</span>}
                                            </p>
                                          </div>

                                          {/* INPUT NOMINAL BAYAR UNTUK TAGIHAN INI */}
                                          <div className="md:col-span-2 space-y-2">
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] text-slate-400 font-bold uppercase min-w-[70px]">Nominal Setor:</span>
                                              <div className="relative flex-1">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400 text-[11px] font-bold font-mono">
                                                  Rp
                                                </span>
                                                <input
                                                  type="number"
                                                  min={1}
                                                  disabled={!isChecked}
                                                  value={currentAmount === 0 ? '' : currentAmount}
                                                  onChange={(e) => handleAmountChange(t.idTagihan, Number(e.target.value))}
                                                  placeholder="Nominal bayar..."
                                                  className={`w-full border rounded py-1 pl-7 pr-2.5 text-xs font-bold font-mono focus:outline-hidden focus:border-blue-500 transition-all ${
                                                    isChecked ? 'bg-white border-blue-200 text-blue-700 font-extrabold' : 'bg-slate-100 border-slate-200 text-slate-400'
                                                  }`}
                                                />
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] text-slate-400 font-bold uppercase min-w-[70px]">Keterangan:</span>
                                              <input
                                                type="text"
                                                disabled={!isChecked}
                                                value={currentKet}
                                                onChange={(e) => handleKeteranganChange(t.idTagihan, e.target.value)}
                                                placeholder="Keterangan item..."
                                                className={`w-full border rounded py-1 px-2.5 text-xs font-medium focus:outline-hidden focus:border-blue-500 transition-all ${
                                                  isChecked ? 'bg-white border-blue-100 text-slate-700' : 'bg-slate-100 border-slate-200 text-slate-400'
                                                }`}
                                              />
                                            </div>
                                          </div>

                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* SETTINGS FOR THE TRANSACTION */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">Metode Pembayaran</label>
                      <select
                        value={metodeBayar}
                        onChange={(e) => setMetodeBayar(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Tunai">Tunai (Kas Kasir)</option>
                        <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                        <option value="Transfer Bank BNI">Transfer Bank BNI</option>
                        <option value="Transfer Bank BRI">Transfer Bank BRI</option>
                        <option value="Potongan Kas Tabungan">Klaim Kas Tabungan</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">Penerima (Kasir TU)</label>
                      <select
                        value={penerima}
                        onChange={(e) => setPenerima(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                      >
                        {adminSettings?.daftarKasir && adminSettings.daftarKasir.length > 0 ? (
                          adminSettings.daftarKasir.map((kasirName) => (
                            <option key={kasirName} value={kasirName}>
                              {kasirName}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Ibu Hartati (Bendahara)">Ibu Hartati (Bendahara)</option>
                            <option value="Pak Mulyono (Staff TU)">Pak Mulyono (Staff TU)</option>
                            <option value="Pak Sukandar (Sekretaris)">Pak Sukandar (Sekretaris)</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">📅 Tanggal Transaksi (Manual)</label>
                      <input
                        type="datetime-local"
                        value={tanggalBayarManual}
                        onChange={(e) => setTanggalBayarManual(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">Keterangan Umum Kuitansi (Opsional)</label>
                    <input
                      type="text"
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      placeholder="Contoh: Pelunasan SPP & uang ujian masuk dsb..."
                      className="w-full bg-slate-50 border border-slate-205 rounded py-2 px-3 text-xs font-semibold text-slate-705 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {/* DYNAMIC CALCULATOR TOTAL FEEDBACK */}
                  {activeSiswaTagihanOutstanding.filter(t => selectedTagihanMap[t.idTagihan]).length > 0 && (
                    <div className="bg-slate-900 text-white p-4.5 rounded border border-slate-800 space-y-2 animate-fade-in font-sans">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Transaksi Saat Ini:</span>
                        <span className="text-xl font-mono font-black text-emerald-400">
                          {formatRupiah(
                            activeSiswaTagihanOutstanding
                              .filter(t => selectedTagihanMap[t.idTagihan])
                              .reduce((sum, t) => sum + (paymentAmountsMap[t.idTagihan] ?? 0), 0)
                          )}
                        </span>
                      </div>
                      <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-350 italic capitalize leading-normal">
                        Terbilang: <strong>{terbilangIndonesian(
                          activeSiswaTagihanOutstanding
                            .filter(t => selectedTagihanMap[t.idTagihan])
                            .reduce((sum, t) => sum + (paymentAmountsMap[t.idTagihan] ?? 0), 0)
                        )} Rupiah</strong>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-emerald-50 rounded p-4 text-emerald-700 border border-emerald-250 text-xs text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold uppercase tracking-wide text-[10px]">Siswa Bebas Tunggakan!</p>
                  <p className="mt-1 text-slate-600">
                    Seluruh tagihan bulanan untuk siswa <strong>{selectedSiswa.nama}</strong> sudah berstatus <strong>LUNAS</strong>.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-24 text-slate-400 text-xs border border-dashed border-slate-200 rounded">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                <p className="font-bold">Kasir Desk Siap Melayani</p>
                <p className="mt-1 text-slate-500">Silakan pilih nama siswa terlebih dahulu pada menu panel pencarian sebelah kiri.</p>
              </div>
            )}

            {/* BUTTON ACTION */}
            {selectedSiswa && activeSiswaTagihanOutstanding.length > 0 && (
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition duration-150 uppercase tracking-wider border border-blue-700/40 cursor-pointer shadow-md shadow-blue-100"
              >
                Proses Transaksi & Cetak Kuitansi Bersama ({activeSiswaTagihanOutstanding.filter(t => selectedTagihanMap[t.idTagihan]).length} Tagihan)
              </button>
            )}
          </form>
        </div>
        
      </div>

      {/* OFFICIAL KUITANSI DIALOG (Print-ready pop up with multi block breakdown) */}
      {activeReceipts.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 animate-fade-in no-print">
          <div className="bg-white border border-slate-200 shadow-2xl rounded w-full max-w-2xl max-h-[92vh] flex flex-col justify-between">
            
            {/* Modal header options */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Pratinjau Kuitansi Digital Resmi (Google Docs Template)</h4>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-[11px] px-3.5 py-2 rounded flex items-center gap-1.5 uppercase tracking-wider border border-indigo-700/40 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Kuitansi
                </button>
                <button
                  onClick={() => setActiveReceipts([])}
                  className="bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-[11px] px-3 py-2 rounded cursor-pointer uppercase tracking-wider"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Receipt Printable Area */}
            <div className="p-6 overflow-y-auto max-w-full bg-slate-100 flex-1 flex justify-center">
              <div className="bg-white border border-slate-200 p-8 w-[210mm] min-h-[148mm] shadow-lg text-black text-xs space-y-5 relative font-sans text-left">
                
                {/* Header Kop */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold bg-slate-900 text-white px-2 py-0.5 tracking-widest rounded-sm uppercase">Official Document</span>
                    <h3 className="text-base font-extrabold tracking-tight">{schoolIdentity.namaYayasan}</h3>
                    <p className="text-[10px] leading-relaxed text-slate-600 font-medium">
                      {schoolIdentity.namaSekolah} &bull; {schoolIdentity.alamat}
                      <br />
                      Telp: {schoolIdentity.telp} &bull; Email: {schoolIdentity.email}
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <h2 className="text-lg font-black tracking-widest text-slate-900 leading-none">KUITANSI</h2>
                    <p className="text-[10px] font-bold text-amber-600 mt-2">{activeReceipts[0].noKuitansi}</p>
                  </div>
                </div>

                {/* Metadata Fields Body */}
                <div className="grid grid-cols-6 gap-x-2 gap-y-2.5 pt-1 text-slate-800">
                  <div className="col-span-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wide">Telah Diterima Dari</div>
                  <div className="col-span-4 border-b border-slate-200 pb-0.5 font-bold text-slate-900">: &nbsp; {activeReceipts[0].nama}</div>

                  <div className="col-span-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wide">NISN / Jenjang Kelas</div>
                  <div className="col-span-4 border-b border-slate-200 pb-0.5 font-mono font-bold">: &nbsp; {activeReceipts[0].nisn} &nbsp; (&bull;&nbsp; Kelas {selectedSiswa?.kelas || 'N/A'} {selectedSiswa?.jenjang})</div>

                  <div className="col-span-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wide">Metode Pembayaran</div>
                  <div className="col-span-4 border-b border-slate-200 pb-0.5 font-bold">: &nbsp; {activeReceipts[0].metodeBayar}</div>
                </div>

                {/* Detailed Table Breakdown of payments */}
                <div className="border border-slate-300 rounded overflow-hidden mt-4">
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
                      {activeReceipts.map((row, idx) => (
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
                        <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-[9px] tracking-widest text-slate-600">Total Setoran</td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs font-black text-slate-950">
                          {formatRupiah(activeReceipts.reduce((sum, r) => sum + r.jumlahBayar, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="grid grid-cols-6 gap-x-2 pt-1 text-slate-800">
                  <div className="col-span-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wide mt-1">Banyaknya Uang</div>
                  <div className="col-span-4 border-b border-slate-200 pb-1 font-bold bg-slate-55 p-2 rounded italic text-[11px] text-slate-950 border border-slate-200 capitalize leading-tight">
                    : &nbsp; {terbilangIndonesian(activeReceipts.reduce((sum, r) => sum + r.jumlahBayar, 0))} Rupiah
                  </div>
                </div>

                {/* Calculations summary and Signatures */}
                <div className="pt-4 grid grid-cols-2 gap-4">
                  
                  {/* Left Bottom corner: Remaining Outstanding reminder list */}
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Sisa Pembukuan Terkait:</p>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[10.5px] leading-relaxed">
                      {tagihanList.filter(t => t.nisn === activeReceipts[0].nisn && t.status !== 'Lunas').length > 0 ? (
                        <div className="space-y-1">
                          <p className="font-bold text-amber-700">Terdapat Sisa Tunggakan Lain:</p>
                          <ul className="list-disc pl-4 text-slate-600 font-medium">
                            {tagihanList
                              .filter(t => t.nisn === activeReceipts[0].nisn && t.status !== 'Lunas')
                              .slice(0, 3)
                              .map((t, i) => (
                                <li key={i}>{t.namaJenis || 'SPP'} ({t.bulanTahun}): <span className="font-mono">{formatRupiah(t.sisaTunggakan)}</span></li>
                              ))
                            }
                            {tagihanList.filter(t => t.nisn === activeReceipts[0].nisn && t.status !== 'Lunas').length > 3 && (
                              <li>...dan {tagihanList.filter(t => t.nisn === activeReceipts[0].nisn && t.status !== 'Lunas').length - 3} tagihan lainnya.</li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-emerald-700 font-extrabold flex items-center gap-1">
                          ✓ DISK GOLONGAN LUNAS SEPENUHNYA!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Bottom corner: Staff TU kasir */}
                  <div className="text-right flex flex-col justify-between items-end h-[95px] pr-2">
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">Jakarta, {activeReceipts[0].tanggal.split(' ')[0]}</p>
                      <p className="text-[10px] font-bold text-slate-800 mt-0.5">Kasir Penerima,</p>
                    </div>
                    <div className="border-t border-dashed border-slate-300 pt-1.5 w-44">
                      <p className="font-extrabold text-slate-900 text-[11px]">{activeReceipts[0].penerima}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Bendahara Keuangan</p>
                    </div>
                  </div>

                </div>

                {/* Footer Notes Disclaimer */}
                <div className="border-t border-dashed border-slate-200 pt-3 text-[9px] text-slate-400 leading-relaxed italic flex items-center justify-between">
                  <p>*Dokumen ini dicetak oleh sistem kustomisasi administrasi sekolah {schoolIdentity.namaSekolah} secara sah.<br />Simpan kuitansi sebagai bukti pelunasan berkala.</p>
                  <p className="font-mono not-italic text-[10px] font-bold text-slate-300">SYSTEM ID: GAS-SPP-PORTAL</p>
                </div>

              </div>
            </div>

            {/* Tip Banner bottom */}
            <div className="p-3 border-t border-slate-200 text-slate-500 text-[11px] bg-slate-50 rounded-b italic text-center font-medium">
              *Tekan tombol <strong>"Print Kuitansi"</strong> di kanan atas untuk mengekspor data kuitansi ke format kertas cetakan atau berkas PDF.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
