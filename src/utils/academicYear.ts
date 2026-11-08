/**
 * Calculates current Moroccan academic year dynamically.
 * In Morocco, the school year starts in September (month index 8)
 * and concludes in July/August of the next calendar year.
 */
export const getCurrentAcademicYear = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed: Jan=0, Aug=7, Sep=8
  if (month >= 7) { // August onwards belongs to upcoming school year kickoff
    return `${year} - ${year + 1}`;
  }
  return `${year - 1} - ${year}`;
};

/**
 * Formats academic year to guarantee standard display order (e.g. 2026 - 2027)
 * using LTR embedding markers to prevent bi-directional swapping in Arabic RTL layouts.
 */
export const formatAcademicYearLTR = (yearStr: string): string => {
  if (!yearStr) return '';
  // Wrap with Left-to-Right Embedding (\u202A) and Pop Directional Formatting (\u202C)
  return `\u202A${yearStr}\u202C`;
};

/**
 * Generates selectable Moroccan academic years (e.g. current year +/- 2 years)
 */
export const getAvailableAcademicYears = (d = new Date()): string[] => {
  const current = getCurrentAcademicYear(d);
  const parts = current.split(' - ').map(s => parseInt(s.trim(), 10));
  const baseStart = parts[0] || d.getFullYear();

  return [
    `${baseStart - 1} - ${baseStart}`,
    `${baseStart} - ${baseStart + 1}`,
    `${baseStart + 1} - ${baseStart + 2}`
  ];
};
