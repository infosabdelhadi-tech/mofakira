// MIZANI Financial Types & Data Models

export type CurrencyCode = 'MAD' | 'USD' | 'EUR' | 'GBP' | 'SAR' | 'AED' | 'CAD';

export type SupportedLanguage = 'ar' | 'fr' | 'en';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  exchangeRateToMAD: number; // For multi-currency conversion
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'MAD', symbol: 'د.م.', nameAr: 'درهم مغربي', nameFr: 'Dirham marocain', nameEn: 'Moroccan Dirham', exchangeRateToMAD: 1.0 },
  { code: 'USD', symbol: '$', nameAr: 'دولار أمريكي', nameFr: 'Dollar américain', nameEn: 'US Dollar', exchangeRateToMAD: 10.1 },
  { code: 'EUR', symbol: '€', nameAr: 'يورو', nameFr: 'Euro', nameEn: 'Euro', exchangeRateToMAD: 10.9 },
  { code: 'GBP', symbol: '£', nameAr: 'جنيه إسترليني', nameFr: 'Livre sterling', nameEn: 'British Pound', exchangeRateToMAD: 12.8 },
  { code: 'SAR', symbol: 'ر.س', nameAr: 'ريال سعودي', nameFr: 'Riyal saoudien', nameEn: 'Saudi Riyal', exchangeRateToMAD: 2.69 },
  { code: 'AED', symbol: 'د.إ', nameAr: 'درهم إماراتي', nameFr: 'Dirham des EAU', nameEn: 'UAE Dirham', exchangeRateToMAD: 2.75 },
  { code: 'CAD', symbol: 'C$', nameAr: 'دولار كندي', nameFr: 'Dollar canadien', nameEn: 'Canadian Dollar', exchangeRateToMAD: 7.4 }
];

// Accounts & Wallets
export type AccountType = 'cash' | 'bank' | 'savings' | 'digital_wallet' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  openingBalance: number; // stored in standard decimal or major units, calculations handled safely
  currentBalance: number;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Categories
export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  nameFr?: string;
  nameEn?: string;
  type: CategoryType;
  icon: string;
  color: string;
  monthlyLimit?: number; // Spending budget limit for expense categories
  description?: string;
  isDefault?: boolean;
}

// Transactions
export type TransactionType =
  | 'income'             // مدخول
  | 'expense'            // مصروف
  | 'transfer'           // تحويل بين الحسابات
  | 'debt_payment'       // سداد دين (علي أو استرداد لي)
  | 'loan_received'      // اقتراض مال (يزيد السيولة)
  | 'money_lent'         // إقراض مال للغير (ينقص السيولة)
  | 'refund';            // استرداد أموال

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'digital_wallet' | 'other';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;               // Account debited or credited
  toAccountId?: string;            // In case of 'transfer'
  date: string;                    // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  personOrEntity?: string;         // e.g. employer, friend, merchant
  notes?: string;
  reference?: string;              // receipt number or transaction id
  tags?: string[];
  debtId?: string;                 // Linked to a debt if debt_payment/loan/lent
  installmentId?: string;          // Linked to a specific installment
  savingsGoalId?: string;          // Linked to a savings goal contribution
  createdAt: string;
  updatedAt: string;
}

// Budgets
export type BudgetPeriod = 'monthly' | 'annual';

export interface Budget {
  id: string;
  name: string;
  categoryId?: string;             // Optional: specific category or overall budget
  amount: number;
  period: BudgetPeriod;
  month?: string;                  // e.g. "2025-03"
  year: number;                    // e.g. 2025
  allowCarryOver?: boolean;        // Carry over remaining amount
  carriedOverAmount?: number;
  alertThreshold: number;          // Default 80 (%)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Debts and Loans (ديون علي وما لي على الغير)
export type DebtType =
  | 'i_owe'        // ديون علي (أنا المقترض)
  | 'owed_to_me';  // ديون لي (أنا المقرض للغير)

export type DebtStatus = 'active' | 'partially_paid' | 'fully_paid' | 'overdue' | 'cancelled';

export interface DebtPaymentRecord {
  id: string;
  transactionId?: string;
  date: string;
  amount: number;
  principalAmount: number;
  interestAmount?: number;
  notes?: string;
  accountId: string;
}

export interface Debt {
  id: string;
  personOrInstitution: string;
  type: DebtType;
  originalAmount: number;
  outstandingBalance: number;
  startDate: string;
  dueDate: string;
  interestRate?: number;           // Annual interest rate percentage if applicable
  totalInterest?: number;
  monthlyInstallment?: number;
  paymentFrequency?: 'monthly' | 'weekly' | 'quarterly' | 'lump_sum';
  status: DebtStatus;
  notes?: string;
  payments: DebtPaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

// Installments Module (الأقساط الشهرية)
export type InstallmentStatus = 'pending' | 'paid' | 'overdue';

export interface InstallmentScheduleItem {
  id: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: InstallmentStatus;
  paidDate?: string;
  paidAmount?: number;
  transactionId?: string;
  notes?: string;
}

export interface InstallmentPlan {
  id: string;
  title: string;
  debtId?: string;                 // Optional link to debt
  totalAmount: number;
  numberOfInstallments: number;
  paymentFrequency: 'monthly' | 'weekly' | 'quarterly';
  firstPaymentDate: string;
  accountId: string;
  schedule: InstallmentScheduleItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Savings Goals (الأهداف الادخارية)
export type SavingsPriority = 'high' | 'medium' | 'low';

export interface SavingsContribution {
  id: string;
  date: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  accountId: string;
  notes?: string;
  transactionId?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  priority: SavingsPriority;
  color?: string;
  icon?: string;
  notes?: string;
  accountId?: string;              // Designated savings account
  contributions: SavingsContribution[];
  createdAt: string;
  updatedAt: string;
}

// Recurring Transactions (المعاملات المتكررة)
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  paymentMethod: PaymentMethod;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  lastGeneratedDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// User Financial Profile & Regional Preferences
export interface FinancialPreferences {
  userName: string;
  language: SupportedLanguage;
  currency: CurrencyCode;
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
  numberFormat: 'standard' | 'comma_decimal';
  weekStartsOn: 1 | 0 | 6; // 1 = Monday, 0 = Sunday, 6 = Saturday
  timezone: string;
  budgetAlertThreshold: number; // e.g. 80%
  theme: 'light' | 'dark' | 'system';
}

// Financial KPI Overview Summary
export interface FinancialSummaryKPIs {
  totalIncome: number;
  totalExpenses: number;
  netAvailableBalance: number;
  totalDebtsOwedByMe: number;
  totalDebtsOwedToMe: number;
  totalSavings: number;
  monthlySavingsRate: number; // Percentage
  totalBudgetLimit: number;
  budgetSpent: number;
  remainingBudget: number;
  budgetConsumptionRate: number; // Percentage
}
