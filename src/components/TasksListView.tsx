import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Check,
  Calendar,
  Clock,
  AlertTriangle,
  Copy,
  Edit2,
  Trash2,
  ListTree,
  ChevronDown,
  ChevronUp,
  Tag,
  Hourglass,
  Sparkles,
} from 'lucide-react';
import { Task, Priority, Subtask } from '../types/todo';
import { useTheme } from '../context/ThemeContext';

interface TasksListViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDuplicate: (task: Task) => void;
  onChangePriority: (id: string, priority: Priority) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onAiBreakdownSubtasks?: (taskId: string, title: string) => Promise<void>;
  onOpenCreateModal: () => void;
}

export type TaskFilterType = 'all' | 'today' | 'upcoming' | 'overdue' | 'important' | 'completed';

export const TasksListView: React.FC<TasksListViewProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onDuplicate,
  onChangePriority,
  onToggleSubtask,
  onAddSubtask,
  onAiBreakdownSubtasks,
  onOpenCreateModal,
}) => {
  const { themeConfig } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<TaskFilterType>('all');
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<Record<string, string>>({});
  const [loadingAiSubtask, setLoadingAiSubtask] = useState<Record<string, boolean>>({});

  const todayStr = new Date().toISOString().split('T')[0];

  const filterOptions: { id: TaskFilterType; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'today', label: 'Hôm nay' },
    { id: 'upcoming', label: 'Sắp tới' },
    { id: 'overdue', label: 'Quá hạn ⚠️' },
    { id: 'important', label: 'Quan trọng 🔴' },
    { id: 'completed', label: 'Đã hoàn thành ✓' },
  ];

  // Priority metadata mapping
  const priorityLabels: Record<Priority, { label: string; icon: string; badgeClass: string }> = {
    high_urgent: {
      label: 'Cao',
      icon: '🔴',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    },
    medium_important: {
      label: 'Trung bình',
      icon: '🟡',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    quick_task: {
      label: 'Thấp',
      icon: '🟢',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    someday_idea: {
      label: 'Để sau',
      icon: '⚪',
      badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    },
  };

  // Filter & Search Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search matching
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Filter types
      if (filterType === 'completed') return t.completed;
      if (filterType === 'all') return !t.isSomeday;
      if (filterType === 'today') return !t.completed && (!t.date || t.date === todayStr);
      if (filterType === 'upcoming') return !t.completed && t.date && t.date > todayStr;
      if (filterType === 'overdue') {
        if (t.completed) return false;
        if (t.deadline && t.deadline < todayStr) return true;
        if (t.date && t.date < todayStr) return true;
        return false;
      }
      if (filterType === 'important') {
        return !t.completed && (t.priority === 'high_urgent' || t.priority === 'medium_important');
      }

      return true;
    });
  }, [tasks, searchQuery, filterType, todayStr]);

  const toggleSubtasksExpand = (taskId: string) => {
    setExpandedSubtasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleAddSubtaskSubmit = (taskId: string) => {
    const val = (newSubtaskInputs[taskId] || '').trim();
    if (!val) return;
    onAddSubtask(taskId, val);
    setNewSubtaskInputs((prev) => ({ ...prev, [taskId]: '' }));
  };

  const handleAiBreakdown = async (taskId: string, title: string) => {
    if (!onAiBreakdownSubtasks) return;
    setLoadingAiSubtask((prev) => ({ ...prev, [taskId]: true }));
    try {
      await onAiBreakdownSubtasks(taskId, title);
      setExpandedSubtasks((prev) => ({ ...prev, [taskId]: true }));
    } finally {
      setLoadingAiSubtask((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Search + Action */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Quản lý Công việc</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${themeConfig.badgeClass}`}>
                {filteredTasks.length} việc
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Xem toàn bộ danh sách, chia nhỏ subtask, tìm kiếm và lọc theo thời gian hoặc độ ưu tiên.
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            type="button"
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 bg-gradient-to-r ${themeConfig.gradientClass}`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo công việc mới</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm công việc theo tên, ghi chú, deadline..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterType(opt.id)}
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === opt.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center">
            <p className="text-xs text-slate-400">Không tìm thấy công việc nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const priorityInfo = priorityLabels[task.priority] || priorityLabels.medium_important;
            const isOverdue = !task.completed && ((task.deadline && task.deadline < todayStr) || (task.date && task.date < todayStr));
            const subtasks = task.subtasks || [];
            const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
            const isSubtasksOpen = expandedSubtasks[task.id];

            return (
              <div
                key={task.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-4 shadow-2xs ${
                  task.completed
                    ? 'border-slate-200 dark:border-slate-800 opacity-70 bg-slate-50/50 dark:bg-slate-900/40'
                    : isOverdue
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-800'
                }`}
              >
                {/* Main Task Header */}
                <div className="flex items-start gap-3">
                  {/* Complete checkbox */}
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    type="button"
                    className={`shrink-0 mt-0.5 w-6 h-6 rounded-xl border flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-pink-500 text-transparent'
                    }`}
                  >
                    <Check className={`w-4 h-4 stroke-[3] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
                  </button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        onClick={() => onToggleComplete(task.id)}
                        className={`text-sm sm:text-base font-bold cursor-pointer select-none ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-600'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Meta info tags */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                      {/* Priority tag */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${priorityInfo.badgeClass}`}>
                        <span>{priorityInfo.icon}</span>
                        <span>{priorityInfo.label}</span>
                      </span>

                      {/* Scheduled date */}
                      {task.date && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{task.date}</span>
                        </span>
                      )}

                      {/* Scheduled time */}
                      {(task.time || task.suggestedTime) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{task.time || task.suggestedTime}</span>
                        </span>
                      )}

                      {/* Duration */}
                      {task.estimatedDuration && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <Hourglass className="w-3 h-3 text-slate-400" />
                          <span>{task.estimatedDuration}</span>
                        </span>
                      )}

                      {/* Deadline & Overdue warning */}
                      {task.deadline && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${
                            isOverdue
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Hạn chót: {task.deadline}</span>
                        </span>
                      )}

                      {/* Subtask progress count badge */}
                      {subtasks.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleSubtasksExpand(task.id)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        >
                          <ListTree className="w-3 h-3" />
                          <span>
                            {completedSubtasksCount}/{subtasks.length} hoàn thành
                          </span>
                          {isSubtasksOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    {/* Subtasks Progress mini bar */}
                    {subtasks.length > 0 && (
                      <div className="w-full max-w-xs mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${(completedSubtasksCount / subtasks.length) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions Right Menu */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleSubtasksExpand(task.id)}
                      title="Xem/Thêm Subtasks"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ListTree className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDuplicate(task)}
                      title="Sao chép công việc"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onEdit(task)}
                      title="Chỉnh sửa công việc"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(task.id)}
                      title="Xóa công việc"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtasks Expanded Drawer */}
                {isSubtasksOpen && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 pl-8 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Các bước thực hiện (Subtasks):</span>

                      {/* AI Breakdown button */}
                      <button
                        type="button"
                        onClick={() => handleAiBreakdown(task.id, task.title)}
                        disabled={loadingAiSubtask[task.id]}
                        className="text-[11px] text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{loadingAiSubtask[task.id] ? 'AI đang phân tích...' : 'AI Tách Subtask'}</span>
                      </button>
                    </div>

                    {/* Subtasks checklist */}
                    {subtasks.map((st) => (
                      <div key={st.id} className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => onToggleSubtask(task.id, st.id)}
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            st.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 dark:border-slate-600 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                        <span className={st.completed ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}>
                          {st.title}
                        </span>
                      </div>
                    ))}

                    {/* Add subtask input */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={newSubtaskInputs[task.id] || ''}
                        onChange={(e) => setNewSubtaskInputs((prev) => ({ ...prev, [task.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubtaskSubmit(task.id);
                          }
                        }}
                        placeholder="+ Thêm bước nhỏ (nhấn Enter)..."
                        className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-pink-500 text-slate-800 dark:text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSubtaskSubmit(task.id)}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
