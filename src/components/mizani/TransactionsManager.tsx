import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatMoney } from '../../utils/money';
import * as XLSX from 'xlsx';

export const TransactionsManager: React.FC = () => {
  const {
    transactions,
    categories,
    accounts,
    deleteTransaction,
    setEditingTransaction,
    setIsTransactionModalOpen,
    currency,
    language,
    t
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Categories map
  const catMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(c => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Accounts map
  const accMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach(a => map.set(a.id, a.name));
    return map;
  }, [accounts]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;
      if (accountFilter !== 'all' && tx.accountId !== accountFilter && tx.toAccountId !== accountFilter) return false;
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const descMatch = tx.description.toLowerCase().includes(query);
        const personMatch = tx.personOrEntity?.toLowerCase().includes(query);
        const notesMatch = tx.notes?.toLowerCase().includes(query);
        if (!descMatch && !personMatch && !notesMatch) return false;
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, typeFilter, categoryFilter, accountFilter, startDate, endDate, searchQuery]);

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredTransactions.map(tx => ({
      'المعرف': tx.id,
      'التاريخ': tx.date,
      'الوصف': tx.description,
      'النوع': tx.type,
      'المبلغ': tx.amount,
      'التصنيف': catMap.get(tx.categoryId) || '',
      'الحساب': accMap.get(tx.accountId) || '',
      'إلى حساب': tx.toAccountId ? accMap.get(tx.toAccountId) || '' : '',
      'طريقة الدفع': tx.paymentMethod,
      'الجهة المعنية': tx.personOrEntity || '',
      'ملاحظات': tx.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المعاملات المالية');
    XLSX.writeFile(workbook, `mizani_transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID,Date,Description,Type,Amount,Category,Account,PaymentMethod,Entity,Notes'];
    const rows = filteredTransactions.map(t =>
      `"${t.id}","${t.date}","${t.description.replace(/"/g, '""')}","${t.type}",${t.amount},"${catMap.get(t.categoryId) || ''}","${accMap.get(t.accountId) || ''}","${t.paymentMethod}","${t.personOrEntity || ''}","${t.notes || ''}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mizani_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t('transactions')} ({filteredTransactions.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            سجل موحد وشامل لكافة المداخيل والمصاريف والتحويلات وسداد الديون.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('exportExcel')}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t('print')}</span>
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة معاملة</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 rtl:left-auto rtl:right-3.5 ltr:right-auto ltr:left-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالوصف، الجهة، أو الملاحظات..."
              className="w-full px-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل الأنواع</option>
              <option value="expense">{t('typeExpense')}</option>
              <option value="income">{t('typeIncome')}</option>
              <option value="transfer">{t('typeTransfer')}</option>
              <option value="debt_payment">{t('typeDebtPayment')}</option>
              <option value="loan_received">{t('typeLoanReceived')}</option>
              <option value="money_lent">{t('typeMoneyLent')}</option>
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={accountFilter}
              onChange={e => setAccountFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل الحسابات</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل التصنيفات</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date range filters */}
        <div className="flex items-center gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-700/60 flex-wrap">
          <span className="text-slate-400 font-medium">النطاق الزمني:</span>
          <div className="flex items-center gap-2">
            <span>من:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>إلى:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>
          {(startDate || endDate || searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || accountFilter !== 'all') && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
                setTypeFilter('all');
                setCategoryFilter('all');
                setAccountFilter('all');
              }}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline mr-auto"
            >
              إلغاء التصفية
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            لا توجد معاملات مطابقة للبحث أو التصفية المختارة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">الوصف</th>
                  <th className="py-3 px-4">النوع</th>
                  <th className="py-3 px-4">التصنيف</th>
                  <th className="py-3 px-4">الحساب</th>
                  <th className="py-3 px-4">المبلغ</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredTransactions.map(tx => {
                  const isIncome = tx.type === 'income' || tx.type === 'loan_received' || tx.type === 'refund';
                  const isTransfer = tx.type === 'transfer';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {tx.description}
                        </div>
                        {tx.personOrEntity && (
                          <div className="text-[11px] text-slate-400">
                            {tx.personOrEntity}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isIncome
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : isTransfer
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {isIncome && <ArrowDownLeft className="w-3 h-3" />}
                          {!isIncome && !isTransfer && <ArrowUpRight className="w-3 h-3" />}
                          {isTransfer && <ArrowRightLeft className="w-3 h-3" />}
                          <span>
                            {tx.type === 'income' ? t('typeIncome')
                              : tx.type === 'expense' ? t('typeExpense')
                              : tx.type === 'transfer' ? t('typeTransfer')
                              : tx.type === 'debt_payment' ? t('typeDebtPayment')
                              : tx.type === 'loan_received' ? t('typeLoanReceived')
                              : tx.type === 'money_lent' ? t('typeMoneyLent')
                              : t('typeRefund')}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {catMap.get(tx.categoryId) || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {accMap.get(tx.accountId)}
                        {tx.toAccountId && ` ➔ ${accMap.get(tx.toAccountId)}`}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : (isTransfer ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400')}>
                          {isIncome ? '+' : (isTransfer ? '' : '-')}{formatMoney(tx.amount, currency, language)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingTransaction(tx);
                              setIsTransactionModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                            title={t('edit')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(t('confirmDelete'))) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
