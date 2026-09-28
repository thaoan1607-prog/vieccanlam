import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, SystemAnnouncement, UserSettings } from '../types/todo';

interface AuthContextType {
  currentUser: User;
  users: User[];
  announcements: SystemAnnouncement[];
  userSettings: UserSettings;
  isGuest: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loginAsGuest: () => void;
  quickLogin: (role: 'guest' | 'user' | 'admin') => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (newPass: string) => boolean;
  updateProfile: (data: { name: string; avatar?: string }) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  // Admin functions
  adminToggleUserLock: (userId: string) => void;
  adminChangeUserRole: (userId: string, newRole: UserRole) => void;
  adminDeleteUser: (userId: string) => void;
  adminCreateAnnouncement: (title: string, content: string, type?: 'info' | 'warning' | 'success') => void;
  adminDeleteAnnouncement: (id: string) => void;
}

const GUEST_USER: User = {
  id: 'guest',
  name: 'Khách trải nghiệm',
  email: 'guest@todaytodo.com',
  avatar: '',
  role: 'guest',
  createdAt: '2026-09-01T00:00:00Z',
  lastActive: new Date().toISOString(),
};

const DEFAULT_USERS: (User & { password?: string })[] = [
  {
    id: 'user-admin',
    name: 'Nguyễn Quản Trị (Admin)',
    email: 'admin@todaytodo.com',
    password: 'admin123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    createdAt: '2026-08-15T08:00:00Z',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'user-1',
    name: 'Thảo An',
    email: 'thaoan@gmail.com',
    password: 'user123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    createdAt: '2026-09-10T10:30:00Z',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'user-2',
    name: 'Trần Minh Đức',
    email: 'minhduc@gmail.com',
    password: 'user123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    createdAt: '2026-09-18T14:20:00Z',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'user-locked',
    name: 'Tài khoản Đã Khóa',
    email: 'locked@example.com',
    password: 'user123',
    role: 'user',
    isLocked: true,
    createdAt: '2026-09-05T09:00:00Z',
    lastActive: '2026-09-12T11:00:00Z',
  },
];

const DEFAULT_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Chào mừng phiên bản mới của Today To-Do!',
    content: 'Tính năng AI Lập kế hoạch theo Time-Blocking và Chế độ Tập trung Pomodoro đã sẵn sàng phục vụ bạn.',
    type: 'info',
    createdAt: '2026-09-25T08:00:00Z',
    active: true,
  },
  {
    id: 'ann-2',
    title: 'Bảo trì máy chủ định kỳ',
    content: 'Hệ thống đồng bộ dữ liệu sẽ hoạt động ổn định và tối ưu hóa tốc độ tải nhanh hơn 2 lần.',
    type: 'success',
    createdAt: '2026-09-26T12:00:00Z',
    active: true,
  },
];

const DEFAULT_SETTINGS: UserSettings = {
  defaultReminderTime: '15m_before',
  notificationsEnabled: true,
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
  startOfWeek: 'monday',
  language: 'vi',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Stored users
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('todaytodo_users_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load users list', e);
    }
    return DEFAULT_USERS;
  });

  // Current logged in user (defaults to guest or saved)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('todaytodo_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load current user', e);
    }
    return GUEST_USER;
  });

  // Announcements
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(() => {
    try {
      const saved = localStorage.getItem('todaytodo_announcements');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load announcements', e);
    }
    return DEFAULT_ANNOUNCEMENTS;
  });

  // User settings
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('todaytodo_user_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load user settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('todaytodo_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('todaytodo_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('todaytodo_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('todaytodo_user_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  // Login handler
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!found) {
      return { success: false, error: 'Email không tồn tại trong hệ thống.' };
    }

    if (found.isLocked) {
      return {
        success: false,
        error: 'Tài khoản này đã bị khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.',
      };
    }

    // Check password
    const userWithPass = found as User & { password?: string };
    if (userWithPass.password && userWithPass.password !== pass) {
      return { success: false, error: 'Mật khẩu không chính xác.' };
    }

    const updatedUser = { ...found, lastActive: new Date().toISOString() };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === found.id ? updatedUser : u)));
    return { success: true };
  };

  // Sign up handler
  const signup = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (found) {
      return { success: false, error: 'Email này đã được đăng ký. Vui lòng đăng nhập.' };
    }

    const newUser: User & { password?: string } = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'Người dùng mới',
      email: trimmedEmail,
      password: pass,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    return { success: true };
  };

  // Quick switch between Guest / User / Admin (super convenient for user testing)
  const quickLogin = (role: 'guest' | 'user' | 'admin') => {
    if (role === 'guest') {
      setCurrentUser(GUEST_USER);
    } else if (role === 'admin') {
      const admin = users.find((u) => u.role === 'admin') || DEFAULT_USERS[0];
      setCurrentUser(admin);
    } else {
      const normalUser = users.find((u) => u.role === 'user' && !u.isLocked) || DEFAULT_USERS[1];
      setCurrentUser(normalUser);
    }
  };

  const loginAsGuest = () => {
    setCurrentUser(GUEST_USER);
  };

  const logout = () => {
    setCurrentUser(GUEST_USER);
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!found) {
      return { success: false, message: 'Không tìm thấy tài khoản với email này.' };
    }
    return {
      success: true,
      message: `Đã gửi liên kết khôi phục mật khẩu tới email ${trimmedEmail}. Vui lòng kiểm tra hộp thư!`,
    };
  };

  const changePassword = (_newPass: string): boolean => {
    // In demo environment, simply mark success
    return true;
  };

  const updateProfile = (data: { name: string; avatar?: string }) => {
    const updated = {
      ...currentUser,
      name: data.name.trim() || currentUser.name,
      avatar: data.avatar ?? currentUser.avatar,
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Admin capabilities
  const adminToggleUserLock = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const isLocked = !u.isLocked;
          if (currentUser.id === userId && isLocked) {
            // Can't lock yourself as admin
            return u;
          }
          return { ...u, isLocked };
        }
        return u;
      })
    );
  };

  const adminChangeUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, role: newRole };
        }
        return u;
      })
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
    }
  };

  const adminDeleteUser = (userId: string) => {
    if (currentUser.id === userId) return; // Prevent deleting self
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const adminCreateAnnouncement = (title: string, content: string, type: 'info' | 'warning' | 'success' = 'info') => {
    const newAnn: SystemAnnouncement = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      type,
      createdAt: new Date().toISOString(),
      active: true,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const adminDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const isGuest = currentUser.role === 'guest';
  const isAdmin = currentUser.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        announcements,
        userSettings,
        isGuest,
        isAdmin,
        login,
        signup,
        logout,
        loginAsGuest,
        quickLogin,
        forgotPassword,
        changePassword,
        updateProfile,
        updateSettings,
        adminToggleUserLock,
        adminChangeUserRole,
        adminDeleteUser,
        adminCreateAnnouncement,
        adminDeleteAnnouncement,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
