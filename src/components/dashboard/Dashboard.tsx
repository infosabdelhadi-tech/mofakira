import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  Workflow,
  CheckSquare,
  Plus,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  FileText,
  BookMarked
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Dashboard: React.FC = () => {
  const {
    schoolProfile,
    tasks,
    appointments,
    operations,
    setActiveTab,
    setIsTaskModalOpen,
    setIsAppointmentModalOpen,
    setIsOperationModalOpen,
    setEditingTask,
    setTaskStatus,
    carryOverTask,
    generateAISuggestions
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Statistics calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'مكتملة').length;
  const pendingTasks = tasks.filter(t => t.status === 'جديدة' || t.status === 'مبرمجة' || t.status === 'قيد التنفيذ').length;
  const overdueTasks = tasks.filter(t => t.status !== 'مكتملة' && t.status !== 'ملغاة' && t.dueDate < todayStr).length;

  const upcomingAppointments = appointments.filter(a => a.date >= todayStr && !a.isCompleted).length;
  const operationsInProgress = operations.filter(o => o.status === 'قيد التنفيذ').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Today's specific data
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const tasksInProgress = tasks.filter(t => t.status === 'قيد التنفيذ');
  const urgentTasks = tasks.filter(t => t.priority === 'عاجلة جداً' && t.status !== 'مكتملة');

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : 'مساء الخير';

  return (
    <div className="space-y-6 pb-12">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                الموسم الدراسي: {schoolProfile.academicYear}
              </span>
              <span className="text-xs text-slate-400">
                {schoolProfile.schoolName}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-cairo tracking-tight">
              {greeting}، {schoolProfile.principalName}
            </h2>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              مرحباً بك في مفكرة الإدارة التربوية. لديك اليوم <span className="text-teal-400 font-bold">{todayAppointments.length} مواعيد</span> و <span className="text-amber-400 font-bold">{pendingTasks} مهام إدارية وتربوية</span> بحاجة لمتابعتك.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>مهمة جديدة</span>
            </button>
            <button
              onClick={generateAISuggestions}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl backdrop-blur-md transition-all text-xs sm:text-sm border border-white/10"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>اقتراحات ذكية</span>
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 6 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">

        {/* 1. Total Tasks */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">إجمالي المهام</span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-cairo">
            {totalTasks}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">كافة المجالات</div>
        </div>

        {/* 2. Completed Tasks */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">المهام المكتملة</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-cairo">
            {completedTasks}
          </div>
          <div className="text-[11px] text-emerald-500 mt-1">نسبة {completionRate}% إنجاز</div>
        </div>

        {/* 3. Pending Tasks */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">قيد التنفيذ / الانتظار</span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-cairo">
            {pendingTasks}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">مهام نشطة</div>
        </div>

        {/* 4. Overdue Tasks */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">المهام المتأخرة</span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-cairo">
            {overdueTasks}
          </div>
          <div className="text-[11px] text-rose-500 mt-1">تتطلب ترحيلاً أو إنجازاً</div>
        </div>

        {/* 5. Upcoming Appointments */}
        <div
          onClick={() => setActiveTab('calendar')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">المواعيد القادمة</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-cairo">
            {upcomingAppointments}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">لقاءات واجتماعات</div>
        </div>

        {/* 6. Operations in Progress */}
        <div
          onClick={() => setActiveTab('operations')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">العمليات الجارية</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Workflow className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-cairo">
            {operationsInProgress}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">مشاريع مفعلة</div>
        </div>

      </div>

      {/* Progress Overview & Quick Action Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Visual Progress Indicator Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                مؤشر الإنجاز العام للمؤسسة
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-full">
              {completionRate}% مكتمل
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden mb-3">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            تم إنجاز {completedTasks} مهمة من أصل {totalTasks} مهمة مسجلة في مختلف المجالات التربوية والإدارية.
            العمل يسير بوتيرة إيجابية وفق المخطط السنوي للمؤسسة.
          </p>
        </div>

        {/* Quick-action 6 Buttons */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">
            إجراءات سريعة
          </h3>
          <div className="grid grid-cols-2 gap-2">

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-teal-50 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors text-right"
            >
              <CheckSquare className="w-4 h-4 text-teal-600" />
              <span>إضافة مهمة</span>
            </button>

            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-amber-50 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors text-right"
            >
              <CalendarIcon className="w-4 h-4 text-amber-600" />
              <span>إضافة موعد</span>
            </button>

            <button
              onClick={() => setIsOperationModalOpen(true)}
              className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors text-right"
            >
              <Workflow className="w-4 h-4 text-indigo-600" />
              <span>برمجة عملية</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-rose-50 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors text-right"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span>إنشاء تقرير</span>
            </button>

            <button
              onClick={() => setActiveTab('notebook')}
              className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors text-right"
            >
              <BookMarked className="w-4 h-4 text-emerald-600" />
              <span>تسجيل ملاحظة</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-sky-50 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors text-right"
            >
              <CalendarIcon className="w-4 h-4 text-sky-600" />
              <span>عرض التقويم</span>
            </button>

          </div>
        </div>

      </div>

      {/* Today's Agenda Grid: Appointments & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's Appointments */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                مواعيد اليوم ({todayAppointments.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>عرض كل المواعيد</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              لا توجد مواعيد مبرمجة لليوم. استمتع بيوم عمل هادئ!
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map(apt => (
                <div
                  key={apt.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-700 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {apt.type}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {apt.startTime} - {apt.endTime}
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white mt-1">
                      {apt.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      المكان: {apt.location} | المعنيون: {apt.attendees}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks In Progress & Urgent Tasks */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                مهام تتطلب الانتباه العاجل
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>كل المهام</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentTasks.length === 0 && tasksInProgress.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              لا توجد مهام عاجلة في الوقت الحالي. جميع المهام تحت السيطرة.
            </div>
          ) : (
            <div className="space-y-3">
              {[...urgentTasks, ...tasksInProgress].slice(0, 4).map(task => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        {task.priority}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                        {task.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        الأجل: {task.dueDate}
                      </span>
                    </div>
                    <div
                      onClick={() => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                      className="font-semibold text-sm text-slate-900 dark:text-white mt-1 truncate hover:text-teal-600 cursor-pointer"
                    >
                      {task.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setTaskStatus(task.id, 'مكتملة')}
                      title="تعليم كمكتملة"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => carryOverTask(task.id)}
                      title="ترحيل إلى الغد"
                      className="text-[11px] font-medium px-2 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      ترحيل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
