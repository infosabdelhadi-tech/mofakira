import { assert, describe } from './testHelper';
import {
  validateBackupFile,
  restoreBackupData,
  BACKUP_SCHEMA_VERSION,
  STORAGE_KEYS,
  type BackupDataStructure
} from '../storage';

// Setup Mock localStorage for Node environment if missing
const mockStore: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => (k in mockStore ? mockStore[k] : null),
  setItem: (k: string, v: string) => { mockStore[k] = String(v); },
  removeItem: (k: string) => { delete mockStore[k]; },
  clear: () => { Object.keys(mockStore).forEach(k => delete mockStore[k]); }
};

const createFullValidBackupObject = (): BackupDataStructure => ({
  app: 'MOFAKKIRA_EDUCATIONAL_PLANNER',
  appVersion: '1.0.0',
  schemaVersion: BACKUP_SCHEMA_VERSION,
  exportDate: new Date().toISOString(),
  schoolProfile: {
    schoolName: 'مدرسة ابن خلدون الابتدائية',
    principalName: 'ذ. عبد الرحيم',
    academicYear: '2026 - 2027',
    directorate: 'الرباط',
    academy: 'جهة الرباط سلا القنيطرة',
    phone: '0537000000',
    email: 'contact@school.ma',
    address: 'شارع المسيرة'
  },
  tasks: [
    {
      id: 't1',
      title: 'إعداد جداول الحصص',
      description: 'توزيع جداول الحصص الأسبوعية',
      status: 'جديدة',
      priority: 'عاجلة جداً',
      dueDate: '2026-09-15',
      category: 'الشؤون التربوية',
      createdAt: '2026-09-01',
      startDate: '2026-09-02',
      assignedTo: 'المدير',
      completionPercentage: 0,
      checklist: [],
      attachments: [],
      updatedAt: '2026-09-01'
    }
  ],
  appointments: [
    {
      id: 'a1',
      title: 'لقاء مع المفتش',
      type: 'زيارة تربوية',
      date: '2026-09-10',
      startTime: '10:00',
      endTime: '11:30',
      location: 'مكتب الإدارة',
      attendees: 'المفتش والمدير',
      description: 'لقاء تنسيقي',
      reminder: '30m',
      createdAt: '2026-09-01',
      updatedAt: '2026-09-01'
    }
  ],
  operations: [
    {
      id: 'op1',
      title: 'مشروع المؤسسة المندمج',
      objective: 'الارتقاء بالتعلمات',
      category: 'الشؤون التربوية',
      reference: 'المقرر الوزاري',
      startDate: '2026-09-15',
      dueDate: '2026-12-30',
      responsible: 'المدير',
      participants: 'الأساتذة',
      resources: 'قاعة',
      indicators: 'نسبة النجاح',
      progress: 40,
      status: 'قيد التنفيذ',
      phases: [
        {
          id: 'p1',
          order: 1,
          title: 'المرحلة الأولى',
          startDate: '2026-09-15',
          dueDate: '2026-10-15',
          status: 'مكتملة',
          responsible: 'فريق القيادة'
        }
      ],
      createdAt: '2026-09-01',
      updatedAt: '2026-09-01'
    }
  ],
  meetings: [
    {
      id: 'm1',
      title: 'مجلس التدبير - الدورة الأولى',
      type: 'مجلس التدبير',
      date: '2026-09-12',
      time: '15:00',
      location: 'قاعة الاجتماعات',
      attendees: 'الأساتذة وممثلو الآباء',
      agenda: ['المصادقة على البرنامج السنوي'],
      discussionPoints: 'نقاش عام',
      decisions: [
        {
          id: 'dec1',
          decisionText: 'المصادقة على النظام الداخلي',
          responsible: 'المدير',
          deadline: '2026-09-20',
          status: 'قيد الانتظار'
        }
      ],
      minutes: 'محضر رسمي',
      academicYear: '2026 - 2027',
      createdAt: '2026-09-12',
      updatedAt: '2026-09-12'
    }
  ],
  annualProgram: [
    {
      id: 'ap1',
      title: 'استقبال التلاميذ الجدد',
      month: 'شتنبر (Septembre)',
      academicYear: '2026 - 2027',
      category: 'الإدارة والتدبير',
      objective: 'انطلاق سلس',
      targetDate: '2026-09-15',
      responsible: 'المدير',
      indicators: '100%',
      status: 'مبرمجة',
      completionPercentage: 0
    }
  ],
  dailyNotes: [
    {
      id: 'n1',
      title: 'ملاحظة حول انطلاق الحصص',
      date: '2026-09-15',
      timestamp: '09:00',
      type: 'أعمال منجزة',
      content: 'سير ممتاز للدراسة',
      createdAt: '2026-09-15T09:00:00Z',
      updatedAt: '2026-09-15T09:00:00Z'
    }
  ],
  notifications: [
    {
      id: 'not1',
      title: 'تنبيه موعد',
      message: 'موعد قريب',
      type: 'appointment',
      priority: 'high',
      timestamp: '2026-09-15T09:00:00Z',
      read: false
    }
  ],
  activityLogs: [
    {
      id: 'log1',
      timestamp: '2026-09-15T09:00:00Z',
      action: 'إنشاء ملف',
      entityType: 'profile',
      entityTitle: 'مدرسة ابن خلدون'
    }
  ]
});

