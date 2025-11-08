/**
 * Axios 配置 - 本地开发版本
 */

import axios from 'axios';
import type { ApiResponse } from '@/types/auth';

// 创建 axios 实例
export const api = axios.create({
  // 本地开发：使用相对路径，通过 Vite proxy 转发到 localhost:3000
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误
      const data = error.response.data as ApiResponse<unknown>;

      // 401 未授权 - 清除 Token 并跳转登录
      if (error.response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }

      return Promise.reject(new Error(data.message || '请求失败'));
    } else if (error.request) {
      // 请求发出但没有收到响应
      return Promise.reject(new Error('网络错误，请检查网络连接'));
    } else {
      // 其他错误
      return Promise.reject(error);
    }
  }
);
