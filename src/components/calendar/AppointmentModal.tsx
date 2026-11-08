import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APPOINTMENT_TYPES, type AppointmentType } from '../../types';

export const AppointmentModal: React.FC = () => {
  const {
    isAppointmentModalOpen,
    setIsAppointmentModalOpen,
    editingAppointment,
    setEditingAppointment,
    addAppointment,
    updateAppointment
  } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<AppointmentType>('اجتماع');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('مكتب الإدارة التربوية');
  const [attendees, setAttendees] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [reminder, setReminder] = useState<'none' | 'exact' | '15m' | '30m' | '1h' | '1d'>('30m');

  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingAppointment) {
      setTitle(editingAppointment.title);
      setType(editingAppointment.type);
      setDate(editingAppointment.date);
      setStartTime(editingAppointment.startTime);
      setEndTime(editingAppointment.endTime);
      setLocation(editingAppointment.location);
      setAttendees(editingAppointment.attendees);
      setDescription(editingAppointment.description);
      setNotes(editingAppointment.notes || '');
      setReminder(editingAppointment.reminder);
    } else {
      setTitle('');
      setType('اجتماع');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('10:00');
      setEndTime('11:00');
      setLocation('مكتب الإدارة التربوية');
      setAttendees('');
      setDescription('');
      setNotes('');
      setReminder('30m');
    }
    setConflictWarning(null);
    setErrors({});
  }, [editingAppointment, isAppointmentModalOpen]);

  if (!isAppointmentModalOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) errs.title = 'يرجى إدخال عنوان الموعد أو اللقاء';
    if (!date) errs.date = 'يرجى تحديد التاريخ';
    if (!startTime) errs.startTime = 'يرجى تحديد وقت البداية';
    if (!endTime) errs.endTime = 'يرجى تحديد وقت النهاية';
    if (startTime >= endTime) errs.endTime = 'يجب أن يكون وقت النهاية بعد وقت البداية';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      type,
      date,
      startTime,
      endTime,
      location: location.trim(),
      attendees: attendees.trim(),
      description: description.trim(),
      notes: notes.trim(),
      reminder,
      isCompleted: editingAppointment ? editingAppointment.isCompleted : false
    };

    if (editingAppointment) {
      const res = updateAppointment(editingAppointment.id, payload);
      if (!res.success && res.conflict) {
        setConflictWarning(`تنبيه تعارض في المواعيد: يوجد موعد آخر (${res.conflict.title}) مبرمج في نفس التوقيت (${res.conflict.startTime} - ${res.conflict.endTime})`);
        return;
      }
    } else {
      const res = addAppointment(payload);
      if (!res.success && res.conflict) {
        setConflictWarning(`تنبيه تعارض في المواعيد: يوجد موعد آخر (${res.conflict.title}) مبرمج في نفس التوقيت (${res.conflict.startTime} - ${res.conflict.endTime})`);
        return;
      }
    }

    setIsAppointmentModalOpen(false);
    setEditingAppointment(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={() => setIsAppointmentModalOpen(false)}>
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-cairo">
              {editingAppointment ? 'تعديل الموعد الإداري' : 'جدولة موعد أو اجتماع جديد'}
            </h2>
            <p className="text-xs text-slate-500">
              تحديد تفاصيل اللقاء والمشاركين وتنبيهات التذكير
            </p>
          </div>
          <button
            onClick={() => {
              setIsAppointmentModalOpen(false);
              setEditingAppointment(null);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Alert Warning */}
        {conflictWarning && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="flex-1">{conflictWarning}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-right">

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              عنوان الموعد أو اللقاء <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: لقاء تنسيقي مع مفتش المقاطعة التربوية"
              className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.title ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70'} text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500`}
            />
            {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Type & Reminder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نوع الموعد
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as AppointmentType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                {APPOINTMENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>التذكير الذكي</span>
              </label>
              <select
                value={reminder}
                onChange={e => setReminder(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="none">بدون تذكير</option>
                <option value="exact">في الموعد تماماً</option>
                <option value="15m">قبل 15 دقيقة</option>
                <option value="30m">قبل 30 دقيقة</option>
                <option value="1h">قبل ساعة</option>
                <option value="1d">قبل يوم واحد</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
                <span>التاريخ <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>البداية <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>النهاية <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border ${errors.endTime ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500`}
              />
              {errors.endTime && <p className="text-rose-500 text-[10px] mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Location & Attendees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>المكان أو القاعة</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="مثال: مكتب المدير / قاعة الأساتذة"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>الأشخاص أو الهيئات المعنية</span>
              </label>
              <input
                type="text"
                value={attendees}
                onChange={e => setAttendees(e.target.value)}
                placeholder="مثال: ممثلو جمعية الآباء، أساتذة المستوى الأول..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              جدول الأعمال وموضوع اللقاء
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="النقاط الأساسية المطروحة للنقاش..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ملاحظات وتوصيات
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="وثائق يجب إحضارها، مخرجات مرتقبة..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAppointmentModalOpen(false);
                setEditingAppointment(null);
              }}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-md shadow-amber-600/20 active:scale-95 transition-all"
            >
              {editingAppointment ? 'حفظ التعديلات' : 'تأكيد الموعد'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
