# API 文档

KOL BD Tool 后端 API 接口文档。

## 基础信息

- **Base URL**: `http://localhost:3000/api/v1`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: JWT Bearer Token

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "message": "操作成功的消息",
  "data": {
    // 响应数据
  }
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误消息"
}
```

### 验证错误响应

```json
{
  "success": false,
  "message": "数据验证失败",
  "errors": [
    {
      "code": "invalid_string",
      "message": "请输入有效的邮箱地址",
      "path": ["email"]
    }
  ]
}
```

## 状态码

| 状态码 | 说明 |
|--------|------|
| `200` | 请求成功 |
| `201` | 创建成功 |
| `400` | 请求参数错误 |
| `401` | 未授权（未登录或 Token 无效）|
| `403` | 禁止访问（权限不足）|
| `404` | 资源不存在 |
| `409` | 冲突（如邮箱已存在）|
| `500` | 服务器内部错误 |

---

## 1. 认证模块 (Auth)

### 1.1 用户注册

创建新用户账户。

**接口地址**: `POST /auth/register`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `email` | string | 是 | 邮箱地址，5-255 字符 |
| `password` | string | 是 | 密码，8-128 字符，必须包含大小写字母和数字 |
| `fullName` | string | 是 | 姓名，2-100 字符 |

**请求示例**:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "fullName": "张三"
  }'
```

**成功响应** (201):

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "张三",
      "role": "member"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误响应**:

- `400` - 数据验证失败
- `400` - 该邮箱已被注册

---

### 1.2 用户登录

使用邮箱和密码登录。

**接口地址**: `POST /auth/login`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `email` | string | 是 | 邮箱地址 |
| `password` | string | 是 | 密码 |

**请求示例**:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**成功响应** (200):

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "张三",
      "role": "member"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误响应**:

- `400` - 数据验证失败
- `401` - 邮箱或密码错误
- `401` - 账户已被禁用，请联系管理员

---

### 1.3 获取当前用户信息

获取已登录用户的详细信息。

**接口地址**: `GET /auth/me`

**认证**: 需要 Bearer Token

**请求头**:

```
Authorization: Bearer <your_jwt_token>
```

**请求示例**:

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (200):

```json
{
  "success": true,
  "message": "获取用户信息成功",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "张三",
    "role": "member",
    "isActive": true,
    "createdAt": "2025-11-06T10:30:00.000Z",
    "updatedAt": "2025-11-06T10:30:00.000Z"
  }
}
```

**错误响应**:

- `401` - 缺少 Authorization Header
- `401` - Token 无效或过期
- `401` - 用户不存在

---

## 2. 用户管理模块 (Users)

### 2.1 获取所有用户列表

获取所有用户列表（分页、搜索）。仅管理员可访问。

**接口地址**: `GET /users`

**认证**: 需要 Bearer Token（管理员权限）

**请求头**:

```
Authorization: Bearer <your_jwt_token>
```

**查询参数**:

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `page` | number | 否 | 1 | 页码 |
| `limit` | number | 否 | 10 | 每页数量 |
| `search` | string | 否 | - | 搜索关键词（匹配邮箱或姓名）|

**请求示例**:

