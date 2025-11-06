# KOL-BD-Tool

> A comprehensive KOL (Key Opinion Leader) management system for crypto exchange BD (Business Development) teams

## 🎯 Project Overview

KOL-BD-Tool is a full-stack web application designed to streamline the process of discovering, managing, and communicating with crypto KOLs on Twitter/X. Built specifically for KCEX exchange BD team.

## ✨ Key Features

### 1. **Message Template Management**
- Create, edit, and organize communication templates
- Support for variables (e.g., `{{username}}`, `{{follower_count}}`)
- AI-powered template generation (OpenAI/Claude integration)
- Template effectiveness tracking (response rates)
- Multi-language support

### 2. **KOL Discovery & Filtering**
- Manual import (batch username input)
- Seed expansion (discover from existing KOLs)
- Automatic quality scoring (0-100)
- Content analysis and categorization
- Smart filtering based on:
  - Follower count (1k-50k)
  - Content type (contract trading > crypto trading > web3)
  - Language (exclude Chinese, Turkish, Middle Eastern, Persian)
  - Activity (must have tweets within 7 days)

### 3. **CRM System**
- Complete KOL database with profiles
- Contact history timeline
- Status management (new/contacted/replied/negotiating/cooperating/rejected)
- Tag system for organization
- Notes and custom fields
- Advanced search and filtering

### 4. **Outreach Assistant**
- Select KOL + Template
- Auto-fill variables
- Message preview
- Copy to clipboard (manual sending to avoid account risks)
- Interaction logging

### 5. **Analytics Dashboard**
- Weekly statistics (contacts, response rates)
- KOL distribution charts
- Template effectiveness analysis
- Follow-up reminders

### 6. **Browser Extension**
- Quick capture KOL info from Twitter pages
- Batch import from following list
- Page enhancements (show scores, quick actions)

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **UI Library:** Ant Design
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Router:** React Router v6

### Backend
- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL (production) / SQLite (development)
- **ORM:** Prisma 6.0
- **Validation:** Zod
- **Authentication:** JWT + bcrypt
- **Logging:** Pino

### Browser Extension
- **Platform:** Chrome Extension (Manifest V3)
- **Language:** JavaScript/TypeScript
- **Integration:** REST API communication with backend

### AI Integration
- **OpenAI API:** GPT-4 for template generation
- **Anthropic Claude API:** Alternative AI provider
- **Use cases:** Template generation, content analysis, language detection

## 📁 Project Structure

```
kol-bd-tool/
├── docs/                        # Comprehensive documentation
│   ├── README.md               # This file
│   ├── REQUIREMENTS.md         # Detailed requirements specification
│   ├── DATABASE.md             # Database schema and design
│   ├── API.md                  # API documentation
│   ├── DEVELOPMENT.md          # Development log and changelog
│   └── DEPLOYMENT.md           # Deployment guide
│
├── frontend/                    # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   ├── stores/             # State management (Zustand)
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Helper functions
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                     # FastAPI backend application
│   ├── app/
│   │   ├── models/             # SQLAlchemy database models
│   │   ├── routers/            # API route handlers
│   │   ├── services/           # Business logic layer
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── utils/              # Helper functions
│   │   ├── config.py           # Configuration management
│   │   └── main.py             # FastAPI application entry
│   ├── alembic/                # Database migrations
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile
│
├── extension/                   # Chrome browser extension
│   ├── manifest.json           # Extension configuration
│   ├── popup.html              # Extension popup UI
│   ├── popup.js                # Popup logic
│   ├── content.js              # Twitter page injection script
│   └── background.js           # Background service worker
│
├── .gitignore
├── docker-compose.yml          # Local development environment
└── README.md                   # This file
```

## 📋 当前实现状态

### ✅ 已实现功能 (v1.0.0)

#### 1. 用户认证系统
- ✅ 用户注册（邮箱 + 密码）
- ✅ 用户登录（JWT Token 认证）
- ✅ Token 自动管理
- ✅ 权限中间件（认证、管理员、所有者权限）
- ✅ 用户管理 API（查询、更新、删除）
- ✅ 密码加密存储（bcrypt）
- ✅ 自动登录态保持

#### 2. KOL 管理系统（核心功能）
- ✅ **KOL 列表查询**
  - 分页功能（可调整每页数量）
  - 多维度搜索（用户名、显示名）
  - 状态筛选（7 种状态）
  - 分类筛选（内容类别）
  - 粉丝数范围筛选
  - 质量分范围筛选
  - 认证状态筛选
  - 多字段排序（创建时间、更新时间、粉丝数、质量分）

- ✅ **KOL 批量导入**
  - 支持 4 种输入格式：
    - `@username`
    - `username`
    - `https://twitter.com/username`
    - `https://x.com/username`
  - 自动去重
  - 详细导入结果（成功/失败/重复统计）
  - 错误提示
  - 一次最多 100 个

- ✅ **KOL 编辑功能**
  - 在线编辑弹窗
  - 所有字段可编辑
  - 实时验证
  - 自动列表刷新

- ✅ **KOL 删除功能**
  - 删除确认弹窗
  - 软删除或硬删除（可配置）

#### 3. 数据隔离
- ✅ 每个用户只能看到自己创建的 KOL
- ✅ 无法访问其他用户的数据
- ✅ 所有操作自动关联当前用户

#### 4. UI/UX
- ✅ Web3 风格深色主题
- ✅ 响应式设计
- ✅ 友好的错误提示
- ✅ 状态标签颜色区分
- ✅ 质量评分可视化
- ✅ 加载状态显示
- ✅ 空状态提示

### 🚧 待实现功能

