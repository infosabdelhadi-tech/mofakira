import type {
  SchoolProfile,
  Task,
  Appointment,
  Operation,
  DailyNote,
  AppNotification,
  Meeting,
  AnnualProgramItem
} from '../types';

import { getCurrentAcademicYear } from './academicYear';

// Blank initial profile for real school administrators before onboarding
export const emptySchoolProfile: SchoolProfile = {
  schoolName: '',
  directorate: '',
  academy: '',
  academicYear: getCurrentAcademicYear(),
  principalName: '',
  phone: '',
  email: '',
  address: '',
  motto: ''
};

// Exploratory demo profile used only when the user explicitly requests demo data
export const demoSchoolProfile: SchoolProfile = {
  schoolName: 'مدرسة المسيرة الخضراء الابتدائية النموذجية',
  directorate: 'المديرية الإقليمية لوزارة التربية الوطنية والتعليم الأولي والرياضة - الرباط',
  academy: 'الأكاديمية الجهوية للتربية والتكوين لجهة الرباط سلا القنيطرة',
  academicYear: getCurrentAcademicYear(),
  principalName: 'ذ. عبد الرحيم المنصوري',
  phone: '0537000000',
  email: 'direction.almassira@men.gov.ma',
  address: 'حي النهضة، شارع محمد السادس، الرباط',
  motto: 'من أجل مدرسة عمومية ذات جودة للجميع'
};

export const initialSchoolProfile: SchoolProfile = emptySchoolProfile;

