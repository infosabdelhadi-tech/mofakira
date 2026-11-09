import React, { useState } from 'react';
import { Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatMoney } from '../../utils/money';

export const InstallmentsManager: React.FC = () => {
  const {
    installmentPlans,
    addInstallmentPlan,
    markInstallmentPaid,
    deleteInstallmentPlan,
    accounts,
    currency,
    language,
    t
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [numberOfInstallments, setNumberOfInstallments] = useState('12');
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'weekly' | 'quarterly'>('monthly');
  const [firstPaymentDate, setFirstPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(totalAmount);
    const count = parseInt(numberOfInstallments);
    if (isNaN(amount) || amount <= 0 || isNaN(count) || count <= 0 || !title.trim() || !accountId) return;

    addInstallmentPlan({
      title: title.trim(),
      totalAmount: amount,
      numberOfInstallments: count,
      paymentFrequency,
      firstPaymentDate,
      accountId
    });

    setIsAddModalOpen(false);
    setTitle('');
    setTotalAmount('');
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t('installments')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            جدولة وتتبع الأقساط الشهرية، القروض الاستهلاكية والتمويلات مع جدول زمني دقيق.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>خطة تقسيط جديدة</span>
        </button>
      </div>

      {/* Plans List */}
      {installmentPlans.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400 text-sm">
          لا توجد خطط تقسيط مسجلة حالياً.
        </div>
      ) : (
        <div className="space-y-6">
          {installmentPlans.map(plan => {
            const paidCount = plan.schedule.filter(s => s.status === 'paid').length;
            const progress = Math.round((paidCount / plan.numberOfInstallments) * 100);

            return (
              <div
                key={plan.id}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {plan.title}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      الإجمالي: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{formatMoney(plan.totalAmount, currency, language)}</span> • تم أداء {paidCount} من أصل {plan.numberOfInstallments} أقساط
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full">
                      {progress}% مكتمل
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف خطة التقسيط بالكامل؟')) {
                          deleteInstallmentPlan(plan.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="حذف الخطة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Schedule list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
                  {plan.schedule.map(item => {
                    const isPaid = item.status === 'paid';
                    const isOverdue = !isPaid && item.dueDate < todayStr;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
                          isPaid
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300'
                            : isOverdue
                            ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>القسط #{item.installmentNumber}</span>
                            {isPaid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {isOverdue && <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-semibold">متأخر</span>}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            الأجل: {item.dueDate}
                          </div>
                          <div className="font-mono font-bold mt-1 text-slate-900 dark:text-white">
                            {formatMoney(item.amount, currency, language)}
                          </div>
                        </div>

                        {!isPaid && (
                          <button
                            onClick={() => markInstallmentPaid(plan.id, item.id, plan.accountId)}
                            className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-xs"
                          >
                            أداء
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Plan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              إضافة خطة تقسيط جديدة
            </h2>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  اسم أو موضوع التقسيط *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: شراء هاتف، تمويل سيارة، أجهزة كهرومنزلية..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    المبلغ الإجمالي *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalAmount}
                    onChange={e => setTotalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    عدد الأقساط *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={numberOfInstallments}
                    onChange={e => setNumberOfInstallments(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ أول قسط
                  </label>
                  <input
                    type="date"
                    required
                    value={firstPaymentDate}
                    onChange={e => setFirstPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    دورية السداد
                  </label>
                  <select
                    value={paymentFrequency}
                    onChange={e => setPaymentFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="monthly">شهرياً</option>
                    <option value="weekly">أسبوعياً</option>
                    <option value="quarterly">كل 3 أشهر</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الحساب المالي المستخدم للدفع
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
                  إنشاء خطة الأقساط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
