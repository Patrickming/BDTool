/**
 * 数据库健康检查脚本
 * 用法: tsx scripts/health-check.ts
 */

import { checkDatabaseHealth } from '../src/utils/db-health-check';

async function main() {
  console.log('开始数据库健康检查...\n');

  const result = await checkDatabaseHealth();

  // 根据健康状态返回不同的退出码
  process.exit(result.healthy ? 0 : 1);
}

main().catch((error) => {
  console.error('健康检查脚本执行失败:', error);
  process.exit(1);
});
