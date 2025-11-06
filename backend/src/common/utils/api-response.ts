/**
 * API 响应工具
 * 统一的响应格式
 */

import { Response } from 'express';

// 响应接口
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * 成功响应
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
};

/**
 * 分页成功响应
 */
export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
) => {
  const totalPages = Math.ceil(total / limit);

  const response: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };

  return res.status(200).json(response);
};

/**
 * 错误响应
 */
export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: any
) => {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };

  return res.status(statusCode).json(response);
};

/**
 * 创建响应 - 201
 */
export const createdResponse = <T>(res: Response, data: T, message: string = '创建成功') => {
  return successResponse(res, data, message, 201);
};

/**
 * 无内容响应 - 204
 */
export const noContentResponse = (res: Response) => {
  return res.status(204).send();
};
