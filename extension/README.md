# KOL BD Tool - Chrome Extension

> Twitter KOL 一键捕获浏览器插件

## 📖 功能介绍

这是一个 Chrome 浏览器扩展，配合 KOL BD Tool 系统使用，用于在浏览 Twitter 时快速捕获 KOL 信息并保存到系统中。

### 核心功能

1. **一键捕获 KOL**
   - 在 Twitter 个人主页添加"添加到系统"按钮
   - 自动提取用户资料（用户名、显示名、粉丝数、简介等）
   - 一键保存到 KOL BD Tool 系统

2. **批量导入**
   - 从关注列表批量捕获用户
   - 从粉丝列表批量捕获用户
   - 支持一次导入多个 KOL

3. **状态显示**
   - 显示今日已捕获数量
   - 显示系统 KOL 总数

## 🚀 安装方法

### 前置要求

- Chrome 浏览器（版本 88+）
- KOL BD Tool 后端服务正在运行（http://localhost:3000）
- 有效的登录 Token

### 安装步骤

1. **下载插件代码**
   ```bash
   # 插件代码位于 extension/ 目录
   ```

2. **打开 Chrome 扩展程序页面**
   - 在 Chrome 地址栏输入：`chrome://extensions/`
   - 或通过菜单：`更多工具` → `扩展程序`

3. **启用开发者模式**
   - 点击右上角的"开发者模式"开关

4. **加载未打包的扩展程序**
   - 点击"加载已解压的扩展程序"
   - 选择 `extension/` 目录
   - 插件将出现在扩展程序列表中

5. **固定插件图标**
   - 点击 Chrome 工具栏的拼图图标
   - 找到"KOL BD Tool"
   - 点击图钉图标将其固定到工具栏

## 🔧 使用指南

### 首次使用

1. **获取 Token**
   - 登录 KOL BD Tool 系统（http://localhost:5173）
   - 打开浏览器开发者工具（F12）
   - 在 Console 中输入：`localStorage.getItem('token')`
   - 复制返回的 Token

2. **设置 Token**
   - 点击插件图标打开弹出窗口
   - 粘贴 Token 到输入框
   - 点击"保存 Token"

3. **验证登录**
   - 如果显示"✅ 已登录"，说明设置成功

### 捕获单个 KOL

1. 访问任意 Twitter 用户主页
   - 例如：`https://twitter.com/elonmusk`

2. 方法 A：使用页面按钮
   - 在用户操作栏找到"📸 添加到系统"按钮
   - 点击按钮即可捕获

3. 方法 B：使用插件弹窗
   - 点击插件图标
   - 点击"📸 捕获当前用户"按钮

4. 查看结果
   - 按钮会显示"✅ 已添加"表示成功
   - 失败会显示"❌ 失败"并弹出错误信息

### 批量捕获

1. 访问关注/粉丝列表
   - 例如：`https://twitter.com/elonmusk/following`

2. 滚动加载更多用户
   - 向下滚动加载想要捕获的用户

3. 打开插件弹窗
   - 点击插件图标
   - 页面类型会显示"✅ 关注/粉丝列表"

4. 点击批量捕获
   - 点击"📦 批量捕获"按钮
   - 系统会自动提取并导入所有可见用户

## 📋 提取的数据字段

插件会自动提取以下信息：

| 字段 | 说明 | 示例 |
|------|------|------|
| username | Twitter 用户名 | `elonmusk` |
| displayName | 显示名称 | `Elon Musk` |
| bio | 个人简介 | `CEO of Tesla and SpaceX` |
| followerCount | 粉丝数 | `150000000` |
| followingCount | 关注数 | `500` |
| verified | 认证状态 | `true` |
| profileImgUrl | 头像 URL | `https://...` |

## ⚙️ 配置说明

### 修改 API 地址

如果后端服务不在 localhost:3000，需要修改配置：

1. 打开 `extension/utils/config.js`
2. 修改 `API_BASE_URL` 值
3. 重新加载插件

### 调试模式

查看插件日志：

1. 打开 `chrome://extensions/`
2. 找到"KOL BD Tool"
3. 点击"检查视图"中的链接
4. 在 Console 中查看日志

## ❓ 常见问题

### Q: 插件无法加载？
A: 确保启用了"开发者模式"，并选择了正确的 `extension/` 目录。

### Q: Token 无效？
A: 重新登录系统获取新 Token，Token 有效期为 7 天。

### Q: 无法连接到服务器？
A: 确保后端服务正在运行（http://localhost:3000），检查 CORS 配置。

### Q: 按钮没有出现？
A: 等待页面完全加载，刷新页面重试。某些页面可能需要 2-3 秒才能注入按钮。

### Q: 捕获失败？
A: 检查是否在正确的页面（个人主页），查看控制台错误信息。

### Q: 批量捕获只捕获了部分用户？
A: 插件只能捕获当前页面上可见的用户。滚动加载更多用户后再次点击批量捕获。

## 🛠️ 开发指南

### 项目结构

```
extension/
├── manifest.json           # 插件配置
├── icons/                  # 插件图标
├── popup/                  # 弹出窗口
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/                # 内容脚本
│   ├── content.js         # 主逻辑
│   ├── twitter-scraper.js # 数据提取
│   └── styles.css         # 注入样式
├── background/             # 后台脚本
│   └── service-worker.js
├── utils/                  # 工具函数
│   ├── api.js
│   ├── storage.js
│   └── config.js
└── README.md               # 本文件
```

### 修改和测试

1. 修改代码后，在 `chrome://extensions/` 点击刷新图标
2. 或使用快捷键：Ctrl+R（Windows/Linux）或 Cmd+R（Mac）
3. 刷新 Twitter 页面查看效果

### 添加新功能

编辑以下文件：
- **UI 修改**：`popup/popup.html` 和 `popup/popup.css`
- **逻辑修改**：`popup/popup.js` 或 `content/content.js`
- **数据提取**：`content/twitter-scraper.js`
- **API 调用**：`utils/api.js`

## 📝 更新日志

### v1.0.0 (2025-11-08)
- ✅ 初始版本发布
- ✅ 一键捕获 KOL 功能
- ✅ 批量导入功能
- ✅ Token 认证系统
- ✅ 统计信息显示

## 🔒 隐私和安全

- 插件仅在 Twitter 页面运行
- 所有数据仅发送到您配置的后端服务器
- Token 仅存储在本地（Chrome Storage）
- 不收集任何个人数据

## 📄 许可证

私有项目 - 保留所有权利

## 👥 支持

如有问题请联系开发团队或查看主项目 README。

---

**Powered by KOL BD Tool**
*最后更新：2025-11-08*