- ⏳ 模板管理系统
- ⏳ 联系记录系统
- ⏳ 智能质量评分算法
- ⏳ AI 内容生成集成
- ⏳ 浏览器插件
- ⏳ 数据统计和分析

## 🚀 快速开始

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 14+ (or SQLite for development)

### 后端设置

```bash
# 进入后端目录
cd backend

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填写你的配置

# 生成 Prisma Client
pnpm db:generate

# 运行数据库迁移
pnpm db:migrate

# 启动开发服务器
pnpm dev
```

后端将在 `http://localhost:3000` 启动
健康检查端点：`http://localhost:3000/health`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend API URL

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173` or `http://localhost:5174`

## 📖 使用指南

### 1. 首次使用

1. **注册账号**
   - 访问前端地址 `http://localhost:5174`
   - 点击"注册"按钮
   - 填写邮箱、密码（至少 8 位）和姓名
   - 提交注册

2. **登录系统**
   - 使用注册的邮箱和密码登录
   - 系统会自动保存登录状态（7天有效期）

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
   ```
4. 点击"开始导入"
5. 查看导入结果（成功/失败/重复统计）

**提示**：
- 一次最多导入 100 个
- 系统自动去重
- 支持 4 种输入格式

#### 2.2 查看 KOL 列表

- 默认按创建时间倒序排列
- 显示所有 KOL 的关键信息
- 每页 10 条，可调整

#### 2.3 搜索和筛选

1. **文本搜索**：输入用户名或显示名
2. **状态筛选**：选择特定状态（新添加、已联系、已回复等）
3. **分类筛选**：选择内容类别（合约交易、加密交易、Web3）
4. **粉丝数筛选**：设置最小和最大粉丝数
5. **质量分筛选**：设置最小和最大质量分
6. **认证状态**：筛选已认证或未认证账号
7. **排序**：按创建时间、粉丝数、质量分等排序

**提示**：
- 可以组合多个筛选条件
- 点击"重置"清空所有筛选

#### 2.4 编辑 KOL

1. 点击列表中的"编辑"按钮
2. 在弹窗中修改信息：
   - 基本信息（用户名、显示名、简介）
   - 状态（7 种可选）
   - 内容分类
   - 质量评分（0-100）
   - 粉丝数、关注数
   - Twitter Bio
3. 点击"保存"完成更新

#### 2.5 删除 KOL

1. 点击列表中的"删除"按钮
2. 确认删除操作
3. KOL 将从列表中移除

### 3. 数据隔离

- 每个用户的 KOL 数据完全独立
- 不同用户之间看不到对方的 KOL
- 所有操作自动关联当前登录用户

### 4. 状态说明

| 状态 | 说明 | 颜色 |
|------|------|------|
| 新添加 | 刚导入的 KOL | 蓝色 |
| 已联系 | 已发送过消息 | 橙色 |
| 已回复 | KOL 有回复 | 绿色 |
| 协商中 | 正在谈判合作 | 青色 |
| 合作中 | 达成合作 | 紫色 |
| 已拒绝 | KOL 明确拒绝 | 红色 |
| 无兴趣 | KOL 未回复或表示无兴趣 | 灰色 |

### 5. 常见问题

**Q: 为什么登录后看不到数据？**
A: 新注册用户的 KOL 列表为空，需要先批量导入或创建 KOL。

**Q: 批量导入失败怎么办？**
A: 检查输入格式是否正确，确保每行一个用户名，并且符合支持的格式。

**Q: 如何调整列表显示数量？**
A: 在列表页面底部的分页器中，可以选择每页显示 10/20/50/100 条。

**Q: 质量分是如何计算的？**
A: 目前质量分需要手动设置，后续版本将实现自动计算算法。

**Q: CORS 错误怎么解决？**
A: 确保后端 `.env` 文件中的 `CORS_ORIGIN` 包含前端运行的端口（5173 或 5174）。

### Browser Extension Setup

```bash
# Navigate to extension directory
cd extension

# Install dependencies (if using build tools)
npm install

# Build extension
npm run build

# Load extension in Chrome:
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the extension/ directory
```

## 📚 Documentation

- **[Requirements Specification](docs/REQUIREMENTS.md)** - Detailed feature requirements and user stories
- **[Database Design](docs/DATABASE.md)** - Complete database schema and relationships
- **[API Documentation](docs/API.md)** - REST API endpoints and examples
- **[Development Log](docs/DEVELOPMENT.md)** - Development progress and changelog
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions

## 🔐 Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kol_bd_tool

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI APIs (optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=KOL-BD-Tool
```

## 🛡️ Security Considerations

- **No automated DM sending** - All outreach is manual to avoid Twitter account restrictions
- **Rate limiting** - Built-in protection against API abuse
- **JWT authentication** - Secure user authentication
- **Environment variables** - Sensitive data never committed to Git
- **Input validation** - All API inputs validated with Pydantic schemas

## 📊 KOL Filtering Rules

### ✅ Required Criteria
- Follower count: 1,000 - 50,000
- Active within last 7 days (must have recent tweets)
- Content category priority:
  1. Contract trading analysis (highest priority)
  2. Crypto token trading
  3. Web3 general content

### ❌ Exclusion Criteria
- Accounts with <1k or >50k followers
- Inactive accounts (no tweets in 7+ days)
- Non-crypto content
- Languages: Chinese, Turkish, Middle Eastern languages, Persian

## 🤝 Contributing

This is a private project for KCEX exchange. If you're part of the team:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Create a Pull Request

## 📝 License

Private project - All rights reserved

## 👥 Team

- **Developer:** Claude Code
- **Product Owner:** KCEX BD Team
- **Target Users:** BD interns and team members

## 📞 Support

For issues, questions, or feature requests, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for efficient crypto KOL management**
