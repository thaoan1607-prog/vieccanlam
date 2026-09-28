import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Sparkles, Coffee, Target, CheckCircle2, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { Task } from '../types/todo';
import { playReminderSound, sendBrowserNotification, playDoneSound } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface FocusModeViewProps {
  tasks: Task[];
  onTaskCompleted: (taskId: string) => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({ tasks, onTaskCompleted }) => {
  const { themeConfig } = useTheme();
  const { userSettings } = useAuth();

  const focusDuration = userSettings.pomodoroFocusMinutes || 25;
  const breakDuration = userSettings.pomodoroBreakMinutes || 5;

  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [selectedMinutes, setSelectedMinutes] = useState(focusDuration);
  const [secondsLeft, setSecondsLeft] = useState(focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const [isWhiteNoiseOn, setIsWhiteNoiseOn] = useState(false);

  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  const activeTasks = tasks.filter((t) => !t.completed && !t.isSomeday);
  const currentTask = tasks.find((t) => t.id === selectedTaskId);

  // Set mode: Focus or Break
  const handleSwitchMode = (newMode: 'focus' | 'break') => {
    setIsRunning(false);
    setMode(newMode);
    const mins = newMode === 'focus' ? focusDuration : breakDuration;
    setSelectedMinutes(mins);
    setSecondsLeft(mins * 60);
    setShowCompletionPrompt(false);
  };

  const handleToggleTimer = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(selectedMinutes * 60);
      setShowCompletionPrompt(false);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(selectedMinutes * 60);
    setShowCompletionPrompt(false);
  };

  const handleAddMinutes = (extra: number) => {
    setSecondsLeft((prev) => prev + extra * 60);
  };

  // Timer interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playReminderSound();

            if (mode === 'focus') {
              sendBrowserNotification(
                '🎉 Hết phiên tập trung!',
                currentTask
                  ? `Bạn đã hoàn thành phiên tập trung cho "${currentTask.title}".`
                  : 'Hoàn thành 25 phút tập trung! Bạn có muốn nghỉ ngơi không?'
              );
              setShowCompletionPrompt(true);
            } else {
              sendBrowserNotification(
                '☕ Hết giờ giải lao!',
                'Nghỉ ngơi xong rồi, hãy quay lại phiên làm việc tiếp theo nhé! 🌸'
              );
            }
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
  }, [isRunning, mode, currentTask]);

  // Ambient sound (Soft pink noise generator via Web Audio)
  const toggleWhiteNoise = () => {
    if (isWhiteNoiseOn) {
      if (noiseNodeRef.current) {
        noiseNodeRef.current.disconnect();
      }
      setIsWhiteNoiseOn(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContextClass();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        // Create buffer for pink noise
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2) * 0.04; // Very gentle low volume
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

        noise.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start();

        noiseNodeRef.current = gainNode;
        setIsWhiteNoiseOn(true);
      } catch (err) {
        console.warn('Audio ambient failed', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (noiseNodeRef.current) {
        noiseNodeRef.current.disconnect();
      }
    };
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const totalSeconds = selectedMinutes * 60;
  const progressPercent = totalSeconds > 0 ? Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100) : 0;

  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 text-xs font-bold mb-2">
          <Target className="w-3.5 h-3.5" />
          <span>Phương pháp Pomodoro khoa học</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
          Chế độ Tập trung (Focus Mode)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Chọn một công việc cụ thể, bật đồng hồ và loại bỏ mọi xao nhãng để hoàn thành dứt điểm.
        </p>
      </div>

      {/* Main Focus Console */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center space-y-6">
        {/* Mode switcher tabs: Focus vs Break */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 w-full max-w-xs">
          <button
            type="button"
            onClick={() => handleSwitchMode('focus')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'focus'
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Tập trung ({focusDuration}p)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('break')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'break'
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Nghỉ ngơi ({breakDuration}p)</span>
          </button>
        </div>

        {/* Task Selector */}
        <div className="w-full max-w-md">
          <label className="block text-center text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
            Công việc bạn đang tập trung:
          </label>
          <div className="relative">
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full text-xs sm:text-sm py-2.5 px-4 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-pink-500 appearance-none font-semibold text-center"
            >
              <option value="">-- Chọn một công việc trong ngày để gắn đồng hồ --</option>
              {activeTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.estimatedDuration || '30p'})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Big Circular Clock */}
        <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 170 170">
            <circle
              cx="85"
              cy="85"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="85"
              cy="85"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className={`transition-all duration-500 ${
                mode === 'break' ? 'text-amber-400' : 'text-pink-500 dark:text-pink-400'
              }`}
            />
          </svg>

          {/* Digits in middle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              {timeString}
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-1">
              {mode === 'focus' ? '🎯 Phiên Tập trung' : '☕ Phiên Giải lao'}
            </span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleTimer}
            type="button"
            className={`py-3 px-8 rounded-2xl font-black text-sm text-white shadow-md transition-all active:scale-95 flex items-center gap-2 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-500/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Bắt đầu</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            type="button"
            title="Đặt lại đồng hồ"
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleAddMinutes(5)}
            type="button"
            title="Thêm 5 phút"
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>5p</span>
          </button>

          {/* White noise ambient button */}
          <button
            onClick={toggleWhiteNoise}
            type="button"
            title={isWhiteNoiseOn ? 'Tắt tiếng ồn trắng tập trung' : 'Bật tiếng ồn trắng tập trung'}
            className={`p-3 rounded-2xl border transition-colors ${
              isWhiteNoiseOn
                ? 'bg-pink-100 dark:bg-pink-950/60 border-pink-300 text-pink-700 dark:text-pink-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            {isWhiteNoiseOn ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Completion Prompt Modal */}
      {showCompletionPrompt && (
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/40 rounded-3xl border border-emerald-300 dark:border-emerald-800 text-center space-y-3 animate-in zoom-in-95">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-emerald-950 dark:text-emerald-100">
            Bạn đã hoàn thành công việc này chưa?
          </h3>
          {currentTask && (
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Công việc: "{currentTask.title}"
            </p>
          )}
          <div className="flex items-center justify-center gap-2 pt-1">
            {currentTask && (
              <button
                type="button"
                onClick={() => {
                  onTaskCompleted(currentTask.id);
                  playDoneSound();
                  setShowCompletionPrompt(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                ✓ Đánh dấu hoàn thành
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                handleAddMinutes(5);
                setShowCompletionPrompt(false);
                setIsRunning(true);
              }}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs"
            >
              Cần thêm 5 phút
            </button>
            <button
              type="button"
              onClick={() => setShowCompletionPrompt(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-500"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
