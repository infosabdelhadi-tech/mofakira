import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Workflow,
  BookMarked,
  FileText,
  Settings,
  Plus,
  Sparkles
} from 'lucide-react';
import { useApp, type ActiveTab } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    tasks,
    appointments,
    operations,
    setIsTaskModalOpen,
    generateAISuggestions
  } = useApp();

  const pendingTasksCount = tasks.filter(t => t.status !== 'مكتملة' && t.status !== 'ملغاة').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAptsCount = appointments.filter(a => a.date === todayStr && !a.isCompleted).length;
  const activeOpsCount = operations.filter(o => o.status === 'قيد التنفيذ').length;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number; color?: string }[] = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'notebook',
      label: 'المفكرة اليومية',
      icon: <BookMarked className="w-5 h-5" />
    },
    {
      id: 'tasks',
      label: 'تدبير المهام',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: pendingTasksCount,
      color: 'bg-teal-500'
    },
    {
      id: 'calendar',
      label: 'التقويم والمواعيد',
      icon: <Calendar className="w-5 h-5" />,
      badge: todayAptsCount,
      color: 'bg-amber-500'
    },
    {
      id: 'operations',
      label: 'برمجة العمليات',
      icon: <Workflow className="w-5 h-5" />,
      badge: activeOpsCount,
      color: 'bg-indigo-500'
    },
    {
      id: 'reports',
      label: 'التقارير والإحصاء',
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'settings',
      label: 'إعدادات المؤسسة',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 shrink-0 transition-colors">

      {/* Quick Add Action Button */}
      <button
        onClick={() => setIsTaskModalOpen(true)}
        className="w-full mb-6 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-medium py-3 px-4 rounded-xl shadow-md shadow-teal-700/20 active:scale-[0.98] transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>إضافة مهمة سريعة</span>
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-right ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-teal-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-teal-400 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white ${isActive ? 'bg-teal-500 dark:bg-teal-700' : 'bg-slate-400 dark:bg-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Assistant Mini Card */}
      <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-teal-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/60 border border-teal-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-2 text-teal-800 dark:text-teal-300 font-semibold text-xs">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>المساعد الذكي للمدير</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          توليد مقترحات ذكية للمهام الإدارية والتربوية حسب مستجدات الأسبوع.
        </p>
        <button
          onClick={generateAISuggestions}
          className="w-full text-xs font-medium py-1.5 px-3 bg-white dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-slate-600 text-teal-700 dark:text-teal-200 rounded-lg border border-teal-200 dark:border-slate-600 transition-colors flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>اقتراح مهام أسبوعية</span>
        </button>
      </div>

    </aside>
  );
};