describe('1. فحص النسخة الشاملة الصالحة 100% لجميع الكيانات الثمانية', () => {
  const fullBackup = createFullValidBackupObject();
  const res = validateBackupFile(JSON.stringify(fullBackup));
  assert.equal(res.isValid, true, `Validation failed: ${res.error}`);
  assert.equal(res.summary?.tasksCount, 1);
  assert.equal(res.summary?.appointmentsCount, 1);
  assert.equal(res.summary?.operationsCount, 1);
  assert.equal(res.summary?.meetingsCount, 1);
  assert.equal(res.summary?.annualCount, 1);
  assert.equal(res.summary?.notesCount, 1);
  assert.equal(res.summary?.schoolName, 'مدرسة ابن خلدون الابتدائية');
});

describe('2. رفض الإصدارات غير المتوافقة حصراً (رفض v1 أو v999 وقبول v2 فقط)', () => {
  const backupV1 = createFullValidBackupObject();
  (backupV1 as any).schemaVersion = 1;
  const resV1 = validateBackupFile(JSON.stringify(backupV1));
  assert.equal(resV1.isValid, false, 'Schema Version 1 must be strictly rejected');
  assert.match(resV1.error || '', /غير مدعوم/);

  const backupV999 = createFullValidBackupObject();
  (backupV999 as any).schemaVersion = 999;
  const resV999 = validateBackupFile(JSON.stringify(backupV999));
  assert.equal(resV999.isValid, false, 'Schema Version 999 must be strictly rejected');
  assert.match(resV999.error || '', /غير مدعوم/);
});

describe('3. مطابقة المعرف الدقيق للتطبيق حصراً (رفض المعرفات الجزئية أو الغريبة)', () => {
  const backupSub = createFullValidBackupObject();
  (backupSub as any).app = 'MOFAKKIRA_EDUCATIONAL_PLANNER_OTHER';
  const resSub = validateBackupFile(JSON.stringify(backupSub));
  assert.equal(resSub.isValid, false, 'Partial or modified app ID must be strictly rejected');

  const backupAlien = createFullValidBackupObject();
  (backupAlien as any).app = 'SOME_OTHER_APP';
  const resAlien = validateBackupFile(JSON.stringify(backupAlien));
  assert.equal(resAlien.isValid, false, 'Alien app must be strictly rejected');
});

describe('4. التحقق الصارم من appVersion وتاريخ التصدير exportDate', () => {
  const noAppVersion = createFullValidBackupObject();
  delete (noAppVersion as any).appVersion;
  const resAppVer = validateBackupFile(JSON.stringify(noAppVersion));
  assert.equal(resAppVer.isValid, false, 'Missing appVersion must be rejected');

  const badDate = createFullValidBackupObject();
  badDate.exportDate = 'invalid-date-string';
  const resDate = validateBackupFile(JSON.stringify(badDate));
  assert.equal(resDate.isValid, false, 'Invalid exportDate must be rejected');
});

