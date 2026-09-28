import React, { useState, useEffect } from 'react';
import { X, Circle, Sparkles, Copy, Check, CalendarPlus } from 'lucide-react';
import { Task } from '../types/todo';
import { useTheme } from '../context/ThemeContext';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onMoveUnfinishedToTomorrow: () => void;
}

export const DailySummaryModal: React.FC<DailySummaryModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onMoveUnfinishedToTomorrow,
}) => {
  const { themeConfig } = useTheme();
  const [copied, setCopied] = useState(false);
  const [aiData, setAiData] = useState<{
    summaryText: string;
    encouragement: string;
    tomorrowSuggestions?: string[];
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const todayTasks = tasks.filter((t) => !t.isSomeday);
  const completedTasks = todayTasks.filter((t) => t.completed);
  const pendingTasks = todayTasks.filter((t) => !t.completed);

  useEffect(() => {
    if (isOpen) {
      fetchAiSummary();
    }
  }, [isOpen]);

  const fetchAiSummary = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/daily-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedTasks,
          pendingTasks,
        }),
      });
      const data = await res.json();
      setAiData({
        summaryText: data.summaryText,
        encouragement: data.encouragement,
        tomorrowSuggestions: data.tomorrowSuggestions,
      });
    } catch (err) {
      console.error('Failed to get summary', err);
      setAiData({
        summaryText: `Hôm nay bạn đã hoàn thành ${completedTasks.length} việc! Còn lại ${pendingTasks.length} việc có thể nhẹ nhàng chuyển sang ngày mai.`,
        encouragement: 'Bạn đã rất cố gắng hôm nay. Hãy nghỉ ngơi để nạp lại năng lượng nhé! 🌸',
      });
    } finally {
      setLoadingAi(false);
    }
  };

  const copyToClipboard = () => {
    const text = `📊 TỔNG KẾT HÔM NAY
✓ Đã hoàn thành: ${completedTasks.length} việc
${completedTasks.map((t) => `  - ${t.title}`).join('\n')}

○ Chưa hoàn thành: ${pendingTasks.length} việc
${pendingTasks.map((t) => `  - ${t.title}`).join('\n')}

💡 Lời nhắn:
${aiData?.encouragement || 'Những công việc chưa hoàn thành có thể được chuyển sang ngày mai.'}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95">
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between bg-gradient-to-r ${themeConfig.gradientClass}`}>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">TỔNG KẾT HÔM NAY</h3>
              <p className="text-xs text-white/90 font-medium">Bản đánh giá tiến độ ấm áp và khích lệ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Stat counters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-lg">
                ✓
              </div>
              <div>
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold uppercase">Đã hoàn thành</span>
                <div className="text-2xl font-black text-emerald-950 dark:text-emerald-100">{completedTasks.length} việc</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-lg">
                ○
              </div>
              <div>
                <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold uppercase">Chưa hoàn thành</span>
                <div className="text-2xl font-black text-amber-950 dark:text-amber-100">{pendingTasks.length} việc</div>
              </div>
            </div>
          </div>

          {/* Pending tasks list */}
          {pendingTasks.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <span>🎯 Công việc còn lại:</span>
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 pl-1">
                {pendingTasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-2">
                    <Circle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{t.title}</span>
                    {t.notes && <span className="text-[11px] text-slate-400 italic">({t.notes})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Message / Encouragement */}
          <div className="bg-pink-50/80 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800/60 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-900 dark:text-pink-300 mb-1.5">
              <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span>Lời nhắn & Gợi ý từ Trợ lý:</span>
            </div>
            {loadingAi ? (
              <p className="text-xs text-pink-700 dark:text-pink-400 italic animate-pulse">
                Đang chuẩn bị bản tổng kết ấm áp cho bạn...
              </p>
            ) : (
              <>
                <p className="text-xs sm:text-sm text-pink-950 dark:text-pink-100 leading-relaxed font-medium">
                  {aiData?.summaryText}
                </p>
                <p className="text-xs text-pink-700 dark:text-pink-300 mt-2 italic leading-relaxed">
                  💡 {aiData?.encouragement || 'Những công việc chưa hoàn thành có thể được chuyển sang ngày mai.'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={copyToClipboard}
            type="button"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Sao chép tổng kết</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {pendingTasks.length > 0 && (
              <button
                onClick={() => {
                  onMoveUnfinishedToTomorrow();
                  onClose();
                }}
                type="button"
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-all flex items-center gap-1.5 bg-gradient-to-r ${themeConfig.gradientClass}`}
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Chuyển việc còn lại sang ngày mai</span>
              </button>
            )}
            <button
              onClick={onClose}
              type="button"
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
