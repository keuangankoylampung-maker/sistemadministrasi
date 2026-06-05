export const appsScriptCodeGS = `/**
 * ==============================================================================
 * SISTEM ADMINISTRASI SPP & BIAYA LAINNYA (SMP & SMA)
 * Google Sheets & Apps Script Enterprise Codebase (Sangat Teroptimasi)
 * ==============================================================================
 * 
 * PETUNJUK PENYIAPAN SHEET:
 * 1. Buat Spreadsheet Google Baru.
 * 2. Buat 3 Sheet berikut dengan nama persis sama:
 *    - "Master_Siswa"
 *    - "Tagihan_Bulanan"
 *    - "Log_Pembayaran"
 * 3. Isi Header Baris Ke-1 pada masing-masing Sheet sebagai berikut:
 *    Master_Siswa:
 *    [A1: NISN] [B1: Nama] [C1: Jenjang] [D1: Kelas] [E1: Angkatan] [F1: Tarif_SPP_Bulanan] [G1: Tarif_Uang_Gedung] [H1: Potongan_Beasiswa] [I1: Catatan]
 * 
 *    Tagihan_Bulanan:
 *    [A1: ID_Tagihan] [B1: NISN] [C1: Nama] [D1: Bulan_Tahun] [E1: Nominal_Tagihan] [F1: Jumlah_Bayar] [G1: Sisa_Tunggakan] [H1: Status] [I1: Tanggal_Terakhir_Bayar]
 * 
 *    Log_Pembayaran:
 *    [A1: No_Kuitansi] [B1: ID_Tagihan] [C1: Tanggal] [D1: NISN] [E1: Nama] [F1: Jumlah_Bayar] [G1: Metode_Bayar] [H1: Penerima] [I1: Keterangan]
 */

// Konfigurasi ID Template Kuitansi Google Docs (Ganti dengan ID file Google Doc template Anda)
const TEMPLATE_DOC_ID = "ID_GOOGLE_DOC_TEMPLATE_ANDA";
const PDF_FOLDER_ID = "ID_FOLDER_GOOGLE_DRIVE_TEMPAT_SIMPAN_PDF"; // Opsional

/**
 * ==============================================================================
 * A. AUTOMATED BILLING GENERATOR
 * Generates monthly tuition bills for each student based on their custom tariffs in Master_Siswa
 * Highly optimized using in-memory arrays to prevent execution limit (O(N) operations)
 * ==============================================================================
 */
function generateBulananTagihan(targetBulanTahun) {
  // Jika dipanggil manual tanpa parameter, minta input prompt
  if (!targetBulanTahun) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.prompt(
      "Generate Tagihan Bulanan", 
      "Masukkan Bulan & Tahun target (Format: MM-YYYY, contoh: 07-2026):", 
      ui.ButtonSet.OK_CANCEL
    );
    if (response.getSelectedButton() == ui.Button.OK) {
      targetBulanTahun = response.getResponseText().trim();
    } else {
      return;
    }
  }

  // Validasi format MM-YYYY
  const regexPattern = /^(0[1-9]|1[0-2])-\\d{4}$/;
  if (!regexPattern.test(targetBulanTahun)) {
    SpreadsheetApp.getUi().alert("Error", "Format Bulan-Tahun harus MM-YYYY! (Contoh: 07-2026)", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetMaster = ss.getSheetByName("Master_Siswa");
  const sheetTagihan = ss.getSheetByName("Tagihan_Bulanan");

  if (!sheetMaster || !sheetTagihan) {
    throw new Error("Gagal menemukan Sheet 'Master_Siswa' atau 'Tagihan_Bulanan'. Pastikan penulisan nama sheet benar!");
  }

  // 1. Ambil seluruh data dari Master_Siswa (Sekali panggil - Teroptimasi)
  const masterDataFull = sheetMaster.getDataRange().getValues();
  if (masterDataFull.length <= 1) {
    SpreadsheetApp.getUi().alert("Notifikasi", "Siswa di Master_Siswa masih kosong!", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  const headerMaster = masterDataFull[0];
  const masterRows = masterDataFull.slice(1);

  // Cari index masing-masing kolom di Master Siswa
  const idxNisn = headerMaster.indexOf("NISN");
  const idxNama = headerMaster.indexOf("Nama");
  const idxSpp = headerMaster.indexOf("Tarif_SPP_Bulanan");
  const idxBeasiswa = headerMaster.indexOf("Potongan_Beasiswa");

  if (idxNisn === -1 || idxNama === -1 || idxSpp === -1) {
    throw new Error("Kolom NISN, Nama, atau Tarif_SPP_Bulanan di Master_Siswa tidak ditemukan!");
  }

  // 2. Ambil seluruh ID_Tagihan yang ada di Tagihan_Bulanan untuk deteksi duplikasi (Sekali panggil)
  const tagihanDataFull = sheetTagihan.getDataRange().getValues();
  const existingBillsSet = new Set();
  
  if (tagihanDataFull.length > 1) {
    const headerTagihan = tagihanDataFull[0];
    const idxIdTagihan = headerTagihan.indexOf("ID_Tagihan");
    if (idxIdTagihan !== -1) {
      for (let i = 1; i < tagihanDataFull.length; i++) {
        existingBillsSet.add(tagihanDataFull[i][idxIdTagihan].toString().trim());
      }
    }
  }

  // 3. Iterasi siswa dan siapkan baris tagihan baru secara in-memory
  const rowsToInsert = [];
  let countSiswaTerproses = 0;
  let countDuplikatLewat = 0;

  for (let i = 0; i < masterRows.length; i++) {
    const row = masterRows[i];
    const nisn = row[idxNisn].toString().trim();
    if (!nisn) continue; // Lewati jika NISN kosong

    const nama = row[idxNama];
    const tarifSppMentah = Number(row[idxSpp]) || 0;
    const potonganBeasiswaPersen = idxBeasiswa !== -1 ? (Number(row[idxBeasiswa]) || 0) : 0;

    // Kalkulasi tarif akhir setelah potongan beasiswa kustom siswa
    const nominalAkhirTagihan = Math.round(tarifSppMentah * (1 - (potonganBeasiswaPersen / 100)));

    // Bentuk ID_Tagihan unik agar tidak terjadi double-billing untuk siswa yang sama di bulan yang sama
    const idTagihanUnik = "TAG-" + nisn + "-" + targetBulanTahun;

    // Jika tagihan untuk siswa + bulan ini sudah ada, lewati!
    if (existingBillsSet.has(idTagihanUnik)) {
      countDuplikatLewat++;
      continue;
    }

    // Susun kolom sesuai header Tagihan_Bulanan:
    // [ID_Tagihan, NISN, Nama, Bulan_Tahun, Nominal_Tagihan, Jumlah_Bayar, Sisa_Tunggakan, Status, Tanggal_Terakhir_Bayar]
    rowsToInsert.push([
      idTagihanUnik,         // A: ID_Tagihan
      nisn,                  // B: NISN
      nama,                  // C: Nama
      targetBulanTahun,      // D: Bulan_Tahun
      nominalAkhirTagihan,   // E: Nominal_Tagihan
      0,                     // F: Jumlah_Bayar
      nominalAkhirTagihan,   // G: Sisa_Tunggakan
      "Belum Bayar",          // H: Status
      ""                     // I: Tanggal_Terakhir_Bayar (Kosong di awal)
    ]);

    countSiswaTerproses++;
  }

  // 4. Batch append hasil tagihan ke Sheet Tagihan_Bulanan (Sekali panggil)
  if (rowsToInsert.length > 0) {
    const startRow = sheetTagihan.getLastRow() + 1;
    const numRows = rowsToInsert.length;
    const numCols = rowsToInsert[0].length;
    
    sheetTagihan.getRange(startRow, 1, numRows, numCols).setValues(rowsToInsert);
  }

  // Kirim notifikasi sukses ke User
  const msg = "SELESAI! " + countSiswaTerproses + " tagihan baru berhasil digenerate untuk periode " + targetBulanTahun + ".\\n" +
              (countDuplikatLewat > 0 ? "(" + countDuplikatLewat + " tagihan sudah ada sebelumnya dan otomatis dilewati)." : "");
  
  if (typeof ui !== 'undefined' || SpreadsheetApp.getActive()) {
    SpreadsheetApp.getUi().alert("Billing Generator Selesai", msg, SpreadsheetApp.getUi().ButtonSet.OK);
  }
  
  return msg;
}


/**
 * ==============================================================================
 * B. LOKET PEMBAYARAN & LOGIKA CICILAN (INSTALMENT LOGIC)
 * Handles tuition payments by updating logs and dynamically updating student's bills
 * Supports partial (instalment) payments & overpayment protections
 * ==============================================================================
 */
function prosesPembayaran(nisn, idTagihan, jumlahBayar, metodeBayar, penerima, keterangan) {
  // Validasi Parameter Dasar
  if (!nisn || !idTagihan || !jumlahBayar || jumlahBayar <= 0) {
    throw new Error("Parameter tidak lengkap! Pastikan NISN, ID Tagihan, dan Jumlah Pembayaran valid.");
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTagihan = ss.getSheetByName("Tagihan_Bulanan");
  const sheetLog = ss.getSheetByName("Log_Pembayaran");

  if (!sheetTagihan || !sheetLog) {
    throw new Error("Gagal menemukan Sheet 'Tagihan_Bulanan' atau 'Log_Pembayaran'.");
  }

  // 1. Cari baris tagihan berdasarkan ID_Tagihan (Teroptimasi - Cari cepat sekali sebaris)
  const tagihanData = sheetTagihan.getDataRange().getValues();
  const headerTagihan = tagihanData[0];
  
  const idxIdTagihan = headerTagihan.indexOf("ID_Tagihan");
  const idxNisn = headerTagihan.indexOf("NISN");
  const idxNama = headerTagihan.indexOf("Nama");
  const idxNominal = headerTagihan.indexOf("Nominal_Tagihan");
  const idxTelahBayar = headerTagihan.indexOf("Jumlah_Bayar");
  const idxSisa = headerTagihan.indexOf("Sisa_Tunggakan");
  const idxStatus = headerTagihan.indexOf("Status");
  const idxTglBayar = headerTagihan.indexOf("Tanggal_Terakhir_Bayar");

  let barisTargetIndex = -1;
  for (let i = 1; i < tagihanData.length; i++) {
    if (tagihanData[i][idxIdTagihan].toString().trim() === idTagihan.toString().trim()) {
      barisTargetIndex = i + 1; // Konversi ke koordinat baris Google Sheets (1-indexed)
      break;
    }
  }

  if (barisTargetIndex === -1) {
    throw new Error("Data tagihan dengan ID: " + idTagihan + " tidak ditemukan!");
  }

  // 2. Load data tagihan saat ini
  const rawRow = tagihanData[barisTargetIndex - 1];
  const namaSiswa = rawRow[idxNama];
  const nominalTagihan = Number(rawRow[idxNominal]) || 0;
  const jumlahBayarLama = Number(rawRow[idxTelahBayar]) || 0;
  const sisaTunggakanLama = Number(rawRow[idxSisa]) || 0;

  if (sisaTunggakanLama <= 0) {
    throw new Error("Tagihan ini sudah lunas! Tidak memerlukan pembayaran lebih lanjut.");
  }

  // 3. Jalankan logika cicilan & update sisa
  let jumlahBayarBaru = jumlahBayarLama + jumlahBayar;
  let sisaTunggakanBaru = nominalTagihan - jumlahBayarBaru;
  let statusBaru = "Belum Bayar";

  // Batasi proteksi kelebihan bayar
  if (sisaTunggakanBaru < 0) {
    // Siswa bayar kelebihan
    const kelebihan = Math.abs(sisaTunggakanBaru);
    jumlahBayar = jumlahBayar - kelebihan; // Kembalikan kelebihan/potong agar pas lunas
    jumlahBayarBaru = nominalTagihan;
    sisaTunggakanBaru = 0;
    statusBaru = "Lunas";
    
    // Notifikasi opsional (bisa disesuaikan)
    Logger.log("Peringatan: Nominal pembayaran melebihi tunggakan. Sistem memotong pembayaran menjadi pas lunas.");
  } else if (sisaTunggakanBaru === 0) {
    statusBaru = "Lunas";
  } else {
    // Sisa tunggakan masih > 0, artinya mencicil sebagian
    statusBaru = "Mencicil";
  }

  const tanggalSekarang = new Date();
  const formatTanggalLokal = Utilities.formatDate(tanggalSekarang, "GMT+7", "yyyy-MM-dd HH:mm:ss");

  // 4. Update data baris tagihan di Sheet 'Tagihan_Bulanan' (Sekali panggil)
  sheetTagihan.getRange(barisTargetIndex, idxTelahBayar + 1).setValue(jumlahBayarBaru);
  sheetTagihan.getRange(barisTargetIndex, idxSisa + 1).setValue(sisaTunggakanBaru);
  sheetTagihan.getRange(barisTargetIndex, idxStatus + 1).setValue(statusBaru);
  sheetTagihan.getRange(barisTargetIndex, idxTglBayar + 1).setValue(formatTanggalLokal);

  // 5. Generate Nomor Kuitansi Baru secara sekuensial (Format: KWT-YYYYMMDD-[RANDOM])
  const dateFormattedCompact = Utilities.formatDate(tanggalSekarang, "GMT+7", "yyyyMMdd");
  const randomSerial = Math.floor(1000 + Math.random() * 9000); // 4 Digit acat agar unik tanpa lag di multi-user
  const noKuitansiUnik = "KWT-" + dateFormattedCompact + "-" + randomSerial;

  // 6. Tulis baris baru ke Sheet 'Log_Pembayaran'
  // [No_Kuitansi, ID_Tagihan, Tanggal, NISN, Nama, Jumlah_Bayar, Metode_Bayar, Penerima, Keterangan]
  sheetLog.appendRow([
    noKuitansiUnik,
    idTagihan,
    formatTanggalLokal,
    nisn,
    namaSiswa,
    jumlahBayar,
    metodeBayar || "Tunai",
    penerima || "Admin TU",
    keterangan || ("Pembayaran untuk tagihan " + idTagihan)
  ]);

  // 7. OTOMATISASI CETAK KUITANSI (Google Docs ke PDF)
  // Integrasikan generator kuitansi otomatis
  let pdfUrl = "";
  try {
    pdfUrl = cetakKuitansiPDF(noKuitansiUnik, namaSiswa, nisn, formatTanggalLokal, jumlahBayar, sisaTunggakanBaru, statusBaru, metodeBayar, penerima);
  } catch (err) {
    Logger.log("Peringatan: Gagal membuat kuitansi PDF: " + err.message);
    // Masih mengizinkan transaksi simpan sukses meski file cetak bermasalah
  }

  return {
    status: "success",
    noKuitansi: noKuitansiUnik,
    sisaTunggakan: sisaTunggakanBaru,
    statusBayar: statusBaru,
    pdfUrl: pdfUrl
  };
}


/**
 * ==============================================================================
 * C. INTEGRASI TEMPLATE GOOGLE DOCS & CETAK KUITANSI PDF
 * Mengambil file Google Doc Template, menduplikasi, memproses tag kustom,
 * kemudian mengekspornya menjadi berkas PDF resmi secara otomatis.
 * ==============================================================================
 */
function cetakKuitansiPDF(noKwt, nama, nisn, tgl, nominal, sisa, status, metode, admin) {
  if (TEMPLATE_DOC_ID === "ID_GOOGLE_DOC_TEMPLATE_ANDA") {
    // Lewati jika user belum mengisi ID template mereka
    return "";
  }

  const templateFile = DriveApp.getFileById(TEMPLATE_DOC_ID);
  
  // Ambil folder penyimpanan PDF (jika tidak ada, ditaruh di root user)
  let rootFolder = DriveApp.getRootFolder();
  if (PDF_FOLDER_ID && PDF_FOLDER_ID !== "ID_FOLDER_GOOGLE_DRIVE_TEMPAT_SIMPAN_PDF") {
    try {
      rootFolder = DriveApp.getFolderById(PDF_FOLDER_ID);
    } catch(e) {}
  }

  // 1. Duplikasi Template Doc ke file temporary baru
  const tempDocName = "Kuitansi_Temp_" + noKwt;
  const tempFile = templateFile.makeCopy(tempDocName, rootFolder);
  const tempDoc = DocumentApp.openById(tempFile.getId());
  const body = tempDoc.getBody();

  // Terbilang Rupiah Helper (Sangat Luar Biasa untuk Kuitansi Resmi Indonesia)
  const terbilangStr = terbilang(nominal) + " Rupiah";

  // 2. Ganti placeholder di dalam Template Google Doc
  body.replaceText("{{NO_KUITANSI}}", noKwt);
  body.replaceText("{{TANGGAL}}", tgl);
  body.replaceText("{{NISN}}", nisn);
  body.replaceText("{{NAMA_SISWA}}", nama);
  body.replaceText("{{NOMINAL}}", "Rp " + formatRupiahGAS(nominal));
  body.replaceText("{{TERBILANG}}", terbilangStr);
  body.replaceText("{{SISA_TUNGGAKAN}}", "Rp " + formatRupiahGAS(sisa));
  body.replaceText("{{STATUS}}", status.toUpperCase());
  body.replaceText("{{METODE}}", metode);
  body.replaceText("{{ADMIN}}", admin);

  // Simpan dan tutup document temporary untuk menerapkan perubahan text
  tempDoc.saveAndClose();

  // 3. Konversi file Docs temporary ke Blob PDF
  const pdfBlob = tempFile.getAs(MimeType.PDF);
  pdfBlob.setName("Kuitansi_" + noKwt + ".pdf");

  // 4. Simpan file PDF permanen di Drive
  const permanentPdfFile = rootFolder.createFile(pdfBlob);
  
  // Set hak akses agar bisa dilihat oleh siapapun melalui link (berguna untuk ortu siswa)
  permanentPdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // 5. Hapus file temporary Google Doc agar Google Drive tetap bersih
  tempFile.setTrashed(true);

  // Balikkan link URL download PDF kuitansi tersebut
  return permanentPdfFile.getUrl();
}


/**
 * ==============================================================================
 * UTILITY HELPERS (Terbilang Rupiah & Formatter Angka)
 * ==============================================================================
 */
function formatRupiahGAS(angka) {
  if (isNaN(angka)) return "0";
  return angka.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ".");
}

function terbilang(angka) {
  const bilangan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  let temp = "";
  
  if (angka < 12) {
    temp = " " + bilangan[angka];
  } else if (angka < 20) {
    temp = terbilang(angka - 10) + " Belas";
  } else if (angka < 100) {
    temp = terbilang(Math.floor(angka / 10)) + " Puluh" + terbilang(angka % 10);
  } else if (angka < 200) {
    temp = " Seratus" + terbilang(angka - 100);
  } else if (angka < 1000) {
    temp = terbilang(Math.floor(angka / 100)) + " Ratus" + terbilang(angka % 100);
  } else if (angka < 2000) {
    temp = " Seribu" + terbilang(angka - 1000);
  } else if (angka < 1000000) {
    temp = terbilang(Math.floor(angka / 1000)) + " Ribu" + terbilang(angka % 1000);
  } else if (angka < 1000000000) {
    temp = terbilang(Math.floor(angka / 1000000)) + " Juta" + terbilang(angka % 1000000);
  }
  return temp.trim();
}
`;
export const appsScriptGuideMarkdown = `### Panduan Struktur Kolom Basis Data Google Sheets

Sistem ini membutuhkan satu Google Spreadsheet dengan tiga buah tab lembar kerja yang dinamakan persis: **Master_Siswa**, **Tagihan_Bulanan**, dan **Log_Pembayaran**.

#### 📂 1. Tabel: Master_Siswa
Berfungsi sebagai basis data profil utama siswa serta **tarif kustomisasi SPP dan investasi gedung** mereka.
| Kolom | Nama Kolom (Header) | Tipe Data | Deskripsi / Contoh Isian |
|---|---|---|---|
| **A** | \`NISN\` | Teks (Key) | Nomor Induk Siswa Nasional (unik), e.g., \`0081234567\` |
| **B** | \`Nama\` | Teks | Nama lengkap siswa, e.g., \`Ahmad Fauzi\` |
| **C** | \`Jenjang\` | Teks | Klasifikasi jenjang pendidik, e.g., \`SMP\` atau \`SMA\` |
| **D** | \`Kelas\` | Teks | Rincian rombongan belajar, e.g., \`7-A\`, \`10-IPA-1\` |
| **E** | \`Angkatan\` | Angka/Teks | Tahun masuk siswa, e.g., \`2025\` |
| **F** | \`Tarif_SPP_Bulanan\` | Angka | Nominal nominal tagihan normal, e.g., \`250000\` |
| **G** | \`Tarif_Uang_Gedung\` | Angka | Total uang pangkal/biaya gedung, e.g., \`1500000\` |
| **H** | \`Potongan_Beasiswa\` | Angka | Angka beasiswa dalam persen (0 - 100), e.g., \`50\` untuk diskon 50%. |
| **I** | \`Catatan\` | Teks | Catatan kustom e.g., \`Beasiswa Kejuaraan Atletik\` atau \`Tunggakan mutasi\` |

#### 💸 2. Tabel: Tagihan_Bulanan
Berfungsi sebagai jurnal tagihan terbit bulanan (billing logs) hasil kustomisasi generator.
| Kolom | Nama Kolom (Header) | Tipe Data | Deskripsi / Contoh Isian |
|---|---|---|---|
| **A** | \`ID_Tagihan\` | Teks (Key) | ID Unik gabungan, gabungan \`TAG-[NISN]-[BULAN-TAHUN]\`, e.g., \`TAG-0081234567-07-2026\` |
| **B** | \`NISN\` | Teks (F-Key) | NISN pengenal siswa, e.g., \`0081234567\` |
| **C** | \`Nama\` | Teks | Nama lengkap siswa untuk visualisasi cepat |
| **D** | \`Bulan_Tahun\` | Teks | Periode tagihan bersangkutan, format \`MM-YYYY\`, e.g., \`07-2026\` |
| **E** | \`Nominal_Tagihan\` | Angka | Tarif bersih setelah potongan kustom beasiswa, e.g., \`125000\` |
| **F** | \`Jumlah_Bayar\` | Angka | Total dana yang sudah disetorkan siswa (akumulatif), e.g., \`50000\` |
| **G** | \`Sisa_Tunggakan\` | Angka | Hasil kalkulasi \`Nominal_Tagihan\` - \`Jumlah_Bayar\`, e.g., \`75000\` |
| **H** | \`Status\` | Teks | Status penyelesaian tagihan: \`Belum Bayar\`, \`Mencicil\`, atau \`Lunas\` |
| **I** | \`Tanggal_Terakhir_Bayar\` | Tanggal/Waktu | Timestamp transaksi masuk terakhir untuk tagihan ini |

#### 📝 3. Tabel: Log_Pembayaran
Berfungsi sebagai buku kas besar/audit trail penerimaan transaksi keuangan harian sekolah.
| Kolom | Nama Kolom (Header) | Tipe Data | Deskripsi / Contoh Isian |
|---|---|---|---|
| **A** | \`No_Kuitansi\` | Teks (Key) | ID Kuitansi Unik berurutan sistem, e.g., \`KWT-20260605-4819\` |
| **B** | \`ID_Tagihan\` | Teks (F-Key) | Rujukan id tagihan yang dibayarkan, e.g., \`TAG-0081234567-07-2026\` |
| **C** | \`Tanggal\` | Tanggal/Waktu | Detik akurat transaksi masuk, e.g., \`2026-06-05 09:12:44\` |
| **D** | \`NISN\` | Teks | NISN identitas penyetor |
| **E** | \`Nama\` | Teks | Nama lengkap penyetor |
| **F** | \`Jumlah_Bayar\` | Angka | Nominal rupiah yang dibayarkan saat ini, e.g., \`50000\` |
| **G** | \`Metode_Bayar\` | Teks | Jenis kanal bayar, e.g., \`Tunai\`, \`Transfer Bank\`, \`QRIS\` |
| **H** | \`Penerima\` | Teks | Nama petugas / admin TU kasir penerima uang, e.g., \`Ibu Hartati\` |
| **I** | \`Keterangan\` | Teks | Informasi pelengkap cicilan ke-X, catatan khusus, dsb. |
`;
