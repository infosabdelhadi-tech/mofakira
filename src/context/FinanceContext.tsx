import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import type {
  Account,
  Category,
  Transaction,
  Budget,
  Debt,
  InstallmentPlan,
  SavingsGoal,
  RecurringTransaction,
  FinancialPreferences,
  FinancialSummaryKPIs,
  SupportedLanguage,
  CurrencyCode
} from '../types/finance';
import {
  FINANCE_STORAGE_KEYS,
  getInitialPreferences,
  getInitialCategories,
  getInitialAccounts,
  getInitialTransactions,
  getInitialBudgets,
  getInitialDebts,
  getInitialInstallments,
  getInitialSavingsGoals,
  getInitialRecurring,
  saveFinanceItem,
  loadMizaniDemoData,
  resetMizaniData
} from '../utils/financeStorage';
import {
  calculateFinancialKPIs,
  recalculateAccountBalance,
  calculateBudgetStatus,
  type BudgetStatusInfo
} from '../services/financialCalculations';
import { addMoney, subtractMoney } from '../utils/money';
import { dictionaries, type TranslationKey } from '../i18n/translations';

export type MizaniTab =
  | 'dashboard'
  | 'transactions'
  | 'income'
  | 'expenses'
  | 'budgets'
  | 'debts'
  | 'installments'
  | 'savings'
  | 'accounts'
  | 'categories'
  | 'recurring'
  | 'reports'
  | 'calendar'
  | 'settings';

interface FinanceContextType {
  // Navigation & Localization
  activeTab: MizaniTab;
  setActiveTab: (tab: MizaniTab) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  preferences: FinancialPreferences;
  updatePreferences: (prefs: Partial<FinancialPreferences>) => void;
  t: (key: TranslationKey) => string;

  // Selected Month filter for dashboard/budgets
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;

