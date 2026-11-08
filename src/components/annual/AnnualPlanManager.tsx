import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Copy,
  Edit3,
  Trash2,
  TrendingUp,
  Search,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  ACADEMIC_MONTHS,
  TASK_CATEGORIES,
  type AnnualProgramItem,
  type TaskCategory
} from '../../types';

export const AnnualPlanManager: React.FC = () => {
  const {
    annualProgram,
    addAnnualItem,
    updateAnnualItem,
    deleteAnnualItem,
    cloneAnnualPlanToNewYear,
    schoolProfile
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal for new/edit item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnualProgramItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [month, setMonth] = useState(ACADEMIC_MONTHS[0]);
  const [category, setCategory] = useState<TaskCategory>('الشؤون التربوية');
  const [objective, setObjective] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [responsible, setResponsible] = useState('رئيس المؤسسة + الفريق التربوي');
  const [indicators, setIndicators] = useState('');
  const [status, setStatus] = useState<AnnualProgramItem['status']>('مبرمجة');
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Clone Year Modal
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [targetYear, setTargetYear] = useState('2025 - 2026');

  const filteredItems = annualProgram.filter(item => {
    if (selectedMonth !== 'all' && item.month !== selectedMonth) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.objective.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalItems = annualProgram.length;
  const completedItems = annualProgram.filter(i => i.status === 'مكتملة').length;
  const inProgressItems = annualProgram.filter(i => i.status === 'قيد التنفيذ').length;
  const overallRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleOpenModal = (item?: AnnualProgramItem) => {
    if (item) {
      setEditingItem(item);
      setTitle(item.title);
      setMonth(item.month);
      setCategory(item.category);
      setObjective(item.objective);
      setTargetDate(item.targetDate);
      setResponsible(item.responsible);
      setIndicators(item.indicators);
      setStatus(item.status);
      setCompletionPercentage(item.completionPercentage);
    } else {
      setEditingItem(null);
      setTitle('');
      setMonth(ACADEMIC_MONTHS[0]);
      setCategory('الشؤون التربوية');
      setObjective('');
      setTargetDate(new Date().toISOString().split('T')[0]);
      setResponsible('رئيس المؤسسة + الفريق التربوي');
      setIndicators('');
      setStatus('مبرمجة');
      setCompletionPercentage(0);
    }
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      academicYear: schoolProfile.academicYear,
      month,
      title: title.trim(),
      category,
      objective: objective.trim(),
      targetDate,
      responsible: responsible.trim(),
      indicators: indicators.trim(),
      status,
      completionPercentage: Number(completionPercentage)
    };

    if (editingItem) {
      updateAnnualItem(editingItem.id, payload);
    } else {
      addAnnualItem(payload);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white font-cairo">
            برنامج العمل السنوي للمؤسسة
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            جدولة العمليات الإدارية والتربوية حسب شهور الموسم الدراسي ({schoolProfile.academicYear})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCloneModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl text-xs font-bold border border-indigo-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>استنساخ لموسم جديد</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl shadow-md text-xs sm:text-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عملية للبرنامج</span>
          </button>
        </div>
      </div>

      {/* Annual Progress Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>نسبة إنجاز برنامج العمل السنوي</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-cairo mb-2">
            {overallRate}% من مجموع العمليات المسطرة
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${overallRate}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-700 pt-4 md:pt-0 md:pr-6 text-center">
          <div>
            <div className="text-xs text-slate-400">إجمالي العمليات</div>
            <div className="text-xl font-bold text-slate-800 dark:text-white">{totalItems}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">المنجزة</div>
            <div className="text-xl font-bold text-emerald-600">{completedItems}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">الجارية</div>
            <div className="text-xl font-bold text-amber-600">{inProgressItems}</div>
          </div>
        </div>
      </div>

      {/* Month Filters Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedMonth('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
            selectedMonth === 'all'
              ? 'bg-slate-900 text-white dark:bg-teal-600 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          كل الشهور ({annualProgram.length})
        </button>
        {ACADEMIC_MONTHS.map(m => {
          const count = annualProgram.filter(i => i.month === m).length;
          return (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 ${
                selectedMonth === m
                  ? 'bg-slate-900 text-white dark:bg-teal-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{m.split(' ')[0]}</span>
              {count > 0 && <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded-full font-bold">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في عمليات البرنامج السنوي..."
            className="w-full pl-3 pr-9 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
          >
            <option value="all">كل المجالات</option>
            {TASK_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Program Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              لا توجد عمليات مبرمجة في هذا الشهر
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              أضف أنشطة الدخول المدرسي، الامتحانات، أو مجالس المؤسسة لجدولة السنة الدراسية.
            </p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-800 p-5 rounded-2xl border transition-all ${
                item.status === 'مكتملة' ? 'border-emerald-200 dark:border-emerald-950/60' : 'border-slate-200 dark:border-slate-700 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
                      {item.month}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.status === 'مكتملة' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'قيد التنفيذ' ? 'bg-teal-100 text-teal-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {item.objective}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                    <span>المسؤول: <strong className="text-slate-700 dark:text-slate-300">{item.responsible}</strong></span>
                    <span>•</span>
                    <span>المؤشر: {item.indicators}</span>
                    <span>•</span>
                    <span>الأجل: {item.targetDate}</span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full" style={{ width: `${item.completionPercentage}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-500">{item.completionPercentage}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="تعديل"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteAnnualItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingItem ? 'تعديل عملية في البرنامج السنوي' : 'إضافة عملية لبرنامج العمل السنوي'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان العملية أو النشاط السنوي
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شهر البرمجة
                  </label>
                  <select
                    value={month}
                    onChange={e => setMonth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    {ACADEMIC_MONTHS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المجال
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    {TASK_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الهدف الإجرائي
                </label>
                <textarea
                  rows={2}
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المسؤول عن الإنجاز
                  </label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={e => setResponsible(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الأجل المحدد
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الحالة
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="مبرمجة">مبرمجة</option>
                    <option value="قيد التنفيذ">قيد التنفيذ</option>
                    <option value="مكتملة">مكتملة</option>
                    <option value="متأخرة">متأخرة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نسبة الإنجاز ({completionPercentage}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={completionPercentage}
                    onChange={e => setCompletionPercentage(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clone to New Year Modal */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              استنساخ هيكل برنامج العمل لموسم دراسي جديد
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              سيتم نسخ العمليات الحالية إلى الموسم الدراسي الجديد مع تصفير نسب الإنجاز وجعل الحالات مبرمجة لتوفير الجهد.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الموسم الدراسي المستهدف:
              </label>
              <input
                type="text"
                value={targetYear}
                onChange={e => setTargetYear(e.target.value)}
                placeholder="2025 - 2026"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCloneModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  cloneAnnualPlanToNewYear(schoolProfile.academicYear, targetYear);
                  setIsCloneModalOpen(false);
                }}
                className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg"
              >
                تأكيد الاستنساخ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
