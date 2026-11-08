import React from 'react';
import {
  X,
  Bell,
  CheckCheck,
  Clock,
  Calendar as CalendarIcon,
  CheckSquare,
  Workflow,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    snoozeNotification,
    deleteNotification
  } = useApp();

  if (!isNotificationDrawerOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('مفكرة الإدارة التربوية', {
          body: 'تم تفعيل التنبيهات الإدارية بنجاح على هذا المتصفح!',
          icon: '/vite.svg'
        });
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <CalendarIcon className="w-4 h-4 text-amber-500" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-teal-500" />;
      case 'operation':
        return <Workflow className="w-4 h-4 text-indigo-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end" onClick={() => setIsNotificationDrawerOpen(false)}>
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white font-cairo">
                التنبيهات والإشعارات
              </h2>
              <p className="text-xs text-slate-500">
                لديك {unreadCount} إشعار غير مقروء
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNotificationDrawerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Actions: Mark All Read & Enable Browser Notification */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={markAllNotificationsAsRead}
            disabled={unreadCount === 0}
            className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>تعليم الكل كمقروء</span>
          </button>

          <button
            onClick={requestBrowserPermission}
            className="text-slate-600 dark:text-slate-300 hover:text-teal-600 flex items-center gap-1 font-medium"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-500" />
            <span>تفعيل تنبيهات المتصفح</span>
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              لا توجد إشعارات حالياً.
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  notif.read
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-70'
                    : 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400">
                      <span>{new Date(notif.timestamp).toLocaleDateString('ar-MA')}</span>

                      <div className="flex items-center gap-2">
                        {/* Snooze 15 min */}
                        <button
                          onClick={() => snoozeNotification(notif.id, 15)}
                          className="flex items-center gap-1 text-slate-500 hover:text-amber-600"
                          title="تأجيل 15 دقيقة"
                        >
                          <Clock className="w-3 h-3" />
                          <span>تأجيل 15د</span>
                        </button>

                        {!notif.read && (
                          <button
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="text-teal-600 hover:underline font-semibold"
                          >
                            مقروء
                          </button>
                        )}

                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          حذف
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400">
          تطبيق مفكرة الإدارة التربوية • وضع عدم الإزعاج نشط تلقائياً ليلاً
        </div>

      </div>
    </div>
  );
};
