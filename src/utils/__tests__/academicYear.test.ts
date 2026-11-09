import { assert, describe } from './testHelper';
import {
  getCurrentAcademicYear,
  formatAcademicYearLTR,
  getAvailableAcademicYears
} from '../academicYear';

describe('1. اختبار 31 غشت يتبع الموسم السابق', () => {
  const d1 = new Date(2026, 7, 31); // 31 August 2026
  assert.equal(getCurrentAcademicYear(d1), '2025 - 2026');
});

describe('2. اختبار 1 شتنبر يفتتح الموسم الجديد', () => {
  const d2 = new Date(2026, 8, 1); // 1 September 2026
  assert.equal(getCurrentAcademicYear(d2), '2026 - 2027');
});

describe('3. اختبار 15 شتنبر ضمن الموسم الجديد', () => {
  const d3 = new Date(2026, 8, 15); // 15 September 2026
  assert.equal(getCurrentAcademicYear(d3), '2026 - 2027');
});

describe('4. اختبار 31 دجنبر يستمر ضمن الموسم الجديد', () => {
  const d4 = new Date(2026, 11, 31); // 31 December 2026
  assert.equal(getCurrentAcademicYear(d4), '2026 - 2027');
});

describe('5. اختبار 1 يناير يتبع الموسم الحالي', () => {
  const d5 = new Date(2027, 0, 1); // 1 January 2027
  assert.equal(getCurrentAcademicYear(d5), '2026 - 2027');
});

describe('6. قائمة المواسم الدراسية', () => {
  const years = getAvailableAcademicYears(new Date(2026, 8, 15));
  assert.ok(years.length === 3);
  assert.ok(years.includes('2026 - 2027'));
  assert.equal(years[1], '2026 - 2027');
});

describe('7. اختبار منع انقلاب الأرقام بالعلامات الاتجاهية LTR', () => {
  const formatted = formatAcademicYearLTR('2026 - 2027');
  assert.equal(formatted, '\u202A2026 - 2027\u202C');
});