const getTodayString = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'إعداد ومراجعة جداول حصص الأساتذة',
    description: 'توزيع جداول الحصص الأسبوعية لأطر التدريس مع مراعاة التخصصات وتفادي الساعات الفارغة قدر الإمكان.',
    category: 'الشؤون التربوية',
    createdAt: getTodayString(-3),
    startDate: getTodayString(-2),
    dueDate: getTodayString(0),
    dueTime: '12:00',
    priority: 'عاجلة جداً',
    status: 'قيد التنفيذ',
    assignedTo: 'السيد المدير + الفريق التربوي',
    notes: 'تم استلام الرغبات ويجري التنسيق مع السادة المفتشين التربويين.',
    completionPercentage: 75,
    isPinned: true,
    operationId: 'op-1',
    history: [
      { id: 'h1', timestamp: getTodayString(-3) + 'T09:00:00Z', action: 'إنشاء المهمة', user: 'السيد المدير' },
      { id: 'h2', timestamp: getTodayString(-1) + 'T14:30:00Z', action: 'تحديث نسبة الإنجاز إلى 75%', user: 'السيد المدير' }
    ],
    checklist: [
      { id: 'c1', text: 'حصر أعداد التلاميذ والأفواج المسجلة', completed: true },
      { id: 'c2', text: 'توزيع القاعات والتوقيت', completed: true },
      { id: 'c3', text: 'طباعة وتوقيع جداول الحصص', completed: false }
    ],
    attachments: [
      { id: 'a1', name: 'نموذج_جدول_الحصص_المعدل.pdf', size: '240 KB', type: 'application/pdf' }
    ],
    updatedAt: getTodayString()
  },
  {
    id: 'task-2',
    title: 'مراقبة وتأهيل وسائل السلامة والوقاية بالمؤسسة',
    description: 'فحص مطافئ الحريق، صيدلية الإسعافات الأولية، ومخارج الطوارئ بالمؤسسة.',
    category: 'البنية التحتية والصيانة',
    createdAt: getTodayString(-5),
    startDate: getTodayString(-4),
    dueDate: getTodayString(1),
    dueTime: '10:00',
    priority: 'مهمة',
    status: 'مبرمجة',
    assignedTo: 'الحارس العام / المساعد التقني',
    notes: 'إعداد تقرير مفصل ورفعه للمديرية الإقليمية.',
    completionPercentage: 30,
    checklist: [
      { id: 'c4', text: 'فحص تاريخ صلاحية مطافئ الحريق', completed: true },
      { id: 'c5', text: 'تجديد مستلزمات صيدلية الإسعافات', completed: false },
      { id: 'c6', text: 'معاينة صنابير المياه والإنارة', completed: false }
    ],
    attachments: [],
    updatedAt: getTodayString()
  },
  {
    id: 'task-3',
    title: 'إرسال الإحصاء السنوي لبرنامج تيسير',
    description: 'تحديث لوائح التلاميذ المستفيدين من الدعم المالي والاجتماعي تيسير عبر المنظومة المعلوماتية مسار.',
    category: 'الإدارة والتدبير',
    createdAt: getTodayString(-2),
    startDate: getTodayString(-1),
    dueDate: getTodayString(3),
    dueTime: '16:00',
    priority: 'عاجلة جداً',
    status: 'جديدة',
    assignedTo: 'السيد المدير',
    notes: 'التأكد من أرقام بطاقات التعريف الوطنية لأولياء الأمور.',
    completionPercentage: 10,
    isFavorite: true,
    checklist: [
      { id: 'c7', text: 'تصدير لائحة المسجلين الجدد', completed: true },
      { id: 'c8', text: 'التحقق من البيانات عبر منظومة مسار', completed: false }
    ],
    attachments: [],
    updatedAt: getTodayString()
  },
  {
    id: 'task-4',
    title: 'عقد الاجتماع التأسيسي لمجلس التدبير',
    description: 'دعوة ممثلي الأساتذة والأطر الإدارية وجمعية أمهات وآباء وأولياء التلاميذ ومجلس الجماعة.',
    category: 'الاجتماعات والمجالس',
    createdAt: getTodayString(-6),
    startDate: getTodayString(-5),
    dueDate: getTodayString(-1),
    dueTime: '15:30',
    priority: 'مهمة',
    status: 'مكتملة',
    assignedTo: 'رئيس المؤسسة',
    notes: 'تمت المصادقة على النظام الداخلي للمؤسسة وبرنامج العمل السنوي.',
    completionPercentage: 100,
    operationId: 'op-2',
    checklist: [
      { id: 'c9', text: 'توجيه الاستدعاءات كتابياً', completed: true },
      { id: 'c10', text: 'توفير محضر الاجتماع وسجل التوقيعات', completed: true },
      { id: 'c11', text: 'صياغة التقرير النهائي وإرسال نسخة للمديرية', completed: true }
    ],
    attachments: [
      { id: 'a2', name: 'محضر_مجلس_التدبير_المصادق.pdf', size: '1.2 MB', type: 'application/pdf' }
    ],
    updatedAt: getTodayString(-1)
  },
  {
    id: 'task-5',
    title: 'تتبع نتائج روائز التقويم التشخيصي والدعم الاستدراكي',
    description: 'استثمار نتائج روائز تقويم المستلزمات لمستويات التعليم الابتدائي وبرمجة حصص الدعم التربوي المركز.',
    category: 'الشؤون التربوية',
    createdAt: getTodayString(-10),
    startDate: getTodayString(-8),
    dueDate: getTodayString(5),
    dueTime: '11:00',
    priority: 'مهمة',
    status: 'قيد التنفيذ',
    assignedTo: 'المنسق التربوي + أطر التدريس',
    notes: 'إعداد مصفوفة التعثرات وفق مقاربة التدريس وفق المستوى المناسب (TaRL).',
    completionPercentage: 60,
    operationId: 'op-1',
    checklist: [
      { id: 'c12', text: 'تمرير الروائز التشخيصية في القراءة والرياضيات', completed: true },
      { id: 'c13', text: 'مسك النقاط عبر منظومة مسار', completed: true },
      { id: 'c14', text: 'تفييء المتعلمين وبرمجة خطة الدعم', completed: false }
    ],
    attachments: [],
    updatedAt: getTodayString()
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: 'apt-1',
    title: 'لقاء تنسيقي مع السيد المفتش التربوي للمقاطعة',
    type: 'زيارة تربوية',
    date: getTodayString(0),
    startTime: '10:00',
    endTime: '11:30',
    location: 'مكتب الإدارة التربوية',
    attendees: 'السيد المدير، المفتش التربوي ذ. بنسالم',
    description: 'مناقشة خطة تفعيل مشروع المؤسسة المندمج وأجرأة مقاربات تدريس المستوى المناسب.',
    notes: 'إعداد ملف إحصائيات الدخول المدرسي ونتائج التقويم التشخيصي.',
    reminder: '30m',
    isCompleted: false,
    createdAt: getTodayString(-2),
    updatedAt: getTodayString(-2)
  },
  {
    id: 'apt-2',
    title: 'اجتماع مكتب جمعية أمهات وآباء وأولياء التلاميذ',
    type: 'لقاء مع أولياء الأمور',
    date: getTodayString(0),
    startTime: '15:00',
    endTime: '16:30',
    location: 'قاعة الأنشطة والاجتماعات',
    attendees: 'أعضاء مكتب الجمعية، السيد المدير',
    description: 'مناقشة سبل التعاون لدعم الأنشطة الموازية وبرنامج النقل المدرسي والمطعم.',
    notes: 'تجهيز مسودة اتفاقية الشراكة السنوية.',
    reminder: '1h',
    isCompleted: false,
    createdAt: getTodayString(-3),
    updatedAt: getTodayString(-3)
  },
  {
    id: 'apt-3',
    title: 'جلسة استماع وتوجيه لولي أمر تلميذ',
    type: 'لقاء إداري',
    date: getTodayString(1),
    startTime: '09:30',
    endTime: '10:15',
    location: 'مكتب الإدارة',
    attendees: 'ولي أمر التلميذ (أمين . ك)، أستاذ القسم، السيد المدير',
    description: 'متابعة وضعية تلميذ يعاني من صعوبات تعلمية ومشاكل انتباه.',
    notes: 'التنسيق مع المرشد النفسي ومسؤولة التربية الدامجة.',
    reminder: '15m',
    isCompleted: false,
    createdAt: getTodayString(-1),
    updatedAt: getTodayString(-1)
  },
  {
    id: 'apt-4',
    title: 'المشاركة في اللقاء الإقليمي لرؤساء المؤسسات التعليمية',
    type: 'موعد رسمي',
    date: getTodayString(3),
    startTime: '09:00',
    endTime: '13:00',
    location: 'مقر المديرية الإقليمية للتعليم',
    attendees: 'السيد المدير الإقليمي، رؤساء المؤسسات الابتدائية',
    description: 'عرض مستجدات خارطة الطريق 2022-2026 ومدارس الريادة.',
    reminder: '1d',
    isCompleted: false,
    createdAt: getTodayString(-4),
    updatedAt: getTodayString(-4)
  }
];

