/**
 * 文件上传工具
 */

import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { AppError } from '@common/errors/app-error';

// 上传目录
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// 头像存储配置
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(UPLOAD_DIR, 'avatars'));
  },
  filename: (_req, file, cb) => {
    // 生成唯一文件名：时间戳-随机数-原始扩展名
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

// 文件过滤器 - 只允许图片
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 允许的 MIME 类型
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('只能上传图片文件（JPEG, PNG, GIF, WebP）', 400));
  }
};

// 头像上传中间件
export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
