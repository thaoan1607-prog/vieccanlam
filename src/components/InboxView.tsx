import React, { useState } from 'react';
import { Inbox, Plus, Calendar, ArrowRight, Clock, Bookmark, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { Task } from '../types/todo';
import { useTheme } from '../context/ThemeContext';

interface InboxViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onMoveToToday: (taskId: string) => void;
  onMoveToTomorrow: (taskId: string) => void;
  onMoveToDate: (taskId: string, date: string) => void;
  onMoveToSomeday: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  tasks,
  onAddTask,
  onMoveToToday,
  onMoveToTomorrow,
  onMoveToDate,
  onMoveToSomeday,
  onDeleteTask,
}) => {
  const { themeConfig } = useTheme();
  const [inputText, setInputText] = useState('');
  const [selectedDateTaskId, setSelectedDateTaskId] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState('');

  // Inbox items are tasks that are marked isInbox or are unassigned to date/someday
  const inboxTasks = tasks.filter((t) => t.isInbox || (!t.isSomeday && !t.completed && !t.date && t.timeOfDay === 'unassigned'));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onAddTask({
      title: inputText.trim(),
      priority: 'medium_important',
      estimatedDuration: '30 phút',
      timeOfDay: 'unassigned',
      isSomeday: false,
      isInbox: true,
    });
    setInputText('');
  };

  const sampleInbox = [
    'Mua sách tiếng Nhật',
    'Gọi điện cho mẹ',
    'Tìm tài liệu thuyết trình',
    'Ý tưởng cho bài thuyết trình',
    'Cuối tuần dọn phòng',
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Hộp thư Inbox – Ghi nhanh</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {inboxTasks.length} việc
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ghi lại ngay mọi ý tưởng hoặc việc xuất hiện trong đầu mà chưa cần quyết định thời gian thực hiện.
            </p>
          </div>
        </div>

        {/* Fast Input */}
        <form onSubmit={handleAdd} className="mt-4 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ghi nhanh việc gì đó trong đầu bạn (ví dụ: Mua sách tiếng Nhật, gọi điện cho bạn...)"
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-xs disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0 bg-gradient-to-r ${themeConfig.gradientClass}`}
          >
            <Plus className="w-4 h-4" />
            <span>Ghi lại</span>
          </button>
        </form>

        {/* Quick prompt samples */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-500" />
            <span>Gợi ý mẫu:</span>
          </span>
          {sampleInbox.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(s)}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Inbox List */}
      <div className="space-y-3">
        {inboxTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              Hộp thư Inbox trống
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Mọi thứ đều đã được sắp xếp! Khi nào có việc gì nảy ra trong đầu, hãy ghi nhanh vào đây nhé.
            </p>
          </div>
        ) : (
          inboxTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex-1">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {task.title}
                </span>
                {task.notes && (
                  <p className="text-xs text-slate-400 mt-0.5 italic">{task.notes}</p>
                )}
              </div>

              {/* Action buttons to assign */}
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onMoveToToday(task.id)}
                  type="button"
                  title="Đưa vào danh sách Hôm nay"
                  className="px-2.5 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/60 text-pink-700 dark:text-pink-300 text-xs font-semibold border border-pink-200 dark:border-pink-800 flex items-center gap-1 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Hôm nay</span>
                </button>

                <button
                  onClick={() => onMoveToTomorrow(task.id)}
                  type="button"
                  title="Chuyển sang Ngày mai"
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 transition-all"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ngày mai</span>
                </button>

                <button
                  onClick={() => onMoveToSomeday(task.id)}
                  type="button"
                  title="Lưu vào danh sách Để sau"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Để sau</span>
                </button>

                {/* Pick custom date */}
                {selectedDateTaskId === task.id ? (
                  <div className="flex items-center gap-1 animate-in fade-in">
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                    <button
                      onClick={() => {
                        if (customDate) {
                          onMoveToDate(task.id, customDate);
                          setSelectedDateTaskId(null);
                          setCustomDate('');
                        }
                      }}
                      className="px-2 py-1 rounded-lg bg-pink-500 text-white text-xs font-bold"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setSelectedDateTaskId(null)}
                      className="text-xs text-slate-400 hover:underline"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedDateTaskId(task.id);
                      setCustomDate(new Date().toISOString().split('T')[0]);
                    }}
                    type="button"
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
                  >
                    Chọn ngày
                  </button>
                )}

                <button
                  onClick={() => onDeleteTask(task.id)}
                  type="button"
                  title="Xóa công việc"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
