import React from 'react';
import { Calendar, Bell, BellOff, Sparkles, BarChart3, Palette, Menu, Hourglass, User as UserIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  completedCount: number;
  totalTodayCount: number;
  notificationsEnabled: boolean;
  onToggleNotification: () => void;
  onOpenSummary: () => void;
  onOpenAssistant: () => void;
  onOpenThemeModal: () => void;
  onOpenTimer: () => void;
  onOpenMobileMenu: () => void;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  completedCount,
  totalTodayCount,
  notificationsEnabled,
  onToggleNotification,
  onOpenSummary,
  onOpenAssistant,
  onOpenThemeModal,
  onOpenTimer,
  onOpenMobileMenu,
  onOpenAuthModal,
}) => {
  const { themeConfig } = useTheme();
  const { currentUser, isGuest, isAdmin } = useAuth();

  // Format current date in Vietnamese
  const today = new Date();
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[today.getDay()];
  const dateStr = `${dayName}, ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

  const percent = totalTodayCount > 0 ? Math.round((completedCount / totalTodayCount) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-3">
        {/* Left: Mobile menu toggle + Brand info */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onOpenMobileMenu}
            type="button"
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-50 leading-none flex items-center gap-1.5">
                <span>Việc cần làm hôm nay</span>
                <span className="text-sm select-none">{themeConfig.emoji}</span>
              </h1>
              <span className={`hidden sm:inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${themeConfig.badgeClass}`}>
                Today To-Do
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateStr}</span>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Timer button */}
          <button
            onClick={onOpenTimer}
            title="Đồng hồ đếm ngược Pomodoro"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 transition-all flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700"
          >
            <Hourglass className="w-4 h-4 text-pink-500" />
            <span className="hidden md:inline">Đếm ngược</span>
          </button>

          {/* Color Palette & Dark/Light button */}
          <button
            onClick={onOpenThemeModal}
            title="Bảng màu Pastel & Sáng/Tối"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700"
          >
            <Palette className="w-4 h-4 text-pink-500" />
            <span className="hidden sm:inline">Màu sắc</span>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: themeConfig.previewHex }} />
          </button>

          {/* Notification button */}
          <button
            onClick={onToggleNotification}
            title={notificationsEnabled ? 'Chuông nhắc việc: Đã bật' : 'Bấm để bật chuông nhắc việc'}
            className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
              notificationsEnabled
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {notificationsEnabled ? (
              <Bell className="w-4 h-4 text-amber-500 fill-amber-400/20" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
            <span className="hidden lg:inline">{notificationsEnabled ? 'Nhắc việc' : 'Tắt'}</span>
          </button>

          {/* Daily summary button */}
          <button
            onClick={onOpenSummary}
            className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition-all flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Tổng kết</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-200/70 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[10px] font-bold">
              {percent}%
            </span>
          </button>

          {/* User Account / Avatar button */}
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              title={`Tài khoản: ${currentUser.name}`}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              )}
              <span className="hidden xl:inline max-w-[90px] truncate">{currentUser.name}</span>
              {isGuest && (
                <span className="text-[9px] px-1 rounded-sm bg-amber-200 text-amber-900 font-bold hidden sm:inline">
                  Khách
                </span>
              )}
              {isAdmin && (
                <span className="text-[9px] px-1 rounded-sm bg-rose-500 text-white font-bold hidden sm:inline">
                  Admin
                </span>
              )}
            </button>
          )}

          {/* AI Assistant button */}
          <button
            onClick={onOpenAssistant}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 flex items-center gap-1.5 bg-gradient-to-r ${themeConfig.gradientClass}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trợ lý</span>
          </button>
        </div>
      </div>
    </header>
  );
};
