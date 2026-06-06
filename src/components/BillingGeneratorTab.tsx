import React, { useState } from 'react';
import { Siswa, Tagihan, JenisTagihan } from '../types';
import { getAcademicYearAndSemester, getAvailableAcademicYears } from '../utils/schoolYear';
import { 
  Play, 
  Terminal, 
  Database, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  FileSpreadsheet, 
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Lock,
  Tag,
  User,
  Hash,
  Coins,
  Settings2,
  Trash,
  FileText,
  ClipboardList
} from 'lucide-react';
import { formatRupiah } from './DashboardOverview';

interface BillingGeneratorTabProps {
  siswaList: Siswa[];
  tagihanList: Tagihan[];
  jenisTagihanList: JenisTagihan[];
  onGenerateTagihan: (bulanTahun: string, onConsoleLog: (msg: string) => void) => void;
  onAddJenisTagihan: (newJenis: JenisTagihan) => void;
  onUpdateJenisTagihan: (updatedJenis: JenisTagihan) => void;
  onDeleteJenisTagihan: (idJenis: string) => void;
  onAddManualTagihan: (newTagihan: Tagihan) => void;
  onDeleteTagihan: (idTagihan: string) => void;
  onAddMultipleTagihan: (newTagihans: Tagihan[]) => void;
  onSelectSiswaForPayment?: (nisn: string) => void;
}

