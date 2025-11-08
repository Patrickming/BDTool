# KOL BD Tool - Chrome Extension

> Twitter KOL 一键捕获浏览器插件

## 功能介绍

这是一个 Chrome 浏览器扩展，配合 KOL BD Tool 系统使用，用于在浏览 Twitter 时快速捕获 KOL 信息并自动保存到系统中。

### 核心功能

1. **一键捕获 KOL**
   - 在 Twitter 个人主页点击插件图标
   - 自动提取用户资料（用户名、显示名、粉丝数、简介等）
   - 一键保存到 KOL BD Tool 系统
   - 无需登录，直接使用

2. **自动数据提取**
   - 用户名（username）
   - 显示名称（displayName）
   - 个人简介（bio）
   - 粉丝数（followerCount）
   - 关注数（followingCount）
   - 头像 URL（profileImgUrl）
   - 认证状态（verified）

3. **Extension Token 认证**
   - 使用独立的 Extension Token 认证
   - 安全的 SHA-256 哈希算法
   - 在前端系统中一键生成和复制
   - 自动验证和过期提示

4. **状态显示**
   - 显示已捕获 KOL 数量
   - 实时页面检测
   - 捕获状态提示
   - 重复检测智能提示

## 安装方法

### 前置要求

- Chrome 浏览器 88+
- KOL BD Tool 后端服务正在运行（http://localhost:3000）

### 安装步骤

1. **打开 Chrome 扩展程序页面**
   - 在 Chrome 地址栏输入：`chrome://extensions/`
   - 或通过菜单：`更多工具` → `扩展程序`

2. **启用开发者模式**
   - 点击右上角的"开发者模式"开关

3. **加载未打包的扩展程序**
   - 点击"加载已解压的扩展程序"
   - 选择 `/home/pdm/DEV/projects/BDTool/extension` 目录
   - 插件将出现在扩展程序列表中

4. **固定插件图标**
   - 点击 Chrome 工具栏的拼图图标
   - 找到"KOL BD Tool"
   - 点击图钉图标将其固定到工具栏

## 使用指南

### 捕获 KOL

1. **访问 Twitter 用户主页**
   - 例如：`https://twitter.com/elonmusk`
   - 或：`https://x.com/jack`

2. **点击插件图标**
   - 确认显示"✅ Twitter 个人主页"
   - 点击"📸 捕获当前页面"按钮

3. **查看结果**
   - 状态显示"提取成功"表示已保存
   - 计数器自动更新
   - 数据已自动保存到 KOL BD Tool 系统

4. **验证数据**
   - 访问 KOL BD Tool 前端：http://localhost:5173/kols
   - 检查新增的 KOL 是否出现在列表中

## 技术实现

### 架构说明

- **Manifest V3**：使用最新的 Chrome 扩展 API
- **DOM 提取**：直接从 Twitter 页面 DOM 提取用户数据
- **Chrome Storage API**：本地存储 Extension Token 和捕获统计
- **Extension Token 认证**：使用独立的 Token 系统，与 JWT 分离

### 核心文件

```
extension/
├── manifest.json                   # 扩展配置文件
├── popup.html                      # 弹窗界面
├── popup.js                        # 弹窗逻辑
├── content-twitter-extractor.js    # Twitter 数据提取
├── background.js                   # 后台服务和 API 调用
├── icons/                          # 图标资源
└── README.md                       # 本文件
```

### 关键技术点

#### 1. Twitter 数据提取

从 Twitter 页面 DOM 提取用户信息：

```javascript
// 提取用户名
const urlMatch = window.location.href.match(/\/([\w]+)(?:\/|$|\?)/);

// 提取显示名称
const displayNameEl = document.querySelector('[data-testid="UserName"] span');

// 提取粉丝数（支持 K, M, B 单位）
function parseNumber(text) {
  const match = text.match(/([\d.]+)([KMB])?/i);
  // 转换为数字...
}
```

#### 2. 后端 API 调用

使用 Extension Token 认证：

```javascript
await fetch(`${API_BASE_URL}/kols`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Extension-Token": extensionToken,  // Extension Token 认证
  },
  body: JSON.stringify(kolData),
});
```

#### 3. 去重处理

基于用户名去重，避免重复添加：

```javascript
const kolId = kolData.username;
if (!kolIds.has(kolId)) {
  kolIds.add(kolId);
  allKOLs.push(kolData);
}
```

## 数据安全

- ✅ 所有数据存储在本地（Chrome Storage）
- ✅ 仅访问 Twitter 和本地后端 API
- ✅ 不收集任何个人数据
- ✅ 开源代码，可自行审查

## 常见问题

### Q: 插件无法加载？

A: 确保启用了"开发者模式"，并选择了正确的 `extension/` 目录。

### Q: 无法连接到服务器？

A: 确保后端服务正在运行（http://localhost:3000），检查控制台错误信息。

### Q: 提取失败？

A: 请确保：
1. 在 Twitter 个人主页（不是时间线或搜索页）
2. 页面已完全加载
3. URL 格式正确（例如：twitter.com/username）

### Q: 重复添加怎么办？

A: 插件会自动去重，已存在的 KOL 会被跳过。后端也会进行二次去重检查。

## 调试方法

### 查看插件日志

1. 打开 `chrome://extensions/`
2. 找到"KOL BD Tool"
3. 点击"检查视图" → `service worker` 或 `popup.html`
4. 在 Console 中查看日志

### 查看 Content Script 日志

1. 在 Twitter 页面按 F12
2. 切换到 Console 标签
3. 查找 `[KOL BD Tool]` 或 `✅` 开头的日志

### 测试 API 连接

在浏览器 Console 中执行：

```javascript
// 测试后端连接
fetch("http://localhost:3000/api/v1/kols?limit=1")
  .then((r) => r.json())
  .then(console.log);
```

## 更新日志

### v1.2.0 (2025-11-08)

- ✅ Extension Token 认证系统
- ✅ 重复检测智能提示
- ✅ 详细的上传结果消息（成功/重复/失败）
- ✅ Token 过期自动提示

### v1.0.0 (2025-11-08)

- ✅ 初始版本发布
- ✅ 一键捕获 KOL 功能
- ✅ 自动数据提取
- ✅ 去重处理

## 许可证

私有项目 - 保留所有权利

## 支持

如有问题请联系开发团队或查看主项目 README。

---

**Powered by KOL BD Tool**
*最后更新：2025-11-08*
