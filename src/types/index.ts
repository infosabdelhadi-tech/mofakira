// School Profile Settings
export interface SchoolProfile {
  schoolName: string;            // اسم المؤسسة
  directorate: string;           // المديرية الإقليمية
  academy: string;               // الأكاديمية الجهوية
  academicYear: string;          // الموسم الدراسي (e.g. 2024-2025)
  principalName: string;         // اسم المدير
  phone: string;                 // الهاتف
  email: string;                 // البريد الإلكتروني
  address: string;               // العنوان
  logoUrl?: string;              // شعار المؤسسة
  motto?: string;                // شعار تربوي
}

// Task Categories
export type TaskCategory =
  | 'الإدارة والتدبير'
  | 'الشؤون التربوية'
  | 'الحياة المدرسية'
  | 'الموارد البشرية'
  | 'الشؤون المالية والمادية'
  | 'التواصل والشراكات'
  | 'الاجتماعات والمجالس'
  | 'البنية التحتية والصيانة'
  | 'الأنشطة والمناسبات'
  | 'المهام الشخصية';

export const TASK_CATEGORIES: TaskCategory[] = [
  'الإدارة والتدبير',
  'الشؤون التربوية',
  'الحياة المدرسية',
  'الموارد البشرية',
  'الشؤون المالية والمادية',
  'التواصل والشراكات',
  'الاجتماعات والمجالس',
  'البنية التحتية والصيانة',
  'الأنشطة والمناسبات',
  'المهام الشخصية'
];

// Task Priorities
export type TaskPriority = 'عاجلة جداً' | 'مهمة' | 'متوسطة' | 'منخفضة';

export const TASK_PRIORITIES: TaskPriority[] = [
  'عاجلة جداً',
  'مهمة',
  'متوسطة',
  'منخفضة'
];

// Task Statuses
export type TaskStatus = 'جديدة' | 'مبرمجة' | 'قيد التنفيذ' | 'متوقفة' | 'مكتملة' | 'ملغاة';

export const TASK_STATUSES: TaskStatus[] = [
  'جديدة',
  'مبرمجة',
  'قيد التنفيذ',
  'متوقفة',
  'مكتملة',
  'ملغاة'
];

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface Task {
  id: string;
  title: string;                 // عنوان المهمة
  description: string;           // وصف المهمة
  category: TaskCategory;        // المجال أو التصنيف
  createdAt: string;             // تاريخ الإنشاء
  startDate: string;             // تاريخ بداية التنفيذ
  dueDate: string;               // الموعد النهائي
  dueTime?: string;              // وقت الإنجاز
  priority: TaskPriority;        // مستوى الأولوية
  status: TaskStatus;            // حالة التنفيذ
  assignedTo: string;            // الشخص المسؤول
  notes?: string;                // الملاحظات
  completionPercentage: number;  // نسبة الإنجاز 0 - 100
  checklist: ChecklistItem[];    // عناصر المتابعة
  attachments: TaskAttachment[]; // المرفقات
  isPinned?: boolean;            // مهمة مثبتة
  isFavorite?: boolean;          // المفضلة
  operationId?: string;          // مرتبطة بعملية معينة
  carriedOverCount?: number;     // عدد مرات الترحيل
  updatedAt: string;             // تاريخ التعديل
}

// Appointment Types
export type AppointmentType =
  | 'اجتماع'
  | 'زيارة تربوية'
  | 'لقاء إداري'
  | 'اجتماع مجلس'
  | 'لقاء مع أولياء الأمور'
  | 'نشاط مدرسي'
  | 'موعد شخصي'
  | 'موعد رسمي';

export const APPOINTMENT_TYPES: AppointmentType[] = [
  'اجتماع',
  'زيارة تربوية',
  'لقاء إداري',
  'اجتماع مجلس',
  'لقاء مع أولياء الأمور',
  'نشاط مدرسي',
  'موعد شخصي',
  'موعد رسمي'
];

export interface Appointment {
  id: string;
  title: string;                 // عنوان الموعد
  type: AppointmentType;         // نوع الموعد
  date: string;                  // التاريخ YYYY-MM-DD
  startTime: string;             // وقت البداية HH:mm
  endTime: string;               // وقت النهاية HH:mm
  location: string;              // المكان
  attendees: string;             // الأشخاص المعنيون
  description: string;           // وصف الموعد
  notes?: string;                // الملاحظات
  reminder: 'none' | 'exact' | '15m' | '30m' | '1h' | '1d'; // التذكير
  isCompleted?: boolean;         // تم إنجازه
  createdAt: string;
  updatedAt: string;
}

// Operations & Phases
export type OperationPhaseStatus = 'مبرمجة' | 'قيد التنفيذ' | 'مكتملة' | 'متأخرة';

export interface OperationPhase {
  id: string;
  order: number;
  title: string;                 // عنوان المرحلة
  description?: string;          // تفاصيل المرحلة
  startDate: string;             // تاريخ البداية
  dueDate: string;               // تاريخ الانتهاء
  status: OperationPhaseStatus;  // الحالة
  responsible: string;           // المسؤول عن المرحلة
  completedDate?: string;        // تاريخ الإنجاز
}

export interface Operation {
  id: string;
  title: string;                 // اسم العملية
  objective: string;             // الهدف من العملية
  category: TaskCategory;        // المجال
  reference: string;             // المرجعية أو السياق (مذكرة وزارية، مقرر وزاري...)
  startDate: string;             // تاريخ الانطلاق
  dueDate: string;               // تاريخ الانتهاء المتوقع
  responsible: string;           // المسؤول عن التنفيذ
  participants: string;          // المشاركون
  resources: string;             // الموارد المطلوبة
  indicators: string;            // مؤشرات الإنجاز
  notes?: string;                // الملاحظات
  phases: OperationPhase[];      // مراحل التنفيذ
  progress: number;              // نسبة الإنجاز الكلية (محسوبة أو يدوية)
  status: 'مبرمجة' | 'قيد التنفيذ' | 'مكتملة' | 'متأخرة';
  createdAt: string;
  updatedAt: string;
}

// Daily Notebook
export type NoteType =
  | 'أعمال منجزة'
  | 'أحداث مهمة'
  | 'ملاحظات إدارية'
  | 'ملاحظات تربوية'
  | 'مشاكل وقرارات'
  | 'مهام مرحلة';

export interface DailyNote {
  id: string;
  date: string;                  // YYYY-MM-DD
  timestamp: string;             // HH:mm
  type: NoteType;                // نوع التدوينة
  title: string;                 // عنوان الملاحظة
  content: string;               // المحتوى
  tags?: string[];               // وسوم
  createdAt: string;
  updatedAt: string;
}

// Notifications
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'task' | 'operation' | 'system' | 'reminder';
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  relatedId?: string;
  snoozedUntil?: string;
}

// Activity Log
export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  entityType: 'task' | 'appointment' | 'operation' | 'note' | 'profile';
  entityTitle: string;
}

// Report Filters
export interface ReportFilter {
  period: 'today' | 'week' | 'month' | 'term' | 'custom';
  startDate?: string;
  endDate?: string;
  category?: string;
  reportType: 'comprehensive' | 'tasks' | 'operations' | 'appointments' | 'notes';
}
