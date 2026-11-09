import type {
  Account,
  Transaction,
  Budget,
  Debt,
  SavingsGoal,
  FinancialSummaryKPIs
} from '../types/finance';
import { addMoney, subtractMoney } from '../utils/money';

export interface DateFilterRange {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

/**
 * Filter transactions by date range
 */
export const filterTransactionsByDate = (
  transactions: Transaction[],
  range?: DateFilterRange
): Transaction[] => {
  if (!range) return transactions;
  return transactions.filter(t => {
    if (range.startDate && t.date < range.startDate) return false;
    if (range.endDate && t.date > range.endDate) return false;
    return true;
  });
};

/**
 * Calculate total income in a given list of transactions
 * Strictly includes only 'income' transactions (never loans received or transfers)
 */
export const calculateTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'income' || t.type === 'refund')
    .reduce((sum, t) => addMoney(sum, t.amount), 0);
};

/**
 * Calculate total ordinary expenses in a given list of transactions
 * Strictly includes 'expense' transactions.
 * Excludes transfers, debt payments (principal), and money lent.
 */
export const calculateTotalExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => addMoney(sum, t.amount), 0);
};

/**
 * Calculate current total balance across all active accounts
 */
export const calculateTotalAccountBalance = (accounts: Account[]): number => {
  return accounts
    .filter(a => a.isActive)
    .reduce((sum, a) => addMoney(sum, a.currentBalance), 0);
};

/**
 * Recalculate account balances based on opening balance and full transaction history
 * Ensures that account balance is mathematically auditable:
 * Current = Opening + (Incomes, Loans Received, Money Lent Recovered, Inward Transfers)
 *                   - (Expenses, Outward Transfers, Money Lent, Debt Payments)
 */
export const recalculateAccountBalance = (account: Account, transactions: Transaction[]): number => {
  let balance = account.openingBalance;

  transactions.forEach(t => {
    // If account is credited
    if (t.accountId === account.id) {
      if (t.type === 'income' || t.type === 'loan_received' || t.type === 'refund') {
        balance = addMoney(balance, t.amount);
      } else if (t.type === 'expense' || t.type === 'money_lent' || t.type === 'debt_payment') {
        balance = subtractMoney(balance, t.amount);
      } else if (t.type === 'transfer') {
        // Outgoing transfer from this account
        balance = subtractMoney(balance, t.amount);
      }
    }

    // If account is the recipient of a transfer
    if (t.toAccountId === account.id && t.type === 'transfer') {
      balance = addMoney(balance, t.amount);
    }
  });

  return balance;
};

/**
 * Calculate total outstanding debts owed BY the user ('i_owe')
 */
export const calculateTotalDebtsOwedByMe = (debts: Debt[]): number => {
  return debts
    .filter(d => d.type === 'i_owe' && (d.status === 'active' || d.status === 'partially_paid' || d.status === 'overdue'))
    .reduce((sum, d) => addMoney(sum, d.outstandingBalance), 0);
};

/**
 * Calculate total debts owed TO the user by others ('owed_to_me')
 */
export const calculateTotalDebtsOwedToMe = (debts: Debt[]): number => {
  return debts
    .filter(d => d.type === 'owed_to_me' && (d.status === 'active' || d.status === 'partially_paid' || d.status === 'overdue'))
    .reduce((sum, d) => addMoney(sum, d.outstandingBalance), 0);
};

/**
 * Calculate total current savings across all savings goals
 */
export const calculateTotalSavings = (goals: SavingsGoal[]): number => {
  return goals.reduce((sum, g) => addMoney(sum, g.currentAmount), 0);
};

/**
 * Calculate monthly savings rate formula:
 * ((Total Income - Total Expenses) / Total Income) * 100
 * Safe handling when total income is zero or expenses exceed income
 */
export const calculateSavingsRate = (totalIncome: number, totalExpenses: number): number => {
  if (totalIncome <= 0) return 0;
  const netSavings = subtractMoney(totalIncome, totalExpenses);
  if (netSavings <= 0) return 0;
  const rate = (netSavings / totalIncome) * 100;
  return Math.min(100, Math.max(0, Math.round(rate * 10) / 10));
};

/**
 * Calculate budget status and consumption for a specific budget
 */
export interface BudgetStatusInfo {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'critical' | 'exceeded';
}

