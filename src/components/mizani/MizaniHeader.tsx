import React from 'react';
import {
  Wallet,
  Sun,
  Moon,
  Plus,
  GraduationCap
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../utils/money';

export const MizaniHeader: React.FC<{ onSwitchToSchool?: () => void }> = ({ onSwitchToSchool }) => {
  const {
    kpis,
    currency,
    language,
    setLanguage,
    setIsTransactionModalOpen,
    t
  } = useFinance();

  const { isDarkMode, toggleDarkMode } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* App Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                {t('appName')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                PRO
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">
              {t('appTagline')}
            </p>
          </div>
        </div>

        {/* Balance Badge & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Balance display */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t('availableBalance')}:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {formatMoney(kpis.netAvailableBalance, currency, language)}
            </span>
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="تبديل الوضع الليلي / النهاري"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Switch to Educational Planner button if available */}
          {onSwitchToSchool && (
            <button
              onClick={onSwitchToSchool}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-xl text-xs font-semibold border border-teal-200 dark:border-teal-800 transition-colors"
              title="التبديل إلى مفكرة الإدارة التربوية"
            >
              <GraduationCap className="w-4 h-4" />
              <span>مفكرة الإدارة</span>
            </button>
          )}

          {/* Quick Transaction Action */}
          <button
            onClick={() => setIsTransactionModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-md text-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">معاملة جديدة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
