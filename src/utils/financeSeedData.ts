import type {
  Account,
  Category,
  Transaction,
  Budget,
  Debt,
  InstallmentPlan,
  SavingsGoal,
  RecurringTransaction,
  FinancialPreferences
} from '../types/finance';

export const DEFAULT_PREFERENCES: FinancialPreferences = {
  userName: 'مستخدم ميزانيتي',
  language: 'ar',
  currency: 'MAD',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'standard',
  weekStartsOn: 1, // Monday
  timezone: 'Africa/Casablanca',
  budgetAlertThreshold: 80,
  theme: 'light'
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: 'cat-exp-food', name: 'التغذية والمشتريات', nameFr: 'Alimentation & Courses', nameEn: 'Food & Groceries', type: 'expense', icon: 'Utensils', color: '#10b981', monthlyLimit: 2500, isDefault: true },
  { id: 'cat-exp-housing', name: 'السكن والكراء', nameFr: 'Logement & Loyer', nameEn: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#3b82f6', monthlyLimit: 3000, isDefault: true },
  { id: 'cat-exp-bills', name: 'الماء والكهرباء والإنترنت', nameFr: 'Eau, Électricité & Net', nameEn: 'Utilities & Bills', type: 'expense', icon: 'Zap', color: '#f59e0b', monthlyLimit: 600, isDefault: true },
  { id: 'cat-exp-transport', name: 'المواصلات والمحروقات', nameFr: 'Transport & Carburant', nameEn: 'Transportation & Fuel', type: 'expense', icon: 'Car', color: '#6366f1', monthlyLimit: 800, isDefault: true },
  { id: 'cat-exp-health', name: 'الصحة والعلاج', nameFr: 'Santé & Soins', nameEn: 'Healthcare & Medical', type: 'expense', icon: 'Activity', color: '#ef4444', monthlyLimit: 500, isDefault: true },
  { id: 'cat-exp-education', name: 'التعليم والتمدرس', nameFr: 'Éducation & Études', nameEn: 'Education & Courses', type: 'expense', icon: 'GraduationCap', color: '#8b5cf6', monthlyLimit: 1000, isDefault: true },
  { id: 'cat-exp-family', name: 'الأسرة والأبناء', nameFr: 'Famille & Enfants', nameEn: 'Family & Children', type: 'expense', icon: 'Users', color: '#ec4899', monthlyLimit: 1000, isDefault: true },
  { id: 'cat-exp-clothing', name: 'الملابس والمظهر', nameFr: 'Vêtements & Mode', nameEn: 'Clothing & Fashion', type: 'expense', icon: 'Shirt', color: '#14b8a6', monthlyLimit: 600, isDefault: true },
  { id: 'cat-exp-leisure', name: 'الترفيه والخرجات', nameFr: 'Loisirs & Sorties', nameEn: 'Entertainment & Outings', type: 'expense', icon: 'Smile', color: '#f97316', monthlyLimit: 500, isDefault: true },
  { id: 'cat-exp-other', name: 'مصاريف أخرى', nameFr: 'Autres dépenses', nameEn: 'Other expenses', type: 'expense', icon: 'Package', color: '#64748b', isDefault: true },

  // Income categories
  { id: 'cat-inc-salary', name: 'الراتب الشهري', nameFr: 'Salaire mensuel', nameEn: 'Monthly Salary', type: 'income', icon: 'Briefcase', color: '#059669', isDefault: true },
  { id: 'cat-inc-freelance', name: 'عمل إضافي / حر', nameFr: 'Travail indépendant', nameEn: 'Freelance & Side work', type: 'income', icon: 'Laptop', color: '#0284c7', isDefault: true },
  { id: 'cat-inc-business', name: 'تجارة واستثمار', nameFr: 'Commerce & Investissement', nameEn: 'Business & Investment', type: 'income', icon: 'TrendingUp', color: '#7c3aed', isDefault: true },
  { id: 'cat-inc-rent', name: 'مداخيل كراء', nameFr: 'Revenus locatifs', nameEn: 'Rental Income', type: 'income', icon: 'Key', color: '#d97706', isDefault: true },
  { id: 'cat-inc-gift', name: 'هدايا ومساعدات', nameFr: 'Cadeaux & Aides', nameEn: 'Gifts & Support', type: 'income', icon: 'Gift', color: '#db2777', isDefault: true },
  { id: 'cat-inc-other', name: 'مداخيل أخرى', nameFr: 'Autres revenus', nameEn: 'Other Income', type: 'income', icon: 'Coins', color: '#475569', isDefault: true }
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-cash',
    name: 'النقود والسيولة (Cash)',
    type: 'cash',
    currency: 'MAD',
    openingBalance: 1500,
    currentBalance: 1500,
    description: 'السيولة النقدية في المحفظة اليومية',
    color: '#10b981',
    icon: 'Wallet',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-bank-main',
    name: 'الحساب البنكي الرئيسي',
    type: 'bank',
    currency: 'MAD',
    openingBalance: 8500,
    currentBalance: 8500,
    description: 'حساب توطين الراتب البنكي',
    color: '#2563eb',
    icon: 'CreditCard',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-savings',
    name: 'حساب التوفير والطوارئ',
    type: 'savings',
    currency: 'MAD',
    openingBalance: 12000,
    currentBalance: 12000,
    description: 'صندوق الطوارئ والادخار للظروف غير المتوقعة',
    color: '#8b5cf6',
    icon: 'PiggyBank',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    description: 'تحويل الراتب الشهري',
    amount: 11000,
    type: 'income',
    categoryId: 'cat-inc-salary',
    accountId: 'acc-bank-main',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    personOrEntity: 'مقر العمل',
    notes: 'أجر شهر العمل الحالي',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-2',
    description: 'سحب نقدي للمصاريف اليومية',
    amount: 1500,
    type: 'transfer',
    categoryId: 'cat-exp-other',
    accountId: 'acc-bank-main',
    toAccountId: 'acc-cash',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'card',
    notes: 'سحب عبر الشباك الأوتوماتيكي',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-3',
    description: 'واجب كراء الشقة الشهرية',
    amount: 2800,
    type: 'expense',
    categoryId: 'cat-exp-housing',
    accountId: 'acc-bank-main',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    personOrEntity: 'صاحب المنزل',
    notes: 'واجب الكراء الشهري',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-4',
    description: 'مقتنيات سوبرماركت وخضر أسبوعية',
    amount: 650,
    type: 'expense',
    categoryId: 'cat-exp-food',
    accountId: 'acc-cash',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'cash',
    personOrEntity: 'السوق المركزي',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-5',
    description: 'فاتورة اشتراك الإنترنت والألياف البصرية',
    amount: 249,
    type: 'expense',
    categoryId: 'cat-exp-bills',
    accountId: 'acc-bank-main',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'card',
    personOrEntity: 'شركة الاتصالات',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DEMO_DEBTS: Debt[] = [
  {
    id: 'debt-1',
    personOrInstitution: 'قرض البنك لاقتناء سيارة',
    type: 'i_owe',
    originalAmount: 45000,
    outstandingBalance: 18000,
    startDate: '2023-01-15',
    dueDate: '2026-01-15',
    monthlyInstallment: 1250,
    paymentFrequency: 'monthly',
    status: 'active',
    notes: 'قرض استهلاكي بفائدة ميسرة',
    payments: [
      {
        id: 'dp-1',
        date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
        amount: 1250,
        principalAmount: 1150,
        interestAmount: 100,
        accountId: 'acc-bank-main',
        notes: 'دفعة القسط الشهري'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'debt-2',
    personOrInstitution: 'الصديق كريم (سلفة مساعدة)',
    type: 'owed_to_me',
    originalAmount: 2000,
    outstandingBalance: 1000,
    startDate: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    paymentFrequency: 'lump_sum',
    status: 'partially_paid',
    notes: 'سلفة ودية مستحقة هذا الشهر',
    payments: [
      {
        id: 'dp-2',
        date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
        amount: 1000,
        principalAmount: 1000,
        accountId: 'acc-cash',
        notes: 'استرداد الدفعة الأولى نقداً'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DEMO_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'sg-1',
    name: 'صندوق الطوارئ (6 أشهر)',
    targetAmount: 30000,
    currentAmount: 12000,
    startDate: '2024-01-01',
    targetDate: '2025-12-31',
    priority: 'high',
    color: '#10b981',
    icon: 'ShieldCheck',
    accountId: 'acc-savings',
    notes: 'تغطية النفقات الأساسية في حالة الطوارئ',
    contributions: [
      {
        id: 'sc-1',
        date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
        amount: 1000,
        type: 'deposit',
        accountId: 'acc-savings',
        notes: 'إيداع شهري منتظم'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sg-2',
    name: 'عمرة أو عطلة صيفية عائلية',
    targetAmount: 18000,
    currentAmount: 6500,
    startDate: '2024-09-01',
    targetDate: '2025-07-01',
    priority: 'medium',
    color: '#f59e0b',
    icon: 'Plane',
    notes: 'رحلة عائلية خلال العطلة الصيفية',
    contributions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DEMO_BUDGETS: Budget[] = [
  {
    id: 'b-overall',
    name: 'الميزانية الشهرية العامة',
    amount: 9000,
    period: 'monthly',
    month: new Date().toISOString().substring(0, 7),
    year: new Date().getFullYear(),
    alertThreshold: 85,
    notes: 'الحد الأقصى المسموح به لكافة النفقات الشهرية',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'b-food',
    name: 'ميزانية التغذية والمشتريات',
    categoryId: 'cat-exp-food',
    amount: 2500,
    period: 'monthly',
    month: new Date().toISOString().substring(0, 7),
    year: new Date().getFullYear(),
    alertThreshold: 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DEMO_INSTALLMENT_PLANS: InstallmentPlan[] = [
  {
    id: 'inst-1',
    title: 'تقسيط جهاز حاسوب مكتبي',
    totalAmount: 6000,
    numberOfInstallments: 6,
    paymentFrequency: 'monthly',
    firstPaymentDate: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
    accountId: 'acc-bank-main',
    schedule: [
      {
        id: 'sch-1',
        installmentNumber: 1,
        dueDate: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
        amount: 1000,
        status: 'paid',
        paidDate: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
        paidAmount: 1000
      },
      {
        id: 'sch-2',
        installmentNumber: 2,
        dueDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        amount: 1000,
        status: 'paid',
        paidDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        paidAmount: 1000
      },
      {
        id: 'sch-3',
        installmentNumber: 3,
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        amount: 1000,
        status: 'pending'
      },
      {
        id: 'sch-4',
        installmentNumber: 4,
        dueDate: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
        amount: 1000,
        status: 'pending'
      },
      {
        id: 'sch-5',
        installmentNumber: 5,
        dueDate: new Date(Date.now() + 65 * 86400000).toISOString().split('T')[0],
        amount: 1000,
        status: 'pending'
      },
      {
        id: 'sch-6',
        installmentNumber: 6,
        dueDate: new Date(Date.now() + 95 * 86400000).toISOString().split('T')[0],
        amount: 1000,
        status: 'pending'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DEMO_RECURRING: RecurringTransaction[] = [
  {
    id: 'rec-salary',
    description: 'الراتب الشهري المنتظم',
    amount: 11000,
    type: 'income',
    categoryId: 'cat-inc-salary',
    accountId: 'acc-bank-main',
    paymentMethod: 'bank_transfer',
    frequency: 'monthly',
    startDate: '2024-01-01',
    nextOccurrence: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rec-rent',
    description: 'إيجار السكن الشهري',
    amount: 2800,
    type: 'expense',
    categoryId: 'cat-exp-housing',
    accountId: 'acc-bank-main',
    paymentMethod: 'bank_transfer',
    frequency: 'monthly',
    startDate: '2024-01-01',
    nextOccurrence: new Date(Date.now() + 27 * 86400000).toISOString().split('T')[0],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
