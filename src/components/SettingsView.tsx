import React, { useState } from 'react';
import {
  User as UserIcon,
  Bell,
  Palette,
  Sliders,
  Shield,
  Save,
  Check,
  LogOut,
  Trash2,
  Lock,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, PASTEL_THEMES, PastelTheme } from '../context/ThemeContext';

export const SettingsView: React.FC = () => {
  const { currentUser, userSettings, updateProfile, updateSettings, changePassword, logout } = useAuth();
  const { pastelTheme, setPastelTheme, themeMode, setThemeMode, themeConfig } = useTheme();

  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings
  const [focusMinutes, setFocusMinutes] = useState(userSettings.pomodoroFocusMinutes);
  const [breakMinutes, setBreakMinutes] = useState(userSettings.pomodoroBreakMinutes);
  const [notificationsOn, setNotificationsOn] = useState(userSettings.notificationsEnabled);
  const [defaultReminder, setDefaultReminder] = useState(userSettings.defaultReminderTime);
  const [startOfWeek, setStartOfWeek] = useState(userSettings.startOfWeek);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, avatar });
    updateSettings({
      pomodoroFocusMinutes: focusMinutes,
      pomodoroBreakMinutes: breakMinutes,
      notificationsEnabled: notificationsOn,
      defaultReminderTime: defaultReminder,
      startOfWeek,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPass) return;
    changePassword(newPassword);
    setPassSuccess(true);
    setNewPassword('');
    setConfirmPass('');
    setTimeout(() => setPassSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Cài đặt hệ thống & Cá nhân</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tùy chỉnh thông tin tài khoản, thông báo, giao diện bảng màu và chế độ tập trung Pomodoro.
        </p>
      </div>

      {/* 1. Account Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-sm sm:text-base">
          <UserIcon className="w-5 h-5 text-indigo-500" />
          <span>👤 Thông tin Tài khoản</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-pink-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="text"
                disabled
                value={currentUser.email}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              URL Ảnh đại diện
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-pink-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Loại tài khoản: <strong className="text-slate-700 dark:text-slate-200 uppercase">{currentUser.role}</strong>
            </span>
            <button
              type="submit"
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-all bg-gradient-to-r ${themeConfig.gradientClass}`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã lưu thành công!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu thông tin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Appearance & Palette */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-sm sm:text-base">
          <Palette className="w-5 h-5 text-pink-500" />
          <span>🎨 Giao diện & Bảng màu</span>
        </div>

        {/* Mode options */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
            Chế độ sáng tối:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setThemeMode('system')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                themeMode === 'system'
                  ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-400 text-pink-700 dark:text-pink-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Hệ thống</span>
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                themeMode === 'light'
                  ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-400 text-pink-700 dark:text-pink-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Sáng</span>
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                themeMode === 'dark'
                  ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-400 text-pink-700 dark:text-pink-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Tối</span>
            </button>
          </div>
        </div>

        {/* 6 Pastel Color Range */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
            Bảng màu sắc Pastel yêu thích:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {(Object.keys(PASTEL_THEMES) as PastelTheme[]).map((themeKey) => {
              const item = PASTEL_THEMES[themeKey];
              const isSelected = pastelTheme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => setPastelTheme(themeKey)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-slate-900 dark:border-white shadow-sm ring-2 ring-pink-400/30'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60'
                  }`}
                >
                  <div className={`h-2 rounded-full w-full mb-2 bg-gradient-to-r ${item.gradientClass}`} />
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{item.emoji} {item.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-pink-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Pomodoro & General Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-sm sm:text-base">
          <Sliders className="w-5 h-5 text-amber-500" />
          <span>⚙️ Tùy chỉnh Pomodoro & Thông báo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Thời gian tập trung Pomodoro (phút)
            </label>
            <input
              type="number"
              min={5}
              max={90}
              value={focusMinutes}
              onChange={(e) => setFocusMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-pink-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Thời gian nghỉ ngơi (phút)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-pink-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Thời gian nhắc việc mặc định
            </label>
            <select
              value={defaultReminder}
              onChange={(e) => setDefaultReminder(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500"
            >
              <option value="5m_before">Trước 5 phút</option>
              <option value="15m_before">Trước 15 phút</option>
              <option value="30m_before">Trước 30 phút</option>
              <option value="1h_before">Trước 1 giờ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ngày bắt đầu tuần
            </label>
            <select
              value={startOfWeek}
              onChange={(e) => setStartOfWeek(e.target.value as 'monday' | 'sunday')}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500"
            >
              <option value="monday">Thứ Hai (Khuyên dùng)</option>
              <option value="sunday">Chủ Nhật</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notificationsOn}
              onChange={(e) => setNotificationsOn(e.target.checked)}
              className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Bật thông báo hệ thống nhắc nhở khi đến giờ
            </span>
          </label>
        </div>
      </div>

      {/* 4. Security & Password */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-sm sm:text-base">
          <Shield className="w-5 h-5 text-emerald-500" />
          <span>🔐 Bảo mật & Đổi mật khẩu</span>
        </div>

        {passSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl text-xs font-bold">
            ✓ Đã cập nhật mật khẩu mới thành công!
          </div>
        )}

        <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất tài khoản</span>
            </button>

            <button
              type="submit"
              disabled={!newPassword || newPassword !== confirmPass}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 disabled:opacity-40"
            >
              Cập nhật mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
