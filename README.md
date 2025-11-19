# KOL BD Tool - KOL 管理系统

> 面向加密货币交易所 BD 团队的 KOL（意见领袖）管理与联系工具

## 📖 项目简介

KOL BD Tool 是一个专为 BD 团队打造的全栈 Web 应用，旨在简化在 Twitter/X 上发现、管理和联系 KOL 的流程。

## ✨ 核心功能

### 1. **KOL 管理系统** ✅

- ✅ KOL 完整 CRUD 操作（创建、查看、编辑、删除）
- ✅ 批量导入（支持 4 种 URL 格式）
- ✅ 高级搜索与筛选（用户名、粉丝数、质量分、状态、分类、语言、认证状态）
- ✅ 多字段排序（创建时间、更新时间、粉丝数、质量分）
- ✅ 质量评分系统（0-100 分，手动设置）
- ✅ 7 种状态管理（新添加/已联系/已回复/洽谈中/合作中/已合作/已拒绝）
- ✅ 内容分类（合约交易分析/代币交易分析/Web3 通用/未分类）
- ✅ 15 种语言支持（英语、中文、日语、韩语、法语、德语、俄语、印地语、西班牙语、葡萄牙语、阿拉伯语、越南语、泰语、印尼语、土耳其语）
- ✅ CSV 导出功能（17 列完整数据）
- ✅ 用户数据隔离

### 2. **话术模板管理** ✅

- ✅ 模板完整 CRUD 操作
- ✅ 14 种变量替换（KOL 变量、用户变量、系统变量）
- ✅ 5 种模板分类（初次联系、跟进、谈判、合作、维护）
- ✅ 实时预览功能（变量替换效果）
- ✅ 使用统计追踪
- ✅ 自定义排序（上下移动）
- ✅ 搜索和筛选功能
- ✅ 多语言支持

### 3. **数据分析仪表盘** ✅

- ✅ 首页实时统计卡片（4 个关键指标）
- ✅ 概览统计（8 个核心指标：KOL 总数、模板数量、联系次数、活跃合作等）
- ✅ KOL 分布图表（5 个维度）
  - 粉丝数分布（柱状图，6 个范围段）
  - 质量分分布（环形图，4 个等级）
  - 内容分类分布（柱状图）
  - 状态分布（环形图）
  - 语言分布（折线图）
- ✅ 模板效果分析（按分类统计）
- ✅ 联系时间线（双轴折线图）
- ✅ 自定义时间范围（7/30/60/90 天）
- ✅ 实时数据刷新

### 4. **Chrome 浏览器插件** ✅

- ✅ Manifest V3 架构
- ✅ 侧边栏（Side Panel）UI 设计
- ✅ 一键捕获 Twitter KOL 资料
- ✅ 自动提取用户名、粉丝数、简介、头像等
- ✅ Extension Token 认证系统（独立于 JWT）
- ✅ 2 小时倒计时机制
- ✅ 本地数据编辑（质量评分、分类、备注）
- ✅ 批量上传到系统
- ✅ 自动去重检测
- ✅ 今日捕获统计
- ✅ **插件模板复制功能**
  - 搜索式模板选择（实时过滤，最多 50 个结果）
  - 搜索式 KOL 选择（支持 @ 符号，可选）
  - AI 改写功能（4 种风格：专业/正式/友好/轻松）
  - 变量自动替换（选择 KOL 后替换占位符）
  - 一键复制到剪贴板
  - GLM-4.5-airx 模型集成（120 秒超时保护）

### 5. **AI 智能改写** ✅

- ✅ GLM-4.5-airx 模型集成
- ✅ 4 种改写风格（专业/正式/友好/轻松）
- ✅ 变量占位符保留（保护 {{variable}} 格式）
- ✅ 模板内容改写功能
- ✅ 插件集成 AI 改写
- ✅ 120 秒超时保护机制
- ✅ 双认证支持（JWT + Extension Token）

### 6. **翻译服务** ✅

- ✅ DeepL API 专业翻译
- ✅ 中英文互译
- ✅ 自动语言检测
- ✅ API 健康状态检查
- ✅ 使用量统计追踪

### 7. **数据库安全** ✅

- ✅ 自动备份系统（Cron 定时任务，每天凌晨 4 点）
- ✅ 备份保留策略（最近 7 天）
- ✅ 健康检查脚本
- ✅ 完整的备份与恢复文档
- ✅ WSL 环境兼容性优化

## 🏗️ 技术栈

### 前端

- **框架：** React 18 + TypeScript + Vite 5
- **UI 库：** Ant Design 5.x（深色主题 + Solana 风格）
- **状态管理：** Zustand
- **HTTP 客户端：** Axios
- **路由：** React Router v6
- **图表：** Recharts 2.x
- **数据导出：** Papa Parse 5.5.3
- **包管理器：** pnpm

### 后端

