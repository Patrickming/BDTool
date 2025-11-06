/**
 * 应用错误基类
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // 维护正确的堆栈跟踪（仅在 V8 中可用）
    Error.captureStackTrace(this, this.constructor);

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// 400 错误
export class BadRequestError extends AppError {
  constructor(message: string = '请求参数错误') {
    super(message, 400);
  }
}

// 401 错误
export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权，请先登录') {
    super(message, 401);
  }
}

// 403 错误
export class ForbiddenError extends AppError {
  constructor(message: string = '没有权限访问该资源') {
    super(message, 403);
  }
}

// 404 错误
export class NotFoundError extends AppError {
  constructor(message: string = '请求的资源不存在') {
    super(message, 404);
  }
}

// 409 错误
export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409);
  }
}

// 422 错误
export class ValidationError extends AppError {
  public readonly errors?: any;

  constructor(message: string = '数据验证失败', errors?: any) {
    super(message, 422);
    this.errors = errors;
  }
}

// 429 错误
export class TooManyRequestsError extends AppError {
  constructor(message: string = '请求过于频繁，请稍后再试') {
    super(message, 429);
  }
}

// 500 错误
export class InternalServerError extends AppError {
  constructor(message: string = '服务器内部错误') {
    super(message, 500);
  }
}

// 503 错误
export class ServiceUnavailableError extends AppError {
  constructor(message: string = '服务暂时不可用') {
    super(message, 503);
  }
}
