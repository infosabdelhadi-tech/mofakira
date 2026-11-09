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
import {
  DEFAULT_PREFERENCES,
  DEFAULT_CATEGORIES,
  DEFAULT_ACCOUNTS,
  DEMO_TRANSACTIONS,
  DEMO_DEBTS,
  DEMO_SAVINGS_GOALS,
  DEMO_BUDGETS,
  DEMO_INSTALLMENT_PLANS,
  DEMO_RECURRING
} from './financeSeedData';

export const FINANCE_STORAGE_KEYS = {
  PREFERENCES: 'mizani_preferences',
  ACCOUNTS: 'mizani_accounts',
  CATEGORIES: 'mizani_categories',
  TRANSACTIONS: 'mizani_transactions',
  BUDGETS: 'mizani_budgets',
  DEBTS: 'mizani_debts',
  INSTALLMENTS: 'mizani_installments',
  SAVINGS_GOALS: 'mizani_savings_goals',
  RECURRING: 'mizani_recurring',
  INITIALIZED: 'mizani_initialized'
};

const safeLoad = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return fallback;
  }
};

const safeSave = <T>(key: string, data: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
    return false;
  }
};

export const getInitialPreferences = (): FinancialPreferences => {
  return safeLoad<FinancialPreferences>(FINANCE_STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
};

export const getInitialCategories = (): Category[] => {
  const loaded = safeLoad<Category[]>(FINANCE_STORAGE_KEYS.CATEGORIES, []);
  if (loaded.length === 0) return DEFAULT_CATEGORIES;
  return loaded;
};

export const getInitialAccounts = (): Account[] => {
  const loaded = safeLoad<Account[]>(FINANCE_STORAGE_KEYS.ACCOUNTS, []);
  if (loaded.length === 0) return DEFAULT_ACCOUNTS;
  return loaded;
};

export const getInitialTransactions = (): Transaction[] => {
  return safeLoad<Transaction[]>(FINANCE_STORAGE_KEYS.TRANSACTIONS, []);
};

export const getInitialBudgets = (): Budget[] => {
  return safeLoad<Budget[]>(FINANCE_STORAGE_KEYS.BUDGETS, []);
};

export const getInitialDebts = (): Debt[] => {
  return safeLoad<Debt[]>(FINANCE_STORAGE_KEYS.DEBTS, []);
};

export const getInitialInstallments = (): InstallmentPlan[] => {
  return safeLoad<InstallmentPlan[]>(FINANCE_STORAGE_KEYS.INSTALLMENTS, []);
};

export const getInitialSavingsGoals = (): SavingsGoal[] => {
  return safeLoad<SavingsGoal[]>(FINANCE_STORAGE_KEYS.SAVINGS_GOALS, []);
};

export const getInitialRecurring = (): RecurringTransaction[] => {
  return safeLoad<RecurringTransaction[]>(FINANCE_STORAGE_KEYS.RECURRING, []);
};

export const saveFinanceItem = <T>(key: string, data: T): boolean => safeSave(key, data);

export interface MizaniBackupData {
  app: 'MIZANI_FINANCE_MANAGER';
  version: string;
  schemaVersion: number;
  exportDate: string;
  preferences: FinancialPreferences;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  debts: Debt[];
  installments: InstallmentPlan[];
  savingsGoals: SavingsGoal[];
  recurring: RecurringTransaction[];
}

export const exportMizaniBackup = (): string => {
  const data: MizaniBackupData = {
    app: 'MIZANI_FINANCE_MANAGER',
    version: '1.0.0',
    schemaVersion: 1,
    exportDate: new Date().toISOString(),
    preferences: getInitialPreferences(),
    accounts: getInitialAccounts(),
    categories: getInitialCategories(),
    transactions: getInitialTransactions(),
    budgets: getInitialBudgets(),
    debts: getInitialDebts(),
    installments: getInitialInstallments(),
    savingsGoals: getInitialSavingsGoals(),
    recurring: getInitialRecurring()
  };
  return JSON.stringify(data, null, 2);
};

export interface MizaniValidationResult {
  isValid: boolean;
  error?: string;
  data?: MizaniBackupData;
  summary?: {
    accountsCount: number;
    transactionsCount: number;
    debtsCount: number;
    budgetsCount: number;
    savingsGoalsCount: number;
  };
}

export const validateMizaniBackup = (jsonString: string): MizaniValidationResult => {
  try {
    if (!jsonString || !jsonString.trim()) {
      return { isValid: false, error: 'ملف النسخة الاحتياطية فارغ' };
    }
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'بنية ملف JSON غير صالحة' };
    }
    if (parsed.app !== 'MIZANI_FINANCE_MANAGER') {
      return { isValid: false, error: 'الملف لا ينتمي إلى تطبيق ميزانيتي (MIZANI)' };
    }
    if (!Array.isArray(parsed.accounts) || !Array.isArray(parsed.transactions)) {
      return { isValid: false, error: 'الحسابات والمعاملات مفقودة في ملف النسخة الاحتياطية' };
    }

    return {
      isValid: true,
      data: parsed as MizaniBackupData,
      summary: {
        accountsCount: parsed.accounts.length,
        transactionsCount: parsed.transactions.length,
        debtsCount: Array.isArray(parsed.debts) ? parsed.debts.length : 0,
        budgetsCount: Array.isArray(parsed.budgets) ? parsed.budgets.length : 0,
        savingsGoalsCount: Array.isArray(parsed.savingsGoals) ? parsed.savingsGoals.length : 0
      }
    };
  } catch (e: any) {
    return { isValid: false, error: `تعذر قراءة الملف: ${e?.message || 'خطأ غير معروف'}` };
  }
};

