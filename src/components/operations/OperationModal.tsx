import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Layers,
  Calendar as CalendarIcon,
  User,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  TASK_CATEGORIES,
  type TaskCategory,
  type OperationPhase,
  type OperationPhaseStatus
} from '../../types';

export const OperationModal: React.FC = () => {
  const {
    isOperationModalOpen,
    setIsOperationModalOpen,
    editingOperation,
    setEditingOperation,
    addOperation,
    updateOperation
  } = useApp();

  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [category, setCategory] = useState<TaskCategory>('الشؤون التربوية');
  const [reference, setReference] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [responsible, setResponsible] = useState('السيد المدير + الفريق التربوي');
  const [participants, setParticipants] = useState('جميع الأطر التربوية والإدارية');
  const [resources, setResources] = useState('');
  const [indicators, setIndicators] = useState('');
  const [notes, setNotes] = useState('');
  const [phases, setPhases] = useState<OperationPhase[]>([]);

  // Phase creation state
  const [newPhaseTitle, setNewPhaseTitle] = useState('');
  const [newPhaseDueDate, setNewPhaseDueDate] = useState('');
  const [newPhaseResponsible, setNewPhaseResponsible] = useState('رئيس المؤسسة');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingOperation) {
      setTitle(editingOperation.title);
      setObjective(editingOperation.objective);
      setCategory(editingOperation.category);
      setReference(editingOperation.reference);
      setStartDate(editingOperation.startDate);
      setDueDate(editingOperation.dueDate);
      setResponsible(editingOperation.responsible);
      setParticipants(editingOperation.participants);
      setResources(editingOperation.resources);
      setIndicators(editingOperation.indicators);
      setNotes(editingOperation.notes || '');
      setPhases(editingOperation.phases || []);
    } else {
      setTitle('');
      setObjective('');
      setCategory('الشؤون التربوية');
      setReference('المقرر الوزاري لتنظيم السنة الدراسية');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
      setResponsible('السيد المدير');
      setParticipants('أطر هيئة التدريس والإدارة');
      setResources('سجلات ومطبوعات إدارية');
      setIndicators('تحقيق نسبة إنجاز 100% في الآجال القانونية');
      setNotes('');
      // Default initial Moroccan operation template phases
      setPhases([
        { id: 'ph-1', order: 1, title: 'التشخيص والإعداد الأولي', startDate: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], status: 'قيد التنفيذ', responsible: 'السيد المدير' },
        { id: 'ph-2', order: 2, title: 'التنفيذ الميداني وتوزيع الأدوار', startDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0], dueDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0], status: 'مبرمجة', responsible: 'الفريق المكلف' },
        { id: 'ph-3', order: 3, title: 'التقويم والتقرير التركيبي النهائي', startDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0], dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], status: 'مبرمجة', responsible: 'رئيس المؤسسة' }
      ]);
    }
    setErrors({});
  }, [editingOperation, isOperationModalOpen]);

  if (!isOperationModalOpen) return null;

  const handleAddPhase = () => {
    if (!newPhaseTitle.trim()) return;
    const newPhase: OperationPhase = {
      id: 'ph-' + Date.now(),
      order: phases.length + 1,
      title: newPhaseTitle.trim(),
      startDate: new Date().toISOString().split('T')[0],
      dueDate: newPhaseDueDate || dueDate,
      status: 'مبرمجة',
      responsible: newPhaseResponsible.trim() || responsible
    };
    setPhases(prev => [...prev, newPhase]);
    setNewPhaseTitle('');
    setNewPhaseDueDate('');
  };

  const handleDeletePhase = (id: string) => {
    setPhases(prev => prev.filter(p => p.id !== id).map((p, idx) => ({ ...p, order: idx + 1 })));
  };

  const handlePhaseStatusChange = (id: string, status: OperationPhaseStatus) => {
    setPhases(prev => prev.map(p => p.id === id ? { ...p, status, completedDate: status === 'مكتملة' ? new Date().toISOString().split('T')[0] : undefined } : p));
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) errs.title = 'يرجى إدخال اسم العملية أو المشروع';
    if (!objective.trim()) errs.objective = 'يرجى تحديد الهدف من العملية';
    if (!reference.trim()) errs.reference = 'يرجى تحديد المرجعية أو السياق';
    if (phases.length === 0) errs.phases = 'يجب إضافة مرحلة تنفيذية واحدة على الأقل للعملية';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Calculate progress
    const completedCount = phases.filter(p => p.status === 'مكتملة').length;
    const progress = Math.round((completedCount / (phases.length || 1)) * 100);
    const status: 'مكتملة' | 'قيد التنفيذ' | 'مبرمجة' = progress === 100 ? 'مكتملة' : (progress > 0 ? 'قيد التنفيذ' : 'مبرمجة');

    const payload = {
      title: title.trim(),
      objective: objective.trim(),
      category,
      reference: reference.trim(),
      startDate,
      dueDate,
      responsible: responsible.trim(),
      participants: participants.trim(),
      resources: resources.trim(),
      indicators: indicators.trim(),
      notes: notes.trim(),
      phases,
      progress,
      status
    };

    if (editingOperation) {
      updateOperation(editingOperation.id, payload);
    } else {
      addOperation(payload);
    }

    setIsOperationModalOpen(false);
    setEditingOperation(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={() => setIsOperationModalOpen(false)}>
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-cairo">
              {editingOperation ? 'تعديل برمجة العملية' : 'برمجة عملية إدارية / تربوية جديدة'}
            </h2>
            <p className="text-xs text-slate-500">
              تحديد المراحل التنفيذية، الأهداف، المرجعيات والمؤشرات التقييمية
            </p>
          </div>
          <button
            onClick={() => {
              setIsOperationModalOpen(false);
              setEditingOperation(null);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-right">

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم العملية أو المشروع <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: الاستعداد للدخول المدرسي وتأهيل فضاءات المؤسسة"
              className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.title ? 'border-rose-500 bg-rose-50' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70'} text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Objective */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              الهدف العام من العملية <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={objective}
              onChange={e => setObjective(e.target.value)}
              placeholder="توفير الشروط المناسبة لاستقبال المتعلمات والمتعلمين وضمان انطلاق الدراسة في وقتها..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm"
            />
            {errors.objective && <p className="text-rose-500 text-xs mt-1">{errors.objective}</p>}
          </div>

          {/* Category & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>المجال</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm"
              >
                {TASK_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>المرجعية أو السياق <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="مذكرة وزارية، مقرر تنظيمي، خارطة الطريق 2026..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Dates & Responsible */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
                <span>تاريخ الانطلاق</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-rose-500" />
                <span>تاريخ الانتهاء المتوقع</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>المسؤول عن التنفيذ</span>
              </label>
              <input
                type="text"
                value={responsible}
                onChange={e => setResponsible(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Participants & Resources & Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المشاركون / المتدخلون
              </label>
              <input
                type="text"
                value={participants}
                onChange={e => setParticipants(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الموارد والوسائل المطلوبة
              </label>
              <input
                type="text"
                value={resources}
                onChange={e => setResources(e.target.value)}
                placeholder="قاعات، تجهيزات، ميزانية..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                مؤشرات الإنجاز
              </label>
              <input
                type="text"
                value={indicators}
                onChange={e => setIndicators(e.target.value)}
                placeholder="نسبة حضور 95%، إتمام 100%..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-xs"
              />
            </div>
          </div>

          {/* PHASES SECTION */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                مراحل التنفيذ ({phases.length}) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                قسّم العملية إلى مراحل تسلسلية واضحة
              </span>
            </div>

            {/* Add Phase Bar */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 mb-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newPhaseTitle}
                  onChange={e => setNewPhaseTitle(e.target.value)}
                  placeholder="عنوان المرحلة الجديدة..."
                  className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="date"
                  value={newPhaseDueDate}
                  onChange={e => setNewPhaseDueDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={newPhaseResponsible}
                  onChange={e => setNewPhaseResponsible(e.target.value)}
                  placeholder="المسؤول عن هذه المرحلة..."
                  className="flex-1 ml-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddPhase}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة مرحلة</span>
                </button>
              </div>
            </div>

            {/* Phases List */}
            <div className="space-y-2">
              {phases.map((ph, idx) => (
                <div key={ph.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {ph.title}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        الأجل: {ph.dueDate} | المسؤول: {ph.responsible}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <select
                      value={ph.status}
                      onChange={e => handlePhaseStatusChange(ph.id, e.target.value as OperationPhaseStatus)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${
                        ph.status === 'مكتملة' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        ph.status === 'قيد التنفيذ' ? 'bg-teal-100 text-teal-800 border-teal-300' :
                        ph.status === 'متأخرة' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                        'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="مبرمجة">مبرمجة</option>
                      <option value="قيد التنفيذ">قيد التنفيذ</option>
                      <option value="مكتملة">مكتملة</option>
                      <option value="متأخرة">متأخرة</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeletePhase(ph.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {errors.phases && <p className="text-rose-500 text-xs mt-1">{errors.phases}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ملاحظات وتوجيهات ختامية
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="أي ملاحظات، صعوبات متوقعة، أو مقترحات..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-xs"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsOperationModalOpen(false);
                setEditingOperation(null);
              }}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              {editingOperation ? 'حفظ تعديلات العملية' : 'تأكيد وبرمجة العملية'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
