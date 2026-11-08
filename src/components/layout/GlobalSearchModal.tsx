import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  CheckSquare,
  Calendar,
  Workflow,
  BookMarked,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    tasks,
    appointments,
    operations,
    dailyNotes,
    setActiveTab,
    setEditingTask,
    setIsTaskModalOpen,
    setEditingAppointment,
    setIsAppointmentModalOpen,
    setEditingOperation,
    setIsOperationModalOpen
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();

  const filteredTasks = normalizedQuery
    ? tasks.filter(t => t.title.toLowerCase().includes(normalizedQuery) || t.description.toLowerCase().includes(normalizedQuery) || t.category.toLowerCase().includes(normalizedQuery))
    : [];

  const filteredAppointments = normalizedQuery
    ? appointments.filter(a => a.title.toLowerCase().includes(normalizedQuery) || a.attendees.toLowerCase().includes(normalizedQuery) || a.description.toLowerCase().includes(normalizedQuery))
    : [];

  const filteredOperations = normalizedQuery
    ? operations.filter(o => o.title.toLowerCase().includes(normalizedQuery) || o.objective.toLowerCase().includes(normalizedQuery) || o.reference.toLowerCase().includes(normalizedQuery))
    : [];

  const filteredNotes = normalizedQuery
    ? dailyNotes.filter(n => n.title.toLowerCase().includes(normalizedQuery) || n.content.toLowerCase().includes(normalizedQuery))
    : [];

  const totalResults = filteredTasks.length + filteredAppointments.length + filteredOperations.length + filteredNotes.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 md:p-20 overflow-y-auto" onClick={() => setIsSearchOpen(false)}>
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ابحث في المهام، المواعيد، العمليات، والمفكرة..."
            className="w-full bg-transparent border-0 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden text-base font-cairo"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!normalizedQuery && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
              اكتب كلمة للبحث الفوري في كافة محتويات وسجلات المفكرة الإدارية...
            </div>
          )}

          {normalizedQuery && totalResults === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
              لم يتم العثور على أي نتائج مطابقة لـ &quot;{query}&quot;
            </div>
          )}

          {/* Tasks Results */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <CheckSquare className="w-3.5 h-3.5 text-teal-500" />
                <span>المهام ({filteredTasks.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setEditingTask(task);
                      setIsTaskModalOpen(true);
                      setActiveTab('tasks');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                        {task.title}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{task.category}</span>
                        <span>•</span>
                        <span>الأجل: {task.dueDate}</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments Results */}
          {filteredAppointments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>المواعيد واللقاءات ({filteredAppointments.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredAppointments.map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setEditingAppointment(apt);
                      setIsAppointmentModalOpen(true);
                      setActiveTab('calendar');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        {apt.title}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{apt.type}</span>
                        <span>•</span>
                        <span>{apt.date} الساعة {apt.startTime}</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operations Results */}
          {filteredOperations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Workflow className="w-3.5 h-3.5 text-indigo-500" />
                <span>العمليات والمشاريع ({filteredOperations.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredOperations.map(op => (
                  <div
                    key={op.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setEditingOperation(op);
                      setIsOperationModalOpen(true);
                      setActiveTab('operations');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {op.title}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{op.category}</span>
                        <span>•</span>
                        <span>نسبة الإنجاز: {op.progress}%</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Notes Results */}
          {filteredNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <BookMarked className="w-3.5 h-3.5 text-emerald-500" />
                <span>المفكرة اليومية ({filteredNotes.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setActiveTab('notebook');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {note.title}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{note.type}</span>
                        <span>•</span>
                        <span>{note.date}</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
