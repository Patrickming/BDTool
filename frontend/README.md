# KOL BD Tool - 前端

基于 React + TypeScript + Vite + Ant Design 构建的现代化前端应用。

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:5173`

### 3. 构建生产版本

```bash
pnpm build
```

## 📦 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.3 | UI 框架 |
| **TypeScript** | 5.7 | 类型安全 |
| **Vite** | 5.4 | 构建工具 |
| **Ant Design** | 5.22 | UI 组件库 |
| **React Router** | 6.28 | 路由管理 |
| **Zustand** | 5.0 | 状态管理 |
| **Axios** | 1.7 | HTTP 请求 |

## 🏗️ 项目结构

```
src/
├── pages/           # 页面组件
│   ├── Login.tsx    # 登录页面
│   ├── Register.tsx # 注册页面
│   └── Home.tsx     # 首页
├── services/        # API 服务
│   └── auth.service.ts
├── store/           # 状态管理
│   └── auth.store.ts
├── types/           # 类型定义
│   └── auth.ts
├── lib/             # 工具库
│   └── axios.ts     # Axios 配置
├── App.tsx          # 主应用组件
├── main.tsx         # 应用入口
└── index.css        # 全局样式
```

## 🎨 已实现功能

### 认证功能
- ✅ 用户注册
- ✅ 用户登录
- ✅ 用户信息展示
- ✅ 退出登录
- ✅ 表单验证
- ✅ 自动 Token 管理
- ✅ 401 自动跳转登录

## 🔧 配置说明

### Vite 配置

- **端口**: 5173
- **代理**: `/api` → `http://localhost:3000`
- **路径别名**: `@` → `src/`

### 环境变量

无需配置环境变量，API 通过 Vite 代理自动转发。

## 📝 开发规范

### 代码风格

```bash
# 检查代码
pnpm lint

# 类型检查
pnpm type-check
```

### 文件命名

- 组件文件：PascalCase（如 `Login.tsx`）
- 工具文件：camelCase（如 `axios.ts`）
- 类型文件：camelCase（如 `auth.ts`）

### 导入顺序

1. React / 第三方库
2. 组件
3. 类型
4. 工具函数

## 🐛 常见问题

### 1. 端口被占用

修改 `vite.config.ts` 中的 `server.port`。

### 2. API 请求失败

确保后端服务器运行在 `http://localhost:3000`。

### 3. 类型错误

运行 `pnpm type-check` 检查类型问题。

## 📖 相关文档

- [项目总览](../README.md)
- [后端 API](../backend/README.md)
- [API 文档](../docs/API.md)

---

**由 KCEX BD 团队使用 ❤️ 构建**
