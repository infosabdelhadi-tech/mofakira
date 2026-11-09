import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { FinanceProvider } from './context/FinanceContext';
import { MizaniApp } from './components/mizani/MizaniApp';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';

import { Dashboard } from './components/dashboard/Dashboard';
import { TaskManager } from './components/tasks/TaskManager';
import { TaskModal } from './components/tasks/TaskModal';
import { CalendarManager } from './components/calendar/CalendarManager';
import { AppointmentModal } from './components/calendar/AppointmentModal';
import { OperationsManager } from './components/operations/OperationsManager';
import { OperationModal } from './components/operations/OperationModal';
import { MeetingsManager } from './components/meetings/MeetingsManager';
import { MeetingModal } from './components/meetings/MeetingModal';
import { AnnualPlanManager } from './components/annual/AnnualPlanManager';
import { DailyNotebook } from './components/notes/DailyNotebook';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { NotificationsCenter } from './components/notifications/NotificationsCenter';
import { ReportsManager } from './components/reports/ReportsManager';
import { SettingsManager } from './components/settings/SettingsManager';
import { OnboardingModal } from './components/settings/OnboardingModal';
import { Wallet, GraduationCap } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { activeTab, isOnboardingOpen, setIsOnboardingOpen } = useApp();
  // Persistent mode switcher: 'mizani' (Budget & Finance Manager) vs 'mofakira' (School Management)
  const [appMode, setAppMode] = useState<'mizani' | 'mofakira'>(() => {
    return (localStorage.getItem('mizani_active_mode') as 'mizani' | 'mofakira') || 'mizani';
  });

  const handleSwitchMode = (mode: 'mizani' | 'mofakira') => {
    setAppMode(mode);
    localStorage.setItem('mizani_active_mode', mode);
  };

  // When in Mizani mode, render the full-featured MIZANI Finance Application
  if (appMode === 'mizani') {
    return (
      <FinanceProvider>
        <MizaniApp onSwitchToSchool={() => handleSwitchMode('mofakira')} />
      </FinanceProvider>
    );
  }

  // School Planner mode
  return (
    <FinanceProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-cairo">
        {/* Banner to switch back to Mizani */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 py-1.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-200" />
            <span className="font-semibold">وضع مفكرة الإدارة التربوية مفعل</span>
          </div>
          <button
            onClick={() => handleSwitchMode('mizani')}
            className="flex items-center gap-1.5 bg-white text-blue-900 font-bold px-3 py-1 rounded-lg text-[11px] shadow-sm hover:bg-blue-50 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>العودة إلى تطبيق ميزانيتي (MIZANI)</span>
          </button>
        </div>

        {/* Sticky Header */}
        <Header />

        {/* Main Container */}
        <div className="flex-1 flex w-full max-w-none">
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Dynamic Main View */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 min-w-0 overflow-y-auto">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'annual' && <AnnualPlanManager />}
            {activeTab === 'tasks' && <TaskManager />}
            {activeTab === 'calendar' && <CalendarManager />}
            {activeTab === 'operations' && <OperationsManager />}
            {activeTab === 'meetings' && <MeetingsManager />}
            {activeTab === 'notebook' && <DailyNotebook />}
            {activeTab === 'reports' && <ReportsManager />}
            {activeTab === 'notifications' && <NotificationsCenter />}
            {activeTab === 'settings' && <SettingsManager />}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* Modals & Drawers */}
        <GlobalSearchModal />
        <NotificationDrawer />
        <TaskModal />
        <AppointmentModal />
        <OperationModal />
        <MeetingModal />
        <OnboardingModal isOpen={isOnboardingOpen} onComplete={() => setIsOnboardingOpen(false)} />
      </div>
    </FinanceProvider>
  );
};

export default function App() {
  return <AppContent />;
}
