import React, { useState } from 'react';
import {
  Users,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  CheckSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MEETING_TYPES, type Meeting } from '../../types';

export const MeetingsManager: React.FC = () => {
  const {
    meetings,
    setIsMeetingModalOpen,
    setEditingMeeting,
    deleteMeeting,
    convertDecisionToTask,
    updateDecisionStatus,
    setActiveTab
  } = useApp();

  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(meetings[0]?.id || null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedMeetingId(prev => prev === id ? null : id);
  };

  const filteredMeetings = meetings.filter(m => {
    if (selectedType !== 'all' && m.type !== selectedType) return false;
    if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase()) && !m.attendees.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Calculate total decisions tracked
  const allDecisions = meetings.flatMap(m => m.decisions || []);
  const completedDecisions = allDecisions.filter(d => d.status === 'تم التنفيذ').length;

  return (
    <div className="space-y-6 pb-12">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white font-cairo">
            المجالس والاجتماعات وتتبع القرارات
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            توثيق محاضر مجالس المؤسسة، وتتبع تنفيذ القرارات وتحويلها لمهام عملية ({meetings.length} اجتماع)
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMeeting(null);
            setIsMeetingModalOpen(true);
          }}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all text-xs sm:text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>توثيق اجتماع جديد</span>
        </button>
      </div>

      {/* Decision Tracking Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">إجمالي القرارات الصادرة</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{allDecisions.length}</div>
          </div>
          <div className="p-3 bg-teal-100 dark:bg-teal-950 text-teal-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">القرارات المنفذة</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{completedDecisions}</div>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">قرارات قيد التتبع والتنفيذ</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{allDecisions.length - completedDecisions}</div>
          </div>
          <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في محاضر الاجتماعات..."
            className="w-full pl-3 pr-9 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
          >
            <option value="all">كل الهيئات والمجالس</option>
            {MEETING_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Meetings Accordion List */}
      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              لا توجد اجتماعات مسجلة
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              قم بتوثيق اجتماعات مجلس التدبير، المجلس التربوي، أو المجالس التعليمية للمؤسسة.
            </p>
          </div>
        ) : (
          filteredMeetings.map(meeting => {
            const isExpanded = expandedMeetingId === meeting.id;

            return (
              <div
                key={meeting.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden transition-all"
              >
                {/* Meeting Header Row */}
                <div
                  onClick={() => toggleExpand(meeting.id)}
                  className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40 select-none"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200">
                          {meeting.type}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {meeting.date} ({meeting.time})
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {meeting.title}
                      </h3>

                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                        <span>المكان: {meeting.location}</span>
                        <span>•</span>
                        <span>{meeting.decisions.length} قرارات متخذة</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMeeting(meeting);
                        setIsMeetingModalOpen(true);
                      }}
                      className="p-2 text-slate-500 hover:text-teal-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="تعديل"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMeetingToDelete(meeting);
                      }}
                      className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in">

                    {/* Attendees */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        الأعضاء الحاضرون:
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        {meeting.attendees}
                      </p>
                    </div>

                    {/* Agenda */}
                    {meeting.agenda && meeting.agenda.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          جدول الأعمال:
                        </h4>
                        <div className="space-y-1">
                          {meeting.agenda.map((ag, i) => (
                            <div key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                              <span>{ag}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Minutes Summary */}
                    {meeting.minutes && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          خلاصة المحضر والمناقشات:
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">
                          {meeting.minutes}
                        </p>
                      </div>
                    )}

                    {/* Actionable Decisions List */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>القرارات والتوصيات المتخذة ({meeting.decisions.length})</span>
                        </h4>
                        <span className="text-[11px] text-teal-600 font-semibold">
                          اضغط على &quot;تحويل لمهمة&quot; لأجرأة القرار فوراً
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {meeting.decisions.map(dec => (
                          <div
                            key={dec.id}
                            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex-1">
                              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {dec.decisionText}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                                <span>المكلف: <strong className="text-slate-600 dark:text-slate-300">{dec.responsible}</strong></span>
                                <span>•</span>
                                <span>الأجل: {dec.deadline}</span>
                                {dec.convertedTaskId && (
                                  <>
                                    <span>•</span>
                                    <span
                                      onClick={() => setActiveTab('tasks')}
                                      className="text-teal-600 hover:underline cursor-pointer font-bold"
                                    >
                                      مرتبط بمهمة نشطة
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <select
                                value={dec.status}
                                onChange={e => updateDecisionStatus(meeting.id, dec.id, e.target.value as any)}
                                className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${
                                  dec.status === 'تم التنفيذ' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                  dec.status === 'قيد التنفيذ' ? 'bg-teal-100 text-teal-800 border-teal-300' :
                                  'bg-slate-100 text-slate-700 border-slate-300'
                                }`}
                              >
                                <option value="قيد الانتظار">قيد الانتظار</option>
                                <option value="قيد التنفيذ">قيد التنفيذ</option>
                                <option value="تم التنفيذ">تم التنفيذ</option>
                                <option value="ملغى">ملغى</option>
                              </select>

                                {dec.convertedTaskId ? (
                                  <button
                                    onClick={() => setActiveTab('tasks')}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs rounded-lg border border-emerald-200 dark:border-emerald-800"
                                    title="القرار محول مسبقاً لمهمة - اضغط للانتقال إليها"
                                  >
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>تم التحويل لمهمة</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => convertDecisionToTask(meeting.id, dec)}
                                    className="flex items-center gap-1 px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg shadow-xs transition-transform active:scale-95"
                                    title="تحويل هذا القرار إلى مهمة عمل في جدول المهام"
                                  >
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    <span>تحويل لمهمة</span>
                                  </button>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {meetingToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              تأكيد حذف محضر الاجتماع
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              هل أنت متأكد من حذف محضر: &quot;{meetingToDelete.title}&quot;؟
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setMeetingToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  deleteMeeting(meetingToDelete.id);
                  setMeetingToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                حذف المحضر
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
