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

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key} to localStorage:`, err);
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

export const exportAllDataAsJSON = (): string => {
  const data = {
    schoolProfile: loadFromStorage(STORAGE_KEYS.PROFILE, initialSchoolProfile),
    tasks: loadFromStorage(STORAGE_KEYS.TASKS, initialTasks),
    appointments: loadFromStorage(STORAGE_KEYS.APPOINTMENTS, initialAppointments),
    operations: loadFromStorage(STORAGE_KEYS.OPERATIONS, initialOperations),
    dailyNotes: loadFromStorage(STORAGE_KEYS.NOTES, initialDailyNotes),
    meetings: loadFromStorage(STORAGE_KEYS.MEETINGS, initialMeetings),
    annualProgram: loadFromStorage(STORAGE_KEYS.ANNUAL_PROGRAM, initialAnnualProgram),
    notifications: loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications),
    activityLogs: loadFromStorage(STORAGE_KEYS.LOGS, []),
    exportDate: new Date().toISOString(),
    appVersion: '2.0.0'
  };
  return JSON.stringify(data, null, 2);
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
