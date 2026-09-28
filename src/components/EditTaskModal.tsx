import React, { useState } from 'react';
import { X, Save, Clock, Bell, Hourglass, FileText, Tag } from 'lucide-react';
import { Task, Priority, TimeOfDay } from '../types/todo';
import { useTheme } from '../context/ThemeContext';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose, onSave }) => {
  const { themeConfig } = useTheme();

  if (!isOpen || !task) return null;

  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [estimatedDuration, setEstimatedDuration] = useState(task.estimatedDuration || '');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(task.timeOfDay);
  const [suggestedTime, setSuggestedTime] = useState(task.suggestedTime || '');
  const [reminderTime, setReminderTime] = useState(task.reminderTime || '');
  const [notes, setNotes] = useState(task.notes || '');
  const [isSomeday, setIsSomeday] = useState(task.isSomeday);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...task,
      title: title.trim(),
      priority,
      estimatedDuration: estimatedDuration.trim() || '30 phút',
      timeOfDay,
      suggestedTime: suggestedTime.trim(),
      reminderTime: reminderTime.trim(),
      notes: notes.trim(),
      isSomeday,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
            Chỉnh sửa công việc
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tên công việc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/60 dark:bg-slate-800/60 focus:outline-none focus:border-pink-500 font-semibold text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Mức độ ưu tiên</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:outline-none focus:border-pink-500 text-slate-800 dark:text-slate-200"
            >
              <option value="high_urgent">🔴 Quan trọng & Khẩn cấp (Có deadline gần)</option>
              <option value="medium_important">🟡 Quan trọng (Cần làm, chưa gấp)</option>
              <option value="quick_task">🟢 Việc nhỏ / Làm nhanh (5–15 phút)</option>
              <option value="someday_idea">⚪ Chưa cần làm / Để sau</option>
            </select>
          </div>

          {/* Duration & Time of Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Hourglass className="w-3.5 h-3.5 text-slate-400" />
                <span>Thời lượng ước tính</span>
              </label>
              <input
                type="text"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="VD: 15 phút, 1 giờ"
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:outline-none focus:border-pink-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Khung buổi trong ngày</span>
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:outline-none focus:border-pink-500 text-slate-800 dark:text-slate-200"
              >
                <option value="morning">🌅 Buổi sáng</option>
                <option value="noon">☀️ Buổi trưa</option>
                <option value="afternoon">🌇 Buổi chiều</option>
                <option value="evening">🌙 Buổi tối</option>
                <option value="unassigned">Chưa xác định</option>
              </select>
            </div>
          </div>

          {/* Specific Time & Reminder Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Giờ dự kiến (tùy chọn)
              </label>
              <input
                type="time"
                value={suggestedTime}
                onChange={(e) => setSuggestedTime(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:outline-none focus:border-pink-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Chuông nhắc việc (🔔)</span>
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:outline-none focus:border-pink-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Ghi chú bổ sung</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Thêm chi tiết hoặc lưu ý..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:outline-none focus:border-pink-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Checkbox: Someday */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSomeday}
                onChange={(e) => setIsSomeday(e.target.checked)}
                className="rounded-md border-slate-300 dark:border-slate-700 text-pink-600 focus:ring-pink-500 w-4 h-4"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Lưu vào mục "💡 Ý tưởng & Việc để sau" (không tính vào tiến độ hôm nay)
              </span>
            </label>
          </div>

          {/* Submit buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 bg-gradient-to-r ${themeConfig.gradientClass}`}
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
