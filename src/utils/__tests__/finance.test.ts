import { assert, describe } from './testHelper';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  recalculateAccountBalance,
  calculateTotalDebtsOwedByMe,
  calculateTotalDebtsOwedToMe,
  calculateSavingsRate,
  calculateBudgetStatus
} from '../../services/financialCalculations';
import { addMoney, subtractMoney, formatMoney, toCents, fromCents } from '../money';
import { validateMizaniBackup, type MizaniBackupData } from '../financeStorage';
import type { Account, Transaction, Debt, Budget } from '../../types/finance';

describe('1. Financial Arithmetic & Money Cents Helper', () => {
  // Floating point precision test: 0.1 + 0.2 === 0.3
  const res = addMoney(0.1, 0.2);
  assert.equal(res, 0.3, '0.1 + 0.2 should equal exactly 0.3');

  const diff = subtractMoney(10.55, 4.25);
  assert.equal(diff, 6.3, '10.55 - 4.25 should equal 6.3');

  assert.equal(toCents(12.34), 1234);
  assert.equal(fromCents(1234), 12.34);

  const formattedMAD = formatMoney(1500, 'MAD', 'ar');
  assert.equal(formattedMAD.includes('1'), true);
});

describe('2. Incomes and Expenses Calculation Rules', () => {
  const transactions: Transaction[] = [
    { id: '1', description: 'Salary', amount: 10000, type: 'income', categoryId: 'c1', accountId: 'a1', date: '2025-03-01', paymentMethod: 'cash', createdAt: '', updatedAt: '' },
    { id: '2', description: 'Groceries', amount: 800, type: 'expense', categoryId: 'c2', accountId: 'a1', date: '2025-03-02', paymentMethod: 'cash', createdAt: '', updatedAt: '' },
    { id: '3', description: 'Rent', amount: 2500, type: 'expense', categoryId: 'c3', accountId: 'a1', date: '2025-03-03', paymentMethod: 'cash', createdAt: '', updatedAt: '' },
    // Transfers must NOT be counted as income or expense
    { id: '4', description: 'Transfer to savings', amount: 2000, type: 'transfer', categoryId: 'c4', accountId: 'a1', toAccountId: 'a2', date: '2025-03-04', paymentMethod: 'bank_transfer', createdAt: '', updatedAt: '' },
    // Borrowed loan must NOT be counted as income
    { id: '5', description: 'Bank Loan', amount: 50000, type: 'loan_received', categoryId: 'c5', accountId: 'a1', date: '2025-03-05', paymentMethod: 'bank_transfer', createdAt: '', updatedAt: '' }
  ];

  const income = calculateTotalIncome(transactions);
  assert.equal(income, 10000, 'Only income should be counted (transfers and loans excluded)');

  const expenses = calculateTotalExpenses(transactions);
  assert.equal(expenses, 3300, 'Only actual expenses should be counted (3300)');
});

describe('3. Account Balances and Transfer Inward/Outward Auditing', () => {
  const accountMain: Account = {
    id: 'a1',
    name: 'Main Bank',
    type: 'bank',
    currency: 'MAD',
    openingBalance: 5000,
    currentBalance: 5000,
    isActive: true,
    createdAt: '',
    updatedAt: ''
  };

  const accountSavings: Account = {
    id: 'a2',
    name: 'Savings',
    type: 'savings',
    currency: 'MAD',
    openingBalance: 1000,
    currentBalance: 1000,
    isActive: true,
    createdAt: '',
    updatedAt: ''
  };

  const txs: Transaction[] = [
    // Income into a1 (+2000) -> 7000
    { id: 't1', description: 'Bonus', amount: 2000, type: 'income', categoryId: '', accountId: 'a1', date: '2025-03-01', paymentMethod: 'bank_transfer', createdAt: '', updatedAt: '' },
    // Expense from a1 (-500) -> 6500
    { id: 't2', description: 'Utility', amount: 500, type: 'expense', categoryId: '', accountId: 'a1', date: '2025-03-02', paymentMethod: 'card', createdAt: '', updatedAt: '' },
    // Transfer from a1 to a2 (1500) -> a1: 5000, a2: 2500
    { id: 't3', description: 'Save', amount: 1500, type: 'transfer', categoryId: '', accountId: 'a1', toAccountId: 'a2', date: '2025-03-03', paymentMethod: 'bank_transfer', createdAt: '', updatedAt: '' }
  ];

  const bal1 = recalculateAccountBalance(accountMain, txs);
  assert.equal(bal1, 5000, 'Main account balance should be 5000 (5000 + 2000 - 500 - 1500)');

  const bal2 = recalculateAccountBalance(accountSavings, txs);
  assert.equal(bal2, 2500, 'Savings account balance should be 2500 (1000 + 1500)');
});

