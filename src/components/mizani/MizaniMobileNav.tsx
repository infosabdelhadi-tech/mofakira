import React, { useState } from 'react';
import {
  LayoutDashboard,
  ArrowRightLeft,
  PieChart,
  CreditCard,
  Calendar,
  PiggyBank,
  Wallet,
  Settings,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { useFinance, type MizaniTab } from '../../context/FinanceContext';

export const MizaniMobileNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsTransactionModalOpen,
    t
  } = useFinance();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleTab = (tab: MizaniTab) => {
    setActiveTab(tab);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsTransactionModalOpen(true)}
        className="md:hidden fixed left-5 bottom-20 z-40 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40 flex items-center justify-center active:scale-95 transition-all"
        title="إضافة معاملة"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* More Sheet on Mobile */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex flex-col justify-end p-4 pb-24 md:hidden"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-1 animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-xs font-semibold text-slate-400 px-3 py-1">الأقسام المالية:</div>

            <button
              onClick={() => handleTab('budgets')}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl"
            >
              <PieChart className="w-5 h-5 text-indigo-600" />
              <span>{t('budgets')}</span>
            </button>

            <button
              onClick={() => handleTab('savings')}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl"
            >
              <PiggyBank className="w-5 h-5 text-purple-600" />
              <span>{t('savings')}</span>
            </button>

            <button
              onClick={() => handleTab('accounts')}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl"
            >
              <Wallet className="w-5 h-5 text-blue-600" />
              <span>{t('accounts')}</span>
            </button>

            <button
              onClick={() => handleTab('reports')}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl"
            >
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>{t('reports')}</span>
            </button>

            <button
              onClick={() => handleTab('settings')}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl"
            >
              <Settings className="w-5 h-5 text-slate-500" />
              <span>{t('settings')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 transition-colors">
        <div className="grid grid-cols-5 items-center">
          <button
            onClick={() => handleTab('dashboard')}
            className={`flex flex-col items-center py-1 transition-colors ${
              activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t('dashboard')}</span>
          </button>

          <button
            onClick={() => handleTab('transactions')}
            className={`flex flex-col items-center py-1 transition-colors ${
              activeTab === 'transactions' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <ArrowRightLeft className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t('transactions')}</span>
          </button>

          <button
            onClick={() => handleTab('debts')}
            className={`flex flex-col items-center py-1 transition-colors ${
              activeTab === 'debts' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t('debts')}</span>
          </button>

          <button
            onClick={() => handleTab('installments')}
            className={`flex flex-col items-center py-1 transition-colors ${
              activeTab === 'installments' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t('installments')}</span>
          </button>

          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex flex-col items-center py-1 transition-colors ${
              isMoreOpen || activeTab === 'budgets' || activeTab === 'savings' || activeTab === 'accounts' || activeTab === 'reports' || activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-1">المزيد</span>
          </button>
        </div>
      </nav>
    </>
  );
};