- **框架：** Express.js + TypeScript
- **数据库：** SQLite（开发）/ PostgreSQL（生产，待部署）
- **ORM：** Prisma 6.0
- **验证：** Zod
- **认证：** JWT + bcrypt + Extension Token（SHA-256）
- **日志：** Pino
- **定时任务：** Cron
- **翻译：** DeepL API
- **AI 集成：** ZhipuAI GLM-4.5-airx
- **文件处理：** Archiver（插件打包）

### Chrome 浏览器插件

- **架构：** Manifest V3
- **语言：** JavaScript
- **UI：** 侧边栏（Side Panel）
- **存储：** Chrome Storage API
- **认证：** Extension Token（SHA-256）
- **集成：** REST API 与后端通信

### 开发工具

- **TypeScript：** 5.x
- **构建工具：** Vite（前端）、tsx（后端开发）
- **代码质量：** ESLint + Prettier
- **Git：** 版本控制
- **环境：** Node.js 18+、pnpm 8+

## 📁 项目结构

```
BDTool/
├── docs/                          # 完整文档
│   ├── README.md                 # 文档索引（分类导航）
│   ├── API.md                    # API 文档
│   ├── CHANGELOG.md              # 更新日志
│   ├── DATABASE_BACKUP_RECOVERY.md # 数据库备份与恢复指南
│   ├── REQUIREMENTS.md           # 项目需求文档
│   ├── EXTENSION_TEMPLATE_FEATURE.md # Chrome 插件模板功能说明
│   ├── 翻译服务配置指南.md         # DeepL 翻译配置文档
│   └── 开发任务.md                # 任务跟踪文档
│
├── frontend/                      # React 前端应用
│   ├── src/
│   │   ├── components/           # 可复用 UI 组件
│   │   │   ├── analytics/        # 数据分析图表组件（9 个组件）
│   │   │   ├── KOL/              # KOL 相关组件（3 个组件）
│   │   │   ├── Layout/           # 布局组件（AppLayout）
│   │   │   ├── Template/         # 模板相关组件（4 个组件）
│   │   │   └── Translation/      # 翻译相关组件（1 个组件）
│   │   ├── pages/                # 页面组件
│   │   │   ├── KOL/              # KOL 管理页面
│   │   │   │   ├── KOLList.tsx   # KOL 列表
│   │   │   │   ├── KOLDetail.tsx # KOL 详情
│   │   │   │   └── KOLImport.tsx # 批量导入
│   │   │   ├── Template/         # 模板管理页面
│   │   │   │   ├── TemplateList.tsx    # 模板列表
│   │   │   │   ├── TemplateCreate.tsx  # 创建模板
│   │   │   │   └── TemplateEdit.tsx    # 编辑模板
│   │   │   ├── Home.tsx          # 首页
│   │   │   ├── Login.tsx         # 登录页
│   │   │   ├── Register.tsx      # 注册页
│   │   │   ├── AnalyticsDashboard.tsx # 数据分析仪表盘
│   │   │   └── Extension.tsx     # 插件配置页面
│   │   ├── services/             # API 服务层
│   │   │   ├── auth.service.ts   # 认证服务
│   │   │   ├── kol.service.ts    # KOL 服务
│   │   │   ├── template.service.ts # 模板服务
│   │   │   ├── analytics.service.ts # 分析服务
│   │   │   ├── translation.service.ts # 翻译服务
│   │   │   └── ai.service.ts     # AI 服务
│   │   ├── store/                # Zustand 状态管理
│   │   │   ├── auth.store.ts     # 认证状态
│   │   │   ├── kol.store.ts      # KOL 状态
│   │   │   ├── template.store.ts # 模板状态
│   │   │   └── analytics.store.ts # 分析状态
│   │   ├── styles/               # 全局样式
│   │   │   └── theme.css         # 主题样式
│   │   ├── types/                # TypeScript 类型定义
│   │   │   ├── kol.ts            # KOL 类型
│   │   │   ├── template.ts       # 模板类型
│   │   │   ├── analytics.ts      # 分析类型
│   │   │   ├── translation.ts    # 翻译类型
│   │   │   └── ai.ts             # AI 类型
│   │   ├── utils/                # 工具函数
│   │   │   └── export.ts         # CSV 导出工具
│   │   ├── lib/                  # 第三方库配置
│   │   │   └── axios.ts          # Axios 配置
│   │   ├── App.tsx               # 主应用组件
│   │   ├── main.tsx              # 应用入口
│   │   └── index.css             # 全局样式入口
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts            # Vite 配置
│   └── README.md                 # 前端详细文档
│
├── backend/                       # Express.js 后端应用
│   ├── prisma/
│   │   ├── schema.prisma         # 数据库模型定义
│   │   ├── migrations/           # 数据库迁移记录
│   │   └── seed.ts               # 种子数据
│   ├── src/
│   │   ├── features/             # 功能模块（按功能组织）
│   │   │   ├── auth/             # 认证模块
│   │   │   │   ├── controllers/  # 控制器
│   │   │   │   ├── services/     # 业务逻辑
│   │   │   │   ├── routes/       # 路由
│   │   │   │   └── dto/          # 数据传输对象
│   │   │   ├── kol/              # KOL 管理模块
│   │   │   ├── templates/        # 模板管理模块
│   │   │   ├── analytics/        # 数据分析模块
│   │   │   ├── translation/      # 翻译服务模块
│   │   │   └── ai/               # AI 集成模块 ✅
│   │   ├── middleware/           # 中间件
│   │   │   ├── auth.middleware.ts # 双认证（JWT + Extension Token）
│   │   │   ├── error.middleware.ts # 错误处理
│   │   │   └── rate-limit.middleware.ts # 速率限制
│   │   ├── utils/                # 工具函数
│   │   │   ├── logger.ts         # 日志工具（Pino）
│   │   │   └── response.ts       # 响应格式化
│   │   ├── config/               # 配置管理
│   │   │   └── database.ts       # 数据库配置
│   │   ├── routes/               # 顶层路由
│   │   │   ├── index.ts          # 路由汇总
│   │   │   └── extension.routes.ts # Extension Token 路由
│   │   └── server.ts             # 应用入口
│   ├── scripts/                  # 工具脚本
│   │   ├── backup-db.sh          # 数据库备份脚本
│   │   ├── health-check.ts       # 健康检查脚本
│   │   ├── analytics-debug.ts    # 数据分析调试工具
│   │   └── archive/              # 归档的一次性脚本
│   │       └── fix-template-order.ts # 模板顺序修复脚本（已归档）
│   ├── .env.example              # 环境变量示例
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md                 # 后端详细文档
│
├── extension/                     # Chrome 浏览器插件（Manifest V3）
│   ├── manifest.json             # 插件配置
│   ├── side_panel.html           # 侧边栏页面
│   ├── popup.js                  # 侧边栏逻辑（含模板功能）
│   ├── background.js             # 后台服务 Worker（处理 AI 改写）
│   ├── content-twitter-extractor.js # Twitter 数据提取脚本
│   ├── icons/                    # 插件图标
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   ├── SIDE_PANEL_GUIDE.md       # 侧边栏使用指南
│   └── README.md                 # 插件详细文档
│
├── .gitignore
├── package.json                  # 根目录 package.json（工作区配置）
└── README.md                     # 本文件
```

