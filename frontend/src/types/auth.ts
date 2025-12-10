/**
 * 认证相关类型定义
 */

// 用户信息
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  company?: string; // 所在公司
  avatar?: string; // 头像 URL
}

// 注册表单
export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

// 登录表单
export interface LoginForm {
  email: string;
  password: string;
}

// 认证响应
export interface AuthResponse {
  user: User;
  token: string;
}

// API 响应
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}
