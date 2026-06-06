import React, { useState } from 'react';
import { appsScriptCodeGS } from '../appsScriptCode';
import { 
  Code2, 
  Copy, 
  Check, 
  Cpu, 
  Compass, 
  FileSpreadsheet, 
  Zap, 
  ShieldAlert, 
  AlertTriangle,
  Link,
  Globe,
  Wifi,
  WifiOff,
  Loader2,
  Play,
  Server,
  Info
} from 'lucide-react';

export default function ScriptHubTab() {
  const [copiedCodeFlag, setCopiedCodeFlag] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'script' | 'schema' | 'koneksi' | 'optimasi'>('script');

  // Connection testing states
  const [gasUrl, setGasUrl] = useState(() => localStorage.getItem('SA_SPP_GAS_URL') || '');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    timestamp?: string;
    spreadsheetName?: string;
  } | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCodeGS);
    setCopiedCodeFlag(true);
    setTimeout(() => setCopiedCodeFlag(false), 2000);
  };

  const handleSaveGasUrl = (url: string) => {
    const trimmed = url.trim();
    setGasUrl(trimmed);
    localStorage.setItem('SA_SPP_GAS_URL', trimmed);
  };

  const handleTestConnection = async () => {
    if (!gasUrl) {
      setTestResult({
        success: false,
        message: 'Mohon masukkan URL Web App Google Apps Script Anda terlebih dahulu.'
      });
      return;
    }

    if (!gasUrl.startsWith('https://script.google.com/')) {
      setTestResult({
        success: false,
        message: 'Format URL salah! URL harus dimulai dengan "https://script.google.com/macros/s/.../exec". Pastikan URL Anda mengarah ke Web App resmi Google Apps Script.'
      });
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    // Create a Controller to abort if timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

    try {
      // Send POST request with action: 'ping' using simple request (text/plain) to avoid CORS preflight issues
      const response = await fetch(gasUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({ action: 'ping' }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Fallback if returned HTML instead of JSON but seems from our doGet
        if (text.includes('Koneksi') || text.includes('Apps Script')) {
          setTestResult({
            success: true,
            message: 'Koneksi berhasil! Endpoint merespons dengan tampilan web statis dari fungsi doGet. Web App Anda siap digunakan.',
            timestamp: new Date().toLocaleTimeString()
          });
          return;
        } else {
          throw new Error('Hasil respon kosong atau bukan format JSON yang diharapkan.');
        }
      }

      if (data && data.success === true) {
        setTestResult({
          success: true,
          message: data.message || 'Pong! Koneksi berhasil terkonfirmasi.',
          timestamp: data.timestamp ? new Date(data.timestamp).toLocaleString('id-ID') : new Date().toLocaleTimeString(),
          spreadsheetName: data.spreadsheetName || 'Spreadsheet SPP Terhubung'
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || 'Server Code.gs merespons dengan status kegagalan operasi.'
        });
      }

    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Test connection error:', err);

      let errorMsg = 'Gagal terhubung ke Google Apps Script. ';
      if (err.name === 'AbortError') {
        errorMsg += 'Batas waktu tunggu (12 detik) habis. Endpoint tidak merespons atau sangat lambat.';
      } else {
        errorMsg += `${err.message || 'Masalah konektivitas jaringan atau URL Deployment tidak valid.'}`;
      }

      setTestResult({
        success: false,
        message: errorMsg
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('script')}
          className={`pb-3 text-xs font-bold border-b-2 px-4 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider whitespace-nowrap ${
            activeSubTab === 'script'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Kode GAS (Code.gs)
        </button>

        <button
          onClick={() => setActiveSubTab('schema')}
          className={`pb-3 text-xs font-bold border-b-2 px-4 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider whitespace-nowrap ${
            activeSubTab === 'schema'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Skema Google Sheets
        </button>

        <button
          onClick={() => setActiveSubTab('koneksi')}
          className={`pb-3 text-xs font-bold border-b-2 px-4 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider whitespace-nowrap ${
            activeSubTab === 'koneksi'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Link className="w-4 h-4 text-emerald-500" />
          🔌 Uji Cek Koneksi API
        </button>

        <button
          onClick={() => setActiveSubTab('optimasi')}
          className={`pb-3 text-xs font-bold border-b-2 px-4 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider whitespace-nowrap ${
            activeSubTab === 'optimasi'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Tips Optimasi (&lt; 6 Menit)
        </button>
      </div>

      {/* Subtab Contents */}
      {activeSubTab === 'script' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Naskah Google Apps Script Resmi</h3>
              <p className="text-xs text-slate-500">Salin naskah di bawah ini dan pasang di editor Google Apps Script spreadsheet Anda.</p>
            </div>

            <button
              onClick={handleCopyCode}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded transition duration-150 flex items-center gap-2 w-fit uppercase tracking-wider border border-blue-700/40 cursor-pointer"
            >
              {copiedCodeFlag ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Berhasil Disalin!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Salin Kode (Code.gs)
                </>
              )}
            </button>
          </div>

          {/* Code Viewer Container */}
          <div className="bg-slate-900 rounded border border-slate-800 shadow-xl overflow-hidden">
            <div className="bg-slate-850 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[10px] font-mono select-none font-bold">
              <span>Code.gs &nbsp;&bull;&nbsp; Google Apps Script Engine v1.3</span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider font-sans text-[9px] border border-emerald-500/20 px-1.5 py-0.5 rounded">Ready to Use</span>
            </div>
            <pre className="p-4 overflow-x-auto text-[11px] font-mono text-lime-400 max-h-[500px] overflow-y-auto leading-relaxed scrollbar-thin text-left bg-black/60">
              <code>{appsScriptCodeGS}</code>
            </pre>
          </div>

          {/* Steps implementation accordion cards */}
          <div className="bg-slate-50 rounded border border-slate-200 p-5 space-y-3 leading-relaxed font-sans">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Compass className="w-4.5 h-4.5 text-blue-600" />
              Langkah Sederhana Cara Pemasangan:
            </h4>
            <ol className="list-decimal list-inside text-xs text-slate-650 space-y-2 leading-relaxed font-medium">
              <li>Buka Google Spreadsheet yang sudah Anda siapkan sesuai outline schema tab database.</li>
              <li>Klik menu <strong className="text-slate-800 font-bold">Ekstensi &gt; Apps Script</strong> pada bagian atas toolbar Spreadsheet.</li>
              <li>Hapus seluruh kode bawaan kosong di dalam file editor <code className="font-bold text-blue-600 bg-white px-1 border border-slate-200">Code.gs</code>.</li>
              <li>Tempelkan (Paste) naskah script yang telah Anda salin di atas seutuhnya.</li>
              <li>Sesuaikan parameter variabel <code className="font-bold bg-white px-1">TEMPLATE_DOC_ID</code> jika ingin mengaktifkan opsi cetak PDF kuitansi kustom.</li>
              <li>Klik ikon <strong className="text-slate-800 font-bold">Simpan (Disket)</strong>, lalu jalankan fungsi <code className="font-bold text-blue-600 bg-white px-1">generateBulananTagihan</code> pertama kali untuk menyetujui izin keamanan Google.</li>
            </ol>
          </div>
        </div>
      )}

      {activeSubTab === 'schema' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Struktur Basis Data Google Sheets</h3>
            <p className="text-xs text-slate-500">Sesuaikan header baris ke-1 pada 3 tab spreadsheet berikut demi keakuratan integrasi script API.</p>
          </div>

          <div className="prose max-w-none text-xs text-slate-705 leading-relaxed font-sans space-y-4">
            
            {/* Sheet schemas from database generator details parsed */}
            <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-2">
              <h4 className="font-extrabold text-slate-850 flex items-center gap-1.5 text-xs m-0 uppercase tracking-wider text-blue-600">
                <span className="w-2 h-2 rounded-sm bg-blue-500"></span>
                TAB 1: Master_Siswa
              </h4>
              <p className="text-slate-500 text-[11px]">Menampung profil siswa dan tarif kustom individual. Admin dapat mengubah nominal di sini secara manual.</p>
              <div className="bg-slate-50 p-3 rounded border border-slate-200 overflow-x-auto">
                <code className="text-slate-800 font-bold font-mono text-[10px]">Columns: [A] NISN, [B] Nama, [C] Jenjang, [D] Kelas, [E] Angkatan, [F] Tarif_SPP_Bulanan, [G] Tarif_Uang_Gedung, [H] Potongan_Beasiswa, [I] Catatan</code>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-2">
              <h4 className="font-extrabold text-slate-850 flex items-center gap-1.5 text-xs m-0 uppercase tracking-wider text-amber-600">
                <span className="w-2 h-2 rounded-sm bg-amber-500"></span>
                TAB 2: Tagihan_Bulanan
              </h4>
              <p className="text-slate-500 text-[11px]">Log tagihan terbit bulanan hasil komputasi. Status otomatis berubah menjadi "Mencicil" atau "Lunas" tergantung sisa nominal.</p>
              <div className="bg-slate-50 p-3 rounded border border-slate-200 overflow-x-auto">
                <code className="text-slate-800 font-bold font-mono text-[10px]">Columns: [A] ID_Tagihan, [B] NISN, [C] Nama, [D] Bulan_Tahun, [E] Nominal_Tagihan, [F] Jumlah_Bayar, [G] Sisa_Tunggakan, [H] Status, [I] Tanggal_Terakhir_Bayar</code>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-2">
              <h4 className="font-extrabold text-slate-850 flex items-center gap-1.5 text-xs m-0 uppercase tracking-wider text-emerald-600">
                <span className="w-2 h-2 rounded-sm bg-emerald-500"></span>
                TAB 3: Log_Pembayaran
              </h4>
              <p className="text-slate-500 text-[11px]">Arsip audit kasir penerimaan setoran uang secara real-time.</p>
              <div className="bg-slate-50 p-3 rounded border border-slate-200 overflow-x-auto">
                <code className="text-slate-800 font-bold font-mono text-[10px]">Columns: [A] No_Kuitansi, [B] ID_Tagihan, [C] Tanggal, [D] NISN, [E] Nama, [F] Jumlah_Bayar, [G] Metode_Bayar, [H] Penerima, [I] Keterangan</code>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* NEW SUBTAB FOR API CONNECTION CHECKING (CEK KONEKSI) */}
      {activeSubTab === 'koneksi' && (
        <div className="space-y-6 animate-fade-in font-sans">
          
          <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4.5 h-4.5 text-emerald-600" />
                Hubungkan Aplikasi dengan Google Apps Script Web App
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan URL Web App dari Spreadsheet Google Drive Anda untuk memulai sinkronisasi database dan menguji transfer data secara real-time.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                  🌐 URL Web App Google Apps Script Anda (Deployment URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={gasUrl}
                    onChange={(e) => handleSaveGasUrl(e.target.value)}
                    placeholder="Contoh: https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 font-mono text-xs p-2.5 rounded focus:outline-hidden focus:bg-white text-slate-850"
                  />
                  <button
                    onClick={handleTestConnection}
                    disabled={testLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 rounded transitionduration-150 flex items-center gap-1.5 uppercase cursor-pointer disabled:opacity-50"
                  >
                    {testLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Sedang Cek...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Cek Koneksi
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  *URL diperoleh setelah meng-klik tombol <strong>Gezapkan / Terapkan (Deploy) &gt; New Deployment / Penerapan Baru</strong> ber-tipe "Web App" dengan akses <strong>Who has access: Anyone / Siapa Saja</strong> di editor Apps Script Anda.
                </p>
              </div>

              {/* Display Test Results */}
              {testResult && (
                <div className={`p-4 rounded border animate-fade-in ${
                  testResult.success 
                    ? 'bg-emerald-50/50 border-emerald-250 text-emerald-900' 
                    : 'bg-rose-50/50 border-rose-250 text-rose-900'
                }`}>
                  <div className="flex gap-2.5 items-start">
                    {testResult.success ? (
                      <Wifi className="w-5 h-5 text-emerald-650 flex-shrink-0 mt-0.5" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-rose-650 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 select-none">
                        {testResult.success ? 'KONEKSI AKTIF & STABIL' : 'KONEKSI GAGAL / TERPUTUS'}
                      </h4>
                      <p className="text-xs font-medium leading-relaxed font-sans">{testResult.message}</p>
                      {testResult.success && (
                        <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-500 font-mono">
                          {testResult.spreadsheetName && (
                            <span className="flex items-center gap-1">
                              <Server className="w-3 h-3 text-emerald-600" />
                              DB: {testResult.spreadsheetName}
                            </span>
                          )}
                          {testResult.timestamp && (
                            <span>
                              Waktu Uji: {testResult.timestamp}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Guide On Deploying as Web App */}
          <div className="bg-slate-50 border border-slate-200 rounded p-5 space-y-4">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4.5 h-4.5 text-blue-600" />
              Cara Memperoleh URL Google Apps Script Web App Yang Benar:
            </h4>
            <div className="text-xs text-slate-650 space-y-3 font-medium leading-relaxed">
              <p>
                Untuk mengubah naskah <strong>Code.gs</strong> menjadi API endpoint penerima data yang responsif, ikuti langkah wajib ini di editor Apps Script Anda:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1.5">
                <div className="bg-white border rounded p-4 space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[11px] font-mono">1</span>
                  <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Terapkan Sebagai Web App</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    Di bar kanan atas Apps Script, klik tombol <strong>Deploy (Terapkan) &gt; New Deployment (Penerapan Baru)</strong>. Klik ikon gerigi (Select Type) dan pilih jenis <strong>Web App</strong>.
                  </p>
                </div>

                <div className="bg-white border rounded p-4 space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[11px] font-mono">2</span>
                  <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Atur Hak Akses "Anyone" <span className="text-rose-600">(CRITICAL!)</span></h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    Ubah konfigurasi <strong>Execute as:</strong> "Me (email Anda)" dan <strong>Who has access:</strong> dari "Only myself" menjadi <strong className="text-emerald-600">"Anyone"</strong> (atau Siapa Saja termasuk anonim). Klik tombol Deploy.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-200/60 rounded p-3 text-blue-900 text-[11px] font-medium leading-relaxed font-sans flex gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Mengapa Akses harus "Anyone"?</strong> Tanpa menyetel akses ke Anyone, sistem keamanan Google Cloud akan menghalangi semua prapemrosesan fetch data dari aplikasi admin SPP klien dengan penolakan otorisasi HTTP 401 Unauthorized / CORS block.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'optimasi' && (
        <div className="space-y-6 animate-fade-in text-xs leading-relaxed">
          
          <div>
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Mitigasi Limitasi Execution Time Google Apps Script</h3>
            <p className="text-xs text-slate-500">Penjelasan arsitektural bagaimana menghindari pembatasan timeout sistem Google (maksimal 6 menit) untuk ratusan hingga ribuan siswa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white border border-slate-200 p-5 rounded shadow-xs space-y-3 font-sans">
              <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-250">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Batch Operations</h4>
              <p className="text-slate-650 leading-relaxed text-[11px] font-medium">
                Hindari membaca atau menulis sel spreadsheet satu persatu menggunakan loop (misal <code className="font-bold bg-slate-50 border px-1">Sheet.getRange().setValue()</code> di dalam nested loops). 
                <br /><br />
                <strong>Solusi:</strong> Kode GAS di atas telah dioptimasi dengan memakai <code className="font-bold bg-slate-50">getValues()</code> satu kali di awal untuk membaca seluruh tabel siswa, memproses array logika di memori, lalu menyiram semuanya kembali secara serentak memakai <code className="font-bold bg-slate-50">setValues()</code>. Mengurangi waktu panggil server-link Google secara ekstrem.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded shadow-xs space-y-3 font-sans">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-250">
                <Compass className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">O(1) Set Lookup</h4>
              <p className="text-slate-650 leading-relaxed text-[11px] font-medium">
                Struktur pencarian normal menggunakan loop ganda O(N²) untuk memeriksa apakah tagihan seorang siswa sudah pernah diterbitkan sebelumnya akan melambat sangat parah seiring membesarnya data.
                <br /><br />
                <strong>Solusi:</strong> Struktur Code GAS kita menggunakan struktur <code className="font-bold bg-slate-50">JS Set()</code> dan melacak daftar key ID tagihan lama. Hal ini memungkinkan pengecekan duplikasi berlangsung secepat kilat yaitu konstan <code className="font-bold bg-slate-50 font-mono">O(1)</code>, menghapus lag double-billing secara efisien.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded shadow-xs space-y-3 font-sans">
              <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-250">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Resume Chunking</h4>
              <p className="text-slate-650 leading-relaxed text-[11px] font-medium">
                Untuk basis data di atas 10.000 siswa, pengolahan PDF mungkin mendekati 6 menit.
                <br /><br />
                <strong>Solusi Tambahan:</strong> Lakukan chunking. Simpan penanda index baris siswa terakhir yang berhasil diproses ke dalam <code className="font-bold bg-slate-50 font-mono">PropertiesService.getScriptProperties()</code>. Buat trigger waktu berkala (Time-Trigger) setiap 10 menit untuk melanjutkan antrean baris yang belum terarsip.
              </p>
            </div>

          </div>

          <div className="bg-yellow-50 text-yellow-850 rounded p-4 border border-yellow-200 leading-relaxed flex items-start gap-2.5 font-sans">
            <ShieldAlert className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wide">Peringatan Konversi Google Docs ke PDF!</p>
              <p className="text-[11px] mt-1 text-yellow-900 leading-relaxed font-medium">
                Fungsi <code>DriveApp</code> untuk mengonversi naskah Google Docs temporer menjadi file PDF (<code>tempFile.getAs(MimeType.PDF)</code>) membutuhkan kuota harian konversi API Google Anda. Gunakan dengan bijak, dan jika beban tinggi, letakkan operasi pembuatan PDF ini pada mode asinkron atau terbitkan kuitansi dalam format HTML / cetak lokal browser guna menghemat resource server-time.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
