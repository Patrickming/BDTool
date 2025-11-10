#!/bin/bash

# 数据库自动备份脚本
# 用途：定期备份 SQLite 数据库文件，防止数据丢失
# 作者：KOL BD Tool Team
# 最后更新：2025-11-10

set -e  # 遇到错误立即退出

# =============================================================================
# 配置区域
# =============================================================================

PROJECT_ROOT="/home/pdm/DEV/projects/BDTool"
BACKUP_DIR="$PROJECT_ROOT/backups"
DB_FILE="$PROJECT_ROOT/backend/prisma/dev.db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/dev_backup_$TIMESTAMP.db"
LOG_FILE="$BACKUP_DIR/backup.log"

# 备份保留天数（默认 30 天）
RETENTION_DAYS=30

# =============================================================================
# 颜色输出
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# 日志函数
# =============================================================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

# =============================================================================
# 主备份流程
# =============================================================================

log_info "========================================="
log_info "开始数据库备份流程"
log_info "========================================="

# 1. 创建备份目录
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    log_success "创建备份目录: $BACKUP_DIR"
fi

# 2. 检查数据库文件是否存在
if [ ! -f "$DB_FILE" ]; then
    log_error "数据库文件不存在: $DB_FILE"
    exit 1
fi

# 3. 检查数据库文件大小
DB_SIZE=$(du -h "$DB_FILE" | cut -f1)
log_info "数据库大小: $DB_SIZE"

# 4. 检查磁盘空间
DISK_AVAILABLE=$(df -h "$BACKUP_DIR" | tail -1 | awk '{print $4}')
log_info "可用磁盘空间: $DISK_AVAILABLE"

# 5. 执行备份
log_info "正在备份数据库..."
if cp "$DB_FILE" "$BACKUP_FILE"; then
    log_success "备份成功: $BACKUP_FILE"

    # 验证备份文件
    if [ -f "$BACKUP_FILE" ]; then
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log_success "备份文件大小: $BACKUP_SIZE"

        # 简单完整性检查（对比文件大小）
        ORIGINAL_BYTES=$(stat -c%s "$DB_FILE")
        BACKUP_BYTES=$(stat -c%s "$BACKUP_FILE")

        if [ "$ORIGINAL_BYTES" -eq "$BACKUP_BYTES" ]; then
            log_success "备份文件完整性验证通过"
        else
            log_warning "备份文件大小不一致，可能存在问题"
        fi
    else
        log_error "备份文件未找到，备份可能失败"
        exit 1
    fi
else
    log_error "备份失败"
    exit 1
fi

# 6. 清理过期备份
log_info "清理 $RETENTION_DAYS 天前的旧备份..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "dev_backup_*.db" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)

if [ "$DELETED_COUNT" -gt 0 ]; then
    log_info "已删除 $DELETED_COUNT 个过期备份"
else
    log_info "无过期备份需要清理"
fi

# 7. 统计当前备份数量
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "dev_backup_*.db" -type f | wc -l)
log_info "当前备份文件数量: $BACKUP_COUNT"

# 8. 列出最近 5 个备份
log_info "最近的备份文件:"
ls -lht "$BACKUP_DIR"/dev_backup_*.db 2>/dev/null | head -5 | awk '{print "  - " $9 " (" $5 ")"}'

# 9. 完成
log_success "========================================="
log_success "数据库备份流程完成"
log_success "备份文件: $BACKUP_FILE"
log_success "========================================="

# 10. 显示恢复命令提示
log_info ""
log_info "数据恢复命令（如需恢复）:"
log_info "  cp $BACKUP_FILE $DB_FILE"
log_info ""

exit 0
