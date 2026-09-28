import React, { useState, useEffect } from 'react';
import { Task, Priority, Idea, Subtask, ReminderOption } from './types/todo';
import { INITIAL_TASKS, INITIAL_IDEAS } from './data/initialTasks';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { ProgressBar } from './components/ProgressBar';
import { QuickAddBox } from './components/QuickAddBox';
import { TaskSection } from './components/TaskSection';
import { ScheduleView } from './components/ScheduleView';
import { CountdownTimer } from './components/CountdownTimer';
import { DailySummaryModal } from './components/DailySummaryModal';
import { EditTaskModal } from './components/EditTaskModal';
import { AssistantDrawer } from './components/AssistantDrawer';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { AuthModal } from './components/AuthModal';

// Specialized Views
import { TasksListView } from './components/TasksListView';
import { CalendarView } from './components/CalendarView';
import { IdeasView } from './components/IdeasView';
import { RemindersView } from './components/RemindersView';
import { StatisticsView } from './components/StatisticsView';
import { FocusModeView } from './components/FocusModeView';
import { SettingsView } from './components/SettingsView';
import { AdminDashboardView } from './components/AdminDashboardView';

import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import {
  playDoneSound,
  playReminderSound,
  requestNotificationPermission,
  sendBrowserNotification,
} from './utils/audio';
import {
  LayoutList,
  CalendarRange,
  Sparkles,
  BellRing,
  RefreshCw,
  Hourglass,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  User as UserIcon,
  LogIn,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const STORAGE_KEY = 'today_todo_tasks_v3';
const IDEAS_STORAGE_KEY = 'today_todo_ideas_v3';
const SIDEBAR_COLLAPSED_KEY = 'today_sidebar_collapsed';

export default function App() {
  const { themeConfig } = useTheme();
  const { currentUser, isGuest, isAdmin, quickLogin, logout } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Tasks state with LocalStorage persistence
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  });

  // Ideas state with LocalStorage persistence
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    try {
      const saved = localStorage.getItem(IDEAS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load ideas from localStorage', e);
    }
    return INITIAL_IDEAS;
  });

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Home priority filter vs time-blocking schedule
  const [homeViewMode, setHomeViewMode] = useState<'priority' | 'schedule'>('priority');

  // Countdown timer toggle
  const [showCountdownTimer, setShowCountdownTimer] = useState(true);

  // Modals & Drawers
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [activeReminderToast, setActiveReminderToast] = useState<string | null>(null);

  // Save tasks to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save tasks', e);
    }
  }, [tasks]);

  // Save ideas to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
    } catch (e) {
      console.warn('Failed to save ideas', e);
    }
  }, [ideas]);

  // Save sidebar collapse state
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Reminder interval check (every 20 seconds)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      setTasks((prev) =>
        prev.map((t) => {
          if (
            !t.completed &&
            t.reminderTime &&
            t.reminderTime === currentHHMM &&
            !t.reminderNotified
          ) {
            playReminderSound();
            sendBrowserNotification(
              '🔔 Nhắc việc: ' + t.title,
              `Đã đến giờ: ${t.reminderTime} - Hãy thực hiện công việc này nhé! 🌸`
            );
            setActiveReminderToast(`🔔 Đã đến giờ: "${t.title}" (${t.reminderTime})`);
            setTimeout(() => setActiveReminderToast(null), 8000);
            return { ...t, reminderNotified: true };
          }
          return t;
        })
      );
    };

    const interval = setInterval(checkReminders, 20000);
    checkReminders();
    return () => clearInterval(interval);
  }, []);

  // Request notification permission
  const handleToggleNotification = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      sendBrowserNotification(
        '🔔 Đã bật thông báo thành công!',
        'Việc cần làm hôm nay sẽ nhắc bạn khi đến giờ hẹn.'
      );
    }
  };

  // Add tasks
  const handleAddTasks = (newTasks: Omit<Task, 'id' | 'createdAt' | 'completed'>[]) => {
    const created: Task[] = newTasks.map((t, idx) => ({
      ...t,
      id: `task-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      completed: false,
      createdAt: new Date().toISOString(),
      reminderNotified: false,
      userId: currentUser.id,
    }));

    setTasks((prev) => [...created, ...prev]);
  };

  // Toggle complete
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const willComplete = !t.completed;
          if (willComplete) {
            playDoneSound();
          }
          return {
            ...t,
            completed: willComplete,
            completedAt: willComplete ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Edit save
  const handleSaveEdit = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  // Change priority
  const handleChangePriority = (id: string, priority: Priority) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority } : t)));
  };

  // Duplicate task
  const handleDuplicateTask = (task: Task) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: `${task.title} (Bản sao)`,
      completed: false,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
      reminderNotified: false,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Toggle someday (Ý tưởng & Để sau)
  const handleToggleSomeday = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isSomeday = !t.isSomeday;
          return {
            ...t,
            isSomeday,
            priority: isSomeday ? 'someday_idea' : 'medium_important',
          };
        }
        return t;
      })
    );
  };

  // Set reminder
  const handleSetReminder = (id: string, time: string, option?: ReminderOption) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, reminderTime: time, reminderOption: option || 'custom', reminderNotified: false }
          : t
      )
    );
  };

  // Subtask management
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.subtasks) {
          return {
            ...t,
            subtasks: t.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          };
        }
        return t;
      })
    );
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const current = t.subtasks || [];
          const newSub: Subtask = {
            id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title,
            completed: false,
          };
          return { ...t, subtasks: [...current, newSub] };
        }
        return t;
      })
    );
  };

  // Calendar: Add task on specific date
  const handleAddTaskOnDate = (date: string, hour?: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: hour ? `Công việc lúc ${hour}` : 'Công việc mới',
      priority: 'medium_important',
      estimatedDuration: '30 phút',
      timeOfDay: hour ? (parseInt(hour.split(':')[0]) < 12 ? 'morning' : 'afternoon') : 'unassigned',
      date,
      time: hour,
      completed: false,
      createdAt: new Date().toISOString(),
      isSomeday: false,
      userId: currentUser.id,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Ideas management
  const handleAddIdea = (title: string, category: Idea['category'], notes?: string) => {
    const newIdea: Idea = {
      id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      category,
      notes,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
    };
    setIdeas((prev) => [newIdea, ...prev]);
  };

  const handleConvertIdeaToTask = (idea: Idea) => {
    handleAddTasks([
      {
        title: idea.title,
        priority: 'medium_important',
        estimatedDuration: '30 phút',
        timeOfDay: 'unassigned',
        notes: idea.notes,
        isSomeday: false,
      },
    ]);
    setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
    setActiveReminderToast(`💡 Đã chuyển ý tưởng "${idea.title}" thành công việc hôm nay!`);
    setTimeout(() => setActiveReminderToast(null), 5000);
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  // Move uncompleted to tomorrow
  const handleMoveUnfinishedToTomorrow = () => {
    setTasks((prev) =>
      prev.map((t) => {
        if (!t.completed && !t.isSomeday) {
          return {
            ...t,
            reminderNotified: false,
            notes: t.notes ? `${t.notes} (Chuyển từ hôm qua)` : 'Chuyển từ hôm qua',
          };
        }
        return t;
      })
    );
  };

  // Reset sample data
  const handleResetSampleData = () => {
    if (window.confirm('Bạn có muốn tải lại danh sách công việc mẫu ban đầu không?')) {
      setTasks(INITIAL_TASKS);
      setIdeas(INITIAL_IDEAS);
    }
  };

  // Open auth modal helper
  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const todayTasks = tasks.filter((t) => !t.isSomeday);
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalTodayCount = todayTasks.length;

  return (
    <div className="min-h-screen flex bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Left Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenAuthModal={handleOpenAuth}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        tasks={tasks}
        ideasCount={ideas.length}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <Header
          completedCount={completedCount}
          totalTodayCount={totalTodayCount}
          notificationsEnabled={notificationsEnabled}
          onToggleNotification={handleToggleNotification}
          onOpenSummary={() => setIsSummaryOpen(true)}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenTimer={() => setShowCountdownTimer(!showCountdownTimer)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAuthModal={() => handleOpenAuth('login')}
        />

        {/* In-app reminder notification toast banner */}
        {activeReminderToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 max-w-md w-full px-4 animate-in slide-in-from-top duration-300">
            <div className="p-3.5 bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-amber-300">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
                <BellRing className="w-5 h-5 animate-bounce shrink-0" />
                <span>{activeReminderToast}</span>
              </div>
              <button
                onClick={() => setActiveReminderToast(null)}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Main Body */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Guest Reminder Banner (Requirement 1A) */}
          {isGuest && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 dark:from-pink-950/40 dark:via-rose-950/30 dark:to-amber-950/30 border border-pink-200/80 dark:border-pink-900/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/60 text-pink-600 dark:text-pink-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    Bạn đang dùng với vai trò Khách.{' '}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    Đăng ký tài khoản để lưu và đồng bộ dữ liệu của bạn trên mọi thiết bị.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenAuth('signup')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-sm transition-all"
                >
                  Đăng ký ngay
                </button>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-pink-700 dark:text-pink-300 bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 transition-all border border-pink-200 dark:border-pink-800"
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          )}

          {/* RENDER VIEW ACCORDING TO activeTab */}
          {activeTab === 'home' && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
              {/* App Welcome & Intro (Requirement 3) */}
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-xs font-semibold text-pink-700 dark:text-pink-300">
                  <span>{themeConfig.emoji}</span>
                  <span>Giao diện màu Pastel: {themeConfig.name}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                  Chào bạn! Hôm nay bạn muốn làm gì?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                  “Có việc gì nghĩ ra thì ghi ngay – AI giúp bạn nhớ và sắp xếp.”
                </p>
              </div>

              {/* Progress Bar */}
              <ProgressBar completedCount={completedCount} totalCount={totalTodayCount} />

              {/* Countdown Timer Widget (Collapsible / Expandable) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => setShowCountdownTimer(!showCountdownTimer)}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 flex items-center gap-1.5 transition-colors"
                  >
                    <Hourglass className="w-3.5 h-3.5 text-pink-500" />
                    <span>{showCountdownTimer ? 'Ẩn đồng hồ đếm ngược' : 'Mở đồng hồ đếm ngược Pomodoro'}</span>
                    {showCountdownTimer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {showCountdownTimer && (
                  <div className="animate-in fade-in duration-300">
                    <CountdownTimer tasks={tasks} onTaskCompleted={handleToggleComplete} />
                  </div>
                )}
              </div>

              {/* Quick Add Box ("Hôm nay bạn cần làm gì?") */}
              <QuickAddBox onAddTasks={handleAddTasks} existingTasks={tasks} />

              {/* View Mode Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/90 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
                  <button
                    onClick={() => setHomeViewMode('priority')}
                    className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                      homeViewMode === 'priority'
                        ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                    <span>Danh sách 4 Mức độ ưu tiên</span>
                  </button>

                  <button
                    onClick={() => setHomeViewMode('schedule')}
                    className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                      homeViewMode === 'schedule'
                        ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <CalendarRange className="w-4 h-4" />
                    <span>Lịch trình Time-Blocking (AI)</span>
                  </button>
                </div>

                <button
                  onClick={handleResetSampleData}
                  title="Khôi phục danh sách mẫu từ đề bài"
                  className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="hidden sm:inline">Tải lại mẫu ban đầu</span>
                </button>
              </div>

              {/* Priority List or Time-Blocking Schedule */}
              {homeViewMode === 'schedule' ? (
                <ScheduleView tasks={tasks} onToggleComplete={handleToggleComplete} />
              ) : (
                <TaskSection
                  tasks={tasks}
                  filter="all"
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  onEdit={(task) => setEditingTask(task)}
                  onChangePriority={handleChangePriority}
                  onToggleSomeday={handleToggleSomeday}
                  onSetReminder={handleSetReminder}
                />
              )}
            </div>
          )}

          {/* VIEW: Tasks List */}
          {activeTab === 'tasks' && (
            <div className="animate-in fade-in duration-200">
              <TasksListView
                tasks={tasks}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onEdit={(task) => setEditingTask(task)}
                onDuplicate={handleDuplicateTask}
                onChangePriority={handleChangePriority}
                onToggleSubtask={handleToggleSubtask}
                onAddSubtask={handleAddSubtask}
                onOpenCreateModal={() => {
                  handleAddTasks([
                    {
                      title: 'Công việc mới',
                      priority: 'medium_important',
                      estimatedDuration: '30 phút',
                      timeOfDay: 'unassigned',
                      isSomeday: false,
                    },
                  ]);
                }}
              />
            </div>
          )}

          {/* VIEW: Calendar */}
          {activeTab === 'calendar' && (
            <div className="animate-in fade-in duration-200">
              <CalendarView
                tasks={tasks}
                onAddTaskOnDate={handleAddTaskOnDate}
                onEditTask={(task) => setEditingTask(task)}
                onToggleComplete={handleToggleComplete}
              />
            </div>
          )}

          {/* VIEW: Ideas */}
          {activeTab === 'ideas' && (
            <div className="animate-in fade-in duration-200">
              <IdeasView
                ideas={ideas}
                onAddIdea={handleAddIdea}
                onConvertIdeaToTask={handleConvertIdeaToTask}
                onDeleteIdea={handleDeleteIdea}
              />
            </div>
          )}

          {/* VIEW: Reminders */}
          {activeTab === 'reminders' && (
            <div className="animate-in fade-in duration-200">
              <RemindersView
                tasks={tasks}
                onSetReminder={handleSetReminder}
                onEditTask={(task) => setEditingTask(task)}
              />
            </div>
          )}

          {/* VIEW: Statistics */}
          {activeTab === 'statistics' && (
            <div className="animate-in fade-in duration-200">
              <StatisticsView tasks={tasks} />
            </div>
          )}

          {/* VIEW: Focus Mode / Pomodoro */}
          {activeTab === 'focus' && (
            <div className="animate-in fade-in duration-200">
              <FocusModeView tasks={tasks} onTaskCompleted={handleToggleComplete} />
            </div>
          )}

          {/* VIEW: Settings */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-200">
              <SettingsView />
            </div>
          )}

          {/* VIEW: Account */}
          {activeTab === 'account' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-4">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-200 dark:border-pink-800 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-500 text-white flex items-center justify-center text-2xl font-black shadow-md">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{currentUser.name}</span>
                      {isAdmin && <ShieldCheck className="w-5 h-5 text-rose-500" />}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isAdmin
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300'
                            : isGuest
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                        }`}
                      >
                        {isAdmin
                          ? 'Quản trị viên (Admin)'
                          : isGuest
                          ? 'Tài khoản Khách'
                          : 'Người dùng chính thức'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Features description */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    Dữ liệu được lưu trữ tự động:
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{tasks.length} Công việc</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{ideas.length} Ý tưởng</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Lịch & Nhắc nhở</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Thống kê & Cài đặt</span>
                    </div>
                  </div>
                </div>

                {/* Demo Switcher */}
                <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/60 dark:border-pink-900/40 space-y-2">
                  <div className="text-xs font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Thử nghiệm nhanh các loại tài khoản:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => quickLogin('guest')}
                      className={`p-2 rounded-xl text-xs font-bold transition-all text-center ${
                        isGuest
                          ? 'bg-pink-500 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 hover:bg-pink-100 text-slate-700 dark:text-slate-300 border border-pink-200'
                      }`}
                    >
                      1. Khách (Guest)
                    </button>
                    <button
                      onClick={() => quickLogin('user')}
                      className={`p-2 rounded-xl text-xs font-bold transition-all text-center ${
                        !isGuest && !isAdmin
                          ? 'bg-pink-500 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 hover:bg-pink-100 text-slate-700 dark:text-slate-300 border border-pink-200'
                      }`}
                    >
                      2. User thường
                    </button>
                    <button
                      onClick={() => quickLogin('admin')}
                      className={`p-2 rounded-xl text-xs font-bold transition-all text-center ${
                        isAdmin
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 hover:bg-rose-100 text-rose-600 border border-rose-200'
                      }`}
                    >
                      3. Admin
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {isGuest ? (
                    <>
                      <button
                        onClick={() => handleOpenAuth('signup')}
                        className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-sm transition-all"
                      >
                        Đăng ký tài khoản mới
                      </button>
                      <button
                        onClick={() => handleOpenAuth('login')}
                        className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all"
                      >
                        Đăng nhập tài khoản có sẵn
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all"
                      >
                        Chỉnh sửa thông tin & Đổi mật khẩu
                      </button>
                      <button
                        onClick={logout}
                        className="px-5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all border border-rose-200 dark:border-rose-900"
                      >
                        Đăng xuất tài khoản
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: Admin Dashboard (Protected - Requirement 1C) */}
          {activeTab === 'admin' && (
            <div className="animate-in fade-in duration-200">
              <AdminDashboardView tasks={tasks} />
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button for AI Assistant */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className={`fixed bottom-6 right-6 z-40 text-white rounded-full p-3.5 sm:px-5 sm:py-3.5 shadow-xl shadow-pink-500/25 flex items-center gap-2.5 transition-transform active:scale-95 group bg-gradient-to-r ${themeConfig.gradientClass}`}
        title="Mở Trợ lý hôm nay"
      >
        <Sparkles className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform" />
        <span className="text-xs sm:text-sm font-bold hidden sm:inline">Trợ lý hôm nay</span>
      </button>

      {/* Modals & Drawers */}
      <DailySummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        tasks={tasks}
        onMoveUnfinishedToTomorrow={handleMoveUnfinishedToTomorrow}
      />

      <EditTaskModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
      />

      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onAddTasks={handleAddTasks}
        currentTasks={tasks}
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
