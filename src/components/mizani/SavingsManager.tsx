import React, { useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatMoney } from '../../utils/money';
import type { SavingsGoal, SavingsPriority } from '../../types/finance';

export const SavingsManager: React.FC = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    deleteSavingsGoal,
    contributeToSavingsGoal,
    accounts,
    currency,
    language,
    t
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdrawal'>('deposit');

  // Add goal form
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]);
  const [priority, setPriority] = useState<SavingsPriority>('high');
  const [notes, setNotes] = useState('');

  // Contribution form
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [contribNotes, setContribNotes] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0 || !name.trim()) return;

    addSavingsGoal({
      name: name.trim(),
      targetAmount: target,
      startDate,
      targetDate,
      priority,
      notes: notes.trim() || undefined
    });

    setIsAddModalOpen(false);
    setName('');
    setTargetAmount('');
    setNotes('');
  };

  const handleContribSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoal) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !accountId) return;

    contributeToSavingsGoal(contributeGoal.id, numAmount, accountId, actionType, contribNotes);
    setContributeGoal(null);
    setAmount('');
    setContribNotes('');
  };

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t('savings')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            صناديق الادخار والأهداف المالية الشخصية (طوارئ، شراء عقار، سيارة، عطلة...).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>هدف ادخار جديد</span>
        </button>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-3xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs text-purple-200">إجمالي المدخرات المحققة</div>
            <div className="text-3xl font-black font-mono mt-1">
              {formatMoney(totalSaved, currency, language)}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs text-purple-200">المبلغ المستهدف الإجمالي</div>
            <div className="text-xl font-bold font-mono text-purple-200 mt-1">
              {formatMoney(totalTarget, currency, language)}
            </div>
          </div>
        </div>

        <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden mb-2">
          <div
            className="bg-purple-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, overallProgress)}%` }}
          />
        </div>
        <div className="text-xs text-purple-200 text-left font-semibold">
          نسبة تحقيق الأهداف العامة: {overallProgress}%
        </div>
      </div>

      {/* Goals Grid */}
      {savingsGoals.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400 text-sm">
          لم تقم بإنشاء أي هدف ادخاري بعد. ابدأ الآن بتحديد أول هدف!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savingsGoals.map(goal => {
            const progress = goal.targetAmount > 0
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
              : 0;

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-base text-slate-900 dark:text-white truncate">
                      {goal.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        goal.priority === 'high'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {goal.priority === 'high' ? 'أولوية قصوى' : 'أولوية متوسطة'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex justify-between">
                      <span>المدخر حالياً:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                        {formatMoney(goal.currentAmount, currency, language)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>المستهدف:</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {formatMoney(goal.targetAmount, currency, language)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>الأجل المستهدف:</span>
                      <span>{goal.targetDate}</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 text-left mb-4">
                    مكتمل بنسبة {progress}%
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => {
                      setContributeGoal(goal);
                      setActionType('deposit');
                    }}
                    className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>إيداع توفير</span>
                  </button>

                  <button
                    onClick={() => {
                      setContributeGoal(goal);
                      setActionType('withdrawal');
                    }}
                    className="p-2 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"
                    title="سحب من المدخرات"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من حذف هذا الهدف الادخاري؟')) {
                        deleteSavingsGoal(goal.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              إنشاء هدف ادخاري جديد
            </h2>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  اسم الهدف *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: شراء سيارة، صندوق الطوارئ..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  المبلغ المستهدف *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ الانطلاق
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ الهدف
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الأولوية
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as SavingsPriority)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="high">عالية جداً (طوارئ/أساسي)</option>
                  <option value="medium">متوسطة (مشروع شخصي)</option>
                  <option value="low">منخفضة (ترفيهي)</option>
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
                  حفظ الهدف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {contributeGoal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {actionType === 'deposit' ? 'إيداع مالي في:' : 'سحب مالي من:'} {contributeGoal.name}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              الرصيد المحقق حالياً: {formatMoney(contributeGoal.currentAmount, currency, language)}
            </p>

            <form onSubmit={handleContribSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  المبلغ *
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
                  الحساب المالي المرتبط *
                </label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatMoney(a.currentBalance, currency, language)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  بيان أو ملاحظة
                </label>
                <input
                  type="text"
                  value={contribNotes}
                  onChange={e => setContribNotes(e.target.value)}
                  placeholder="إيداع شهري منتظم..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setContributeGoal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl ${
                    actionType === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  تأكيد المعاملة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
