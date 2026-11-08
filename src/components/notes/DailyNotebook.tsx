import React, { useState } from 'react';
import {
  BookMarked,
  Plus,
  Clock,
  Trash2,
  Search,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  Forward,
  Edit2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { DailyNote, NoteType } from '../../types';

export const DailyNotebook: React.FC = () => {
  const { dailyNotes, addDailyNote, updateDailyNote, deleteDailyNote } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Form states for creating / editing note
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>('أعمال منجزة');
  const [tagsInput, setTagsInput] = useState('');

  const noteTypes: NoteType[] = [
    'أعمال منجزة',
    'أحداث مهمة',
    'ملاحظات إدارية',
    'ملاحظات تربوية',
    'مشاكل وقرارات',
    'مهام مرحلة'
  ];

  const getNoteTypeIcon = (noteType: NoteType) => {
    switch (noteType) {
      case 'أعمال منجزة':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'أحداث مهمة':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'ملاحظات إدارية':
        return <BookMarked className="w-4 h-4 text-indigo-500" />;
      case 'ملاحظات تربوية':
        return <BookMarked className="w-4 h-4 text-teal-500" />;
      case 'مشاكل وقرارات':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'مهام مرحلة':
        return <Forward className="w-4 h-4 text-purple-500" />;
    }
  };

  const getNoteTypeBadge = (noteType: NoteType) => {
    switch (noteType) {
      case 'أعمال منجزة':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'أحداث مهمة':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'ملاحظات إدارية':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
      case 'ملاحظات تربوية':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';
      case 'مشاكل وقرارات':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'مهام مرحلة':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
    }
  };

  const handleOpenForm = (note?: DailyNote) => {
    if (note) {
      setEditingNoteId(note.id);
      setTitle(note.title);
      setContent(note.content);
      setType(note.type);
      setTagsInput(note.tags ? note.tags.join(', ') : '');
      setSelectedDate(note.date);
    } else {
      setEditingNoteId(null);
      setTitle('');
      setContent('');
      setType('أعمال منجزة');
      setTagsInput('');
    }
    setIsFormOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (editingNoteId) {
      updateDailyNote(editingNoteId, {
        title: title.trim(),
        content: content.trim(),
        type,
        tags,
        date: selectedDate
      });
    } else {
      addDailyNote({
        title: title.trim(),
        content: content.trim(),
        type,
        date: selectedDate,
        timestamp: timeStr,
        tags
      });
    }

    setIsFormOpen(false);
    setEditingNoteId(null);
    setTitle('');
    setContent('');
  };

  const filteredNotes = dailyNotes.filter(n => {
    if (selectedType !== 'all' && n.type !== selectedType) return false;
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !n.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white font-cairo">
            المفكرة اليومية للإدارة
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            سجل الوقائع اليومية، الأعمال المنجزة، القرارات الإدارية، والملاحظات التربوية
          </p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all text-xs sm:text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>تدوين ملاحظة جديدة</span>
        </button>
      </div>

      {/* Note Form Drawer / Modal */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-teal-200 dark:border-teal-900 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-cairo">
              {editingNoteId ? 'تعديل التدوينة اليومية' : 'تدوين ملاحظة أو قرار جديد'}
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">
              إغلاق
            </button>
          </div>

          <form onSubmit={handleSaveNote} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الملاحظة / الحدث <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: محضر اجتماع طارئ بخصوص صيانة التدفئة"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-cairo"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  التصنيف
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as NoteType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-cairo"
                >
                  {noteTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تفاصيل الملاحظة أو القرار المتخذ <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="اكتب خلاصة ما تم تداوله أو إنجازه..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الوسوم (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="دخول مدرسي, صيانة, مجالس..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                {editingNoteId ? 'تحديث التدوينة' : 'حفظ في المفكرة'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في سجل التدوينات..."
            className="w-full pl-3 pr-9 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full md:w-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium"
          >
            <option value="all">كل التدوينات ({dailyNotes.length})</option>
            {noteTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chronological Timeline Notes */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <BookMarked className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              لا توجد تدوينات مطابقة
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              سجل أنشطتك وقراراتك اليومية لتوثيق السير العادي للمؤسسة.
            </p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all space-y-2 relative"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700">
                    {getNoteTypeIcon(note.type)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getNoteTypeBadge(note.type)}`}>
                    {note.type}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {note.date} - {note.timestamp}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenForm(note)}
                    className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="تعديل"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteDailyNote(note.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {note.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {note.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