export const initialOperations: Operation[] = [
  {
    id: 'op-1',
    title: 'أجرأة وتنزيل مشروع المؤسسة المندمج (PEI)',
    objective: 'الارتقاء بجودة التعلمات ودعم التفتح والأنشطة الموازية ومحاربة الهدر المدرسي.',
    category: 'الشؤون التربوية',
    reference: 'المذكرة الوزارية رقم 125/21 وخارطة الطريق 2022-2026',
    startDate: getTodayString(-15),
    dueDate: getTodayString(45),
    responsible: 'السيد المدير + الفريق القيادي للمشروع',
    participants: 'جميع الأساتذة، ممثلو جمعية الآباء، شركاء المؤسسة',
    resources: 'صندوق الدعم المالي لمشروع المؤسسة، قاعة متعددة الوسائط',
    indicators: 'نسبة النجاح تفوق 92%، مشاركة 80% في أنشطة الحياة المدرسية',
    notes: 'تم إنجاز التشخيص التشاركي بنجاح وسيتم الانتقال لمرحلة برمجة الأنشطة ذات الأولوية.',
    progress: 50,
    status: 'قيد التنفيذ',
    academicYear: '2024 - 2025',
    monthPlan: 'أكتوبر (Octobre)',
    phases: [
      {
        id: 'p1',
        order: 1,
        title: 'التشخيص التشاركي وتحليل الوضعية الراهنة',
        description: 'رصد مكامن القوة ونقاط التحسين بناء على مؤشرات السنة الماضية.',
        startDate: getTodayString(-15),
        dueDate: getTodayString(-5),
        status: 'مكتملة',
        responsible: 'فريق القيادة',
        completedDate: getTodayString(-5)
      },
      {
        id: 'p2',
        order: 2,
        title: 'تحديد الأولويات والأهداف الإجرائية',
        description: 'صياغة أهداف قابلة للقياس في التحكم باللغات والرياضيات وتنشيط النوادي.',
        startDate: getTodayString(-4),
        dueDate: getTodayString(5),
        status: 'قيد التنفيذ',
        responsible: 'السيد المدير والمنسق التربوي'
      },
      {
        id: 'p3',
        order: 3,
        title: 'صياغة بطاقات المشاريع والميزانية التقديرية',
        description: 'إعداد جدولة العمل وتحديد الموارد والوسائل التمويلية.',
        startDate: getTodayString(6),
        dueDate: getTodayString(18),
        status: 'مبرمجة',
        responsible: 'أمين المال ومسؤولو النوادي'
      },
      {
        id: 'p4',
        order: 4,
        title: 'المصادقة على المشروع في مجلس التدبير وإرساله للمديرية',
        description: 'عرض المشروع النهائي والتوقيع عليه ورفعه للجنة الإقليمية.',
        startDate: getTodayString(19),
        dueDate: getTodayString(28),
        status: 'مبرمجة',
        responsible: 'رئيس المؤسسة'
      },
      {
        id: 'p5',
        order: 5,
        title: 'تنفيذ الأنشطة والتتبع الدوري للمؤشرات',
        description: 'المتابعة الميدانية وعقد اجتماعات تقييمية ربع سنوية.',
        startDate: getTodayString(29),
        dueDate: getTodayString(45),
        status: 'مبرمجة',
        responsible: 'فريق القيادة والتتبع'
      }
    ],
    createdAt: getTodayString(-15),
    updatedAt: getTodayString()
  },
  {
    id: 'op-2',
    title: 'تنظيم وتفعيل مجالس المؤسسة التعليمية',
    objective: 'ضمان التسيير التشاركي والديمقراطي للتدبير الإداري والتربوي بالمؤسسة.',
    category: 'الاجتماعات والمجالس',
    reference: 'المرسوم رقم 2.02.376 بمثابة النظام الأساسي الخاص بمؤسسات التربية والتعليم العمومي',
    startDate: getTodayString(-20),
    dueDate: getTodayString(10),
    responsible: 'رئيس المؤسسة',
    participants: 'مجلس التدبير، المجلس التربوي، المجالس التعليمية، مجالس الأقسام',
    resources: 'سجلات المحاضر، قاعة الاجتماعات، نسخ التقارير',
    indicators: 'عقد 100% من الاجتماعات القانونية وتوثيق كافة المحاضر',
    progress: 75,
    status: 'قيد التنفيذ',
    academicYear: '2024 - 2025',
    monthPlan: 'شتنبر (Septembre)',
    phases: [
      {
        id: 'p6',
        order: 1,
        title: 'انتخاب وتجديد ممثلي الأساتذة ومجلس التدبير',
        startDate: getTodayString(-20),
        dueDate: getTodayString(-12),
        status: 'مكتملة',
        responsible: 'لجنة الانتخابات ورئيس المؤسسة',
        completedDate: getTodayString(-12)
      },
      {
        id: 'p7',
        order: 2,
        title: 'عقد اجتماعات المجالس التعليمية لكل مستوى ومادة',
        startDate: getTodayString(-11),
        dueDate: getTodayString(-3),
        status: 'مكتملة',
        responsible: 'منسقو المواد والأساتذة',
        completedDate: getTodayString(-3)
      },
      {
        id: 'p8',
        order: 3,
        title: 'عقد المجلس التربوي للمصادقة على البرامج والأنشطة',
        startDate: getTodayString(-2),
        dueDate: getTodayString(2),
        status: 'قيد التنفيذ',
        responsible: 'رئيس المؤسسة'
      },
      {
        id: 'p9',
        order: 4,
        title: 'أرشفة المحاضر وموافاة المديرية الإقليمية بالخلاصات',
        startDate: getTodayString(3),
        dueDate: getTodayString(10),
        status: 'مبرمجة',
        responsible: 'كتابة الإدارة التربوية'
      }
    ],
    createdAt: getTodayString(-20),
    updatedAt: getTodayString()
  },
  {
    id: 'op-3',
    title: 'تنظيم محطة المراقبة المستمرة والامتحانات الموحدة للأسدس الأول',
    objective: 'التقويم الموضوعي للتعلمات وضمان السير الشفاف للامتحانات المدرسية.',
    category: 'الشؤون التربوية',
    reference: 'المقرر الوزاري لتنظيم السنة الدراسية 2024-2025',
    startDate: getTodayString(10),
    dueDate: getTodayString(35),
    responsible: 'لجنة الامتحانات والإدارة التربوية',
    participants: 'أساتذة المستوى السادس وكافة الأطر التربوية',
    resources: 'أوراق الاختبارات، آلات الاستنساخ، أظرفة سرية، أرقام الامتحان',
    indicators: 'انعدام الغش وتوزيع النتائج في الآجال المحددة مع استثمار مسار بنسبة 100%',
    progress: 0,
    status: 'مبرمجة',
    academicYear: '2024 - 2025',
    monthPlan: 'يناير (Janvier)',
    phases: [
      {
        id: 'p10',
        order: 1,
        title: 'إعداد مواضيع الامتحانات الموحدة وسلم التنقيط',
        startDate: getTodayString(10),
        dueDate: getTodayString(18),
        status: 'مبرمجة',
        responsible: 'اللجنة التربوية للمستوى السادس'
      },
      {
        id: 'p11',
        order: 2,
        title: 'استنساخ الاختبارات وتجهيز الأظرفة والقاعات',
        startDate: getTodayString(19),
        dueDate: getTodayString(24),
        status: 'مبرمجة',
        responsible: 'السيد المدير'
      },
      {
        id: 'p12',
        order: 3,
        title: 'إجراء الامتحان والتصحيح الجماعي السري',
        startDate: getTodayString(25),
        dueDate: getTodayString(28),
        status: 'مبرمجة',
        responsible: 'أطر الحراسة والتصحيح'
      },
      {
        id: 'p13',
        order: 4,
        title: 'مسك النقط ومجالس الأقسام وتسليم النتائج',
        startDate: getTodayString(29),
        dueDate: getTodayString(35),
        status: 'مبرمجة',
        responsible: 'الإدارة التربوية'
      }
    ],
    createdAt: getTodayString(-2),
    updatedAt: getTodayString(-2)
  }
];

