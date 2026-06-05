import React, { useState, useEffect } from 'react';
import { Siswa, Tagihan, LogPembayaran, JenisTagihan, SchoolIdentity, AdminSettings } from './types';
import { 
  initialSiswaList, 
  initialTagihanList, 
  initialLogList,
  initialJenisTagihanList,
  initialSchoolIdentity,
  initialAdminSettings
} from './initialData';

// Tabs
import DashboardOverview from './components/DashboardOverview';
import MasterSiswaTab from './components/MasterSiswaTab';
import BillingGeneratorTab from './components/BillingGeneratorTab';
import LoketPembayaranTab from './components/LoketPembayaranTab';
import LogPembayaranTab from './components/LogPembayaranTab';
import ScriptHubTab from './components/ScriptHubTab';
import RekapPenerimaanTab from './components/RekapPenerimaanTab';
import PengaturanTab from './components/PengaturanTab';
import LoginScreen from './components/LoginScreen';

// Icons
import { 
  LayoutDashboard, 
  Users2, 
  Receipt, 
  Calculator, 
  History, 
  Code2, 
  GraduationCap, 
  Database,
  Building,
  School,
  Sparkles,
  RefreshCw,
  BellRing,
  FileSpreadsheet,
  Settings
} from 'lucide-react';

export default function App() {
  // 1. Core State with LocalStorage Persistence
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [tagihanList, setTagihanList] = useState<Tagihan[]>([]);
  const [logList, setLogList] = useState<LogPembayaran[]>([]);
  const [jenisTagihanList, setJenisTagihanList] = useState<JenisTagihan[]>([]);
  
  // Custom Identity & Admin State
  const [schoolIdentity, setSchoolIdentity] = useState<SchoolIdentity>(initialSchoolIdentity);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(initialAdminSettings);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  // Selection bypass for navigating from Dashboard direct into selected student payment
  const [deskSiswaNisnSelection, setDeskSiswaNisnSelection] = useState<string | undefined>(undefined);

  // Load state on mount
  useEffect(() => {
    try {
      const savedSiswa = localStorage.getItem('SA_SPP_SISWA');
      const savedTagihan = localStorage.getItem('SA_SPP_TAGIHAN');
      const savedLogs = localStorage.getItem('SA_SPP_LOGS');
      const savedJenis = localStorage.getItem('SA_SPP_JENIS_TAGIHAN');
      const savedSchool = localStorage.getItem('SA_SPP_SCHOOL_IDENTITY');
      const savedAdmin = localStorage.getItem('SA_SPP_ADMIN_SETTINGS');
      const savedLoggedIn = localStorage.getItem('SA_SPP_IS_LOGGED_IN');

      if (savedSiswa) {
        setSiswaList(JSON.parse(savedSiswa));
      } else {
        setSiswaList(initialSiswaList);
        localStorage.setItem('SA_SPP_SISWA', JSON.stringify(initialSiswaList));
      }

      if (savedTagihan) {
        setTagihanList(JSON.parse(savedTagihan));
      } else {
        setTagihanList(initialTagihanList);
        localStorage.setItem('SA_SPP_TAGIHAN', JSON.stringify(initialTagihanList));
      }

      if (savedLogs) {
        setLogList(JSON.parse(savedLogs));
      } else {
        setLogList(initialLogList);
        localStorage.setItem('SA_SPP_LOGS', JSON.stringify(initialLogList));
      }

      if (savedJenis) {
        setJenisTagihanList(JSON.parse(savedJenis));
      } else {
        setJenisTagihanList(initialJenisTagihanList);
        localStorage.setItem('SA_SPP_JENIS_TAGIHAN', JSON.stringify(initialJenisTagihanList));
      }

      if (savedSchool) {
        setSchoolIdentity(JSON.parse(savedSchool));
      } else {
        setSchoolIdentity(initialSchoolIdentity);
        localStorage.setItem('SA_SPP_SCHOOL_IDENTITY', JSON.stringify(initialSchoolIdentity));
      }

      if (savedAdmin) {
        setAdminSettings(JSON.parse(savedAdmin));
      } else {
        setAdminSettings(initialAdminSettings);
        localStorage.setItem('SA_SPP_ADMIN_SETTINGS', JSON.stringify(initialAdminSettings));
      }

      if (savedLoggedIn === 'true') {
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.error('Failed to load storage values, using default fallback data', e);
      setSiswaList(initialSiswaList);
      setTagihanList(initialTagihanList);
      setLogList(initialLogList);
      setJenisTagihanList(initialJenisTagihanList);
      setSchoolIdentity(initialSchoolIdentity);
      setAdminSettings(initialAdminSettings);
    }
  }, []);

  // Save states to localstorage on changes
  const updateSiswaAndStore = (newList: Siswa[]) => {
    setSiswaList(newList);
    localStorage.setItem('SA_SPP_SISWA', JSON.stringify(newList));
  };

  const updateTagihanAndStore = (newList: Tagihan[]) => {
    setTagihanList(newList);
    localStorage.setItem('SA_SPP_TAGIHAN', JSON.stringify(newList));
  };

  const updateLogsAndStore = (newList: LogPembayaran[]) => {
    setLogList(newList);
    localStorage.setItem('SA_SPP_LOGS', JSON.stringify(newList));
  };

  const updateJenisAndStore = (newList: JenisTagihan[]) => {
    setJenisTagihanList(newList);
    localStorage.setItem('SA_SPP_JENIS_TAGIHAN', JSON.stringify(newList));
  };

  const updateSchoolIdentityAndStore = (newId: SchoolIdentity) => {
    setSchoolIdentity(newId);
    localStorage.setItem('SA_SPP_SCHOOL_IDENTITY', JSON.stringify(newId));
  };

  const updateAdminSettingsAndStore = (newAdm: AdminSettings) => {
    setAdminSettings(newAdm);
    localStorage.setItem('SA_SPP_ADMIN_SETTINGS', JSON.stringify(newAdm));
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('SA_SPP_IS_LOGGED_IN', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('SA_SPP_IS_LOGGED_IN', 'false');
    setActiveTab('dashboard');
  };

  // 2. Logic mutations
  const handleAddNewSiswa = (newSiswa: Siswa) => {
    const updated = [...siswaList, newSiswa];
    updateSiswaAndStore(updated);
  };

  const handleAddJenisTagihan = (newJenis: JenisTagihan) => {
    const updated = [...jenisTagihanList, newJenis];
    updateJenisAndStore(updated);
  };

  const handleUpdateJenisTagihan = (updatedJenis: JenisTagihan) => {
    const updated = jenisTagihanList.map(j => j.idJenis === updatedJenis.idJenis ? updatedJenis : j);
    updateJenisAndStore(updated);
  };

  const handleDeleteJenisTagihan = (idJenis: string) => {
    const updated = jenisTagihanList.filter(j => j.idJenis !== idJenis);
    updateJenisAndStore(updated);
  };

  const handleAddManualTagihan = (newTagihan: Tagihan) => {
    const updated = [...tagihanList, newTagihan];
    updateTagihanAndStore(updated);
  };

  const handleAddMultipleTagihan = (newTagihans: Tagihan[]) => {
    const updated = [...tagihanList, ...newTagihans];
    updateTagihanAndStore(updated);
  };

  const handleDeleteTagihan = (idTagihan: string) => {
    const updated = tagihanList.filter(t => t.idTagihan !== idTagihan);
    updateTagihanAndStore(updated);
  };

  const handleUpdateSiswa = (updatedSiswa: Siswa) => {
    const updated = siswaList.map(s => s.nisn === updatedSiswa.nisn ? updatedSiswa : s);
    updateSiswaAndStore(updated);

    // Also update existing unpaid bills name or values if custom tariff changes
    const updatedTagihan = tagihanList.map(t => {
      if (t.nisn === updatedSiswa.nisn) {
        // Recalculate billing values if still unpaid
        if (t.status === 'Belum Bayar') {
          const finalTarif = Math.round(updatedSiswa.tarifSpp * (1 - (updatedSiswa.potonganBeasiswa / 100)));
          return {
            ...t,
            nama: updatedSiswa.nama,
            nominalTagihan: finalTarif,
            sisaTunggakan: finalTarif
          };
        } else {
          return { ...t, nama: updatedSiswa.nama };
        }
      }
      return t;
    });
    updateTagihanAndStore(updatedTagihan);

    // Also update name in logs for data consistency
    const updatedLogs = logList.map(l => l.nisn === updatedSiswa.nisn ? { ...l, nama: updatedSiswa.nama } : l);
    updateLogsAndStore(updatedLogs);
  };

  const handleDeleteSiswa = (nisn: string) => {
    const updated = siswaList.filter(s => s.nisn !== nisn);
    updateSiswaAndStore(updated);
    // Note: We don't delete historical bills and logs to preserve school audit trails
  };

  // Generate automated monthly billing trigger (Simulating the Apps Script process)
  const handleTriggerBillingGeneration = (bulanTahunValue: string, onConsoleLog: (msg: string) => void) => {
    const existingIds = new Set(tagihanList.map(t => t.idTagihan));
    const newTagihanEntries: Tagihan[] = [];

    siswaList.forEach(siswa => {
      const idTagihanUnik = `TAG-${siswa.nisn}-${bulanTahunValue}`;
      
      // Prevent double billing
      if (!existingIds.has(idTagihanUnik)) {
        const cleanSppTariff = Math.round(siswa.tarifSpp * (1 - (siswa.potonganBeasiswa / 100)));
        newTagihanEntries.push({
          idTagihan: idTagihanUnik,
          nisn: siswa.nisn,
          nama: siswa.nama,
          bulanTahun: bulanTahunValue,
          nominalTagihan: cleanSppTariff,
          jumlahBayar: 0,
          sisaTunggakan: cleanSppTariff,
          status: 'Belum Bayar'
        });
      }
    });

    if (newTagihanEntries.length > 0) {
      const mergedTagihan = [...tagihanList, ...newTagihanEntries];
      updateTagihanAndStore(mergedTagihan);
    }
  };

  // Process manual or installment payment inside Cashier Desk for multiple tagihans under 1 receipt
  const handleCommitPembayaran = (pembayaran: {
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
  }) => {
    if (!pembayaran.itemBayar || pembayaran.itemBayar.length === 0) return null;

    // 1. Generate new single kuitansi code for this batch
    const dateFormattedCompact = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSerial = Math.floor(1000 + Math.random() * 9000);
    const prefix = schoolIdentity?.prefixKuitansi || 'KWT';
    const noKwt = `${prefix}-${dateFormattedCompact}-${randomSerial}`;
    const timestampNow = pembayaran.tanggalManual || new Date().toISOString().replace('T', ' ').substr(0, 19);

    const updatedTagihanList = [...tagihanList];
    const newLogs: LogPembayaran[] = [];

    for (const item of pembayaran.itemBayar) {
      const activeBillingIndex = updatedTagihanList.findIndex(t => t.idTagihan === item.idTagihan);
      if (activeBillingIndex === -1) continue;

      const billingRow = updatedTagihanList[activeBillingIndex];
      const newJumlahBayar = billingRow.jumlahBayar + item.jumlahBayar;
      const newSisaTunggakan = billingRow.nominalTagihan - newJumlahBayar;

      let statusBaru: 'Belum Bayar' | 'Mencicil' | 'Lunas' = 'Belum Bayar';
      if (newSisaTunggakan === 0) {
        statusBaru = 'Lunas';
      } else if (newSisaTunggakan > 0) {
        statusBaru = 'Mencicil';
      }

      updatedTagihanList[activeBillingIndex] = {
        ...billingRow,
        jumlahBayar: newJumlahBayar,
        sisaTunggakan: newSisaTunggakan,
        status: statusBaru,
        tanggalTerakhirBayar: timestampNow
      };

      const newLogItem: LogPembayaran = {
        noKuitansi: noKwt,
        idTagihan: item.idTagihan,
        tanggal: timestampNow,
        nisn: pembayaran.nisn,
        nama: billingRow.nama,
        jumlahBayar: item.jumlahBayar,
        metodeBayar: pembayaran.metodeBayar,
        penerima: pembayaran.penerima,
        keterangan: item.keterangan || pembayaran.keteranganUtama
      };

      newLogs.push(newLogItem);
    }

    if (newLogs.length === 0) return null;

    updateTagihanAndStore(updatedTagihanList);
    const updatedLogList = [...newLogs, ...logList];
    updateLogsAndStore(updatedLogList);

    return {
      success: true,
      noKuitansi: noKwt,
      kuitansis: newLogs
    };
  };

  const handleCancelPembayaran = (noKuitansi: string) => {
    // Find all logs belonging to this noKuitansi
    const logsToRevert = logList.filter(l => l.noKuitansi === noKuitansi);
    if (logsToRevert.length === 0) {
      alert(`Kuitansi dengan nomor ${noKuitansi} tidak ditemukan.`);
      return false;
    }

    const firstLog = logsToRevert[0];
    const totalAmountToRevert = logsToRevert.reduce((sum, l) => sum + l.jumlahBayar, 0);
    const confirmMessage = `Apakah Anda yakin ingin membatalkan/menghapus pembayaran Kuitansi: ${noKuitansi}?\n\n` +
      `Siswa: ${firstLog.nama} (${firstLog.nisn})\n` +
      `Total Nominal: ${formatRupiah(totalAmountToRevert)}\n` +
      `Metode Bayar: ${firstLog.metodeBayar}\n` +
      `Penerima: ${firstLog.penerima}\n\n` +
      `Tindakan ini akan memulihkan sisa tunggakan tagihan siswa bersangkutan secara aman dan menghapus log audit secara permanen.`;

    if (!confirm(confirmMessage)) {
      return false;
    }

    // Revert Tagihan changes
    const updatedTagihanList = tagihanList.map(t => {
      // Find log item pointing to this tagihan
      const matchingLog = logsToRevert.find(l => l.idTagihan === t.idTagihan);
      if (matchingLog) {
        const revertedJumlahBayar = Math.max(0, t.jumlahBayar - matchingLog.jumlahBayar);
        const revertedSisaTunggakan = t.nominalTagihan - revertedJumlahBayar;
        
        let statusBaru: 'Belum Bayar' | 'Mencicil' | 'Lunas' = 'Belum Bayar';
        if (revertedJumlahBayar === 0) {
          statusBaru = 'Belum Bayar';
        } else if (revertedSisaTunggakan > 0) {
          statusBaru = 'Mencicil';
        } else {
          statusBaru = 'Lunas';
        }

        return {
          ...t,
          jumlahBayar: revertedJumlahBayar,
          sisaTunggakan: revertedSisaTunggakan,
          status: statusBaru,
          tanggalTerakhirBayar: revertedJumlahBayar === 0 ? undefined : t.tanggalTerakhirBayar
        };
      }
      return t;
    });

    // Filter out the reverted logs
    const updatedLogList = logList.filter(l => l.noKuitansi !== noKuitansi);

    // Save and update state
    updateTagihanAndStore(updatedTagihanList);
    updateLogsAndStore(updatedLogList);

    return true;
  };

  const handleResetSimulatorData = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang data simulasi kembali ke kondisi awal? Ini akan menghapus semua sisa transaksi baru Anda di browser.')) {
      localStorage.removeItem('SA_SPP_SISWA');
      localStorage.removeItem('SA_SPP_TAGIHAN');
      localStorage.removeItem('SA_SPP_LOGS');
      localStorage.removeItem('SA_SPP_JENIS_TAGIHAN');
      localStorage.removeItem('SA_SPP_SCHOOL_IDENTITY');
      localStorage.removeItem('SA_SPP_ADMIN_SETTINGS');
      setSiswaList(initialSiswaList);
      setTagihanList(initialTagihanList);
      setLogList(initialLogList);
      setJenisTagihanList(initialJenisTagihanList);
      setSchoolIdentity(initialSchoolIdentity);
      setAdminSettings(initialAdminSettings);
      setActiveTab('dashboard');
    }
  };

  // Navigations routing
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    setDeskSiswaNisnSelection(undefined);
  };

  const handleSelectSiswaForPayment = (nisn: string) => {
    setDeskSiswaNisnSelection(nisn);
    setActiveTab('loket');
  };

  // Calculations for persistent header
  const totalTagihanTerbit = tagihanList.reduce((acc, t) => acc + t.nominalTagihan, 0);
  const totalDanaTerbayar = tagihanList.reduce((acc, t) => acc + t.jumlahBayar, 0);
  const totalTunggakan = tagihanList.reduce((acc, t) => acc + t.sisaTunggakan, 0);

  const formatRupiah = (v: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(v);
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        schoolIdentity={schoolIdentity}
        adminSettings={adminSettings}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-slate-900 text-white flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 flex-shrink-0 z-10 no-print">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between lg:block">
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">SchoolPay <span className="text-blue-400">Pro</span></h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-mono">SMP / SMA ARCHITECT</p>
          </div>
          <button
            onClick={handleResetSimulatorData}
            className="lg:mt-3 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white py-1 px-2.5 rounded text-[10px] uppercase tracking-wider transition-colors border border-slate-700 flex items-center gap-1.5"
            title="Reset DB Simulator"
          >
            <RefreshCw className="w-3 h-3" />
            Reset DB
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => navigateToTab('dashboard')}
            className={`w-full text-left px-4 py-3 rounded flex items-center gap-3 transition-all duration-150 ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTab === 'dashboard' ? 'bg-white animate-pulse' : 'bg-slate-650'}`}></div>
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Dashboard Utama</span>
          </button>

          <button
            onClick={() => navigateToTab('siswa')}
            className={`w-full text-left px-4 py-3 rounded flex items-center gap-3 transition-all duration-150 ${
              activeTab === 'siswa'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTab === 'siswa' ? 'bg-white' : 'bg-slate-650'}`}></div>
            <Users2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Master Data Siswa</span>
          </button>

          <button
            onClick={() => navigateToTab('tagihan')}
            className={`w-full text-left px-4 py-3 rounded flex items-center gap-3 transition-all duration-150 ${
              activeTab === 'tagihan'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTab === 'tagihan' ? 'bg-white' : 'bg-slate-650'}`}></div>
            <Calculator className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Billing Generator</span>
          </button>

          <button
            onClick={() => navigateToTab('loket')}
            className={`w-full text-left px-4 py-3 rounded flex items-center gap-3 transition-all duration-150 ${
              activeTab === 'loket'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTab === 'loket' ? 'bg-white' : 'bg-slate-650'}`}></div>
            <Receipt className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Loket Penerimaan</span>
          </button>

          <button
            onClick={() => navigateToTab('riwayat')}
            className={`w-full text-left px-4 py-3 rounded flex items-center gap-3 transition-all duration-150 ${
              activeTab === 'riwayat'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTab === 'riwayat' ? 'bg-white' : 'bg-slate-650'}`}></div>
            <History className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Log Pembayaran</span>
          </button>

          <button
            onClick={() => navigateToTab('rekap')}
            className={`w-full text-left px-4 py-3 rounded flex items-center gap-3 transition-all duration-150 ${
              activeTab === 'rekap'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTab === 'rekap' ? 'bg-white' : 'bg-slate-650'}`}></div>
            <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Rekap Penerimaan</span>
          </button>

          <button
            onClick={() => navigateToTab('settings')}
            className={`w-full text-left px-4 py-3 rounded flex items-center gap-3 transition-all duration-150 ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTab === 'settings' ? 'bg-white' : 'bg-slate-650'}`}></div>
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Pengaturan Identitas</span>
          </button>

          <div className="pt-3 border-t border-slate-800 mt-3">
            <button
              onClick={() => navigateToTab('script')}
              className={`w-full text-left px-4 py-3 rounded flex items-center justify-between transition-all duration-150 ${
                activeTab === 'script'
                  ? 'bg-slate-800 text-white border border-slate-705'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${activeTab === 'script' ? 'bg-blue-400' : 'bg-slate-650'}`}></div>
                <Code2 className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="text-sm">GAS Developer Hub</span>
              </span>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider font-mono">
                API
              </span>
            </button>
          </div>
        </nav>

        {/* Sidebar Info footer panel */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/20 text-xs text-slate-500 space-y-2.5 hidden lg:block">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-[9px] uppercase">
              {schoolIdentity.logoInitial}
            </div>
            <span className="font-extrabold tracking-tight uppercase text-[10px] truncate max-w-[130px]" title={schoolIdentity.namaSekolah}>
              {schoolIdentity.namaSekolah}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span>v2.4.0 (GAS Enterprise)</span>
            <button
              onClick={handleLogout}
              className="text-rose-450 hover:text-rose-400 font-bold uppercase tracking-wider text-[9px]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Right Content Section */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header / Stats Metrics Bar */}
        <header className="h-24 bg-white border-b border-slate-200 flex items-center px-8 gap-8 flex-shrink-0 z-10 no-print">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Penagihan</span>
            <span className="text-2xl font-mono font-bold text-slate-900 mt-1">{formatRupiah(totalTagihanTerbit)}</span>
          </div>
          <div className="w-px h-10 bg-slate-200"></div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Terbayar</span>
            <span className="text-2xl font-mono font-bold text-emerald-600 mt-1">{formatRupiah(totalDanaTerbayar)}</span>
          </div>
          <div className="w-px h-10 bg-slate-200"></div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sisa Tunggakan</span>
            <span className="text-2xl font-mono font-bold text-rose-500 mt-1">{formatRupiah(totalTunggakan)}</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right hidden md:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Status Sistem</span>
              <span className="text-xs text-emerald-500 font-bold flex items-center gap-1 justify-end mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                CONNECTED TO GAS
              </span>
            </div>
            
            <button 
              onClick={() => navigateToTab('tagihan')} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded text-xs font-bold transition-all shadow-md shadow-blue-150 uppercase tracking-wider border border-blue-700/40"
            >
              Generate Tagihan Baru
            </button>
          </div>
        </header>

        {/* Core Frame App Content Canvas Layout */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              siswaList={siswaList}
              tagihanList={tagihanList}
              logList={logList}
              onNavigateToTab={navigateToTab}
              onSelectSiswaForPayment={handleSelectSiswaForPayment}
            />
          )}

          {activeTab === 'siswa' && (
            <MasterSiswaTab 
              siswaList={siswaList}
              onAddSiswa={handleAddNewSiswa}
              onUpdateSiswa={handleUpdateSiswa}
              onDeleteSiswa={handleDeleteSiswa}
              onSelectSiswaForPayment={handleSelectSiswaForPayment}
            />
          )}

          {activeTab === 'tagihan' && (
            <BillingGeneratorTab 
              siswaList={siswaList}
              tagihanList={tagihanList}
              jenisTagihanList={jenisTagihanList}
              onGenerateTagihan={handleTriggerBillingGeneration}
              onAddJenisTagihan={handleAddJenisTagihan}
              onUpdateJenisTagihan={handleUpdateJenisTagihan}
              onDeleteJenisTagihan={handleDeleteJenisTagihan}
              onAddManualTagihan={handleAddManualTagihan}
              onDeleteTagihan={handleDeleteTagihan}
              onAddMultipleTagihan={handleAddMultipleTagihan}
              onSelectSiswaForPayment={handleSelectSiswaForPayment}
            />
          )}

          {activeTab === 'loket' && (
            <LoketPembayaranTab 
              siswaList={siswaList}
              tagihanList={tagihanList}
              onCommitPembayaran={handleCommitPembayaran}
              activeNisnSiswaSelection={deskSiswaNisnSelection}
              schoolIdentity={schoolIdentity}
              adminSettings={adminSettings}
            />
          )}

          {activeTab === 'riwayat' && (
            <LogPembayaranTab 
              logList={logList}
              siswaList={siswaList}
              tagihanList={tagihanList}
              schoolIdentity={schoolIdentity}
              adminSettings={adminSettings}
              onCancelPembayaran={handleCancelPembayaran}
            />
          )}

          {activeTab === 'rekap' && (
            <RekapPenerimaanTab 
              siswaList={siswaList}
              tagihanList={tagihanList}
              logList={logList}
              schoolIdentity={schoolIdentity}
              adminSettings={adminSettings}
            />
          )}

          {activeTab === 'settings' && (
            <PengaturanTab 
              schoolIdentity={schoolIdentity}
              adminSettings={adminSettings}
              onUpdateSchoolIdentity={updateSchoolIdentityAndStore}
              onUpdateAdminSettings={updateAdminSettingsAndStore}
              onLogout={handleLogout}
              onResetData={handleResetSimulatorData}
            />
          )}

          {activeTab === 'script' && (
            <ScriptHubTab />
          )}

          {/* Embedded Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200 pb-2 text-center text-xs text-slate-400 font-medium flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            <p>&copy; 2026 {schoolIdentity.namaYayasan}. Hak Cipta Dilindungi.</p>
            <p className="flex items-center gap-1.5 tracking-tight font-semibold">
              <span>Sync Protocol: Google Sheets API v4</span>
              <span>&bull;</span>
              <span className="text-blue-600 font-mono text-[10px] uppercase">GAS Enterprise Architect Edition</span>
            </p>
          </footer>

        </div>
      </main>

    </div>
  );
}
