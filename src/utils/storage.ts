import type {
  SchoolProfile,
  Task,
  Appointment,
  Operation,
  DailyNote,
  AppNotification,
  ActivityLog,
  Meeting,
  AnnualProgramItem
} from '../types';
import {
  initialSchoolProfile
} from './seedData';

const STORAGE_KEYS = {
  PROFILE: 'mofakkira_school_profile',
  TASKS: 'mofakkira_tasks',
  APPOINTMENTS: 'mofakkira_appointments',
  OPERATIONS: 'mofakkira_operations',
  NOTES: 'mofakkira_daily_notes',
  MEETINGS: 'mofakkira_meetings',
  ANNUAL_PROGRAM: 'mofakkira_annual_program',
  NOTIFICATIONS: 'mofakkira_notifications',
  LOGS: 'mofakkira_activity_logs',
  THEME: 'mofakkira_theme'
};

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error loading key ${key} from localStorage:`, err);
    return fallback;
  }
};

export const saveToStorage = <T>(key: string, data: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err: any) {
    console.error(`Error saving key ${key} to localStorage:`, err);
    // Never silently delete user activity logs or records on storage quota limits
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      console.warn('LocalStorage quota exceeded. Preserving existing user data without deletion.');
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        alert('تنبيه: امتلاء مساحة التخزين المؤقت بالمتصفح! تم الاحتفاظ ببياناتك السابقة دون حذف. يرجى تصدير نسخة احتياطية وإفراغ بعض المساحة.');
      }
    }
    return false;
  }
};

export const getInitialProfile = (): SchoolProfile => {
  // Always start with empty school profile (no fake demo names) for a new user
  return loadFromStorage<SchoolProfile>(STORAGE_KEYS.PROFILE, initialSchoolProfile);
};

export const getInitialTasks = (): Task[] => {
  // Start with clean empty array for new administrators, keeping existing user data if present
  return loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
};

export const getInitialAppointments = (): Appointment[] => {
  return loadFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
};

export const getInitialOperations = (): Operation[] => {
  return loadFromStorage<Operation[]>(STORAGE_KEYS.OPERATIONS, []);
};

export const getInitialNotes = (): DailyNote[] => {
  return loadFromStorage<DailyNote[]>(STORAGE_KEYS.NOTES, []);
};

export const getInitialMeetings = (): Meeting[] => {
  return loadFromStorage<Meeting[]>(STORAGE_KEYS.MEETINGS, []);
};

export const getInitialAnnualProgram = (): AnnualProgramItem[] => {
  return loadFromStorage<AnnualProgramItem[]>(STORAGE_KEYS.ANNUAL_PROGRAM, []);
};

export const getInitialNotifications = (): AppNotification[] => {
  return loadFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
};

export const getInitialLogs = (): ActivityLog[] => {
  // Clean empty array for activity logs for new installations
  return loadFromStorage<ActivityLog[]>(STORAGE_KEYS.LOGS, []);
};

export const BACKUP_SCHEMA_VERSION = 2;

export interface BackupDataStructure {
  app: string;
  appVersion: string;
  schemaVersion: number;
  exportDate: string;
  schoolProfile: SchoolProfile;
  tasks: Task[];
  appointments: Appointment[];
  operations: Operation[];
  dailyNotes: DailyNote[];
  meetings: Meeting[];
  annualProgram: AnnualProgramItem[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
}

export const exportAllDataAsJSON = (): string => {
  const data: BackupDataStructure = {
    app: 'MOFAKKIRA_EDUCATIONAL_PLANNER',
    appVersion: '1.0.0',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportDate: new Date().toISOString(),
    schoolProfile: loadFromStorage(STORAGE_KEYS.PROFILE, initialSchoolProfile),
    tasks: loadFromStorage(STORAGE_KEYS.TASKS, []),
    appointments: loadFromStorage(STORAGE_KEYS.APPOINTMENTS, []),
    operations: loadFromStorage(STORAGE_KEYS.OPERATIONS, []),
    dailyNotes: loadFromStorage(STORAGE_KEYS.NOTES, []),
    meetings: loadFromStorage(STORAGE_KEYS.MEETINGS, []),
    annualProgram: loadFromStorage(STORAGE_KEYS.ANNUAL_PROGRAM, []),
    notifications: loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []),
    activityLogs: loadFromStorage(STORAGE_KEYS.LOGS, [])
  };
  return JSON.stringify(data, null, 2);
};

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  summary?: {
    tasksCount: number;
    appointmentsCount: number;
    operationsCount: number;
    meetingsCount: number;
    annualCount: number;
    notesCount: number;
    schoolName: string;
    exportDate: string;
  };
  data?: BackupDataStructure;
}

/**
 * Validates a backup file with strict integrity checking across all modules, schema version, and entities.
 * Rejects unsupported versions, missing core fields, corrupted structures, and invalid array elements.
 */
export const validateBackupFile = (jsonString: string): ValidationResult => {
  try {
    if (!jsonString || typeof jsonString !== 'string' || !jsonString.trim()) {
      return { isValid: false, error: 'الملف فارغ أو غير مقروء.' };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      return { isValid: false, error: 'تعذر قراءة ملف النسخة الاحتياطية. يرجى التأكد من اختيار ملف JSON سليم.' };
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { isValid: false, error: 'الملف لا يحتوي على كائن بيانات JSON سليم.' };
    }

    // 1. Strict Exact Application Identifier Check
    if (parsed.app !== 'MOFAKKIRA_EDUCATIONAL_PLANNER') {
      return { isValid: false, error: 'الملف ينتمي لتطبيق آخر أو يفتقر للمعرّف الرسمي (MOFAKKIRA_EDUCATIONAL_PLANNER).' };
    }

    // 2. Strict Application Version Check
    if (typeof parsed.appVersion !== 'string' || !parsed.appVersion.trim()) {
      return { isValid: false, error: 'حقل إصدار التطبيق (appVersion) مفقود أو غير صالح.' };
    }

    // 3. Strict Schema Version Check (Exclusively version 2)
    if (parsed.schemaVersion !== BACKUP_SCHEMA_VERSION) {
      return { isValid: false, error: `إصدار Schema للنسخة الاحتياطية (${parsed.schemaVersion}) غير مدعوم. الإصدار المطلوب حصراً هو (${BACKUP_SCHEMA_VERSION}).` };
    }

    // 4. Strict Export Date Check
    if (!parsed.exportDate || typeof parsed.exportDate !== 'string' || isNaN(Date.parse(parsed.exportDate))) {
      return { isValid: false, error: 'تاريخ تصدير النسخة الاحتياطية مفقود أو غير صالح بتنسيق ISO.' };
    }

    // 5. Strict School Profile Validation
    if (!parsed.schoolProfile || typeof parsed.schoolProfile !== 'object' || Array.isArray(parsed.schoolProfile)) {
      return { isValid: false, error: 'بيانات هوية المؤسسة (schoolProfile) مفقودة أو غير صالحة.' };
    }
    const profile = parsed.schoolProfile;
    const requiredProfileStrings = ['schoolName', 'directorate', 'academy', 'academicYear', 'principalName', 'phone', 'email', 'address'];
    for (const field of requiredProfileStrings) {
      if (typeof profile[field] !== 'string') {
        return { isValid: false, error: `حقل (${field}) في بطاقة المؤسسة مفقود أو ليس قيمة نصية صالحة.` };
      }
    }

    // 6. Mandatory Entity Arrays Validation (All 8 entity arrays must be present and valid arrays)
    const validTaskStatuses = ['جديدة', 'مبرمجة', 'قيد التنفيذ', 'متوقفة', 'مكتملة', 'ملغاة'];
    const validTaskPriorities = ['عاجلة جداً', 'مهمة', 'متوسطة', 'منخفضة'];
    const validAppointmentTypes = ['اجتماع', 'زيارة تربوية', 'لقاء إداري', 'اجتماع مجلس', 'لقاء مع أولياء الأمور', 'نشاط مدرسي', 'موعد شخصي', 'موعد رسمي'];
    const validPhaseStatuses = ['مبرمجة', 'قيد التنفيذ', 'مكتملة', 'متأخرة'];
    const validOperationStatuses = ['مبرمجة', 'قيد التنفيذ', 'مكتملة', 'متأخرة'];
    const validMeetingTypes = ['مجلس التدبير', 'المجلس التربوي', 'المجالس التعليمية', 'مجالس الأقسام', 'اجتماع الأساتذة', 'لقاء جمعية الآباء', 'اجتماع إداري'];
    const validDecisionStatuses = ['قيد الانتظار', 'قيد التنفيذ', 'تم التنفيذ', 'ملغى'];
    const validNoteTypes = ['أعمال منجزة', 'أحداث مهمة', 'ملاحظات إدارية', 'ملاحظات تربوية', 'مشاكل وقرارات', 'مهام مرحلة'];
    const validNotifTypes = ['appointment', 'task', 'operation', 'meeting', 'system', 'reminder'];
    const validNotifPriorities = ['high', 'medium', 'low'];
    const validEntityTypes = ['task', 'appointment', 'operation', 'meeting', 'annual', 'note', 'profile'];

    // Tasks validation
    if (!Array.isArray(parsed.tasks)) {
      return { isValid: false, error: 'حقل المهام (tasks) إلزامي ويجب أن يكون مصفوفة.' };
    }
    for (let i = 0; i < parsed.tasks.length; i++) {
      const t = parsed.tasks[i];
      if (!t || typeof t !== 'object' || Array.isArray(t)) {
        return { isValid: false, error: `المهمة رقم ${i + 1} غير صالحة.` };
      }
      if (typeof t.id !== 'string' || typeof t.title !== 'string' || !t.title.trim() || typeof t.dueDate !== 'string') {
        return { isValid: false, error: `المهمة رقم ${i + 1} تنقصها حقول أساسية (id, title, dueDate).` };
      }
      if (!validTaskStatuses.includes(t.status)) {
        return { isValid: false, error: `المهمة "${t.title}" تحمل حالة تنفيذ غير صالحة (${t.status}).` };
      }
      if (!validTaskPriorities.includes(t.priority)) {
        return { isValid: false, error: `المهمة "${t.title}" تحمل أولوية غير صالحة (${t.priority}).` };
      }
      if (typeof t.completionPercentage !== 'number' || t.completionPercentage < 0 || t.completionPercentage > 100) {
        return { isValid: false, error: `المهمة "${t.title}" تحمل نسبة إنجاز غير صالحة.` };
      }
      if (t.checklist && !Array.isArray(t.checklist)) {
        return { isValid: false, error: `قائمة المتابعة checklist للمهمة "${t.title}" يجب أن تكون مصفوفة.` };
      }
      if (t.attachments && !Array.isArray(t.attachments)) {
        return { isValid: false, error: `مرفقات المهمة "${t.title}" يجب أن تكون مصفوفة.` };
      }
    }

    // Appointments validation
    if (!Array.isArray(parsed.appointments)) {
      return { isValid: false, error: 'حقل المواعيد (appointments) إلزامي ويجب أن يكون مصفوفة.' };
    }
    for (let i = 0; i < parsed.appointments.length; i++) {
      const a = parsed.appointments[i];
      if (!a || typeof a !== 'object' || Array.isArray(a)) {
        return { isValid: false, error: `الموعد رقم ${i + 1} غير صالح.` };
      }
      if (typeof a.id !== 'string' || typeof a.title !== 'string' || typeof a.date !== 'string' || typeof a.startTime !== 'string') {
        return { isValid: false, error: `الموعد رقم ${i + 1} تنقصه حقول أساسية (id, title, date, startTime).` };
      }
      if (!validAppointmentTypes.includes(a.type)) {
        return { isValid: false, error: `الموعد "${a.title}" يحمل نوع موعد غير صالح (${a.type}).` };
      }
    }

    // Operations validation
    if (!Array.isArray(parsed.operations)) {
      return { isValid: false, error: 'حقل العمليات (operations) إلزامي ويجب أن يكون مصفوفة.' };
    }
    for (let i = 0; i < parsed.operations.length; i++) {
      const op = parsed.operations[i];
      if (!op || typeof op !== 'object' || Array.isArray(op)) {
        return { isValid: false, error: `العملية رقم ${i + 1} غير صالحة.` };
      }
      if (typeof op.id !== 'string' || typeof op.title !== 'string' || !op.title.trim()) {
        return { isValid: false, error: `العملية رقم ${i + 1} تنقصها حقول أساسية (id, title).` };
      }
      if (!validOperationStatuses.includes(op.status)) {
        return { isValid: false, error: `العملية "${op.title}" تحمل حالة غير صالحة (${op.status}).` };
      }
      if (!Array.isArray(op.phases)) {
        return { isValid: false, error: `مراحل العملية "${op.title}" (phases) يجب أن تكون مصفوفة.` };
      }
      for (let pIdx = 0; pIdx < op.phases.length; pIdx++) {
        const ph = op.phases[pIdx];
        if (!ph || typeof ph !== 'object' || typeof ph.id !== 'string' || typeof ph.title !== 'string' || !validPhaseStatuses.includes(ph.status)) {
          return { isValid: false, error: `المرحلة رقم ${pIdx + 1} في العملية "${op.title}" غير صالحة.` };
        }
      }
    }

    // Meetings validation
    if (!Array.isArray(parsed.meetings)) {
      return { isValid: false, error: 'حقل المجالس والاجتماعات (meetings) إلزامي ويجب أن يكون مصفوفة.' };
    }
    for (let i = 0; i < parsed.meetings.length; i++) {
      const m = parsed.meetings[i];
      if (!m || typeof m !== 'object' || Array.isArray(m)) {
        return { isValid: false, error: `الاجتماع رقم ${i + 1} غير صالح.` };
      }
      if (typeof m.id !== 'string' || typeof m.title !== 'string' || typeof m.date !== 'string') {
        return { isValid: false, error: `الاجتماع رقم ${i + 1} تنقصه حقول أساسية (id, title, date).` };
      }
      if (!validMeetingTypes.includes(m.type)) {
        return { isValid: false, error: `الاجتماع "${m.title}" يحمل نوع مجلس غير صالح (${m.type}).` };
      }
      if (!Array.isArray(m.decisions)) {
        return { isValid: false, error: `قرارات الاجتماع "${m.title}" (decisions) يجب أن تكون مصفوفة.` };
      }
      for (let dIdx = 0; dIdx < m.decisions.length; dIdx++) {
        const dec = m.decisions[dIdx];
        if (!dec || typeof dec !== 'object' || typeof dec.id !== 'string' || typeof dec.decisionText !== 'string' || !validDecisionStatuses.includes(dec.status)) {
          return { isValid: false, error: `القرار رقم ${dIdx + 1} في الاجتماع "${m.title}" غير صالح.` };
        }
      }
    }

    // Annual Program validation
    if (!Array.isArray(parsed.annualProgram)) {
      return { isValid: false, error: 'حقل البرنامج السنوي (annualProgram) إلزامي ويجب أن يكون مصفوفة.' };
    }
    for (let i = 0; i < parsed.annualProgram.length; i++) {
      const an = parsed.annualProgram[i];
      if (!an || typeof an !== 'object' || Array.isArray(an)) {
        return { isValid: false, error: `نشاط البرنامج السنوي رقم ${i + 1} غير صالح.` };
      }
      if (typeof an.id !== 'string' || typeof an.title !== 'string' || typeof an.month !== 'string' || typeof an.academicYear !== 'string') {
        return { isValid: false, error: `نشاط البرنامج السنوي رقم ${i + 1} تنقصه حقول أساسية.` };
      }
    }

    // Daily Notes validation
    if (!Array.isArray(parsed.dailyNotes)) {
      return { isValid: false, error: 'حقل التدوينات اليومية (dailyNotes) إلزامي ويجب أن يكون مصفوفة.' };
    }
    for (let i = 0; i < parsed.dailyNotes.length; i++) {
      const n = parsed.dailyNotes[i];
      if (!n || typeof n !== 'object' || Array.isArray(n)) {
        return { isValid: false, error: `الملاحظة اليومية رقم ${i + 1} غير صالحة.` };
      }
      if (typeof n.id !== 'string' || typeof n.title !== 'string' || typeof n.date !== 'string') {
        return { isValid: false, error: `الملاحظة اليومية رقم ${i + 1} تنقصها حقول أساسية (id, title, date).` };
      }
      if (!validNoteTypes.includes(n.type)) {
        return { isValid: false, error: `الملاحظة اليومية "${n.title}" تحمل نوع تدوين غير صالح (${n.type}).` };
      }
    }

    // Notifications validation (Mandatory array)
    if (!Array.isArray(parsed.notifications)) {
      return { isValid: false, error: 'حقل الإشعارات (notifications) إلزامي ويجب أن يكون مصفوفة.' };
    }
    for (let i = 0; i < parsed.notifications.length; i++) {
      const notif = parsed.notifications[i];
      if (!notif || typeof notif !== 'object' || Array.isArray(notif)) {
        return { isValid: false, error: `الإشعار رقم ${i + 1} غير صالح.` };
      }
      if (typeof notif.id !== 'string' || typeof notif.title !== 'string' || typeof notif.message !== 'string' || typeof notif.read !== 'boolean') {
        return { isValid: false, error: `الإشعار رقم ${i + 1} تنقصه حقول أساسية (id, title, message, read).` };
      }
      if (!validNotifTypes.includes(notif.type)) {
        return { isValid: false, error: `الإشعار رقم ${i + 1} يحمل نوع غير صالح (${notif.type}).` };
      }
      if (!validNotifPriorities.includes(notif.priority)) {
        return { isValid: false, error: `الإشعار رقم ${i + 1} يحمل مستوى أولوية غير صالح (${notif.priority}).` };
      }
    }

    // Activity Logs validation (Mandatory array)
    if (!Array.isArray(parsed.activityLogs)) {
      return { isValid: false, error: 'حقل سجل الأنشطة (activityLogs) إلزامي ويجب أن يكون مصفوفة.' };
    }
    for (let i = 0; i < parsed.activityLogs.length; i++) {
      const log = parsed.activityLogs[i];
      if (!log || typeof log !== 'object' || Array.isArray(log)) {
        return { isValid: false, error: `سجل النشاط رقم ${i + 1} غير صالح.` };
      }
      if (typeof log.id !== 'string' || typeof log.timestamp !== 'string' || typeof log.action !== 'string' || typeof log.entityTitle !== 'string') {
        return { isValid: false, error: `سجل النشاط رقم ${i + 1} تنقصه حقول أساسية (id, timestamp, action, entityTitle).` };
      }
      if (!validEntityTypes.includes(log.entityType)) {
        return { isValid: false, error: `سجل النشاط رقم ${i + 1} يحمل نوع كيان غير صالح (${log.entityType}).` };
      }
    }

    return {
      isValid: true,
      summary: {
        tasksCount: parsed.tasks.length,
        appointmentsCount: parsed.appointments.length,
        operationsCount: parsed.operations.length,
        meetingsCount: parsed.meetings.length,
        annualCount: parsed.annualProgram.length,
        notesCount: parsed.dailyNotes.length,
        schoolName: parsed.schoolProfile?.schoolName || 'غير محدد',
        exportDate: new Date(parsed.exportDate).toLocaleString('ar-MA')
      },
      data: parsed as BackupDataStructure
    };
  } catch (err: any) {
    return { isValid: false, error: `تعذر التحقق من ملف النسخة الاحتياطية: ${err?.message || 'خطأ غير معروف'}` };
  }
};

/**
 * Atomic Safe Restore with Staging & Rollback:
 * Captures current snapshot, performs trial writes, and rolls back fully if storage quota or error occurs.
 */
export interface RestoreResult {
  success: boolean;
  error?: string;
  rollbackSucceeded?: boolean;
}

export const restoreBackupData = (data: BackupDataStructure): RestoreResult => {
  // 1. Capture complete current snapshot for rollback protection
  const snapshot: Record<string, string | null> = {};
  for (const key of Object.values(STORAGE_KEYS)) {
    snapshot[key] = localStorage.getItem(key);
  }

  try {
    // 2. Prepare staging payload
    const stagePayload: [string, any][] = [
      [STORAGE_KEYS.PROFILE, data.schoolProfile],
      [STORAGE_KEYS.TASKS, data.tasks],
      [STORAGE_KEYS.APPOINTMENTS, data.appointments],
      [STORAGE_KEYS.OPERATIONS, data.operations],
      [STORAGE_KEYS.NOTES, data.dailyNotes],
      [STORAGE_KEYS.MEETINGS, data.meetings],
      [STORAGE_KEYS.ANNUAL_PROGRAM, data.annualProgram],
      [STORAGE_KEYS.NOTIFICATIONS, data.notifications],
      [STORAGE_KEYS.LOGS, data.activityLogs]
    ];

    // 3. Perform atomic write without trimming or deleting existing keys
    for (const [key, value] of stagePayload) {
      const serialized = JSON.stringify(value);
      try {
        localStorage.setItem(key, serialized);
      } catch (writeErr: any) {
        throw new Error(`تعذر حفظ البيانات في المفتاح (${key}): ${writeErr?.message || 'نفدت مساحة التخزين'}`);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Safe Restore failed. Executing atomic rollback to previous snapshot...', err);
    let rollbackSucceeded = true;
    let rollbackErrorMessage: string | undefined;

    // Execute atomic rollback to exact prior snapshot
    try {
      for (const [key, prevVal] of Object.entries(snapshot)) {
        if (prevVal === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, prevVal);
        }
      }
    } catch (rollbackErr: any) {
      rollbackSucceeded = false;
      rollbackErrorMessage = rollbackErr?.message || 'خطأ غير معروف أثناء التراجع';
      console.error('Critical: Rollback error encountered:', rollbackErr);
    }

    return {
      success: false,
      rollbackSucceeded,
      error: rollbackSucceeded
        ? (err?.message || 'فشلت عملية الاسترجاع وتم الرجوع للحالة السابقة دون أي فقد للبيانات الحالية.')
        : `فشلت عملية الاسترجاع وفشل التراجع التلقائي أيضاً: ${rollbackErrorMessage}`
    };
  }
};

export const resetAllDataToDefault = (): void => {
  // Retain existing configured school profile identity if available, but clean operational records
  const currentProfile = loadFromStorage<SchoolProfile>(STORAGE_KEYS.PROFILE, initialSchoolProfile);
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(currentProfile));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ANNUAL_PROGRAM, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
};

export { STORAGE_KEYS };