export default function BillingGeneratorTab({
  siswaList,
  tagihanList,
  jenisTagihanList,
  onGenerateTagihan,
  onAddJenisTagihan,
  onUpdateJenisTagihan,
  onDeleteJenisTagihan,
  onAddManualTagihan,
  onDeleteTagihan,
  onAddMultipleTagihan,
  onSelectSiswaForPayment
}: BillingGeneratorTabProps) {
  // Main Tab controller: 'generator' | 'manual' | 'jenis' | 'import'
  const [subTab, setSubTab] = useState<'generator' | 'manual' | 'jenis' | 'import'>('generator');

  // Excel/TSV Import states
  const [importText, setImportText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importOptionDuplicate, setImportOptionDuplicate] = useState<'skip' | 'overwrite'>('skip');
  const [importSuccess, setImportSuccess] = useState('');
  const [importError, setImportError] = useState('');

  // Generator states (original feature)
  const [selectedMonth, setSelectedMonth] = useState('07');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [isGenerating, setIsGenerating] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  // Tagihan search and fitlers
  const [searchTagihanTerm, setSearchTagihanTerm] = useState('');
  const [activeFilterBulan, setActiveFilterBulan] = useState('Semua');
  const [activeFilterJenis, setActiveFilterJenis] = useState('Semua');
  const [activeFilterTahunAjaran, setActiveFilterTahunAjaran] = useState('Semua');
  const [activeFilterSemester, setActiveFilterSemester] = useState('Semua');

  // Form states: Manual Bill Creation
  const [manualNisn, setManualNisn] = useState('');
  const [manualIdJenis, setManualIdJenis] = useState('');
  const [manualNominal, setManualNominal] = useState<number>(0);
  const [manualMonth, setManualMonth] = useState('07');
  const [manualYear, setManualYear] = useState('2026');
  const [manualSiswaSearch, setManualSiswaSearch] = useState('');
  const [manualBillingError, setManualBillingError] = useState('');
  const [manualBillingSuccess, setManualBillingSuccess] = useState('');

  // Form states: Manage Billing Types (Jenis Tagihan)
  const [newJenisId, setNewJenisId] = useState('');
  const [newJenisNama, setNewJenisNama] = useState('');
  const [newJenisNominal, setNewJenisNominal] = useState<number>(0);
  const [newJenisKet, setNewJenisKet] = useState('');
  const [jenisError, setJenisError] = useState('');
  const [jenisSuccess, setJenisSuccess] = useState('');

  // Default Import Month and Year
  const [defaultImportMonth, setDefaultImportMonth] = useState('07');
  const [defaultImportYear, setDefaultImportYear] = useState('2026');

  const handleParseImport = (text: string, customOption?: 'skip' | 'overwrite') => {
    setImportText(text);
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    const currentOption = customOption || importOptionDuplicate;
    const defaultPeriodCombined = `${defaultImportMonth}-${defaultImportYear}`;
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const results: any[] = [];

    lines.forEach((line, index) => {
      // Split by tab, comma, or semicolon
      let parts = line.split('\t');
      if (parts.length === 1) {
        parts = line.split(/[,;]/);
      }
      parts = parts.map(p => p.trim());

      const rawNisn = parts[0] || '';
      const rawJenis = parts[1] || 'SPP';
      const rawPeriod = parts[2] || defaultPeriodCombined;
      const rawNominal = parts[3] ? parseInt(parts[3].replace(/[^0-9]/g, '')) : undefined;

      const cleanedNisn = rawNisn.replace(/[^0-9]/g, '');
      const siswa = siswaList.find(s => s.nisn === cleanedNisn);

      // Match against known billing types or fallback
      const matchingJenis = jenisTagihanList.find(j => j.idJenis.toUpperCase() === rawJenis.toUpperCase());
      const finalJenisId = matchingJenis ? matchingJenis.idJenis : 'SPP';
      const finalJenisNama = matchingJenis ? matchingJenis.namaTagihan : 'SPP Bulanan';

      // Decide nominal value
      let finalNominal = 0;
      if (rawNominal !== undefined && !isNaN(rawNominal)) {
        finalNominal = rawNominal;
      } else if (matchingJenis) {
        finalNominal = matchingJenis.nominalDefault;
      } else {
        finalNominal = 250000; // SPP default fallback
      }

      // Check period pattern "MM-YYYY"
      const periodPattern = /^\d{2}-\d{4}$/;
      const isPeriodValid = periodPattern.test(rawPeriod);
      const finalPeriod = isPeriodValid ? rawPeriod : defaultPeriodCombined;

      let rowStatus: 'valid' | 'warning' | 'error' = 'valid';
      let message = 'Siap diimport';

      if (!cleanedNisn) {
        rowStatus = 'error';
        message = 'Gagal: NISN tidak boleh kosong';
      } else if (!siswa) {
        rowStatus = 'warning';
        message = 'Peringatan: NISN tidak terdaftar di Master Siswa (tagihan akan tetap dibuat)';
      } else if (!isPeriodValid) {
        rowStatus = 'warning';
        message = `Peringatan: Format periode salah (${rawPeriod}), disesuaikan ke ${defaultPeriodCombined}`;
      }

      // Check for duplication
      const targetId = `TAG-MAN-${finalJenisId}-${cleanedNisn}-${finalPeriod}`;
      const isDuplicate = tagihanList.some(t => t.idTagihan === targetId);

      if (isDuplicate && rowStatus !== 'error') {
        if (currentOption === 'skip') {
          rowStatus = 'warning';
          message = 'Peringatan: Tagihan identik sudah ada (Baris ini akan otomatis dilewati)';
        } else {
          rowStatus = 'warning';
          message = 'Peringatan: Tagihan identik sudah ada (Akan menimpa sisa tunggakan)';
        }
      }

      results.push({
        index,
        originalLine: line,
        nisn: cleanedNisn,
        namaSiswa: siswa ? siswa.nama : (cleanedNisn ? 'Siswa Tidak Terdaftar' : 'Unidentified'),
        idJenis: finalJenisId,
        namaJenis: finalJenisNama,
        bulanTahun: finalPeriod,
        nominal: finalNominal,
        status: rowStatus,
        message,
        targetId,
        isDuplicate
      });
    });

    setParsedRows(results);
  };

  const handleExecuteImport = () => {
    setImportError('');
    setImportSuccess('');

    const validRows = parsedRows.filter(r => r.status !== 'error');
    if (validRows.length === 0) {
      setImportError('Tidak terdeteksi baris data valid untuk diproses.');
      return;
    }

    const currentTagihanMap = new Map<string, Tagihan>();
    // Pre-populate with existing bills
    tagihanList.forEach(t => currentTagihanMap.set(t.idTagihan, t));

    let createdCount = 0;
    let overwrittenCount = 0;
    let skippedCount = 0;

    validRows.forEach(row => {
      const exists = currentTagihanMap.has(row.targetId);

      if (exists) {
        if (importOptionDuplicate === 'skip') {
          skippedCount++;
          return;
        } else {
          overwrittenCount++;
          // Overwrite existing by modifying map element, resetting payments
          currentTagihanMap.set(row.targetId, {
            idTagihan: row.targetId,
            nisn: row.nisn,
            nama: row.namaSiswa,
            bulanTahun: row.bulanTahun,
            nominalTagihan: row.nominal,
            jumlahBayar: 0,
            sisaTunggakan: row.nominal,
            status: 'Belum Bayar',
            idJenis: row.idJenis,
            namaJenis: row.namaJenis
          });
        }
      } else {
        createdCount++;
        currentTagihanMap.set(row.targetId, {
          idTagihan: row.targetId,
          nisn: row.nisn,
          nama: row.namaSiswa,
          bulanTahun: row.bulanTahun,
          nominalTagihan: row.nominal,
          jumlahBayar: 0,
          sisaTunggakan: row.nominal,
          status: 'Belum Bayar',
          idJenis: row.idJenis,
          namaJenis: row.namaJenis
        });
      }
    });

    onAddMultipleTagihan(Array.from(currentTagihanMap.values()));
    setImportSuccess(`Sukses! Berhasil mengimpor data: ${createdCount} tagihan baru terbit, ${overwrittenCount} diperbarui, dan ${skippedCount} dilewati.`);
    setImportText('');
    setParsedRows([]);
  };

  const getBulanTahunRaw = () => `${selectedMonth}-${selectedYear}`;
  const targetPeriod = getBulanTahunRaw();
  const siswaBisaDiberiTagihan = siswaList.length;
  
  // Count current period bills
  const tagihanTergenerateUserCount = tagihanList.filter(t => t.bulanTahun === targetPeriod).length;

  const uniqueMonths = Array.from(new Set(tagihanList.map(t => t.bulanTahun))).sort();
  const uniqueJenis = Array.from(new Set(tagihanList.filter(t => t.namaJenis).map(t => t.namaJenis as string))).sort();
  const availableYears = getAvailableAcademicYears(tagihanList);

  // Group all bills by Academic Year & Semester for analytics cards
  const academicGroupsSummary = (() => {
    const summaryMap: Record<string, {
      tahunAjaran: string;
      semester: 'Ganjil' | 'Genap';
      totalTagihan: number;
      totalBayar: number;
      totalSisa: number;
      count: number;
    }> = {};

    tagihanList.forEach(t => {
      const { tahunAjaran, semester } = getAcademicYearAndSemester(t.bulanTahun);
      const key = `${tahunAjaran}-${semester}`;
      if (!summaryMap[key]) {
        summaryMap[key] = {
          tahunAjaran,
          semester,
          totalTagihan: 0,
          totalBayar: 0,
          totalSisa: 0,
          count: 0
        };
      }
      summaryMap[key].totalTagihan += t.nominalTagihan;
      summaryMap[key].totalBayar += t.jumlahBayar;
      summaryMap[key].totalSisa += t.sisaTunggakan;
      summaryMap[key].count += 1;
    });

    return Object.values(summaryMap).sort((a, b) => {
      if (a.tahunAjaran !== b.tahunAjaran) {
        return b.tahunAjaran.localeCompare(a.tahunAjaran);
      }
      return b.semester.localeCompare(a.semester);
    });
  })();

  // Search filtered tagihan
  const filteredTagihan = tagihanList.filter(t => {
    const matchesSearch = t.nama.toLowerCase().includes(searchTagihanTerm.toLowerCase()) || 
                          t.nisn.includes(searchTagihanTerm) ||
                          t.idTagihan.toLowerCase().includes(searchTagihanTerm.toLowerCase());
    const matchesPeriod = activeFilterBulan === 'Semua' || t.bulanTahun === activeFilterBulan;
    const matchesJenis = activeFilterJenis === 'Semua' || t.namaJenis === activeFilterJenis || 
                         (activeFilterJenis === 'SPP Bulanan' && !t.namaJenis); // Fallback if no namaJenis is set

    const { tahunAjaran, semester } = getAcademicYearAndSemester(t.bulanTahun);
    const matchesTahunAjaran = activeFilterTahunAjaran === 'Semua' || tahunAjaran === activeFilterTahunAjaran;
    const matchesSemester = activeFilterSemester === 'Semua' || semester === activeFilterSemester;

    return matchesSearch && matchesPeriod && matchesJenis && matchesTahunAjaran && matchesSemester;
  });

  const appendLog = (msg: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString('id-ID')}] ${msg}`]);
  };

  const handleGenerate = () => {
    setTerminalLogs([]);
    setIsGenerating(true);
    
    let step = 0;
    const intervalTime = 200; 
    const targetBulanTahun = getBulanTahunRaw();

    const scriptSimulationInterval = setInterval(() => {
      switch(step) {
        case 0:
          appendLog(`🚀 Menginisiasi Google Apps Script 'generateBulananTagihan()' untuk periode ${targetBulanTahun}`);
          break;
        case 1:
          appendLog(`📂 Membaca basis data siswa dari sheet [Master_Siswa]...`);
          break;
        case 2:
          appendLog(`✅ Ditemukan ${siswaList.length} siswa terdaftar di Master_Siswa.`);
          break;
        case 3:
          appendLog(`🔎 Memeriksa log tab [Tagihan_Bulanan] untuk mencegah duplikasi billing...`);
          break;
        case 4:
          appendLog(`📊 Menghitung skema tarif SPP bersih individual (dikurangi potongan beasiswa kustom)...`);
          break;
        case 5:
          // Local execution
          siswaList.forEach(s => {
            const idBill = `TAG-${s.nisn}-${targetBulanTahun}`;
            const hasDuplicate = tagihanList.some(t => t.idTagihan === idBill);
            if (hasDuplicate) {
              appendLog(`⚠️ Siswa ${s.nama} (${s.nisn}) sudah memiliki tagihan. Mengabaikan...`);
            } else {
              const finalTarif = Math.round(s.tarifSpp * (1 - (s.potonganBeasiswa / 100)));
              appendLog(`📝 Create: ID "${idBill}" untuk ${s.nama}, nominal SPP Bersih: ${formatRupiah(finalTarif)}`);
            }
          });
          onGenerateTagihan(targetBulanTahun, () => {});
          break;
        case 6:
          appendLog(`💾 Sinkronisasi batch array ke Google Sheets 'Tagihan_Bulanan' seutuhnya (Batch write - O(1) Link!).`);
          break;
        case 7:
          appendLog(`🎉 Selesai! Seluruh tagihan baru periode ${targetBulanTahun} telah terakumulasi secara sah.`);
          clearInterval(scriptSimulationInterval);
          setIsGenerating(false);
          break;
      }
      step++;
    }, intervalTime);
  };

  // Create single student custom/manual bill
  const handleCreateManualBilling = (e: React.FormEvent) => {
    e.preventDefault();
    setManualBillingError('');
    setManualBillingSuccess('');

    if (!manualNisn) {
      setManualBillingError('Silakan pilih siswa terlebih dahulu.');
      return;
    }
    if (!manualIdJenis) {
      setManualBillingError('Silakan pilih jenis tagihan.');
      return;
    }
    if (manualNominal <= 0) {
      setManualBillingError('Nominal tagihan harus di atas Rp 0.');
      return;
    }

    const selectedSiswa = siswaList.find(s => s.nisn === manualNisn);
    const selectedJenis = jenisTagihanList.find(j => j.idJenis === manualIdJenis);
    if (!selectedSiswa || !selectedJenis) return;

    // Unique combination id to prevent double entry for same type in the same month
    const customBulanTahun = `${manualMonth}-${manualYear}`;
    const generatedId = `TAG-MAN-${selectedJenis.idJenis}-${selectedSiswa.nisn}-${customBulanTahun}`;

    const isDuplicate = tagihanList.some(t => t.idTagihan === generatedId);
    if (isDuplicate) {
      setManualBillingError(`Kesalahan: Tagihan '${selectedJenis.namaTagihan}' untuk siswa ${selectedSiswa.nama} pada periode ${customBulanTahun} sudah pernah diterbitkan.`);
      return;
    }

    const newTagihan: Tagihan = {
      idTagihan: generatedId,
      nisn: selectedSiswa.nisn,
      nama: selectedSiswa.nama,
      bulanTahun: customBulanTahun,
      nominalTagihan: manualNominal,
      jumlahBayar: 0,
      sisaTunggakan: manualNominal,
      status: 'Belum Bayar',
      idJenis: selectedJenis.idJenis,
      namaJenis: selectedJenis.namaTagihan
    };

    onAddManualTagihan(newTagihan);
    setManualBillingSuccess(`Sukses! Berhasil menerbitkan manual tagihan '${selectedJenis.namaTagihan}' sebesar ${formatRupiah(manualNominal)} untuk siswa ${selectedSiswa.nama}.`);
    
    // Clear form inputs
    setManualNisn('');
    setManualIdJenis('');
    setManualNominal(0);
    setManualSiswaSearch('');
  };

  // Change selected jenis tagihan to auto load the default value
  const handleSelectJenisTagihanChange = (id: string) => {
    setManualIdJenis(id);
    const current = jenisTagihanList.find(j => j.idJenis === id);
    if (current) {
      setManualNominal(current.nominalDefault);
    }
  };

  // Add new Custom Jenis Tagihan
  const handleAddNewJenisTagihan = (e: React.FormEvent) => {
    e.preventDefault();
    setJenisError('');
    setJenisSuccess('');

    const cleanId = newJenisId.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    if (!cleanId) {
      setJenisError('ID Jenis Tagihan tidak boleh kosong dan harus karakter alfanumerik.');
      return;
    }

    if (jenisTagihanList.some(j => j.idJenis === cleanId)) {
      setJenisError(`Sistem mendeteksi ID '${cleanId}' sudah ada dalam basis data.`);
      return;
    }

    if (!newJenisNama.trim()) {
      setJenisError('Nama tagihan wajib diisi.');
      return;
    }

    if (newJenisNominal <= 0) {
      setJenisError('Nominal default harus lebih besar dari Rp 0.');
      return;
    }

    const newJenis: JenisTagihan = {
      idJenis: cleanId,
      namaTagihan: newJenisNama.trim(),
      nominalDefault: newJenisNominal,
      keterangan: newJenisKet.trim() || 'Custom billing type'
    };

    onAddJenisTagihan(newJenis);
    setJenisSuccess(`Sukses meluncurkan jenis tagihan kustom baru: "${newJenisNama.trim()}" (${cleanId})`);
    
    // reset form
    setNewJenisId('');
    setNewJenisNama('');
    setNewJenisNominal(0);
    setNewJenisKet('');
  };

  // Handle delete billing row
  const handleDeleteBill = (idTagihan: string, namaSiswa: string, status: string) => {
    if (status !== 'Belum Bayar') {
      if (!confirm(`Peringatan: Tagihan ini sudah memiliki dana masuk berupa cicilan/lunas (${status}). Menghapus tagihan dapat mengacaukan audit kasir. Lanjutkan hapus?`)) {
        return;
      }
    } else {
      if (!confirm(`Konfirmasi: Apakah Anda yakin ingin mematikan/menghapus tagihan untuk ${namaSiswa}? Tindakan ini bersifat tidak permanen.`)) {
        return;
      }
    }
    onDeleteTagihan(idTagihan);
  };

  // Filter students matching the manual search query
  const matchingManualStudents = siswaList.filter(s => {
    if (!manualSiswaSearch) return false;
    return s.nama.toLowerCase().includes(manualSiswaSearch.toLowerCase()) || 
           s.nisn.includes(manualSiswaSearch);
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Tab Navigation Menu */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSubTab('generator')}
          className={`pb-3.5 text-xs font-bold border-b-2 px-6 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
            subTab === 'generator'
              ? 'border-blue-600 text-blue-650'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Masal (Tagihan SPP Bulanan)
        </button>

        <button
          onClick={() => setSubTab('manual')}
          className={`pb-3.5 text-xs font-bold border-b-2 px-6 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
            subTab === 'manual'
              ? 'border-blue-600 text-blue-650'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plus className="w-4 h-4 text-emerald-600" />
          Buat Tagihan Manual (Satu Per Satu)
        </button>

        <button
          onClick={() => setSubTab('jenis')}
          className={`pb-3.5 text-xs font-bold border-b-2 px-6 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
            subTab === 'jenis'
              ? 'border-blue-600 text-blue-650'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings2 className="w-4 h-4 text-amber-500" />
          Kelola Jenis Tagihan (Dinamis)
        </button>

        <button
          onClick={() => setSubTab('import')}
          className={`pb-3.5 text-xs font-bold border-b-2 px-6 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
            subTab === 'import'
              ? 'border-blue-600 text-blue-650'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-indigo-500" />
          Import Massal (Google Sheets / Excel)
        </button>
      </div>

      {subTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Step Input Panel */}
          <div className="lg:col-span-2 bg-white rounded border border-slate-200 shadow-sm p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Calendar className="w-5 h-5 text-blue-650" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Pembangkit Tagihan Massal</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1.5">Target Bulan & Tahun SPP</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden"
                  >
                    <option value="01">Januari</option>
                    <option value="02">Februari</option>
                    <option value="03">Maret</option>
                    <option value="04">April</option>
                    <option value="05">Mei</option>
                    <option value="06">Juni</option>
                    <option value="07">Juli</option>
                    <option value="08">Agustus</option>
                    <option value="09">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 rounded p-4 border border-slate-200 text-xs font-medium space-y-3">
                <h4 className="font-bold text-slate-805 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                  <Database className="w-4 h-4 text-blue-650" />
                  Informasi Status SPP
                </h4>
                <div className="space-y-1.5 text-slate-650 font-medium">
                  <div className="flex justify-between items-center">
                    <span>Siswa Berhak Tagihan:</span>
                    <span className="font-bold text-slate-800">{siswaBisaDiberiTagihan} Siswa</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tagihan Terbit ({targetPeriod}):</span>
                    {tagihanTergenerateUserCount > 0 ? (
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Sudah Terbit ({tagihanTergenerateUserCount} Tag)
                      </span>
                    ) : (
                      <span className="font-bold text-amber-600">Belum Terbit</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-start gap-2 border-t border-slate-100 pt-3 leading-relaxed font-sans font-medium">
                <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <p>
                  Metode otomatis mendistribusikan tagihan SPP bulanan ke semua siswa sekaligus sesuai dengan tarif kustom mereka di Master Siswa.
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full py-2.5 px-4 rounded text-xs font-bold text-white transition-all duration-150 flex items-center justify-center gap-2 uppercase tracking-wider border border-blue-700/40 cursor-pointer ${
                  isGenerating 
                    ? 'bg-slate-400 border-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memproses Script Google...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 animate-bounce" />
                    Proses Tagihan SPP Massal ({targetPeriod})
                  </>
                )}
              </button>
            </div>
          </div>

          {/* GAS Terminal logs */}
          <div className="lg:col-span-3 bg-slate-900 rounded border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="bg-slate-850 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-2.5 h-2.5 bg-rose-500"></span>
                <span className="flex-shrink-0 w-2.5 h-2.5 bg-yellow-500"></span>
                <span className="flex-shrink-0 w-2.5 h-2.5 bg-emerald-500"></span>
                <div className="flex items-center gap-1.5 ml-2 text-slate-400 font-mono text-[10px] uppercase font-bold tracking-widest leading-none">
                  <Terminal className="w-3.5 h-3.5 text-lime-500" />
                  Google Apps Script Console Logs
                </div>
              </div>
              <span className="text-[9px] bg-slate-800/80 text-blue-400 font-bold border border-slate-705 py-0.5 px-2 rounded font-mono leading-none">
                SIMULATOR ACTIVE
              </span>
            </div>

            <div className="p-4 flex-1 h-[250px] overflow-y-auto font-mono text-[10px] space-y-1.5 text-emerald-400 bg-black/45 scrollbar-thin">
              {terminalLogs.length > 0 ? (
                terminalLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed border-b border-white/5 pb-1 last:border-0 text-left">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-500 flex flex-col items-center justify-center h-full py-12 text-center">
                  <Terminal className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="max-w-xs text-[10px] uppercase tracking-wider font-bold mb-1">Konsol Sandbox Pasif</p>
                  <p className="max-w-xs text-[11px] leading-relaxed lowercase font-sans text-slate-400">Klik tombol "Proses Tagihan SPP Massal" di sebelah kiri untuk mereplikasi kinerja eksekusi Apps Script.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {subTab === 'manual' && (
        <div className="bg-white rounded border border-slate-200 shadow-sm p-6 max-w-3xl">
          <div className="border-b border-slate-200 pb-3 mb-5">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Menerbitkan Tagihan Individual secara Manual
            </h3>
            <p className="text-xs text-slate-500">Gunakan formulir ini untuk membuat tagihan khusus non-rutin pada siswa tertentu.</p>
          </div>

          {manualBillingError && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded text-rose-600 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0" />
              <p>{manualBillingError}</p>
            </div>
          )}

          {manualBillingSuccess && (
            <div className="p-3 mb-4 bg-emerald-50 border border-emerald-250 rounded text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
              <p>{manualBillingSuccess}</p>
            </div>
          )}

          <form onSubmit={handleCreateManualBilling} className="space-y-4">
            
            {/* Find student box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">1. Cari & Pilih Siswa</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Ketik NISN atau Nama siswa..."
                    value={manualSiswaSearch}
                    onChange={(e) => {
                      setManualSiswaSearch(e.target.value);
                      if (manualNisn) setManualNisn(''); // Reset selection if typing starts again
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded py-2 pl-9 pr-3 text-xs font-semibold text-slate-705 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Matchings dropdown representation */}
                {manualSiswaSearch && !manualNisn && (
                  <div className="absolute z-20 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded shadow-lg text-xs w-72 md:w-80">
                    {matchingManualStudents.length > 0 ? (
                      matchingManualStudents.map(s => (
                        <button
                          type="button"
                          key={s.nisn}
                          onClick={() => {
                            setManualNisn(s.nisn);
                            setManualSiswaSearch(`${s.nama} (${s.nisn})`);
                          }}
                          className="w-full text-left p-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 block"
                        >
                          <p className="font-bold text-slate-900">{s.nama}</p>
                          <p className="text-[10px] text-slate-500 font-mono">NISN: {s.nisn} &bull; Kelas {s.kelas}</p>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-slate-400 italic">Siswa tidak ditemukan</div>
                    )}
                  </div>
                )}
                {manualNisn && (
                  <p className="text-[10px] inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                    ✓ Siswa Terpilih
                  </p>
                )}
              </div>

              {/* Select Fee type */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">2. Pilih Kategori Tagihan</label>
                <select
                  value={manualIdJenis}
                  onChange={(e) => handleSelectJenisTagihanChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-2.5 px-3 text-xs font-semibold text-slate-705 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="">-- Pilih Jenis Tagihan --</option>
                  {jenisTagihanList.map(j => (
                    <option key={j.idJenis} value={j.idJenis}>
                      {j.namaTagihan} (Id: {j.idJenis})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Nominal and Period */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">3. Nominal Tagihan kustom (Rp)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 font-bold text-[10px] font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={manualNominal === 0 ? '' : manualNominal}
                    onChange={(e) => setManualNominal(Number(e.target.value))}
                    placeholder="Masukkan nominal rupiah..."
                    className="w-full bg-slate-50 border border-slate-200 rounded py-2 pl-8 pr-3 text-xs font-bold font-mono text-slate-750 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">4. Bulan Periode</label>
                <select
                  value={manualMonth}
                  onChange={(e) => setManualMonth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs font-semibold text-slate-705 focus:outline-hidden"
                >
                  <option value="01">Januari</option>
                  <option value="02">Februari</option>
                  <option value="03">Maret</option>
                  <option value="04">April</option>
                  <option value="05">Mei</option>
                  <option value="06">Juni</option>
                  <option value="07">Juli</option>
                  <option value="08">Agustus</option>
                  <option value="09">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">5. Tahun Periode</label>
                <select
                  value={manualYear}
                  onChange={(e) => setManualYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs font-semibold text-slate-705 focus:outline-hidden"
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </div>

            {/* Quick calculator preview */}
            {manualNisn && manualIdJenis && manualNominal > 0 && (
              <div className="p-3 rounded bg-slate-50 text-[11px] leading-relaxed font-medium text-slate-650 border border-slate-200">
                <strong>Simulasi Data yang Akan Terbit:</strong>
                <p className="mt-1 lowercase">
                  Siswa dengan NISN <span className="font-bold text-slate-800 font-mono">{manualNisn}</span> akan dibebani tagihan <span className="font-bold text-slate-900">{jenisTagihanList.find(j => j.idJenis === manualIdJenis)?.namaTagihan}</span> sebesar <span className="font-bold text-emerald-600 font-mono">{formatRupiah(manualNominal)}</span> untuk periode <span className="font-bold text-blue-600 font-mono">{manualMonth}-{manualYear}</span> dengan status pembayaran <strong>Belum Bayar</strong>.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-emerald-700/30"
            >
              Simpan & Terbitkan Tagihan Baru
            </button>

          </form>
        </div>
      )}

      {subTab === 'jenis' && (
        <div className="space-y-6 text-xs">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create form card */}
            <div className="bg-white rounded border border-slate-200 shadow-sm p-5 space-y-4 h-fit">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-slate-850 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-500" />
                  Tambah Jenis Tagihan Baru
                </h4>
                <p className="text-[11px] text-slate-500">Mendukung kategori kustom dinamis dan tidak permanen.</p>
              </div>

              {jenisError && (
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded border border-rose-150 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>{jenisError}</span>
                </div>
              )}

              {jenisSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-250 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{jenisSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddNewJenisTagihan} className="space-y-3.5">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Kode / ID Jenis Tagihan (Unik)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: WISUDA, PRAMUKA, SERAGAM"
                    value={newJenisId}
                    onChange={(e) => setNewJenisId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 focus:outline-hidden font-bold font-mono tracking-wider text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400 italic">Hanya gabungan huruf besar A-Z dan angka tanpa spasi.</span>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Nama Deskripsi Tagihan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Biaya Wisuda Kelulusan"
                    value={newJenisNama}
                    onChange={(e) => setNewJenisNama(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded py-2 px-3 focus:outline-hidden font-semibold text-slate-755"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Nominal Default (Rp)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-450 pointer-events-none font-mono font-bold">Rp</span>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="800000"
                      value={newJenisNominal === 0 ? '' : newJenisNominal}
                      onChange={(e) => setNewJenisNominal(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded py-2 pl-8 pr-3 focus:outline-hidden font-extrabold font-mono text-slate-800 text-slate-650"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Keterangan Tambahan</label>
                  <textarea
                    placeholder="Misal: Opsional untuk kelas 9 dan 12..."
                    value={newJenisKet}
                    onChange={(e) => setNewJenisKet(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 focus:outline-hidden text-slate-650 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold uppercase tracking-wider transition-colors mt-2 cursor-pointer"
                >
                  Tambahkan Jenis Tagihan
                </button>
              </form>
            </div>

            {/* List grid cards */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Daftar Jenis Tagihan Terdaftar</span>
                <span className="bg-slate-200 text-slate-650 px-2 py-0.5 rounded text-[10px] font-bold">{jenisTagihanList.length} Kategori</span>
              </h4>

              <div className="bg-white border border-slate-200 rounded overflow-hidden">
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-250 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                      <th className="py-3 px-4">KODE_ID</th>
                      <th className="py-3 px-4">Nama Tagihan</th>
                      <th className="py-3 px-4 text-right">Default Nominal</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-705 font-medium">
                    {jenisTagihanList.map(j => (
                      <tr key={j.idJenis} className="hover:bg-slate-55/35">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <span className="bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] py-0.5 px-1.5 rounded">
                            {j.idJenis}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-850">{j.namaTagihan}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-650">{formatRupiah(j.nominalDefault)}</td>
                        <td className="py-3.5 px-4 text-slate-500 max-w-[150px] truncate" title={j.keterangan}>{j.keterangan}</td>
                        <td className="py-3.5 px-4 text-center">
                          {/* Protect standard default SPP and GEDUNG from accidental deletion, although can delete others */}
                          {['SPP', 'GEDUNG'].includes(j.idJenis) ? (
                            <span className="text-slate-350 cursor-not-allowed text-[10px] font-bold" title="Kategori Dasar Sistem (Kunci/Permanent)">
                              <Lock className="w-3.5 h-3.5 mx-auto" />
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus jenis tagihan "${j.namaTagihan}" (${j.idJenis})? Kategori ini bersifat tidak permanen.`)) {
                                  onDeleteJenisTagihan(j.idJenis);
                                }
                              }}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded mx-auto block cursor-pointer transition-colors"
                              title="Hapus Kategori (Tidak Permanen)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-yellow-50 text-yellow-850 rounded border border-yellow-205 leading-relaxed flex items-start gap-2 max-w-xl font-medium">
                <AlertCircle className="w-4.5 h-4.5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] leading-normal font-sans">
                  <strong>Pemberitahuan Fleksibilitas Data:</strong> Seluruh rincian jenis tagihan ini tersimpan di browser Anda. Anda dapat mendaftarkan kategori non-permanen baru untuk biaya rekreasi, iuran OSIS, dsb., lalu menerbitkannya sesuka hati, serta dengan mudah melenyapkannya kembali jika sudah tidak dipergunakan.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {subTab === 'import' && (
        <div className="space-y-6 text-xs animate-fade-in">
          <div className="bg-white rounded border border-slate-200 shadow-sm p-6">
            <div className="border-b border-slate-200 pb-3.5 mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                  Import Data Tagihan Massal via Copy-Paste (Spreadsheet)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Salin sel-sel spreadsheet (Google Sheets atau Excel) lalu tempel langsung di bawah ini untuk menerbitkan tagihan secara instan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const sampleText = `1001001001	SPP	07-2026	250000\n1001001002	SPP	07-2026	250000\n1001055001	WISUDA	07-2026	800000`;
                  handleParseImport(sampleText);
                }}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-1.5 px-3 rounded border border-indigo-200 cursor-pointer transition-colors"
                title="Memasukkan data simulasi instan"
              >
                Coba Masukkan Contoh Data
              </button>
            </div>

            {importError && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-250 rounded text-rose-600 font-semibold flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0" />
                <p>{importError}</p>
              </div>
            )}

            {importSuccess && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-250 rounded text-emerald-700 font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                <p>{importSuccess}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Manual Input Paste Box */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-2">
                    Tempel Data Spreadsheet Anda di Sini (Kolom dipisahkan Tab atau Koma)
                  </label>
                  <textarea
                    rows={8}
                    value={importText}
                    onChange={(e) => handleParseImport(e.target.value)}
                    placeholder="Contoh format:&#10;NISN	KODE_JENIS	BULAN-TAHUN	NOMINAL&#10;1001001001	SPP	07-2026	250000&#10;1001001002	WISUDA	07-2026	800000"
                    className="w-full bg-slate-50 border border-slate-200 rounded font-mono p-4 text-xs tracking-tight text-slate-805 focus:outline-hidden focus:border-indigo-500 leading-relaxed shadow-inner"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                    <span>Terdeteksi: {parsedRows.length} baris data</span>
                    <button
                      type="button"
                      onClick={() => {
                        setImportText('');
                        setParsedRows([]);
                        setImportSuccess('');
                        setImportError('');
                      }}
                      className="text-rose-500 hover:text-rose-600 font-bold hover:underline"
                    >
                      Bersihkan Kotak Input
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-55 p-4 rounded border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
                      Default Periode (Jika Kosong di spreadsheet)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={defaultImportMonth}
                        onChange={(e) => {
                          setDefaultImportMonth(e.target.value);
                          // Re-trigger parsing with new defaults
                          setTimeout(() => handleParseImport(importText), 0);
                        }}
                        className="bg-white border border-slate-200 rounded py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="01">Januari</option>
                        <option value="02">Februari</option>
                        <option value="03">Maret</option>
                        <option value="04">April</option>
                        <option value="05">Mei</option>
                        <option value="06">Juni</option>
                        <option value="07">Juli</option>
                        <option value="08">Agustus</option>
                        <option value="09">September</option>
                        <option value="10">Oktober</option>
                        <option value="11">November</option>
                        <option value="12">Desember</option>
                      </select>

                      <select
                        value={defaultImportYear}
                        onChange={(e) => {
                          setDefaultImportYear(e.target.value);
                          setTimeout(() => handleParseImport(importText), 0);
                        }}
                        className="bg-white border border-slate-200 rounded py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
                      Solusi Duplikasi Tagihan Identik
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImportOptionDuplicate('skip');
                          handleParseImport(importText, 'skip');
                        }}
                        className={`py-2 px-3.5 rounded text-xs font-bold transition-all border ${
                          importOptionDuplicate === 'skip'
                            ? 'bg-indigo-600 text-white border-indigo-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Skip Duplikat
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImportOptionDuplicate('overwrite');
                          handleParseImport(importText, 'overwrite');
                        }}
                        className={`py-2 px-3.5 rounded text-xs font-bold transition-all border ${
                          importOptionDuplicate === 'overwrite'
                            ? 'bg-indigo-600 text-white border-indigo-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Tumpuk / Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions Sidebar */}
              <div className="bg-slate-55 border border-slate-200 rounded p-4.5 space-y-3 h-fit text-slate-750">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-slate-250 pb-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Format Aturan Kolom
                </h4>
                <p className="text-[11px] leading-relaxed">
                  Sistem sangat fleksibel. Kolom dipisahkan oleh karakter <strong>Tab</strong> (jika copy-paste langsung dari sel Excel/Google Sheets) maupun karakter <strong>Koma / Titik Koma (;)</strong>.
                </p>
                
                <h5 className="font-bold text-slate-850 text-[10px] uppercase tracking-wider mb-0.5">Struktur Kolom Map:</h5>
                <ol className="list-decimal pl-4.5 text-[11px] space-y-1.5 leading-relaxed font-sans">
                  <li><strong>NISN (Wajib)</strong>: Angka NISN, misal 1001001001</li>
                  <li><strong>Jenis Tagihan (Opsional)</strong>: Kode ID tagihan seperti SPP, GEDUNG, atau WISUDA (Default SPP).</li>
                  <li><strong>Periode (Opsional)</strong>: Format e.g. 07-2026. (Alternatif memakai Default Periode di sebelah kiri).</li>
                  <li><strong>Nominal (Opsional)</strong>: Angka biaya rupiah. (Alternatif mengambil nominal standar dari Kategori Jenis tersebut).</li>
                </ol>

                <div className="p-3 bg-amber-50 rounded border border-amber-250 text-[11px] text-amber-850 leading-normal font-sans">
                  <strong>ℹ Info Efisiensi:</strong> Tidak usah repot menyalin nama siswa! Sistem dengan cerdas mencocokkan NISN dan menampilkan nama asli siswa terdaftar secara otomatis di tabel pratinjau!
                </div>
              </div>
            </div>

            {/* Live Parsing Preview Result Drawer */}
            {parsedRows.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-6 space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 border border-slate-200 rounded">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      Pratinjau Hasil Parsing Data ({parsedRows.filter(r => r.status !== 'error').length} Baris Siap Import)
                    </h4>
                    <p className="text-xs text-slate-500">Periksa detail di bawah sebelum memicu simpan ke pangkalan data.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    className="py-2.5 px-6 rounded text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 border border-indigo-700/30 cursor-pointer uppercase tracking-wider transition-all"
                  >
                    Mulai Impor {parsedRows.filter(r => r.status !== 'error').length} Data Ke Tagihan
                  </button>
                </div>

                <div className="border border-slate-200 rounded overflow-hidden max-h-80 overflow-y-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-250 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none sticky top-0 z-10">
                        <th className="py-3 px-4 w-12 text-center">Baris</th>
                        <th className="py-3 px-4 font-mono">NISN</th>
                        <th className="py-3 px-4">Nama Siswa</th>
                        <th className="py-3 px-4">Jenis</th>
                        <th className="py-3 px-4 text-center">Periode</th>
                        <th className="py-3 px-4 text-right">Nominal Sektor</th>
                        <th className="py-3 px-4">Catatan Integrasi / Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705 font-medium">
                      {parsedRows.map((row, i) => (
                        <tr key={i} className={`hover:bg-slate-50/50 ${row.status === 'error' ? 'bg-rose-50/40 text-rose-800' : ''}`}>
                          <td className="py-3 px-4 text-center text-slate-400 font-bold font-mono">{i + 1}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">{row.nisn || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={row.namaSiswa.includes('Tidak Terdaftar') ? 'text-amber-600 font-semibold' : 'font-bold text-slate-900'}>
                              {row.namaSiswa}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[10px] py-0.5 px-1.5 rounded uppercase">
                              {row.idJenis}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">{row.bulanTahun}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-indigo-755">{formatRupiah(row.nominal)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-2 rounded border ${
                              row.status === 'valid'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-250'
                                : row.status === 'warning'
                                ? 'bg-amber-50 text-amber-600 border-amber-200 font-semibold'
                                : 'bg-rose-50 text-rose-600 border-rose-200 font-bold'
                            }`}>
                              {row.message}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sheet view simulation table representing "Tagihan_Bulanan" */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="w-5 h-5 text-blue-650" />
              Sinkronisasi Sheet [Tagihan_Bulanan] ({filteredTagihan.length} Baris Data)
            </h4>
            <p className="text-xs text-slate-500">Menampilkan jurnal seluruh hutang tagihan siswa yang siap dipotong atau dilunasi di loket transaksional.</p>
          </div>

          {/* Filter options and search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Cari ID, NISN, atau Nama..."
                value={searchTagihanTerm}
                onChange={(e) => setSearchTagihanTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded py-1.5 pl-8 pr-3 text-xs font-semibold focus:outline-hidden focus:border-blue-500 font-sans"
              />
            </div>

            {/* TA (Tahun Ajaran) Filter */}
            <select
              value={activeFilterTahunAjaran}
              onChange={(e) => {
                setActiveFilterTahunAjaran(e.target.value);
                setActiveFilterBulan('Semua');
              }}
              className="bg-white border border-slate-200 rounded py-1.5 px-3 text-xs font-semibold text-slate-705 focus:outline-hidden"
            >
              <option value="Semua">Semua TA</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>TA {yr}</option>
              ))}
            </select>

            {/* Semester Filter */}
            <select
              value={activeFilterSemester}
              onChange={(e) => {
                setActiveFilterSemester(e.target.value);
                setActiveFilterBulan('Semua');
              }}
              className="bg-white border border-slate-200 rounded py-1.5 px-3 text-xs font-semibold text-slate-705 focus:outline-hidden"
            >
              <option value="Semua">Semua Semester</option>
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>

            <select
              value={activeFilterBulan}
              onChange={(e) => {
                const val = e.target.value;
                setActiveFilterBulan(val);
                if (val !== 'Semua') {
                  const { tahunAjaran, semester } = getAcademicYearAndSemester(val);
                  setActiveFilterTahunAjaran(tahunAjaran);
                  setActiveFilterSemester(semester);
                }
              }}
              className="bg-white border border-slate-200 rounded py-1.5 px-3 text-xs font-semibold text-slate-705 focus:outline-hidden"
            >
              <option value="Semua">Semua Periode</option>
              {uniqueMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={activeFilterJenis}
              onChange={(e) => setActiveFilterJenis(e.target.value)}
              className="bg-white border border-slate-250 rounded py-1.5 px-3 text-xs font-semibold text-slate-705"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="SPP Bulanan">SPP Bulanan</option>
              {uniqueJenis.filter(j => j !== 'SPP Bulanan').map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ringkasan Analitis Terpisah Berdasarkan Tahun Ajaran & Semester */}
        <div className="space-y-2 mt-2 animate-fade-in">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans">
            Ringkasan Pembukuan Terpisah (Tahun Ajaran & Semester):
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {academicGroupsSummary.map((group) => {
              const paymentRatio = group.totalTagihan > 0 ? (group.totalBayar / group.totalTagihan) * 100 : 0;
              return (
                <div 
                  key={`${group.tahunAjaran}-${group.semester}`}
                  className="bg-white border border-slate-200 rounded p-4 shadow-sm hover:border-slate-300 transition-all duration-200"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-mono">
                      TAHUN AJARAN {group.tahunAjaran}
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                      group.semester === 'Ganjil' 
                        ? 'bg-amber-50 text-amber-700 border-amber-100' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      SEMESTER {group.semester.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-left">
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-tight block">Ketetapan ({group.count})</span>
                      <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">{formatRupiah(group.totalTagihan)}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-tight block">Disetor</span>
                      <p className="text-xs font-mono font-bold text-emerald-600 mt-0.5">{formatRupiah(group.totalBayar)}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-tight block">Tunggakan</span>
                      <p className="text-xs font-mono font-bold text-rose-500 mt-0.5">{formatRupiah(group.totalSisa)}</p>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold mb-1">
                      <span>Rasio Pelunasan</span>
                      <span className="font-mono font-bold text-emerald-600">{Math.round(paymentRatio)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${paymentRatio}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tagihan list table */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  <th className="py-3.5 px-4 font-mono">ID_Tagihan</th>
                  <th className="py-3.5 px-4 font-mono">NISN</th>
                  <th className="py-3.5 px-4 col-span-2">Info Siswa</th>
                  <th className="py-3.5 px-4">Kategori Tagihan</th>
                  <th className="py-3.5 px-4 text-center">Periode</th>
                  <th className="py-3.5 px-4 text-right">Nominal Sektor</th>
                  <th className="py-3.5 px-4 text-right">Telah Bayar</th>
                  <th className="py-3.5 px-4 text-right">Sisa Tunggakan</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Bayar</th>
                  <th className="py-3.5 px-4 text-center">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredTagihan.length > 0 ? (
                  [...filteredTagihan].sort((a,b) => b.idTagihan.localeCompare(a.idTagihan)).map((t) => (
                    <tr key={t.idTagihan} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono text-slate-455 text-[10px] truncate max-w-[150px]" title={t.idTagihan}>
                        {t.idTagihan}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{t.nisn}</td>
                      <td className="py-3.5 px-4 text-slate-900 font-bold" colSpan={2}>{t.nama}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">
                          {t.namaJenis || 'SPP Bulanan'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <p className="font-mono text-slate-700 font-bold text-[11px] leading-tight">{t.bulanTahun}</p>
                        <span className="text-[8px] tracking-wide font-extrabold uppercase text-blue-600 bg-blue-50/70 border border-blue-100 px-1.5 py-0.5 rounded-sm mt-1 inline-block whitespace-nowrap">
                          {getAcademicYearAndSemester(t.bulanTahun).tahunAjaran} &bull; {getAcademicYearAndSemester(t.bulanTahun).semester}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">{formatRupiah(t.nominalTagihan)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-bold">{formatRupiah(t.jumlahBayar)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-blue-900">{formatRupiah(t.sisaTunggakan)}</td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold border rounded ${
                          t.status === 'Lunas' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-250'
                            : t.status === 'Mencicil'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-rose-50 text-rose-600 border border-rose-250'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        {t.status !== 'Lunas' && onSelectSiswaForPayment ? (
                          <button
                            onClick={() => onSelectSiswaForPayment(t.nisn)}
                            className="bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-[10px] px-2.5 py-1 rounded inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs uppercase tracking-wider border border-emerald-700/40"
                            title="Bayor di Loket Transaksi"
                          >
                            <Coins className="w-3.5 h-3.5" />
                            <span>Bayar</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 font-bold text-[10.5px] italic">Selesai</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDeleteBill(t.idTagihan, t.nama, t.status)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                          title="Hapus Tagihan (Tidak Permanen)"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold font-sans">
                      <FileSpreadsheet className="w-8 h-8 text-slate-205 mx-auto mb-2" />
                      Tidak ada data tagihan yang sesuai dengan filter atau pencarian Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
