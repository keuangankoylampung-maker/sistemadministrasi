import React, { useState } from 'react';
import { Siswa } from '../types';
import { 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  GraduationCap, 
  Check, 
  AlertCircle,
  Plus,
  HelpCircle,
  Percent,
  Coins
} from 'lucide-react';
import { formatRupiah } from './DashboardOverview';

interface MasterSiswaTabProps {
  siswaList: Siswa[];
  onAddSiswa: (siswa: Siswa) => void;
  onUpdateSiswa: (siswa: Siswa) => void;
  onDeleteSiswa: (nisn: string) => void;
  onSelectSiswaForPayment?: (nisn: string) => void;
}

export default function MasterSiswaTab({
  siswaList,
  onAddSiswa,
  onUpdateSiswa,
  onDeleteSiswa,
  onSelectSiswaForPayment
}: MasterSiswaTabProps) {
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState<'Semua' | 'SMP' | 'SMA'>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);

  // Form States
  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [jenjang, setJenjang] = useState<'SMP' | 'SMA'>('SMP');
  const [kelas, setKelas] = useState('');
  const [angkatan, setAngkatan] = useState('2026');
  const [tarifSpp, setTarifSpp] = useState(250000);
  const [tarifUangGedung, setTarifUangGedung] = useState(1500000);
  const [potonganBeasiswa, setPotonganBeasiswa] = useState(0);
  const [catatan, setCatatan] = useState('');

  // Form Errors
  const [error, setError] = useState('');

  // Filtering
  const filteredSiswa = siswaList.filter(s => {
    const matchesSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.nisn.includes(searchTerm);
    const matchesJenjang = jenjangFilter === 'Semua' || s.jenjang === jenjangFilter;
    return matchesSearch && matchesJenjang;
  });

  const handleOpenAddModal = () => {
    setEditingSiswa(null);
    setNisn('');
    setNama('');
    setJenjang('SMP');
    setKelas('');
    setAngkatan('2026');
    setTarifSpp(250000);
    setTarifUangGedung(1500000);
    setPotonganBeasiswa(0);
    setCatatan('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: Siswa) => {
    setEditingSiswa(s);
    setNisn(s.nisn);
    setNama(s.nama);
    setJenjang(s.jenjang);
    setKelas(s.kelas);
    setAngkatan(s.angkatan);
    setTarifSpp(s.tarifSpp);
    setTarifUangGedung(s.tarifUangGedung);
    setPotonganBeasiswa(s.potonganBeasiswa);
    setCatatan(s.catatan);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!nisn.trim() || !nama.trim() || !kelas.trim()) {
      setError('Mohon lengkapi kolom NISN, Nama, dan Kelas siswa.');
      return;
    }

    if (!editingSiswa && siswaList.some(s => s.nisn === nisn.trim())) {
      setError('NISN siswa sudah terdaftar di sistem. Mohon gunakan NISN yang unik.');
      return;
    }

    const payload: Siswa = {
      nisn: nisn.trim(),
      nama: nama.trim(),
      jenjang,
      kelas: kelas.trim(),
      angkatan,
      tarifSpp: Number(tarifSpp) || 0,
      tarifUangGedung: Number(tarifUangGedung) || 0,
      potonganBeasiswa: Number(potonganBeasiswa) || 0,
      catatan: catatan.trim()
    };

    if (editingSiswa) {
      onUpdateSiswa(payload);
    } else {
      onAddSiswa(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 text-left">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sorting / Filter tabs */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded border border-slate-200 w-fit">
          {(['Semua', 'SMP', 'SMA'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setJenjangFilter(filter)}
              className={`px-4 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                jenjangFilter === filter 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search input and action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] md:flex-none">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari nama atau NISN siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded py-2 pl-9 pr-4 text-xs font-semibold text-slate-705 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded transition duration-150 flex items-center gap-2 uppercase tracking-wider border border-blue-700/40 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Database Grid Table */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                <th className="py-4 px-5">Profil Siswa</th>
                <th className="py-4 px-4 text-center">Kelas & Angkatan</th>
                <th className="py-4 px-4 text-right">Tarif Dasar SPP</th>
                <th className="py-4 px-4 text-center">Beasiswa / Potongan</th>
                <th className="py-4 px-4 text-right">Tarif Bersih SPP</th>
                <th className="py-4 px-4 text-right">Tarif Biaya Gedung</th>
                <th className="py-4 px-5 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredSiswa.length > 0 ? (
                filteredSiswa.map((siswa) => {
                  const hasBeasiswa = siswa.potonganBeasiswa > 0;
                  const customTariffClean = Math.round(siswa.tarifSpp * (1 - (siswa.potonganBeasiswa / 100)));

                  return (
                    <tr key={siswa.nisn} className="hover:bg-slate-50/40 transition-all duration-150">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded flex items-center justify-center font-bold text-[11px] font-mono border ${
                            siswa.jenjang === 'SMP' ? 'bg-sky-50 text-sky-600 border-sky-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                          }`}>
                            {siswa.jenjang}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{siswa.nama}</p>
                            <p className="text-[10px] text-slate-450 font-mono mt-0.5">NISN: {siswa.nisn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block bg-slate-50 text-slate-800 font-bold px-2 py-1 rounded border border-slate-200">
                          {siswa.kelas}
                        </span>
                        <p className="text-[10px] text-slate-450 mt-1 uppercase font-semibold">Angkatan {siswa.angkatan}</p>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-slate-500">
                        {formatRupiah(siswa.tarifSpp)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {hasBeasiswa ? (
                          <div className="inline-flex gap-1 items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                            <Percent className="w-2.5 h-2.5" />
                            <span>{siswa.potonganBeasiswa}%</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-mono">-</span>
                        )}
                        {siswa.catatan && (
                          <p className="text-[10px] text-slate-400 line-clamp-1 italic mt-0.5">{siswa.catatan}</p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-blue-600">
                        {formatRupiah(customTariffClean)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-slate-550">
                        {formatRupiah(siswa.tarifUangGedung)}
                      </td>
                      <td className="py-4 px-5 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          {onSelectSiswaForPayment && (
                            <button
                              onClick={() => onSelectSiswaForPayment(siswa.nisn)}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-350 rounded flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              title="Proses Bayar SPP/Tagihan di Loket"
                            >
                              <Coins className="w-3.5 h-3.5" />
                              <span>Bayar</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(siswa)}
                            className="p-1.5 text-slate-400 hover:text-blue-650 hover:bg-slate-50 rounded transition-all cursor-pointer border border-transparent hover:border-slate-200"
                            title="Edit Tarif & Profil"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus siswa ${siswa.nama}? Ini akan menghapus data profil di Master_Siswa.`)) {
                                onDeleteSiswa(siswa.nisn);
                              }
                            }}
                            className="p-1.5 text-slate-455 hover:text-rose-650 hover:bg-slate-50 rounded transition-all cursor-pointer border border-transparent hover:border-slate-200"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-650">Tidak ada data siswa ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Tambah Siswa" atau bersihkan filter pencarian.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Legend / Status Footer */}
        <div className="bg-slate-50/50 border-t border-slate-150 p-4 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 font-semibold">
          <p>
            Menampilkan <span className="font-bold text-slate-900">{filteredSiswa.length}</span> dari <span className="font-bold text-slate-900">{siswaList.length}</span> baris siswa Master.
          </p>
          <div className="flex items-center gap-4 text-[10px] uppercase">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-sky-100 border border-sky-300 block"></span>
              Siswa SMP
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-300 block"></span>
              Siswa SMA
            </span>
          </div>
        </div>
      </div>

      {/* Modal Dialog for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 animate-fade-in no-print">
          <div className="bg-white rounded border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-850 text-sm uppercase tracking-wide">
                  {editingSiswa ? 'Edit Profil & Tarif Kustom Siswa' : 'Tambah Database Siswa Baru'}
                </h3>
                <p className="text-xs text-slate-550 mt-0.5">
                  {editingSiswa ? `Ubah nominal tarif khusus untuk siswa ${nama}` : 'Profil otomatis dibentuk ke Sheet Master_Siswa'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-left">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded text-xs font-semibold flex items-center gap-2 border border-rose-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* NISN & NAMA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">NISN (Wajib & Unik)</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    disabled={!!editingSiswa}
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 0081234567"
                    className="w-full bg-slate-50 border border-slate-205 rounded py-2 px-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">Nama Lengkap Siswa</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Ahmad Fauzi"
                    className="w-full bg-slate-50 border border-slate-205 rounded py-2 px-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white animate-pulse-none"
                  />
                </div>
              </div>

              {/* JENJANG, KELAS, ANGKATAN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">Jenjang</label>
                  <select
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value as 'SMP' | 'SMA')}
                    className="w-full bg-slate-50 border border-slate-205 rounded py-2 px-3 text-xs font-semibold text-slate-705 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                  >
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">Kelas (Rombel)</label>
                  <input
                    type="text"
                    required
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="Contoh: 7-A"
                    className="w-full bg-slate-50 border border-slate-205 rounded py-2 px-3 text-xs font-semibold text-slate-705 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">Angkatan (Tahun)</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={angkatan}
                    onChange={(e) => setAngkatan(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 2026"
                    className="w-full bg-slate-50 border border-slate-205 rounded py-2 px-3 text-xs font-semibold text-slate-705 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* TARIF KUSTOMISASI INDIVIDUAL */}
              <div className="border-t border-dashed border-slate-205 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-blue-600 border-l-2 border-blue-500 pl-2 uppercase tracking-wide">Tarif Kustom Individual</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">Tarif SPP Bulanan Dasar (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={tarifSpp}
                      onChange={(e) => setTarifSpp(Number(e.target.value))}
                      placeholder="Contoh: 250000"
                      className="w-full bg-slate-50 border border-slate-205 rounded py-2 px-3 text-xs font-semibold text-slate-705 focus:outline-hidden focus:border-blue-500 focus:bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">Tarif Biaya Gedung/Pangkal (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={tarifUangGedung}
                      onChange={(e) => setTarifUangGedung(Number(e.target.value))}
                      placeholder="Contoh: 1500000"
                      className="w-full bg-slate-50 border border-slate-205 rounded py-2 px-3 text-xs font-semibold text-slate-705 focus:outline-hidden focus:border-blue-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 flex items-center gap-1.5 font-sans">
                      Potongan Beasiswa (%)
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500 cursor-help" title="Nilai potongan dalam persen e.g., 50 otomatis mengurangi tagihan SPP menjadi separuhnya." />
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={potonganBeasiswa}
                      onChange={(e) => setPotonganBeasiswa(Number(e.target.value))}
                      placeholder="Beasiswa (0 - 100)"
                      className="w-full bg-slate-50 border border-slate-205 rounded py-2 px-3 text-xs font-semibold text-slate-705 focus:outline-hidden focus:border-blue-500 focus:bg-white font-sans"
                    />
                    <p className="text-[10px] text-slate-500 mt-2 italic font-semibold">
                      Tagihan Bersih Bulanan SPP: <span className="font-bold text-blue-600 font-mono">{formatRupiah(Math.round(tarifSpp * (1 - (potonganBeasiswa / 100))))}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1 font-sans">Catatan Keterangan Beasiswa</label>
                    <input
                      type="text"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="e.g. Prestasi Akademik / Beasiswa Khusus"
                      className="w-full bg-slate-50 border border-slate-205 rounded py-2 px-3 text-xs font-semibold text-slate-705 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="border-t border-slate-205 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition duration-150 uppercase tracking-wider cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition duration-150 uppercase tracking-wider border border-blue-700/40 cursor-pointer"
                >
                  {editingSiswa ? 'Simpan' : 'Daftarkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
