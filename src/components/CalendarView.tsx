import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Task, Priority } from '../types/todo';
import { useTheme } from '../context/ThemeContext';

interface CalendarViewProps {
  tasks: Task[];
  onAddTaskOnDate: (date: string, hour?: string) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
}

export type CalendarMode = 'day' | 'week' | 'month';

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onAddTaskOnDate,
  onEditTask,
  onToggleComplete,
}) => {
  const { themeConfig } = useTheme();
  const [mode, setMode] = useState<CalendarMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  const priorityColors: Record<Priority, string> = {
    high_urgent: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300',
    medium_important: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
    quick_task: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
    someday_idea: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
  };

  // Helper date utils
  const getYear = currentDate.getFullYear();
  const getMonth = currentDate.getMonth();

  const handlePrev = () => {
    if (mode === 'month') {
      setCurrentDate(new Date(getYear, getMonth - 1, 1));
    } else if (mode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (mode === 'month') {
      setCurrentDate(new Date(getYear, getMonth + 1, 1));
    } else if (mode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Format date helper: YYYY-MM-DD
  const formatYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatYMD(new Date());

  // Filter tasks for calendar
  const activeTasks = tasks.filter((t) => (showCompleted ? true : !t.completed));

  // MONTH VIEW CALCULATION
  const firstDayOfMonth = new Date(getYear, getMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(getYear, getMonth + 1, 0).getDate();
  const monthDays = [];

  // Monday-first offset adjustment
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  for (let i = 0; i < startDayOffset; i++) {
    monthDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    monthDays.push(new Date(getYear, getMonth, i));
  }

  // WEEK VIEW CALCULATION (Monday to Sunday)
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const weekStart = getStartOfWeek(currentDate);
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    weekDays.push(day);
  }

  // DAY VIEW HOURS
  const dayHours = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00'
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Lịch Công việc</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Tháng {getMonth + 1}, {getYear}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý thời gian, xem deadline và kéo sắp xếp lịch trình khoa học
            </p>
          </div>
        </div>

        {/* View Toggle + Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'day'
                  ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => setMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tháng
            </button>
          </div>

          {/* Toggle completed visibility */}
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            type="button"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
            title={showCompleted ? 'Ẩn việc đã hoàn thành' : 'Hiện việc đã hoàn thành'}
          >
            {showCompleted ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Prev / Today / Next */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              type="button"
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              type="button"
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              Hôm nay
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. MONTH VIEW */}
      {mode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span>CN</span>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {monthDays.map((dayDate, idx) => {
              if (!dayDate) {
                return <div key={`empty-${idx}`} className="h-24 sm:h-28 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30" />;
              }

              const dateStr = formatYMD(dayDate);
              const isToday = dateStr === todayStr;
              const tasksOnDay = activeTasks.filter((t) => t.date === dateStr || (!t.date && isToday));

              return (
                <div
                  key={dateStr}
                  className={`h-24 sm:h-28 rounded-2xl border p-1.5 sm:p-2 flex flex-col justify-between transition-all overflow-hidden group ${
                    isToday
                      ? 'border-pink-400 dark:border-pink-600 bg-pink-50/30 dark:bg-pink-950/20 shadow-2xs'
                      : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold px-1.5 py-0.2 rounded-md ${
                        isToday
                          ? 'bg-pink-500 text-white font-black'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayDate.getDate()}
                    </span>
                    <button
                      onClick={() => onAddTaskOnDate(dateStr)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-pink-600"
                      title="Thêm việc ngày này"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Tasks on this day preview */}
                  <div className="flex-1 overflow-y-auto space-y-1">
                    {tasksOnDay.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onEditTask(t)}
                        title={`${t.title} (${t.time || t.estimatedDuration || ''})`}
                        className={`text-[10px] truncate px-1.5 py-0.5 rounded-md font-semibold cursor-pointer border ${
                          priorityColors[t.priority] || priorityColors.medium_important
                        } ${t.completed ? 'line-through opacity-60' : ''}`}
                      >
                        {t.time ? `${t.time} ` : ''}
                        {t.title}
                      </div>
                    ))}
                    {tasksOnDay.length > 3 && (
                      <span className="text-[9px] font-bold text-slate-400 block px-1">
                        +{tasksOnDay.length - 3} việc khác
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {mode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[650px]">
            {weekDays.map((dayDate) => {
              const dateStr = formatYMD(dayDate);
              const isToday = dateStr === todayStr;
              const tasksOnDay = activeTasks.filter((t) => t.date === dateStr || (!t.date && isToday));
              const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

              return (
                <div
                  key={dateStr}
                  className={`rounded-2xl border p-3 min-h-[300px] flex flex-col justify-between ${
                    isToday
                      ? 'border-pink-400 dark:border-pink-600 bg-pink-50/30 dark:bg-pink-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/50'
                  }`}
                >
                  <div>
                    <div className="text-center pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">
                        {dayNames[dayDate.getDay()]}
                      </span>
                      <span
                        className={`inline-block mt-0.5 text-xs font-black px-2 py-0.5 rounded-full ${
                          isToday
                            ? 'bg-pink-500 text-white'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {dayDate.getDate()}/{dayDate.getMonth() + 1}
                      </span>
                    </div>

                    {/* Task cards */}
                    <div className="space-y-1.5">
                      {tasksOnDay.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => onEditTask(t)}
                          className={`p-2 rounded-xl text-xs font-semibold cursor-pointer border ${
                            priorityColors[t.priority] || priorityColors.medium_important
                          } ${t.completed ? 'line-through opacity-60' : ''}`}
                        >
                          <div className="font-bold truncate">{t.title}</div>
                          {t.time && <div className="text-[10px] opacity-80">⏰ {t.time}</div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onAddTaskOnDate(dateStr)}
                    className="mt-3 w-full py-1 text-center text-xs font-semibold text-slate-400 hover:text-pink-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm việc</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DAY VIEW (Hourly Time Slots) */}
      {mode === 'day' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                Lịch chi tiết theo giờ
              </span>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                {currentDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
            </div>
            <button
              onClick={() => onAddTaskOnDate(formatYMD(currentDate))}
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1 bg-gradient-to-r ${themeConfig.gradientClass}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm việc hôm nay</span>
            </button>
          </div>

          {/* Hourly Slots */}
          <div className="space-y-2">
            {dayHours.map((hour) => {
              const curDateStr = formatYMD(currentDate);
              const tasksAtHour = activeTasks.filter(
                (t) =>
                  (t.date === curDateStr || (!t.date && curDateStr === todayStr)) &&
                  t.time &&
                  t.time.startsWith(hour.slice(0, 2))
              );

              return (
                <div
                  key={hour}
                  className="flex items-start gap-3 p-2 rounded-2xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <span className="font-mono text-xs font-bold text-slate-400 w-12 shrink-0 pt-1">
                    {hour}
                  </span>

                  <div className="flex-1 flex flex-wrap gap-2">
                    {tasksAtHour.length > 0 ? (
                      tasksAtHour.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => onEditTask(t)}
                          className={`p-2 rounded-xl text-xs font-bold cursor-pointer border flex items-center gap-2 ${
                            priorityColors[t.priority] || priorityColors.medium_important
                          }`}
                        >
                          <span className={t.completed ? 'line-through opacity-70' : ''}>{t.title}</span>
                          <span className="text-[10px] opacity-75">({t.estimatedDuration})</span>
                        </div>
                      ))
                    ) : (
                      <button
                        onClick={() => onAddTaskOnDate(curDateStr, hour)}
                        className="text-xs text-slate-300 dark:text-slate-600 group-hover:text-slate-500 italic py-1"
                      >
                        + Nhấp để đặt công việc vào khung {hour}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
