import React, { useState } from 'react';
import { Task, Priority } from '../types/todo';
import { TaskCard } from './TaskCard';
import { Lightbulb, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { SidebarFilter } from './Sidebar';
import { useTheme } from '../context/ThemeContext';

interface TaskSectionProps {
  tasks: Task[];
  filter?: SidebarFilter;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onChangePriority: (id: string, priority: Priority) => void;
  onToggleSomeday: (id: string) => void;
  onSetReminder: (id: string, time: string) => void;
}

export const TaskSection: React.FC<TaskSectionProps> = ({
  tasks,
  filter = 'all',
  onToggleComplete,
  onDelete,
  onEdit,
  onChangePriority,
  onToggleSomeday,
  onSetReminder,
}) => {
  const { themeConfig } = useTheme();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleCollapse = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const todayTasks = tasks.filter((t) => !t.isSomeday);
  const somedayTasks = tasks.filter((t) => t.isSomeday);

  const highUrgentTasks = todayTasks.filter((t) => t.priority === 'high_urgent');
  const mediumImportantTasks = todayTasks.filter((t) => t.priority === 'medium_important');
  const quickTasks = todayTasks.filter((t) => t.priority === 'quick_task');

  const otherTodayTasks = todayTasks.filter(
    (t) => t.priority !== 'high_urgent' && t.priority !== 'medium_important' && t.priority !== 'quick_task'
  );

  const allSections = [
    {
      key: 'high',
      icon: '🔴',
      title: 'Ưu tiên cao / Khẩn cấp',
      subtitle: 'Cần thực hiện sớm, có deadline hoặc quan trọng',
      tasks: highUrgentTasks,
      badgeColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300',
      headerBorder: 'border-l-4 border-l-rose-400',
      visible: filter === 'all' || filter === 'high',
    },
    {
      key: 'medium',
      icon: '🟡',
      title: 'Quan trọng',
      subtitle: 'Cần làm nhưng chưa có deadline gấp, chủ động lên lịch',
      tasks: [...mediumImportantTasks, ...otherTodayTasks],
      badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
      headerBorder: 'border-l-4 border-l-amber-400',
      visible: filter === 'all' || filter === 'medium',
    },
    {
      key: 'quick',
      icon: '🟢',
      title: 'Việc nhanh',
      subtitle: 'Việc đơn giản có thể hoàn thành trong 5–15 phút',
      tasks: quickTasks,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
      headerBorder: 'border-l-4 border-l-emerald-400',
      visible: filter === 'all' || filter === 'quick',
    },
  ];

  const filteredSections = allSections.filter((s) => s.visible);
  const showSomeday = filter === 'all' || filter === 'someday';

  return (
    <div className="space-y-8">
      {/* 📅 HÔM NAY Section Header */}
      {filter !== 'someday' && (
        <div>
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200/80 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📅</span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {filter === 'high'
                  ? '🔴 VIỆC ƯU TIÊN CAO'
                  : filter === 'medium'
                  ? '🟡 VIỆC QUAN TRỌNG'
                  : filter === 'quick'
                  ? '🟢 VIỆC LÀM NHANH'
                  : 'HÔM NAY'}
              </h2>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${themeConfig.badgeClass}`}>
                {todayTasks.filter((t) => !t.completed).length} việc cần làm
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
              Tự động sắp xếp theo thứ tự ưu tiên
            </span>
          </div>

          {/* Priority Groups */}
          <div className="space-y-5">
            {filteredSections.map((section) => {
              const isCollapsed = collapsedSections[section.key];
              const completedCount = section.tasks.filter((t) => t.completed).length;

              return (
                <div key={section.key} className="space-y-2.5">
                  {/* Section Header */}
                  <div
                    onClick={() => toggleCollapse(section.key)}
                    className={`flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors ${section.headerBorder}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base select-none">{section.icon}</span>
                      <span className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                        {section.title}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${section.badgeColor}`}>
                        {section.tasks.length}
                      </span>
                      {completedCount > 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                          ({completedCount} đã xong)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400 hidden md:inline">
                        {section.subtitle}
                      </span>
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Task list in group */}
                  {!isCollapsed && (
                    <div className="space-y-2.5 pl-1 sm:pl-3">
                      {section.tasks.length === 0 ? (
                        <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 italic">
                          Không có công việc nào trong mục này
                        </div>
                      ) : (
                        section.tasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onToggleComplete={onToggleComplete}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            onChangePriority={onChangePriority}
                            onToggleSomeday={onToggleSomeday}
                            onSetReminder={onSetReminder}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 💡 Ý TƯỞNG & VIỆC ĐỂ SAU */}
      {showSomeday && (
        <div className="pt-6 border-t-2 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💡</span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Ý TƯỞNG & VIỆC ĐỂ SAU
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {somedayTasks.length} ý tưởng
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
              Chưa cần làm ngay hôm nay
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            Nơi lưu trữ các ý tưởng, việc chưa có kế hoạch cụ thể hoặc việc muốn học hỏi thêm. AI sẽ <strong>không</strong> đưa các mục này vào lịch hôm nay trừ khi bạn chủ động chuyển sang Hôm nay.
          </p>

          <div className="space-y-2.5">
            {somedayTasks.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 italic">
                Chưa có ý tưởng nào được lưu. Bạn có thể ghi vào ô trên hoặc chuyển các công việc từ danh sách hôm nay xuống đây.
              </div>
            ) : (
              somedayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onChangePriority={onChangePriority}
                  onToggleSomeday={onToggleSomeday}
                  onSetReminder={onSetReminder}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
