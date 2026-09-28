import React, { useState } from 'react';
import {
  Check,
  Clock,
  Hourglass,
  FileText,
  Bell,
  Trash2,
  Edit2,
  Bookmark,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { Task, Priority, TimeOfDay } from '../types/todo';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onChangePriority: (id: string, priority: Priority) => void;
  onToggleSomeday: (id: string) => void;
  onSetReminder: (id: string, time: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onChangePriority,
  onToggleSomeday,
  onSetReminder,
}) => {
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [isEditingReminder, setIsEditingReminder] = useState(false);
  const [reminderInput, setReminderInput] = useState(task.reminderTime || '');

  // Priority configs with pastel tones
  const priorityMap: Record<
    Priority,
    { label: string; badgeClass: string; dotClass: string; icon: string }
  > = {
    high_urgent: {
      label: 'Quan trọng & Khẩn cấp',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/50 hover:bg-rose-100',
      dotClass: 'bg-rose-500',
      icon: '🔴',
    },
    medium_important: {
      label: 'Quan trọng',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-100',
      dotClass: 'bg-amber-500',
      icon: '🟡',
    },
    quick_task: {
      label: 'Việc nhanh',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50 hover:bg-emerald-100',
      dotClass: 'bg-emerald-500',
      icon: '🟢',
    },
    someday_idea: {
      label: 'Để sau',
      badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200',
      dotClass: 'bg-slate-400',
      icon: '⚪',
    },
  };

  const periodLabelMap: Record<TimeOfDay, string> = {
    morning: '🌅 Buổi sáng',
    noon: '☀️ Buổi trưa',
    afternoon: '🌇 Buổi chiều',
    evening: '🌙 Buổi tối',
    unassigned: 'Chưa xếp buổi',
  };

  const currentPriority = priorityMap[task.priority] || priorityMap.medium_important;

  const handleSaveReminder = () => {
    onSetReminder(task.id, reminderInput);
    setIsEditingReminder(false);
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all p-3.5 sm:p-4 ${
        task.completed
          ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40 opacity-70'
          : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-pink-300 dark:hover:border-pink-800 hover:shadow-xs shadow-2xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox: ☐ / ✓ with cute rounded styling */}
        <button
          onClick={() => onToggleComplete(task.id)}
          title={task.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
          type="button"
          className={`shrink-0 mt-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-xl border flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs ring-2 ring-emerald-200 dark:ring-emerald-900'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-pink-500 hover:bg-pink-50/40 text-transparent'
          }`}
        >
          <Check className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
        </button>

        {/* Task info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {/* Title with strikethrough if completed */}
            <span
              onClick={() => onToggleComplete(task.id)}
              className={`text-xs sm:text-sm font-bold leading-snug cursor-pointer select-none transition-colors ${
                task.completed
                  ? 'line-through text-slate-400 dark:text-slate-600 font-normal'
                  : 'text-slate-900 dark:text-slate-100 group-hover:text-pink-900 dark:group-hover:text-pink-300'
              }`}
            >
              {task.title}
            </span>
          </div>

          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-600 dark:text-slate-400 mt-2">
            {/* Priority Selector / Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-semibold border text-[11px] transition-all ${currentPriority.badgeClass}`}
              >
                <span>{currentPriority.icon}</span>
                <span>{currentPriority.label}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showPriorityMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowPriorityMenu(false)} />
                  <div className="absolute left-0 mt-1 w-48 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Đổi mức ưu tiên
                    </div>
                    {(Object.keys(priorityMap) as Priority[]).map((pKey) => {
                      const item = priorityMap[pKey];
                      return (
                        <button
                          key={pKey}
                          onClick={() => {
                            onChangePriority(task.id, pKey);
                            setShowPriorityMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors ${
                            task.priority === pKey
                              ? 'font-bold text-pink-600 dark:text-pink-400 bg-pink-50/50 dark:bg-pink-950/30'
                              : 'text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Estimated time / Time of Day */}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200/60 dark:border-slate-700"
              title="Khung thời gian gợi ý"
            >
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{task.suggestedTime ? `⏰ ${task.suggestedTime}` : periodLabelMap[task.timeOfDay]}</span>
            </span>

            {/* Estimated duration */}
            {task.estimatedDuration && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200/60 dark:border-slate-700"
                title="Thời lượng dự kiến"
              >
                <Hourglass className="w-3 h-3 text-slate-400" />
                <span>{task.estimatedDuration}</span>
              </span>
            )}

            {/* Reminder pill */}
            {task.reminderTime ? (
              <button
                type="button"
                onClick={() => setIsEditingReminder(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 transition-colors font-semibold"
                title="Bấm để chỉnh sửa giờ nhắc"
              >
                <Bell className="w-3 h-3 text-amber-500 fill-amber-400/20" />
                <span>🔔 {task.reminderTime}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingReminder(true)}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/40"
              >
                <Bell className="w-3 h-3" />
                <span>Nhắc tôi</span>
              </button>
            )}
          </div>

          {/* Inline Reminder quick editor */}
          {isEditingReminder && (
            <div className="mt-2.5 p-2.5 bg-amber-50/80 dark:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs">
              <span className="text-amber-800 dark:text-amber-200 font-semibold">Nhắc tôi lúc:</span>
              <input
                type="time"
                value={reminderInput}
                onChange={(e) => setReminderInput(e.target.value)}
                className="px-2 py-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
              />
              <button
                onClick={handleSaveReminder}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
              >
                Lưu
              </button>
              {task.reminderTime && (
                <button
                  onClick={() => {
                    setReminderInput('');
                    onSetReminder(task.id, '');
                    setIsEditingReminder(false);
                  }}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Xóa nhắc
                </button>
              )}
              <button
                onClick={() => setIsEditingReminder(false)}
                className="text-xs text-slate-500 hover:underline ml-auto"
              >
                Hủy
              </button>
            </div>
          )}

          {/* Notes display if present */}
          {task.notes && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="italic leading-relaxed">{task.notes}</span>
            </div>
          )}
        </div>

        {/* Right action menu */}
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          {/* Someday toggle */}
          <button
            onClick={() => onToggleSomeday(task.id)}
            title={task.isSomeday ? 'Chuyển vào Việc hôm nay' : 'Chuyển vào Ý tưởng / Để sau'}
            className={`p-1.5 rounded-xl text-xs transition-colors ${
              task.isSomeday
                ? 'text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/40'
                : 'text-slate-400 hover:text-pink-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {task.isSomeday ? <Calendar className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {/* Edit button */}
          <button
            onClick={() => onEdit(task)}
            title="Chỉnh sửa công việc"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete button */}
          <button
            onClick={() => onDelete(task.id)}
            title="Xóa công việc"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
