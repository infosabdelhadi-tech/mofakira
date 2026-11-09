import { getCurrentAcademicYear, getAvailableAcademicYears, formatAcademicYearLTR } from '../academicYear';

console.log('--- اختبار منطق حساب الموسم الدراسي المغربي والتواريخ الدقيقة ---');

// 1. 31 غشت (31 August 2026) -> يجب أن يبقى ضمن الموسم المنصرم 2025 - 2026
const d31Aug = new Date(2026, 7, 31, 12, 0, 0); // Month 7 is August
const year31Aug = getCurrentAcademicYear(d31Aug);
console.assert(year31Aug === '2025 - 2026', `31 August failed: expected 2025 - 2026, got ${year31Aug}`);
console.log('✓ 31 غشت يتبع الموسم السابق بنجاح:', year31Aug);

// 2. 1 شتنبر (1 September 2026) -> بداية الموسم الدراسي الجديد 2026 - 2027
const d1Sep = new Date(2026, 8, 1, 9, 0, 0); // Month 8 is September
const year1Sep = getCurrentAcademicYear(d1Sep);
console.assert(year1Sep === '2026 - 2027', `1 September failed: expected 2026 - 2027, got ${year1Sep}`);
console.log('✓ 1 شتنبر يفتتح الموسم الدراسي الجديد بنجاح:', year1Sep);

// 3. 15 شتنبر (15 September 2026) -> ضمن الموسم الجديد 2026 - 2027
const d15Sep = new Date(2026, 8, 15, 10, 30, 0);
const year15Sep = getCurrentAcademicYear(d15Sep);
console.assert(year15Sep === '2026 - 2027', `15 September failed: expected 2026 - 2027, got ${year15Sep}`);
console.log('✓ 15 شتنبر ضمن الموسم الدراسي الجديد بنجاح:', year15Sep);

// 4. 31 دجنبر (31 December 2026) -> يستمر ضمن الموسم 2026 - 2027
const d31Dec = new Date(2026, 11, 31, 23, 59, 0); // Month 11 is December
const year31Dec = getCurrentAcademicYear(d31Dec);
console.assert(year31Dec === '2026 - 2027', `31 December failed: expected 2026 - 2027, got ${year31Dec}`);
console.log('✓ 31 دجنبر يستمر ضمن الموسم الدراسي الجديد بنجاح:', year31Dec);

// 5. 1 يناير (1 January 2027) -> النصف الثاني من الموسم الدراسي 2026 - 2027
const d1Jan = new Date(2027, 0, 1, 8, 0, 0); // Month 0 is January
const year1Jan = getCurrentAcademicYear(d1Jan);
console.assert(year1Jan === '2026 - 2027', `1 January failed: expected 2026 - 2027, got ${year1Jan}`);
console.log('✓ 1 يناير ضمن النصف الثاني للموسم الدراسي بنجاح:', year1Jan);

// 6. التحقق من القوائم القابلة للاختيار
const available = getAvailableAcademicYears(d1Sep);
console.assert(available.includes('2026 - 2027'), 'Available years should contain 2026 - 2027');
console.assert(available.includes('2025 - 2026'), 'Available years should contain 2025 - 2026');
console.assert(available.includes('2027 - 2028'), 'Available years should contain 2027 - 2028');
console.log('✓ قائمة المواسم المتاحة سليمة:', available);

// 7. التحقق من ترميز اتجاه الأرقام والسنوات RTL / LTR
const formatted = formatAcademicYearLTR('2026 - 2027');
console.assert(formatted.startsWith('\u202A') && formatted.endsWith('\u202C'), 'LTR format wrapper check failed');
console.assert(formatted.includes('2026 - 2027'), 'Year string corrupted');
console.log('✓ علامات LTR تمنع انقلاب الأرقام بنجاح:', formatted);
