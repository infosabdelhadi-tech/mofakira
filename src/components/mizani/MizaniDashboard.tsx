import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CreditCard,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatMoney, formatPercentage } from '../../utils/money';
import { calculateMonthlyAggregates, calculateCategorySpending } from '../../services/financialCalculations';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const MizaniDashboard: React.FC = () => {
  const {
    kpis,
    currency,
    language,
    t,
    transactions,
    categories,
    installmentPlans,
    selectedMonth,
    setSelectedMonth,
    setIsTransactionModalOpen,
    setActiveTab
  } = useFinance();

  // Monthly aggregates for Bar Chart
  const monthlyData = useMemo(() => {
    return calculateMonthlyAggregates(transactions, 6);
  }, [transactions]);

  // Category spending for Pie Chart
  const categoryMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    categories.forEach(c => map.set(c.id, { name: c.name, color: c.color }));
    return map;
  }, [categories]);

  const categorySpending = useMemo(() => {
    return calculateCategorySpending(transactions, categoryMap, selectedMonth);
  }, [transactions, categoryMap, selectedMonth]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .slice(0, 5);
  }, [transactions]);

  // Upcoming / Overdue installments
  const pendingInstallments = useMemo(() => {
    const items: { planTitle: string; dueDate: string; amount: number; isOverdue: boolean }[] = [];
    const today = new Date().toISOString().split('T')[0];

    installmentPlans.forEach(plan => {
      plan.schedule
        .filter(s => s.status !== 'paid')
        .forEach(s => {
          items.push({
            planTitle: plan.title,
            dueDate: s.dueDate,
            amount: s.amount,
            isOverdue: s.dueDate < today
          });
        });
    });

    return items.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  }, [installmentPlans]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Date Switcher and Quick Action */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedMonth}</span>
              </span>
              <span className="text-xs text-slate-400">
                {t('appName')} — {t('appTagline')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('dashboard')}
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              نظرة مالية شاملة وفورية لحساباتك، مداخيلك، مصاريفك، والتزامات الديون وأهداف التوفير.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="month"
              value={selectedMonth}
              onChange={e => e.target.value && setSelectedMonth(e.target.value)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium px-3 py-2 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={() => setIsTransactionModalOpen(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>معاملة جديدة</span>
            </button>
          </div>
        </div>

        {/* Ambient lighting effects */}
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* 8 Financial KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Income */}
        <div
          onClick={() => setActiveTab('income')}
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('totalIncome')}</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatMoney(kpis.totalIncome, currency, language)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{t('thisMonth')}</div>
        </div>

        {/* 2. Total Expenses */}
        <div
          onClick={() => setActiveTab('expenses')}
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('totalExpenses')}</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {formatMoney(kpis.totalExpenses, currency, language)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{t('thisMonth')}</div>
        </div>

        {/* 3. Available Balance */}
        <div
          onClick={() => setActiveTab('accounts')}
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('availableBalance')}</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {formatMoney(kpis.netAvailableBalance, currency, language)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">كافة الحسابات والمحافظ</div>
        </div>

        {/* 4. Total Savings */}
        <div
          onClick={() => setActiveTab('savings')}
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('totalSavings')}</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {formatMoney(kpis.totalSavings, currency, language)}
          </div>
          <div className="text-[11px] text-purple-500 mt-1">معدل الادخار: {formatPercentage(kpis.monthlySavingsRate, language)}</div>
        </div>

        {/* 5. Debts I Owe */}
        <div
          onClick={() => setActiveTab('debts')}
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('debtsOwedByMe')}</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {formatMoney(kpis.totalDebtsOwedByMe, currency, language)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">التزامات وقروض قائمة</div>
        </div>

        {/* 6. Money Owed To Me */}
        <div
          onClick={() => setActiveTab('debts')}
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('debtsOwedToMe')}</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-teal-600 dark:text-teal-400 font-mono">
            {formatMoney(kpis.totalDebtsOwedToMe, currency, language)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">مستحقات عند الآخرين</div>
        </div>

        {/* 7. Remaining Monthly Budget */}
        <div
          onClick={() => setActiveTab('budgets')}
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('remainingBudget')}</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
            {formatMoney(kpis.remainingBudget, currency, language)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">استهلاك: {kpis.budgetConsumptionRate}%</div>
        </div>

        {/* 8. Monthly Savings Rate */}
        <div
          onClick={() => setActiveTab('savings')}
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('savingsRate')}</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {formatPercentage(kpis.monthlySavingsRate, language)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">من الدخل الصافي</div>
        </div>
      </div>

      {/* Visual Charts: Bar Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                تطور المداخيل والمصاريف (آخر 6 أشهر)
              </h3>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey={language === 'ar' ? 'labelAr' : (language === 'fr' ? 'labelFr' : 'labelEn')} stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  formatter={(val: any) => formatMoney(Number(val) || 0, currency, language)}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="income" name="المداخيل" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="المصاريف" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                توزيع المصاريف حسب التصنيف
              </h3>
            </div>
          </div>

          {categorySpending.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
              <span>لا توجد مصاريف مسجلة لشهر {selectedMonth}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpending}
                      dataKey="amount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatMoney(Number(val) || 0, currency, language)}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {categorySpending.slice(0, 4).map(cat => (
                  <div key={cat.categoryId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{cat.categoryName}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatMoney(cat.amount, currency, language)} ({cat.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions & Upcoming Installments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              آخر المعاملات المسجلة
            </h3>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>{t('viewAll')}</span>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              {t('emptyTransactions')}
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTransactions.map(tItem => {
                const isIncome = tItem.type === 'income' || tItem.type === 'loan_received' || tItem.type === 'refund';
                return (
                  <div
                    key={tItem.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isIncome ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'}`}>
                        {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">
                          {tItem.description}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span>{tItem.date}</span>
                          {tItem.personOrEntity && <span>• {tItem.personOrEntity}</span>}
                        </div>
                      </div>
                    </div>

                    <div className={`font-mono font-bold text-sm ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isIncome ? '+' : '-'}{formatMoney(tItem.amount, currency, language)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Installments & Debt Alerts */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              الأقساط والالتزامات القادمة
            </h3>
            <button
              onClick={() => setActiveTab('installments')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>{t('viewAll')}</span>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>

          {pendingInstallments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              لا توجد أقساط مستحقة قريبة. أمورك المالية ممتازة!
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingInstallments.map((inst, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                    inst.isOverdue
                      ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
                      : 'bg-slate-50 dark:bg-slate-700/40 border-slate-200/60 dark:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {inst.planTitle}
                      </span>
                      {inst.isOverdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                          متأخر
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      تاريخ الاستحقاق: {inst.dueDate}
                    </div>
                  </div>

                  <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {formatMoney(inst.amount, currency, language)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
