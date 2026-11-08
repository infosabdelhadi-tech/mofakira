import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Trash2,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MEETING_TYPES, type MeetingType, type MeetingDecision } from '../../types';

export const MeetingModal: React.FC = () => {
  const {
    isMeetingModalOpen,
    setIsMeetingModalOpen,
    editingMeeting,
    setEditingMeeting,
    addMeeting,
    updateMeeting,
    schoolProfile
  } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<MeetingType>('مجلس التدبير');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('15:00 - 17:00');
  const [location, setLocation] = useState('قاعة الاجتماعات بالمؤسسة');
  const [attendees, setAttendees] = useState('');
  const [agendaInput, setAgendaInput] = useState('');
  const [agenda, setAgenda] = useState<string[]>([]);
  const [discussionPoints, setDiscussionPoints] = useState('');
  const [minutes, setMinutes] = useState('');

  // Decisions list
  const [decisions, setDecisions] = useState<MeetingDecision[]>([]);
  const [newDecisionText, setNewDecisionText] = useState('');
  const [newDecisionResponsible, setNewDecisionResponsible] = useState('رئيس المؤسسة');
  const [newDecisionDeadline, setNewDecisionDeadline] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingMeeting) {
      setTitle(editingMeeting.title);
      setType(editingMeeting.type);
      setDate(editingMeeting.date);
      setTime(editingMeeting.time);
      setLocation(editingMeeting.location);
      setAttendees(editingMeeting.attendees);
      setAgenda(editingMeeting.agenda || []);
      setDiscussionPoints(editingMeeting.discussionPoints);
      setMinutes(editingMeeting.minutes);
      setDecisions(editingMeeting.decisions || []);
    } else {
      setTitle('');
      setType('مجلس التدبير');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('15:00 - 17:00');
      setLocation('قاعة الاجتماعات بالمؤسسة');
      setAttendees('السيد المدير، ممثلو الأساتذة، رئيس جمعية الآباء');
      setAgenda([
        'الاطلاع على تقرير الدخول المدرسي وسير العملية التعليمية',
        'مناقشة النظام الداخلي للمؤسسة والمصادقة عليه'
      ]);
      setDiscussionPoints('');
      setMinutes('');
      setDecisions([
        {
          id: 'dec-' + Date.now(),
          decisionText: 'المصادقة على برنامج الأنشطة والعمل السنوي للمؤسسة',
          responsible: 'رئيس المؤسسة',
          deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: 'قيد الانتظار'
        }
      ]);
    }
    setAgendaInput('');
    setErrors({});
  }, [editingMeeting, isMeetingModalOpen]);

  if (!isMeetingModalOpen) return null;

  const handleAddAgendaItem = () => {
    if (!agendaInput.trim()) return;
    setAgenda(prev => [...prev, agendaInput.trim()]);
    setAgendaInput('');
  };

  const handleDeleteAgendaItem = (index: number) => {
    setAgenda(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddDecision = () => {
    if (!newDecisionText.trim()) return;
    const newDec: MeetingDecision = {
      id: 'dec-' + Date.now(),
      decisionText: newDecisionText.trim(),
      responsible: newDecisionResponsible.trim() || schoolProfile.principalName,
      deadline: newDecisionDeadline,
      status: 'قيد الانتظار'
    };
    setDecisions(prev => [...prev, newDec]);
    setNewDecisionText('');
  };

  const handleDeleteDecision = (id: string) => {
    setDecisions(prev => prev.filter(d => d.id !== id));
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) errs.title = 'يرجى إدخال عنوان الاجتماع أو المجلس';
    if (!date) errs.date = 'يرجى تحديد التاريخ';
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
      time,
      location: location.trim(),
      attendees: attendees.trim(),
      agenda,
      discussionPoints: discussionPoints.trim(),
      minutes: minutes.trim(),
      decisions,
      academicYear: schoolProfile.academicYear
    };

    if (editingMeeting) {
      updateMeeting(editingMeeting.id, payload);
    } else {
      addMeeting(payload);
    }

    setIsMeetingModalOpen(false);
    setEditingMeeting(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={() => setIsMeetingModalOpen(false)}>
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-cairo">
              {editingMeeting ? 'تعديل محضر الاجتماع والمجلس' : 'توثيق اجتماع أو مجلس مؤسسة جديد'}
            </h2>
            <p className="text-xs text-slate-500">
              تسجيل جدول الأعمال، خلاصة المناقشات، والقرارات القابلة للتحويل إلى مهام
            </p>
          </div>
          <button
            onClick={() => {
              setIsMeetingModalOpen(false);
              setEditingMeeting(null);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-right">

          {/* Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان الاجتماع أو المجلس <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثال: الدورة العادية الأولى لمجلس التدبير"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.title ? 'border-rose-500 bg-rose-50' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70'} text-slate-800 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500`}
              />
              {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الهيئة أو المجلس
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as MeetingType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white text-sm"
              >
                {MEETING_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time & Location */}
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>التوقيت</span>
              </label>
              <input
                type="text"
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="15:00 - 17:30"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>المكان</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-sm"
              />
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>الأعضاء الحاضرون والصفات</span>
            </label>
            <textarea
              rows={2}
              value={attendees}
              onChange={e => setAttendees(e.target.value)}
              placeholder="السيد المدير (رئيساً)، ممثل هيئة التدريس، ممثل جمعية الآباء، ممثل الجماعة..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-xs"
            />
          </div>

          {/* Agenda Items */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              جدول الأعمال (الأهداف والنقاط المقررة)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={agendaInput}
                onChange={e => setAgendaInput(e.target.value)}
                placeholder="أضف نقطة لجدول الأعمال..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAgendaItem();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddAgendaItem}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-xs font-bold rounded-lg"
              >
                إضافة
              </button>
            </div>

            <div className="space-y-1">
              {agenda.map((ag, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
                  <span>{idx + 1}. {ag}</span>
                  <button type="button" onClick={() => handleDeleteAgendaItem(idx)} className="text-slate-400 hover:text-rose-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Discussion Points & Minutes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>ملخص وقائع الاجتماع والمناقشات</span>
            </label>
            <textarea
              rows={3}
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              placeholder="اكتب ملخصاً تركيبياً لما دار في الاجتماع وأبرز الملاحظات والتوصيات..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-xs"
            />
          </div>

          {/* DECISIONS AND TASKS SECTION */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>القرارات والتوصيات المتخذة ({decisions.length})</span>
              </label>
              <span className="text-[10px] text-teal-600 font-semibold">
                يمكن تحويل أي قرار إلى مهمة عمل تنفيذية بضغطة زر
              </span>
            </div>

            {/* Add Decision Bar */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 mb-3">
              <input
                type="text"
                value={newDecisionText}
                onChange={e => setNewDecisionText(e.target.value)}
                placeholder="نص القرار أو التوصية المعتمدة..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newDecisionResponsible}
                  onChange={e => setNewDecisionResponsible(e.target.value)}
                  placeholder="المكلف بالتنفيذ..."
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="date"
                  value={newDecisionDeadline}
                  onChange={e => setNewDecisionDeadline(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddDecision}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة قرار</span>
                </button>
              </div>
            </div>

            {/* Decisions List */}
            <div className="space-y-2">
              {decisions.map(dec => (
                <div key={dec.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs text-slate-800 dark:text-white">
                      {dec.decisionText}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      المسؤول: {dec.responsible} | الأجل: {dec.deadline} | الحالة: {dec.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleDeleteDecision(dec.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsMeetingModalOpen(false);
                setEditingMeeting(null);
              }}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
            >
              {editingMeeting ? 'حفظ تعديلات المحضر' : 'توثيق الاجتماع والقرارات'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
