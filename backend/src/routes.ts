/**
 * API 路由汇总
 */

import { Router } from 'express';
import authRoutes from '@features/auth/routes/auth.routes';
import userRoutes from './routes/user.routes';
import kolRoutes from '@features/kol/routes/kol.routes';
import templateRoutes from '@features/templates/routes/template.routes';
import analyticsRoutes from '@features/analytics/routes/analytics.routes';
import extensionRoutes from './routes/extension.routes';

const router = Router();

/**
 * 认证路由
 * /api/v1/auth/*
 */
router.use('/auth', authRoutes);

/**
 * 用户管理路由
 * /api/v1/users/*
 */
router.use('/users', userRoutes);

/**
 * KOL 管理路由
 * /api/v1/kols/*
 */
router.use('/kols', kolRoutes);

/**
 * 模板管理路由
 * /api/v1/templates/*
 */
router.use('/templates', templateRoutes);

/**
 * 分析统计路由
 * /api/v1/analytics/*
 */
router.use('/analytics', analyticsRoutes);

/**
 * 插件管理路由
 * /api/v1/extension/*
 */
router.use('/extension', extensionRoutes);

/**
 * 联系记录路由（待实现）
 * /api/v1/contacts/*
 */
// router.use('/contacts', contactRoutes);

export default router;
