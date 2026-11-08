import { getCurrentAcademicYear, getAvailableAcademicYears, formatAcademicYearLTR } from '../academicYear';

console.log('--- اختبار منطق الموسم الدراسي ---');
const sepDate = new Date(2026, 8, 15); // 15 Sep 2026 -> should be 2026 - 2027
const marchDate = new Date(2027, 2, 10); // 10 Mar 2027 -> should be 2026 - 2027
const julyDate = new Date(2026, 6, 20); // 20 Jul 2026 -> should be 2025 - 2026

console.assert(getCurrentAcademicYear(sepDate) === '2026 - 2027', `Expected 2026 - 2027, got ${getCurrentAcademicYear(sepDate)}`);
console.assert(getCurrentAcademicYear(marchDate) === '2026 - 2027', `Expected 2026 - 2027, got ${getCurrentAcademicYear(marchDate)}`);
console.assert(getCurrentAcademicYear(julyDate) === '2025 - 2026', `Expected 2025 - 2026, got ${getCurrentAcademicYear(julyDate)}`);

const available = getAvailableAcademicYears(sepDate);
console.assert(available.includes('2026 - 2027'), 'Available years should contain 2026 - 2027');
console.log('Academic year logic passed:', available);

const formatted = formatAcademicYearLTR('2026 - 2027');
console.assert(formatted.startsWith('\u202A') && formatted.endsWith('\u202C'), 'LTR format wrapper check failed');
console.log('Academic year LTR formatting passed!');
