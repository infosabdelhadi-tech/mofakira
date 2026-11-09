import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatMoney } from '../../utils/money';

export const BudgetsManager: React.FC = () => {
  const {
    budgetStatuses,
    addBudget,
    deleteBudget,
    categories,
    selectedMonth,
    currency,
    language,
    t
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [alertThreshold] = useState('80');
  const [allowCarryOver] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !name.trim()) return;

    addBudget({
      name: name.trim(),
      amount: numAmount,
      period: 'monthly',
      month: selectedMonth,
      year: new Date().getFullYear(),
      categoryId: categoryId || undefined,
      alertThreshold: parseInt(alertThreshold) || 80,
      allowCarryOver
    });

    setIsAddModalOpen(false);
    setName('');
    setAmount('');
    setCategoryId('');
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t('budgets')} لشهر ({selectedMonth})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            وضع سقوف للإنفاق الشهري وتتبع نسبة استهلاك الميزانيات بدقة وتجنب الإفراط.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>تحديد ميزانية جديدة</span>
        </button>
      </div>

      {/* Budgets Grid */}
      {budgetStatuses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400 text-sm">
          لم يتم تحديد أي ميزانية لشهر {selectedMonth}. حدد ميزانية للمصاريف للتحكم في أموالك.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetStatuses.map(({ budget, spent, remaining, percentage, status }) => {
            const isExceeded = status === 'exceeded';
            const isCritical = status === 'critical';
            const isWarning = status === 'warning';

            return (
              <div
                key={budget.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-base text-slate-900 dark:text-white truncate">
                      {budget.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isExceeded
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : isCritical
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : isWarning
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {isExceeded ? 'تم تجاوز الميزانية!' : (isCritical ? 'حرج (>90%)' : (isWarning ? 'تنبيه (>70%)' : 'آمن'))}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex justify-between">
                      <span>السقف المحدد:</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {formatMoney(budget.amount, currency, language)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>المصروف الفعلي:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {formatMoney(spent, currency, language)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>المتبقي:</span>
                      <span className={`font-mono font-bold ${remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatMoney(remaining, currency, language)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isExceeded ? 'bg-rose-600' : (isCritical ? 'bg-amber-500' : 'bg-emerald-500')
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 text-left mb-2">
                    تم استهلاك {percentage}%
                  </div>
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من حذف هذه الميزانية؟')) {
                        deleteBudget(budget.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              تحديد سقف ميزانية لشهر {selectedMonth}
            </h2>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  اسم أو عنوان الميزانية *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: ميزانية التغذية، الميزانية العامة..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  السقف المالي (الحد الأقصى) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ربط بتصنيف مصاريف محدد (اختياري)
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="">-- الميزانية الشهرية العامة (كل المصاريف) --</option>
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl"
                >
                  حفظ الميزانية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