## 📋 当前实现状态

### ✅ 已实现功能（v1.5.0）

#### 1. 用户认证系统 ✅

- ✅ 用户注册（邮箱 + 密码）
- ✅ 用户登录（JWT Token 认证）
- ✅ Token 自动管理与刷新
- ✅ 权限中间件（认证、管理员、所有者权限）
- ✅ 用户管理 API（查询、更新、删除）
- ✅ 密码加密存储（bcrypt）
- ✅ 自动登录态保持（7 天有效期）

#### 2. KOL 管理系统 ✅（核心功能）

**2.1 KOL 列表查询**

- ✅ 分页功能（可调整每页数量：10/20/50/100）
- ✅ 多维度搜索（用户名、显示名）
- ✅ 状态筛选（7 种状态）
- ✅ 分类筛选（内容类别）
- ✅ 粉丝数范围筛选
- ✅ 质量分范围筛选
- ✅ 认证状态筛选
- ✅ 多字段排序（创建时间、更新时间、粉丝数、质量分）

**2.2 KOL 批量导入**

- ✅ 支持 4 种输入格式：
  - `@username`
  - `username`
  - `https://twitter.com/username`
  - `https://x.com/username`
- ✅ 自动去重
- ✅ 详细导入结果（成功/失败/重复统计）
- ✅ 错误提示与验证
- ✅ 一次最多 100 个

**2.3 KOL 编辑功能**

- ✅ 在线编辑弹窗
- ✅ 所有字段可编辑
- ✅ 实时验证
- ✅ 自动列表刷新

**2.4 KOL 删除功能**

- ✅ 删除确认弹窗
- ✅ 级联删除关联数据

#### 3. 数据隔离 ✅

- ✅ 每个用户只能看到自己创建的 KOL
- ✅ 无法访问其他用户的数据
- ✅ 所有操作自动关联当前用户

#### 4. 模板管理系统 ✅

- ✅ 模板完整 CRUD 操作
- ✅ 变量系统（14 种变量：KOL、用户、系统）
- ✅ 模板分类管理（5 种分类）
- ✅ 实时预览（变量替换）
- ✅ 使用统计追踪
- ✅ 搜索和筛选功能
- ✅ 变量插入功能（光标位置）
- ✅ 多语言模板支持

#### 5. 数据分析仪表盘 ✅

- ✅ 概览统计（8 个核心指标）
  - KOL 总数、模板数量
  - 联系次数（除新添加外的所有 KOL）
  - 活跃合作数（状态为合作中的 KOL）
  - 本周新增 KOL、本周联系数
  - 总体响应率、本周响应率
- ✅ 首页实时统计卡片（4 个关键指标）
- ✅ KOL 分布图表（5 个维度）
  - 粉丝数分布（柱状图，范围：0-1k, 1k-10k, 10k-50k, 50k-100k, 100k-500k, 500k 以上）
  - 质量分分布（环形图）
  - 内容分类分布（柱状图）
  - 状态分布（环形图）
  - 语言分布（折线图）
