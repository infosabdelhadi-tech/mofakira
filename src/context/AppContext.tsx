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
  TaskStatus,
  Meeting,
  MeetingDecision,
  AnnualProgramItem
} from '../types';
import {
  getInitialProfile,
  getInitialTasks,
  getInitialAppointments,
  getInitialOperations,
  getInitialNotes,
  getInitialMeetings,
  getInitialAnnualProgram,
  getInitialNotifications,
  getInitialLogs,
  saveToStorage,
  STORAGE_KEYS,
  resetAllDataToDefault
} from '../utils/storage';

export type ActiveTab =
  | 'dashboard'
  | 'notebook'
  | 'tasks'
  | 'calendar'
  | 'operations'
  | 'annual'
  | 'meetings'
  | 'reports'
  | 'notifications'
  | 'settings';

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
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  carryOverTask: (id: string) => void;
  archiveTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;

  // Appointments
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; conflict?: Appointment };
  updateAppointment: (id: string, updates: Partial<Appointment>) => { success: boolean; conflict?: Appointment };
  deleteAppointment: (id: string) => void;
  toggleAppointmentCompleted: (id: string) => void;

  // Operations
  operations: Operation[];
  addOperation: (op: Omit<Operation, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateOperation: (id: string, updates: Partial<Operation>) => void;
  deleteOperation: (id: string) => void;
  updatePhaseStatus: (operationId: string, phaseId: string, status: 'مبرمجة' | 'قيد التنفيذ' | 'مكتملة' | 'متأخرة') => void;

  // Meetings & Decision Tracking
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  convertDecisionToTask: (meetingId: string, decision: MeetingDecision) => void;
  updateDecisionStatus: (meetingId: string, decisionId: string, status: MeetingDecision['status']) => void;

  // Annual Work Program
  annualProgram: AnnualProgramItem[];
  addAnnualItem: (item: Omit<AnnualProgramItem, 'id'>) => void;
  updateAnnualItem: (id: string, updates: Partial<AnnualProgramItem>) => void;
  deleteAnnualItem: (id: string) => void;
  cloneAnnualPlanToNewYear: (sourceYear: string, targetYear: string) => void;

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

  isMeetingModalOpen: boolean;
  setIsMeetingModalOpen: (open: boolean) => void;
  editingMeeting: Meeting | null;
  setEditingMeeting: (meeting: Meeting | null) => void;

  // Onboarding & Demo management
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  loadDemoData: () => void;

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
  const [meetings, setMeetings] = useState<Meeting[]>(getInitialMeetings);
  const [annualProgram, setAnnualProgram] = useState<AnnualProgramItem[]>(getInitialAnnualProgram);
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

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // Check if first-time user (Onboarding)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('mofakkira_onboarding_completed') && !localStorage.getItem(STORAGE_KEYS.PROFILE);
  });

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
    saveToStorage(STORAGE_KEYS.MEETINGS, meetings);
  }, [meetings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ANNUAL_PROGRAM, annualProgram);
  }, [annualProgram]);

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

  // Bidirectional link: check if updating a task should update operation progress
  const recalculateOperationProgress = (opId: string, currentTasks: Task[]) => {
    const linkedTasks = currentTasks.filter(t => t.operationId === opId);
    if (linkedTasks.length === 0) return;
    const completedTasks = linkedTasks.filter(t => t.status === 'مكتملة').length;
    const taskProgress = Math.round((completedTasks / linkedTasks.length) * 100);

    setOperations(prevOps => prevOps.map(op => {
      if (op.id === opId) {
        const combinedProgress = Math.max(op.progress, taskProgress);
        return {
          ...op,
          progress: combinedProgress,
          status: combinedProgress === 100 ? 'مكتملة' : (combinedProgress > 0 ? 'قيد التنفيذ' : op.status),
          updatedAt: new Date().toISOString()
        };
      }
      return op;
    }));
  };

  // Task methods
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const now = new Date().toISOString();
    const id = 'task-' + Date.now();
    const newTask: Task = {
      ...taskData,
      id,
      createdAt: now.split('T')[0],
      updatedAt: now,
      history: [
        { id: 'h-' + Date.now(), timestamp: now, action: 'إنشاء المهمة', user: schoolProfile.principalName }
      ]
    };
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    logActivity('إضافة مهمة جديدة', 'task', newTask.title);

    if (newTask.operationId) {
      recalculateOperationProgress(newTask.operationId, updatedTasks);
    }
    return id;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();
    let updatedTarget: Task | undefined;

    const nextTasks = tasks.map(t => {
      if (t.id === id) {
        const historyUpdate = [
          ...(t.history || []),
          { id: 'h-' + Date.now(), timestamp: now, action: updates.status ? `تغيير الحالة إلى ${updates.status}` : 'تعديل تفاصيل المهمة', user: schoolProfile.principalName }
        ];

        const updated = {
          ...t,
          ...updates,
          history: historyUpdate,
          updatedAt: now
        };
        updatedTarget = updated;

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
    });

    setTasks(nextTasks);
    logActivity('تعديل مهمة', 'task', updates.title || id);

    if (updatedTarget?.operationId) {
      recalculateOperationProgress(updatedTarget.operationId, nextTasks);
    }
  };

  const deleteTask = (id: string) => {
    const target = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (target) {
      logActivity('حذف مهمة', 'task', target.title);
      if (target.operationId) {
        recalculateOperationProgress(target.operationId, tasks.filter(t => t.id !== id));
      }
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
      updatedAt: now,
      history: [
        { id: 'h-' + Date.now(), timestamp: now, action: 'نسخ المهمة', user: schoolProfile.principalName }
      ]
    };
    setTasks(prev => [duplicated, ...prev]);
    logActivity('نسخ مهمة', 'task', duplicated.title);
  };

  const archiveTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: !t.isArchived, updatedAt: new Date().toISOString() } : t));
    logActivity('أرشفة / استعادة مهمة', 'task', id);
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
  const addOperation = (opData: Omit<Operation, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const now = new Date().toISOString();
    const id = 'op-' + Date.now();
    const newOp: Operation = {
      ...opData,
      id,
      createdAt: now,
      updatedAt: now
    };
    setOperations(prev => [newOp, ...prev]);
    logActivity('برمجة عملية جديدة', 'operation', newOp.title);
    return id;
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

  // Meetings & Decision Tracking
  const addMeeting = (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newMeeting: Meeting = {
      ...meetingData,
      id: 'meet-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setMeetings(prev => [newMeeting, ...prev]);
    logActivity('توثيق اجتماع أو مجلس جديد', 'meeting', newMeeting.title);
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m));
    logActivity('تعديل محضر اجتماع', 'meeting', updates.title || id);
  };

  const deleteMeeting = (id: string) => {
    const target = meetings.find(m => m.id === id);
    setMeetings(prev => prev.filter(m => m.id !== id));
    if (target) {
      logActivity('حذف اجتماع', 'meeting', target.title);
    }
  };

  const convertDecisionToTask = (meetingId: string, decision: MeetingDecision) => {
    // 1. Guard against accidental duplicate conversion
    if (decision.convertedTaskId) {
      alert('تم تحويل هذا القرار مسبقاً إلى مهمة عمل في جدول المهام.');
      return;
    }

    const meeting = meetings.find(m => m.id === meetingId);

    // 2. Derive appropriate priority instead of hardcoding 'عاجلة جداً'
    const today = new Date().toISOString().split('T')[0];
    let calculatedPriority: 'عاجلة جداً' | 'مهمة' | 'متوسطة' = 'مهمة';
    if (decision.deadline) {
      const daysDiff = Math.ceil((new Date(decision.deadline).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24));
      if (daysDiff <= 3) {
        calculatedPriority = 'عاجلة جداً';
      } else if (daysDiff <= 10) {
        calculatedPriority = 'مهمة';
      } else {
        calculatedPriority = 'متوسطة';
      }
    }

    // 3. Create the linked task with meeting and decision IDs
    const taskId = addTask({
      title: decision.decisionText,
      description: `مهمة تنفيذية منبثقة عن اجتماع: "${meeting?.title || 'اجتماع مجلس'}" المنعقد بتاريخ ${meeting?.date || today}.`,
      category: 'الاجتماعات والمجالس',
      startDate: today,
      dueDate: decision.deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      dueTime: '12:00',
      priority: calculatedPriority,
      status: 'قيد التنفيذ',
      assignedTo: decision.responsible || schoolProfile.principalName,
      completionPercentage: 0,
      meetingId,
      decisionId: decision.id,
      checklist: [
        { id: 'c-dec-1', text: 'مباشرة إجراءات تنفيذ القرار', completed: false },
        { id: 'c-dec-2', text: 'إعداد تقرير الإنجاز وموافاة رئيس المؤسسة', completed: false }
      ],
      attachments: []
    });

    // 4. Update the decision with the taskId and sync status
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          decisions: m.decisions.map(d => d.id === decision.id ? { ...d, convertedTaskId: taskId, status: 'قيد التنفيذ' } : d)
        };
      }
      return m;
    }));

    logActivity('تحويل قرار اجتماع إلى مهمة تنفيذية', 'meeting', decision.decisionText);
    confetti({ particleCount: 60, spread: 50 });
  };

  const updateDecisionStatus = (meetingId: string, decisionId: string, status: MeetingDecision['status']) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          decisions: m.decisions.map(d => d.id === decisionId ? { ...d, status } : d)
        };
      }
      return m;
    }));
  };

  // Annual Work Program
  const addAnnualItem = (itemData: Omit<AnnualProgramItem, 'id'>) => {
    const newItem: AnnualProgramItem = {
      ...itemData,
      id: 'an-' + Date.now()
    };
    setAnnualProgram(prev => [...prev, newItem]);
    logActivity('إضافة نشاط لبرنامج العمل السنوي', 'annual', newItem.title);
  };

  const updateAnnualItem = (id: string, updates: Partial<AnnualProgramItem>) => {
    setAnnualProgram(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    logActivity('تعديل نشاط بالبرنامج السنوي', 'annual', updates.title || id);
  };

  const deleteAnnualItem = (id: string) => {
    const target = annualProgram.find(i => i.id === id);
    setAnnualProgram(prev => prev.filter(i => i.id !== id));
    if (target) {
      logActivity('حذف نشاط من البرنامج السنوي', 'annual', target.title);
    }
  };

  const cloneAnnualPlanToNewYear = (sourceYear: string, targetYear: string) => {
    const sourceItems = annualProgram.filter(i => i.academicYear === sourceYear);
    if (sourceItems.length === 0) return;

    const clonedItems: AnnualProgramItem[] = sourceItems.map(item => ({
      ...item,
      id: 'an-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      academicYear: targetYear,
      status: 'مبرمجة',
      completionPercentage: 0
    }));

    setAnnualProgram(prev => [...prev, ...clonedItems]);
    logActivity(`استنساخ برنامج العمل السنوي من ${sourceYear} إلى ${targetYear}`, 'annual', targetYear);
    confetti({ particleCount: 70, spread: 60 });
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

  // Notification dispatch helper with anti-duplication
  const addNotificationIfUnique = (notifData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => {
      // Prevent duplicates: same title/message or same relatedId within recent records
      const isDuplicate = prev.some(n =>
        (n.relatedId && notifData.relatedId && n.relatedId === notifData.relatedId && n.type === notifData.type) ||
        (n.title === notifData.title && n.message === notifData.message)
      );
      if (isDuplicate) return prev;

      const newNotif: AppNotification = {
        ...notifData,
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        read: false
      };
      return [newNotif, ...prev];
    });
  };

  // Dynamic check for approaching deadlines & today's appointments
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Check overdue tasks
    tasks.forEach(t => {
      if (t.status !== 'مكتملة' && t.status !== 'ملغاة' && !t.isArchived && t.dueDate < todayStr) {
        addNotificationIfUnique({
          title: `مهمة متأخرة: ${t.title}`,
          message: `المهمة كان أجلها في ${t.dueDate} ومسندة إلى ${t.assignedTo}.`,
          type: 'task',
          priority: 'high',
          relatedId: t.id
        });
      }
    });

    // Check today's appointments
    appointments.forEach(a => {
      if (a.date === todayStr && !a.isCompleted) {
        addNotificationIfUnique({
          title: `موعد مبرمج اليوم: ${a.title}`,
          message: `التوقيت: ${a.startTime} - المكان: ${a.location}`,
          type: 'appointment',
          priority: 'high',
          relatedId: a.id
        });
      }
    });
  }, [tasks, appointments]);

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

  // AI-powered Suggestions
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
    setTasks([]);
    setAppointments([]);
    setOperations([]);
    setMeetings([]);
    setAnnualProgram([]);
    setDailyNotes([]);
    setNotifications([]);
    setActivityLogs([]);
    logActivity('إعادة تهيئة المفكرة ومسح السجلات', 'profile', 'بيئة جديدة');
  };

  const loadDemoData = () => {
    resetAllDataToDefault();
    // Load fresh demo seeds
    setSchoolProfile(getInitialProfile());
    setTasks(getInitialTasks());
    setAppointments(getInitialAppointments());
    setOperations(getInitialOperations());
    setMeetings(getInitialMeetings());
    setAnnualProgram(getInitialAnnualProgram());
    setDailyNotes(getInitialNotes());
    setNotifications(getInitialNotifications());
    logActivity('تحميل البيانات التجريبية الاستكشافية', 'profile', 'مدرسة نموذجية');
    confetti({ particleCount: 70, spread: 60 });
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
        archiveTask,
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
        meetings,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        convertDecisionToTask,
        updateDecisionStatus,
        annualProgram,
        addAnnualItem,
        updateAnnualItem,
        deleteAnnualItem,
        cloneAnnualPlanToNewYear,
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
        isMeetingModalOpen,
        setIsMeetingModalOpen,
        editingMeeting,
        setEditingMeeting,
        isOnboardingOpen,
        setIsOnboardingOpen,
        loadDemoData,
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
