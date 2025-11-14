# 插件模板与 AI 改写功能使用说明

> 版本：v1.7.0 | 更新日期：2025-11-13

## 功能概述

Chrome 插件侧边栏（Side Panel）集成了以下功能：
1. **KOL 数据捕获**：从 Twitter/X 主页捕获 KOL 资料
2. **模板管理**：选择模板并替换变量
3. **AI 改写**：使用 AI 改写模板内容（支持 4 种风格）
4. **一键复制**：将处理后的内容复制到剪贴板

## 功能位置

模板功能位于插件侧边栏（Side Panel）中，在"清空本地数据"按钮下方。

## 前提条件

**必须先配置 Extension Token**，模板功能才会显示！

### 如何获取并配置 Token：

1. 在网页端登录 KOL BD Tool 系统
2. 访问「插件内容」页面（/extension-content）
3. 点击「生成 Token」或「激活 Token」按钮
4. 复制生成的 Extension Token
5. 在 Chrome 插件中点击「配置 Token」按钮
6. 粘贴 Token 并保存

> **注意**：Extension Token 与用户登录 Token 是不同的，需要单独生成

## 功能说明

### 1. 模板选择
- **搜索式选择**：输入模板名称进行实时搜索
- 选择模板后自动加载内容
- 最多显示 50 个匹配结果
- 支持模糊搜索

### 2. KOL 选择（可选）
- **搜索式选择**：输入 KOL 用户名进行实时搜索
- **默认（不选择）**：复制的内容保留占位符，如 `{{username}}`, `{{display_name}}`
- **选择 KOL**：自动替换占位符为真实 KOL 数据
- 支持输入 `@` 符号搜索
- 最多显示 50 个匹配结果

### 3. AI 改写（可选）⭐ 新功能
- **未勾选**：直接复制原始模板内容
- **勾选后**：
  - 自动显示**改写风格选择器**
  - 可选 4 种改写风格：
    - **专业 (Professional)**：适合商务场合，语气专业（默认）
    - **正式 (Formal)**：更加严肃正式的表达
    - **友好 (Friendly)**：友好亲切的语气
    - **轻松 (Casual)**：轻松随意的风格
  - 点击复制时会先调用 AI API 改写内容
  - 显示"⏳ AI 改写中..."（通常 1-5 秒）
  - 改写成功后显示"✅ 已复制 AI 改写后的内容"
  - **智能保留**：AI 改写过程自动保留所有 `{{变量}}` 占位符
  - **超时保护**：120 秒超时自动返回错误

#### AI 改写技术细节
- **后端 API**：`POST /api/v1/ai/rewrite`
- **参数**：
  - `text`：模板内容
  - `tone`：改写风格（professional/formal/friendly/casual）
  - `language`：目标语言（默认 `en`）
  - `preserveVariables`：保留变量占位符（固定为 `true`）
- **响应时间**：平均 2-5 秒
- **最大等待时间**：120 秒

### 4. 复制按钮
- 点击后将内容复制到剪贴板
- 显示成功提示 2 秒后自动消失

## 使用流程

```
1. 配置 Extension Token（首次使用）
   ↓
2. 模板区域自动显示
   ↓
3. 选择模板
   ↓
4. （可选）搜索并选择 KOL 替换占位符
   ↓
5. （可选）勾选 AI 改写
   ↓
6. （可选）如果启用 AI，选择改写风格
   ↓
7. 点击"复制模板内容"
   ↓
8. 粘贴到 Twitter DM 或评论
```

## 使用场景示例

### 场景 1：给 KOL 发送标准邀请
```
1. 选择模板："KOL 邀请模板"
2. 选择 KOL：@VitalikButerin
3. 不启用 AI 改写
4. 点击复制
→ 得到：Hi @VitalikButerin, we'd like to invite you to...
```

### 场景 2：个性化邀请 + AI 改写
```
1. 选择模板："合作邀请"
2. 选择 KOL：@elonmusk
3. 启用 AI 改写，选择"友好 (Friendly)"
4. 点击复制
→ 得到：AI 改写后的友好风格内容，KOL 信息已替换
```

### 场景 3：通用模板保留变量
```
1. 选择模板："通用问候"
2. 不选择 KOL
3. 启用 AI 改写，选择"专业 (Professional)"
4. 点击复制
→ 得到：保留 {{username}} 等占位符，后续手动替换
```

## 注意事项

### Token 管理
- **Extension Token 独立性**：与用户登录 JWT Token 不同
- **Token 有效期**：根据后端配置，通常为 2 小时或 7 天
- **失效处理**：Token 失效时会返回 401 错误，需重新生成
- **存储位置**：保存在 Chrome 插件的 `chrome.storage.local` 中

