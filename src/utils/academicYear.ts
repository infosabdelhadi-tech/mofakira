/**
 * Calculates current Moroccan academic year dynamically.
 * In Morocco, the school year starts in September (month index 8 in JavaScript Date)
 * and concludes at the end of August (month index 7) of the subsequent calendar year.
 * August remains part of the previous school year, while September 1st kicks off the new academic year.
 */
export const getCurrentAcademicYear = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed: Jan=0, Jul=6, Aug=7, Sep=8, Dec=11

  // September (8) to December (11): Start of academic year Y - (Y+1)
  if (month >= 8) {
    return `${year} - ${year + 1}`;
  }

  // January (0) to August (7): End of academic year (Y-1) - Y
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