export const initialDailyNotes: DailyNote[] = [
  {
    id: 'note-1',
    date: getTodayString(0),
    timestamp: '08:45',
    type: 'أحداث مهمة',
    title: 'انطلاق الحصص الصباحية في ظروف ممتازة',
    content: 'حضور جميع أطر التدريس في الوقت المحدد، وبلغت نسبة حضور التلاميذ 98%. تم تسجيل غياب مبرر لأستاذة المستوى الثالث وتم تكليف أستاذ الدعم بالتعويض تفادياً لهدر الحصص.',
    tags: ['دخول مدرسي', 'انضباط'],
    linkedTaskId: 'task-1',
    createdAt: getTodayString(0) + 'T08:45:00.000Z',
    updatedAt: getTodayString(0) + 'T08:45:00.000Z'
  },
  {
    id: 'note-2',
    date: getTodayString(0),
    timestamp: '11:15',
    type: 'ملاحظات تربوية',
    title: 'تنسيق بخصوص المتعلمين المتعثرين في القراءة',
    content: 'اتفاق مع أساتذة المستويين الثالث والرابع على إدراج أنشطة القراءة السريعة والألعاب اللغوية لمدة 15 دقيقة في بداية كل حصة لتعزيز الطلاقة اللغوية.',
    tags: ['الدعم التربوي', 'القراءة'],
    linkedOperationId: 'op-1',
    createdAt: getTodayString(0) + 'T11:15:00.000Z',
    updatedAt: getTodayString(0) + 'T11:15:00.000Z'
  },
  {
    id: 'note-3',
    date: getTodayString(-1),
    timestamp: '14:20',
    type: 'مشاكل وقرارات',
    title: 'معالجة تسرب مياه خفيف في المرفق الصحي',
    content: 'تم التدخل الفوري مع مصلحة الصيانة بجماعة الرباط وتم إصلاح العطب بنجاح دون أي تأثير على السير العادي للدراسة.',
    tags: ['صيانة', 'سلامة'],
    createdAt: getTodayString(-1) + 'T14:20:00.000Z',
    updatedAt: getTodayString(-1) + 'T14:20:00.000Z'
  }
];