- ✅ 模板效果分析（可排序表格）
- ✅ 联系时间线（双轴折线图）
- ✅ 实时数据刷新
- ✅ 自定义时间范围（7/30/60/90 天）
- ✅ CSV 导出功能（KOL 列表导出，17 列完整数据）

#### 6. UI/UX ✅

- ✅ Solana 风格深色主题（参考官网设计）
- ✅ 多层渐变背景（紫、绿、粉、橙色光晕）
- ✅ 立体导航栏（渐变背景 + 多层阴影 + 高光效果）
- ✅ 响应式设计（移动端适配）
- ✅ 友好的错误提示
- ✅ 状态标签颜色区分
- ✅ 质量评分可视化（进度条）
- ✅ 加载状态显示
- ✅ 空状态提示
- ✅ 平滑过渡动画
- ✅ 数据可视化（Recharts）

#### 7. Chrome 浏览器插件 ✅

- ✅ Manifest V3 架构
- ✅ 侧边栏（Side Panel）UI 设计
- ✅ 一键捕获 Twitter KOL 资料
- ✅ 自动提取：用户名、粉丝数、简介、头像等
- ✅ Extension Token 认证系统（独立于 JWT）
- ✅ 今日捕获统计
- ✅ 与后端 API 完整集成
- ✅ 重复检测提示优化

#### 8. Extension Token 双认证系统 ✅

- ✅ Extension Token 生成与管理 API
- ✅ SHA-256 安全哈希算法
- ✅ Token 状态管理（激活/停用）
- ✅ 双认证中间件（JWT + Extension Token）
- ✅ 自动降级认证流程
- ✅ 前端 Token 配置页面
- ✅ 一键复制 Token 功能

#### 9. 翻译服务集成 ✅

- ✅ DeepL API 专业翻译
- ✅ 中英文互译功能
- ✅ 自动语言检测
- ✅ API 健康状态检查
- ✅ 使用量统计追踪
- ✅ 前端翻译按钮集成
- ✅ 实时翻译反馈

#### 10. 数据库安全系统 ✅

- ✅ 自动备份脚本（backup-db.sh）
- ✅ Cron 定时任务（每天凌晨 4 点）
- ✅ 保留最近 7 天备份
- ✅ 健康检查脚本
- ✅ 备份与恢复文档
- ✅ WSL 环境优化配置

### 🚧 待实现功能

- ⏳ **功能 11：联系记录系统**

  - 联系历史时间线
  - 交互日志
  - 响应追踪

- ⏳ **功能 12：智能质量评分算法**

  - 自动计算 KOL 质量分
  - 内容分析
  - 活跃度评估

- ⏳ **功能 13：更多 AI 集成**
  - AI 模板优化建议
  - 自动内容个性化生成
  - 多模型支持（OpenAI、Anthropic）

## 🚀 快速开始

### 前置要求

- **Node.js** 18+
- **pnpm** 8+ （包管理器）
- **SQLite**（开发环境，无需额外安装）
- **PostgreSQL** 14+（生产环境可选）

### 后端设置

```bash
# 1. 克隆项目（如果还没有）
git clone <repository-url>
cd BDTool

# 2. 进入后端目录
cd backend

# 3. 安装依赖
pnpm install

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，至少需要配置：
#   - JWT_SECRET（至少 32 个字符的随机字符串）
#   - DEEPL_API_KEY（可选，用于翻译功能）

# 5. 生成 Prisma Client
npx prisma generate

# 6. 运行数据库迁移（创建表结构）
npx prisma migrate dev

# 7. 启动开发服务器
pnpm dev
# 或使用 NODE_ENV 显式指定环境：
# NODE_ENV=development pnpm dev
```

**后端服务启动后：**

- 主服务地址：`http://localhost:3000`
- 健康检查：`http://localhost:3000/health`
- API 基础路径：`http://localhost:3000/api/v1`

**可用的后端命令：**

```bash
pnpm dev              # 启动开发服务器（热重载）
pnpm build            # 编译 TypeScript 到 dist/
pnpm start            # 运行编译后的生产版本
pnpm db:studio        # 打开 Prisma Studio（数据库可视化工具）
pnpm db:migrate       # 运行数据库迁移
pnpm db:generate      # 生成 Prisma Client
pnpm db:backup        # 手动备份数据库
pnpm db:health        # 检查数据库连接健康状态
pnpm lint             # ESLint 代码检查
pnpm format           # Prettier 代码格式化
```

### 前端设置

```bash
# 1. 进入前端目录（从项目根目录）
cd frontend

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev
```

**前端服务启动后：**

- 主要地址：`http://localhost:5173`
- 备用地址：`http://localhost:5174`（如果 5173 被占用）

**可用的前端命令：**

```bash
pnpm dev              # 启动 Vite 开发服务器（热重载）
pnpm build            # 构建生产版本到 dist/
pnpm preview          # 预览生产构建
pnpm lint             # ESLint 代码检查
```

### Chrome 浏览器插件安装

