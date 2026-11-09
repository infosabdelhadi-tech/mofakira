import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import type { TransactionType, PaymentMethod } from '../../types/finance';

export const TransactionModal: React.FC = () => {
  const {
    isTransactionModalOpen,
    setIsTransactionModalOpen,
    editingTransaction,
    setEditingTransaction,
    addTransaction,
    updateTransaction,
    categories,
    accounts,
    t
  } = useFinance();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [personOrEntity, setPersonOrEntity] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(String(editingTransaction.amount));
      setType(editingTransaction.type);
      setCategoryId(editingTransaction.categoryId);
      setAccountId(editingTransaction.accountId);
      setToAccountId(editingTransaction.toAccountId || '');
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setPersonOrEntity(editingTransaction.personOrEntity || '');
      setNotes(editingTransaction.notes || '');
    } else {
      setDescription('');
      setAmount('');
      setType('expense');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('cash');
      setPersonOrEntity('');
      setNotes('');
      // Set defaults for categories and accounts
      if (accounts.length > 0) setAccountId(accounts[0].id);
      if (categories.length > 0) {
        const defaultCat = categories.find(c => c.type === 'expense') || categories[0];
        setCategoryId(defaultCat.id);
      }
    }
    setError(null);
  }, [editingTransaction, isTransactionModalOpen, categories, accounts]);

  if (!isTransactionModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('يرجى إدخال مبلغ مالي صحيح أكبر من الصفر.');
      return;
    }
    if (!description.trim()) {
      setError('يرجى كتابة وصف أو بيان للمعاملة.');
      return;
    }
    if (!accountId) {
      setError('يرجى تحديد الحساب المالي.');
      return;
    }
    if (type === 'transfer' && (!toAccountId || toAccountId === accountId)) {
      setError('يرجى تحديد حساب مختلف للتحويل إليه.');
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        description: description.trim(),
        amount: numAmount,
        type,
        categoryId: type === 'transfer' ? (categories[0]?.id || '') : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        paymentMethod,
        personOrEntity: personOrEntity.trim() || undefined,
        notes: notes.trim() || undefined
      });
    } else {
      addTransaction({
        description: description.trim(),
        amount: numAmount,
        type,
        categoryId: type === 'transfer' ? (categories[0]?.id || '') : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        paymentMethod,
        personOrEntity: personOrEntity.trim() || undefined,
        notes: notes.trim() || undefined
      });
    }

    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const filteredCategories = categories.filter(c => {
    if (type === 'income') return c.type === 'income';
    if (type === 'expense') return c.type === 'expense';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingTransaction ? 'تعديل المعاملة المالية' : 'إضافة معاملة مالية جديدة'}
          </h2>
          <button
            onClick={() => {
              setIsTransactionModalOpen(false);
              setEditingTransaction(null);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Transaction Type Segmented Control */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const defaultCat = categories.find(c => c.type === 'expense');
                if (defaultCat) setCategoryId(defaultCat.id);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('typeExpense')}
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const defaultCat = categories.find(c => c.type === 'income');
                if (defaultCat) setCategoryId(defaultCat.id);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('typeIncome')}
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'transfer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('typeTransfer')}
            </button>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('amount')} *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('date')} *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('description')} *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="مثال: تسوق أسبوعي، فاتورة هاتف، راتب..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {type !== 'transfer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('category')} *
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {filteredCategories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {type === 'transfer' ? 'من الحساب' : t('account')} *
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('toAccount')} *
                </label>
                <select
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- اختر الحساب المستلم --</option>
                  {accounts
                    .filter(a => a.id !== accountId)
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Payment Method & Person/Entity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('paymentMethod')}
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="cash">نقداً (Cash)</option>
                <option value="card">بطاقة بنكية (Carte)</option>
                <option value="bank_transfer">تحويل بنكي (Virement)</option>
                <option value="cheque">شيك (Chèque)</option>
                <option value="digital_wallet">محفظة رقمية (Wallet)</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('personOrEntity')}
              </label>
              <input
                type="text"
                value={personOrEntity}
                onChange={e => setPersonOrEntity(e.target.value)}
                placeholder="اسم المتجر، الشخص أو المؤسسة"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('notes')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="تفاصيل إضافية..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsTransactionModalOpen(false);
                setEditingTransaction(null);
              }}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{t('save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
