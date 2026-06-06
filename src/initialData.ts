import { Siswa, Tagihan, LogPembayaran, JenisTagihan, SchoolIdentity, AdminSettings } from './types';

export const initialSchoolIdentity: SchoolIdentity = {
  namaYayasan: "YAYASAN PENDIDIKAN HARAPAN UTAMA",
  namaSekolah: "SMP - SMA HARAPAN UTAMA JAKARTA",
  alamat: "Jl. Pendidikan No. 45, Kompleks Pendidikan, Jakarta Pusat",
  telp: "(021) 555-0199",
  email: "info@harapanutama.sch.id",
  prefixKuitansi: "KWT",
  logoInitial: "YPU"
};

export const initialAdminSettings: AdminSettings = {
  namaKasirDefault: "Staff Kasir TU",
  namaBendahara: "Dra. Hj. Wahyuni Rahayu",
  nipBendahara: "NIP. 19741211 200312 2 001",
  namaKepsek: "Drs. H. Mulyadi Kusuma, M.Pd",
  nipKepsek: "NIP. 19680327 199403 1 002",
  usernameAdmin: "admin",
  passwordAdmin: "admin123",
  daftarKasir: ["Staff Kasir TU", "Pak Mulyono (Staff TU)", "Ibu Sunarti (Bendahara Pembantu)"]
};

export const initialSiswaList: Siswa[] = [
  {
    nisn: "0081234567",
    nama: "Ahmad Fauzi",
    jenjang: "SMP",
    kelas: "7-A",
    angkatan: "2025",
    tarifSpp: 250000,
    tarifUangGedung: 1500000,
    potonganBeasiswa: 0,
    catatan: "Siswa reguler"
  },
  {
    nisn: "0097654321",
    nama: "Siti Rahmawati",
    jenjang: "SMP",
    kelas: "8-B",
    angkatan: "2024",
    tarifSpp: 280000,
    tarifUangGedung: 1500000,
    potonganBeasiswa: 50, // Beasiswa Akademik 50%
    catatan: "Beasiswa Prestasi Akademik 50%"
  },
  {
    nisn: "0078910111",
    nama: "Budi Santoso",
    jenjang: "SMA",
    kelas: "10-IPA-1",
    angkatan: "2025",
    tarifSpp: 400000,
    tarifUangGedung: 2500000,
    potonganBeasiswa: 0,
    catatan: "Siswa reguler IPA"
  },
  {
    nisn: "0065432109",
    nama: "Dewi Lestari",
    jenjang: "SMA",
    kelas: "11-IPS-2",
    angkatan: "2024",
    tarifSpp: 380000,
    tarifUangGedung: 2200000,
    potonganBeasiswa: 100, // Beasiswa Penuh (Gratis SPP)
    catatan: "Beasiswa Yayasan Penuh"
  },
  {
    nisn: "0071122334",
    nama: "Rian Hidayat",
    jenjang: "SMA",
    kelas: "12-IPA-3",
    angkatan: "2023",
    tarifSpp: 450000,
    tarifUangGedung: 2500000,
    potonganBeasiswa: 10, // Diskon alumni / saudara kandung
    catatan: "Diskon Saudara Kandung 10%"
  },
  {
    nisn: "0082233445",
    nama: "Fanya Aurelia",
    jenjang: "SMP",
    kelas: "9-C",
    angkatan: "2023",
    tarifSpp: 250000,
    tarifUangGedung: 1500000,
    potonganBeasiswa: 0,
    catatan: "Siswa reguler"
  }
];

