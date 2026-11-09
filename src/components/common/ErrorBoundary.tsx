import { Component, type ErrorInfo, type ReactNode } from 'react';
import { exportAllDataAsJSON } from '../../utils/storage';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MOFAKIRA Uncaught ErrorBoundary Exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleExportBackup = () => {
    try {
      const dataStr = exportAllDataAsJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mofakira_emergency_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('تعذر استخراج النسخة الاحتياطية تلقائياً: ' + String(e));
    }
  };

  handleClearCachesAndReload = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      }
    } catch (e) {
      console.warn('Error clearing service worker cache:', e);
    }
    // Hard reload without touching localStorage (user data is 100% preserved)
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-cairo">
          <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-rose-200 dark:border-rose-900/50 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-800">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {this.props.fallbackTitle || 'تنبيه: حدث خطأ غير متوقع أثناء تشغيل الواجهة'}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              تم حماية بياناتك المحفوظة دون أي حذف. يمكنك إعادة تحميل التطبيق، أو تحديث ملفات التخزين المؤقت، أو تنزيل نسخة احتياطية فورية لبيانات المؤسسة.
            </p>

            {this.state.error && (
              <div className="mb-6 text-right bg-slate-50 dark:bg-slate-900/70 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-rose-600 dark:text-rose-400 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
              >
                إعادة تشغيل التطبيق
              </button>

              <button
                type="button"
                onClick={this.handleExportBackup}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-medium rounded-xl text-sm transition-colors"
              >
                تنزيل نسخة احتياطية
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={this.handleClearCachesAndReload}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 underline"
              >
                تحديث ملفات التخزين المؤقت للبرنامج (مع الاحتفاظ بكافة بياناتك)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
