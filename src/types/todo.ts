export type Priority = 'high_urgent' | 'medium_important' | 'quick_task' | 'someday_idea';

export type TimeOfDay = 'morning' | 'noon' | 'afternoon' | 'evening' | 'unassigned';

export type UserRole = 'guest' | 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isLocked?: boolean;
  createdAt: string;
  lastActive?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type ReminderOption =
  | 'at_time'
  | '5m_before'
  | '15m_before'
  | '30m_before'
  | '1h_before'
  | 'custom';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  estimatedDuration: string;
  timeOfDay: TimeOfDay;
  date?: string; // YYYY-MM-DD
  deadline?: string; // YYYY-MM-DD or datetime string
  time?: string; // HH:mm
  suggestedTime?: string;
  reminderTime?: string;
  reminderOption?: ReminderOption;
  reminderNotified?: boolean;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  isSomeday: boolean;
  isInbox?: boolean;
  subtasks?: Subtask[];
  userId?: string;
}

export interface Idea {
  id: string;
  title: string;
  category: 'personal' | 'study' | 'work' | 'future';
  notes?: string;
  createdAt: string;
  userId?: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  createdAt: string;
  active: boolean;
}

export interface UserSettings {
  defaultReminderTime: string;
  notificationsEnabled: boolean;
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
  startOfWeek: 'monday' | 'sunday';
  language: 'vi';
}

export interface ScheduleBlock {
  taskId: string;
  title: string;
  period: 'morning' | 'noon' | 'afternoon' | 'evening';
  periodLabel: string;
  timeSlot: string;
  duration: string;
  isBreak: boolean;
  advice?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  extractedTasks?: Omit<Task, 'id' | 'createdAt' | 'completed'>[];
  clarificationQuestions?: string[];
  suggestedActions?: string[];
}
