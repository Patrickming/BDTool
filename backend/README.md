# KOL BD Tool - 后端 API

> 基于 TypeScript + Express + Prisma 构建的 KOL 管理系统后端服务

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.1-2D3748.svg)](https://www.prisma.io/)

## 📖 项目简介

KOL BD Tool 后端是一个功能完善的 RESTful API 服务，为加密货币交易所 BD 团队提供 KOL 管理、模板系统、数据分析、AI 改写等核心功能支持。

### 核心特性

- 🔐 **双认证系统** - JWT + Extension Token 双重认证机制
- 📊 **完整的 CRUD API** - KOL、模板、用户等资源的增删改查
- 🤖 **AI 智能改写** - 集成 ZhipuAI GLM-4.5-airx 模型
- 🌐 **翻译服务** - DeepL API 专业翻译支持
- 📈 **数据分析** - 多维度统计、图表、时间线分析
- 🔒 **数据隔离** - 用户级别数据完全隔离
- 💾 **自动备份** - 定时数据库备份（Cron）
- 📝 **类型安全** - 全栈 TypeScript 开发

---

## 🚀 快速开始

### 前置要求

- **Node.js** 18+
- **pnpm** 8+ （推荐包管理器）
- **SQLite** （开发环境，无需额外安装）
- **PostgreSQL** 14+（生产环境可选）

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

**必须配置的环境变量：**

```bash
# JWT 密钥（至少 32 个字符）
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-change-this

# 数据库连接（开发环境使用 SQLite）
DATABASE_URL="file:./dev.db"

# CORS 允许的前端来源
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

**可选配置：**

```bash
# DeepL 翻译服务（可选）
DEEPL_API_KEY=your-deepl-api-key-here:fx

# ZhipuAI GLM 服务（可选，用于 AI 改写）
GLM_API_KEY=your-glm-api-key-here
GLM_MODEL=glm-4-airx

# 日志级别
LOG_LEVEL=info
```

**生成安全的 JWT_SECRET：**

```bash
# 方法 1: 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法 2: 使用 OpenSSL
openssl rand -hex 32
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# (可选) 打开数据库管理界面
npx prisma studio
```

### 4. 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:3000` 启动。

**验证服务器状态：**
- 健康检查: `http://localhost:3000/health`
- API 基础路径: `http://localhost:3000/api/v1`

---

## 📦 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（热重载，tsx） |
| `pnpm build` | 编译 TypeScript 到 `dist/` |
| `pnpm start` | 运行编译后的生产版本 |
| `pnpm lint` | ESLint 代码检查 |
| `pnpm format` | Prettier 代码格式化 |
| `pnpm db:generate` | 生成 Prisma Client |
| `pnpm db:migrate` | 运行数据库迁移 |
| `pnpm db:studio` | 打开 Prisma Studio（数据库可视化） |
| `pnpm db:reset` | 重置数据库（⚠️ 危险操作） |
| `pnpm db:backup` | 手动备份数据库 |
| `pnpm db:health` | 检查数据库连接健康状态 |

---

## 🏗️ 项目结构

```
backend/
├── src/
│   ├── features/               # 功能模块（按业务领域划分）
│   │   ├── auth/              # 认证模块
│   │   │   ├── controllers/   # 控制器（处理请求）
│   │   │   ├── services/      # 业务逻辑（auth, jwt, password）
│   │   │   ├── dto/           # 数据传输对象（验证）
│   │   │   └── routes/        # 路由配置
│   │   ├── kol/               # KOL 管理模块
│   │   │   ├── controllers/   # KOL CRUD 控制器
│   │   │   ├── services/      # KOL 业务逻辑
│   │   │   ├── dto/           # 创建、更新、查询 DTO
│   │   │   └── routes/        # KOL 路由
│   │   ├── templates/         # 模板管理模块
│   │   │   ├── controllers/   # 模板 CRUD、预览控制器
│   │   │   ├── services/      # 模板业务逻辑、变量替换
│   │   │   ├── dto/           # 模板 DTO
│   │   │   └── routes/        # 模板路由
│   │   ├── analytics/         # 数据分析模块
│   │   │   ├── controllers/   # 分析数据控制器
│   │   │   ├── services/      # 统计计算逻辑
│   │   │   └── routes/        # 分析路由
│   │   ├── translation/       # 翻译服务模块
│   │   │   ├── controllers/   # 翻译控制器
│   │   │   ├── translation.service.ts  # DeepL API 集成
│   │   │   ├── dto/           # 翻译请求 DTO
│   │   │   └── routes/        # 翻译路由
│   │   └── ai/                # AI 改写模块
│   │       ├── controllers/   # AI 改写控制器
│   │       ├── services/      # GLM API 集成
│   │       ├── dto/           # AI 请求 DTO
│   │       └── routes/        # AI 路由
│   ├── middleware/            # 中间件
│   │   └── auth.middleware.ts # 双认证中间件（JWT + Extension Token）
│   ├── routes/                # 顶层路由配置
│   │   ├── index.ts           # 路由汇总
│   │   ├── extension.routes.ts # Extension Token 路由
│   │   └── user.routes.ts     # 用户管理路由
│   ├── controllers/           # 顶层控制器
│   │   ├── extension.controller.ts # Extension Token 生成/验证
│   │   └── user.controller.ts      # 用户管理
│   ├── common/                # 公共模块
│   │   ├── middleware/        # 通用中间件（错误处理、日志）
│   │   ├── utils/             # 工具函数（响应格式、异步处理）
│   │   └── errors/            # 自定义错误类
│   ├── config/                # 配置文件
│   │   ├── env.config.ts      # 环境变量配置
│   │   ├── logger.config.ts   # Pino 日志配置
│   │   └── cors.config.ts     # CORS 配置
│   ├── database/              # 数据库
│   │   └── client.ts          # Prisma Client 实例
│   ├── utils/                 # 顶层工具函数
│   │   └── db-health-check.ts # 数据库健康检查
│   ├── app.ts                 # Express 应用配置
│   └── server.ts              # 服务器入口
├── prisma/
│   ├── schema.prisma          # 数据库模型定义
│   ├── migrations/            # 数据库迁移记录
│   └── dev.db                 # SQLite 数据库文件（开发环境）
├── scripts/                   # 工具脚本
│   ├── analytics-debug.ts     # 数据分析调试工具
│   ├── health-check.ts        # 健康检查脚本
│   └── archive/               # 归档脚本
│       └── fix-template-order.ts # 模板顺序修复（已完成）
├── .env.example               # 环境变量示例
├── package.json               # 依赖配置
├── tsconfig.json              # TypeScript 配置
└── README.md                  # 本文件
```

---

## 📚 技术栈

### 核心技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **Node.js** | 18+ | JavaScript 运行时 |
| **TypeScript** | 5.7 | 类型安全的 JavaScript 超集 |
| **Express.js** | 4.21 | 轻量级 Web 框架 |
| **Prisma** | 6.1 | 现代 ORM（对象关系映射） |
| **pnpm** | 8+ | 高效的包管理器 |

### 核心依赖

| 依赖 | 用途 |
|------|------|
| **Zod** | 数据验证与类型推断 |
| **jsonwebtoken** | JWT 认证 |
| **bcrypt** | 密码加密 |
| **Pino** | 高性能日志系统 |
| **CORS** | 跨域资源共享 |
| **deepl-node** | DeepL 翻译 API |
| **zhipuai-sdk-nodejs-v4** | ZhipuAI GLM API |
| **node-cron** | 定时任务调度 |
| **archiver** | 文件压缩（插件打包） |

### 开发工具

| 工具 | 用途 |
|------|------|
| **tsx** | TypeScript 执行器（开发） |
| **ESLint** | 代码质量检查 |
| **Prettier** | 代码格式化 |

### 数据库支持

- **开发环境**: SQLite（无需额外安装，数据存储在 `prisma/dev.db`）
- **生产环境**: PostgreSQL 14+ （推荐）

---

## 🔐 API 端点总览

### 认证 (Authentication)

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/v1/auth/register` | 用户注册 | ❌ |
| POST | `/api/v1/auth/login` | 用户登录 | ❌ |
| GET | `/api/v1/auth/me` | 获取当前用户信息 | ✅ JWT |

### KOL 管理

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/v1/kols` | 获取 KOL 列表（分页、筛选、搜索） | ✅ |
| POST | `/api/v1/kols` | 创建 KOL | ✅ |
| POST | `/api/v1/kols/batch/import` | 批量导入 KOL | ✅ JWT |
| GET | `/api/v1/kols/:id` | 获取 KOL 详情 | ✅ JWT |
| PUT | `/api/v1/kols/:id` | 更新 KOL | ✅ JWT |
| DELETE | `/api/v1/kols/:id` | 删除 KOL | ✅ JWT |

### 模板管理

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/v1/templates` | 获取模板列表 | ✅ |
| POST | `/api/v1/templates` | 创建模板 | ✅ JWT |
| GET | `/api/v1/templates/:id` | 获取模板详情 | ✅ JWT |
| PUT | `/api/v1/templates/:id` | 更新模板 | ✅ JWT |
| DELETE | `/api/v1/templates/:id` | 删除模板 | ✅ JWT |
| POST | `/api/v1/templates/preview` | 预览模板（变量替换） | ✅ |
| PUT | `/api/v1/templates/:id/order` | 更新模板排序 | ✅ JWT |

### 数据分析

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/v1/analytics/overview` | 概览统计（8个核心指标） | ✅ JWT |
| GET | `/api/v1/analytics/distributions` | KOL 分布数据（5个维度） | ✅ JWT |
| GET | `/api/v1/analytics/templates` | 模板效果分析 | ✅ JWT |
| GET | `/api/v1/analytics/timeline?days=7` | 联系时间线（可选天数） | ✅ JWT |

### AI 智能改写

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/v1/ai/health` | AI 服务健康检查 | ✅ |
| POST | `/api/v1/ai/rewrite` | 单文本改写 | ✅ |
| POST | `/api/v1/ai/rewrite/batch` | 批量文本改写 | ✅ |
| POST | `/api/v1/ai/rewrite/template` | 模板改写（带 KOL 上下文） | ✅ |

### 翻译服务

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/v1/translation/status` | 翻译服务状态 | ✅ JWT |
| POST | `/api/v1/translation/translate` | 翻译文本（中英互译） | ✅ JWT |
| POST | `/api/v1/translation/detect` | 检测语言 | ✅ JWT |

### Extension Token（插件认证）

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/v1/extension/token` | 获取当前 Token 信息 | ✅ JWT |
| POST | `/api/v1/extension/token/generate` | 生成新 Token | ✅ JWT |
| POST | `/api/v1/extension/token/activate` | 激活 Token（2小时有效期） | ✅ JWT |

### 用户管理

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/v1/users/:id` | 获取用户信息 | ✅ JWT（管理员） |

**认证说明：**
- ✅ = 需要认证（JWT Bearer Token 或 Extension Token）
- ✅ JWT = 仅支持 JWT Token
- ❌ = 无需认证

**完整 API 文档：** 查看 [/docs/API.md](../docs/API.md)

---

## 🔑 双认证机制

从 v1.6.0 开始，后端支持两种认证方式：

### 1. JWT Bearer Token（Web 应用）

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- 用于前端 Web 应用
- 有效期 7 天（可配置）
- 包含用户 ID、email、role

### 2. Extension Token（Chrome 插件）

```http
X-Extension-Token: abc123def456...
```

- 用于 Chrome 浏览器插件
- 激活后有效期 2 小时
- SHA-256 哈希存储

### 认证优先级

`requireAuth` 中间件按以下顺序检查：

1. **优先检查 JWT Token** - 如果存在且有效，使用 JWT 认证
2. **JWT 失败时检查 Extension Token** - 如果 JWT 不存在或无效，尝试 Extension Token
3. **两者都失败时返回 401** - 未授权错误

### 实现文件

- `/src/middleware/auth.middleware.ts` - 统一认证中间件
- `/src/controllers/extension.controller.ts` - Extension Token 生成/验证逻辑

---

## 🛠️ 开发指南

### 代码规范

项目使用 **ESLint** 和 **Prettier** 保证代码质量：

```bash
# 检查代码质量
pnpm lint

# 自动修复代码问题
pnpm lint:fix

# 格式化代码
pnpm format
```

### 数据库操作

```bash
# 查看和编辑数据库（Web UI）
npx prisma studio
# 访问 http://localhost:5555

# 创建新迁移
npx prisma migrate dev --name migration_name

# 应用迁移（生产环境）
npx prisma migrate deploy

# 重置数据库（⚠️ 删除所有数据）
npx prisma migrate reset

# 手动备份数据库
pnpm db:backup

# 健康检查
pnpm db:health
```

### 数据库备份

**自动备份：**
- 通过 Cron 定时任务每天凌晨 4 点自动备份
- 保留最近 7 天的备份
- 备份脚本：`scripts/backup-db.sh`

**手动备份：**
```bash
pnpm db:backup
```

**恢复备份：**
```bash
# 查看可用备份
ls -lh prisma/backups/

# 恢复指定备份
cp prisma/backups/dev-YYYYMMDD-HHMMSS.db prisma/dev.db
```

**详细文档：** [/docs/DATABASE_BACKUP_RECOVERY.md](../docs/DATABASE_BACKUP_RECOVERY.md)

### 添加新功能模块

**步骤：**

1. **创建功能目录**
   ```bash
   mkdir -p src/features/your-feature/{controllers,services,dto,routes}
   ```

2. **创建文件**
   - `controllers/` - 处理 HTTP 请求
   - `services/` - 业务逻辑
   - `dto/` - 数据验证（Zod schemas）
   - `routes/` - 路由配置

3. **注册路由**
   在 `src/routes/index.ts` 中注册：
   ```typescript
   import yourFeatureRoutes from '../features/your-feature/routes/your-feature.routes';

   router.use('/your-feature', yourFeatureRoutes);
   ```

4. **添加数据库模型**（如需要）
   - 编辑 `prisma/schema.prisma`
   - 运行 `npx prisma migrate dev`

**示例目录结构：**
```
src/features/your-feature/
├── controllers/
│   └── your-feature.controller.ts
├── services/
│   └── your-feature.service.ts
├── dto/
│   ├── create-your-feature.dto.ts
│   └── update-your-feature.dto.ts
└── routes/
    └── your-feature.routes.ts
```

### 环境变量最佳实践

1. **永远不要提交 `.env` 文件到 Git**
2. **在 `.env.example` 中记录所有环境变量**
3. **使用 `env.config.ts` 集中管理环境变量**
4. **生产环境使用环境变量或密钥管理服务**

---

## ✅ 已实现功能（v1.6.0）

### 核心功能

- ✅ **用户认证系统**
  - 用户注册、登录
  - JWT Token 生成与验证
  - 密码 bcrypt 加密存储
  - 7 天 Token 有效期

- ✅ **KOL 管理 API**
  - 完整 CRUD 操作
  - 批量导入（支持 4 种 URL 格式）
  - 高级搜索与筛选（用户名、粉丝数、质量分、状态等）
  - 多字段排序
  - 用户级别数据隔离

- ✅ **模板管理 API**
  - 完整 CRUD 操作
  - 14 种变量替换（KOL、用户、系统变量）
  - 多语言支持（英语、中文）
  - 实时预览功能
  - 使用统计追踪
  - 自定义排序

- ✅ **数据分析 API**
  - 概览统计（8 个核心指标）
  - KOL 分布图表（5 个维度）
  - 模板效果分析
  - 联系时间线（可选时间范围）

- ✅ **AI 智能改写**
  - ZhipuAI GLM-4.5-airx 集成
  - 4 种改写风格（专业/正式/友好/轻松）
  - 变量占位符保留机制
  - 批量改写支持
  - 健康检查端点

- ✅ **翻译服务**
  - DeepL API 专业翻译
  - 中英文互译
  - 自动语言检测
  - 使用量统计

- ✅ **Extension Token 认证**
  - SHA-256 哈希存储
  - 2 小时有效期
  - 激活/停用管理
  - 双认证中间件

- ✅ **数据库管理**
  - 自动备份（Cron，每天凌晨 4 点）
  - 保留最近 7 天备份
  - 健康检查脚本
  - WSL 环境优化

### 技术特性

- ✅ TypeScript 全栈类型安全
- ✅ Zod 数据验证
- ✅ Pino 高性能日志
- ✅ CORS 跨域支持
- ✅ 错误处理中间件
- ✅ 请求日志记录
- ✅ 响应格式统一
- ✅ Prisma ORM

---

## 🚧 待实现功能

### v1.7.0 计划

- ⏳ **联系记录系统**
  - 联系历史时间线 API
  - 交互日志记录
  - 响应追踪

- ⏳ **智能质量评分**
  - 自动计算 KOL 质量分算法
  - 基于粉丝数、活跃度、内容质量
  - 评分历史记录

- ⏳ **模板效果追踪**
  - 模板使用效果分析
  - A/B 测试支持
  - 优化建议

### v2.0.0 计划

- ⏳ **Twitter API 官方集成**
  - 自动获取 KOL 数据
  - 实时更新粉丝数
  - 推文分析

- ⏳ **单元测试 & 集成测试**
  - Vitest 测试框架
  - API 端点测试
  - 业务逻辑测试
  - 测试覆盖率 > 80%

- ⏳ **性能优化**
  - Redis 缓存
  - 数据库查询优化
  - API 响应时间优化

---

## 🐛 常见问题

### 1. 端口 3000 被占用

**解决方案：**
```bash
# 方法 1: 修改 .env 文件
PORT=3001

# 方法 2: 查找并停止占用进程
lsof -i :3000
kill -9 <PID>
```

### 2. 数据库连接失败

**解决方案：**
```bash
# 检查 DATABASE_URL 配置
cat .env | grep DATABASE_URL

# SQLite: 确保路径正确
DATABASE_URL="file:./dev.db"

# PostgreSQL: 检查连接字符串
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# 重新生成 Prisma Client
npx prisma generate
```

### 3. Prisma Client 未生成

**错误信息：**
```
Cannot find module '@prisma/client'
```

**解决方案：**
```bash
npx prisma generate
```

### 4. TypeScript 编译错误

**解决方案：**
```bash
# 检查 TypeScript 错误
pnpm build

# 清除缓存并重新构建
rm -rf dist/
pnpm build
```

### 5. JWT_SECRET 未配置

**错误信息：**
```
JWT_SECRET is not defined
```

**解决方案：**
```bash
# 生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 添加到 .env
echo "JWT_SECRET=<生成的密钥>" >> .env
```

### 6. DeepL API 调用失败

**解决方案：**
```bash
# 检查 API 密钥格式
# Free 版本密钥以 :fx 结尾
DEEPL_API_KEY=abc123:fx

# Pro 版本密钥不带后缀
DEEPL_API_KEY=abc123
```

### 7. GLM API 调用失败

**解决方案：**
```bash
# 检查 API 密钥
echo $GLM_API_KEY

# 测试 API 连接
curl -X GET http://localhost:3000/api/v1/ai/health \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 📖 相关文档

- [项目总览](../README.md) - 项目整体介绍
- [API 文档](../docs/API.md) - 完整 API 端点文档
- [数据库设计](../docs/DATABASE.md) - 数据库模型设计
- [开发日志](../docs/DEVELOPMENT.md) - 开发进度与更新记录
- [更新日志](../docs/CHANGELOG.md) - 版本更新历史
- [数据库备份](../docs/DATABASE_BACKUP_RECOVERY.md) - 备份与恢复指南
- [翻译服务](../docs/翻译服务配置指南.md) - DeepL 配置指南

---

## 🔒 安全考虑

### 已实施的安全措施

- ✅ **密码加密** - 使用 bcrypt 哈希存储
- ✅ **JWT 认证** - 安全的用户身份验证
- ✅ **输入验证** - Zod schema 验证所有输入
- ✅ **SQL 注入防护** - Prisma ORM 参数化查询
- ✅ **CORS 配置** - 限制允许的来源
- ✅ **环境变量** - 敏感数据不提交到 Git
- ✅ **Extension Token** - SHA-256 哈希存储
- ✅ **速率限制** - API 请求频率限制（15分钟 100 次）

### 安全最佳实践

1. **永远不要将 `.env` 文件提交到 Git**
2. **定期更新依赖包** - `pnpm update`
3. **使用强密码策略** - 至少 8 个字符
4. **生产环境使用 HTTPS**
5. **定期备份数据库**
6. **监控异常登录行为**

---

## 📄 许可证

MIT License

---

**由 KCEX BD 团队使用 ❤️ 构建**

_最后更新：2025-11-13_
