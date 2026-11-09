import React, { useState } from 'react';
import { Plus, Wallet, ArrowRightLeft, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatMoney } from '../../utils/money';
import type { AccountType } from '../../types/finance';

export const AccountsManager: React.FC = () => {
  const {
    accounts,
    addAccount,
    deleteAccount,
    addTransaction,
    currency,
    language,
    t
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Form states for account
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [openingBalance, setOpeningBalance] = useState('');
  const [description, setDescription] = useState('');

  // Transfer states
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(openingBalance) || 0;
    if (!name.trim()) return;

    addAccount({
      name: name.trim(),
      type,
      currency,
      openingBalance: balance,
      description: description.trim() || undefined,
      isActive: true
    });

    setIsAddModalOpen(false);
    setName('');
    setOpeningBalance('');
    setDescription('');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0 || !fromAccountId || !toAccountId || fromAccountId === toAccountId) return;

    addTransaction({
      description: `تحويل رصيد داخلي`,
      amount,
      type: 'transfer',
      categoryId: 'cat-exp-other',
      accountId: fromAccountId,
      toAccountId,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      notes: transferNotes.trim() || undefined
    });

    setIsTransferModalOpen(false);
    setTransferAmount('');
    setTransferNotes('');
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t('accounts')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إدارة الحسابات البنكية، النقدية، المحافظ الرقمية وحسابات التوفير مع التحويل المباشر.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {accounts.length >= 2 && (
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>تحويل بين الحسابات</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حساب جديد</span>
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجمالي الأرصدة المتوفرة</div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
            {formatMoney(totalBalance, currency, language)}
          </div>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-2xl text-blue-600">
          <Wallet className="w-8 h-8" />
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => {
          return (
            <div
              key={acc.id}
              className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-base text-slate-900 dark:text-white">
                    {acc.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {acc.type === 'cash' ? 'سيولة نقدية' : (acc.type === 'bank' ? 'حساب بنكي' : 'حساب توفير')}
                  </span>
                </div>

                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mb-2">
                  {formatMoney(acc.currentBalance, currency, language)}
                </div>

                {acc.description && (
                  <p className="text-xs text-slate-400 mb-4">
                    {acc.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  onClick={() => {
                    if (window.confirm('هل تريد بالتأكيد حذف هذا الحساب؟')) {
                      deleteAccount(acc.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              إضافة حساب مالي جديد
            </h2>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  اسم الحساب *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: البنك الشعبي، كاش المنزل..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نوع الحساب
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as AccountType)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="bank">حساب بنكي جاري</option>
                  <option value="cash">نقود وسيولة (Cash)</option>
                  <option value="savings">حساب توفير وادخار</option>
                  <option value="digital_wallet">محفظة إلكترونية</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الرصيد الافتتاحي *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={openingBalance}
                  onChange={e => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الوصف أو الغرض
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="حساب توطين الراتب، محفظة يومية..."
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
                  حفظ الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              تحويل مالي بين الحسابات
            </h2>
            <form onSubmit={handleTransferSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  من الحساب *
                </label>
                <select
                  value={fromAccountId}
                  onChange={e => setFromAccountId(e.target.value)}
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
                  إلى الحساب *
                </label>
                <select
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  {accounts
                    .filter(a => a.id !== fromAccountId)
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatMoney(a.currentBalance, currency, language)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  مبلغ التحويل *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات
                </label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={e => setTransferNotes(e.target.value)}
                  placeholder="سحب نقد، تعبئة محفظة..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl"
                >
                  تأكيد التحويل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
