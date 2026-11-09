import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Workflow,
  MoreHorizontal,
  Plus,
  BookMarked,
  FileText,
  Settings,
  Bell,
  Clock,
  Briefcase,
  Users,
  Compass
} from 'lucide-react';
import { useApp, type ActiveTab } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsTaskModalOpen,
    setIsAppointmentModalOpen,
    setIsOperationModalOpen,
    tasks
  } = useApp();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  const pendingCount = tasks.filter(t => t.status !== 'مكتملة' && t.status !== 'ملغاة' && !t.isArchived).length;

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
    setIsFabOpen(false);
  };

  return (
    <>
      {/* Floating Action Button Quick Menu */}
      {isFabOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex flex-col justify-end p-4 pb-24 md:hidden" onClick={() => setIsFabOpen(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-1">إضافة سريعة:</div>

            <button
              onClick={() => {
                setIsFabOpen(false);
                setIsTaskModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-right"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">إضافة مهمة</div>
                <div className="text-xs text-slate-500">مهمة إدارية أو تربوية جديدة</div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsFabOpen(false);
                setIsAppointmentModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-right"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">إضافة موعد أو اجتماع</div>
                <div className="text-xs text-slate-500">جدولة لقاء، مجلس أو زيارة</div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsFabOpen(false);
                setIsOperationModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-right"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">برمجة عملية</div>
                <div className="text-xs text-slate-500">مشروع أو نشاط متعدد المراحل</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* "More" Sheet Modal on Mobile */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex flex-col justify-end p-4 pb-24 md:hidden" onClick={() => setIsMoreMenuOpen(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-1 animate-in fade-in zoom-in-95 max-h-[75vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-1">الأقسام التخصصية:</div>

            <button
              onClick={() => handleTabClick('annual')}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >
              <Compass className="w-5 h-5 text-teal-600" />
              <span>برنامج العمل السنوي</span>
            </button>

            <button
              onClick={() => handleTabClick('meetings')}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >
              <Users className="w-5 h-5 text-indigo-600" />
              <span>المجالس والقرارات والمحاضر</span>
            </button>

            <button
              onClick={() => handleTabClick('notebook')}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >
              <BookMarked className="w-5 h-5 text-emerald-600" />
              <span>المفكرة اليومية</span>
            </button>

            <button
              onClick={() => handleTabClick('reports')}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >
              <FileText className="w-5 h-5 text-amber-600" />
              <span>التقارير والإحصائيات والتصدير</span>
            </button>

            <button
              onClick={() => handleTabClick('notifications')}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >
              <Bell className="w-5 h-5 text-rose-600" />
              <span>مركز الإشعارات والتذكيرات</span>
            </button>

            <button
              onClick={() => handleTabClick('settings')}
              className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >
              <Settings className="w-5 h-5 text-slate-600" />
              <span>إعدادات المؤسسة والنسخ الاحتياطي</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsFabOpen(!isFabOpen)}
        title="إضافة سريعة"
        className="md:hidden fixed left-5 bottom-20 z-40 w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-700/40 flex items-center justify-center active:scale-95 transition-all"
      >
        <Plus className={`w-7 h-7 transition-transform duration-200 ${isFabOpen ? 'rotate-45' : ''}`} />
      </button>

      {/* Mobile Bottom Navigation Bar (5 Main Items) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 transition-colors">
        <div className="grid grid-cols-5 items-center">

          {/* 1. Dashboard */}
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`flex flex-col items-center py-1 transition-colors ${
              activeTab === 'dashboard' ? 'text-teal-600 dark:text-teal-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1">الرئيسية</span>
          </button>

          {/* 2. Tasks */}
          <button
            onClick={() => handleTabClick('tasks')}
            className={`relative flex flex-col items-center py-1 transition-colors ${
              activeTab === 'tasks' ? 'text-teal-600 dark:text-teal-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px] mt-1">المهام</span>
            {pendingCount > 0 && (
              <span className="absolute top-0 right-3.5 flex h-3.5 min-w-[14px] px-1 items-center justify-center rounded-full bg-teal-600 text-[9px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </button>

          {/* 3. Calendar */}
          <button
            onClick={() => handleTabClick('calendar')}
            className={`flex flex-col items-center py-1 transition-colors ${
              activeTab === 'calendar' ? 'text-teal-600 dark:text-teal-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] mt-1">التقويم</span>
          </button>

          {/* 4. Operations */}
          <button
            onClick={() => handleTabClick('operations')}
            className={`flex flex-col items-center py-1 transition-colors ${
              activeTab === 'operations' ? 'text-teal-600 dark:text-teal-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Workflow className="w-5 h-5" />
            <span className="text-[10px] mt-1">العمليات</span>
          </button>

          {/* 5. More */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex flex-col items-center py-1 transition-colors ${
              isMoreMenuOpen || activeTab === 'annual' || activeTab === 'meetings' || activeTab === 'notebook' || activeTab === 'reports' || activeTab === 'settings'
                ? 'text-teal-600 dark:text-teal-400 font-semibold'
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
