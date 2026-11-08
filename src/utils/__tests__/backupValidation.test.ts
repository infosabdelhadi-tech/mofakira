import { validateBackupFile } from '../storage';

console.log('--- اختبار سلامة النسخ الاحتياطي والاسترجاع ---');

// 1. فحص ملف سليم ومكتمل
const completeBackup = {
  app: 'MOFAKKIRA_EDUCATIONAL_PLANNER',
  appVersion: '1.0.0',
  schemaVersion: 2,
  exportDate: new Date().toISOString(),
  schoolProfile: {
    schoolName: 'مدرسة المسيرة الابتدائية',
    academicYear: '2026 - 2027',
    principalName: 'ذ. عبد الرحيم'
  },
  tasks: [
    { id: 't1', title: 'إعداد جدول الحصص', status: 'قيد التنفيذ', priority: 'عاجلة جداً' },
    { id: 't2', title: 'مراقبة التدفئة', status: 'مكتملة', priority: 'مهمة' }
  ],
  appointments: [
    { id: 'a1', title: 'مجلس تدبير', date: '2026-10-15' }
  ],
  operations: [
    { id: 'op1', title: 'الدخول المدرسي', progress: 80, phases: [{ id: 'p1', title: 'المرحلة 1', status: 'مكتملة' }] }
  ],
  dailyNotes: [
    { id: 'n1', title: 'ملاحظة صباحية' }
  ],
  meetings: [
    { id: 'm1', title: 'مجلس التدبير الأول', decisions: [{ id: 'd1', decisionText: 'المصادقة على البرنامج', convertedTaskId: 't1' }] }
  ],
  annualProgram: [
    { id: 'ap1', title: 'برنامج شتنبر', month: 'شتنبر (Septembre)' }
  ],
  notifications: [],
  activityLogs: []
};

const validResult = validateBackupFile(JSON.stringify(completeBackup));
console.assert(validResult.isValid === true, 'Valid backup should be approved');
console.assert(validResult.summary?.tasksCount === 2, 'Summary should report 2 tasks');
console.assert(validResult.summary?.appointmentsCount === 1, 'Summary should report 1 appointment');
console.assert(validResult.summary?.operationsCount === 1, 'Summary should report 1 operation');
console.assert(validResult.summary?.meetingsCount === 1, 'Summary should report 1 meeting');
console.assert(validResult.summary?.schoolName === 'مدرسة المسيرة الابتدائية', 'School name should match');
console.log('Valid backup validation passed! Summary:', validResult.summary);

// 2. فحص ملف غير صالح (تالف)
const corruptResult = validateBackupFile('{ "title": "corrupted json without closure');
console.assert(corruptResult.isValid === false, 'Corrupt backup should be rejected');
console.assert(corruptResult.error?.includes('تعذر فك تشفير'), 'Should report parsing error');
console.log('Corrupted file rejection passed!');

// 3. فحص ملف خارجي لا علاقة له بتطبيق المفكرة
const alienResult = validateBackupFile(JSON.stringify({ someRandomField: 42, notes: 'Hello' }));
console.assert(alienResult.isValid === false, 'Alien backup should be rejected');
console.assert(alienResult.error?.includes('لا ينتمي لمنظومة مفكرة الإدارة التربوية'), 'Should report domain mismatch error');
console.log('Alien file rejection passed!');
