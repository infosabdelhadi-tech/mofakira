import React from 'react';
import {
  BookOpen,
  CheckSquare,
  Calendar as CalendarIcon,
  Workflow,
  Users,
  CalendarDays,
  Notebook,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: 'لوحة القيادة الذكية',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      desc: 'نظرة شمولية فورية على مؤشرات الإنجاز، مواعيد اليوم، المهام ذات الأولوية القصوى والعمليات الجارية، مع أزرار الإجراء السريع لإنجاز العمل الإداري بمرونة.'
    },
    {
      title: 'تدبير المهام وجدولتها',
      icon: <CheckSquare className="w-5 h-5 text-teal-600" />,
      desc: 'إدارة المهام وفق المجالات الرسمية للمنظومة التربوية المغربية، مع خاصية الترحيل التلقائي لمهام الأمس المتعثرة، وتعيين المسؤولين والأولويات وتتبع نسب الإنجاز.'
    },
    {
      title: 'التقويم والمواعيد',
      icon: <CalendarIcon className="w-5 h-5 text-indigo-600" />,
      desc: 'جدولة اللقاءات، الاجتماعات، والزيارات التربوية (عرض شهري، أسبوعي، يومي، وأجندة) مع كشف أوتوماتيكي لأي تضارب في المواعيد (Conflict Detection).'
    },
    {
      title: 'برمجة العمليات الكبرى',
      icon: <Workflow className="w-5 h-5 text-blue-600" />,
      desc: 'مشاريع الإدارة والأنشطة التربوية متعددة المراحل (الدخول المدرسي، مشروع المؤسسة، الامتحانات، الصيانة). تتبع كل مرحلة بنسب إنجاز ومؤشرات دقيقة.'
    },
    {
      title: 'محاضر مجالس المؤسسة',
      icon: <Users className="w-5 h-5 text-purple-600" />,
      desc: 'توثيق اجتماعات مجلس التدبير، المجلس التربوي، ومجالس الأقسام والتعليمية. تحويل فوري لقرارات وتوصيات المجلس إلى مهام تنفيذية برمجياً مع تفادي التكرار.'
    },
    {
      title: 'برنامج العمل السنوي',
      icon: <CalendarDays className="w-5 h-5 text-emerald-600" />,
      desc: 'مخطط زمني شامل يمتد على 11 شهراً (من شتنبر إلى يوليوز)، موزع على مجالات ومحاور التدبير ومشاريع خارطة الطريق 2022-2026.'
    },
    {
      title: 'المفكرة اليومية واليوميات',
      icon: <Notebook className="w-5 h-5 text-amber-600" />,
      desc: 'تدوين يومي لأعمال الإدارة، القرارات المتخذة، الملاحظات التربوية والإدارية، مع تسلسل زمني (Timeline) واضح وإمكانية الترحيل.'
    },
    {
      title: 'التقارير الإدارية والتصدير',
      icon: <FileSpreadsheet className="w-5 h-5 text-rose-600" />,
      desc: 'توليد تقارير يومية، أسبوعية، وشهرية رسمية جاهزة للطباعة مع هوية المؤسسة وترويستها وخاتم المدير، وتصدير الجداول إلى ملفات Excel.'
    },
    {
      title: 'النسخ الاحتياطي والأمان المحلي',
      icon: <ShieldCheck className="w-5 h-5 text-cyan-600" />,
      desc: 'حفظ آمن محلي 100% دون خوادم خارجية لحماية خصوصية بيانات المؤسسة، مع إمكانية تصدير واسترجاع نسخة احتياطية مشفرة بضغطة واحدة.'
    },
    {
      title: 'تثبيت التطبيق (PWA)',
      icon: <Smartphone className="w-5 h-5 text-slate-700 dark:text-slate-300" />,
      desc: 'يمكن تثبيت المفكرة مباشرة على شاشة الهاتف الذكي (أندرويد أو آيفون) لتعمل كتطبيق هاتف سريع ومستقل دون الحاجة لمتجر التطبيقات وحتى بدون إنترنت.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                دليل استخدام مفكرة الإدارة التربوية
              </h2>
              <p className="text-xs text-slate-400">نظام التدبير الإداري الرقمي لمديرات ومديري المؤسسات التعليمية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content list */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 leading-relaxed">
            مرحباً بك في مفكرة الإدارة التربوية، صُممت هذه المنظومة خصيصاً لمساعدة أطر الإدارة المدرسية المغربية في إرساء حكامة إدارية متميزة، توثيق السجلات، وتنظيم اليوميات المدرسية بفعالية وسرعة.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {sections.map((sec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  {sec.icon}
                  <span>{sec.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {sec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            إغلاق الدليل
          </button>
        </div>

      </div>
    </div>
  );
};
