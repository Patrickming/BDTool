/**
 * 数据库健康检查工具
 * 用途：定期检查数据库状态，及早发现问题
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { logger } from '@config/logger.config';

const prisma = new PrismaClient();

/**
 * 数据库健康检查结果
 */
export interface DatabaseHealthStatus {
  healthy: boolean;
  checks: {
    connection: boolean;
    fileExists: boolean;
    fileSize: number;
    diskSpace: string;
    tableCount: number;
    userCount: number;
    kolCount: number;
    lastBackup: string | null;
  };
  warnings: string[];
  errors: string[];
}

/**
 * 执行完整的数据库健康检查
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  const warnings: string[] = [];
  const errors: string[] = [];
  let healthy = true;

  const checks = {
    connection: false,
    fileExists: false,
    fileSize: 0,
    diskSpace: '未知',
    tableCount: 0,
    userCount: 0,
    kolCount: 0,
    lastBackup: null as string | null,
  };

  try {
    // 1. 数据库连接测试
    logger.info('🔍 检查数据库连接...');
    try {
      await prisma.$connect();
      checks.connection = true;
      logger.info('✅ 数据库连接正常');
    } catch (error: any) {
      checks.connection = false;
      healthy = false;
      errors.push(`数据库连接失败: ${error.message}`);
      logger.error('❌ 数据库连接失败:', error);
    }

    // 2. 数据库文件检查 (仅 SQLite)
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    logger.info('🔍 检查数据库文件...');

    if (fs.existsSync(dbPath)) {
      checks.fileExists = true;
      const stats = fs.statSync(dbPath);
      checks.fileSize = stats.size;

      const sizeMB = stats.size / (1024 * 1024);
      logger.info(`✅ 数据库文件存在，大小: ${sizeMB.toFixed(2)} MB`);

      // 文件大小警告
      if (sizeMB > 1000) {
        warnings.push(`数据库文件过大 (${sizeMB.toFixed(2)} MB)，建议迁移到 PostgreSQL`);
      } else if (sizeMB > 500) {
        warnings.push(`数据库文件较大 (${sizeMB.toFixed(2)} MB)，接近 SQLite 推荐上限`);
      }
    } else {
      checks.fileExists = false;
      healthy = false;
      errors.push('数据库文件不存在');
      logger.error('❌ 数据库文件不存在:', dbPath);
    }

    // 3. 磁盘空间检查
    logger.info('🔍 检查磁盘空间...');
    try {
      const { execSync } = require('child_process');
      const diskInfo = execSync(`df -h ${dbPath} | tail -1`).toString().trim();
      const availableSpace = diskInfo.split(/\s+/)[3];
      checks.diskSpace = availableSpace;
      logger.info(`✅ 可用磁盘空间: ${availableSpace}`);

      // 磁盘空间警告
      const availableGB = parseFloat(availableSpace);
      if (availableGB < 1) {
        healthy = false;
        errors.push(`磁盘空间不足 (${availableSpace})，请立即清理`);
      } else if (availableGB < 10) {
        warnings.push(`磁盘空间较少 (${availableSpace})，建议清理`);
      }
    } catch (error) {
      warnings.push('无法获取磁盘空间信息');
    }

    // 4. 数据表统计
    if (checks.connection) {
      logger.info('🔍 检查数据统计...');

      try {
        const [userCount, kolCount] = await Promise.all([
          prisma.user.count(),
          prisma.kOL.count(),
        ]);

        checks.userCount = userCount;
        checks.kolCount = kolCount;

        logger.info(`✅ 数据统计: ${userCount} 个用户, ${kolCount} 个 KOL`);

        // 数据统计警告
        if (userCount === 0) {
          warnings.push('数据库中没有用户数据');
        }
      } catch (error: any) {
        warnings.push(`无法获取数据统计: ${error.message}`);
      }
    }

    // 5. 最后备份时间检查
    logger.info('🔍 检查最近备份...');
    const backupDir = path.join(process.cwd(), '..', 'backups');

    if (fs.existsSync(backupDir)) {
      const backupFiles = fs
        .readdirSync(backupDir)
        .filter((file) => file.startsWith('dev_backup_') && file.endsWith('.db'))
        .map((file) => ({
          name: file,
          time: fs.statSync(path.join(backupDir, file)).mtime,
        }))
        .sort((a, b) => b.time.getTime() - a.time.getTime());

      if (backupFiles.length > 0) {
        const latestBackup = backupFiles[0];
        checks.lastBackup = latestBackup.time.toISOString();
        const hoursSinceBackup =
          (Date.now() - latestBackup.time.getTime()) / (1000 * 60 * 60);

        logger.info(
          `✅ 最近备份: ${latestBackup.name} (${hoursSinceBackup.toFixed(1)} 小时前)`
        );

        // 备份时间警告
        if (hoursSinceBackup > 48) {
          warnings.push(`最近一次备份是 ${hoursSinceBackup.toFixed(0)} 小时前，建议执行备份`);
        } else if (hoursSinceBackup > 24) {
          warnings.push(`最近一次备份是 ${hoursSinceBackup.toFixed(0)} 小时前`);
        }
      } else {
        warnings.push('未找到任何备份文件，请立即执行备份');
      }
    } else {
      warnings.push('备份目录不存在，请执行备份');
    }

    // 6. 汇总结果
    logger.info('');
    logger.info('========================================');
    logger.info('数据库健康检查完成');
    logger.info('========================================');
    logger.info(`状态: ${healthy ? '✅ 健康' : '❌ 异常'}`);
    logger.info(`连接: ${checks.connection ? '✅' : '❌'}`);
    logger.info(`文件: ${checks.fileExists ? '✅' : '❌'}`);
    logger.info(`大小: ${(checks.fileSize / (1024 * 1024)).toFixed(2)} MB`);
    logger.info(`磁盘: ${checks.diskSpace}`);
    logger.info(`用户: ${checks.userCount}`);
    logger.info(`KOL: ${checks.kolCount}`);

    if (warnings.length > 0) {
      logger.warn('');
      logger.warn('⚠️  警告:');
      warnings.forEach((warning) => logger.warn(`  - ${warning}`));
    }

    if (errors.length > 0) {
      logger.error('');
      logger.error('❌ 错误:');
      errors.forEach((error) => logger.error(`  - ${error}`));
    }

    logger.info('========================================');
  } catch (error: any) {
    healthy = false;
    errors.push(`健康检查异常: ${error.message}`);
    logger.error('❌ 数据库健康检查异常:', error);
  } finally {
    await prisma.$disconnect();
  }

  return {
    healthy,
    checks,
    warnings,
    errors,
  };
}

/**
 * 简单的数据库可用性检查（快速）
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.user.findFirst();
    await prisma.$disconnect();
    return true;
  } catch (error) {
    logger.error('数据库快速健康检查失败:', error);
    return false;
  }
}
