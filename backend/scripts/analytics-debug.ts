/**
 * Analytics Debug Script
 * 用于调试和显示分析数据的详细信息
 *
 * 用法: tsx scripts/analytics-debug.ts <userId>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugAnalytics(userId: number) {
  console.log('=== Analytics Debug Report ===\n');
  console.log(`User ID: ${userId}\n`);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  // 1. 所有 KOL 状态分布
  console.log('📊 所有 KOL 状态分布:');
  const allKOLs = await prisma.kOL.findMany({
    where: { userId },
    select: { id: true, username: true, status: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  const statusCounts: Record<string, number> = {};
  allKOLs.forEach(kol => {
    statusCounts[kol.status] = (statusCounts[kol.status] || 0) + 1;
  });

  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  console.log(`  总计: ${allKOLs.length}\n`);

  // 2. 本周更新的 KOL
  console.log('📅 本周更新的 KOL (过去 7 天):');
  const thisWeekKOLs = allKOLs.filter(kol => kol.updatedAt >= weekStart);
  console.log(`  总数: ${thisWeekKOLs.length}`);

  if (thisWeekKOLs.length > 0) {
    const weeklyStatusCounts: Record<string, number> = {};
    thisWeekKOLs.forEach(kol => {
      weeklyStatusCounts[kol.status] = (weeklyStatusCounts[kol.status] || 0) + 1;
    });

    Object.entries(weeklyStatusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    console.log('\n  详细列表:');
    thisWeekKOLs.forEach(kol => {
      const daysAgo = Math.floor((Date.now() - kol.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`    - ${kol.username} | 状态: ${kol.status} | ${daysAgo} 天前更新`);
    });
  }
  console.log();

  // 3. 总体响应率计算
  console.log('📈 总体响应率计算:');
  const totalNonNewKOLs = allKOLs.filter(kol => kol.status !== 'new');
  const totalResponses = allKOLs.filter(kol =>
    ['replied', 'negotiating', 'cooperating'].includes(kol.status)
  );

  console.log(`  已联系总数 (非新增): ${totalNonNewKOLs.length}`);
  console.log(`  有回应总数 (replied + negotiating + cooperating): ${totalResponses.length}`);

  const overallRate = totalNonNewKOLs.length > 0
    ? ((totalResponses.length / totalNonNewKOLs.length) * 100).toFixed(1)
    : '0.0';
  console.log(`  总体响应率: ${overallRate}%\n`);

  // 4. 本周响应率计算
  console.log('📈 本周响应率计算:');
  const weeklyContacted = thisWeekKOLs.filter(kol => kol.status === 'contacted');
  const weeklyResponses = thisWeekKOLs.filter(kol =>
    ['replied', 'negotiating', 'cooperating'].includes(kol.status)
  );

  console.log(`  本周联系数 (contacted): ${weeklyContacted.length}`);
  console.log(`  本周回应数 (replied + negotiating + cooperating): ${weeklyResponses.length}`);

  const weeklyRate = weeklyContacted.length > 0
    ? ((weeklyResponses.length / weeklyContacted.length) * 100).toFixed(1)
    : '0.0';
  console.log(`  本周响应率: ${weeklyRate}%\n`);

  // 5. 待跟进数和活跃合作数
  console.log('📋 其他指标:');
  const pendingFollowups = allKOLs.filter(kol => kol.status === 'replied');
  const activePartnerships = allKOLs.filter(kol => kol.status === 'cooperating');

  console.log(`  待跟进数 (replied): ${pendingFollowups.length}`);
  console.log(`  活跃合作数 (cooperating): ${activePartnerships.length}`);
  console.log();

  console.log('=== End of Report ===');
}

const userId = parseInt(process.argv[2]);

if (!userId || isNaN(userId)) {
  console.error('请提供有效的用户 ID');
  console.log('用法: tsx scripts/analytics-debug.ts <userId>');
  process.exit(1);
}

debugAnalytics(userId)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
