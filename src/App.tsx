import React from 'react';
import { useApp } from './context/AppContext';
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
import { DailyNotebook } from './components/notes/DailyNotebook';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { ReportsManager } from './components/reports/ReportsManager';
import { SettingsManager } from './components/settings/SettingsManager';

export const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-cairo">
      {/* Sticky Header */}
      <Header />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Dynamic Main View */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'notebook' && <DailyNotebook />}
          {activeTab === 'tasks' && <TaskManager />}
          {activeTab === 'calendar' && <CalendarManager />}
          {activeTab === 'operations' && <OperationsManager />}
          {activeTab === 'reports' && <ReportsManager />}
          {activeTab === 'notifications' && <DailyNotebook />}
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
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
