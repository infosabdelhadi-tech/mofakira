import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type {
  SchoolProfile,
  Task,
  Appointment,
  Operation,
  DailyNote,
  AppNotification,
  ActivityLog,
  TaskStatus
} from '../types';
import {
  getInitialProfile,
  getInitialTasks,
  getInitialAppointments,
  getInitialOperations,
  getInitialNotes,
  getInitialNotifications,
  getInitialLogs,
  saveToStorage,
  STORAGE_KEYS,
  resetAllDataToDefault
} from '../utils/storage';

export type ActiveTab = 'dashboard' | 'notebook' | 'tasks' | 'calendar' | 'operations' | 'reports' | 'notifications' | 'settings';

interface AppContextType {
  // Navigation & UI state
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;

  // School Profile
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (profile: SchoolProfile) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  carryOverTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;

  // Appointments
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; conflict?: Appointment };
  updateAppointment: (id: string, updates: Partial<Appointment>) => { success: boolean; conflict?: Appointment };
  deleteAppointment: (id: string) => void;
  toggleAppointmentCompleted: (id: string) => void;

  // Operations
  operations: Operation[];
  addOperation: (op: Omit<Operation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOperation: (id: string, updates: Partial<Operation>) => void;
  deleteOperation: (id: string) => void;
  updatePhaseStatus: (operationId: string, phaseId: string, status: 'مبرمجة' | 'قيد التنفيذ' | 'مكتملة' | 'متأخرة') => void;

  // Daily Notes
  dailyNotes: DailyNote[];
  addDailyNote: (note: Omit<DailyNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDailyNote: (id: string, updates: Partial<DailyNote>) => void;
  deleteDailyNote: (id: string) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  snoozeNotification: (id: string, minutes: number) => void;
  deleteNotification: (id: string) => void;

  // Logs
  activityLogs: ActivityLog[];
  logActivity: (action: string, entityType: ActivityLog['entityType'], entityTitle: string) => void;

  // Quick modals triggers
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;

  isAppointmentModalOpen: boolean;
  setIsAppointmentModalOpen: (open: boolean) => void;
  editingAppointment: Appointment | null;
  setEditingAppointment: (apt: Appointment | null) => void;

  isOperationModalOpen: boolean;
  setIsOperationModalOpen: (open: boolean) => void;
  editingOperation: Operation | null;
  setEditingOperation: (op: Operation | null) => void;

  // AI & Assistant generator
  generateAISuggestions: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) === 'dark';
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Entities state
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(getInitialProfile);
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [appointments, setAppointments] = useState<Appointment[]>(getInitialAppointments);
  const [operations, setOperations] = useState<Operation[]>(getInitialOperations);
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>(getInitialNotes);
  const [notifications, setNotifications] = useState<AppNotification[]>(getInitialNotifications);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(getInitialLogs);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);

  // Sync to local storage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PROFILE, schoolProfile);
  }, [schoolProfile]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
  }, [appointments]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.OPERATIONS, operations);
  }, [operations]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOTES, dailyNotes);
  }, [dailyNotes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.LOGS, activityLogs);
  }, [activityLogs]);

  // Dark mode effect on document body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const logActivity = (action: string, entityType: ActivityLog['entityType'], entityTitle: string) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      action,
      entityType,
      entityTitle
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const updateSchoolProfile = (profile: SchoolProfile) => {
    setSchoolProfile(profile);
    logActivity('تحديث بيانات المؤسسة', 'profile', profile.schoolName);
  };

  // Task methods
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: 'task-' + Date.now(),
      createdAt: now.split('T')[0],
      updatedAt: now
    };
    setTasks(prev => [newTask, ...prev]);
    logActivity('إضافة مهمة جديدة', 'task', newTask.title);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
        if (updates.status === 'مكتملة' && t.status !== 'مكتملة') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        return updated;
      }
      return t;
    }));
    logActivity('تعديل مهمة', 'task', updates.title || id);
  };

  const deleteTask = (id: string) => {
    const target = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (target) {
      logActivity('حذف مهمة', 'task', target.title);
    }
  };

  const duplicateTask = (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const now = new Date().toISOString();
    const duplicated: Task = {
      ...target,
      id: 'task-' + Date.now(),
      title: `${target.title} (نسخة)`,
      status: 'جديدة',
      completionPercentage: 0,
      createdAt: now.split('T')[0],
      updatedAt: now
    };
    setTasks(prev => [duplicated, ...prev]);
    logActivity('نسخ مهمة', 'task', duplicated.title);
  };

  const carryOverTask = (id: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          dueDate: tomorrowStr,
          carriedOverCount: (t.carriedOverCount || 0) + 1,
          status: 'قيد التنفيذ',
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
    logActivity('ترحيل مهمة للغد', 'task', id);
  };

  const setTaskStatus = (id: string, status: TaskStatus) => {
    updateTask(id, {
      status,
      completionPercentage: status === 'مكتملة' ? 100 : (status === 'قيد التنفيذ' ? 50 : 0)
    });
  };

  // Appointments
  const checkAppointmentConflict = (newApt: Partial<Appointment>, excludeId?: string): Appointment | undefined => {
    return appointments.find(a => {
      if (excludeId && a.id === excludeId) return false;
      if (a.date !== newApt.date) return false;
      // Overlap calculation: (StartA < EndB) and (EndA > StartB)
      const startA = a.startTime;
      const endA = a.endTime;
      const startB = newApt.startTime || '';
      const endB = newApt.endTime || '';
      return startA < endB && endA > startB;
    });
  };

  const addAppointment = (aptData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const conflict = checkAppointmentConflict(aptData);
    if (conflict) {
      return { success: false, conflict };
    }
    const now = new Date().toISOString();
    const newApt: Appointment = {
      ...aptData,
      id: 'apt-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setAppointments(prev => [newApt, ...prev]);
    logActivity('إضافة موعد جديد', 'appointment', newApt.title);
    return { success: true };
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    const conflict = checkAppointmentConflict(updates, id);
    if (conflict) {
      return { success: false, conflict };
    }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
    logActivity('تعديل موعد', 'appointment', updates.title || id);
    return { success: true };
  };

  const deleteAppointment = (id: string) => {
    const target = appointments.find(a => a.id === id);
    setAppointments(prev => prev.filter(a => a.id !== id));
    if (target) {
      logActivity('حذف موعد', 'appointment', target.title);
    }
  };

  const toggleAppointmentCompleted = (id: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        const next = !a.isCompleted;
        if (next) {
          confetti({ particleCount: 50, spread: 60 });
        }
        return { ...a, isCompleted: next, updatedAt: new Date().toISOString() };
      }
      return a;
    }));
  };

  // Operations
  const addOperation = (opData: Omit<Operation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newOp: Operation = {
      ...opData,
      id: 'op-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setOperations(prev => [newOp, ...prev]);
    logActivity('برمجة عملية جديدة', 'operation', newOp.title);
  };

  const updateOperation = (id: string, updates: Partial<Operation>) => {
    setOperations(prev => prev.map(op => {
      if (op.id === id) {
        return { ...op, ...updates, updatedAt: new Date().toISOString() };
      }
      return op;
    }));
    logActivity('تعديل عملية', 'operation', updates.title || id);
  };

  const deleteOperation = (id: string) => {
    const target = operations.find(o => o.id === id);
    setOperations(prev => prev.filter(o => o.id !== id));
    if (target) {
      logActivity('حذف عملية', 'operation', target.title);
    }
  };

  const updatePhaseStatus = (
    operationId: string,
    phaseId: string,
    status: 'مبرمجة' | 'قيد التنفيذ' | 'مكتملة' | 'متأخرة'
  ) => {
    setOperations(prev => prev.map(op => {
      if (op.id === operationId) {
        const updatedPhases = op.phases.map(p => {
          if (p.id === phaseId) {
            return {
              ...p,
              status,
              completedDate: status === 'مكتملة' ? new Date().toISOString().split('T')[0] : undefined
            };
          }
          return p;
        });

        // Calculate progress percentage
        const completedCount = updatedPhases.filter(p => p.status === 'مكتملة').length;
        const progress = Math.round((completedCount / (updatedPhases.length || 1)) * 100);
        const opStatus = progress === 100 ? 'مكتملة' : (progress > 0 ? 'قيد التنفيذ' : 'مبرمجة');

        if (progress === 100) {
          confetti({ particleCount: 100, spread: 80 });
        }

        return {
          ...op,
          phases: updatedPhases,
          progress,
          status: opStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return op;
    }));
  };

  // Daily Notes
  const addDailyNote = (noteData: Omit<DailyNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: DailyNote = {
      ...noteData,
      id: 'note-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setDailyNotes(prev => [newNote, ...prev]);
    logActivity('تسجيل ملاحظة يومية', 'note', newNote.title);
  };

  const updateDailyNote = (id: string, updates: Partial<DailyNote>) => {
    setDailyNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
    logActivity('تعديل ملاحظة يومية', 'note', updates.title || id);
  };

  const deleteDailyNote = (id: string) => {
    const target = dailyNotes.find(n => n.id === id);
    setDailyNotes(prev => prev.filter(n => n.id !== id));
    if (target) {
      logActivity('حذف ملاحظة', 'note', target.title);
    }
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const snoozeNotification = (id: string, minutes: number) => {
    const snoozed = new Date();
    snoozed.setMinutes(snoozed.getMinutes() + minutes);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, snoozedUntil: snoozed.toISOString(), read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // AI-powered Suggestions & Weekly Planner Heuristic
  const generateAISuggestions = () => {
    const sampleAISuggestions: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: 'تتبع جاهزية ملفات التربية الدامجة للتلاميذ في وضعية إعاقة',
        description: 'إعداد الملفات الفردية وربط الاتصال مع الجمعيات الشريكة والمشرفين التربويين.',
        category: 'الشؤون التربوية',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
        dueTime: '11:00',
        priority: 'مهمة',
        status: 'جديدة',
        assignedTo: 'السيد المدير + منسقة التربية الدامجة',
        notes: 'اقتراح ذكي بالاعتماد على التوجيهات الوزارية الحديثة لخارطة الطريق.',
        completionPercentage: 0,
        checklist: [
          { id: 'ai-c1', text: 'حصر التلاميذ في وضعية إعاقة المعنيين', completed: false },
          { id: 'ai-c2', text: 'تجهيز قاعة الموارد للتأهيل والدعم', completed: false }
        ],
        attachments: []
      },
      {
        title: 'فحص دوري لدفاتر النصوص وسجلات الحضور والغياب',
        description: 'الاطلاع على وثائق الأساتذة ومدى مطابقتها للتوزيع الزمني للدروس والمقررات الوزارية.',
        category: 'الإدارة والتدبير',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        dueTime: '14:00',
        priority: 'متوسطة',
        status: 'جديدة',
        assignedTo: 'السيد المدير',
        notes: 'مراقبة أسبوعية موصى بها من طرف المساعد التربوي الذكي.',
        completionPercentage: 0,
        checklist: [
          { id: 'ai-c3', text: 'جمع دفاتر النصوص', completed: false },
          { id: 'ai-c4', text: 'التأشير الإداري وتسجيل الملاحظات', completed: false }
        ],
        attachments: []
      }
    ];

    sampleAISuggestions.forEach(task => addTask(task));
    confetti({ particleCount: 70, spread: 60 });
  };

  const resetAllData = () => {
    resetAllDataToDefault();
    setSchoolProfile(getInitialProfile());
    setTasks(getInitialTasks());
    setAppointments(getInitialAppointments());
    setOperations(getInitialOperations());
    setDailyNotes(getInitialNotes());
    setNotifications(getInitialNotifications());
    setActivityLogs([]);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isDarkMode,
        toggleDarkMode,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        schoolProfile,
        updateSchoolProfile,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        duplicateTask,
        carryOverTask,
        setTaskStatus,
        appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        toggleAppointmentCompleted,
        operations,
        addOperation,
        updateOperation,
        deleteOperation,
        updatePhaseStatus,
        dailyNotes,
        addDailyNote,
        updateDailyNote,
        deleteDailyNote,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        snoozeNotification,
        deleteNotification,
        activityLogs,
        logActivity,
        isTaskModalOpen,
        setIsTaskModalOpen,
        editingTask,
        setEditingTask,
        isAppointmentModalOpen,
        setIsAppointmentModalOpen,
        editingAppointment,
        setEditingAppointment,
        isOperationModalOpen,
        setIsOperationModalOpen,
        editingOperation,
        setEditingOperation,
        generateAISuggestions,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
