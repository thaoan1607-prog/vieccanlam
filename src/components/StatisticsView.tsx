import React, { useState } from 'react';
import { BarChart3, CheckCircle2, Clock, AlertTriangle, TrendingUp, Calendar, Trophy, Sparkles } from 'lucide-react';
import { Task } from '../types/todo';
import { useTheme } from '../context/ThemeContext';

interface StatisticsViewProps {
  tasks: Task[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ tasks }) => {
  const { themeConfig } = useTheme();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');

  const todayStr = new Date().toISOString().split('T')[0];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const overdueTasks = tasks.filter(
    (t) => !t.completed && ((t.deadline && t.deadline < todayStr) || (t.date && t.date < todayStr))
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Mock days of week data for visualization
  const weekDaysData = [
    { day: 'T2', done: 5, total: 6 },
    { day: 'T3', done: 4, total: 5 },
    { day: 'T4', done: 6, total: 7 },
    { day: 'T5', done: 3, total: 4 },
    { day: 'T6', done: 5, total: 5 },
    { day: 'T7', done: 2, total: 3 },
    { day: 'CN', done: 1, total: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Báo cáo & Thống kê Hiệu suất</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Theo dõi nhịp độ hoàn thành công việc và tỷ lệ đạt mục tiêu cá nhân
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'week'
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tuần này
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'month'
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'all'
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tổng công việc</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {totalTasks}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Tất cả mục đã ghi</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Đã hoàn thành</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {completedTasks}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Đạt {completionRate}%</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Chưa xong</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {pendingTasks}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Đang chờ thực hiện</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Quá hạn</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
            {overdueTasks}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Cần ưu tiên xử lý</span>
        </div>
      </div>

      {/* Visual Chart Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              Tiến độ tuần này (Thứ 2 – Chủ Nhật)
            </h3>
            <p className="text-xs text-slate-400">
              Số lượng việc đã hoàn thành so với tổng số lượng mỗi ngày
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300">
            Tỷ lệ tuần: 82%
          </span>
        </div>

        {/* Bar chart visualization */}
        <div className="grid grid-cols-7 gap-3 sm:gap-6 pt-4 items-end min-h-[180px]">
          {weekDaysData.map((d, idx) => {
            const barHeightPercent = Math.round((d.done / 7) * 100);
            return (
              <div key={idx} className="flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-pink-600 transition-colors">
                  {d.done}/{d.total}
                </span>

                {/* Track and Bar */}
                <div className="w-full max-w-[36px] h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-end p-1 overflow-hidden">
                  <div
                    className={`w-full rounded-xl transition-all duration-700 bg-gradient-to-t ${themeConfig.gradientClass}`}
                    style={{ height: `${Math.max(barHeightPercent, 15)}%` }}
                  />
                </div>

                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Encouragement AI Box */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 rounded-3xl border border-pink-200 dark:border-pink-800/60 flex items-start gap-3">
        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs shrink-0">
          <Trophy className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
            <span>Nhận xét năng suất từ Trợ lý AI</span>
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            "Bạn đang duy trì nhịp độ làm việc rất ổn định! Hãy tiếp tục chia nhỏ các việc lớn thành subtask và dùng chế độ Pomodoro 25 phút để giữ năng lượng sảng khoái suốt cả ngày nhé."
          </p>
        </div>
      </div>
    </div>
  );
};
