import React, { useState } from 'react';
import { Plus, CreditCard, DollarSign, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatMoney } from '../../utils/money';
import type { Debt, DebtType } from '../../types/finance';

export const DebtsManager: React.FC = () => {
  const {
    debts,
    addDebt,
    deleteDebt,
    recordDebtPayment,
    accounts,
    currency,
    language,
    t
  } = useFinance();

  const [activeTab, setActiveTab] = useState<DebtType>('i_owe');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [paymentModalDebt, setPaymentModalDebt] = useState<Debt | null>(null);

  // Form states for new debt
  const [personOrInstitution, setPersonOrInstitution] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]);
  const [monthlyInstallment, setMonthlyInstallment] = useState('');
  const [notes, setNotes] = useState('');

  // Payment form states
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentAccountId, setPaymentAccountId] = useState(accounts[0]?.id || '');
  const [paymentNotes, setPaymentNotes] = useState('');

  const filteredDebts = debts.filter(d => d.type === activeTab);
  const totalBalance = filteredDebts.reduce((sum, d) => sum + d.outstandingBalance, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(originalAmount);
    if (isNaN(amount) || amount <= 0 || !personOrInstitution.trim()) return;

    addDebt({
      personOrInstitution: personOrInstitution.trim(),
      type: activeTab,
      originalAmount: amount,
      startDate,
      dueDate,
      monthlyInstallment: monthlyInstallment ? parseFloat(monthlyInstallment) : undefined,
      status: 'active',
      notes: notes.trim() || undefined
    });

    setIsAddModalOpen(false);
    setPersonOrInstitution('');
    setOriginalAmount('');
    setMonthlyInstallment('');
    setNotes('');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalDebt) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || !paymentAccountId) return;

    recordDebtPayment(paymentModalDebt.id, amount, paymentAccountId, paymentNotes);
    setPaymentModalDebt(null);
    setPaymentAmount('');
    setPaymentNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t('debts')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تدبير الديون والالتزامات: ما عليّ للغير وما لي عند الآخرين مع سجل الأداءات.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سجل دين</span>
        </button>
      </div>

      {/* Tabs Switcher: I Owe vs Owed To Me */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
        <button
          onClick={() => setActiveTab('i_owe')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'i_owe'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{t('iOwe')}</span>
        </button>
        <button
          onClick={() => setActiveTab('owed_to_me')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'owed_to_me'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{t('owedToMe')}</span>
        </button>

        <div className="mr-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
          المجموع المتبقي: <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{formatMoney(totalBalance, currency, language)}</span>
        </div>
      </div>

      {/* Debts Grid */}
      {filteredDebts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400 text-sm">
          لا توجد ديون مسجلة في هذا القسم حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDebts.map(debt => {
            const isFullyPaid = debt.status === 'fully_paid';
            const progress = debt.originalAmount > 0
              ? Math.round(((debt.originalAmount - debt.outstandingBalance) / debt.originalAmount) * 100)
              : 100;

            return (
              <div
                key={debt.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-base text-slate-900 dark:text-white truncate">
                      {debt.personOrInstitution}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isFullyPaid
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {debt.status === 'fully_paid' ? 'تم السداد' : (debt.status === 'partially_paid' ? 'سداد جزئي' : 'مستحق')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex justify-between">
                      <span>المبلغ الأصلي:</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {formatMoney(debt.originalAmount, currency, language)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>المتبقي في الذمة:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {formatMoney(debt.outstandingBalance, currency, language)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>تاريخ الاستحقاق:</span>
                      <span>{debt.dueDate}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFullyPaid ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 text-left mb-4">
                    تم سداد {progress}%
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  {!isFullyPaid && (
                    <button
                      onClick={() => {
                        setPaymentModalDebt(debt);
                        setPaymentAmount(String(debt.outstandingBalance));
                      }}
                      className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                      تسجيل دفعة سداد
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من حذف سجل الدين هذا؟')) {
                        deleteDebt(debt.id);
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

      {/* Add Debt Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              إضافة دين جديد ({activeTab === 'i_owe' ? 'دين عليّ' : 'دين لي عند الغير'})
            </h2>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الطرف المعني (شخص أو مؤسسة/بنك) *
                </label>
                <input
                  type="text"
                  required
                  value={personOrInstitution}
                  onChange={e => setPersonOrInstitution(e.target.value)}
                  placeholder="مثال: البنك، الصديق أحمد..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  المبلغ الأصلي *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={originalAmount}
                  onChange={e => setOriginalAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ البداية
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
                    أجل الاستحقاق
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  القسط الشهري المتوقع (اختياري)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={monthlyInstallment}
                  onChange={e => setMonthlyInstallment(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
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
                  حفظ الدين
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Registration Modal */}
      {paymentModalDebt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              تسجيل دفعة سداد: {paymentModalDebt.personOrInstitution}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              المتبقي حالياً: {formatMoney(paymentModalDebt.outstandingBalance, currency, language)}
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  المبلغ المدفوع *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الحساب المالي المستخدم *
                </label>
                <select
                  value={paymentAccountId}
                  onChange={e => setPaymentAccountId(e.target.value)}
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
                  بيان أو ملاحظات
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  placeholder="دفعة جزئية، سداد نهائي..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setPaymentModalDebt(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl"
                >
                  تأكيد وتحديث الرصيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
