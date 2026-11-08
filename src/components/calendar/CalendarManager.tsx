import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Trash2,
  Edit3,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APPOINTMENT_TYPES, type Appointment, type AppointmentType } from '../../types';

export const CalendarManager: React.FC = () => {
  const {
    appointments,
    setIsAppointmentModalOpen,
    setEditingAppointment,
    deleteAppointment,
    toggleAppointmentCompleted
  } = useApp();

  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [aptToDelete, setAptToDelete] = useState<Appointment | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper date navigation
  const prevPeriod = () => {
    const next = new Date(currentDate);
    if (view === 'month') next.setMonth(next.getMonth() - 1);
    else if (view === 'week') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const nextPeriod = () => {
    const next = new Date(currentDate);
    if (view === 'month') next.setMonth(next.getMonth() + 1);
    else if (view === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const jumpToToday = () => setCurrentDate(new Date());

  // Filtered appointments
  const filteredAppointments = appointments.filter(apt => {
    if (searchQuery && !apt.title.toLowerCase().includes(searchQuery.toLowerCase()) && !apt.attendees.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedType !== 'all' && apt.type !== selectedType) {
      return false;
    }
    return true;
  });

  const getTypeColor = (type: AppointmentType) => {
    switch (type) {
      case 'اجتماع':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200';
      case 'زيارة تربوية':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200';
      case 'لقاء إداري':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200';
      case 'اجتماع مجلس':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200';
      case 'لقاء مع أولياء الأمور':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200';
      case 'نشاط مدرسي':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
      case 'موعد رسمي':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  // Month Grid Calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Arabic days names starting Saturday
  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const monthName = currentDate.toLocaleDateString('ar-MA', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 pb-12">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white font-cairo">
            التقويم والمواعيد المدرسية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            جدولة الاجتماعات، الزيارات التربوية، مجالس المؤسسة، واللقاءات الإدارية
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'month' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
            >
              شهري
            </button>
            <button
              onClick={() => setView('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'agenda' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
            >
              أجندة
            </button>
          </div>

          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsAppointmentModalOpen(true);
            }}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl shadow-md shadow-amber-600/20 active:scale-95 transition-all text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>موعد جديد</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & Controls */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={nextPeriod}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            title="الشهر القادم"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white min-w-[160px] text-center font-cairo">
            {monthName}
          </span>

          <button
            onClick={prevPeriod}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            title="الشهر السابق"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={jumpToToday}
            className="text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl mr-2"
          >
            اليوم
          </button>
        </div>

        {/* Search & Type filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث في المواعيد..."
              className="w-full pl-3 pr-9 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>

          <div className="w-full sm:w-auto shrink-0">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium"
            >
              <option value="all">كل الأنواع</option>
              {APPOINTMENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Month View Calendar */}
      {view === 'month' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-center text-xs font-bold text-slate-600 dark:text-slate-400 py-3">
            {weekDays.map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-700/60">

            {/* Empty boxes before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[90px] sm:min-h-[110px] bg-slate-50/40 dark:bg-slate-900/40 p-1.5 opacity-40" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;

              const dayApts = filteredAppointments.filter(a => a.date === dateStr);

              return (
                <div
                  key={dayNum}
                  className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 flex flex-col transition-colors ${
                    isToday ? 'bg-amber-50/50 dark:bg-amber-950/20 font-bold' : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isToday ? 'bg-amber-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {dayNum}
                    </span>

                    {dayApts.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                        {dayApts.length} موعد
                      </span>
                    )}
                  </div>

                  {/* Appointments in this day */}
                  <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {dayApts.map(apt => (
                      <div
                        key={apt.id}
                        onClick={() => {
                          setEditingAppointment(apt);
                          setIsAppointmentModalOpen(true);
                        }}
                        className={`text-[10px] p-1 rounded-md border truncate cursor-pointer transition-all hover:scale-[1.02] ${
                          getTypeColor(apt.type)
                        } ${apt.isCompleted ? 'line-through opacity-60' : ''}`}
                        title={`${apt.title} (${apt.startTime} - ${apt.endTime})`}
                      >
                        <span className="font-semibold">{apt.startTime}</span> {apt.title}
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}

          </div>

        </div>
      )}

      {/* Agenda / List View */}
      {view === 'agenda' && (
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
              <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                لا توجد مواعيد مبرمجة مطابقة
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                اضغط على &quot;موعد جديد&quot; لجدولة لقاء، اجتماع مجلس، أو زيارة تربوية.
              </p>
            </div>
          ) : (
            filteredAppointments.map(apt => {
              const isPast = apt.date < todayStr;
              return (
                <div
                  key={apt.id}
                  className={`bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border transition-all ${
                    apt.isCompleted
                      ? 'border-emerald-200 dark:border-emerald-950 opacity-80'
                      : isPast
                        ? 'border-slate-200 dark:border-slate-700 opacity-70'
                        : 'border-slate-200 dark:border-slate-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleAppointmentCompleted(apt.id)}
                        className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          apt.isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-amber-500'
                        }`}
                        title={apt.isCompleted ? 'إلغاء الإنجاز' : 'تم عقد اللقاء'}
                      >
                        {apt.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getTypeColor(apt.type)}`}>
                            {apt.type}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            {apt.date} | {apt.startTime} - {apt.endTime}
                          </span>
                        </div>

                        <h3
                          onClick={() => {
                            setEditingAppointment(apt);
                            setIsAppointmentModalOpen(true);
                          }}
                          className={`text-base font-bold cursor-pointer hover:text-amber-600 transition-colors ${
                            apt.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {apt.title}
                        </h3>

                        {apt.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {apt.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                          {apt.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{apt.location}</span>
                            </div>
                          )}

                          {apt.attendees && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>{apt.attendees}</span>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          setEditingAppointment(apt);
                          setIsAppointmentModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="تعديل الموعد"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setAptToDelete(apt)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="حذف الموعد"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {aptToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              تأكيد حذف الموعد
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              هل أنت متأكد من حذف الموعد: &quot;{aptToDelete.title}&quot;؟
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAptToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  deleteAppointment(aptToDelete.id);
                  setAptToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
