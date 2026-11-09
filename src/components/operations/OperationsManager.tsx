import React, { useState } from 'react';
import {
  Workflow,
  Plus,
  Calendar as CalendarIcon,
  User,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText,
  Search,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Operation, OperationPhaseStatus } from '../../types';

export const OperationsManager: React.FC = () => {
  const {
    operations,
    tasks,
    setIsOperationModalOpen,
    setEditingOperation,
    deleteOperation,
    updatePhaseStatus,
    setEditingTask,
    setIsTaskModalOpen,
    setActiveTab
  } = useApp();

  const [expandedOpId, setExpandedOpId] = useState<string | null>(operations[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [opToDelete, setOpToDelete] = useState<Operation | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOpId(prev => prev === id ? null : id);
  };

  const filteredOps = operations.filter(op => {
    if (searchQuery && !op.title.toLowerCase().includes(searchQuery.toLowerCase()) && !op.objective.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: Operation['status']) => {
    switch (status) {
      case 'مكتملة':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'قيد التنفيذ':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300';
      case 'متأخرة':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white font-cairo">
            برمجة العمليات الإدارية والتربوية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            تخطيط وتنظيم المشاريع متعددة المراحل وتتبع مؤشرات الإنجاز الدقيقة
          </p>
        </div>

        <button
          onClick={() => {
            setEditingOperation(null);
            setIsOperationModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all text-xs sm:text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>برمجة عملية جديدة</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في أسماء العمليات، الأهداف..."
            className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          إجمالي العمليات: <strong className="text-slate-900 dark:text-white">{operations.length}</strong>
        </div>
      </div>

      {/* Operations List */}
      <div className="space-y-4">
        {filteredOps.map(op => {
          const isExpanded = expandedOpId === op.id;
          const completedPhases = op.phases.filter(p => p.status === 'مكتملة').length;
          const linkedTasks = tasks.filter(t => t.operationId === op.id);

          return (
            <div
              key={op.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-800"
            >
              {/* Operation Card Header */}
              <div
                onClick={() => toggleExpand(op.id)}
                className="p-5 cursor-pointer select-none flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Workflow className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(op.status)}`}>
                        {op.status}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {op.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        المرجعية: {op.reference}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {op.title}
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {op.objective}
                    </p>
                  </div>
                </div>

                {/* Progress & Controls */}
                <div className="flex items-center gap-6 shrink-0 self-end md:self-center">
                  <div className="w-36 text-left">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-slate-500">نسبة الإنجاز</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{op.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${op.progress}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 text-right">
                      {completedPhases} من أصل {op.phases.length} مراحل
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingOperation(op);
                        setIsOperationModalOpen(true);
                      }}
                      className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="تعديل العملية"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpToDelete(op);
                      }}
                      className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="حذف العملية"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Content: Detailed Phases & Information */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in">

                  {/* Meta details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-indigo-500" />
                      <span>المسؤول: <strong>{op.responsible}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-teal-500" />
                      <span>الفترة: <strong>{op.startDate} إلى {op.dueDate}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>المؤشر: <strong>{op.indicators || 'غير محدد'}</strong></span>
                    </div>
                  </div>

                  {/* Execution Phases Timeline / Checklist */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <Workflow className="w-4 h-4 text-indigo-500" />
                      <span>مراحل التنفيذ المجدولة ({op.phases.length})</span>
                    </h4>

                    <div className="space-y-2.5">
                      {op.phases.map((phase, idx) => (
                        <div
                          key={phase.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            phase.status === 'مكتملة'
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                              : phase.status === 'متأخرة'
                                ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                                {phase.title}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                                <span>الأجل: {phase.dueDate}</span>
                                <span>•</span>
                                <span>المكلف: {phase.responsible}</span>
                                {phase.completedDate && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-600 font-medium">أُنجزت في: {phase.completedDate}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Phase Status Selector */}
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <select
                              value={phase.status}
                              onChange={e => updatePhaseStatus(op.id, phase.id, e.target.value as OperationPhaseStatus)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                                phase.status === 'مكتملة' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                phase.status === 'قيد التنفيذ' ? 'bg-teal-100 text-teal-800 border-teal-300' :
                                phase.status === 'متأخرة' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                                'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <option value="مبرمجة">مبرمجة</option>
                              <option value="قيد التنفيذ">قيد التنفيذ</option>
                              <option value="مكتملة">مكتملة</option>
                              <option value="متأخرة">متأخرة</option>
                            </select>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Linked Tasks Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-teal-600" />
                        <span>المهام المرتبطة بهذه العملية ({linkedTasks.length})</span>
                      </h4>

                      <button
                        onClick={() => {
                          setEditingTask(null);
                          setIsTaskModalOpen(true);
                        }}
                        className="text-xs text-teal-600 hover:underline font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة مهمة للعملية</span>
                      </button>
                    </div>

                    {linkedTasks.length === 0 ? (
                      <div className="text-xs text-slate-400 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        لا توجد مهام مستقلة مرتبطة بهذه العملية حالياً.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {linkedTasks.map(t => (
                          <div
                            key={t.id}
                            onClick={() => {
                              setEditingTask(t);
                              setIsTaskModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-teal-400"
                          >
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.title}</span>
                            <span className="text-[10px] text-teal-600 font-bold">{t.completionPercentage}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Operation Quick Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400">
                      تاريخ الإنشاء: {op.createdAt.split('T')[0]}
                    </span>

                    <button
                      onClick={() => setActiveTab('reports')}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>توليد تقرير حصيلة العملية</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Delete Operation Confirmation */}
      {opToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 dark:bg-rose-950 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  تأكيد حذف العملية
                </h3>
                <p className="text-xs text-slate-500">سيتم حذف كافة المراحل والبيانات المرتبطة بها</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              هل أنت متأكد من رغبتك في حذف العملية: &quot;{opToDelete.title}&quot;؟
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setOpToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  deleteOperation(opToDelete.id);
                  setOpToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                حذف العملية
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
