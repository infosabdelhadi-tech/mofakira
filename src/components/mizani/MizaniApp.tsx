import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { MizaniHeader } from './MizaniHeader';
import { MizaniSidebar } from './MizaniSidebar';
import { MizaniMobileNav } from './MizaniMobileNav';
import { MizaniDashboard } from './MizaniDashboard';
import { TransactionsManager } from './TransactionsManager';
import { DebtsManager } from './DebtsManager';
import { InstallmentsManager } from './InstallmentsManager';
import { SavingsManager } from './SavingsManager';
import { BudgetsManager } from './BudgetsManager';
import { AccountsManager } from './AccountsManager';
import { ReportsManager } from './ReportsManager';
import { MizaniSettings } from './MizaniSettings';
import { TransactionModal } from './TransactionModal';

export const MizaniApp: React.FC<{ onSwitchToSchool?: () => void }> = ({ onSwitchToSchool }) => {
  const { activeTab } = useFinance();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-cairo">
      {/* Mizani Header */}
      <MizaniHeader onSwitchToSchool={onSwitchToSchool} />

      {/* Main Container */}
      <div className="flex-1 flex w-full max-w-none">
        {/* Desktop Sidebar */}
        <MizaniSidebar />

        {/* Dynamic Main View */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && <MizaniDashboard />}
          {activeTab === 'transactions' && <TransactionsManager />}
          {activeTab === 'income' && <TransactionsManager />}
          {activeTab === 'expenses' && <TransactionsManager />}
          {activeTab === 'budgets' && <BudgetsManager />}
          {activeTab === 'debts' && <DebtsManager />}
          {activeTab === 'installments' && <InstallmentsManager />}
          {activeTab === 'savings' && <SavingsManager />}
          {activeTab === 'accounts' && <AccountsManager />}
          {activeTab === 'reports' && <ReportsManager />}
          {activeTab === 'settings' && <MizaniSettings />}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MizaniMobileNav />

      {/* Transaction Modal */}
      <TransactionModal />
    </div>
  );
};
