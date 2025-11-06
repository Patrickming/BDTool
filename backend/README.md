# KOL-BD-Tool 后端 API

基于 TypeScript + Express + Prisma 构建的 KOL 管理系统后端。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

重要配置项：
- `DATABASE_URL`: 数据库连接字符串
- `JWT_SECRET`: JWT 密钥（至少 32 个字符）
- `OPENAI_API_KEY`: OpenAI API 密钥（可选）

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 运行数据库迁移
npm run db:migrate

# (可选) 填充测试数据
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

访问 `http://localhost:3000/health` 检查服务器状态。

## 📦 可用脚本

- `npm run dev` - 启动开发服务器（热重载）
- `npm run build` - 构建生产版本
- `npm start` - 运行生产版本
- `npm test` - 运行测试
- `npm run lint` - 代码检查
- `npm run format` - 代码格式化
- `npm run db:migrate` - 运行数据库迁移
- `npm run db:studio` - 打开 Prisma Studio（数据库可视化工具）

## 🏗️ 项目结构

```
src/
├── features/          # 功能模块
│   ├── auth/         # 认证模块
│   ├── kols/         # KOL 管理
│   ├── templates/    # 模板管理
│   ├── contacts/     # 联系记录
│   └── ai/           # AI 集成
├── common/           # 公共代码
│   ├── middleware/   # 中间件
│   ├── utils/        # 工具函数
│   └── errors/       # 错误类
├── config/           # 配置
├── database/         # 数据库
└── types/            # 类型定义
```

## 📚 技术栈

- **运行时**: Node.js 18+
- **语言**: TypeScript 5.7
- **框架**: Express 4
- **数据库**: PostgreSQL / SQLite
- **ORM**: Prisma 6
- **验证**: Zod
- **认证**: JWT + bcrypt
- **日志**: Pino
- **测试**: Vitest

## 🔐 API 文档

API 文档请参考 `docs/API.md`。

主要端点：
- `GET /health` - 健康检查
- `POST /api/v1/auth/register` - 用户注册（待实现）
- `POST /api/v1/auth/login` - 用户登录（待实现）
- `GET /api/v1/kols` - 获取 KOL 列表（待实现）

## 🛠️ 开发

### 代码规范

项目使用 ESLint 和 Prettier 保证代码质量：

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix

# 格式化代码
npm run format
```

### 数据库操作

```bash
# 创建新迁移
npm run db:migrate

# 查看数据库（GUI）
npm run db:studio

# 重置数据库（危险！）
npm run db:reset
```

## 📝 待办事项

- [ ] 实现认证系统
- [ ] 实现 KOL CRUD API
- [ ] 实现模板管理 API
- [ ] 实现联系记录 API
- [ ] 集成 OpenAI/Anthropic
- [ ] 编写单元测试
- [ ] 编写 API 文档

## 📄 许可证

MIT