export const initialTagihanList: Tagihan[] = [
  // Mei 2026 - Lunas & Mencicil
  {
    idTagihan: "TAG-0081234567-05-2026",
    nisn: "0081234567",
    nama: "Ahmad Fauzi",
    bulanTahun: "05-2026",
    nominalTagihan: 250000,
    jumlahBayar: 250000,
    sisaTunggakan: 0,
    status: "Lunas",
    tanggalTerakhirBayar: "2026-05-10"
  },
  {
    idTagihan: "TAG-0097654321-05-2026",
    nisn: "0097654321",
    nama: "Siti Rahmawati",
    bulanTahun: "05-2026",
    nominalTagihan: 140000, // 280000 * 0.5
    jumlahBayar: 140000,
    sisaTunggakan: 0,
    status: "Lunas",
    tanggalTerakhirBayar: "2026-05-08"
  },
  {
    idTagihan: "TAG-0078910111-05-2026",
    nisn: "0078910111",
    nama: "Budi Santoso",
    bulanTahun: "05-2026",
    nominalTagihan: 400000,
    jumlahBayar: 200000,
    sisaTunggakan: 200000,
    status: "Mencicil",
    tanggalTerakhirBayar: "2026-05-12"
  },
  {
    idTagihan: "TAG-0065432109-05-2026",
    nisn: "0065432109",
    nama: "Dewi Lestari",
    bulanTahun: "05-2026",
    nominalTagihan: 0, // 100% Beasiswa
    jumlahBayar: 0,
    sisaTunggakan: 0,
    status: "Lunas",
    tanggalTerakhirBayar: "2026-05-01"
  },
  {
    idTagihan: "TAG-0071122334-05-2026",
    nisn: "0071122334",
    nama: "Rian Hidayat",
    bulanTahun: "05-2026",
    nominalTagihan: 405000, // 450000 * 0.9
    jumlahBayar: 405000,
    sisaTunggakan: 0,
    status: "Lunas",
    tanggalTerakhirBayar: "2026-05-05"
  },

  // Juni 2026 - Belum Bayar & Mencicil (Aktif)
  {
    idTagihan: "TAG-0081234567-06-2026",
    nisn: "0081234567",
    nama: "Ahmad Fauzi",
    bulanTahun: "06-2026",
    nominalTagihan: 250000,
    jumlahBayar: 100000,
    sisaTunggakan: 150000,
    status: "Mencicil",
    tanggalTerakhirBayar: "2026-06-03"
  },
  {
    idTagihan: "TAG-0097654321-06-2026",
    nisn: "0097654321",
    nama: "Siti Rahmawati",
    bulanTahun: "06-2026",
    nominalTagihan: 140000,
    jumlahBayar: 0,
    sisaTunggakan: 140000,
    status: "Belum Bayar"
  },
  {
    idTagihan: "TAG-0078910111-06-2026",
    nisn: "0078910111",
    nama: "Budi Santoso",
    bulanTahun: "06-2026",
    nominalTagihan: 400000,
    jumlahBayar: 0,
    sisaTunggakan: 400000,
    status: "Belum Bayar"
  },
  {
    idTagihan: "TAG-0065432109-06-2026",
    nisn: "0065432109",
    nama: "Dewi Lestari",
    bulanTahun: "06-2026",
    nominalTagihan: 0,
    jumlahBayar: 0,
    sisaTunggakan: 0,
    status: "Lunas",
    tanggalTerakhirBayar: "2026-06-01"
  },
  {
    idTagihan: "TAG-0071122334-06-2026",
    nisn: "0071122334",
    nama: "Rian Hidayat",
    bulanTahun: "06-2026",
    nominalTagihan: 405000,
    jumlahBayar: 0,
    sisaTunggakan: 405000,
    status: "Belum Bayar"
  },
  {
    idTagihan: "TAG-0082233445-06-2026",
    nisn: "0082233445",
    nama: "Fanya Aurelia",
    bulanTahun: "06-2026",
    nominalTagihan: 250000,
    jumlahBayar: 0,
    sisaTunggakan: 250000,
    status: "Belum Bayar"
  }
];

export const initialLogList: LogPembayaran[] = [
  {
    noKuitansi: "KWT-20260505-001",
    idTagihan: "TAG-0071122334-05-2026",
    tanggal: "2026-05-05 09:12:44",
    nisn: "0071122334",
    nama: "Rian Hidayat",
    jumlahBayar: 405000,
    metodeBayar: "Transfer Bank Mandiri",
    penerima: "Ibu Hartati (Bendahara)",
    keterangan: "Lunas SPP Mei 2026"
  },
  {
    noKuitansi: "KWT-20260508-001",
    idTagihan: "TAG-0097654321-05-2026",
    tanggal: "2026-05-08 10:30:15",
    nisn: "0097654321",
    nama: "Siti Rahmawati",
    jumlahBayar: 140000,
    metodeBayar: "Tunai",
    penerima: "Ibu Hartati (Bendahara)",
    keterangan: "Lunas SPP Mei 2026 (Potongan Beasiswa 50%)"
  },
  {
    noKuitansi: "KWT-20260510-001",
    idTagihan: "TAG-0081234567-05-2026",
    tanggal: "2026-05-10 08:45:22",
    nisn: "0081234567",
    nama: "Ahmad Fauzi",
    jumlahBayar: 250000,
    metodeBayar: "Tunai",
    penerima: "Pak Mulyono (Staff TU)",
    keterangan: "Lunas SPP Mei 2026"
  },
  {
    noKuitansi: "KWT-20260512-001",
    idTagihan: "TAG-0078910111-05-2026",
    tanggal: "2026-05-12 11:20:00",
    nisn: "0078910111",
    nama: "Budi Santoso",
    jumlahBayar: 200000,
    metodeBayar: "Tunai",
    penerima: "Pak Mulyono (Staff TU)",
    keterangan: "Cicilan 1 SPP Mei 2026"
  },
  {
    noKuitansi: "KWT-20260603-001",
    idTagihan: "TAG-0081234567-06-2026",
    tanggal: "2026-06-03 09:15:10",
    nisn: "0081234567",
    nama: "Ahmad Fauzi",
    jumlahBayar: 100000,
    metodeBayar: "Tunai",
    penerima: "Ibu Hartati (Bendahara)",
    keterangan: "Cicilan 1 SPP Juni 2026"
  }
];

export const initialJenisTagihanList: JenisTagihan[] = [
  {
    idJenis: "SPP",
    namaTagihan: "SPP Bulanan",
    nominalDefault: 250000,
    keterangan: "Sumbangan Pembinaan Pendidikan bulanan rutin siswa"
  },
  {
    idJenis: "GEDUNG",
    namaTagihan: "Investasi Uang Gedung",
    nominalDefault: 1500000,
    keterangan: "Uang pembangunan sarana prasarana sekolah"
  },
  {
    idJenis: "SERAGAM",
    namaTagihan: "Beli Seragam Baru",
    nominalDefault: 650000,
    keterangan: "Pembelian stel seragam lengkap siswa"
  },
  {
    idJenis: "WISUDA",
    namaTagihan: "Biaya Wisuda Kelulusan",
    nominalDefault: 800000,
    keterangan: "Biaya pelepasan siswa tingkat akhir"
  },
  {
    idJenis: "KEGIATAN",
    namaTagihan: "Uang Kegiatan OSIS",
    nominalDefault: 120000,
    keterangan: "Iuran penunjang program ekstrakurikuler"
  }
];
