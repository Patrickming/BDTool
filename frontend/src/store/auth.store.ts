/**
 * 用户认证状态管理 (Zustand)
 */

import { create } from 'zustand';
import type { User } from '@/types/auth';
import * as authService from '@/services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User, token: string) => void;
  clearAuth: () => void;
  loadUser: () => Promise<void>;
}

// 从 localStorage 恢复用户信息
const getStoredUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token') && !!getStoredUser(),
  isLoading: false,

  // 设置用户信息和 Token
  setUser: (user, token) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  // 清除认证信息
  clearAuth: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // 加载当前用户信息
  loadUser: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const user = await authService.getCurrentUser();
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // Token 无效，清除认证信息
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