describe('5. التحقق الصارم من هوية المؤسسة schoolProfile وحقولها الإلزامية', () => {
  const missingProfileField = createFullValidBackupObject();
  delete (missingProfileField.schoolProfile as any).principalName;
  const resField = validateBackupFile(JSON.stringify(missingProfileField));
  assert.equal(resField.isValid, false, 'Missing principalName must be rejected');
});

describe('6. فحص إلزامية وصحة notifications و activityLogs', () => {
  // Missing notifications array
  const missingNotifs = createFullValidBackupObject();
  delete (missingNotifs as any).notifications;
  const resMissingNotifs = validateBackupFile(JSON.stringify(missingNotifs));
  assert.equal(resMissingNotifs.isValid, false, 'Missing notifications array must be rejected');

  // Corrupted notification element
  const badNotifItem = createFullValidBackupObject();
  badNotifItem.notifications = [{ id: 'not-1', title: 'تنبيه' } as any];
  const resBadNotif = validateBackupFile(JSON.stringify(badNotifItem));
  assert.equal(resBadNotif.isValid, false, 'Invalid notification item must be rejected');

  // Missing activityLogs array
  const missingLogs = createFullValidBackupObject();
  delete (missingLogs as any).activityLogs;
  const resMissingLogs = validateBackupFile(JSON.stringify(missingLogs));
  assert.equal(resMissingLogs.isValid, false, 'Missing activityLogs array must be rejected');

  // Invalid log entityType
  const badLogType = createFullValidBackupObject();
  badLogType.activityLogs = [{ id: 'l1', timestamp: '2026-09-01', action: 'action', entityTitle: 't', entityType: 'INVALID' as any }];
  const resBadLog = validateBackupFile(JSON.stringify(badLogType));
  assert.equal(resBadLog.isValid, false, 'Invalid activityLog entityType must be rejected');
});

describe('7. فحص سلامة الحقول المتداخلة (Checklist, Phases, Decisions, Attachments, Profile Options)', () => {
  // Invalid task status union
  const badTaskStatus = createFullValidBackupObject();
  badTaskStatus.tasks[0].status = 'INVALID_STATUS' as any;
  const resStatus = validateBackupFile(JSON.stringify(badTaskStatus));
  assert.equal(resStatus.isValid, false, 'Invalid task status must be rejected');

  // Corrupted checklist item (boolean completed missing or non-boolean)
  const badChecklist = createFullValidBackupObject();
  badChecklist.tasks[0].checklist = [{ id: 'c1', text: 'بند', completed: 'NOT_A_BOOLEAN' as any }];
  const resChecklist = validateBackupFile(JSON.stringify(badChecklist));
  assert.equal(resChecklist.isValid, false, 'Corrupted checklist item must be rejected');

  // Corrupted attachment item
  const badAtt = createFullValidBackupObject();
  badAtt.tasks[0].attachments = [{ id: 'att-1', name: 'ملف' } as any];
  const resAtt = validateBackupFile(JSON.stringify(badAtt));
  assert.equal(resAtt.isValid, false, 'Corrupted attachment item must be rejected');

  // Corrupted optional schoolProfile logoUrl (must be string if present)
  const badLogo = createFullValidBackupObject();
  (badLogo.schoolProfile as any).logoUrl = 12345;
  const resLogo = validateBackupFile(JSON.stringify(badLogo));
  assert.equal(resLogo.isValid, false, 'Non-string logoUrl must be rejected');

  // Invalid operation phase
  const badPhase = createFullValidBackupObject();
  badPhase.operations[0].phases = [{ id: 'p1', title: 'مرحلة', status: 'NON_EXISTENT' as any, startDate: '', dueDate: '', order: 1, responsible: '' }];
  const resPhase = validateBackupFile(JSON.stringify(badPhase));
  assert.equal(resPhase.isValid, false, 'Invalid phase status must be rejected');

  // Invalid meeting decision
  const badDecision = createFullValidBackupObject();
  badDecision.meetings[0].decisions = [{ id: 'd1', decisionText: 'نص', deadline: '', responsible: '', status: 'BAD_STATUS' as any }];
  const resDecision = validateBackupFile(JSON.stringify(badDecision));
  assert.equal(resDecision.isValid, false, 'Invalid decision status must be rejected');
});

