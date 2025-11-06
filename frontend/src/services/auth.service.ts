/**
 * 认证 API 服务
 */

import { api } from '@/lib/axios';
import type { RegisterForm, LoginForm, AuthResponse, ApiResponse } from '@/types/auth';

/**
 * 用户注册
 */
export const register = async (data: Omit<RegisterForm, 'confirmPassword'>): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data.data!;
};

/**
 * 用户登录
 */
export const login = async (data: LoginForm): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data.data!;
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async () => {
  const response = await api.get<ApiResponse<AuthResponse['user']>>('/auth/me');
  return response.data.data!;
};
