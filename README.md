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

## 🚀 Quick Start

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

Frontend will be available at: `http://localhost:5173`

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