export const calculateBudgetStatus = (budget: Budget, transactions: Transaction[]): BudgetStatusInfo => {
  // Filter transactions within budget period and category
  const relevantTransactions = transactions.filter(t => {
    if (t.type !== 'expense') return false;
    if (budget.categoryId && t.categoryId !== budget.categoryId) return false;
    if (budget.month && !t.date.startsWith(budget.month)) return false;
    if (budget.year && !t.date.startsWith(String(budget.year))) return false;
    return true;
  });

  const spent = relevantTransactions.reduce((sum, t) => addMoney(sum, t.amount), 0);
  const totalLimit = addMoney(budget.amount, budget.carriedOverAmount || 0);
  const remaining = subtractMoney(totalLimit, spent);
  const percentage = totalLimit > 0 ? Math.round((spent / totalLimit) * 100) : 0;

  let status: 'safe' | 'warning' | 'critical' | 'exceeded' = 'safe';
  if (percentage >= 100) {
    status = 'exceeded';
  } else if (percentage >= 90) {
    status = 'critical';
  } else if (percentage >= 70) {
    status = 'warning';
  }

  return {
    budget,
    spent,
    remaining,
    percentage,
    status
  };
};

/**
 * Centralized Financial Summary KPI Calculator
 * Feeds the main dashboard with 100% computed, real-time data
 */
export const calculateFinancialKPIs = (
  accounts: Account[],
  transactions: Transaction[],
  debts: Debt[],
  goals: SavingsGoal[],
  budgets: Budget[],
  monthStr?: string // e.g. "2025-03"
): FinancialSummaryKPIs => {
  const currentMonth = monthStr || new Date().toISOString().substring(0, 7);

  // Month-filtered transactions for income/expense KPIs
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

  const totalIncome = calculateTotalIncome(monthTransactions);
  const totalExpenses = calculateTotalExpenses(monthTransactions);
  const netAvailableBalance = calculateTotalAccountBalance(accounts);
  const totalDebtsOwedByMe = calculateTotalDebtsOwedByMe(debts);
  const totalDebtsOwedToMe = calculateTotalDebtsOwedToMe(debts);
  const totalSavings = calculateTotalSavings(goals);
  const monthlySavingsRate = calculateSavingsRate(totalIncome, totalExpenses);

  // Overall monthly budget
  const monthlyBudgets = budgets.filter(b => b.period === 'monthly' && (!b.month || b.month === currentMonth));
  const totalBudgetLimit = monthlyBudgets.reduce((sum, b) => addMoney(sum, addMoney(b.amount, b.carriedOverAmount || 0)), 0);
  const budgetSpent = totalExpenses;
  const remainingBudget = subtractMoney(totalBudgetLimit, budgetSpent);
  const budgetConsumptionRate = totalBudgetLimit > 0 ? Math.round((budgetSpent / totalBudgetLimit) * 100) : 0;

  return {
    totalIncome,
    totalExpenses,
    netAvailableBalance,
    totalDebtsOwedByMe,
    totalDebtsOwedToMe,
    totalSavings,
    monthlySavingsRate,
    totalBudgetLimit,
    budgetSpent,
    remainingBudget,
    budgetConsumptionRate
  };
};

/**
 * Monthly aggregates for Income vs Expense bar/line chart
 */
export interface MonthlyAggregateItem {
  month: string;      // YYYY-MM
  labelAr: string;
  labelFr: string;
  labelEn: string;
  income: number;
  expenses: number;
  netSavings: number;
}

export const calculateMonthlyAggregates = (transactions: Transaction[], monthsCount: number = 6): MonthlyAggregateItem[] => {
  const result: MonthlyAggregateItem[] = [];
  const now = new Date();

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toISOString().substring(0, 7);

    const monthTxs = transactions.filter(t => t.date.startsWith(monthKey));
    const income = calculateTotalIncome(monthTxs);
    const expenses = calculateTotalExpenses(monthTxs);
    const netSavings = subtractMoney(income, expenses);

    const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];
    const monthNamesFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const mIdx = d.getMonth();
    result.push({
      month: monthKey,
      labelAr: `${monthNamesAr[mIdx]} ${d.getFullYear().toString().slice(-2)}`,
      labelFr: `${monthNamesFr[mIdx]} ${d.getFullYear().toString().slice(-2)}`,
      labelEn: `${monthNamesEn[mIdx]} '${d.getFullYear().toString().slice(-2)}`,
      income,
      expenses,
      netSavings
    });
  }

  return result;
};

/**
 * Expense distribution by category for pie charts
 */
export interface CategorySpendingItem {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

export const calculateCategorySpending = (
  transactions: Transaction[],
  categoriesMap: Map<string, { name: string; color: string }>,
  monthStr?: string
): CategorySpendingItem[] => {
  const currentMonth = monthStr || new Date().toISOString().substring(0, 7);
  const filtered = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));
  const total = calculateTotalExpenses(filtered);

  const group: Record<string, number> = {};
  filtered.forEach(t => {
    group[t.categoryId] = addMoney(group[t.categoryId] || 0, t.amount);
  });

  return Object.entries(group)
    .map(([catId, amount]) => {
      const meta = categoriesMap.get(catId);
      return {
        categoryId: catId,
        categoryName: meta?.name || 'أخرى',
        color: meta?.color || '#94a3b8',
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0
      };
    })
    .sort((a, b) => b.amount - a.amount);
};