```bash
curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10&search=zhang" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (200):

```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "fullName": "张三",
      "role": "admin",
      "createdAt": "2025-11-06T10:30:00.000Z",
      "updatedAt": "2025-11-06T10:30:00.000Z"
    },
    {
      "id": 2,
      "email": "member@example.com",
      "fullName": "李四",
      "role": "member",
      "createdAt": "2025-11-06T11:00:00.000Z",
      "updatedAt": "2025-11-06T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

**错误响应**:

- `401` - 未认证
- `403` - 需要管理员权限

---

### 2.2 获取单个用户信息

获取指定用户的详细信息。管理员或用户本人可访问。

**接口地址**: `GET /users/:id`

**认证**: 需要 Bearer Token（管理员或本人）

**请求头**:

```
Authorization: Bearer <your_jwt_token>
```

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | number | 用户 ID |

**请求示例**:

```bash
curl -X GET http://localhost:3000/api/v1/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (200):

```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "张三",
  "role": "admin",
  "createdAt": "2025-11-06T10:30:00.000Z",
  "updatedAt": "2025-11-06T10:30:00.000Z"
}
```

**错误响应**:

- `400` - 无效的用户 ID
- `401` - 未认证
- `403` - 没有权限访问此资源
- `404` - 用户不存在

---

### 2.3 更新用户信息

更新指定用户的信息。管理员或用户本人可访问。普通用户不能修改自己的角色。

**接口地址**: `PUT /users/:id`

**认证**: 需要 Bearer Token（管理员或本人）

**请求头**:

```
Authorization: Bearer <your_jwt_token>
```

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | number | 用户 ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `fullName` | string | 否 | 姓名，2-100 字符 |
| `email` | string | 否 | 邮箱地址 |
| `role` | string | 否 | 角色（仅管理员可修改）|

**请求示例**:

```bash
curl -X PUT http://localhost:3000/api/v1/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "张三丰",
    "email": "newemail@example.com"
  }'
```

**成功响应** (200):

```json
{
  "id": 1,
  "email": "newemail@example.com",
  "fullName": "张三丰",
  "role": "admin",
  "createdAt": "2025-11-06T10:30:00.000Z",
  "updatedAt": "2025-11-06T12:00:00.000Z"
}
```

**错误响应**:

- `400` - 无效的用户 ID
- `400` - 数据验证失败
- `400` - 该邮箱已被使用
- `401` - 未认证
- `403` - 没有权限访问此资源
- `403` - 没有权限修改用户角色
- `404` - 用户不存在

---

### 2.4 删除用户

删除指定用户。仅管理员可访问，不能删除自己。

**接口地址**: `DELETE /users/:id`

**认证**: 需要 Bearer Token（管理员权限）

**请求头**:

```
Authorization: Bearer <your_jwt_token>
```

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | number | 用户 ID |

**请求示例**:

```bash
curl -X DELETE http://localhost:3000/api/v1/users/2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (200):

```json
{
  "message": "用户已删除"
}
```

**错误响应**:

- `400` - 无效的用户 ID
- `400` - 不能删除自己的账户
- `401` - 未认证
- `403` - 需要管理员权限
- `404` - 用户不存在

---

## 3. KOL 管理模块 (KOLs)

**待实现**

将包含以下功能:
- `GET /kols` - 获取 KOL 列表（支持筛选、搜索、分页）
- `POST /kols` - 创建 KOL
- `GET /kols/:id` - 获取 KOL 详情
- `PUT /kols/:id` - 更新 KOL
- `DELETE /kols/:id` - 删除 KOL
- `POST /kols/:id/calculate-score` - 计算 KOL 质量评分

---

## 4. 模板管理模块 (Templates)

**待实现**

将包含以下功能:
- `GET /templates` - 获取模板列表
- `POST /templates` - 创建模板
- `GET /templates/:id` - 获取模板详情
- `PUT /templates/:id` - 更新模板
- `DELETE /templates/:id` - 删除模板
- `POST /templates/generate` - AI 生成模板

---

## 5. 联系记录模块 (Contacts)

**待实现**

将包含以下功能:
- `GET /contacts` - 获取联系记录列表
- `POST /contacts` - 创建联系记录
- `GET /contacts/:id` - 获取联系记录详情
- `PUT /contacts/:id` - 更新联系记录
- `DELETE /contacts/:id` - 删除联系记录

---

## 附录

### A. JWT Token 说明

- **有效期**: 7 天（可在 `.env` 中配置）
- **格式**: `Bearer <token>`
- **使用方式**: 在请求头中添加 `Authorization: Bearer <token>`

### B. 密码要求

- 长度: 8-128 字符
- 必须包含:
  - 至少一个大写字母 (A-Z)
  - 至少一个小写字母 (a-z)
  - 至少一个数字 (0-9)

### C. 用户角色

| 角色 | 说明 | 权限 |
|------|------|------|
| `admin` | 管理员 | 所有权限 |
| `member` | 普通成员 | 基础功能 |

---

**最后更新**: 2025-11-06
**版本**: v1.0.0
