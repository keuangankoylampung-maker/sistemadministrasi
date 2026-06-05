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
  AlertTriangle 
} from 'lucide-react';

export default function ScriptHubTab() {
  const [copiedCodeFlag, setCopiedCodeFlag] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'script' | 'schema' | 'optimasi'>('script');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCodeGS);
    setCopiedCodeFlag(true);
    setTimeout(() => setCopiedCodeFlag(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('script')}
          className={`pb-3 text-xs font-bold border-b-2 px-4 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
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
          className={`pb-3 text-xs font-bold border-b-2 px-4 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
            activeSubTab === 'schema'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Skema Google Sheets
        </button>

        <button
          onClick={() => setActiveSubTab('optimasi')}
          className={`pb-3 text-xs font-bold border-b-2 px-4 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
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
              <span>Code.gs &nbsp;&bull;&nbsp; Google Apps Script Engine v1.2</span>
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
                <strong>Solusi Tambahan:</strong> Lakukan chunking. Simpan penanda index baris siswa terakhir yang berhasil diproses ke dalam <code className="font-bold bg-slate-50">PropertiesService.getScriptProperties()</code>. Buat trigger waktu berkala (Time-Trigger) setiap 10 menit untuk melanjutkan antrean baris yang belum terarsip.
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
