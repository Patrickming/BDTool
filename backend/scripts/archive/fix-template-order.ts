/**
 * 修复模板的 displayOrder 字段
 * 为每个用户的模板按 id 顺序分配 displayOrder
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTemplateOrder() {
  try {
    console.log('开始修复模板顺序...');

    // 获取所有用户
    const users = await prisma.user.findMany({
      select: { id: true, email: true },
    });

    console.log(`找到 ${users.length} 个用户`);

    for (const user of users) {
      // 获取该用户的所有模板，按 id 排序
      const templates = await prisma.template.findMany({
        where: { userId: user.id },
        orderBy: { id: 'asc' },
        select: { id: true, name: true, displayOrder: true },
      });

      console.log(`\n用户 ${user.email} (ID: ${user.id}) 有 ${templates.length} 个模板`);

      if (templates.length === 0) {
        continue;
      }

      // 更新每个模板的 displayOrder
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        if (template.displayOrder !== i) {
          await prisma.template.update({
            where: { id: template.id },
            data: { displayOrder: i },
          });
          console.log(`  更新模板 ${template.name} (ID: ${template.id}): displayOrder ${template.displayOrder} -> ${i}`);
        } else {
          console.log(`  跳过模板 ${template.name} (ID: ${template.id}): displayOrder 已经是 ${i}`);
        }
      }
    }

    console.log('\n✅ 模板顺序修复完成！');
  } catch (error) {
    console.error('❌ 修复失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixTemplateOrder();