```bash
# 插件文件位于项目的 /extension 目录

# 1. 打开 Chrome 浏览器
# 2. 访问 chrome://extensions/
# 3. 开启右上角的"开发者模式"
# 4. 点击"加载已解压的扩展程序"
# 5. 选择项目中的 /extension 文件夹
# 6. 插件安装完成！点击插件图标打开侧边栏

# 注意：修改插件代码后，需要在 chrome://extensions/ 页面点击"重新加载"按钮
```

### 数据库管理工具（可选）

```bash
# Prisma Studio - 可视化数据库管理工具
cd backend
npx prisma studio

# 工具将在 http://localhost:5555 启动
# 可以可视化查看和编辑所有数据表
```

### 首次使用流程

1. **启动后端服务**：`cd backend && pnpm dev`
2. **启动前端服务**：`cd frontend && pnpm dev`
3. **访问前端**：打开浏览器访问 `http://localhost:5173`
4. **注册账号**：点击"注册"按钮，填写邮箱、密码和姓名
5. **登录系统**：使用注册的账号登录
6. **开始使用**：导入 KOL、创建模板、查看数据分析

## 📖 使用指南

### 1. 首次使用

#### 1.1 注册账号

1. 访问前端地址 `http://localhost:5173`
2. 点击"注册"按钮
3. 填写信息：
   - 邮箱地址
   - 密码（至少 8 位）
   - 姓名
4. 点击"注册"提交

#### 1.2 登录系统

1. 使用注册的邮箱和密码登录
2. 系统会自动保存登录状态
3. Token 有效期 7 天，过期后需要重新登录

### 2. KOL 管理

#### 2.1 批量导入 KOL

1. 点击首页的"KOL 管理"卡片
2. 点击右上角"批量导入"按钮
3. 在文本框中输入 Twitter 用户名（支持多种格式）：

```
@elonmusk
jack
https://twitter.com/naval
https://x.com/pmarca
vitalikbuterin
```

4. 点击"开始导入"
5. 查看导入结果（成功/失败/重复统计）

**提示：**

- 一次最多导入 100 个
- 系统自动去重
- 支持 4 种输入格式
- 每行一个用户名

#### 2.2 查看 KOL 列表

- 默认按创建时间倒序排列
- 显示关键信息：
  - Twitter 用户名
  - 显示名称
  - 粉丝数
  - 质量评分
  - 当前状态
  - 内容分类
- 每页默认 10 条，可调整为 20/50/100

#### 2.3 搜索和筛选

**搜索功能：**

- 输入用户名或显示名进行搜索
- 支持模糊匹配

**筛选条件：**

1. **状态筛选**：选择特定状态
2. **分类筛选**：选择内容类别
3. **粉丝数筛选**：设置最小和最大粉丝数
4. **质量分筛选**：设置最小和最大质量分（0-100）
5. **认证状态**：筛选已认证或未认证账号
6. **排序选项**：
   - 创建时间（升序/降序）
   - 更新时间（升序/降序）
   - 粉丝数（升序/降序）
   - 质量分（升序/降序）

**提示：**

- 可以组合多个筛选条件
- 点击"重置"按钮清空所有筛选
- 筛选结果会自动更新

#### 2.4 编辑 KOL

1. 在列表中找到要编辑的 KOL
2. 点击"编辑"按钮
3. 在弹窗中修改信息：
   - **基本信息**：用户名、显示名、简介
   - **状态**：7 种可选状态
   - **内容分类**：合约交易/加密交易/Web3/其他
   - **质量评分**：0-100 分
   - **社交数据**：粉丝数、关注数
   - **Twitter Bio**：个人简介
4. 点击"保存"完成更新
5. 列表自动刷新显示最新数据

#### 2.5 删除 KOL

1. 在列表中找到要删除的 KOL
2. 点击"删除"按钮
3. 在确认弹窗中点击"确定"
4. KOL 将从列表中永久移除

**注意：** 删除操作不可恢复，请谨慎操作。

### 3. 数据隔离说明

- 每个用户的 KOL 数据完全独立
- 用户 A 无法看到用户 B 的 KOL
- 所有操作自动关联当前登录用户
- 确保数据安全和隐私

### 4. 状态说明

| 状态   | 说明                     | 颜色标识  |
| ------ | ------------------------ | --------- |
| 新添加 | 刚导入的 KOL，未联系     | 🔵 灰色   |
| 已联系 | 已发送过消息，等待回复   | 🟠 蓝色   |
| 已回复 | KOL 有回复，待跟进       | 🟢 绿色   |
| 洽谈中 | 正在谈判合作细节         | 🔷 橙色   |
| 合作中 | 达成合作协议，合作进行中 | 🟣 青绿色 |
| 已合作 | 合作已完成               | 🔵 蓝色   |
| 已拒绝 | KOL 明确拒绝合作         | 🔴 红色   |

### 5. 常见问题

**Q: 为什么登录后看不到数据？**
A: 新注册用户的 KOL 列表为空，需要先通过"批量导入"功能添加 KOL。

