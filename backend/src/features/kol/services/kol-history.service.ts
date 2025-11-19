/**
 * KOL 历史记录服务
 * 用于记录 KOL 数据的所有变更
 */

import { prisma } from '@database/client';
import { logger } from '@config/logger.config';

/**
 * 记录 KOL 字段变更
 * @param kolId - KOL ID
 * @param userId - 操作用户 ID
 * @param fieldName - 字段名
 * @param oldValue - 旧值
 * @param newValue - 新值
 */
export async function recordKOLChange(
  kolId: number,
  userId: number,
  fieldName: string,
  oldValue: unknown,
  newValue: unknown
): Promise<void> {
  try {
    // 将值转换为 JSON 字符串
    const oldValueStr = oldValue !== undefined && oldValue !== null
      ? JSON.stringify(oldValue)
      : null;
    const newValueStr = newValue !== undefined && newValue !== null
      ? JSON.stringify(newValue)
      : null;

    await prisma.kOLHistory.create({
      data: {
        kolId,
        userId,
        fieldName,
        oldValue: oldValueStr,
        newValue: newValueStr,
      },
    });

    logger.debug(`记录 KOL ${kolId} 字段 ${fieldName} 变更: ${oldValueStr} -> ${newValueStr}`);
  } catch (error) {
    logger.error(`记录 KOL 历史失败:`, error);
    // 不抛出错误，避免影响主要业务
  }
}

/**
 * 批量记录 KOL 字段变更
 * @param kolId - KOL ID
 * @param userId - 操作用户 ID
 * @param changes - 变更列表 { fieldName, oldValue, newValue }[]
 */
export async function recordKOLChanges(
  kolId: number,
  userId: number,
  changes: Array<{ fieldName: string; oldValue: unknown; newValue: unknown }>
): Promise<void> {
  try {
    const records = changes.map(change => ({
      kolId,
      userId,
      fieldName: change.fieldName,
      oldValue: change.oldValue !== undefined && change.oldValue !== null
        ? JSON.stringify(change.oldValue)
        : null,
      newValue: change.newValue !== undefined && change.newValue !== null
        ? JSON.stringify(change.newValue)
        : null,
    }));

    await prisma.kOLHistory.createMany({
      data: records,
    });

    logger.debug(`批量记录 KOL ${kolId} 的 ${changes.length} 个字段变更`);
  } catch (error) {
    logger.error(`批量记录 KOL 历史失败:`, error);
  }
}

/**
 * 比较两个对象并返回变更的字段
 * @param oldData - 旧数据
 * @param newData - 新数据
 * @param fieldsToTrack - 需要跟踪的字段列表
 * @returns 变更列表
 */
export function compareKOLData(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  fieldsToTrack: string[]
): Array<{ fieldName: string; oldValue: unknown; newValue: unknown }> {
  const changes: Array<{ fieldName: string; oldValue: unknown; newValue: unknown }> = [];

  for (const field of fieldsToTrack) {
    if (field in newData) {
      const oldValue = oldData[field];
      const newValue = newData[field];

      // 比较值是否相等
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          fieldName: field,
          oldValue,
          newValue,
        });
      }
    }
  }

  return changes;
}

/**
 * 获取 KOL 的历史记录
 * @param kolId - KOL ID
 * @param limit - 返回数量限制
 * @param offset - 偏移量
 * @returns 历史记录列表
 */
export async function getKOLHistory(
  kolId: number,
  limit: number = 50,
  offset: number = 0
) {
  return prisma.kOLHistory.findMany({
    where: { kolId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

/**
 * 获取用户所有 KOL 的状态变更历史（用于统计）
 * @param userId - 用户 ID
 * @param fieldName - 字段名（如 'status'）
 * @param startDate - 开始日期
 * @param endDate - 结束日期
 * @returns 历史记录列表
 */
export async function getKOLStatusHistory(
  userId: number,
  fieldName: string,
  startDate?: Date,
  endDate?: Date
) {
  return prisma.kOLHistory.findMany({
    where: {
      userId,
      fieldName,
      ...(startDate && { createdAt: { gte: startDate } }),
      ...(endDate && { createdAt: { lte: endDate } }),
    },
    orderBy: { createdAt: 'asc' },
  });
}

// 需要跟踪的 KOL 字段列表
export const KOL_TRACKED_FIELDS = [
  'status',
  'customNotes',
  'qualityScore',
  'contentCategory',
  'language',
  'followerCount',
  'followingCount',
  'bio',
  'displayName',
  'username',
  'verified',
  'profileImgUrl',
];
