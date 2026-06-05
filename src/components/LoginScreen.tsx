import React, { useState } from 'react';
import { SchoolIdentity, AdminSettings } from '../types';
import { 
  Lock, 
  User, 
  Key, 
  School, 
  ShieldCheck, 
  Building2, 
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';

interface LoginScreenProps {
  schoolIdentity: SchoolIdentity;
  adminSettings: AdminSettings;
  onLoginSuccess: () => void;
}

export default function LoginScreen({
  schoolIdentity,
  adminSettings,
  onLoginSuccess
}: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const correctUser = adminSettings.usernameAdmin || 'admin';
    const correctPassword = adminSettings.passwordAdmin || 'admin123';

    if (username === correctUser && password === correctPassword) {
      setErrorMsg(null);
      onLoginSuccess();
    } else {
      setErrorMsg('Username atau Password yang Anda masukkan tidak valid. Silakan periksa kembali kredensial Anda.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between items-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Top spacing */}
      <div />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-8 relative overflow-hidden my-auto space-y-6">
        
        {/* Abstract glowing sphere decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* School Branding */}
        <div className="text-center space-y-2.5 relative">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-black text-lg mx-auto shadow-lg shadow-blue-900/40">
            {schoolIdentity.logoInitial || 'YPU'}
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-slate-100 uppercase font-sans">
              SchoolPay <span className="text-blue-400">Pro</span>
            </h1>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
              {schoolIdentity.namaSekolah || 'SISTEM ADMINISTRASI SEKOLAH'}
            </p>
          </div>
        </div>

        {/* Login Form card */}
        <div className="bg-slate-900/50 rounded p-1 space-y-4">
          <div className="text-center">
            <span className="text-[9px] font-extrabold text-blue-500 bg-blue-900/30 border border-blue-500/25 px-2.5 py-1 tracking-widest rounded-full uppercase">
              🔐 SISTEM OTORITAS KEUANGAN
            </span>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-medium">Username Admin</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan Username"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-100 font-semibold text-xs py-3 px-10 rounded focus:outline-hidden focus:border-blue-500 font-mono transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <label className="font-black text-slate-400 uppercase tracking-wider block font-medium">Password Otoritas</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-300 font-extrabold tracking-wider"
                >
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Key className="w-3.5 h-3.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan Password"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-100 font-semibold text-xs py-3 px-10 rounded focus:outline-hidden focus:border-blue-500 font-mono transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Validation Feedback */}
            {errorMsg && (
              <div className="bg-rose-900/20 border border-rose-500/20 text-[11px] text-rose-300 p-3 rounded flex items-start gap-2.5 animate-fade-in font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-3 rounded cursor-pointer transition-all shadow-md shadow-blue-900/30 flex items-center justify-center gap-1.5 active:scale-[0.985]"
            >
              Autentikasi Sekarang
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Demo Account Callout Widget (Helper) */}
        <div className="bg-slate-950 border border-slate-800/80 rounded p-4 text-slate-400 text-[10.5px] leading-relaxed space-y-1.5">
          <p className="font-extrabold uppercase text-[7.5px] tracking-widest text-slate-500">
            ℹ️ Petunjuk Kredensial Uji Coba:
          </p>
          <p>
            Gunakan kredensial default untuk mengakses dasbor admin keuangan:
          </p>
          <div className="font-mono text-[10px] text-blue-400 flex flex-col font-bold bg-slate-900 px-3 py-1.5 rounded border border-slate-800/40">
            <span>Username: <strong className="text-white bg-slate-800 px-1 py-0.5 rounded">{adminSettings.usernameAdmin || 'admin'}</strong></span>
            <span className="mt-1">Password: <strong className="text-white bg-slate-800 px-1 py-0.5 rounded">{adminSettings.passwordAdmin || 'admin123'}</strong></span>
          </div>
          <p className="text-[9.5px] italic text-slate-500 mt-1">
            *Kredensial di atas sepenuhnya dapat dirubah melalui tab Pengaturan di dalam dasbor nanti.
          </p>
        </div>

      </div>

      {/* Footer Credentials */}
      <div className="text-center text-[10px] text-slate-650 font-medium py-4 space-y-1">
        <p>&copy; 2026 {schoolIdentity.namaYayasan || 'Yayasan Pendidikan Harapan Utama'}. Hak Cipta Dilindungi.</p>
        <p className="font-mono text-[9px] uppercase tracking-wide">SECURE SHARESYNC CORE v2.4.0 (GAS ENTERPRISE)</p>
      </div>
    </div>
  );
}
