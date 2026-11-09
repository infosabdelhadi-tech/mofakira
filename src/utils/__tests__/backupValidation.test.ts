import {
  validateBackupFile,
  restoreBackupData,
  BACKUP_SCHEMA_VERSION,
  STORAGE_KEYS,
  loadFromStorage
} from '../storage';

console.log('--- اختبار سلامة النسخ الاحتياطي والاسترجاع الشامل (All Modules & Entities) ---');

// Mock localStorage for Node environment if missing
if (typeof localStorage === 'undefined' || localStorage === null) {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => store[k] || null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

// 1. اختبار ملف صالح متكامل يشمل جميع الوحدات السبع
const validBackup = JSON.stringify({
  app: 'MOFAKKIRA_EDUCATIONAL_PLANNER',
  appVersion: '1.0.0',
  schemaVersion: BACKUP_SCHEMA_VERSION,
  exportDate: new Date().toISOString(),
  schoolProfile: {
    schoolName: 'مدرسة ابن خلدون الابتدائية',
    principalName: 'ذ. عبد الرحيم',
    academicYear: '2026 - 2027',
    directorate: 'الرباط',
    academy: 'جهة الرباط سلا القنيطرة'
  },
  tasks: [
    { id: 't1', title: 'إعداد جداول الحصص', status: 'جديدة', priority: 'عاجلة جداً' },
    { id: 't2', title: 'فحص مطافئ الحريق', status: 'مكتملة', priority: 'مهمة' }
  ],
  appointments: [
    { id: 'a1', title: 'لقاء مع المفتش', date: '2026-09-10', startTime: '10:00' }
  ],
  operations: [
    { id: 'op1', title: 'مشروع المؤسسة المندمج', progress: 40, status: 'قيد التنفيذ' }
  ],
  meetings: [
    { id: 'm1', title: 'مجلس التدبير - الدورة الأولى', type: 'مجلس التدبير' }
  ],
  annualProgram: [
    { id: 'ap1', title: 'استقبال التلاميذ الجدد', month: 'شتنبر' }
  ],
  dailyNotes: [
    { id: 'n1', title: 'ملاحظة حول انطلاق الحصص', content: 'سير ممتاز' }
  ],
  notifications: [
    { id: 'not1', title: 'تنبيه موعد', read: false }
  ],
  activityLogs: [
    { id: 'log1', action: 'إنشاء ملف', entityType: 'profile', entityTitle: 'مدرسة' }
  ]
});

const validRes = validateBackupFile(validBackup);
console.assert(validRes.isValid === true, `Valid backup validation failed: ${validRes.error}`);
console.assert(validRes.summary?.tasksCount === 2, 'Tasks count mismatch');
console.assert(validRes.summary?.appointmentsCount === 1, 'Appointments count mismatch');
console.assert(validRes.summary?.operationsCount === 1, 'Operations count mismatch');
console.assert(validRes.summary?.meetingsCount === 1, 'Meetings count mismatch');
console.assert(validRes.summary?.annualCount === 1, 'Annual program count mismatch');
console.assert(validRes.summary?.notesCount === 1, 'Notes count mismatch');
console.assert(validRes.summary?.schoolName === 'مدرسة ابن خلدون الابتدائية', 'School name mismatch');
console.log('✓ فحص النسخة الشاملة لكل الوحدات نجح 100%:', validRes.summary);

// 2. اختبار الاسترجاع الآمن والتأكد من استقرار البيانات
const restoreResult = restoreBackupData(validRes.data!);
console.assert(restoreResult.success === true, 'Safe restore execution failed');
const retrievedProfile = loadFromStorage(STORAGE_KEYS.PROFILE, {} as any);
console.assert(retrievedProfile.schoolName === 'مدرسة ابن خلدون الابتدائية', 'Profile was not restored properly');
console.log('✓ استرجاع البيانات الآمن نجح وتم التحقق من التخزين الفعلي!');

// 3. اختبار رفض الملفات التالفة أو غير المتوافقة
const corruptedJson = '{"app": "MOFAKKIRA", "tasks": [INVALID_JSON}';
const corruptedRes = validateBackupFile(corruptedJson);
console.assert(corruptedRes.isValid === false, 'Corrupted JSON should be rejected');
console.log('✓ تم رفض ملف JSON التالف بنجاح:', corruptedRes.error);

// 4. اختبار رفض ملف من تطبيق غريب
const alienApp = JSON.stringify({
  app: 'UNSUPPORTED_RANDOM_APP',
  items: [1, 2, 3]
});
const alienRes = validateBackupFile(alienApp);
console.assert(alienRes.isValid === false, 'Alien app backup should be rejected');
console.log('✓ تم رفض ملف لتطبيق غير متطابق بنجاح:', alienRes.error);

// 5. اختبار رفض ملف تنقصه الحقول الأساسية في المهام
const invalidTasksFormat = JSON.stringify({
  app: 'MOFAKKIRA_EDUCATIONAL_PLANNER',
  tasks: ['not-an-object', { noTitle: true }]
});
const invalidTasksRes = validateBackupFile(invalidTasksFormat);
console.assert(invalidTasksRes.isValid === false, 'Invalid task structures should be rejected');
console.log('✓ تم رصد ورفض بنية المهام التالفة بنجاح:', invalidTasksRes.error);
