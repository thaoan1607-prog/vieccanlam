import React from 'react';
import { Trophy, CheckCircle, Flame } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ProgressBarProps {
  completedCount: number;
  totalCount: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completedCount, totalCount }) => {
  const { themeConfig } = useTheme();
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Generate ASCII progress bar representation matching requirement (██████░░░░)
  const totalBlocks = 10;
  const filledBlocks = Math.round((percent / 100) * totalBlocks);
  const asciiBar = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  let statusText = 'Bắt đầu ngày mới đầy năng lượng nhé!';
  let badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (totalCount === 0) {
    statusText = 'Chưa có công việc nào trong danh sách hôm nay.';
  } else if (percent === 100) {
    statusText = 'Tuyệt vời! Bạn đã hoàn thành 100% việc hôm nay! 🎉';
    badgeColor = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
  } else if (percent >= 60) {
    statusText = 'Tiến độ rất tốt, sắp về đích rồi! 🌸';
    badgeColor = 'bg-pink-100 dark:bg-pink-950/60 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800';
  } else if (percent > 0) {
    statusText = 'Đang tiến triển đều đặn, tiếp tục nào!';
    badgeColor = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400">
            {percent === 100 ? (
              <Trophy className="w-5 h-5 text-amber-500 fill-amber-400/20" />
            ) : percent >= 50 ? (
              <Flame className="w-5 h-5 text-orange-500 fill-orange-400/20" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                Tiến độ hôm nay:
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50">
                {percent}%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              <strong className="text-slate-800 dark:text-slate-200">{completedCount}/{totalCount}</strong> công việc đã hoàn thành
            </p>
          </div>
        </div>

        {/* ASCII & Encouragement badge */}
        <div className="flex sm:flex-col items-end gap-1.5">
          <div className="font-mono text-xs text-pink-600 dark:text-pink-400 tracking-wider font-semibold select-none hidden md:block">
            [{asciiBar}]
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r ${
            percent === 100
              ? 'from-emerald-400 to-teal-400'
              : themeConfig.gradientClass
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
