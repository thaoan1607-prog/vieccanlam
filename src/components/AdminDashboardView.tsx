import React, { useState } from 'react';
import {
  Shield,
  Users,
  BarChart3,
  Bell,
  FileText,
  Settings,
  Search,
  Lock,
  Unlock,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Cpu,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Task, UserRole } from '../types/todo';

interface AdminDashboardViewProps {
  tasks: Task[];
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ tasks }) => {
  const {
    currentUser,
    users,
    announcements,
    isAdmin,
    adminToggleUserLock,
    adminChangeUserRole,
    adminDeleteUser,
    adminCreateAnnouncement,
    adminDeleteAnnouncement,
  } = useAuth();
  const { themeConfig } = useTheme();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'announcements' | 'content' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Announcement state
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnType, setNewAnnType] = useState<'info' | 'warning' | 'success'>('info');

  // System content settings state
  const [appSlogan, setAppSlogan] = useState('Có việc gì nghĩ ra thì ghi ngay – AI giúp bạn nhớ và sắp xếp.');
  const [welcomeMessage, setWelcomeMessage] = useState('Chào bạn! Hôm nay bạn muốn làm gì?');
  const [isSavedContent, setIsSavedContent] = useState(false);

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
          Quyền truy cập bị từ chối
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Giao diện Quản trị Admin chỉ dành riêng cho tài khoản có quyền Quản trị viên (Admin). Bạn vui lòng đăng nhập bằng tài khoản Admin để truy cập.
        </p>
      </div>
    );
  }

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate platform stats
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => !u.isLocked).length;
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const guestAccountsEstimate = 124; // Simulated guest usage counter
  const aiCallsEstimate = totalTasksCount * 3 + 45; // Simulated AI usage

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;
    adminCreateAnnouncement(newAnnTitle, newAnnContent, newAnnType);
    setNewAnnTitle('');
    setNewAnnContent('');
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedContent(true);
    setTimeout(() => setIsSavedContent(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Admin Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-white shrink-0">
            <Shield className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">Quản trị Hệ thống Admin</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Xin chào {currentUser.name}! Bạn đang quản lý toàn bộ hệ thống Today To-Do.
            </p>
          </div>
        </div>

        {/* Admin Nav Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Tổng quan</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Người dùng</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'announcements' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Thông báo</span>
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'content' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Nội dung</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tổng User</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalUsersCount}</div>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                <TrendingUp className="w-3 h-3" /> +12% tháng này
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Đang hoạt động</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">{activeUsersCount}</div>
              <span className="text-[10px] text-slate-400">Không bị khóa</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tài khoản khách</span>
              <div className="text-2xl font-black text-amber-600 mt-1">{guestAccountsEstimate}</div>
              <span className="text-[10px] text-slate-400">Đang trải nghiệm</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Công việc tạo</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalTasksCount}</div>
              <span className="text-[10px] text-slate-400">Trong hệ thống</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Đã hoàn thành</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{completedTasksCount}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Tỷ lệ {totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}%</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Lượt dùng AI</span>
              <div className="text-2xl font-black text-purple-600 mt-1">{aiCallsEstimate}</div>
              <span className="text-[10px] text-purple-600 font-semibold flex items-center gap-0.5">
                <Cpu className="w-3 h-3" /> Gemini 3.8
              </span>
            </div>
          </div>

          {/* Recent System Activity Log */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100">
              Hoạt động gần đây của hệ thống
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Người dùng Thảo An</span>
                  <span className="text-slate-500">đã đăng nhập và hoàn thành 4 công việc</span>
                </div>
                <span className="text-[11px] text-slate-400">10 phút trước</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Trợ lý AI</span>
                  <span className="text-slate-500">đã phân loại tự động 7 công việc qua Time-Blocking</span>
                </div>
                <span className="text-[11px] text-slate-400">25 phút trước</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Đăng ký mới</span>
                  <span className="text-slate-500">Tài khoản Trần Minh Đức đã kích hoạt thành công</span>
                </div>
                <span className="text-[11px] text-slate-400">1 giờ trước</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Quản lý Người dùng ({filteredUsers.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Xem thông tin tài khoản, khóa / mở khóa hoặc phân quyền Admin
                </p>
              </div>

              {/* Role filter */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    roleFilter === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setRoleFilter('user')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    roleFilter === 'user' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  Người dùng
                </button>
                <button
                  onClick={() => setRoleFilter('admin')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    roleFilter === 'admin' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm người dùng theo tên hoặc email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Người dùng</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Quyền</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}`}
                          alt={u.name}
                          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                        />
                        <span>{u.name}</span>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.isLocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1 w-fit">
                            <Lock className="w-3 h-3" /> Đã khóa
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Hoạt động
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Lock */}
                          <button
                            onClick={() => adminToggleUserLock(u.id)}
                            title={u.isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                          >
                            {u.isLocked ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
                          </button>

                          {/* Toggle Role */}
                          <button
                            onClick={() => adminChangeUserRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                            title={u.role === 'admin' ? 'Chuyển thành User' : 'Nâng cấp lên Admin'}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                          >
                            <Shield className="w-4 h-4 text-purple-600" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => adminDeleteUser(u.id)}
                            title="Xóa tài khoản"
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANNOUNCEMENTS MANAGEMENT */}
      {activeTab === 'announcements' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Create Announcement Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-pink-500" />
              <span>Tạo thông báo toàn hệ thống</span>
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tiêu đề thông báo
                  </label>
                  <input
                    type="text"
                    required
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    placeholder="VD: Cập nhật tính năng mới tuần này..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Loại thông báo
                  </label>
                  <select
                    value={newAnnType}
                    onChange={(e) => setNewAnnType(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-pink-500"
                  >
                    <option value="info">Thông tin (Info)</option>
                    <option value="success">Thành công (Success)</option>
                    <option value="warning">Cảnh báo (Warning)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nội dung thông báo
                </label>
                <textarea
                  rows={2}
                  required
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  placeholder="Nhập nội dung chi tiết gửi đến người dùng..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs bg-gradient-to-r ${themeConfig.gradientClass}`}
                >
                  + Phát hành thông báo
                </button>
              </div>
            </form>
          </div>

          {/* Announcements List */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Danh sách thông báo đã phát ({announcements.length})
            </h4>

            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ann.type === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : ann.type === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {ann.type}
                    </span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{ann.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{ann.content}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Đăng lúc: {new Date(ann.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                <button
                  onClick={() => adminDeleteAnnouncement(ann.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Xóa thông báo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONTENT SETTINGS */}
      {activeTab === 'content' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 animate-in fade-in">
          <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
            Quản lý Nội dung & Khẩu hiệu mặc định
          </h3>

          {isSavedContent && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
              ✓ Đã lưu nội dung ứng dụng thành công!
            </div>
          )}

          <form onSubmit={handleSaveContent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Thông điệp chính (Slogan)
              </label>
              <input
                type="text"
                value={appSlogan}
                onChange={(e) => setAppSlogan(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Câu chào mừng Trang chủ
              </label>
              <input
                type="text"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs bg-gradient-to-r ${themeConfig.gradientClass}`}
              >
                Lưu nội dung
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