describe('4. Savings Rate Calculation Safe Handling', () => {
  // Income 10000, Expenses 4000 => Net 6000 => Rate: 60%
  const rate1 = calculateSavingsRate(10000, 4000);
  assert.equal(rate1, 60);

  // Income 0, Expenses 500 => Safe handling zero division
  const rateZero = calculateSavingsRate(0, 500);
  assert.equal(rateZero, 0);

  // Negative savings (Expenses > Income) => 0%
  const rateDeficit = calculateSavingsRate(3000, 5000);
  assert.equal(rateDeficit, 0);
});

describe('5. Debts & Loans Tracking Rules', () => {
  const debts: Debt[] = [
    {
      id: 'd1',
      personOrInstitution: 'Car Loan',
      type: 'i_owe',
      originalAmount: 20000,
      outstandingBalance: 12000,
      startDate: '2024-01-01',
      dueDate: '2026-01-01',
      status: 'active',
      payments: [],
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 'd2',
      personOrInstitution: 'Lent to Friend',
      type: 'owed_to_me',
      originalAmount: 3000,
      outstandingBalance: 1500,
      startDate: '2025-01-01',
      dueDate: '2025-04-01',
      status: 'partially_paid',
      payments: [],
      createdAt: '',
      updatedAt: ''
    }
  ];

  const totalIOwe = calculateTotalDebtsOwedByMe(debts);
  assert.equal(totalIOwe, 12000);

  const totalOwedToMe = calculateTotalDebtsOwedToMe(debts);
  assert.equal(totalOwedToMe, 1500);
});

describe('6. Budget Status & Thresholds (Safe, Warning, Critical, Exceeded)', () => {
  const budget: Budget = {
    id: 'b1',
    name: 'Food',
    amount: 1000,
    period: 'monthly',
    month: '2025-03',
    year: 2025,
    alertThreshold: 80,
    createdAt: '',
    updatedAt: ''
  };

  // Safe (< 70%)
  const txsSafe: Transaction[] = [
    { id: '1', description: 'Food', amount: 500, type: 'expense', categoryId: '', accountId: '', date: '2025-03-05', paymentMethod: 'cash', createdAt: '', updatedAt: '' }
  ];
  const statusSafe = calculateBudgetStatus(budget, txsSafe);
  assert.equal(statusSafe.status, 'safe');
  assert.equal(statusSafe.percentage, 50);

  // Warning (70% - 90%)
  const txsWarning: Transaction[] = [
    { id: '1', description: 'Food', amount: 750, type: 'expense', categoryId: '', accountId: '', date: '2025-03-05', paymentMethod: 'cash', createdAt: '', updatedAt: '' }
  ];
  const statusWarning = calculateBudgetStatus(budget, txsWarning);
  assert.equal(statusWarning.status, 'warning');

  // Critical (90% - 100%)
  const txsCritical: Transaction[] = [
    { id: '1', description: 'Food', amount: 950, type: 'expense', categoryId: '', accountId: '', date: '2025-03-05', paymentMethod: 'cash', createdAt: '', updatedAt: '' }
  ];
  const statusCritical = calculateBudgetStatus(budget, txsCritical);
  assert.equal(statusCritical.status, 'critical');

  // Exceeded (> 100%)
  const txsExceeded: Transaction[] = [
    { id: '1', description: 'Food', amount: 1200, type: 'expense', categoryId: '', accountId: '', date: '2025-03-05', paymentMethod: 'cash', createdAt: '', updatedAt: '' }
  ];
  const statusExceeded = calculateBudgetStatus(budget, txsExceeded);
  assert.equal(statusExceeded.status, 'exceeded');
  assert.equal(statusExceeded.remaining, -200);
});

describe('7. Mizani Backup Validation', () => {
  const validBackup: MizaniBackupData = {
    app: 'MIZANI_FINANCE_MANAGER',
    version: '1.0.0',
    schemaVersion: 1,
    exportDate: new Date().toISOString(),
    preferences: {} as any,
    accounts: [{ id: 'a1' } as any],
    categories: [],
    transactions: [{ id: 't1' } as any],
    budgets: [],
    debts: [],
    installments: [],
    savingsGoals: [],
    recurring: []
  };

  const res = validateMizaniBackup(JSON.stringify(validBackup));
  assert.equal(res.isValid, true);
  assert.equal(res.summary?.accountsCount, 1);
  assert.equal(res.summary?.transactionsCount, 1);

  // Reject alien app
  const alien = { ...validBackup, app: 'OTHER_APP' };
  const resAlien = validateMizaniBackup(JSON.stringify(alien));
  assert.equal(resAlien.isValid, false);
});