**Q: 批量导入失败怎么办？**
A: 检查输入格式是否正确，确保每行一个用户名，并且符合支持的 4 种格式之一。

**Q: 如何调整列表显示数量？**
A: 在列表页面底部的分页器中，可以选择每页显示 10/20/50/100 条。

**Q: 质量分是如何计算的？**
A: 目前质量分需要手动设置（0-100），后续版本将实现基于粉丝数、活跃度、内容质量的自动计算算法。

**Q: CORS 错误怎么解决？**
A: 确保后端 `.env` 文件中的 `CORS_ORIGIN` 包含前端运行的端口（默认 5173 或 5174）。

**Q: 如何备份数据？**
A: 使用 Prisma Studio 或直接备份 SQLite 数据库文件（`backend/prisma/dev.db`）。

**Q: 忘记密码怎么办？**
A: 当前版本暂不支持密码重置功能，请联系管理员或重新注册。

## 🔐 环境变量配置

### 后端环境变量 (backend/.env)

创建 `backend/.env` 文件（基于 `.env.example`）：

```bash
# ==================== 应用配置 ====================
# 运行环境：development（开发）/ production（生产）
NODE_ENV=development

# 服务器端口
PORT=3000

# ==================== 数据库配置 ====================
# 开发环境使用 SQLite（无需额外安装）
DATABASE_URL="file:./dev.db"

# 生产环境使用 PostgreSQL（推荐）
# DATABASE_URL="postgresql://username:password@localhost:5432/kol_bd_tool"
# 注意：切换数据库后需要重新运行 prisma migrate

# ==================== JWT 认证配置 ====================
# JWT 密钥（必须修改！至少 32 个字符的随机字符串）
# 生成方式：node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-change-this

# JWT 过期时间（7d = 7天，1h = 1小时，30m = 30分钟）
JWT_EXPIRES_IN=7d

# ==================== CORS 配置 ====================
# 允许的前端来源（多个源用逗号分隔，不要加空格）
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# ==================== 翻译服务配置 ====================
# DeepL API 密钥（可选，用于翻译功能）
# 申请地址：https://www.deepl.com/pro-api
# 免费额度：每月 50 万字符
# 获取密钥：DeepL Account -> API Keys
#
# 注意 API 密钥格式：
#   - Free 版本密钥以 :fx 结尾（示例：abc123:fx）
#   - Pro 版本密钥不带后缀（示例：abc123）
DEEPL_API_KEY=your-deepl-api-key-here:fx

# ==================== 日志配置 ====================
# 日志级别：debug / info / warn / error
# 开发环境建议使用 debug 或 info
# 生产环境建议使用 warn 或 error
LOG_LEVEL=info

# ==================== 限流配置 ====================
# API 限流时间窗口（毫秒）
RATE_LIMIT_WINDOW_MS=900000  # 15分钟

# 时间窗口内最大请求数
RATE_LIMIT_MAX_REQUESTS=100

# ==================== AI 集成配置 ====================
# ZhipuAI GLM API 密钥（用于智能改写功能）
# 申请地址：https://open.bigmodel.cn/
# 获取密钥：控制台 -> API Keys
GLM_API_KEY=your-glm-api-key-here

# GLM 模型版本（推荐使用 glm-4-airx，速度快且便宜）
# 可选值：glm-4-airx（推荐）、glm-4-plus、glm-4-flash
GLM_MODEL=glm-4-airx
```

**必须配置的环境变量：**

- `JWT_SECRET` - **必须修改为随机字符串！** 这关系到系统安全性
- `DATABASE_URL` - 开发环境保持默认即可

**可选配置：**

- `DEEPL_API_KEY` - 如果需要使用翻译功能，需要申请 DeepL API 密钥
- `GLM_API_KEY` - 如果需要使用 AI 改写功能，需要申请 ZhipuAI API 密钥
- 其他配置保持默认值即可

**生成安全的 JWT_SECRET：**

```bash
# 方法1：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法2：使用 OpenSSL
openssl rand -hex 32

# 方法3：在线生成器
# 访问：https://generate-secret.vercel.app/32
```

### 前端环境变量 (frontend/.env)

**前端无需配置环境变量！**

前端使用 Vite 代理功能，自动将 `/api` 开头的请求转发到后端。配置位于 `frontend/vite.config.ts`：

```typescript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000", // 后端地址
        changeOrigin: true,
      },
    },
  },
});
```

**如需修改后端地址：**

1. 打开 `frontend/vite.config.ts`
2. 修改 `proxy.'/api'.target` 为你的后端地址
3. 重启前端服务：`pnpm dev`

### Extension Token 配置

Extension Token 用于浏览器插件与后端的安全通信，**无需手动配置**。

**使用流程：**

1. 登录 Web 应用后，访问"插件内容"页面
2. 系统自动生成 Extension Token
3. 点击"复制/刷新 Token"按钮激活 Token（有效期 2 小时）
4. 在插件侧边栏中粘贴 Token
5. Token 过期后，重复步骤 3-4 即可刷新

## 🛡️ 安全考虑