### 网络要求
- **后端服务**：必须运行在 `localhost:3000`
- **AI 服务**：需要 AI 服务配置正确（智谱 AI API Key）
- **超时设置**：AI 改写最长等待 120 秒

### 数据限制
- **模板列表**：最多显示 100 个模板
- **KOL 列表**：最多显示 100 个 KOL
- **搜索结果**：下拉框最多显示前 50 个匹配项

### 性能优化
- **首次加载**：模板和 KOL 数据会缓存到内存
- **搜索响应**：实时搜索，无延迟
- **复制方式**：使用 `document.execCommand('copy')` 确保兼容性

## 故障排除

### 问题 1：看不到模板区域
**原因**：未配置 Extension Token
**解决方案**：
1. 检查插件顶部的"认证状态"区域
2. 如果显示"❌ 未配置 Token"，点击"配置 Token"按钮
3. 到网页端生成 Token 并配置

### 问题 2：模板列表为空
**原因**：后端服务未运行或 Token 无效
**解决方案**：
1. 确认后端服务运行：`pnpm dev`
2. 检查 Token 是否过期（重新生成）
3. 打开浏览器控制台查看错误信息
4. 验证后端 API：`GET http://localhost:3000/api/v1/templates`

### 问题 3：AI 改写失败
**原因**：AI 服务配置错误或网络超时
**解决方案**：
1. 检查后端 `.env` 文件中的 `GLM_API_KEY`
2. 测试 AI 服务健康状态：`GET /api/v1/ai/health`
3. 如果超时（120秒），检查网络连接
4. 查看后端日志排查错误

### 问题 4：复制功能无效
**原因**：浏览器权限或扩展权限问题
**解决方案**：
1. 确认 Chrome 插件有"activeTab"权限
2. 尝试手动选中并复制（fallback）
3. 检查浏览器控制台是否有权限错误

### 问题 5：KOL 变量未替换
**原因**：未选择 KOL 或模板中没有对应变量
**解决方案**：
1. 确认已选择 KOL（显示 `@username`）
2. 检查模板中是否包含变量（如 `{{username}}`）
3. 预览 API 返回的内容是否已替换

## API 接口说明

### 1. 获取模板列表
```http
GET /api/v1/templates?page=1&limit=100
Headers:
  X-Extension-Token: <your-token>
```

### 2. 获取 KOL 列表
```http
GET /api/v1/kols?page=1&limit=100
Headers:
  X-Extension-Token: <your-token>
```

### 3. 预览模板（变量替换）
```http
POST /api/v1/templates/preview
Headers:
  X-Extension-Token: <your-token>
  Content-Type: application/json
Body:
  {
    "templateId": 1,
    "kolId": 2,        // 可选
    "language": "en"   // 默认 en
  }
```

### 4. AI 改写
```http
POST /api/v1/ai/rewrite
Headers:
  X-Extension-Token: <your-token>
  Content-Type: application/json
Body:
  {
    "text": "content to rewrite",
    "tone": "professional",
    "language": "en",
    "preserveVariables": true
  }
```

## 技术实现

### 前端技术栈
- **框架**：Chrome Extension Manifest V3
- **UI**：原生 HTML/CSS/JavaScript
- **存储**：`chrome.storage.local`
- **权限**：`storage`, `activeTab`, `scripting`, `sidePanel`

### 后端技术栈
- **框架**：Express.js + TypeScript
- **ORM**：Prisma
- **认证**：Extension Token（X-Extension-Token header）
- **AI 服务**：智谱 AI API

### 文件结构
```
extension/
├── manifest.json              # 插件配置
├── side_panel.html            # 侧边栏 UI
├── popup.js                   # 前端逻辑（942 行）
├── background.js              # 后台服务（API 调用）
├── content-twitter-extractor.js  # Twitter DOM 提取
└── icons/                     # 插件图标
```

### 关键代码位置
- **模板搜索**：`popup.js:744-755` (templateSearchInput 事件)
- **KOL 搜索**：`popup.js:766-780` (kolSearchInput 事件)
- **AI 改写逻辑**：`popup.js:850-915` (copyTemplateBtn 点击事件)
- **API 调用**：`background.js:189-324` (getTemplates, previewTemplate, rewriteText)

## 更新日志

### v1.7.0 (2025-11-13)
- ✅ 新增模板复制功能
- ✅ 集成 AI 改写（4 种风格）
- ✅ 支持 KOL 变量自动替换
- ✅ 优化搜索体验（实时搜索 + 下拉选择）
