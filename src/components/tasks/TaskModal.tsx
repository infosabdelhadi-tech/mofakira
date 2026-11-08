import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Paperclip,
  Calendar as CalendarIcon,
  Clock,
  User,
  Layers,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskCategory,
  type TaskPriority,
  type TaskStatus,
  type ChecklistItem,
  type TaskAttachment
} from '../../types';

export const TaskModal: React.FC = () => {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    editingTask,
    setEditingTask,
    addTask,
    updateTask,
    operations
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('الإدارة والتدبير');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('12:00');
  const [priority, setPriority] = useState<TaskPriority>('متوسطة');
  const [status, setStatus] = useState<TaskStatus>('جديدة');
  const [assignedTo, setAssignedTo] = useState('السيد المدير');
  const [notes, setNotes] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [operationId, setOperationId] = useState<string>('');

  // Checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Attachments
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [newAttachmentName, setNewAttachmentName] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setCategory(editingTask.category);
      setStartDate(editingTask.startDate);
      setDueDate(editingTask.dueDate);
      setDueTime(editingTask.dueTime || '12:00');
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setAssignedTo(editingTask.assignedTo);
      setNotes(editingTask.notes || '');
      setCompletionPercentage(editingTask.completionPercentage || 0);
      setOperationId(editingTask.operationId || '');
      setChecklist(editingTask.checklist || []);
      setAttachments(editingTask.attachments || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory('الإدارة والتدبير');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
      setDueTime('12:00');
      setPriority('متوسطة');
      setStatus('جديدة');
      setAssignedTo('السيد المدير');
      setNotes('');
      setCompletionPercentage(0);
      setOperationId('');
      setChecklist([]);
      setAttachments([]);
    }
    setErrors({});
  }, [editingTask, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist(prev => [
      ...prev,
      { id: 'c-' + Date.now(), text: newChecklistText.trim(), completed: false }
    ]);
    setNewChecklistText('');
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
      const completedCount = updated.filter(i => i.completed).length;
      if (updated.length > 0) {
        setCompletionPercentage(Math.round((completedCount / updated.length) * 100));
      }
      return updated;
    });
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleAddAttachment = () => {
    if (!newAttachmentName.trim()) return;
    setAttachments(prev => [
      ...prev,
      {
        id: 'att-' + Date.now(),
        name: newAttachmentName.trim(),
        size: '128 KB',
        type: 'document'
      }
    ]);
    setNewAttachmentName('');
  };

  const handleDeleteAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) errs.title = 'يرجى كتابة عنوان المهمة';
    if (!dueDate) errs.dueDate = 'يرجى تحديد الأجل النهائي';
    if (!assignedTo.trim()) errs.assignedTo = 'يرجى تحديد الشخص أو الفريق المسؤول';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      category,
      startDate,
      dueDate,
      dueTime,
      priority,
      status,
      assignedTo: assignedTo.trim(),
      notes: notes.trim(),
      completionPercentage: Number(completionPercentage),
      checklist,
      attachments,
      operationId: operationId || undefined
    };

    if (editingTask) {
      updateTask(editingTask.id, taskPayload);
    } else {
      addTask(taskPayload);
    }

    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={() => setIsTaskModalOpen(false)}>
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-cairo">
              {editingTask ? 'تعديل المهمة الإدارية' : 'إضافة مهمة إدارية أو تربوية جديدة'}
            </h2>
            <p className="text-xs text-slate-500">
              أدخل تفاصيل المهمة وجدولها الزمني لتتبع الإنجاز
            </p>
          </div>
          <button
            onClick={() => {
              setIsTaskModalOpen(false);
              setEditingTask(null);
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
              عنوان المهمة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: حصر أعداد التلاميذ المستفيدين من المطعم المدرسي"
              className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.title ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70'} text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500`}
            />
            {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              وصف المهمة والأهداف
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="تفاصيل إضافية حول المهمة وإجراءات تنفيذها..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category & Associated Operation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>المجال أو التصنيف</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                {TASK_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الارتباط بعملية أو مشروع
              </label>
              <select
                value={operationId}
                onChange={e => setOperationId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="">بدون ارتباط (مهمة مستقلة)</option>
                {operations.map(op => (
                  <option key={op.id} value={op.id}>{op.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>مستوى الأولوية</span>
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                {TASK_PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                حالة التنفيذ
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                {TASK_STATUSES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Assigned To */}
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-rose-500" />
                <span>الموعد النهائي <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>وقت الإنجاز</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>الشخص أو الفريق المسؤول <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              placeholder="مثال: السيد المدير / المنسق التربوي / أستاذ مادة الرياضيات"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Completion Percentage Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                نسبة الإنجاز
              </label>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                {completionPercentage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={completionPercentage}
              onChange={e => {
                const val = Number(e.target.value);
                setCompletionPercentage(val);
                if (val === 100) setStatus('مكتملة');
                else if (val > 0 && status === 'جديدة') setStatus('قيد التنفيذ');
              }}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          {/* Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              خطوات الإنجاز (Checklist)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                placeholder="أضف خطوة تنفيذية..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-xs font-semibold rounded-lg"
              >
                إضافة
              </button>
            </div>

            {checklist.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 mb-1">
                <div
                  onClick={() => handleToggleChecklist(item.id)}
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${item.completed ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-400'}`}>
                    {item.completed && <Check className="w-3 h-3" />}
                  </div>
                  <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {item.text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteChecklistItem(item.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              <span>المرفقات والوثائق ذات الصلة</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAttachmentName}
                onChange={e => setNewAttachmentName(e.target.value)}
                placeholder="اسم الملف أو المذكرة المرفقة..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-xs font-semibold rounded-lg"
              >
                إرفاق
              </button>
            </div>

            {attachments.map(att => (
              <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 mb-1">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                  <span>{att.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAttachment(att.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ملاحظات وتوجيهات خاصة
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="أي ملاحظات إدارية، رقم مراسلة وزارية، أو متابعات..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsTaskModalOpen(false);
                setEditingTask(null);
              }}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
            >
              {editingTask ? 'حفظ التعديلات' : 'إضافة المهمة'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