export const initialMeetings: Meeting[] = [
  {
    id: 'meet-1',
    title: 'الدورة العادية الأولى لمجلس التدبير',
    type: 'مجلس التدبير',
    date: getTodayString(-5),
    time: '15:00 - 17:30',
    location: 'قاعة الاجتماعات الكبرى بالمؤسسة',
    attendees: 'رئيس المؤسسة (رئيساً)، ممثل الأطر التعليمية (3)، ممثل الأطر الإدارية، رئيس جمعية الآباء، ممثل المجلس الجماعي',
    agenda: [
      'الاطلاع على تقرير الدخول المدرسي 2024-2025 ومؤشرات التمدرس',
      'دراسة والمصادقة على مشروع النظام الداخلي للمؤسسة',
      'مناقشة وإقرار مشروع الميزانية التقديرية وبرنامج العمل السنوي'
    ],
    discussionPoints: 'تمت مناقشة سبل تأمين المحيط المدرسي وتحسين خدمة الإطعام المدرسي، كما تم التنويه بانضباط أطر التدريس وارتفاع نسبة التسجيل برسم الموسم الحالي.',
    decisions: [
      {
        id: 'dec-1',
        decisionText: 'المصادقة بالإجماع على النظام الداخلي للمؤسسة بعد إدراج تعديلات حول استعمال الهواتف الذكية.',
        responsible: 'رئيس المؤسسة',
        deadline: getTodayString(2),
        status: 'تم التنفيذ'
      },
      {
        id: 'dec-2',
        decisionText: 'توجيه مراسلة للمجلس الجماعي قصد تجديد علامات التشوير الطرقي وممر الراجلين أمام باب المؤسسة.',
        responsible: 'رئيس المؤسسة + رئيس جمعية الآباء',
        deadline: getTodayString(7),
        status: 'قيد التنفيذ'
      },
      {
        id: 'dec-3',
        decisionText: 'برمجة حصص تحسيسية أسبوعية حول النظافة والمحافظة على البيئة المدرسية.',
        responsible: 'منسق نادي البيئة والصحة',
        deadline: getTodayString(14),
        status: 'قيد الانتظار'
      }
    ],
    minutes: 'افتتح الاجتماع بكلمة ترحيبية للسيد الرئيس ذكر فيها بجدول الأعمال والسياق الوطني لتنزيل خارطة الطريق 2022-2026. بعد نقاش بناء ومستفيض صادق المجلس على كافة النقاط المدرجة في جدول الأعمال ورفعت الجلسة في أجواء يسودها حس المسؤولية والتعاون.',
    academicYear: '2024 - 2025',
    createdAt: getTodayString(-5),
    updatedAt: getTodayString(-5)
  },
  {
    id: 'meet-2',
    title: 'اجتماع المجلس التربوي لتحليل نتائج التقويم التشخيصي',
    type: 'المجلس التربوي',
    date: getTodayString(2),
    time: '16:00 - 18:00',
    location: 'مكتب الإدارة',
    attendees: 'السيد المدير، منسقو المواد والمستويات، ممثل جمعية الآباء',
    agenda: [
      'استعراض الحصيلة الإحصائية لروائز التقويم التشخيصي في اللغات والرياضيات',
      'تسطير خطة الدعم التربوي المركز وبرمجة ساعات المعالجة البيداغوجية',
      'تفعيل أنشطة أندية الحياة المدرسية'
    ],
    discussionPoints: 'تحديد مكامن الضعف في التحكم في الحساب الذهني والقراءة باللغة الفرنسية للمستوى الرابع.',
    decisions: [
      {
        id: 'dec-4',
        decisionText: 'تخصيص ربع ساعة قراءة صامتة يومية لكافة المستويات قبل انطلاق الحصص.',
        responsible: 'جميع أطر التدريس',
        deadline: getTodayString(4),
        status: 'قيد الانتظار'
      }
    ],
    minutes: 'اجتماع تحضيري لتنزيل برنامج الدعم المؤسساتي.',
    academicYear: '2024 - 2025',
    createdAt: getTodayString(-1),
    updatedAt: getTodayString(-1)
  }
];

