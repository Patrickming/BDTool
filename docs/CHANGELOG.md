# 更新日志

## [2025-11-09] - v1.4.0 功能完成

### 🔧 KOL 管理 Bug 修复

#### Bug 1: 重置按钮不自动刷新列表
**问题描述**: 点击重置按钮后，筛选条件被重置，但列表没有自动刷新。

**根本原因**: React 状态更新是异步的，`resetQueryParams()` 后立即调用 `fetchKOLs(queryParams)` 使用的是旧的参数值。

**解决方案**: 修改为 `fetchKOLs()`，让它使用 store 中已更新的参数。

**修改文件**: [frontend/src/pages/KOL/KOLList.tsx](../frontend/src/pages/KOL/KOLList.tsx#L65-L69)

```typescript
const handleReset = () => {
  form.resetFields();
  resetQueryParams();
  fetchKOLs();  // 不传参数，使用 store 的最新状态
};
```

---

#### Bug 2: 认证状态筛选失败
**问题描述**: 选择"未认证"（false）时，筛选器不生效。

**根本原因**: JavaScript `||` 运算符将 `false` 视为假值，导致 `false || undefined` 返回 `undefined`。

**解决方案**: 使用显式的 undefined 检查。

**修改文件**: [frontend/src/pages/KOL/KOLList.tsx](../frontend/src/pages/KOL/KOLList.tsx#L56)

```typescript
// 之前: verified: values.verified || undefined
// 修改为:
verified: values.verified !== undefined ? values.verified : undefined,
```

---

#### Bug 3: 搜索功能报错
**问题描述**: 搜索用户名时，后端返回 500 错误：
```
Unknown argument `mode`. Did you mean `lte`?
```

**根本原因**: SQLite 数据库不支持 Prisma 的 `mode: 'insensitive'` 参数（该参数仅支持 PostgreSQL 和 MongoDB）。

**解决方案**: 移除 `mode` 参数，搜索变为大小写敏感（SQLite 默认行为）。

**修改文件**: [backend/src/features/kol/services/kol.service.ts](../backend/src/features/kol/services/kol.service.ts#L226-L231)

```typescript
// 之前:
{ username: { contains: search, mode: 'insensitive' } }

// 修改为:
{ username: { contains: search } }
```

**影响**: 搜索现在大小写敏感。如需不敏感搜索，需迁移到 PostgreSQL 或使用 LOWER() 函数。

---

### 📊 数据分析功能优化

#### 变更 1: 修复计算逻辑（使用 KOL 状态）
**问题**: 之前的数据分析基于 `contactLog` 表计算，但实际业务中 KOL 的状态变化才是关键指标。

**解决方案**: 重写所有分析计算，改为基于 `kol` 表的 `status` 字段。

**核心指标重新定义**:

1. **本周联系数**:
   ```sql
   COUNT(kol WHERE status='contacted' AND updatedAt >= 7_days_ago)
   ```

2. **总体响应率**:
   ```sql
   (replied + negotiating + cooperating) / (所有非 new 状态) × 100%
   ```

3. **本周响应率**:
   ```sql
   本周(replied + negotiating + cooperating) / 本周contacted × 100%
   ```

4. **待跟进数**:
   ```sql
   COUNT(kol WHERE status='replied')
   ```

5. **活跃合作数**:
   ```sql
   COUNT(kol WHERE status='cooperating')
   ```

**修改文件**: [backend/src/features/analytics/services/analytics.service.ts](../backend/src/features/analytics/services/analytics.service.ts#L82-L147)

---

#### 变更 2: 时间线默认改为 7 天
**问题**: 原默认 30 天数据过多，不利于关注近期活动。

**解决方案**: 将默认值从 30 天改为 7 天。

**修改文件**:
- [backend/src/features/analytics/controllers/analytics.controller.ts](../backend/src/features/analytics/controllers/analytics.controller.ts#L65) - 参数默认值
- [frontend/src/store/analytics.store.ts](../frontend/src/store/analytics.store.ts#L52) - 前端 store 初始值

---

#### 变更 3: KOL 状态调整
**新增状态**: `cooperated` (已合作) - 表示合作已完成
**移除状态**: `not_interested` (不感兴趣) - 该状态不常用

**修改文件**:
- [backend/src/features/kol/dto/create-kol.dto.ts](../backend/src/features/kol/dto/create-kol.dto.ts#L29-L37) - Zod 枚举
- [frontend/src/types/kol.ts](../frontend/src/types/kol.ts) - TypeScript 枚举和配置
- [frontend/src/components/analytics/StatusDistributionChart.tsx](../frontend/src/components/analytics/StatusDistributionChart.tsx) - 图表颜色和标签

**状态列表**:
```typescript
'new'          // 新增
'contacted'    // 已联系
'replied'      // 已回复
'negotiating'  // 洽谈中
'cooperating'  // 合作中
'cooperated'   // 已合作 ✨ 新增
'rejected'     // 已拒绝
// 'not_interested' ❌ 已移除
```

---

### 🌐 翻译服务集成（DeepL API）

#### 功能概述
集成 DeepL 翻译服务，支持中英文互译，为国际化 KOL 沟通提供支持。

#### 实现内容

**1. 后端 API**
- ✅ `GET /api/v1/translation/status` - 获取翻译服务健康状态
- ✅ `POST /api/v1/translation/translate` - 翻译文本（中→英 或 英→中）
- ✅ `POST /api/v1/translation/detect` - 检测文本语言

**核心特性**:
- 使用量统计（已用字符数 / 配额）
- 健康检查（API 可用性检测）
- 自动语言检测
- 错误处理和降级

**配置**:
```bash
# .env 文件
DEEPL_API_KEY=your-deepl-api-key
```

**修改/新增文件**:
- `/backend/src/features/translation/` - 翻译服务模块
  - `controllers/translation.controller.ts` - 控制器
  - `services/translation.service.ts` - 业务逻辑
  - `routes/translation.routes.ts` - 路由

**2. 前端集成**
- ✅ 翻译服务 API 封装
- ✅ 翻译按钮 UI 组件
- ✅ 实时翻译结果显示
- ✅ 错误提示优化

**修改/新增文件**:
- `/frontend/src/services/translation.service.ts` - API 服务
- `/frontend/src/types/translation.ts` - 类型定义

**3. 使用场景**
- 模板内容翻译（将中文模板翻译为英文发送给 KOL）
- KOL 简介翻译（理解外语 KOL 的 bio）
- 回复内容翻译（快速理解 KOL 回复）

**4. 技术特点**
- 专业翻译质量（DeepL > Google Translate）
- 实时 API 调用
- 健康监控
- 使用量追踪

#### 相关文档
- ✅ [翻译服务配置指南](./翻译服务配置指南.md) - 详细配置和使用说明

---

### 🗄️ 数据库安全系统

#### 功能概述
实现自动化数据库备份系统，保障数据安全，支持快速恢复。

#### 实现内容

**1. 自动备份脚本**
- ✅ Shell 脚本：`/backend/scripts/backup-db.sh`
- ✅ 自动备份 SQLite 数据库文件
- ✅ 保留最近 7 天的备份
- ✅ 自动清理过期备份
- ✅ 备份文件命名：`dev_YYYYMMDD_HHMMSS.db`

**使用方法**:
```bash
cd /home/pdm/DEV/projects/BDTool/backend
./scripts/backup-db.sh
```

**2. Cron 定时任务**
- ✅ 每天凌晨 4:00 自动备份
- ✅ WSL 环境兼容性优化
- ✅ 日志记录到 `/tmp/backup-db.log`

**Crontab 配置**:
```cron
0 4 * * * /home/pdm/DEV/projects/BDTool/backend/scripts/backup-db.sh >> /tmp/backup-db.log 2>&1
```

**3. 健康检查脚本**
- ✅ `pnpm db:health` - 检查数据库连接
- ✅ 验证表结构
- ✅ 统计各表记录数

**4. 备份与恢复文档**
- ✅ [DATABASE_BACKUP_RECOVERY.md](./DATABASE_BACKUP_RECOVERY.md)
- 包含：
  - 备份策略说明
  - 恢复步骤详解
  - 常见问题解决
  - WSL 环境配置

#### 技术特点
- 无需停机备份
- 自动化管理
- 保留策略（7 天滚动）
- 跨平台支持（Linux / WSL）

---

### 🔌 Chrome 插件优化 - 侧边栏（Side Panel）

#### 功能变更
从传统的 Popup 弹窗改为 Side Panel 侧边栏设计。

#### 优势
- ✅ 固定在浏览器右侧，不会遮挡页面内容
- ✅ 始终可见，无需反复打开插件
- ✅ 更大的显示空间
- ✅ 更符合工作流（边浏览边操作）

#### 技术实现
使用 Manifest V3 的 Side Panel API：

```json
// manifest.json
{
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "permissions": ["sidePanel"]
}
```

**修改文件**:
- `/extension/manifest.json` - 添加 sidePanel 配置
- `/extension/sidepanel.html` - 侧边栏 UI（原 popup.html）
- `/extension/sidepanel.js` - 侧边栏逻辑（原 popup.js）

#### UI 改进
- 更清晰的布局
- 实时统计显示
- 更大的按钮和文字
- 更好的可读性

---

### 📝 文档更新

#### 新增文档
- ✅ [翻译服务配置指南.md](./翻译服务配置指南.md) - DeepL API 配置和使用
- ✅ [DATABASE_BACKUP_RECOVERY.md](./DATABASE_BACKUP_RECOVERY.md) - 数据库备份与恢复
- ✅ `/backend/scripts/analytics-debug.ts` - 数据分析调试工具

#### 更新文档
- ✅ 主项目 [README.md](../README.md) - 更新功能列表和路线图
- ✅ [backend/README.md](../backend/README.md) - 更新 API 端点列表
- ✅ [frontend/README.md](../frontend/README.md) - 更新功能清单
- ✅ [extension/README.md](../extension/README.md) - 更新侧边栏说明
- ✅ 本文件 [CHANGELOG.md](./CHANGELOG.md) - 记录所有变更

---

## [2025-11-08] - CSV 导出功能完成

### 📥 KOL CSV 导出功能

#### 功能概述
实现了 KOL 列表的 CSV 导出功能，支持将所有 KOL 数据导出为 Excel 兼容的 CSV 文件，包含 17 列完整信息。

#### 实现内容

**1. 导出工具函数（utils/export.ts）**
- ✅ `exportKOLsToCSV()` - 导出 KOL 列表为 CSV 文件
- ✅ BOM 头支持（确保 Excel 正确显示中文）
- ✅ Papa Parse 5.5.3 库集成
- ✅ 自动下载功能（Blob + createObjectURL）
- ✅ 文件名包含时间戳（格式：KOL导出_2025-11-08T10-30-15.csv）

**2. CSV 数据格式**
- ✅ 17 列完整数据：
  - 用户名、显示名称、粉丝数、关注数
  - 状态、内容分类、质量分、是否认证
  - 语言、个人简介、Twitter ID、头像 URL
  - 最后推文日期、账号创建日期、备注
  - 创建时间、更新时间
- ✅ 所有字段自动加引号（避免格式问题）
- ✅ 中文字段名（便于阅读）
- ✅ 日期格式本地化（zh-CN）
- ✅ 状态和分类显示中文标签

**3. 前端集成**
- ✅ KOL 列表页添加"导出 CSV"按钮
- ✅ 显示导出数量（实时统计）
- ✅ 无数据时自动禁用按钮
- ✅ 导出成功提示（显示导出数量）
- ✅ 导出失败错误处理

**4. 技术特点**
- ✅ Papa Parse 自动处理特殊字符
- ✅ UTF-8 BOM 头确保 Excel 正确识别
- ✅ 内存友好（使用 Blob 和 URL.createObjectURL）
- ✅ 自动清理临时 URL（防止内存泄漏）

#### 文件修改
- **新增文件：**
  - `/frontend/src/utils/export.ts` - 导出工具函数（95 行）
- **修改文件：**
  - `/frontend/src/pages/KOL/KOLList.tsx` - 添加导出按钮和处理函数
  - `/frontend/package.json` - 添加 papaparse 依赖

#### 依赖更新
- `papaparse` 5.5.3 - CSV 解析和生成库
- `@types/papaparse` 5.5.0 - TypeScript 类型定义

#### 实际耗时
约 0.5 小时（远优于预计的 1-2 小时）

---

## [2025-11-08] - Extension Token 双认证系统 + 粉丝数分布优化

### 🔐 Extension Token 认证系统

#### 功能概述
实现了浏览器插件专用的 Token 认证系统，支持 JWT 和 Extension Token 双认证模式，确保插件安全高效地与后端通信。

#### 新增功能

**1. Extension Token 管理 API**
- ✅ `GET /api/v1/extension/token` - 获取当前用户的 Extension Token
- ✅ `POST /api/v1/extension/token/generate` - 生成新的 Extension Token
- ✅ `POST /api/v1/extension/token/activate` - 激活 Extension Token
- ✅ Token 自动生成（SHA-256 哈希）
- ✅ Token 状态管理（active/inactive）
- ✅ 用户隔离（每个用户独立的 Token）

**2. 双认证中间件**
- ✅ 创建 `authenticateExtensionOrJWT` 中间件
- ✅ 支持 JWT Bearer Token 认证（Web 应用）
- ✅ 支持 Extension Token 认证（`X-Extension-Token` Header）
- ✅ 自动降级：优先 JWT，失败则尝试 Extension Token
- ✅ 统一的 `req.user` 接口

**3. 路由集成**
- ✅ Extension Token 管理路由（`/api/v1/extension/*`）
- ✅ KOL 上传路由支持双认证（`POST /api/v1/kols`）
- ✅ 其他路由保持 JWT 认证不变

**4. 前端集成**
- ✅ Extension 配置页面（Token 显示、复制、生成）
- ✅ Token 状态显示（激活/未激活）
- ✅ 一键复制 Token 功能
- ✅ 今日捕获统计显示

**5. Chrome Extension 集成**
- ✅ Extension Token 存储（Chrome Storage API）
- ✅ 自动 Token 验证
- ✅ 上传请求使用 Extension Token
- ✅ Token 过期提示

#### 数据库变更
- ✅ `User` 模型新增字段：
  - `extensionToken: String?` - Extension Token（可选）
  - `extensionTokenActive: Boolean` - Token 激活状态
- ✅ 数据库迁移已完成

#### 文件修改
- **后端：**
  - `/backend/src/controllers/extension.controller.ts` - 新增
  - `/backend/src/routes/extension.routes.ts` - 新增
  - `/backend/src/middleware/extension-auth.middleware.ts` - 新增
  - `/backend/src/features/kol/routes/kol.routes.ts` - 更新（POST 路由支持双认证）
  - `/backend/prisma/schema.prisma` - 更新 User 模型
- **前端：**
  - `/frontend/src/pages/Extension.tsx` - 新增
  - `/frontend/src/services/extension.service.ts` - 新增
  - `/frontend/src/types/extension.ts` - 新增
- **插件：**
  - `/extension/background.js` - 更新（支持 Extension Token）

---

### 📊 粉丝数分布范围优化

#### 问题
原有的粉丝数分布范围（1k-50k）过窄，无法正确统计大多数 KOL 数据。

#### 解决方案
- ✅ 扩展粉丝数统计范围：
  - `0-1k` - 小型账号
  - `1k-10k` - 微影响力账号
  - `10k-50k` - 中等影响力账号
  - `50k-100k` - 高影响力账号
  - `100k-500k` - 大型 KOL
  - `500k以上` - 顶级 KOL

#### 影响范围
- ✅ 后端：`/backend/src/features/analytics/services/analytics.service.ts`
- ✅ Analytics API 返回新的分布数据
- ✅ 前端图表自动适配新范围

---

### 🐛 重复检测提示优化

#### 问题
Chrome 插件上传重复 KOL 时显示"成功上传0个"，没有明确提示重复。

#### 解决方案
- ✅ 分离重复统计（`duplicateCount`、`duplicates[]`）
- ✅ 检测后端 400 状态码和"已存在"消息
- ✅ 构建详细提示消息：
  - 成功上传数量
  - 重复数量及用户名列表
  - 失败数量
  - 重复提示引导语

#### 文件修改
- `/extension/background.js` - 优化消息构建逻辑（lines 93-133）

---

### 🔧 Bug 修复

**1. Import Path 错误**
- ✅ 修复 `extension.routes.ts` 导入路径（`@middlewares` → `../middleware`）
- ✅ 修复 `extension.controller.ts` 导入路径（`@database` → `../database`）

**2. req.user 属性不一致**
- ✅ 统一使用 `req.user.id`（之前部分代码使用 `userId`）
- ✅ 修复 `extension-auth.middleware.ts` 设置 `req.user` 格式

**3. Middleware 名称错误**
- ✅ 修复 `extension.routes.ts` 导入 `requireAuth`（之前错误使用 `authenticateJWT`）

---

### 📁 新增文件

**后端：**
- `/backend/src/controllers/extension.controller.ts` - Extension Token 控制器
- `/backend/src/routes/extension.routes.ts` - Extension Token 路由
- `/backend/src/middleware/extension-auth.middleware.ts` - 双认证中间件

**前端：**
- `/frontend/src/pages/Extension.tsx` - Extension 配置页面
- `/frontend/src/services/extension.service.ts` - Extension API 服务
- `/frontend/src/types/extension.ts` - Extension 类型定义

---

### 📝 技术细节

**1. Token 生成算法**
```typescript
const randomBytes = crypto.randomBytes(32);
const token = crypto.createHash('sha256')
  .update(randomBytes)
  .digest('hex');
```

**2. 双认证流程**
```
1. 检查 Authorization Header（JWT）
   ├─ 有效 → 设置 req.user，继续
   └─ 无效 → 继续步骤 2

2. 检查 X-Extension-Token Header
   ├─ 有效 → 设置 req.user，继续
   └─ 无效 → 返回 401
```

**3. 重复检测逻辑**
```javascript
if (response.status === 400 && error.message?.includes("已存在")) {
  duplicateCount++;
  duplicates.push(`@${kol.username}`);
} else {
  failedCount++;
  errors.push(errorMsg);
}
```

---

## [2025-01-07] - 功能 3 模板管理系统设计 + 顶部导航栏修正

### 📋 功能 3 - 模板管理系统设计

#### 新增设计文档
- ✅ **创建** `docs/功能3-模板管理系统设计.md`（约 800 行）
  - 完整的数据库设计（基于现有 Template 模型）
  - 变量系统设计（14 种变量支持）
  - 详细的后端实现步骤（3.5 小时）
  - 详细的前端实现步骤（5 小时）
  - 完整的测试计划（1 小时）
  - 文档更新清单（0.5 小时）
  - **总预计耗时：约 10 小时**

#### 核心功能设计

**1. 模板 CRUD**
- 创建、查看、编辑、删除模板
- 按分类组织（初次联系、跟进、谈判、合作、维护）
- 用户数据隔离
- 多语言支持

**2. 变量替换系统**
- **KOL 变量：** `{{username}}`, `{{display_name}}`, `{{follower_count}}`, `{{bio}}`, `{{profile_url}}`
- **用户变量：** `{{my_name}}`, `{{my_email}}`, `{{exchange_name}}`
- **系统变量：** `{{today}}`, `{{today_cn}}`
- 变量格式验证（正则：`/\{\{([a-z_][a-z0-9_]*)\}\}/g`）
- 智能变量替换函数

**3. 模板分类**
- `initial` - 初次联系 ✉️
- `followup` - 跟进联系 🔄
- `negotiation` - 价格谈判 💰
- `collaboration` - 合作细节 🤝
- `maintenance` - 关系维护 💝

**4. 实时预览**
- 选择 KOL 后实时预览
- 显示原始内容和替换后内容
- 显示所有可用变量及其值
- 支持不带 KOL 的预览（仅系统变量）

**5. 使用统计**
- `useCount` - 使用次数
- `successCount` - 成功次数（KOL 积极回复）
- 成功率计算：`successCount / useCount × 100%`

#### 后端设计要点

**DTO 层（4 个文件）：**
- `create-template.dto.ts` - 创建模板验证（含变量格式验证）
- `update-template.dto.ts` - 更新模板验证
- `template-query.dto.ts` - 查询参数验证
- `preview-template.dto.ts` - 预览请求验证

**Service 层（6 个核心方法）：**
- `createTemplate()` - 创建模板
- `getTemplates()` - 分页列表查询
- `getTemplateById()` - 获取单条详情
- `updateTemplate()` - 更新模板
- `deleteTemplate()` - 删除模板
- `previewTemplate()` - 预览（变量替换）

**辅助方法：**
- `replaceVariables()` - 变量替换核心函数
- `extractVariables()` - 提取模板中的变量

**API 端点（6 个）：**
- `POST /api/v1/templates` - 创建模板
- `GET /api/v1/templates` - 获取列表
- `GET /api/v1/templates/:id` - 获取详情
- `PUT /api/v1/templates/:id` - 更新
- `DELETE /api/v1/templates/:id` - 删除
- `POST /api/v1/templates/preview` - 预览

#### 前端设计要点

**类型定义：**
- Template、CreateTemplateDto、UpdateTemplateDto 接口
- TemplateCategory 枚举
- TEMPLATE_CATEGORY_CONFIG - 分类配置（颜色、图标）
- AVAILABLE_VARIABLES - 所有可用变量列表（含分类、示例）

**状态管理（Zustand）：**
- 模板列表状态
- 分页状态
- 查询参数状态
- 当前模板状态

**复用组件（4 个）：**
- `TemplateEditor.tsx` - 模板编辑器（支持变量插入）
- `TemplatePreview.tsx` - 实时预览组件
- `TemplateCategoryBadge.tsx` - 分类标签
- `VariableHelper.tsx` - 变量帮助面板

**页面组件（3 个）：**
- `TemplateList.tsx` - 列表页面（筛选、分页）
- `TemplateCreate.tsx` - 创建页面
- `TemplateEdit.tsx` - 编辑页面

#### 技术栈
- **后端：** Express + Prisma + Zod
- **前端：** React + TypeScript + Ant Design + Zustand
- **数据库：** Template 模型（已存在于 schema.prisma）

#### 文档更新
- ✅ 创建 `docs/功能3-模板管理系统设计.md`
- ✅ 更新 `docs/开发任务.md` - 添加功能 3 详细任务列表
- ✅ 删除联系记录相关文档（用户不需要该功能）
- ✅ 更新 `docs/CHANGELOG.md` - 记录设计完成

---

### 🔧 UI 调整 - 顶部导航栏

#### 布局变更
- ✅ 从侧边栏导航改为顶部导航栏
- ✅ 左侧：Logo + 水平菜单（首页、KOL 管理、模板管理、联系记录、系统设置）
- ✅ 右侧：主题切换 + 用户头像/名称
- ✅ 固定顶部，内容区域最大宽度 1400px 居中

#### 修改文件
- `/frontend/src/components/Layout/AppLayout.tsx` - 从 Sider 改为 Header

#### 保留效果
- ✅ Web3 风格视觉效果
- ✅ 玻璃态和渐变
- ✅ 动画效果
- ✅ 主题切换
- ✅ 背景粒子

---

## [2025-01-07] 早期 - 前端架构重构与 Web3 风格升级

### 🎨 重大变更

#### 全局导航系统
- ✅ 新增 `AppLayout` 组件，提供统一的应用布局
- ✅ 侧边导航栏支持折叠/展开
- ✅ 导航菜单包含：首页、KOL 管理、模板管理（待开发）、联系记录（待开发）、系统设置（待开发）
- ✅ 顶部栏集成主题切换和用户信息

#### 主题系统完善
- ✅ 完整的暗色/亮色模式支持
- ✅ 所有 CSS 变量适配双主题
- ✅ 平滑的主题切换过渡动画（0.3s ease）
- ✅ Ant Design 主题算法集成

#### Web3 风格视觉效果
- ✅ Solana 品牌色系统：
  - 紫色 `#9945FF`
  - 绿色 `#14F195`
  - 蓝色 `#00D4AA`
  - 粉色 `#DC1FFF`
- ✅ 玻璃态（Glassmorphism）效果
- ✅ 渐变文字和边框
- ✅ 发光阴影效果

#### 动画系统
新增 6 种关键帧动画：
- `float` - 浮动效果
- `pulse-glow` - 脉冲发光
- `gradient-shift` - 渐变移动
- `fade-in-up` - 淡入上移
- `fade-in` - 淡入
- `scale-in` - 缩放淡入

新增工具类：
- `.animate-float`
- `.animate-pulse-glow`
- `.animate-gradient`
- `.animate-fade-in-up`
- `.animate-fade-in`
- `.animate-scale-in`
- `.hover-lift`
- `.hover-glow`

#### 背景效果
- ✅ 浮动粒子背景（紫色和绿色渐变球）
- ✅ 模糊滤镜和动态动画

### 🔧 技术改进

#### 路由架构
- 重构路由系统，分离公开路由和认证路由
- 公开路由（登录/注册）无需布局包裹
- 认证路由统一使用 `AppLayout` 布局

#### 组件优化
- 移除旧的 `Navbar` 组件
- 更新所有页面使用新布局系统：
  - `Home.tsx`
  - `KOLList.tsx`
  - `KOLDetail.tsx`
  - `KOLImport.tsx`

#### 样式系统
- 完善 `theme.css`，新增 508 行 Web3 风格样式
- 暗色模式变量（lines 7-68）
- 亮色模式变量（lines 69-131）
- 动画和工具类（lines 366-508）

### 📁 新增文件
- `/frontend/src/components/Layout/AppLayout.tsx` (292 行)

### 🔄 修改文件
- `/frontend/src/App.tsx` - 路由和主题配置重构
- `/frontend/src/pages/Home.tsx` - 移除 Navbar，使用新动画
- `/frontend/src/pages/KOL/KOLDetail.tsx` - 布局适配
- `/frontend/src/styles/theme.css` - 完整主题系统

### ✅ 功能保持
所有现有功能完全保留：
- ✅ KOL 创建（含质量分字段）
- ✅ KOL 编辑（所有字段）
- ✅ KOL 详情查看
- ✅ 批量导入
- ✅ 筛选和排序
- ✅ 用户名支持 @ 符号

### 🎯 用户体验提升
- 更现代的 Web3 风格界面
- 流畅的主题切换体验
- 统一的导航体验
- 丰富的视觉反馈（悬停、点击动画）
- 响应式设计保持

### 🐛 Bug 修复
- 修复 `AppLayout.tsx` 导入路径错误（`@store/` → `@/store/`）

---

## 历史版本

### [2025-01-06] - KOL 管理基础功能
- KOL 创建、编辑、删除功能
- 批量导入功能
- 质量分字段支持
- 用户名支持 @ 符号输入
