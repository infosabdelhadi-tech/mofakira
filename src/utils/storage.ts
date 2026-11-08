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
  initialSchoolProfile,
  initialTasks,
  initialAppointments,
  initialOperations,
  initialDailyNotes,
  initialNotifications,
  initialMeetings,
  initialAnnualProgram
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
      } catch (retryErr) {
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
  return loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, initialTasks);
};

export const getInitialAppointments = (): Appointment[] => {
  return loadFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
};

export const getInitialOperations = (): Operation[] => {
  return loadFromStorage<Operation[]>(STORAGE_KEYS.OPERATIONS, initialOperations);
};

export const getInitialNotes = (): DailyNote[] => {
  return loadFromStorage<DailyNote[]>(STORAGE_KEYS.NOTES, initialDailyNotes);
};

export const getInitialMeetings = (): Meeting[] => {
  return loadFromStorage<Meeting[]>(STORAGE_KEYS.MEETINGS, initialMeetings);
};

export const getInitialAnnualProgram = (): AnnualProgramItem[] => {
  return loadFromStorage<AnnualProgramItem>(STORAGE_KEYS.ANNUAL_PROGRAM, initialAnnualProgram as any) as any;
};

export const getInitialNotifications = (): AppNotification[] => {
  return loadFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
};

export const getInitialLogs = (): ActivityLog[] => {
  return loadFromStorage<ActivityLog[]>(STORAGE_KEYS.LOGS, [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      action: 'تهيئة وتحديث النظام والمفكرة الإدارية',
      entityType: 'profile',
      entityTitle: 'مدرسة المسيرة الخضراء الابتدائية'
    }
  ]);
};

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
    appVersion: '2.1.0',
    schemaVersion: 2,
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

export const validateBackupFile = (jsonString: string): ValidationResult => {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'الملف غير صالح أو لا يحتوي على بنية بيانات صحيحة.' };
    }

    // Require either schoolProfile or tasks/appointments/operations
    const hasCoreEntities = parsed.schoolProfile || Array.isArray(parsed.tasks) || Array.isArray(parsed.operations);
    if (!hasCoreEntities) {
      return { isValid: false, error: 'الملف لا ينتمي لمنظومة مفكرة الإدارة التربوية أو تنقصه الكيانات الأساسية.' };
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
  } catch (err) {
    return { isValid: false, error: 'تعذر فك تشفير الملف. تأكد من أنه ملف JSON سليم.' };
  }
};

export const restoreBackupData = (data: BackupDataStructure): void => {
  if (data.schoolProfile) saveToStorage(STORAGE_KEYS.PROFILE, data.schoolProfile);
  if (Array.isArray(data.tasks)) saveToStorage(STORAGE_KEYS.TASKS, data.tasks);
  if (Array.isArray(data.appointments)) saveToStorage(STORAGE_KEYS.APPOINTMENTS, data.appointments);
  if (Array.isArray(data.operations)) saveToStorage(STORAGE_KEYS.OPERATIONS, data.operations);
  if (Array.isArray(data.dailyNotes)) saveToStorage(STORAGE_KEYS.NOTES, data.dailyNotes);
  if (Array.isArray(data.meetings)) saveToStorage(STORAGE_KEYS.MEETINGS, data.meetings);
  if (Array.isArray(data.annualProgram)) saveToStorage(STORAGE_KEYS.ANNUAL_PROGRAM, data.annualProgram);
  if (Array.isArray(data.notifications)) saveToStorage(STORAGE_KEYS.NOTIFICATIONS, data.notifications);
  if (Array.isArray(data.activityLogs)) saveToStorage(STORAGE_KEYS.LOGS, data.activityLogs);
};

export const resetAllDataToDefault = (): void => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialSchoolProfile));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialTasks));
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(initialAppointments));
  localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(initialOperations));
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(initialDailyNotes));
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(initialMeetings));
  localStorage.setItem(STORAGE_KEYS.ANNUAL_PROGRAM, JSON.stringify(initialAnnualProgram));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
};

export { STORAGE_KEYS };
