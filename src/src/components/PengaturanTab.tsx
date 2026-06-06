import React, { useState } from 'react';
import { SchoolIdentity, AdminSettings } from '../types';
import { 
  Building, 
  UserCheck, 
  Key, 
  Save, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Settings, 
  ShieldCheck,
  Check,
  Building2,
  Mail,
  Phone,
  MapPin,
  Signature,
  UserPlus,
  Trash2
} from 'lucide-react';

interface PengaturanTabProps {
  schoolIdentity: SchoolIdentity;
  adminSettings: AdminSettings;
  onUpdateSchoolIdentity: (id: SchoolIdentity) => void;
  onUpdateAdminSettings: (adm: AdminSettings) => void;
  onLogout: () => void;
  onResetData: () => void;
}

export default function PengaturanTab({
  schoolIdentity,
  adminSettings,
  onUpdateSchoolIdentity,
  onUpdateAdminSettings,
  onLogout,
  onResetData
}: PengaturanTabProps) {
  // Local state for School Identity
  const [schYayasan, setSchYayasan] = useState(schoolIdentity.namaYayasan);
  const [schSekolah, setSchSekolah] = useState(schoolIdentity.namaSekolah);
  const [schAlamat, setSchAlamat] = useState(schoolIdentity.alamat);
  const [schTelp, setSchTelp] = useState(schoolIdentity.telp);
  const [schEmail, setSchEmail] = useState(schoolIdentity.email);
  const [schPrefix, setSchPrefix] = useState(schoolIdentity.prefixKuitansi);
  const [schLogo, setSchLogo] = useState(schoolIdentity.logoInitial);

  // Local state for Admin settings & signatures
  const [admKasir, setAdmKasir] = useState(adminSettings.namaKasirDefault);
  const [cashierList, setCashierList] = useState<string[]>(
    adminSettings.daftarKasir || ["Staff Kasir TU", "Pak Mulyono (Staff TU)", "Ibu Sunarti (Bendahara Pembantu)"]
  );
  const [newCashierName, setNewCashierName] = useState('');
  const [admBendahara, setAdmBendahara] = useState(adminSettings.namaBendahara);
  const [admNipBendahara, setAdmNipBendahara] = useState(adminSettings.nipBendahara);
  const [admKepsek, setAdmKepsek] = useState(adminSettings.namaKepsek);
  const [admNipKepsek, setAdmNipKepsek] = useState(adminSettings.nipKepsek);
  
  // Security
  const [admUser, setAdmUser] = useState(adminSettings.usernameAdmin);
  const [admPass, setAdmPass] = useState(adminSettings.passwordAdmin);
  const [showPassword, setShowPassword] = useState(false);

  // States for save notifications
  const [isSavedSchool, setIsSavedSchool] = useState(false);
  const [isSavedAdmin, setIsSavedAdmin] = useState(false);

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolIdentity({
      namaYayasan: schYayasan,
      namaSekolah: schSekolah,
      alamat: schAlamat,
      telp: schTelp,
      email: schEmail,
      prefixKuitansi: schPrefix,
      logoInitial: schLogo
    });
    setIsSavedSchool(true);
    setTimeout(() => setIsSavedSchool(false), 3000);
  };

  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdminSettings({
      namaKasirDefault: admKasir,
      namaBendahara: admBendahara,
      nipBendahara: admNipBendahara,
      namaKepsek: admKepsek,
      nipKepsek: admNipKepsek,
      usernameAdmin: admUser,
      passwordAdmin: admPass,
      daftarKasir: cashierList
    });
    setIsSavedAdmin(true);
    setTimeout(() => setIsSavedAdmin(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title banner */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 animate-spin-slow" />
            Pengaturan Identitas & Kredensial Keuangan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasikan legalitas yayasan, kop surat otomatis kuitansi, nama bendahara sekertariat, kepala sekolah, serta otoritas login admin.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-rose-600 font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded border border-rose-200 transition-colors cursor-pointer"
        >
          Keluar dari Sesi (Logout)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. IDENTITAS SEKOLAH FORM */}
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              1. Identitas Lembaga / Sekolah
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Disematkan otomatis pada Kop Surat rekapitulasi, cetak kuitansi, & tanda terima siswa.</p>
          </div>

          <form onSubmit={handleSaveSchool} className="p-5 space-y-4 flex-1">
            <div className="space-y-3.5">
              {/* Nama Yayasan */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nama Yayasan Pembina</label>
                <input
                  type="text"
                  value={schYayasan}
                  onChange={(e) => setSchYayasan(e.target.value)}
                  placeholder="Contoh: YAYASAN PENDIDIKAN HARAPAN UTAMA"
                  className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold p-2.5 rounded focus:outline-hidden"
                  required
                />
              </div>

              {/* Nama Sekolah */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nama Satuan Pendidikan (Sekolah)</label>
                <input
                  type="text"
                  value={schSekolah}
                  onChange={(e) => setSchSekolah(e.target.value)}
                  placeholder="Contoh: SMP - SMA HARAPAN UTAMA JAKARTA"
                  className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold p-2.5 rounded focus:outline-hidden"
                  required
                />
              </div>

              {/* Grid Alamat, Telp, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> No. Telepon
                  </label>
                  <input
                    type="text"
                    value={schTelp}
                    onChange={(e) => setSchTelp(e.target.value)}
                    placeholder="(021) 555-xxxx"
                    className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold p-2.5 rounded focus:outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" /> Email Resmi
                  </label>
                  <input
                    type="email"
                    value={schEmail}
                    onChange={(e) => setSchEmail(e.target.value)}
                    placeholder="info@sekolah.sch.id"
                    className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold p-2.5 rounded focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Alamat Fisik Lengkap
                </label>
                <textarea
                  value={schAlamat}
                  onChange={(e) => setSchAlamat(e.target.value)}
                  rows={2}
                  placeholder="Jl. Pendidikan No. 45, Kompleks Pendidikan..."
                  className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold p-2.5 rounded focus:outline-hidden resize-none"
                  required
                />
              </div>

              {/* Grid Prefix, Initials */}
              <div className="grid grid-cols-2 gap-3.5 pt-1.5 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Prefix Nomor Kuitansi
                  </label>
                  <input
                    type="text"
                    value={schPrefix}
                    onChange={(e) => setSchPrefix(e.target.value)}
                    placeholder="KWT"
                    maxLength={10}
                    className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-bold p-2.5 rounded focus:outline-hidden font-mono text-center"
                    required
                  />
                  <span className="text-[9px] text-slate-400 block">*Format: PREFIX-YYYYMMDD-SERIAL</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Inisial Singkat Logo
                  </label>
                  <input
                    type="text"
                    value={schLogo}
                    onChange={(e) => setSchLogo(e.target.value)}
                    placeholder="YPU"
                    maxLength={5}
                    className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-bold p-2.5 rounded focus:outline-hidden font-mono text-center uppercase"
                    required
                  />
                  <span className="text-[9px] text-slate-400 block">*Maksimum 5 karakter inisial bulatan kop</span>
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              {isSavedSchool ? (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-fade-in">
                  <Check className="w-4 h-4" /> Berhasil Disimpan!
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" /> Simpan Identitas Sekolah
              </button>
            </div>
          </form>
        </div>

        {/* 2. ADMIN KEUANGAN & SIGNATURES & SECURITY FORM */}
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Signature className="w-4 h-4 text-emerald-600" />
              2. Penandatangan & Akun Keamanan
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Konfigurasi nama bendahara/petugas & kredensial password login dashboard utama.</p>
          </div>

          <form onSubmit={handleSaveAdmin} className="p-5 space-y-4 flex-1">
            <div className="space-y-3.5">
              
              {/* Menu & Dropdown Pemilihan Kasir Penerima Aktif */}
              <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block font-sans">
                    👥 Pilih Kasir Penerima Aktif
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Pilih kasir bertugas yang akan tercetak otomatis pada kuitansi transaksi pembayaran baru.
                  </p>
                  <div className="relative mt-1">
                    <select
                      value={admKasir}
                      onChange={(e) => setAdmKasir(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-xs font-bold p-2.5 rounded focus:outline-hidden cursor-pointer"
                    >
                      {cashierList.map((kasir, idx) => (
                        <option key={idx} value={kasir}>
                          {kasir}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                    Kelola / Tambah Nama Staf Kasir Baru
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCashierName}
                      onChange={(e) => setNewCashierName(e.target.value)}
                      placeholder="Contoh: Ibu Ranti (Staf TU)"
                      className="flex-1 bg-white border border-slate-200 hover:border-slate-350 text-xs font-semibold p-2 rounded focus:outline-hidden transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = newCashierName.trim();
                        if (trimmed) {
                          if (cashierList.includes(trimmed)) {
                            alert("Nama kasir ini sudah terdaftar!");
                            return;
                          }
                          const updated = [...cashierList, trimmed];
                          setCashierList(updated);
                          setNewCashierName('');
                          // Set newly added cashier as active default immediately!
                          setAdmKasir(trimmed);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-3 py-2 rounded flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Tambah
                    </button>
                  </div>

                  {/* Registered Cashier Chips list */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Daftar Staf Kasir Terdaftar (Klik untuk memilih):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cashierList.map((kasir, idx) => (
                        <div 
                          key={idx}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs border transition-all ${
                            admKasir === kasir
                              ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 font-medium'
                          }`}
                        >
                          <span 
                            className="cursor-pointer"
                            onClick={() => setAdmKasir(kasir)}
                          >
                            {kasir}
                          </span>
                          
                          {cashierList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const remaining = cashierList.filter(item => item !== kasir);
                                setCashierList(remaining);
                                if (admKasir === kasir) {
                                  setAdmKasir(remaining[0]);
                                }
                              }}
                              className={`rounded-full p-0.5 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer ${
                                admKasir === kasir ? 'text-blue-200' : 'text-slate-400'
                              }`}
                              title="Hapus dari daftar kasir"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bendahara Sekolah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nama Bendahara Sekolah</label>
                  <input
                    type="text"
                    value={admBendahara}
                    onChange={(e) => setAdmBendahara(e.target.value)}
                    placeholder="Dra. Hj. Wahyuni Rahayu"
                    className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold p-2.5 rounded focus:outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">NIP/NIK Bendahara</label>
                  <input
                    type="text"
                    value={admNipBendahara}
                    onChange={(e) => setAdmNipBendahara(e.target.value)}
                    placeholder="NIP. 19741211..."
                    className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold p-2.5 rounded focus:outline-hidden font-mono"
                    required
                  />
                </div>
              </div>

              {/* Kepala Sekolah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    value={admKepsek}
                    onChange={(e) => setAdmKepsek(e.target.value)}
                    placeholder="Drs. H. Mulyadi Kusuma, M.Pd"
                    className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold p-2.5 rounded focus:outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">NIP/NIK Kepala Sekolah</label>
                  <input
                    type="text"
                    value={admNipKepsek}
                    onChange={(e) => setAdmNipKepsek(e.target.value)}
                    placeholder="NIP. 19680327..."
                    className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-semibold p-2.5 rounded focus:outline-hidden font-mono"
                    required
                  />
                </div>
              </div>

              {/* Kredensial Login Admin */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block font-sans">
                  Kredensial Sesi Login Keuangan
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Username Otoritas</label>
                    <input
                      type="text"
                      value={admUser}
                      onChange={(e) => setAdmUser(e.target.value)}
                      placeholder="Username"
                      className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-bold p-2.5 rounded focus:outline-hidden font-mono text-charcon-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                      <span>Password Otoritas</span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-blue-500 hover:text-blue-600 font-bold text-[9px] uppercase tracking-wider"
                      >
                        {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                      </button>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={admPass}
                        onChange={(e) => setAdmPass(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-slate-50 border border-slate-200 hover:bg-white text-xs font-bold p-2.5 rounded focus:outline-hidden font-mono text-charcon-700 pr-9"
                        required
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
                        {showPassword ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              {isSavedAdmin ? (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-fade-in">
                  <Check className="w-4 h-4" /> Berhasil Disimpan!
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" /> Simpan Penandatangan & Sandi
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* 3. SIMULATOR HEALTH & DANGER ZONE */}
      <div className="bg-rose-50/40 border border-rose-100 rounded p-6 shadow-xs space-y-4">
        <div>
          <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            Zona Penyehatan & Atur Ulang Data Pembukuan
          </h4>
          <p className="text-xs text-rose-600 mt-1 leading-relaxed">
            Jika data simulasi di browser dirasa terlalu penuh, Anda dapat mengembalikan seluruh catatan tagihan, log kuitansi, dan data master siswa ke kondisi awal (default) pabrikan.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={onResetData}
            className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs uppercase tracking-wider py-2 px-4 rounded transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
            Setel Ulang (Reset) Semua Catatan Pembukuan
          </button>
          
          <button
            onClick={onLogout}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider py-2 px-4 rounded shadow-xs cursor-pointer"
          >
            Log Out Keuangan Sekarang
          </button>
        </div>
      </div>

    </div>
  );
}
