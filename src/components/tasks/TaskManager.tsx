import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Trash2,
  Copy,
  Forward,
  Edit3,
  Paperclip,
  AlertTriangle,
  User,
  Star,
  Archive
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
  type TaskPriority,
  type TaskStatus
} from '../../types';

export const TaskManager: React.FC = () => {
  const {
    tasks,
    setIsTaskModalOpen,
    setEditingTask,
    deleteTask,
    duplicateTask,
    carryOverTask,
    archiveTask,
    setTaskStatus,
    updateTask
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showArchived, setShowArchived] = useState(false);

  // Confirmation modal state for deletion
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredTasks = tasks.filter(task => {
    if (!showArchived && task.isArchived) return false;
    if (showArchived && !task.isArchived) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && !task.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && task.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== 'all' && task.status !== selectedStatus) {
      return false;
    }
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
      return false;
    }
    return true;
  });

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'عاجلة جداً':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-900';
      case 'مهمة':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'متوسطة':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'منخفضة':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case 'مكتملة':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300';
      case 'قيد التنفيذ':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300';
      case 'مبرمجة':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300';
      case 'جديدة':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300';
      case 'متوقفة':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300';
      case 'ملغاة':
        return 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white font-cairo">
            تدبير المهام الإدارية والتربوية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            تخطيط، جدولة ومتابعة إنجاز كافة المهام اليومية والدورية للمؤسسة ({filteredTasks.length} مهمة)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Archive Toggle */}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
              showArchived ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {showArchived ? 'عرض المهام النشطة' : 'الأرشيف'}
          </button>

          {/* View toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
            >
              قائمة
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
            >
              لوحة (Kanban)
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مهمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعنوان، الكلمات المفتاحية..."
              className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-hidden"
            >
              <option value="all">كل المجالات ({tasks.length})</option>
              {TASK_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="shrink-0">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full md:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-hidden"
            >
              <option value="all">كل الحالات</option>
              {TASK_STATUSES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="shrink-0">
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="w-full md:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-hidden"
            >
              <option value="all">كل الأولويات</option>
              {TASK_PRIORITIES.map(pr => (
                <option key={pr} value={pr}>{pr}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <CheckCircle2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            لا توجد مهام مطابقة للشروط المحددة
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            يمكنك تغيير معايير التصفية أو إنشاء مهمة جديدة للبدء في تنظيم يومك.
          </p>
          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 py-2 rounded-xl text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مهمة الآن</span>
          </button>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredTasks.length > 0 && (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const isOverdue = task.dueDate < todayStr && task.status !== 'مكتملة' && task.status !== 'ملغاة';

            return (
              <div
                key={task.id}
                className={`bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border transition-all hover:shadow-md relative ${
                  task.status === 'مكتملة'
                    ? 'border-emerald-200 dark:border-emerald-950/60 opacity-80'
                    : isOverdue
                      ? 'border-rose-300 dark:border-rose-900/60 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">

                  {/* Left part: Checkbox, Title, Details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => setTaskStatus(task.id, task.status === 'مكتملة' ? 'جديدة' : 'مكتملة')}
                      className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                        task.status === 'مكتملة'
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'border-slate-300 dark:border-slate-600 hover:border-teal-500'
                      }`}
                      title={task.status === 'مكتملة' ? 'إلغاء الإكمال' : 'تعليم كمكتملة'}
                    >
                      {task.status === 'مكتملة' && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0">

                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getStatusBadgeClass(task.status)}`}>
                          {task.status}
                        </span>

                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {task.category}
                        </span>

                        {task.isPinned && (
                          <span className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-md">
                            مثبتة
                          </span>
                        )}

                        {isOverdue && (
                          <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            متأخرة
                          </span>
                        )}

                        {task.carriedOverCount && task.carriedOverCount > 0 ? (
                          <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-md">
                            مرحلة {task.carriedOverCount}x
                          </span>
                        ) : null}
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => {
                          setEditingTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        className={`text-base font-bold cursor-pointer hover:text-teal-600 transition-colors ${
                          task.status === 'مكتملة' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Metadata row */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-teal-600" />
                          <span>المسؤول: <strong className="text-slate-700 dark:text-slate-300">{task.assignedTo}</strong></span>
                        </div>

                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>الأجل: <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>{task.dueDate}</span></span>
                        </div>

                        {task.dueTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{task.dueTime}</span>
                          </div>
                        )}

                        {task.attachments && task.attachments.length > 0 && (
                          <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{task.attachments.length} مرفقات</span>
                          </div>
                        )}

                        {task.checklist && task.checklist.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span>الخطوات: {task.checklist.filter(c => c.completed).length}/{task.checklist.length}</span>
                          </div>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-teal-500 h-full rounded-full transition-all"
                            style={{ width: `${task.completionPercentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">
                          {task.completionPercentage}%
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Actions Right / Menu */}
                  <div className="flex items-center gap-1.5 self-end sm:self-start">

                    {/* Favorite toggle */}
                    <button
                      onClick={() => updateTask(task.id, { isFavorite: !task.isFavorite })}
                      className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="المفضلة"
                    >
                      <Star className={`w-4 h-4 ${task.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    {/* Carry Over */}
                    {task.status !== 'مكتملة' && (
                      <button
                        onClick={() => carryOverTask(task.id)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors"
                        title="ترحيل المهمة إلى الغد"
                      >
                        <Forward className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">ترحيل للغد</span>
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-teal-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="تعديل المهمة"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Duplicate button */}
                    <button
                      onClick={() => duplicateTask(task.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="تكرار المهمة"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Archive button */}
                    <button
                      onClick={() => archiveTask(task.id)}
                      className="p-1.5 text-slate-500 hover:text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50"
                      title={task.isArchived ? 'استعادة من الأرشيف' : 'أرشفة المهمة'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setTaskToDelete(task)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="حذف المهمة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' && filteredTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {(['جديدة', 'مبرمجة', 'قيد التنفيذ', 'مكتملة'] as TaskStatus[]).map(statusCol => {
            const colTasks = filteredTasks.filter(t => t.status === statusCol);
            return (
              <div key={statusCol} className="bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col min-w-[280px]">

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">{statusCol}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {colTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                      className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-slate-400">{task.dueDate}</span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {task.assignedTo}
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-full rounded-full" style={{ width: `${task.completionPercentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 dark:bg-rose-950 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  تأكيد حذف المهمة
                </h3>
                <p className="text-xs text-slate-500">لا يمكن التراجع عن هذا الإجراء</p>
              </div>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300">
              هل أنت متأكد من رغبتك في حذف المهمة: &quot;{taskToDelete.title}&quot;؟
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  deleteTask(taskToDelete.id);
                  setTaskToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
