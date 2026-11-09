import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatMoney, formatPercentage } from '../../utils/money';
import { calculateTotalIncome, calculateTotalExpenses, calculateSavingsRate } from '../../services/financialCalculations';
import * as XLSX from 'xlsx';

export const ReportsManager: React.FC = () => {
  const {
    transactions,
    categories,
    currency,
    language,
    selectedMonth,
    t
  } = useFinance();

  const [reportType, setReportType] = useState<'monthly' | 'annual' | 'custom'>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Category map
  const catMap = new Map<string, string>();
  categories.forEach(c => catMap.set(c.id, c.name));

  // Filter transactions for report
  const reportTransactions = transactions.filter(t => {
    if (reportType === 'monthly') return t.date.startsWith(selectedMonth);
    if (reportType === 'annual') return t.date.startsWith(String(selectedYear));
    if (reportType === 'custom') {
      if (customStart && t.date < customStart) return false;
      if (customEnd && t.date > customEnd) return false;
      return true;
    }
    return true;
  });

  const totalIncome = calculateTotalIncome(reportTransactions);
  const totalExpenses = calculateTotalExpenses(reportTransactions);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

  // Group by category
  const expenseByCategory: Record<string, number> = {};
  reportTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expenseByCategory[t.categoryId] = (expenseByCategory[t.categoryId] || 0) + t.amount;
    });

  const categorySummaryList = Object.entries(expenseByCategory).map(([catId, amount]) => ({
    name: catMap.get(catId) || 'أخرى',
    amount,
    percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  // Export Excel Full Financial Report
  const handleExportFullReport = () => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: General Summary
    const summaryData = [
      { 'البند': 'الفترة المالية', 'القيمة': reportType === 'monthly' ? selectedMonth : String(selectedYear) },
      { 'البند': 'إجمالي المداخيل', 'القيمة': totalIncome },
      { 'البند': 'إجمالي المصاريف', 'القيمة': totalExpenses },
      { 'البند': 'الرصيد الصافي للوفر', 'القيمة': netSavings },
      { 'البند': 'معدل الادخار', 'القيمة': `${savingsRate}%` }
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص المالي العام');

    // Sheet 2: Expenses by Category
    const categoryData = categorySummaryList.map(c => ({
      'التصنيف': c.name,
      'المبلغ': c.amount,
      'النسبة المئوية': `${c.percentage}%`
    }));
    const categorySheet = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'توزيع المصاريف');

    // Sheet 3: Detailed Transactions
    const txData = reportTransactions.map(t => ({
      'المعرف': t.id,
      'التاريخ': t.date,
      'الوصف': t.description,
      'النوع': t.type,
      'المبلغ': t.amount,
      'التصنيف': catMap.get(t.categoryId) || '',
      'طريقة الدفع': t.paymentMethod,
      'الجهة': t.personOrEntity || '',
      'ملاحظات': t.notes || ''
    }));
    const txSheet = XLSX.utils.json_to_sheet(txData);
    XLSX.utils.book_append_sheet(workbook, txSheet, 'بيان المعاملات التفصيلي');

    XLSX.writeFile(workbook, `mizani_financial_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Print/Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t('reports')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تقارير وإحصائيات مالية دورية وشاملة قابلة للطباعة والتصدير بصيغة Excel و PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportFullReport}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('exportExcel')}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t('print')}</span>
          </button>
        </div>
      </div>

      {/* Filter Period Switcher */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span>نوع التقرير:</span>
          <select
            value={reportType}
            onChange={e => setReportType(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          >
            <option value="monthly">تقرير شهري</option>
            <option value="annual">تقرير سنوي شامل</option>
            <option value="custom">نطاق زمني مخصص</option>
          </select>
        </div>

        {reportType === 'monthly' && (
          <div className="flex items-center gap-2">
            <span>الشهر المالي:</span>
            <input
              type="month"
              value={selectedMonth}
              readOnly
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>
        )}

        {reportType === 'annual' && (
          <div className="flex items-center gap-2">
            <span>السنة المالية:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            >
              {[2023, 2024, 2025, 2026, 2027].map(yr => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        )}

        {reportType === 'custom' && (
          <div className="flex items-center gap-2">
            <span>من:</span>
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
            <span>إلى:</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>
        )}
      </div>

      {/* Summary 4-Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs text-slate-400 mb-1">إجمالي المداخيل</div>
          <div className="text-xl font-bold font-mono text-emerald-600">
            {formatMoney(totalIncome, currency, language)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs text-slate-400 mb-1">إجمالي المصاريف</div>
          <div className="text-xl font-bold font-mono text-rose-600">
            {formatMoney(totalExpenses, currency, language)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs text-slate-400 mb-1">الفائض / الوفر الصافي</div>
          <div className={`text-xl font-bold font-mono ${netSavings >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {formatMoney(netSavings, currency, language)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs text-slate-400 mb-1">معدل الادخار</div>
          <div className="text-xl font-bold font-mono text-purple-600">
            {formatPercentage(savingsRate, language)}
          </div>
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          بيان المصاريف حسب التصنيف للفترة المحددة
        </h3>

        {categorySummaryList.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            لا توجد مصاريف مسجلة لهذه الفترة.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
            {categorySummaryList.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div className="font-semibold text-slate-700 dark:text-slate-200">
                  {item.name}
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatMoney(item.amount, currency, language)} ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
