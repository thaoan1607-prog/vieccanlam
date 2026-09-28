import React, { useState } from 'react';
import { Bell, Clock, CheckCircle2, Trash2, Edit2, Sparkles, Volume2 } from 'lucide-react';
import { Task, ReminderOption } from '../types/todo';
import { useTheme } from '../context/ThemeContext';
import { playReminderSound, sendBrowserNotification } from '../utils/audio';

interface RemindersViewProps {
  tasks: Task[];
  onSetReminder: (id: string, time: string, option?: ReminderOption) => void;
  onEditTask: (task: Task) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  tasks,
  onSetReminder,
  onEditTask,
}) => {
  const { themeConfig } = useTheme();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState('19:00');
  const [selectedOption, setSelectedOption] = useState<ReminderOption>('custom');

  // Tasks with reminder set
  const remindedTasks = tasks.filter((t) => t.reminderTime && t.reminderTime.trim().length > 0);

  const reminderPresets: { id: ReminderOption; label: string }[] = [
    { id: '5m_before', label: 'Trước 5 phút' },
    { id: '15m_before', label: 'Trước 15 phút' },
    { id: '30m_before', label: 'Trước 30 phút' },
    { id: '1h_before', label: 'Trước 1 giờ' },
    { id: 'custom', label: 'Giờ tùy chỉnh' },
  ];

  const handleTestNotification = () => {
    playReminderSound();
    sendBrowserNotification('🔔 Chuông nhắc việc thử nghiệm', 'Thông báo hoạt động tốt! Bạn sẽ không bỏ lỡ công việc nào.');
  };

  const handleSaveReminder = (taskId: string) => {
    onSetReminder(taskId, customTime, selectedOption);
    setEditingTaskId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
            <Bell className="w-5 h-5 fill-amber-400/20" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Trung tâm Nhắc nhở</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                {remindedTasks.length} chuông hẹn
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đặt thông báo đúng giờ hoặc nhắc trước 5p, 15p, 30p, 1 giờ để không bao giờ quên việc quan trọng.
            </p>
          </div>
        </div>

        <button
          onClick={handleTestNotification}
          type="button"
          className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
        >
          <Volume2 className="w-4 h-4 text-amber-500" />
          <span>Thử chuông nhắc</span>
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {remindedTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              Chưa có công việc nào đặt chuông nhắc
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Bạn có thể mở bất kỳ công việc nào và bấm biểu tượng chuông 🔔 để hẹn giờ nhắc nhở.
            </p>
          </div>
        ) : (
          remindedTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                task.completed ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 font-mono font-bold text-xs shrink-0">
                  🔔
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/40 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700">
                      {task.reminderTime}
                    </span>
                    <span className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    {task.date && <span>Ngày: {task.date}</span>}
                    {task.deadline && <span>Hạn: {task.deadline}</span>}
                    {task.notes && <span className="italic truncate max-w-xs">{task.notes}</span>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {editingTaskId === task.id ? (
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                    <input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                    <button
                      onClick={() => handleSaveReminder(task.id)}
                      className="px-2 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingTaskId(null)}
                      className="text-xs text-slate-400 hover:underline px-1"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setCustomTime(task.reminderTime || '19:00');
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                      title="Đổi giờ nhắc"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSetReminder(task.id, '')}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
                      title="Hủy nhắc nhở"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