  // Accounts
  accounts: Account[];
  addAccount: (acc: Omit<Account, 'id' | 'currentBalance' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Budgets
  budgets: Budget[];
  addBudget: (b: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  budgetStatuses: BudgetStatusInfo[];

  // Debts & Loans
  debts: Debt[];
  addDebt: (d: Omit<Debt, 'id' | 'outstandingBalance' | 'payments' | 'createdAt' | 'updatedAt'>) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  recordDebtPayment: (debtId: string, amount: number, accountId: string, notes?: string) => void;

  // Installments
  installmentPlans: InstallmentPlan[];
  addInstallmentPlan: (plan: Omit<InstallmentPlan, 'id' | 'schedule' | 'createdAt' | 'updatedAt'>) => void;
  markInstallmentPaid: (planId: string, scheduleItemId: string, accountId: string) => void;
  deleteInstallmentPlan: (id: string) => void;

  // Savings Goals
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (g: Omit<SavingsGoal, 'id' | 'currentAmount' | 'contributions' | 'createdAt' | 'updatedAt'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToSavingsGoal: (goalId: string, amount: number, accountId: string, type: 'deposit' | 'withdrawal', notes?: string) => void;

  // Recurring
  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (r: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  processDueRecurring: () => void;

  // Financial KPIs
  kpis: FinancialSummaryKPIs;

  // Quick modals
  isTransactionModalOpen: boolean;
  setIsTransactionModalOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (t: Transaction | null) => void;

  // Demo & Reset
  loadDemo: () => void;
  resetAll: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<MizaniTab>('dashboard');
  const [preferences, setPreferences] = useState<FinancialPreferences>(getInitialPreferences);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => new Date().toISOString().substring(0, 7));

  // Entities state
  const [accounts, setAccounts] = useState<Account[]>(getInitialAccounts);
  const [categories, setCategories] = useState<Category[]>(getInitialCategories);
  const [transactions, setTransactions] = useState<Transaction[]>(getInitialTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(getInitialBudgets);
  const [debts, setDebts] = useState<Debt[]>(getInitialDebts);
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>(getInitialInstallments);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(getInitialSavingsGoals);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(getInitialRecurring);

  // Quick Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Translation function helper
  const t = (key: TranslationKey): string => {
    const lang = preferences.language || 'ar';
    return dictionaries[lang]?.[key] || dictionaries.ar[key] || key;
  };

  // Sync state to storage
  useEffect(() => {
    saveFinanceItem(FINANCE_STORAGE_KEYS.PREFERENCES, preferences);
  }, [preferences]);

  useEffect(() => {
    saveFinanceItem(FINANCE_STORAGE_KEYS.ACCOUNTS, accounts);
  }, [accounts]);

  useEffect(() => {
    saveFinanceItem(FINANCE_STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    saveFinanceItem(FINANCE_STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  useEffect(() => {
    saveFinanceItem(FINANCE_STORAGE_KEYS.BUDGETS, budgets);
  }, [budgets]);

  useEffect(() => {
    saveFinanceItem(FINANCE_STORAGE_KEYS.DEBTS, debts);
  }, [debts]);

  useEffect(() => {
    saveFinanceItem(FINANCE_STORAGE_KEYS.INSTALLMENTS, installmentPlans);
  }, [installmentPlans]);

  useEffect(() => {
    saveFinanceItem(FINANCE_STORAGE_KEYS.SAVINGS_GOALS, savingsGoals);
  }, [savingsGoals]);

  useEffect(() => {
    saveFinanceItem(FINANCE_STORAGE_KEYS.RECURRING, recurringTransactions);
  }, [recurringTransactions]);

  // Handle document direction and language attributes
  useEffect(() => {
    const isRtl = preferences.language === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = preferences.language;
  }, [preferences.language]);

  // Preference updates
  const setLanguage = (lang: SupportedLanguage) => {
    setPreferences(prev => ({ ...prev, language: lang }));
  };

  const setCurrency = (curr: CurrencyCode) => {
    setPreferences(prev => ({ ...prev, currency: curr }));
  };

  const updatePreferences = (updates: Partial<FinancialPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  // Recalculate account balances when transactions change
  const syncAccountBalances = (currentTransactions: Transaction[], baseAccounts: Account[]): Account[] => {
    return baseAccounts.map(acc => ({
      ...acc,
      currentBalance: recalculateAccountBalance(acc, currentTransactions),
      updatedAt: new Date().toISOString()
    }));
  };

  // 1. Account CRUD
  const addAccount = (accData: Omit<Account, 'id' | 'currentBalance' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAcc: Account = {
      ...accData,
      id: 'acc-' + Date.now(),
      currentBalance: accData.openingBalance,
      createdAt: now,
      updatedAt: now
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a);
      return syncAccountBalances(transactions, next);
    });
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // 2. Category CRUD
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: 'cat-' + Date.now()
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // 3. Transactions CRUD
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const nextTransactions = [newTx, ...transactions];
    setTransactions(nextTransactions);
    setAccounts(prev => syncAccountBalances(nextTransactions, prev));
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const nextTransactions = transactions.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    setTransactions(nextTransactions);
    setAccounts(prev => syncAccountBalances(nextTransactions, prev));
  };

  const deleteTransaction = (id: string) => {
    const nextTransactions = transactions.filter(t => t.id !== id);
    setTransactions(nextTransactions);
    setAccounts(prev => syncAccountBalances(nextTransactions, prev));
  };

  // 4. Budgets CRUD
  const addBudget = (bData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBudget: Budget = {
      ...bData,
      id: 'b-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // 5. Debts & Loans
  const addDebt = (dData: Omit<Debt, 'id' | 'outstandingBalance' | 'payments' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newDebt: Debt = {
      ...dData,
      id: 'debt-' + Date.now(),
      outstandingBalance: dData.originalAmount,
      payments: [],
      createdAt: now,
      updatedAt: now
    };
    setDebts(prev => [...prev, newDebt]);
  };

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d));
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const recordDebtPayment = (debtId: string, amount: number, accountId: string, notes?: string) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    const paymentDate = new Date().toISOString().split('T')[0];
    const newBalance = Math.max(0, subtractMoney(debt.outstandingBalance, amount));
    const newStatus = newBalance === 0 ? 'fully_paid' : 'partially_paid';

    // 1. Create financial transaction reflecting actual cash impact:
    // If I owe ('i_owe') -> I pay -> reduces cash via debt_payment
    // If owed to me ('owed_to_me') -> I receive cash back -> increases cash via debt_payment or refund
    const txType = debt.type === 'i_owe' ? 'debt_payment' : 'refund';
    const txDesc = debt.type === 'i_owe'
      ? `تسديد دفعة دين إلى: ${debt.personOrInstitution}`
      : `استرداد دفعة دين من: ${debt.personOrInstitution}`;

    const newTxId = 'tx-' + Date.now();
    const newTx: Transaction = {
      id: newTxId,
      description: txDesc,
      amount,
      type: txType,
      categoryId: 'cat-exp-other',
      accountId,
      date: paymentDate,
      paymentMethod: 'cash',
      personOrEntity: debt.personOrInstitution,
      debtId,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const nextTxs = [newTx, ...transactions];
    setTransactions(nextTxs);
    setAccounts(prev => syncAccountBalances(nextTxs, prev));

    // 2. Update Debt record
    const paymentRecord = {
      id: 'dp-' + Date.now(),
      transactionId: newTxId,
      date: paymentDate,
      amount,
      principalAmount: amount,
      accountId,
      notes
    };

    setDebts(prev => prev.map(d => {
      if (d.id === debtId) {
        return {
          ...d,
          outstandingBalance: newBalance,
          status: newStatus,
          payments: [paymentRecord, ...d.payments],
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }));

    confetti({ particleCount: 50, spread: 60 });
  };

  // 6. Installments Management
  const addInstallmentPlan = (planData: Omit<InstallmentPlan, 'id' | 'schedule' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const schedule: InstallmentPlan['schedule'] = [];
    const installmentAmount = Math.round((planData.totalAmount / planData.numberOfInstallments) * 100) / 100;
    const startDate = new Date(planData.firstPaymentDate);

    for (let i = 1; i <= planData.numberOfInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      schedule.push({
        id: 'sch-' + Date.now() + '-' + i,
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: installmentAmount,
        status: 'pending'
      });
    }

    const newPlan: InstallmentPlan = {
      ...planData,
      id: 'inst-' + Date.now(),
      schedule,
      createdAt: now,
      updatedAt: now
    };
    setInstallmentPlans(prev => [...prev, newPlan]);
  };

  const markInstallmentPaid = (planId: string, scheduleItemId: string, accountId: string) => {
    const plan = installmentPlans.find(p => p.id === planId);
    if (!plan) return;
    const item = plan.schedule.find(s => s.id === scheduleItemId);
    if (!item) return;

    const paidDate = new Date().toISOString().split('T')[0];

    // Create payment transaction
    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      description: `أداء قسط ${item.installmentNumber} لـ ${plan.title}`,
      amount: item.amount,
      type: 'debt_payment',
      categoryId: 'cat-exp-other',
      accountId,
      date: paidDate,
      paymentMethod: 'bank_transfer',
      installmentId: item.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const nextTxs = [newTx, ...transactions];
    setTransactions(nextTxs);
    setAccounts(prev => syncAccountBalances(nextTxs, prev));

    setInstallmentPlans(prev => prev.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          schedule: p.schedule.map(s => s.id === scheduleItemId ? {
            ...s,
            status: 'paid',
            paidDate,
            paidAmount: item.amount,
            transactionId: newTx.id
          } : s),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    confetti({ particleCount: 40, spread: 50 });
  };

  const deleteInstallmentPlan = (id: string) => {
    setInstallmentPlans(prev => prev.filter(p => p.id !== id));
  };

  // 7. Savings Goals
  const addSavingsGoal = (gData: Omit<SavingsGoal, 'id' | 'currentAmount' | 'contributions' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newGoal: SavingsGoal = {
      ...gData,
      id: 'sg-' + Date.now(),
      currentAmount: 0,
      contributions: [],
      createdAt: now,
      updatedAt: now
    };
    setSavingsGoals(prev => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  const contributeToSavingsGoal = (goalId: string, amount: number, accountId: string, type: 'deposit' | 'withdrawal', notes?: string) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) return;

    const date = new Date().toISOString().split('T')[0];
    const newSavedAmount = type === 'deposit'
      ? addMoney(goal.currentAmount, amount)
      : Math.max(0, subtractMoney(goal.currentAmount, amount));

    const contribution = {
      id: 'sc-' + Date.now(),
      date,
      amount,
      type,
      accountId,
      notes
    };

    setSavingsGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: newSavedAmount,
          contributions: [contribution, ...g.contributions],
          updatedAt: new Date().toISOString()
        };
      }
      return g;
    }));

    if (type === 'deposit') {
      confetti({ particleCount: 60, spread: 60 });
    }
  };

  // 8. Recurring Transactions
  const addRecurringTransaction = (rData: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRec: RecurringTransaction = {
      ...rData,
      id: 'rec-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setRecurringTransactions(prev => [...prev, newRec]);
  };

  const updateRecurringTransaction = (id: string, updates: Partial<RecurringTransaction>) => {
    setRecurringTransactions(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
  };

  const deleteRecurringTransaction = (id: string) => {
    setRecurringTransactions(prev => prev.filter(r => r.id !== id));
  };

  const processDueRecurring = () => {
    const today = new Date().toISOString().split('T')[0];
    const generated: Transaction[] = [];

    const updatedRecurring = recurringTransactions.map(rec => {
      if (rec.isActive && rec.nextOccurrence <= today) {
        generated.push({
          id: 'tx-rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          description: rec.description,
          amount: rec.amount,
          type: rec.type,
          categoryId: rec.categoryId,
          accountId: rec.accountId,
          toAccountId: rec.toAccountId,
          date: rec.nextOccurrence,
          paymentMethod: rec.paymentMethod,
          notes: 'معاملة دورية تم إنشاؤها تلقائياً',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Compute next occurrence
        const nextDate = new Date(rec.nextOccurrence);
        if (rec.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        else if (rec.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        else if (rec.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        else if (rec.frequency === 'quarterly') nextDate.setMonth(nextDate.getMonth() + 3);
        else if (rec.frequency === 'annually') nextDate.setFullYear(nextDate.getFullYear() + 1);

        return {
          ...rec,
          lastGeneratedDate: rec.nextOccurrence,
          nextOccurrence: nextDate.toISOString().split('T')[0],
          updatedAt: new Date().toISOString()
        };
      }
      return rec;
    });

    if (generated.length > 0) {
      const nextTxs = [...generated, ...transactions];
      setTransactions(nextTxs);
      setRecurringTransactions(updatedRecurring);
      setAccounts(prev => syncAccountBalances(nextTxs, prev));
    }
  };

  // Run recurring processor on initial mount
  useEffect(() => {
    processDueRecurring();
  }, []);

  // Compute live KPIs
  const kpis = useMemo(() => {
    return calculateFinancialKPIs(accounts, transactions, debts, savingsGoals, budgets, selectedMonth);
  }, [accounts, transactions, debts, savingsGoals, budgets, selectedMonth]);

  // Compute live Budget Statuses
  const budgetStatuses = useMemo(() => {
    return budgets.map(b => calculateBudgetStatus(b, transactions));
  }, [budgets, transactions]);

  const loadDemo = () => {
    loadMizaniDemoData();
    setPreferences(getInitialPreferences());
    setAccounts(getInitialAccounts());
    setCategories(getInitialCategories());
    setTransactions(getInitialTransactions());
    setBudgets(getInitialBudgets());
    setDebts(getInitialDebts());
    setInstallmentPlans(getInitialInstallments());
    setSavingsGoals(getInitialSavingsGoals());
    setRecurringTransactions(getInitialRecurring());
    confetti({ particleCount: 70, spread: 60 });
  };

  const resetAll = () => {
    resetMizaniData();
    setTransactions([]);
    setBudgets([]);
    setDebts([]);
    setInstallmentPlans([]);
    setSavingsGoals([]);
    setRecurringTransactions([]);
  };

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        language: preferences.language,
        setLanguage,
        currency: preferences.currency,
        setCurrency,
        preferences,
        updatePreferences,
        t,
        selectedMonth,
        setSelectedMonth,
        accounts,
        addAccount,
        updateAccount,
        deleteAccount,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        budgetStatuses,
        debts,
        addDebt,
        updateDebt,
        deleteDebt,
        recordDebtPayment,
        installmentPlans,
        addInstallmentPlan,
        markInstallmentPaid,
        deleteInstallmentPlan,
        savingsGoals,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeToSavingsGoal,
        recurringTransactions,
        addRecurringTransaction,
        updateRecurringTransaction,
        deleteRecurringTransaction,
        processDueRecurring,
        kpis,
        isTransactionModalOpen,
        setIsTransactionModalOpen,
        editingTransaction,
        setEditingTransaction,
        loadDemo,
        resetAll
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
