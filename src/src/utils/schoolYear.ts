/**
 * Utility to convert month-year string in format "MM-YYYY" (e.g., "07-2026")
 * into Academic Year (e.g., "2026/2027") and Semester ("Ganjil" | "Genap").
 */
export function getAcademicYearAndSemester(bulanTahun: string): {
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
} {
  if (!bulanTahun || !bulanTahun.includes('-')) {
    return { tahunAjaran: '2025/2026', semester: 'Ganjil' };
  }

  const parts = bulanTahun.split('-');
  if (parts.length < 2) {
    return { tahunAjaran: '2025/2026', semester: 'Ganjil' };
  }

  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);

  if (isNaN(month) || isNaN(year)) {
    return { tahunAjaran: '2025/2026', semester: 'Ganjil' };
  }

  let tahunAjaran = '';
  let semester: 'Ganjil' | 'Genap' = 'Ganjil';

  if (month >= 7) {
    // July - December is Sem. Ganjil of year/year+1
    semester = 'Ganjil';
    tahunAjaran = `${year}/${year + 1}`;
  } else {
    // January - June is Sem. Genap of year-1/year
    semester = 'Genap';
    tahunAjaran = `${year - 1}/${year}`;
  }

  return { tahunAjaran, semester };
}

/**
 * Returns a list of all unique Academic Years present in the dataset
 */
export function getAvailableAcademicYears(tagihans: { bulanTahun: string }[]): string[] {
  const years = new Set<string>();
  tagihans.forEach(t => {
    years.add(getAcademicYearAndSemester(t.bulanTahun).tahunAjaran);
  });
  // Sort them so they look neat
  return Array.from(years).sort();
}
