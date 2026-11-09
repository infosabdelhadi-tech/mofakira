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
    { id: 't1', title: 'إعداد جداول الحصص', status: 'جديدة', priority: 'عاجلة جداً', dueDate: '2026-09-15' },
    { id: 't2', title: 'فحص مطافئ الحريق', status: 'مكتملة', priority: 'مهمة', dueDate: '2026-09-20' }
  ],
  appointments: [
    { id: 'a1', title: 'لقاء مع المفتش', date: '2026-09-10', startTime: '10:00' }
  ],
  operations: [
    { id: 'op1', title: 'مشروع المؤسسة المندمج', progress: 40, status: 'قيد التنفيذ' }
  ],
  meetings: [
    { id: 'm1', title: 'مجلس التدبير - الدورة الأولى', type: 'مجلس التدبير', date: '2026-09-12' }
  ],
  annualProgram: [
    { id: 'ap1', title: 'استقبال التلاميذ الجدد', month: 'شتنبر' }
  ],
  dailyNotes: [
    { id: 'n1', title: 'ملاحظة حول انطلاق الحصص', date: '2026-09-15', content: 'سير ممتاز' }
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
  schemaVersion: BACKUP_SCHEMA_VERSION,
  exportDate: new Date().toISOString(),
  schoolProfile: { schoolName: 'مدرسة', academicYear: '2026 - 2027' },
  tasks: ['not-an-object', { noTitle: true }]
});
const invalidTasksRes = validateBackupFile(invalidTasksFormat);
console.assert(invalidTasksRes.isValid === false, 'Invalid task structures should be rejected');
console.log('✓ تم رصد ورفض بنية المهام التالفة بنجاح:', invalidTasksRes.error);

// 6. اختبار رفض إصدار schema غير مدعوم
const unsupportedSchema = JSON.stringify({
  app: 'MOFAKKIRA_EDUCATIONAL_PLANNER',
  schemaVersion: 999,
  exportDate: new Date().toISOString(),
  schoolProfile: { schoolName: 'مدرسة', academicYear: '2026 - 2027' }
});
const unsupportedSchemaRes = validateBackupFile(unsupportedSchema);
console.assert(unsupportedSchemaRes.isValid === false, 'Unsupported schema version must be rejected');
console.log('✓ تم رفض schema version غير المدعوم بنجاح:', unsupportedSchemaRes.error);

// 7. اختبار محاكاة QuotaExceededError أثناء الاسترجاع والتحقق من الـ Rollback التام دون فقد أي بيانات
console.log('--- اختبار محاكاة QuotaExceededError أثناء الاسترجاع (Atomic Rollback Test) ---');
// حفظ بيانات مستخدم أصلية ومهمة
const originalTasks = [{ id: 'orig-1', title: 'مهمة أصلية سابقة لا يجب أن تضيع', status: 'جديدة' }];
localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(originalTasks));
localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify({ schoolName: 'المدرسة الأصلية', academicYear: '2026 - 2027' }));

// تجهيز نسخة استرجاع جديدة
const incomingBackupData = {
  app: 'MOFAKKIRA_EDUCATIONAL_PLANNER',
  appVersion: '1.0.0',
  schemaVersion: BACKUP_SCHEMA_VERSION,
  exportDate: new Date().toISOString(),
  schoolProfile: { schoolName: 'مدرسة جديدة من النسخة', academicYear: '2026 - 2027' },
  tasks: [{ id: 'new-t', title: 'مهمة جديدة', status: 'جديدة', priority: 'عادية', dueDate: '2026-10-01' }],
  appointments: [],
  operations: [],
  dailyNotes: [],
  meetings: [],
  annualProgram: [],
  notifications: [],
  activityLogs: []
};

// محاكاة خطأ نفاد مساحة التخزين أثناء محاولة كتابة TASKS خلال مرحلة الاسترجاع فقط
const originalSetItem = localStorage.setItem;
let isRestoring = true;
let quotaTriggered = false;
(localStorage as any).setItem = (k: string, v: string) => {
  if (isRestoring && k === STORAGE_KEYS.TASKS && !quotaTriggered) {
    quotaTriggered = true;
    const quotaErr = new Error('QuotaExceededError: DomException 22');
    quotaErr.name = 'QuotaExceededError';
    throw quotaErr;
  }
  // أثناء الـ rollback نسمح بالكتابة لاسترجاع الـ snapshot
  originalSetItem.call(localStorage, k, v);
};

// تنفيذ الاسترجاع المفترض أن يفشل
const failedRestoreRes = restoreBackupData(incomingBackupData as any);
isRestoring = false;
console.assert(failedRestoreRes.success === false, 'Restore should fail gracefully on QuotaExceededError');
console.log('✓ تم التقاط خطأ امتلاء التخزين بنجاح وسحب الاسترجاع بأمان:', failedRestoreRes.error);

// استعادة دالة setItem الأصلية للتأكد من حالة البيانات بعد Rollback
(localStorage as any).setItem = originalSetItem;

// التحقق الصارم من بقاء البيانات الأصلية كما كانت دون أي فقد أو مسح
const preservedTasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
const preservedProfile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) || '{}');
console.assert(preservedTasks.length === 1, 'Rollback failed: Tasks were lost or altered');
console.assert(preservedTasks[0].id === 'orig-1', 'Rollback failed: Task ID mismatch');
console.assert(preservedProfile.schoolName === 'المدرسة الأصلية', 'Rollback failed: Profile was overwritten');
console.log('✓ تم التحقق بنسبة 100%: جميع البيانات الأصلية محفوظة بالكامل بعد الـ Rollback!');