describe('8. اختبار الاسترجاع الذري والمقارنة الشاملة للبيانات بعد محاكاة QuotaExceededError (Deep Snapshot Equality)', () => {
  // 1. تجهيز بيئة التخزين بحالة كاملة ومعروفة للمستخدم
  localStorage.clear();
  const initialProfileState = { schoolName: 'المؤسسة الأساسية القديمة', academicYear: '2026 - 2027', principalName: 'المدير الأصلي' };
  const initialTasksState = [
    { id: 'orig-task-1', title: 'مهمة أصلية 1', status: 'جديدة' },
    { id: 'orig-task-2', title: 'مهمة أصلية 2', status: 'مكتملة' }
  ];
  const initialNotesState = [{ id: 'orig-n-1', title: 'ملاحظة أصلية', content: 'نص' }];

  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialProfileState));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialTasksState));
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(initialNotesState));
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ANNUAL_PROGRAM, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));

  // أخذ نسخة كاملة مطابقة لمقارنتها بعد الفشل
  const preRestoreSnapshot: Record<string, string | null> = {};
  for (const key of Object.values(STORAGE_KEYS)) {
    preRestoreSnapshot[key] = localStorage.getItem(key);
  }

  // تجهيز دفعة استرجاع جديدة صالحة
  const incomingData = createFullValidBackupObject();
  incomingData.schoolProfile.schoolName = 'المدرسة المستوردة الجديدة';

  // محاكاة رمي QuotaExceededError أثناء محاولة كتابة OPERATIONS فقط
  const originalSetItem = localStorage.setItem;
  let isRestoring = true;
  let quotaTriggered = false;
  (localStorage as any).setItem = (k: string, v: string) => {
    if (isRestoring && !quotaTriggered && k === STORAGE_KEYS.OPERATIONS) {
      quotaTriggered = true;
      const quotaErr = new Error('QuotaExceededError: DomException 22');
      quotaErr.name = 'QuotaExceededError';
      throw quotaErr;
    }
    // أثناء الـ rollback نسمح بالكتابة لاسترجاع snapshot الأصلي
    originalSetItem.call(localStorage, k, v);
  };

  const restoreOutcome = restoreBackupData(incomingData);
  isRestoring = false;
  (localStorage as any).setItem = originalSetItem; // استعادة دالة الكتابة

  assert.equal(restoreOutcome.success, false, 'Restore must report failure on QuotaExceededError');
  assert.equal(restoreOutcome.rollbackSucceeded, true, 'Rollback must report success');

  // التحقق بالمقارنة الشاملة الدقيقة (Deep Snapshot Equality) لكل المفاتيح
  for (const key of Object.values(STORAGE_KEYS)) {
    const currentValue = localStorage.getItem(key);
    assert.equal(
      currentValue,
      preRestoreSnapshot[key],
      `Data integrity mismatch after rollback on key (${key}): expected ${preRestoreSnapshot[key]} but found ${currentValue}`
    );
  }
});

describe('9. اختبار التعامل الصادق عند فشل الـ Rollback نفسه (عدم الادعاء بالنجاح)', () => {
  const incomingData = createFullValidBackupObject();

  const originalSetItem = localStorage.setItem;
  // محاكاة فشل الكتابة أثناء الاسترجاع وأثناء الـ rollback أيضاً
  (localStorage as any).setItem = () => {
    throw new Error('Disk Completely Read-Only or Broken Storage');
  };

  const outcome = restoreBackupData(incomingData);
  (localStorage as any).setItem = originalSetItem;

  assert.equal(outcome.success, false, 'Must not claim success');
  assert.equal(outcome.rollbackSucceeded, false, 'Must report rollbackSucceeded as false when rollback fails');
  assert.match(outcome.error || '', /فشل التراجع التلقائي/, 'Error message must reflect rollback failure');
});
