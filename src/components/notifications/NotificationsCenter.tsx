import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckSquare,
  Workflow,
  Users,
  Filter,
  Volume2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { AppNotification } from '../../types';

export const NotificationsCenter: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    snoozeNotification,
    deleteNotification,
    setActiveTab,
    tasks,
    appointments,
    operations
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('مفكرة الإدارة التربوية', {
          body: 'تم تفعيل التنبيهات الإدارية بنجاح على هذا المتصفح!',
          icon: '/favicon.svg'
        });
      }
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'appointment':
        return <CalendarIcon className="w-5 h-5 text-amber-500" />;
      case 'task':
        return <CheckSquare className="w-5 h-5 text-teal-500" />;
      case 'operation':
        return <Workflow className="w-5 h-5 text-indigo-500" />;
      case 'meeting':
        return <Users className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleActionClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.type === 'task') setActiveTab('tasks');
    else if (notif.type === 'appointment') setActiveTab('calendar');
    else if (notif.type === 'operation') setActiveTab('operations');
    else if (notif.type === 'meeting') setActiveTab('meetings');
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    if (filterStatus === 'unread' && n.read) return false;
    if (filterStatus === 'read' && !n.read) return false;
    return true;
  });

  // Calculate live statistics
  const overdueTasksCount = tasks.filter(t => t.status !== 'مكتملة' && t.status !== 'ملغاة' && t.dueDate < new Date().toISOString().split('T')[0]).length;
  const todayAppointmentsCount = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length;
  const delayedOperationsCount = operations.filter(o => o.status === 'متأخرة' || (o.dueDate < new Date().toISOString().split('T')[0] && o.status !== 'مكتملة')).length;

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white font-cairo">
            مركز التنبيهات والإشعارات الذكية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            متابعة التنبيهات الإدارية، المواعيد المبرمجة، المهام العاجلة والمتأخرة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={requestBrowserPermission}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition-all"
          >
            <Volume2 className="w-4 h-4 text-amber-500" />
            <span>تفعيل تنبيهات المتصفح</span>
          </button>

          <button
            onClick={markAllNotificationsAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md disabled:opacity-50 transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            <span>تعليم الكل كمقروء ({unreadCount})</span>
          </button>
        </div>
      </div>

      {/* Real-time Alerts Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">مهام متأخرة عن الأجل</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{overdueTasksCount}</div>
          </div>
          <div className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">مواعيد ولقاءات اليوم</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{todayAppointmentsCount}</div>
          </div>
          <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">عمليات تتطلب المتابعة</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{delayedOperationsCount}</div>
          </div>
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-xl">
            <Workflow className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">تصفية حسب:</span>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
          >
            <option value="all">كل الأنواع</option>
            <option value="task">المهام</option>
            <option value="appointment">المواعيد</option>
            <option value="operation">العمليات</option>
            <option value="meeting">الاجتماعات</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg transition-all ${filterStatus === 'all' ? 'bg-white dark:bg-slate-800 shadow-xs text-teal-600' : 'text-slate-500'}`}
          >
            الكل ({notifications.length})
          </button>
          <button
            onClick={() => setFilterStatus('unread')}
            className={`px-3 py-1 rounded-lg transition-all ${filterStatus === 'unread' ? 'bg-white dark:bg-slate-800 shadow-xs text-teal-600' : 'text-slate-500'}`}
          >
            غير مقروءة ({unreadCount})
          </button>
          <button
            onClick={() => setFilterStatus('read')}
            className={`px-3 py-1 rounded-lg transition-all ${filterStatus === 'read' ? 'bg-white dark:bg-slate-800 shadow-xs text-teal-600' : 'text-slate-500'}`}
          >
            مقروءة ({notifications.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              لا توجد تنبيهات مطابقة للتصفية
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              يتم إنشاء التنبيهات تلقائياً بناءً على مواعيدك ومهامك وعملياتك الإدارية.
            </p>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                notif.read
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-80'
                  : 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-3">
                    <span>{new Date(notif.timestamp).toLocaleString('ar-MA')}</span>
                    {notif.snoozedUntil && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        مؤجل حتى: {new Date(notif.snoozedUntil).toLocaleTimeString('ar-MA')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleActionClick(notif)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  عرض والتنفيذ
                </button>

                {/* Snooze 1 hour */}
                <button
                  onClick={() => snoozeNotification(notif.id, 60)}
                  className="p-2 text-slate-500 hover:text-amber-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="تأجيل لمدة ساعة"
                >
                  <Clock className="w-4 h-4" />
                </button>

                {!notif.read ? (
                  <button
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="p-2 text-slate-500 hover:text-teal-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="تعليم كمقروء"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                ) : null}

                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="حذف التنبيه"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