export const restoreMizaniBackup = (data: MizaniBackupData): { success: boolean; error?: string } => {
  try {
    safeSave(FINANCE_STORAGE_KEYS.PREFERENCES, data.preferences || DEFAULT_PREFERENCES);
    safeSave(FINANCE_STORAGE_KEYS.ACCOUNTS, data.accounts || []);
    safeSave(FINANCE_STORAGE_KEYS.CATEGORIES, data.categories || DEFAULT_CATEGORIES);
    safeSave(FINANCE_STORAGE_KEYS.TRANSACTIONS, data.transactions || []);
    safeSave(FINANCE_STORAGE_KEYS.BUDGETS, data.budgets || []);
    safeSave(FINANCE_STORAGE_KEYS.DEBTS, data.debts || []);
    safeSave(FINANCE_STORAGE_KEYS.INSTALLMENTS, data.installments || []);
    safeSave(FINANCE_STORAGE_KEYS.SAVINGS_GOALS, data.savingsGoals || []);
    safeSave(FINANCE_STORAGE_KEYS.RECURRING, data.recurring || []);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'خطأ أثناء استعادة البيانات' };
  }
};

export const loadMizaniDemoData = () => {
  safeSave(FINANCE_STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  safeSave(FINANCE_STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
  safeSave(FINANCE_STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  safeSave(FINANCE_STORAGE_KEYS.TRANSACTIONS, DEMO_TRANSACTIONS);
  safeSave(FINANCE_STORAGE_KEYS.BUDGETS, DEMO_BUDGETS);
  safeSave(FINANCE_STORAGE_KEYS.DEBTS, DEMO_DEBTS);
  safeSave(FINANCE_STORAGE_KEYS.INSTALLMENTS, DEMO_INSTALLMENT_PLANS);
  safeSave(FINANCE_STORAGE_KEYS.SAVINGS_GOALS, DEMO_SAVINGS_GOALS);
  safeSave(FINANCE_STORAGE_KEYS.RECURRING, DEMO_RECURRING);
  safeSave(FINANCE_STORAGE_KEYS.INITIALIZED, 'true');
};

export const resetMizaniData = () => {
  safeSave(FINANCE_STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
  safeSave(FINANCE_STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  safeSave(FINANCE_STORAGE_KEYS.TRANSACTIONS, []);
  safeSave(FINANCE_STORAGE_KEYS.BUDGETS, []);
  safeSave(FINANCE_STORAGE_KEYS.DEBTS, []);
  safeSave(FINANCE_STORAGE_KEYS.INSTALLMENTS, []);
  safeSave(FINANCE_STORAGE_KEYS.SAVINGS_GOALS, []);
  safeSave(FINANCE_STORAGE_KEYS.RECURRING, []);
};
