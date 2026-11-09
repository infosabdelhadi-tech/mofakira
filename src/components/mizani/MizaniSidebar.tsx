import React from 'react';
import {
  LayoutDashboard,
  ArrowRightLeft,
  PieChart,
  CreditCard,
  Calendar,
  PiggyBank,
  Wallet,
  Settings,
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import { useFinance, type MizaniTab } from '../../context/FinanceContext';

export const MizaniSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsTransactionModalOpen,
    transactions,
    debts,
    installmentPlans,
    t
  } = useFinance();

  const navItems: { id: MizaniTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'transactions',
      label: t('transactions'),
      icon: <ArrowRightLeft className="w-5 h-5" />,
      badge: transactions.length
    },
    {
      id: 'budgets',
      label: t('budgets'),
      icon: <PieChart className="w-5 h-5" />
    },
    {
      id: 'debts',
      label: t('debts'),
      icon: <CreditCard className="w-5 h-5" />,
      badge: debts.filter(d => d.status !== 'fully_paid').length
    },
    {
      id: 'installments',
      label: t('installments'),
      icon: <Calendar className="w-5 h-5" />,
      badge: installmentPlans.length
    },
    {
      id: 'savings',
      label: t('savings'),
      icon: <PiggyBank className="w-5 h-5" />
    },
    {
      id: 'accounts',
      label: t('accounts'),
      icon: <Wallet className="w-5 h-5" />
    },
    {
      id: 'reports',
      label: t('reports'),
      icon: <FileSpreadsheet className="w-5 h-5" />
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 shrink-0 transition-colors">
      {/* Quick Add Action Button */}
      <button
        onClick={() => setIsTransactionModalOpen(true)}
        className="w-full mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-2.5 px-4 rounded-2xl shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>معاملة جديدة</span>
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-medium text-xs sm:text-sm transition-all text-right ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                    isActive ? 'bg-blue-800' : 'bg-slate-400 dark:bg-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