- **无自动 DM 发送**：所有联系都是手动的，避免 Twitter 账号限制
- **速率限制**：内置 API 滥用防护
- **JWT 认证**：安全的用户认证机制
- **环境变量**：敏感数据不提交到 Git
- **输入验证**：所有 API 输入使用 Zod 验证
- **密码加密**：使用 bcrypt 加密存储密码
- **SQL 注入防护**：使用 Prisma ORM 参数化查询

## 🤝 贡献指南

1. 创建功能分支：`git checkout -b feature/your-feature`
2. 提交更改：`git commit -m "功能：添加你的功能"`
3. 推送分支：`git push origin feature/your-feature`
4. 创建 Pull Request

### 提交信息规范

使用中文提交信息，遵循以下格式：

- `功能：添加 XXX 功能`
- `修复：解决 XXX 问题`
- `优化：改进 XXX 性能`
- `文档：更新 XXX 文档`
- `重构：重构 XXX 模块`
- `测试：添加 XXX 测试`

## 📚 文档

- **[文档索引](docs/README.md)** - 完整文档分类导航
- **[API 文档](docs/API.md)** - REST API 端点与示例
- **[后端文档](backend/README.md)** - 后端架构、API、开发指南
- **[插件文档](extension/README.md)** - Chrome 插件详细文档
- **[插件模板功能](docs/EXTENSION_TEMPLATE_FEATURE.md)** - 插件模板复制与 AI 改写功能说明
- **[开发任务](docs/开发任务.md)** - 任务跟踪与需求管理
- **[数据库备份](docs/DATABASE_BACKUP_RECOVERY.md)** - 备份与恢复指南
- **[翻译服务配置](docs/翻译服务配置指南.md)** - DeepL 翻译配置文档

## 👥 团队

- **开发者：** pdm
- **目标用户：** BD 人员

## 📞 支持

如有问题、疑问或功能请求，请联系我或在仓库中创建 Issue。

## 🎯 路线图

### v1.0.0（已完成 2025-11-06）✅

- ✅ 用户认证系统
- ✅ KOL 管理系统（CRUD）
- ✅ 批量导入功能
- ✅ 高级搜索与筛选
- ✅ 用户数据隔离

### v1.1.0（已完成 2025-11-08）✅

- ✅ 模板管理系统
- ✅ 变量替换引擎（14 种变量）
- ✅ 数据分析仪表盘
- ✅ 图表可视化（Recharts）
- ✅ Solana 风格 UI 重构
- ✅ 多层渐变背景系统
- ✅ 立体导航栏设计
- ✅ Chrome Extension 浏览器插件
- ✅ 一键捕获 Twitter KOL
- ✅ 批量导入功能

### v1.2.0（已完成 2025-11-08）✅

- ✅ Extension Token 双认证系统
- ✅ Token 生成与管理 API
- ✅ 双认证中间件（JWT + Extension Token）
- ✅ 粉丝数分布范围扩展（0-500k+）
- ✅ 重复检测提示优化
- ✅ 插件上传体验优化

### v1.3.0（已完成 2025-11-08）✅

- ✅ CSV 导出功能（KOL 列表导出，17 列完整数据）
- ✅ Papa Parse 5.5.3 集成
- ✅ BOM 头支持（Excel 正确显示中文）
- ✅ 导出按钮集成到 KOL 列表页

### v1.4.0（已完成 2025-11-09）✅

- ✅ Chrome 插件侧边栏（Side Panel）设计
- ✅ DeepL 翻译服务集成
- ✅ 数据库自动备份系统（Cron）
- ✅ 健康检查脚本
- ✅ KOL 管理 Bug 修复（搜索、筛选）
- ✅ 数据分析优化（状态驱动、默认 7 天）
- ✅ KOL 状态更新（增加"已合作"，移除"不感兴趣"）

### v1.5.0（已完成 2025-11-11）✅

- ✅ 首页统计数据对接真实 API
- ✅ 语言支持扩展（新增西班牙语和葡萄牙语）
- ✅ 模板自定义排序功能
- ✅ 数据分析图表优化（语言折线图、模板柱状图）
- ✅ 插件 Token 弹窗样式优化
- ✅ Extension Token 2 小时倒计时系统
- ✅ 插件内容在导航栏正常显示

### v1.6.0（已完成 2025-11-13）✅

- ✅ **AI 智能改写功能**（ZhipuAI GLM-4.5-airx 集成）
  - 4 种改写风格（专业/正式/友好/轻松）
  - 变量占位符保留机制（保护 {{variable}} 格式）
  - 120 秒超时保护机制
  - 双认证支持（JWT + Extension Token）
- ✅ **插件模板复制功能**
  - 搜索式模板选择（实时过滤，最多 50 个结果）
  - 搜索式 KOL 选择（支持 @ 符号搜索，可选）
  - AI 改写集成与风格选择器
  - 变量自动替换（选择 KOL 后替换占位符）
  - 一键复制到剪贴板（execCommand 优化）
