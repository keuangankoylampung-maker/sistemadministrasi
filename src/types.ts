export interface Siswa {
  nisn: string;
  nama: string;
  jenjang: 'SMP' | 'SMA';
  kelas: string;
  angkatan: string;
  tarifSpp: number;
  tarifUangGedung: number;
  potonganBeasiswa: number; // Percentage, e.g., 20 means 20% discount
  catatan: string;
}

export interface JenisTagihan {
  idJenis: string; // e.g. "SPP", "GEDUNG", "SERAGAM", "WISUDA"
  namaTagihan: string; // e.g. "SPP Bulanan", "Uang Gedung", "Uang Seragam"
  nominalDefault: number;
  keterangan: string;
}

export interface Tagihan {
  idTagihan: string;
  nisn: string;
  nama: string;
  bulanTahun: string; // e.g. "07-2026"
  tahunAjaran?: string; // e.g. "2025/2026", "2026/2027"
  semester?: 'Ganjil' | 'Genap'; // e.g. "Ganjil" | "Genap"
  nominalTagihan: number;
  jumlahBayar: number;
  sisaTunggakan: number;
  status: 'Belum Bayar' | 'Mencicil' | 'Lunas';
  tanggalTerakhirBayar?: string;
  idJenis?: string; // Reference to JenisTagihan
  namaJenis?: string; // Display name of JenisTagihan
}

export interface LogPembayaran {
  noKuitansi: string;
  idTagihan: string;
  tanggal: string;
  nisn: string;
  nama: string;
  jumlahBayar: number;
  metodeBayar: string;
  penerima: string;
  keterangan: string;
}

export interface SchoolIdentity {
  namaYayasan: string;
  namaSekolah: string;
  alamat: string;
  telp: string;
  email: string;
  prefixKuitansi: string;
  logoInitial: string;
}

export interface AdminSettings {
  namaKasirDefault: string;
  namaBendahara: string;
  nipBendahara: string;
  namaKepsek: string;
  nipKepsek: string;
  usernameAdmin: string;
  passwordAdmin: string;
  daftarKasir?: string[];
}

