import React, { useState } from 'react';
import {
  Globe,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { exportMizaniBackup, validateMizaniBackup, restoreMizaniBackup } from '../../utils/financeStorage';
import type { SupportedLanguage, CurrencyCode } from '../../types/finance';

export const MizaniSettings: React.FC = () => {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    loadDemo,
    resetAll,
    t
  } = useFinance();

  const [restoreStatus, setRestoreStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Handle Export Backup
  const handleExport = () => {
    const jsonStr = exportMizaniBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mizani_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Import Backup
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateMizaniBackup(content);
      if (!validation.isValid || !validation.data) {
        setRestoreStatus({ success: false, message: validation.error || 'الملف غير صالح' });
        return;
      }

      if (window.confirm(`هل أنت متأكد من استرجاع النسخة؟ تتضمن ${validation.summary?.transactionsCount} معاملة و ${validation.summary?.accountsCount} حساب.`)) {
        const res = restoreMizaniBackup(validation.data);
        if (res.success) {
          setRestoreStatus({ success: true, message: 'تم استرجاع النسخة الاحتياطية بنجاح! سيتم تحديث الصفحة...' });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setRestoreStatus({ success: false, message: res.error || 'فشلت الاستعادة' });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          {t('settings')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          تخصيص اللغة والعملة، تصدير واسترجاع النسخ الاحتياطية وإدارة البيانات.
        </p>
      </div>

      {restoreStatus && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm ${
            restoreStatus.success
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200'
          }`}
        >
          {restoreStatus.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{restoreStatus.message}</span>
        </div>
      )}

      {/* Regional & Localization Settings */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
        <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <span>اللغة والعملة الإقليمية</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('language')} (Language)
            </label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as SupportedLanguage)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ar">العربية (Arabic - RTL)</option>
              <option value="fr">Français (French - LTR)</option>
              <option value="en">English (English - LTR)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('currency')} (Default Currency)
            </label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="MAD">MAD - درهم مغربي (Moroccan Dirham)</option>
              <option value="USD">USD - دولار أمريكي ($ US Dollar)</option>
              <option value="EUR">EUR - يورو (€ Euro)</option>
              <option value="GBP">GBP - جنيه إسترليني (£ British Pound)</option>
              <option value="SAR">SAR - ريال سعودي (Saudi Riyal)</option>
              <option value="AED">AED - درهم إماراتي (UAE Dirham)</option>
              <option value="CAD">CAD - دولار كندي (Canadian Dollar)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          <span>النسخ الاحتياطي واسترجاع البيانات (Local-First JSON)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          تطبيق "ميزانيتي" يعتمد معمارية التخزين المحلي الآمن 100%. بياناتك المالية لا تغادر جهازك أبداً. يمكنك تنزيل ملف احتياطي في أي وقت أو استرجاعه.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية شاملة (.json)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>استيراد واسترجاع نسخة احتياطية</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Demo & Reset Controls */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>إدارة بيانات الاختبار والتهيئة</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              if (window.confirm('هل تود استبدال البيانات الحالية بنموذج تجريبي استكشافي؟')) {
                loadDemo();
              }
            }}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-600 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>تحميل بيانات تجريبية مغربية</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('تحذير: هل أنت متأكد من مسح وتصفير كافة المعاملات والديون والادخارات والبدء من جديد؟')) {
                resetAll();
              }
            }}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-rose-200 dark:border-rose-900 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تصفير ومسح السجلات المالية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
