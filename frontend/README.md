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
├── pages/                # 页面组件
│   ├── Auth/            # 认证页面
│   │   ├── Login.tsx    # 登录页面
│   │   └── Register.tsx # 注册页面
│   ├── KOL/             # KOL 管理页面
│   │   ├── KOLList.tsx  # KOL 列表
│   │   ├── KOLDetail.tsx # KOL 详情
│   │   └── KOLImport.tsx # 批量导入
│   ├── Template/        # 模板管理页面
│   ├── Analytics/       # 数据分析页面
│   ├── Extension.tsx    # 插件配置页面
│   └── Home.tsx         # 首页
├── components/          # 可复用组件
│   ├── Layout/         # 布局组件
│   ├── KOL/            # KOL 相关组件
│   ├── analytics/      # 分析图表组件
│   └── Effects/        # 视觉效果组件
├── services/           # API 服务
│   ├── auth.service.ts
│   ├── kol.service.ts
│   ├── template.service.ts
│   ├── analytics.service.ts
│   ├── translation.service.ts
│   └── extension.service.ts
├── store/              # Zustand 状态管理
│   ├── auth.store.ts
│   ├── kol.store.ts
│   ├── template.store.ts
│   └── analytics.store.ts
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
│   └── export.ts       # CSV 导出工具
├── styles/             # 全局样式
│   └── theme.css       # 主题样式
├── App.tsx             # 主应用组件
└── main.tsx            # 应用入口
```

## 🎨 已实现功能

### 1. 认证功能 ✅
- ✅ 用户注册
- ✅ 用户登录
- ✅ 用户信息展示
- ✅ 退出登录
- ✅ 表单验证
- ✅ 自动 Token 管理
- ✅ 401 自动跳转登录

### 2. KOL 管理 ✅
- ✅ KOL 列表展示（分页、排序）
- ✅ 高级筛选（状态、分类、粉丝数、质量分、认证）
- ✅ 搜索功能（用户名、显示名）
- ✅ 批量导入（支持多种格式）
- ✅ KOL 详情页面
- ✅ 编辑 KOL 信息
- ✅ 删除 KOL
- ✅ CSV 导出功能

### 3. 模板管理 ✅
- ✅ 模板列表（分页、筛选）
- ✅ 创建/编辑模板
- ✅ 模板分类管理
- ✅ 变量系统（14 种变量）
- ✅ 实时预览（变量替换）
- ✅ 使用统计追踪

### 4. 数据分析 ✅
- ✅ 概览统计（7 个核心指标）
- ✅ KOL 分布图表（粉丝数、质量分、分类、状态）
- ✅ 模板效果分析
- ✅ 联系时间线（双轴折线图）
- ✅ 自定义时间范围
- ✅ 实时数据刷新

### 5. 翻译功能 ✅
- ✅ 翻译按钮集成
- ✅ 中英互译
- ✅ 翻译结果显示
- ✅ 错误处理

### 6. Extension 配置 ✅
- ✅ Extension Token 管理
- ✅ Token 生成/激活
- ✅ 一键复制功能
- ✅ 今日捕获统计

### 7. UI/UX ✅
- ✅ Solana 风格深色主题
- ✅ 多层渐变背景
- ✅ 玻璃态效果
- ✅ 响应式设计
- ✅ 平滑过渡动画
- ✅ 加载状态显示

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
