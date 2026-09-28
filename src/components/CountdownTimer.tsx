import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Sparkles, Coffee, Target, Bell, ChevronDown, CheckCircle2 } from 'lucide-react';
import { playReminderSound, sendBrowserNotification } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { Task } from '../types/todo';

interface CountdownTimerProps {
  tasks?: Task[];
  onTaskCompleted?: (taskId: string) => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ tasks = [], onTaskCompleted }) => {
  const { themeConfig, isDark } = useTheme();

  // Presets in minutes
  const presets = [
    { label: '25p Tập trung', minutes: 25, icon: '🎯' },
    { label: '15p Việc nhanh', minutes: 15, icon: '⚡' },
    { label: '5p Nghỉ giải lao', minutes: 5, icon: '☕' },
    { label: '45p Học sâu', minutes: 45, icon: '📚' },
  ];

  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<number | null>(null);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // Set preset
  const handleSelectPreset = (mins: number) => {
    setIsRunning(false);
    setSelectedMinutes(mins);
    setSecondsLeft(mins * 60);
    setIsFinished(false);
  };

  // Add extra time
  const handleAddMinutes = (extraMins: number) => {
    setSecondsLeft((prev) => prev + extraMins * 60);
  };

  // Toggle Start / Pause
  const handleTogglePlay = () => {
    if (isFinished) {
      setSecondsLeft(selectedMinutes * 60);
      setIsFinished(false);
    }
    setIsRunning(!isRunning);
  };

  // Reset
  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(selectedMinutes * 60);
    setIsFinished(false);
  };

  // Timer interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Time is up!
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsFinished(true);
            playReminderSound();
            const taskName = selectedTask ? `"${selectedTask.title}"` : 'Khoảng thời gian này';
            sendBrowserNotification('⏳ Hết giờ đếm ngược!', `Đã hoàn thành thời gian cho ${taskName}. Hãy thư giãn một chút nhé! 🌸`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, selectedTask]);

  // Format MM:SS
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Progress percentage
  const totalSeconds = selectedMinutes * 60;
  const progressPercent = totalSeconds > 0 ? Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100) : 0;

  // SVG circular dimensions
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm transition-all relative overflow-hidden">
      {/* Decorative cute pastel glow behind */}
      <div className={`absolute -right-8 -top-8 w-36 h-36 rounded-full blur-3xl opacity-20 bg-gradient-to-tr ${themeConfig.gradientClass}`} />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 flex items-center justify-center text-sm shadow-2xs">
            ⏳
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>Đồng hồ đếm ngược</span>
              <span className="text-xs font-normal text-slate-400">Pomodoro</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Giữ nhịp tập trung và nghỉ ngơi cân bằng
            </p>
          </div>
        </div>

        {/* Status Mascot Tag */}
        <div className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <span>{isFinished ? '🎉 Hoàn thành!' : isRunning ? '⚡ Đang chạy' : '💤 Tạm dừng'}</span>
        </div>
      </div>

      {/* Task selector to focus on */}
      {tasks.length > 0 && (
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Gắn với công việc đang làm (tùy chọn):
          </label>
          <div className="relative">
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full text-xs py-2 px-3 pr-8 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 appearance-none transition-colors"
            >
              <option value="">-- Không gắn công việc (Đếm giờ tự do) --</option>
              {tasks
                .filter((t) => !t.completed && !t.isSomeday)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.estimatedDuration || '30p'})
                  </option>
                ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Main Clock Face & Circle */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
        {/* Circular Progress Ring */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
            {/* Background ring */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Animated active ring */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className={`transition-all duration-500 ${
                isFinished
                  ? 'text-emerald-500'
                  : isRunning
                  ? 'text-pink-500 dark:text-pink-400'
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            />
          </svg>

          {/* Time digits in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {timeString}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
              {selectedMinutes} phút
            </span>
          </div>
        </div>

        {/* Right side: Controls & Presets */}
        <div className="flex-1 w-full space-y-3">
          {/* Presets Chips */}
          <div className="grid grid-cols-2 gap-1.5">
            {presets.map((p) => (
              <button
                key={p.minutes}
                type="button"
                onClick={() => handleSelectPreset(p.minutes)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                  selectedMinutes === p.minutes
                    ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-300 shadow-2xs font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleTogglePlay}
              type="button"
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-500/25'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Tạm dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isFinished ? 'Bắt đầu lại' : 'Bắt đầu đếm'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              type="button"
              title="Đặt lại từ đầu"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleAddMinutes(5)}
              type="button"
              title="Cộng thêm 5 phút"
              className="px-2.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>5p</span>
            </button>
          </div>

          {/* Quick complete button if attached task */}
          {selectedTask && (
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between text-xs">
              <span className="truncate max-w-[180px] font-semibold text-emerald-900 dark:text-emerald-300">
                🎯 {selectedTask.title}
              </span>
              {onTaskCompleted && (
                <button
                  type="button"
                  onClick={() => onTaskCompleted(selectedTask.id)}
                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold"
                >
                  Xong việc
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
