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
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      console.warn('LocalStorage quota exceeded! Attempting to trim activity logs...');
      try {
        localStorage.removeItem(STORAGE_KEYS.LOGS);
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch {
        alert('تنبيه: امتلاء مساحة التخزين المؤقت بالمتصفح! يرجى تحميل نسخة احتياطية من الإعدادات وإفراغ بعض المساحة.');
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

    // 1. Strict Application Identity Check
    if (typeof parsed.app !== 'string' || (!parsed.app.includes('MOFAKKIRA') && !parsed.app.includes('MOFAKIRA'))) {
      return { isValid: false, error: 'الملف ينتمي لتطبيق آخر ولا يتوافق مع مفكرة الإدارة التربوية.' };
    }

    // 2. Strict Schema Version Check
    if (typeof parsed.schemaVersion !== 'number' || parsed.schemaVersion < 1 || parsed.schemaVersion > BACKUP_SCHEMA_VERSION) {
      return { isValid: false, error: `إصدار النسخة الاحتياطية (${parsed.schemaVersion}) غير مدعوم من قبل هذا الإصدار من التطبيق.` };
    }

    // 3. Strict Export Date Check
    if (!parsed.exportDate || typeof parsed.exportDate !== 'string' || isNaN(Date.parse(parsed.exportDate))) {
      return { isValid: false, error: 'تاريخ تصدير النسخة الاحتياطية مفقود أو غير صالح.' };
    }

    // 4. Strict School Profile Validation
    if (!parsed.schoolProfile || typeof parsed.schoolProfile !== 'object' || Array.isArray(parsed.schoolProfile)) {
      return { isValid: false, error: 'بيانات هوية المؤسسة (schoolProfile) مفقودة أو غير صالحة.' };
    }
    const profile = parsed.schoolProfile;
    if (typeof profile.academicYear !== 'string') {
      return { isValid: false, error: 'حقل الموسم الدراسي في بطاقة المؤسسة غير صالح.' };
    }

    // 5. Array Validation Helper
    const validateArrayItems = (
      arr: any,
      fieldName: string,
      requiredKeys: string[]
    ): { valid: boolean; error?: string } => {
      if (!Array.isArray(arr)) {
        return { valid: false, error: `حقل (${fieldName}) غير موجود كمصفوفة صالحة في النسخة الاحتياطية.` };
      }
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          return { valid: false, error: `العنصر رقم ${i + 1} في قائمة (${fieldName}) تالف أو غير صالح.` };
        }
        for (const req of requiredKeys) {
          if (item[req] === undefined || item[req] === null || typeof item[req] !== 'string') {
            return { valid: false, error: `العنصر رقم ${i + 1} في قائمة (${fieldName}) تنقصه الخاصية الإلزامية (${req}).` };
          }
        }
      }
      return { valid: true };
    };

    // Tasks check
    const tasksVal = validateArrayItems(parsed.tasks, 'tasks', ['title', 'status', 'priority', 'dueDate']);
    if (!tasksVal.valid) return { isValid: false, error: tasksVal.error };

    // Appointments check
    const aptsVal = validateArrayItems(parsed.appointments, 'appointments', ['title', 'date', 'startTime']);
    if (!aptsVal.valid) return { isValid: false, error: aptsVal.error };

    // Operations check
    const opsVal = validateArrayItems(parsed.operations, 'operations', ['title', 'status']);
    if (!opsVal.valid) return { isValid: false, error: opsVal.error };

    // Meetings check
    const meetsVal = validateArrayItems(parsed.meetings, 'meetings', ['title', 'date']);
    if (!meetsVal.valid) return { isValid: false, error: meetsVal.error };

    // Annual Program check
    const annVal = validateArrayItems(parsed.annualProgram, 'annualProgram', ['title', 'month']);
    if (!annVal.valid) return { isValid: false, error: annVal.error };

    // Daily Notes check
    const notesVal = validateArrayItems(parsed.dailyNotes, 'dailyNotes', ['title', 'date']);
    if (!notesVal.valid) return { isValid: false, error: notesVal.error };

    // Notifications check
    if (parsed.notifications !== undefined && !Array.isArray(parsed.notifications)) {
      return { isValid: false, error: 'حقل الإشعارات (notifications) غير صالح.' };
    }

    // Activity Logs check
    if (parsed.activityLogs !== undefined && !Array.isArray(parsed.activityLogs)) {
      return { isValid: false, error: 'سجل الأنشطة (activityLogs) غير صالح.' };
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
export const restoreBackupData = (data: BackupDataStructure): { success: boolean; error?: string } => {
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
      [STORAGE_KEYS.NOTIFICATIONS, data.notifications || []],
      [STORAGE_KEYS.LOGS, data.activityLogs || []]
    ];

    // 3. Perform write without trimming existing keys during restore
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
    // Atomic rollback to prior snapshot with defensive error handling
    try {
      for (const [key, prevVal] of Object.entries(snapshot)) {
        if (prevVal === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, prevVal);
        }
      }
    } catch (rollbackErr) {
      console.error('Critical: Rollback error encountered:', rollbackErr);
    }

    return {
      success: false,
      error: err?.message || 'فشلت عملية الاسترجاع وتم الرجوع للحالة السابقة دون أي فقد للبيانات الحالية.'
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