export const initialAnnualProgram: AnnualProgramItem[] = [
  {
    id: 'an-1',
    academicYear: '2024 - 2025',
    month: 'شتنبر (Septembre)',
    title: 'عمليات الاستقبال والدخول المدرسي وتوزيع اللوازم المدرسية',
    category: 'الإدارة والتدبير',
    objective: 'التحاق كافة التلميذات والتلاميذ وضمان الانطلاقة الفعلية للدراسة في الوقت المحدد.',
    targetDate: '2024-09-15',
    responsible: 'رئيس المؤسسة + الفريق التربوي',
    indicators: 'نسبة التحاق تفوق 98% وتوزيع المحافظ في اليوم الأول',
    status: 'مكتملة',
    completionPercentage: 100,
    operationId: 'op-2'
  },
  {
    id: 'an-2',
    academicYear: '2024 - 2025',
    month: 'أكتوبر (Octobre)',
    title: 'تمرير روائز التقويم التشخيصي وتأسيس مجالس المؤسسة',
    category: 'الشؤون التربوية',
    objective: 'تشخيص التعلمات ورصد التعثرات وتجديد هياكل الحكامة المدرسية.',
    targetDate: '2024-10-20',
    responsible: 'المجلس التربوي ولجنة الانتخابات',
    indicators: 'مسك 100% من النقط في منظومة مسار وتجديد مجلس التدبير',
    status: 'قيد التنفيذ',
    completionPercentage: 70,
    operationId: 'op-1'
  },
  {
    id: 'an-3',
    academicYear: '2024 - 2025',
    month: 'نونبر (Novembre)',
    title: 'تخليد ذكرى المسيرة الخضراء وعيد الاستقلال وتنظيم الدعم التربوي',
    category: 'الأنشطة والمناسبات',
    objective: 'تعزيز قيم المواطنة والانتماء الوطني وتفعيل أنشطة أندية الحياة المدرسية.',
    targetDate: '2024-11-25',
    responsible: 'أندية الحياة المدرسية + الأساتذة',
    indicators: 'مشاركة 85% من التلاميذ في الأنشطة الثقافية والفنية',
    status: 'مبرمجة',
    completionPercentage: 15
  },
  {
    id: 'an-4',
    academicYear: '2024 - 2025',
    month: 'يناير (Janvier)',
    title: 'امتحانات المراقبة المستمرة والامتحان الموحد لنهاية الأسدس الأول',
    category: 'الشؤون التربوية',
    objective: 'تقويم مكتسبات الفصل الأول واستثمار مجالس الأقسام وإصدار بيانات النقط.',
    targetDate: '2025-01-28',
    responsible: 'لجنة الامتحانات والإدارة',
    indicators: 'انعدام الشكايات وتوزيع البيانات قبل بداية عطلة نهاية الأسدس',
    status: 'مبرمجة',
    completionPercentage: 0,
    operationId: 'op-3'
  },
  {
    id: 'an-5',
    academicYear: '2024 - 2025',
    month: 'ماي (Mai)',
    title: 'تنظيم أسبوع الصحة المدرسية والبيئة والأولمبياد التربوي',
    category: 'الحياة المدرسية',
    objective: 'تتويج مشاريع الأندية والارتقاء بالفضاء البيئي للمؤسسة.',
    targetDate: '2025-05-20',
    responsible: 'منسقو الأندية وشركاء المؤسسة',
    indicators: 'تنظيم معرض للأعمال المتميزة ومسابقات رياضية وثقافية',
    status: 'مبرمجة',
    completionPercentage: 0
  },
  {
    id: 'an-6',
    academicYear: '2024 - 2025',
    month: 'يونيو (Juin)',
    title: 'امتحانات نهاية السنة الدراسية ومجالس التحصيل وتوزيع الجوائز',
    category: 'الشؤون التربوية',
    objective: 'اختتام الموسم الدراسي وتقويم الأهداف المسطرة في مشروع المؤسسة.',
    targetDate: '2025-06-30',
    responsible: 'مجلس التدبير والإدارة التربوية',
    indicators: 'نسبة نجاح سنوية تتجاوز 94% وتنظيم حفل التميز السنوي',
    status: 'مبرمجة',
    completionPercentage: 0
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'موعد اليوم: زيارة المفتش التربوي',
    message: 'لديك لقاء تنسيقي مع السيد المفتش التربوي ذ. بنسالم على الساعة 10:00 بمكتب الإدارة.',
    type: 'appointment',
    priority: 'high',
    timestamp: getTodayString(0) + 'T09:00:00.000Z',
    read: false,
    actionUrl: 'appointments'
  },
  {
    id: 'notif-2',
    title: 'مهمة عاجلة تستوجب الإتمام اليوم',
    message: 'الموعد النهائي لمهمة "إعداد ومراجعة جداول حصص الأساتذة" ينتهي اليوم على الساعة 12:00.',
    type: 'task',
    priority: 'high',
    timestamp: getTodayString(0) + 'T08:00:00.000Z',
    read: false,
    actionUrl: 'tasks'
  },
  {
    id: 'notif-3',
    title: 'تقدم مشروع المؤسسة المندمج',
    message: 'المرحلة 2 من مشروع المؤسسة أوشكت على الانتهاء. يرجى مراجعة بطاقات الأنشطة.',
    type: 'operation',
    priority: 'medium',
    timestamp: getTodayString(-1) + 'T16:00:00.000Z',
    read: true,
    actionUrl: 'operations'
  }
];
