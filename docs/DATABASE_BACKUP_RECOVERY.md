# 数据库备份与恢复指南

> ⚠️ **重要**：数据是系统的核心资产，请务必认真阅读并遵循本指南

## 目录

- [快速开始](#快速开始)
- [备份系统](#备份系统)
- [恢复流程](#恢复流程)
- [常见场景](#常见场景)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)

---

## 快速开始

### 立即备份（3 秒）

```bash
cd /home/pdm/DEV/projects/BDTool/backend
pnpm db:backup
```

### 检查数据库健康状态

```bash
pnpm db:health
```

### 查看所有备份

```bash
ls -lh ../backups/
```

---

## 备份系统

### 自动备份

**已配置**：每天凌晨 2:00 自动备份

**设置方法**（如果还没设置）：
```bash
cd /home/pdm/DEV/projects/BDTool
./setup-cron.sh
```

**验证 cron 任务**：
```bash
crontab -l
```

应该看到：
```
0 2 * * * /home/pdm/DEV/projects/BDTool/backup-db.sh >> /home/pdm/DEV/projects/BDTool/backups/backup.log 2>&1

```

> 在重新启动wsl后 需要手动 `sudo systemctl start cron` 然后`crontab -l`验证

### 手动备份

#### 方法 1: 使用 npm 命令（推荐）

```bash
cd /home/pdm/DEV/projects/BDTool/backend
pnpm db:backup
```

#### 方法 2: 直接运行脚本

```bash
/home/pdm/DEV/projects/BDTool/backup-db.sh
```

#### 方法 3: 手动复制（紧急情况）

```bash
cp /home/pdm/DEV/projects/BDTool/backend/prisma/dev.db \
   /home/pdm/DEV/projects/BDTool/backups/dev_backup_$(date +"%Y%m%d_%H%M%S").db
```

### 备份存储位置

```
/home/pdm/DEV/projects/BDTool/backups/
├── dev_backup_20251110_205047.db  # 第一次备份
├── dev_backup_20251110_211557.db  # 第二次备份
└── backup.log                      # 备份日志
```

### 备份保留策略

- **保留期限**：30 天
- **清理机制**：自动清理 30 天前的旧备份
- **存储需求**：约 200KB/备份（当前数据库大小）

---

## 恢复流程

### 场景 1: 数据库文件误删

**症状**：
- 启动后端报错：`Error: SQLITE_CANTOPEN: unable to open database file`
- 数据库文件 `dev.db` 不存在

**恢复步骤**：

#### 1. 停止后端服务

```bash
# 方法 1: 如果在终端运行
Ctrl+C

# 方法 2: 杀死进程
pkill -f "tsx.*server.ts"
```

#### 2. 查找最新备份

```bash
ls -lt /home/pdm/DEV/projects/BDTool/backups/dev_backup_*.db | head -1
```

#### 3. 恢复数据库

```bash
# 复制最新备份到数据库位置
cp /home/pdm/DEV/projects/BDTool/backups/dev_backup_XXXXXX_XXXXXX.db \
   /home/pdm/DEV/projects/BDTool/backend/prisma/dev.db
```

**一键恢复脚本**：
```bash
# 自动恢复最新备份
cp $(ls -t /home/pdm/DEV/projects/BDTool/backups/dev_backup_*.db | head -1) \
   /home/pdm/DEV/projects/BDTool/backend/prisma/dev.db
```

#### 4. 验证恢复

```bash
cd /home/pdm/DEV/projects/BDTool/backend
pnpm db:health
```

#### 5. 重启服务

```bash
pnpm dev
```

---

### 场景 2: 误执行 db:reset

**症状**：
- 所有数据被清空
- 用户账号消失
- KOL 数据丢失

**恢复步骤**：

⚠️ **好消息**：我们已经保护了 `db:reset` 命令，现在执行会被阻止！

如果真的不幸发生了：

```bash
# 1. 立即停止服务
pkill -f "tsx.*server.ts"

# 2. 恢复最新备份
cp $(ls -t /home/pdm/DEV/projects/BDTool/backups/dev_backup_*.db | head -1) \
   /home/pdm/DEV/projects/BDTool/backend/prisma/dev.db

# 3. 检查数据完整性
cd /home/pdm/DEV/projects/BDTool/backend
pnpm db:health

# 4. 重启服务
pnpm dev
```

---

### 场景 3: 数据库文件损坏

**症状**：
- 启动报错：`Error: database disk image is malformed`
- SQLite 错误：`SQLITE_CORRUPT`

**恢复步骤**：

#### 1. 尝试 SQLite 修复工具

```bash
cd /home/pdm/DEV/projects/BDTool/backend/prisma

# 备份损坏的数据库
mv dev.db dev.db.corrupted

# 尝试修复
sqlite3 dev.db.corrupted ".recover" | sqlite3 dev_recovered.db

# 验证修复结果
sqlite3 dev_recovered.db "SELECT COUNT(*) FROM User;"
sqlite3 dev_recovered.db "SELECT COUNT(*) FROM KOL;"
```

#### 2. 如果修复失败，使用备份

```bash
cp $(ls -t /home/pdm/DEV/projects/BDTool/backups/dev_backup_*.db | head -1) dev.db
```

---

### 场景 4: 回滚到特定时间点

**需求**：恢复到昨天的数据状态

**步骤**：

#### 1. 列出所有备份

```bash
ls -lh /home/pdm/DEV/projects/BDTool/backups/dev_backup_*.db
```

输出示例：
```
-rw-r--r-- 1 pdm pdm 196K Nov 10 20:50 dev_backup_20251110_205047.db  # 今天 20:50
-rw-r--r-- 1 pdm pdm 192K Nov 09 02:00 dev_backup_20251109_020000.db  # 昨天 02:00
-rw-r--r-- 1 pdm pdm 188K Nov 08 02:00 dev_backup_20251108_020000.db  # 前天 02:00
```

#### 2. 选择目标备份

```bash
# 例如恢复到 11月9日 的备份
BACKUP_FILE="/home/pdm/DEV/projects/BDTool/backups/dev_backup_20251109_020000.db"
```

#### 3. 执行恢复

```bash
# 停止服务
pkill -f "tsx.*server.ts"

# 备份当前数据库（以防万一）
cp /home/pdm/DEV/projects/BDTool/backend/prisma/dev.db \
   /home/pdm/DEV/projects/BDTool/backend/prisma/dev.db.before_rollback

# 恢复到目标时间点
cp $BACKUP_FILE /home/pdm/DEV/projects/BDTool/backend/prisma/dev.db

# 重启服务
cd /home/pdm/DEV/projects/BDTool/backend
pnpm dev
```

---

## 常见场景

### 数据迁移前备份

```bash
# 迁移到 PostgreSQL 前，务必备份
pnpm db:backup

# 验证备份存在
ls -lh ../backups/dev_backup_*.db | tail -1
```

### Git 操作前备份

```bash
# 切换分支前
pnpm db:backup

# 拉取最新代码前
pnpm db:backup
```

### 部署前备份

```bash
# 部署到生产环境前
pnpm db:backup

# 导出备份到安全位置
cp -r ../backups ~/Desktop/kol-bd-tool-backup-$(date +"%Y%m%d")
```

---

## 最佳实践

### ✅ 应该做的

1. **定期验证备份**
   ```bash
   # 每周测试一次恢复流程
   cp $(ls -t ../backups/dev_backup_*.db | head -1) /tmp/test_restore.db
   sqlite3 /tmp/test_restore.db "SELECT COUNT(*) FROM User;"
   ```

2. **重要操作前备份**
   - 数据库迁移前
   - 大规模数据修改前
   - 系统升级前
   - Git 操作前

3. **异地备份**
   ```bash
   # 定期复制备份到其他位置
   cp -r /home/pdm/DEV/projects/BDTool/backups ~/Dropbox/KOL-BD-Tool-Backups/
   ```

4. **监控备份日志**
   ```bash
   tail -f /home/pdm/DEV/projects/BDTool/backups/backup.log
   ```

### ❌ 不应该做的

1. **不要把备份提交到 Git**
   - 已配置 `.gitignore`，确保备份不被提交

2. **不要在无备份情况下执行危险操作**
   - `db:reset` 已被保护
   - 迁移前必须先备份

3. **不要忽略健康检查警告**
   ```bash
   # 定期检查
   pnpm db:health
   ```

---

## 故障排查

### 问题 1: 备份脚本执行失败

**错误**：`backup-db.sh: No such file or directory`

**解决**：
```bash
# 确认脚本存在
ls -l /home/pdm/DEV/projects/BDTool/backup-db.sh

# 添加执行权限
chmod +x /home/pdm/DEV/projects/BDTool/backup-db.sh
```

---

### 问题 2: cron 任务未执行

**检查 cron 日志**：
```bash
cat /home/pdm/DEV/projects/BDTool/backups/backup.log
```

**验证 cron 任务**：
```bash
crontab -l | grep backup-db
```

**手动测试**：
```bash
/home/pdm/DEV/projects/BDTool/backup-db.sh
```

---

### 问题 3: 恢复后数据不完整

**可能原因**：
- 备份文件本身不完整
- 恢复时选错了备份文件

**解决**：
```bash
# 检查所有备份的数据量
for file in /home/pdm/DEV/projects/BDTool/backups/dev_backup_*.db; do
    echo "$file:"
    sqlite3 "$file" "SELECT COUNT(*) AS users FROM User;"
    sqlite3 "$file" "SELECT COUNT(*) AS kols FROM KOL;"
    echo ""
done
```

---

### 问题 4: 磁盘空间不足

**检查磁盘空间**：
```bash
df -h /home/pdm/DEV/projects/BDTool/backups
```

**清理旧备份**：
```bash
# 删除 60 天前的备份
find /home/pdm/DEV/projects/BDTool/backups -name "dev_backup_*.db" -type f -mtime +60 -delete
```

---

## 自动化脚本

### 一键恢复脚本

创建 `restore-latest.sh`：

```bash
#!/bin/bash

echo "🔄 开始恢复最新备份..."

# 查找最新备份
LATEST_BACKUP=$(ls -t /home/pdm/DEV/projects/BDTool/backups/dev_backup_*.db | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ 未找到备份文件"
    exit 1
fi

echo "📁 找到最新备份: $LATEST_BACKUP"

# 停止服务
echo "🛑 停止后端服务..."
pkill -f "tsx.*server.ts" || true

# 备份当前数据库
echo "💾 备份当前数据库..."
cp /home/pdm/DEV/projects/BDTool/backend/prisma/dev.db \
   /home/pdm/DEV/projects/BDTool/backend/prisma/dev.db.before_restore_$(date +"%Y%m%d_%H%M%S") \
   2>/dev/null || true

# 恢复备份
echo "🔧 恢复数据库..."
cp "$LATEST_BACKUP" /home/pdm/DEV/projects/BDTool/backend/prisma/dev.db

# 验证
echo "✅ 验证数据库..."
cd /home/pdm/DEV/projects/BDTool/backend
sqlite3 prisma/dev.db "SELECT COUNT(*) AS users FROM User;"
sqlite3 prisma/dev.db "SELECT COUNT(*) AS kols FROM KOL;"

echo "🎉 恢复完成！"
echo ""
echo "下一步："
echo "  cd /home/pdm/DEV/projects/BDTool/backend"
echo "  pnpm dev"
```

使用：
```bash
chmod +x restore-latest.sh
./restore-latest.sh
```

---

## 紧急联系

### 数据丢失紧急响应

1. ⚠️ **立即停止所有操作**
2. 📞 **不要重启服务**
3. 🔍 **检查备份目录**：`ls -lh /home/pdm/DEV/projects/BDTool/backups/`
4. 💾 **按照恢复流程操作**

### 需要帮助？

- 查看备份日志：`cat /home/pdm/DEV/projects/BDTool/backups/backup.log`
- 检查数据库健康：`pnpm db:health`
- 查看后端日志：检查 backend 终端输出

---

## 更新日志

- **2025-11-10**: 创建备份系统，添加自动备份、健康检查、安全保护
- **保留期**: 30 天
- **备份频率**: 每天 02:00

---

**记住**：数据无价，备份有价！🔒
