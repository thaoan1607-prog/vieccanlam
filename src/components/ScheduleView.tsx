import React, { useState } from 'react';
import { Sparkles, Clock, Coffee, Check, AlertCircle, RefreshCw, CalendarDays } from 'lucide-react';
import { Task, ScheduleBlock } from '../types/todo';
import { useTheme } from '../context/ThemeContext';

interface ScheduleViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ tasks, onToggleComplete }) => {
  const { themeConfig } = useTheme();
  const [freeTime, setFreeTime] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [coachingMsg, setCoachingMsg] = useState<string | null>(null);
  const [hasExactHours, setHasExactHours] = useState(false);

  // Active tasks for today
  const activeTodayTasks = tasks.filter((t) => !t.isSomeday);

  const handleGenerateSchedule = async () => {
    if (activeTodayTasks.length === 0) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: activeTodayTasks,
          freeTime,
        }),
      });

      const data = await res.json();
      if (data.timeBlocks) {
        setScheduleBlocks(data.timeBlocks);
        setCoachingMsg(data.coachingMessage || null);
        setHasExactHours(Boolean(data.hasExactHours));
      }
    } catch (err) {
      console.error('Schedule generation failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const periods = [
    { key: 'morning', label: '🌅 Buổi sáng' },
    { key: 'noon', label: '☀️ Buổi trưa' },
    { key: 'afternoon', label: '🌇 Buổi chiều' },
    { key: 'evening', label: '🌙 Buổi tối' },
  ];

  return (
    <div className="space-y-6">
      {/* Control panel for Schedule */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-pink-500" />
              <span>AI Lập lịch trong ngày</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tạo thời gian biểu tối ưu theo phương pháp Time Blocking hoặc chia theo 4 khung buổi trong ngày
            </p>
          </div>

          <button
            onClick={handleGenerateSchedule}
            disabled={activeTodayTasks.length === 0 || isGenerating}
            type="button"
            className={`px-4 py-2 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs disabled:opacity-40 transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${themeConfig.gradientClass}`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang lập lịch...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{scheduleBlocks.length > 0 ? 'Tạo lại lịch trình' : 'Lập lịch tự động'}</span>
              </>
            )}
          </button>
        </div>

        {/* Free-time input */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-700/80">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Thời gian rảnh của bạn hôm nay (tùy chọn):
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={freeTime}
              onChange={(e) => setFreeTime(e.target.value)}
              placeholder="VD: 08:00 - 11:30 và 13:30 - 17:00 (hoặc để trống)"
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-pink-500"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFreeTime('08:00 - 12:00 và 13:30 - 17:30')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-colors"
              >
                Giờ hành chính
              </button>
              <button
                type="button"
                onClick={() => setFreeTime('')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-colors"
              >
                Tự nhiên (4 buổi)
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 italic">
            *Lưu ý: Nếu không cung cấp giờ cụ thể, AI sẽ chia thành Buổi sáng, Buổi trưa, Buổi chiều, Buổi tối mà không tự ý bịa giờ.
          </p>
        </div>
      </div>

      {/* AI Coaching message */}
      {coachingMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{coachingMsg}</p>
        </div>
      )}

      {/* Schedule timeline display */}
      {scheduleBlocks.length > 0 ? (
        <div className="space-y-6">
          {hasExactHours ? (
            /* Time-blocking continuous view */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/40 px-2.5 py-1 rounded-full border border-pink-200 dark:border-pink-800/50">
                  ⏱️ Lịch trình Time-Blocking chi tiết
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bao gồm các khoảng nghỉ ngơi hợp lý</span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-pink-100 dark:before:bg-pink-950">
                {scheduleBlocks.map((block, idx) => {
                  const correspondingTask = tasks.find((t) => t.id === block.taskId);
                  const isDone = correspondingTask?.completed || false;

                  return (
                    <div key={idx} className="relative group">
                      <div
                        className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-xs ${
                          block.isBreak ? 'bg-amber-400' : isDone ? 'bg-emerald-500' : 'bg-pink-500'
                        }`}
                      />

                      <div
                        className={`p-3.5 rounded-2xl border transition-all ${
                          block.isBreak
                            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                            : isDone
                            ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-70'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                              {block.timeSlot}
                            </span>
                            {block.isBreak && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                                <Coffee className="w-3 h-3" /> Nghỉ giải lao
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{block.duration}</span>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span
                            className={`font-bold text-xs sm:text-sm ${
                              block.isBreak
                                ? 'text-amber-900 dark:text-amber-200'
                                : isDone
                                ? 'line-through text-slate-400 dark:text-slate-600'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {block.title}
                          </span>

                          {correspondingTask && (
                            <button
                              onClick={() => onToggleComplete(correspondingTask.id)}
                              type="button"
                              className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                                isDone
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-pink-500'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>{isDone ? 'Đã xong' : 'Xong'}</span>
                            </button>
                          )}
                        </div>

                        {block.advice && (
                          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 italic">{block.advice}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Natural period groups */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {periods.map(({ key, label }) => {
                const blocksInPeriod = scheduleBlocks.filter((b) => b.period === key);
                return (
                  <div key={key} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span>{label}</span>
                      <span className="text-xs font-normal text-slate-400">
                        {blocksInPeriod.length} việc
                      </span>
                    </h4>

                    {blocksInPeriod.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4 text-center">
                        Không có việc xếp trong khung này
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {blocksInPeriod.map((b, idx) => {
                          const task = tasks.find((t) => t.id === b.taskId);
                          const isDone = task?.completed;
                          return (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-2xl border text-xs transition-all ${
                                b.isBreak
                                  ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                                  : isDone
                                  ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-70'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-medium text-slate-500 dark:text-slate-400 text-[11px]">{b.timeSlot}</span>
                                <span className="text-slate-400 text-[11px]">{b.duration}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className={`font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                  {b.title}
                                </span>
                                {task && (
                                  <button
                                    onClick={() => onToggleComplete(task.id)}
                                    type="button"
                                    className={`p-1 px-2 rounded-lg text-[10px] font-bold border ${
                                      isDone
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                    }`}
                                  >
                                    {isDone ? '✓ Xong' : 'Hoàn thành'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Empty / Not yet generated prompt */
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            Bạn chưa lập lịch cho hôm nay
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Bấm nút bên dưới để AI tự động phân bổ các công việc quan trọng vào khung giờ thích hợp nhất.
          </p>
          <button
            onClick={handleGenerateSchedule}
            disabled={activeTodayTasks.length === 0 || isGenerating}
            type="button"
            className={`px-5 py-2.5 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all inline-flex items-center gap-2 bg-gradient-to-r ${themeConfig.gradientClass}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Lập lịch ngay bây giờ</span>
          </button>
        </div>
      )}
    </div>
  );
};
