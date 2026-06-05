import React from 'react';
import { Siswa, Tagihan, LogPembayaran } from '../types';
import { 
  Users, 
  Receipt, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  TrendingUp, 
  Coins, 
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

interface DashboardOverviewProps {
  siswaList: Siswa[];
  tagihanList: Tagihan[];
  logList: LogPembayaran[];
  onNavigateToTab: (tab: string) => void;
  onSelectSiswaForPayment: (nisn: string) => void;
}

export const formatRupiah = (v: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(v);
};

export default function DashboardOverview({
  siswaList,
  tagihanList,
  logList,
  onNavigateToTab,
  onSelectSiswaForPayment
}: DashboardOverviewProps) {
  // 1. Calculations
  const totalSiswa = siswaList.length;
  const totalSiswaSMP = siswaList.filter(s => s.jenjang === 'SMP').length;
  const totalSiswaSMA = siswaList.filter(s => s.jenjang === 'SMA').length;

  const totalTagihanTerbit = tagihanList.reduce((acc, t) => acc + t.nominalTagihan, 0);
  const totalDanaTerbayar = tagihanList.reduce((acc, t) => acc + t.jumlahBayar, 0);
  const totalTunggakan = tagihanList.reduce((acc, t) => acc + t.sisaTunggakan, 0);

  const lunasCount = tagihanList.filter(t => t.status === 'Lunas').length;
  const cicilCount = tagihanList.filter(t => t.status === 'Mencicil').length;
  const belumBayarCount = tagihanList.filter(t => t.status === 'Belum Bayar').length;
  const percentLunas = tagihanList.length > 0 ? Math.round((lunasCount / tagihanList.length) * 100) : 0;

  // Let's extract recent transactions
  const recentLogs = [...logList].sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded border border-slate-200 shadow-sm hover:border-slate-350 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Dana Terkumpul</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-2 font-mono tracking-tight">{formatRupiah(totalDanaTerbayar)}</h3>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Dari tuntas terbit {formatRupiah(totalTagihanTerbit)}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center border border-emerald-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-slate-200 shadow-sm hover:border-slate-350 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Sisa Tunggakan</p>
              <h3 className="text-2xl font-bold text-rose-500 mt-2 font-mono tracking-tight">{formatRupiah(totalTunggakan)}</h3>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                {Math.round((totalTunggakan / (totalTagihanTerbit || 1)) * 100)}% Rasio Tunggakan Siswa
              </p>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded flex items-center justify-center border border-rose-100">
              <Coins className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-slate-200 shadow-sm hover:border-slate-350 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Statistik Siswa Aktif</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2 font-sans tracking-tight">{totalSiswa} Siswa</h3>
              <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                SMP: <span className="text-blue-600 font-mono">{totalSiswaSMP}</span> | SMA: <span className="text-blue-600 font-mono">{totalSiswaSMA}</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded flex items-center justify-center border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-slate-200 shadow-sm hover:border-slate-350 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Penyelesaian Tagihan</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2 font-sans tracking-tight">{percentLunas}% Lunas</h3>
              <div className="w-28 bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${percentLunas}%` }}
                />
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded flex items-center justify-center border border-blue-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Chart & Recent Transaction Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Chart Card */}
        <div className="lg:col-span-2 bg-white rounded border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider">Status Keuangan Terbitan</h3>
              <p className="text-xs text-slate-500">Kalkulasi tagihan dan status penyelesaian</p>
            </div>
            <span className="text-[10px] bg-slate-50 text-slate-650 font-bold uppercase tracking-wider px-3 py-1 rounded border border-slate-200">
              Periode Aktif
            </span>
          </div>

          {/* Tagihan Status Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-bold text-slate-700">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>Lunas ({lunasCount} Tagihan)</span>
                <span className="font-mono">{formatRupiah(tagihanList.filter(t => t.status === 'Lunas').reduce((acc, t) => acc + t.jumlahBayar, 0))}</span>
              </div>
              <div className="w-full bg-slate-150 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${tagihanList.length > 0 ? (lunasCount / tagihanList.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-bold text-slate-700">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>Mencicil ({cicilCount} Tagihan)</span>
                <span className="font-mono">{formatRupiah(tagihanList.filter(t => t.status === 'Mencicil').reduce((acc, t) => acc + t.jumlahBayar, 0))} (Terbayar)</span>
              </div>
              <div className="w-full bg-slate-150 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${tagihanList.length > 0 ? (cicilCount / tagihanList.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-bold text-slate-700">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>Belum Bayar ({belumBayarCount} Tagihan)</span>
                <span className="font-mono">{formatRupiah(tagihanList.filter(t => t.status === 'Belum Bayar').reduce((acc, t) => acc + t.nominalTagihan, 0))}</span>
              </div>
              <div className="w-full bg-slate-150 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${tagihanList.length > 0 ? (belumBayarCount / tagihanList.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-center">
            <div className="p-3 bg-slate-50 rounded border border-slate-205">
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Tarif SMP Rata-rata</span>
              <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                {formatRupiah(siswaList.filter(s => s.jenjang === 'SMP').reduce((acc, s) => acc + s.tarifSpp, 0) / (totalSiswaSMP || 1))}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-205">
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Tarif SMA Rata-rata</span>
              <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                {formatRupiah(siswaList.filter(s => s.jenjang === 'SMA').reduce((acc, s) => acc + s.tarifSpp, 0) / (totalSiswaSMA || 1))}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-205 border-dashed">
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Bebas SPP (Beasiswa 100%)</span>
              <p className="text-xs font-bold text-blue-600 mt-1">
                {siswaList.filter(s => s.potonganBeasiswa === 100).length} Siswa
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider">Log Penerimaan</h3>
                <p className="text-xs text-slate-500">5 Transaksi kasir terbaru</p>
              </div>
              <button 
                onClick={() => onNavigateToTab('riwayat')} 
                className="text-xs text-blue-600 hover:text-blue-850 font-bold uppercase tracking-wider flex items-center gap-0.5"
              >
                Audits
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {recentLogs.length > 0 ? (
                recentLogs.map((log, idx) => (
                  <div key={`${log.noKuitansi}-${idx}`} className="flex gap-3 items-start border-b border-dashed border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-100">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-slate-800 truncate">{log.nama}</p>
                        <span className="text-xs font-mono font-bold text-emerald-600 flex-shrink-0">+{formatRupiah(log.jumlahBayar)}</span>
                      </div>
                      <p className="text-[10px] text-slate-450 font-mono flex items-center gap-1 mt-0.5">
                        <span>{log.noKuitansi}</span>
                        <span>•</span>
                        <span>{log.metodeBayar}</span>
                      </p>
                      <p className="text-[11px] text-slate-550 line-clamp-1 mt-1 italic">
                        "{log.keterangan || 'Pembayaran SPP'}"
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-slate-350" />
                  <p className="text-xs font-bold uppercase tracking-wider">Belum ada transaksi.</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('loket')}
            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded text-xs transition duration-150 flex items-center justify-center gap-2 uppercase tracking-wider border border-blue-700/40"
          >
            <DollarSign className="w-4 h-4" />
            Buka Loket Pembayaran
          </button>
        </div>

      </div>

      {/* Info Banner / Call to action representing Google Sheets Link */}
      <div className="bg-slate-900 text-white border border-slate-850 p-6 rounded flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white uppercase tracking-widest font-mono border border-blue-500/20">Arsitektur Terkoneksi</span>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Integrasi Database Google Sheets</h4>
          </div>
          <p className="text-slate-405 text-xs">
            Aplikasi simulator ini dirancang berdasarkan relasi basis data nyata Google Sheets. Salin naskah script GAS siap pakai, pasang pada Google Sheets Anda, dan jalankan sistem otomatis berkecepatan tinggi.
          </p>
        </div>
        <button
          onClick={() => onNavigateToTab('script')}
          className="bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 px-4 rounded text-xs transition-all flex items-center gap-2 whitespace-nowrap uppercase tracking-wider shadow"
        >
          <GraduationCap className="w-4 h-4" />
          Pelajari & Salin Kode
        </button>
      </div>
    </div>
  );
}
