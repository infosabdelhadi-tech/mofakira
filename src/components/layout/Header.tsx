import React from 'react';
import {
  Bell,
  Search,
  Moon,
  Sun,
  Calendar as CalendarIcon,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    schoolProfile,
    notifications,
    setIsNotificationDrawerOpen,
    setIsSearchOpen,
    isDarkMode,
    toggleDarkMode,
    setActiveTab
  } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Format today in Arabic
  const today = new Date();
  const gregorianDate = today.toLocaleDateString('ar-MA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate approximate Hijri date
  const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(today);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Right side: School Title & Logo */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-base text-slate-900 dark:text-white leading-tight font-cairo">
                    مفكرة الإدارة التربوية
                  </h1>
                  <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    التعليم الابتدائي
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                  {schoolProfile.schoolName}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Gregorian & Hijri Date */}
          <div className="hidden md:flex flex-col items-center justify-center text-xs text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-medium">
              <CalendarIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{gregorianDate}</span>
              <span className="text-slate-400">|</span>
              <span className="text-amber-600 dark:text-amber-400 font-tajawal">{hijriDate} هـ</span>
            </div>
          </div>

          {/* Left side: Search, Notifications, Theme toggle */}
          <div className="flex items-center gap-2">

            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              title="بحث شامل (Ctrl+K)"
              className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded-xl transition-all"
            >
              <Search className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="hidden lg:inline">بحث في المفكرة...</span>
              <kbd className="hidden lg:inline-block text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationDrawerOpen(true)}
              className="relative p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="الإشعارات والتنبيهات"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