- ✅ **后端代码清理**
  - 删除重复的认证中间件（extension-auth.middleware.ts）
  - 统一使用 requireAuth 双认证中间件
  - 删除空模块（contacts/）和空目录（6 个）
  - 归档一次性脚本（fix-template-order.ts）
- ✅ **文档完善**
  - 新增后端详细文档（backend/README.md，732 行）
  - 新增插件模板功能使用说明（EXTENSION_TEMPLATE_FEATURE.md）
  - 更新根目录 README（本文件）

### v1.7.0（已完成 2025-11-13）✅

- ✅ **前端代码清理**
  - 删除未使用的 SolanaBackground.tsx 组件（依赖未安装的 gsap）
  - 删除已废弃的 Navbar.tsx 组件（已被 AppLayout 替代）
  - 删除未使用的 theme.store.ts（主题切换功能已移除）
  - 删除 dist/ 构建产物文件夹（3.1MB）
  - 删除 Effects/ 空目录
- ✅ **后端代码清理**
  - 删除 6 个空目录（types/、common/types/、features/_/middleware/、features/_/**tests**/）
- ✅ **文档清理**
  - 删除过时的 DATABASE.md（内容为 SQLAlchemy，实际使用 Prisma）
  - 创建 docs/archive/ 归档历史文档（3 个设计/测试文档）
- ✅ **插件清理**
  - 删除未使用的 popup.html（已被 side_panel.html 替代）
- ✅ **文档更新**
  - 更新 frontend/README.md 使其准确反映代码结构
  - 更新根目录 README.md 删除不存在的文件引用
  - 文档结构与实际代码 100% 一致
- ✅ **代码优化**
  - 减少代码行数约 1,100 行（前端 350 行 + 后端 750 行）
  - 提高代码库清晰度和可维护性

### v1.8.0（已完成 2025-11-19）✅

- ✅ **KOL 修改历史记录**
  - KOL 详情页展示完整修改历史
  - 记录每次状态、质量分、分类等字段变更
  - 时间线展示变更详情
- ✅ **后端代码重构**
  - 迁移 user 模块到 features/ 目录
  - 迁移 extension 模块到 features/ 目录
  - 统一模块化架构
- ✅ **语言支持扩展**
  - 扩展语言枚举从 9 种到 15 种
  - 新增：中文、阿拉伯语、越南语、泰语、印尼语、土耳其语
  - 同步更新插件语言选择器
- ✅ **插件修复**
  - 修复 KOL 上传验证失败问题
  - 修复质量分输入限制（0-100）
- ✅ **文档清理与优化**
  - 删除过时文档（DEVELOPMENT.md、archive/ 目录）
  - 创建 docs/README.md 文档索引
  - 更新所有文档反映实际代码结构
  - 分类整理文档（核心、功能、运维、开发记录）

### v2.0.0（计划中）🚧

- ⏳ Twitter API 官方集成
- ⏳ 自动质量评分算法
- ⏳ 移动端应用
- ⏳ 多 AI 模型集成（OpenAI、Anthropic）

---

## 📝 更新日志

完整的更新记录请查看 [docs/CHANGELOG.md](docs/CHANGELOG.md)。

最近更新：

- **v1.8.0 (2025-11-19)**: KOL 修改历史、后端重构、语言扩展、文档清理
- **v1.7.0 (2025-11-13)**: 前端代码清理、文档更新
- **v1.6.0 (2025-11-13)**: AI 智能改写、插件模板复制功能、后端代码清理
- **v1.5.0 (2025-11-11)**: 模板自定义排序、Extension Token 倒计时优化
- **v1.4.0 (2025-11-09)**: DeepL 翻译集成、数据库自动备份系统

## 🔧 技术亮点

### 后端架构

- **功能模块化设计**：按业务功能组织代码（auth、kol、templates、analytics、ai、translation）
- **双认证机制**：统一的 `requireAuth` 中间件支持 JWT（Web）+ Extension Token（插件）
- **类型安全**：完整的 TypeScript 覆盖 + Zod 运行时验证
- **数据库安全**：Cron 定时备份 + 7 天保留策略
- **结构化日志**：Pino 高性能日志系统
- **AI 集成**：ZhipuAI GLM-4.5-airx 模型（120 秒超时保护）

### 前端架构

- **现代化技术栈**：React 18 + TypeScript + Vite 5
- **状态管理**：Zustand 轻量级状态管理
- **UI 设计**：Ant Design 5.x + Solana 风格深色主题
- **数据可视化**：Recharts 响应式图表
- **服务层分离**：独立的 API 服务层（services/）
- **类型系统**：完整的 TypeScript 类型定义（types/）

### 插件架构

- **Manifest V3**：最新的浏览器插件标准
- **Side Panel API**：现代化侧边栏交互
- **安全认证**：Extension Token（SHA-256 哈希）
- **离线存储**：Chrome Storage API 本地缓存
- **AI 集成**：Background Service Worker 处理 AI 改写
- **搜索式 UI**：模板和 KOL 选择均支持实时搜索

---

**使用 ❤️ 打造，助力高效的 KOL 管理**

_最后更新：2025-11-19_
