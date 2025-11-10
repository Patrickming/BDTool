#!/bin/bash

# 设置数据库自动备份 cron 任务
# 每天凌晨 2 点自动执行备份

echo "设置数据库自动备份 cron 任务..."

# 备份脚本路径
BACKUP_SCRIPT="/home/pdm/DEV/projects/BDTool/backup-db.sh"

# 检查脚本是否存在
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo "❌ 备份脚本不存在: $BACKUP_SCRIPT"
    exit 1
fi

# 检查当前用户的 crontab
echo ""
echo "当前的 cron 任务:"
crontab -l 2>/dev/null || echo "  (无)"
echo ""

# 检查是否已经设置过
if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
    echo "⚠️  该备份任务已存在于 crontab 中"
    echo ""
    read -p "是否要更新？(y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "❌ 已取消"
        exit 0
    fi

    # 移除旧任务
    crontab -l | grep -v "$BACKUP_SCRIPT" | crontab -
    echo "✅ 已移除旧任务"
fi

# 添加新的 cron 任务
# 每天凌晨 2 点执行备份
(crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_SCRIPT >> /home/pdm/DEV/projects/BDTool/backups/backup.log 2>&1") | crontab -

echo "✅ 已设置自动备份任务"
echo ""
echo "备份时间: 每天凌晨 2:00"
echo "备份日志: /home/pdm/DEV/projects/BDTool/backups/backup.log"
echo ""
echo "当前的 cron 任务:"
crontab -l
echo ""
echo "提示："
echo "  - 查看 cron 任务: crontab -l"
echo "  - 编辑 cron 任务: crontab -e"
echo "  - 删除所有任务: crontab -r"
echo "  - 手动测试备份: $BACKUP_SCRIPT"
echo ""
echo "✅ 设置完成！"
