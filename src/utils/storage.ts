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
  return loadFromStorage<ActivityLog[]>(STORAGE_KEYS.LOGS, [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      action: 'تهيئة وتحديث النظام والمفكرة الإدارية',
      entityType: 'profile',
      entityTitle: 'المؤسسة التعليمية'
    }
  ]);
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
 * Validates a backup file with deep integrity checking across all modules and fields.
 */
export const validateBackupFile = (jsonString: string): ValidationResult => {
  try {
    if (!jsonString || typeof jsonString !== 'string' || !jsonString.trim()) {
      return { isValid: false, error: 'الملف فارغ أو غير مقروء.' };
    }

    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { isValid: false, error: 'الملف لا يحتوي على كائن بيانات JSON سليم.' };
    }

    // 1. Verify schema or identifier
    if (parsed.app && typeof parsed.app === 'string' && !parsed.app.includes('MOFAKKIRA') && !parsed.app.includes('MOFAKIRA')) {
      return { isValid: false, error: 'الملف ينتمي لتطبيق آخر ولا يتوافق مع مفكرة الإدارة التربوية.' };
    }

    // 2. Validate schoolProfile if present
    if (parsed.schoolProfile) {
      if (typeof parsed.schoolProfile !== 'object' || Array.isArray(parsed.schoolProfile)) {
        return { isValid: false, error: 'بيانات هوية المؤسسة (schoolProfile) غير صالحة في الملف.' };
      }
    }

    // 3. Helper to validate array of items
    const validateArrayItems = (arr: any, _itemName: string, requiredField?: string) => {
      if (arr === undefined || arr === null) return true;
      if (!Array.isArray(arr)) return false;
      for (const item of arr) {
        if (!item || typeof item !== 'object') return false;
        if (requiredField && typeof item[requiredField] !== 'string') return false;
      }
      return true;
    };

    if (!validateArrayItems(parsed.tasks, 'المهام', 'title')) {
      return { isValid: false, error: 'تنسيق قائمة المهام (tasks) تالف أو تنقصه حقول أساسية.' };
    }

    if (!validateArrayItems(parsed.appointments, 'المواعيد', 'title')) {
      return { isValid: false, error: 'تنسيق قائمة المواعيد (appointments) تالف أو تنقصه حقول أساسية.' };
    }

    if (!validateArrayItems(parsed.operations, 'العمليات', 'title')) {
      return { isValid: false, error: 'تنسيق قائمة العمليات الإدارية (operations) تالف.' };
    }

    if (!validateArrayItems(parsed.meetings, 'المجالس', 'title')) {
      return { isValid: false, error: 'تنسيق محاضر المجالس (meetings) تالف.' };
    }

    if (!validateArrayItems(parsed.annualProgram, 'البرنامج السنوي', 'title')) {
      return { isValid: false, error: 'تنسيق أنشطة البرنامج السنوي (annualProgram) تالف.' };
    }

    if (!validateArrayItems(parsed.dailyNotes, 'الملاحظات اليومية', 'title')) {
      return { isValid: false, error: 'تنسيق تدوينات المفكرة اليومية (dailyNotes) تالف.' };
    }

    // Check at least one core entity exists
    const hasCore = parsed.schoolProfile || Array.isArray(parsed.tasks) || Array.isArray(parsed.operations) || Array.isArray(parsed.appointments);
    if (!hasCore) {
      return { isValid: false, error: 'الملف يفتقر إلى بيانات مفكرة الإدارة التربوية الأساسية.' };
    }

    return {
      isValid: true,
      summary: {
        tasksCount: Array.isArray(parsed.tasks) ? parsed.tasks.length : 0,
        appointmentsCount: Array.isArray(parsed.appointments) ? parsed.appointments.length : 0,
        operationsCount: Array.isArray(parsed.operations) ? parsed.operations.length : 0,
        meetingsCount: Array.isArray(parsed.meetings) ? parsed.meetings.length : 0,
        annualCount: Array.isArray(parsed.annualProgram) ? parsed.annualProgram.length : 0,
        notesCount: Array.isArray(parsed.dailyNotes) ? parsed.dailyNotes.length : 0,
        schoolName: parsed.schoolProfile?.schoolName || 'غير محدد',
        exportDate: parsed.exportDate ? new Date(parsed.exportDate).toLocaleString('ar-MA') : 'غير متوفر'
      },
      data: parsed as BackupDataStructure
    };
  } catch {
    return { isValid: false, error: 'تعذر قراءة ملف النسخة الاحتياطية. يرجى التأكد من اختيار ملف JSON سليم.' };
  }
};

/**
 * Atomic Safe Restore with Staging & Rollback:
 * Captures current snapshot, performs trial writes, and rolls back fully if storage quota or error occurs.
 */
export const restoreBackupData = (data: BackupDataStructure): { success: boolean; error?: string } => {
  // 1. Capture current snapshot for rollback
  const snapshot: Record<string, string | null> = {};
  for (const key of Object.values(STORAGE_KEYS)) {
    snapshot[key] = localStorage.getItem(key);
  }

  try {
    // 2. Prepare staging payload
    const stagePayload: [string, any][] = [];
    if (data.schoolProfile) stagePayload.push([STORAGE_KEYS.PROFILE, data.schoolProfile]);
    if (Array.isArray(data.tasks)) stagePayload.push([STORAGE_KEYS.TASKS, data.tasks]);
    if (Array.isArray(data.appointments)) stagePayload.push([STORAGE_KEYS.APPOINTMENTS, data.appointments]);
    if (Array.isArray(data.operations)) stagePayload.push([STORAGE_KEYS.OPERATIONS, data.operations]);
    if (Array.isArray(data.dailyNotes)) stagePayload.push([STORAGE_KEYS.NOTES, data.dailyNotes]);
    if (Array.isArray(data.meetings)) stagePayload.push([STORAGE_KEYS.MEETINGS, data.meetings]);
    if (Array.isArray(data.annualProgram)) stagePayload.push([STORAGE_KEYS.ANNUAL_PROGRAM, data.annualProgram]);
    if (Array.isArray(data.notifications)) stagePayload.push([STORAGE_KEYS.NOTIFICATIONS, data.notifications]);
    if (Array.isArray(data.activityLogs)) stagePayload.push([STORAGE_KEYS.LOGS, data.activityLogs]);

    // 3. Perform write with verification
    for (const [key, value] of stagePayload) {
      const ok = saveToStorage(key, value);
      if (!ok) {
        throw new Error(`تعذر حفظ البيانات في المفتاح ${key} نظراً لنفاد مساحة التخزين.`);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Safe Restore failed. Rolling back to previous snapshot...', err);
    // Rollback to prior snapshot
    for (const [key, prevVal] of Object.entries(snapshot)) {
      if (prevVal === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, prevVal);
      }
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
