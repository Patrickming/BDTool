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

### 3.1 创建 KOL

创建单个 KOL 记录。

**接口地址**: `POST /kols`

**认证**: 需要 Bearer Token

**请求头**:

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `username` | string | 是 | Twitter 用户名，1-15 字符，只能包含字母数字下划线 |
| `displayName` | string | 是 | 显示名，1-50 字符 |
| `twitterId` | string | 否 | Twitter ID |
| `bio` | string | 否 | 个人简介，最多 500 字符 |
| `followerCount` | number | 否 | 粉丝数，默认 0 |
| `followingCount` | number | 否 | 关注数，默认 0 |
| `verified` | boolean | 否 | 是否认证，默认 false |
| `profileImgUrl` | string | 否 | 头像 URL |
| `language` | string | 否 | 语言代码（2 字符 ISO 代码）|
| `lastTweetDate` | string | 否 | 最后推文日期（ISO 8601 格式）|
| `accountCreated` | string | 否 | 账户创建日期（ISO 8601 格式）|
| `contentCategory` | string | 否 | 内容分类：contract_trading, crypto_trading, web3, unknown |
| `status` | string | 否 | 状态：new, contacted, replied, negotiating, cooperating, rejected, not_interested |
| `customNotes` | string | 否 | 自定义备注，最多 1000 字符 |

**请求示例**:

```bash
curl -X POST http://localhost:3000/api/v1/kols \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "username": "elonmusk",
    "displayName": "Elon Musk",
    "bio": "Tesla, SpaceX, Twitter",
    "followerCount": 150000000,
    "verified": true,
    "contentCategory": "crypto_trading",
    "status": "new"
  }'
```

**成功响应** (201):

```json
{
  "success": true,
  "message": "KOL 创建成功",
  "data": {
    "id": 1,
    "username": "elonmusk",
    "displayName": "Elon Musk",
    "bio": "Tesla, SpaceX, Twitter",
    "followerCount": 150000000,
    "followingCount": 0,
    "verified": true,
    "profileImgUrl": null,
    "language": null,
    "lastTweetDate": null,
    "accountCreated": null,
    "qualityScore": 0,
    "contentCategory": "crypto_trading",
    "status": "new",
    "customNotes": null,
    "createdAt": "2025-11-06T15:00:00.000Z",
    "updatedAt": "2025-11-06T15:00:00.000Z"
  }
}
```

**错误响应**:

- `400` - 数据验证失败
- `400` - KOL @username 已存在
- `401` - 未认证

---

### 3.2 批量导入 KOL

批量导入 KOL，支持多种输入格式。

**接口地址**: `POST /kols/batch/import`

**认证**: 需要 Bearer Token

**请求头**:

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `inputs` | string[] | 是 | 用户名列表，1-100 个 |

**支持的输入格式**:
- `@username` - 带 @ 的用户名
- `username` - 纯用户名
- `https://twitter.com/username` - Twitter URL
- `https://x.com/username` - X.com URL

**请求示例**:

```bash
curl -X POST http://localhost:3000/api/v1/kols/batch/import \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": [
      "@elonmusk",
      "jack",
      "https://twitter.com/naval",
      "https://x.com/pmarca"
    ]
  }'
```

**成功响应** (200):

```json
{
  "success": true,
  "message": "批量导入完成",
  "data": {
    "success": 3,
    "failed": 0,
    "duplicate": 1,
    "errors": [],
    "imported": [
      {
        "id": 2,
        "username": "jack",
        "displayName": "jack",
        "status": "new",
        "createdAt": "2025-11-06T15:01:00.000Z"
      },
      {
        "id": 3,
        "username": "naval",
        "displayName": "naval",
        "status": "new",
        "createdAt": "2025-11-06T15:01:00.000Z"
      },
      {
        "id": 4,
        "username": "pmarca",
        "displayName": "pmarca",
        "status": "new",
        "createdAt": "2025-11-06T15:01:00.000Z"
      }
    ]
  }
}
```

**错误响应**:

- `400` - 数据验证失败
- `401` - 未认证

---

### 3.3 获取 KOL 列表

获取 KOL 列表，支持分页、搜索、筛选、排序。

**接口地址**: `GET /kols`

**认证**: 需要 Bearer Token

**请求头**:

```
Authorization: Bearer <your_jwt_token>
```

**查询参数**:

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `page` | number | 否 | 1 | 页码 |
| `limit` | number | 否 | 10 | 每页数量（1-100）|
| `search` | string | 否 | - | 搜索关键词（匹配用户名或显示名）|
| `status` | string | 否 | - | 状态筛选 |
| `contentCategory` | string | 否 | - | 内容分类筛选 |
| `minQualityScore` | number | 否 | - | 最小质量分（0-100）|
| `maxQualityScore` | number | 否 | - | 最大质量分（0-100）|
| `minFollowerCount` | number | 否 | - | 最小粉丝数 |
| `maxFollowerCount` | number | 否 | - | 最大粉丝数 |
| `verified` | boolean | 否 | - | 是否认证筛选 |
| `sortBy` | string | 否 | createdAt | 排序字段：createdAt, updatedAt, followerCount, qualityScore, username |
| `sortOrder` | string | 否 | desc | 排序方向：asc, desc |

**请求示例**:

```bash
# 基础查询
curl -X GET "http://localhost:3000/api/v1/kols?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 高级筛选
curl -X GET "http://localhost:3000/api/v1/kols?status=new&minFollowerCount=10000&maxFollowerCount=50000&sortBy=followerCount&sortOrder=desc" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (200):

```json
{
  "success": true,
  "message": "获取 KOL 列表成功",
  "data": {
    "kols": [
      {
        "id": 1,
        "username": "elonmusk",
        "displayName": "Elon Musk",
        "bio": "Tesla, SpaceX, Twitter",
        "followerCount": 150000000,
        "followingCount": 0,
        "verified": true,
        "profileImgUrl": null,
        "language": null,
        "lastTweetDate": null,
        "accountCreated": null,
        "qualityScore": 0,
        "contentCategory": "crypto_trading",
        "status": "new",
        "customNotes": null,
        "createdAt": "2025-11-06T15:00:00.000Z",
        "updatedAt": "2025-11-06T15:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 4,
      "totalPages": 1
    }
  }
}
```

**错误响应**:

- `400` - 查询参数验证失败
- `401` - 未认证

---

### 3.4 获取 KOL 详情

获取指定 KOL 的详细信息。

**接口地址**: `GET /kols/:id`

**认证**: 需要 Bearer Token

**请求头**:

```
Authorization: Bearer <your_jwt_token>
```

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | number | KOL ID |

**请求示例**:

```bash
curl -X GET http://localhost:3000/api/v1/kols/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (200):

```json
{
  "success": true,
  "message": "获取 KOL 详情成功",
  "data": {
    "id": 1,
    "username": "elonmusk",
    "displayName": "Elon Musk",
    "bio": "Tesla, SpaceX, Twitter",
    "twitterId": "44196397",
    "followerCount": 150000000,
    "followingCount": 100,
    "verified": true,
    "profileImgUrl": "https://pbs.twimg.com/profile_images/...",
    "language": "en",
    "lastTweetDate": "2025-11-06T14:30:00.000Z",
    "accountCreated": "2009-06-02T20:12:29.000Z",
    "qualityScore": 85,
    "contentCategory": "crypto_trading",
    "status": "new",
    "customNotes": "High priority target",
    "createdAt": "2025-11-06T15:00:00.000Z",
    "updatedAt": "2025-11-06T15:00:00.000Z"
  }
}
```

**错误响应**:

- `400` - 无效的 KOL ID
- `401` - 未认证
- `404` - KOL 不存在

---

### 3.5 更新 KOL 信息

更新指定 KOL 的信息。

**接口地址**: `PUT /kols/:id`

**认证**: 需要 Bearer Token

**请求头**:

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | number | KOL ID |

**请求参数**: （所有字段都是可选的）

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `username` | string | Twitter 用户名 |
| `displayName` | string | 显示名 |
| `twitterId` | string | Twitter ID |
| `bio` | string | 个人简介 |
| `followerCount` | number | 粉丝数 |
| `followingCount` | number | 关注数 |
| `verified` | boolean | 是否认证 |
| `profileImgUrl` | string | 头像 URL |
| `language` | string | 语言代码 |
| `lastTweetDate` | string | 最后推文日期 |
| `accountCreated` | string | 账户创建日期 |
| `qualityScore` | number | 质量分（0-100）|
| `contentCategory` | string | 内容分类 |
| `status` | string | 状态 |
| `customNotes` | string | 自定义备注 |

**请求示例**:

```bash
curl -X PUT http://localhost:3000/api/v1/kols/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "contacted",
    "customNotes": "Sent initial DM on 2025-11-06",
    "qualityScore": 85
  }'
```

**成功响应** (200):

```json
{
  "success": true,
  "message": "KOL 更新成功",
  "data": {
    "id": 1,
    "username": "elonmusk",
    "displayName": "Elon Musk",
    "bio": "Tesla, SpaceX, Twitter",
    "followerCount": 150000000,
    "followingCount": 100,
    "verified": true,
    "profileImgUrl": null,
    "language": "en",
    "lastTweetDate": "2025-11-06T14:30:00.000Z",
    "accountCreated": "2009-06-02T20:12:29.000Z",
    "qualityScore": 85,
    "contentCategory": "crypto_trading",
    "status": "contacted",
    "customNotes": "Sent initial DM on 2025-11-06",
    "createdAt": "2025-11-06T15:00:00.000Z",
    "updatedAt": "2025-11-06T16:00:00.000Z"
  }
}
```

**错误响应**:

- `400` - 无效的 KOL ID
- `400` - 数据验证失败
- `401` - 未认证
- `404` - KOL 不存在

---

### 3.6 删除 KOL

删除指定 KOL 及其关联数据。

**接口地址**: `DELETE /kols/:id`

**认证**: 需要 Bearer Token

**请求头**:

```
Authorization: Bearer <your_jwt_token>
```

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | number | KOL ID |

**请求示例**:

```bash
curl -X DELETE http://localhost:3000/api/v1/kols/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应** (200):

```json
{
  "success": true,
  "message": "KOL 删除成功",
  "data": null
}
```

**错误响应**:

- `400` - 无效的 KOL ID
- `401` - 未认证
- `404` - KOL 不存在

---

### 附：KOL 字段说明

#### 内容分类 (contentCategory)

| 值 | 说明 | 优先级 |
|---|------|--------|
| `contract_trading` | 合约交易分析 | 最高 |
| `crypto_trading` | 代币交易分析 | 高 |
| `web3` | Web3 通用内容 | 中 |
| `unknown` | 未分类 | 低 |

#### 状态 (status)

| 值 | 说明 | 颜色建议 |
|---|------|----------|
| `new` | 新添加 | 蓝色 |
| `contacted` | 已联系 | 橙色 |
| `replied` | 已回复 | 绿色 |
| `negotiating` | 协商中 | 紫色 |
| `cooperating` | 合作中 | 青色 |
| `rejected` | 已拒绝 | 红色 |
| `not_interested` | 不感兴趣 | 灰色 |

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

## 4. 模板管理模块 (Templates)

### 4.1 创建模板

创建一个新的消息模板。

**接口地址**: `POST /templates`

**认证**: 需要 Bearer Token

**请求体**:

```json
{
  "name": "初次联系模板",
  "category": "initial",
  "content": "Hello {{username}}!\n\nI'm {{my_name}} from {{exchange_name}}. I've been following your content and noticed you have {{follower_count}} followers.\n\nWould you be interested in collaborating with us?\n\nBest regards,\n{{my_name}}",
  "language": "en",
  "aiGenerated": false
}
```

**字段说明**:

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `name` | string | 是 | 模板名称（1-100字符） |
| `category` | string | 是 | 模板分类：`initial`, `followup`, `negotiation`, `collaboration`, `maintenance` |
| `content` | string | 是 | 模板内容（1-5000字符，支持变量） |
| `language` | string | 否 | 语言代码（2字符，默认 `en`） |
| `aiGenerated` | boolean | 否 | 是否 AI 生成（默认 `false`） |

**支持的变量**:

- **KOL 变量**: `{{username}}`, `{{display_name}}`, `{{follower_count}}`, `{{bio}}`, `{{profile_url}}`
- **用户变量**: `{{my_name}}`, `{{my_email}}`, `{{exchange_name}}`
- **系统变量**: `{{today}}`, `{{today_cn}}`

**成功响应** (201):

```json
{
  "success": true,
  "message": "模板创建成功",
  "data": {
    "id": 1,
    "name": "初次联系模板",
    "category": "initial",
    "content": "Hello {{username}}!...",
    "language": "en",
    "aiGenerated": false,
    "useCount": 0,
    "successCount": 0,
    "createdAt": "2025-11-07T07:20:24.611Z",
    "updatedAt": "2025-11-07T07:20:24.611Z"
  }
}
```

---

### 4.2 获取模板列表

获取当前用户的所有模板（分页、搜索、筛选、排序）。

**接口地址**: `GET /templates`

**认证**: 需要 Bearer Token

**查询参数**:

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `page` | number | 否 | 1 | 页码（>0） |
| `limit` | number | 否 | 20 | 每页数量（1-100） |
| `search` | string | 否 | - | 搜索关键词（匹配名称或内容） |
| `category` | string | 否 | - | 按分类筛选 |
| `language` | string | 否 | - | 按语言筛选 |
| `aiGenerated` | boolean | 否 | - | 按是否 AI 生成筛选 |
| `sortBy` | string | 否 | createdAt | 排序字段：`createdAt`, `updatedAt`, `useCount`, `name` |
| `sortOrder` | string | 否 | desc | 排序方向：`asc`, `desc` |

**请求示例**:

```bash
curl "http://localhost:3000/api/v1/templates?page=1&limit=10&category=initial&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**成功响应** (200):

```json
{
  "success": true,
  "message": "获取模板列表成功",
  "data": {
    "templates": [
      {
        "id": 1,
        "name": "初次联系模板",
        "category": "initial",
        "content": "Hello {{username}}!...",
        "language": "en",
        "aiGenerated": false,
        "useCount": 0,
        "successCount": 0,
        "createdAt": "2025-11-07T07:20:24.611Z",
        "updatedAt": "2025-11-07T07:20:24.611Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 4.3 获取模板详情

获取单个模板的详细信息。

**接口地址**: `GET /templates/:id`

**认证**: 需要 Bearer Token

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | number | 模板 ID |

**成功响应** (200):

```json
{
  "success": true,
  "message": "获取模板详情成功",
  "data": {
    "id": 1,
    "name": "初次联系模板",
    "category": "initial",
    "content": "Hello {{username}}!...",
    "language": "en",
    "aiGenerated": false,
    "useCount": 0,
    "successCount": 0,
    "createdAt": "2025-11-07T07:20:24.611Z",
    "updatedAt": "2025-11-07T07:20:24.611Z"
  }
}
```

**错误响应**:

- `400` - 无效的模板 ID
- `404` - 模板不存在

---

### 4.4 更新模板

更新现有模板的信息。

**接口地址**: `PUT /templates/:id`

**认证**: 需要 Bearer Token

**请求体** (所有字段可选):

```json
{
  "name": "初次联系模板（更新版）",
  "category": "followup",
  "content": "Hi {{display_name}}!...",
  "language": "zh",
  "aiGenerated": true
}
```

**成功响应** (200):

```json
{
  "success": true,
  "message": "模板更新成功",
  "data": {
    "id": 1,
    "name": "初次联系模板（更新版）",
    "category": "followup",
    "content": "Hi {{display_name}}!...",
    "language": "zh",
    "aiGenerated": true,
    "useCount": 0,
    "successCount": 0,
    "createdAt": "2025-11-07T07:20:24.611Z",
    "updatedAt": "2025-11-07T07:25:30.000Z"
  }
}
```

**错误响应**:

- `400` - 无效的模板 ID
- `404` - 模板不存在

---

### 4.5 删除模板

删除指定模板。

**接口地址**: `DELETE /templates/:id`

**认证**: 需要 Bearer Token

**成功响应** (200):

```json
{
  "success": true,
  "message": "模板删除成功",
  "data": null
}
```

**错误响应**:

- `400` - 无效的模板 ID
- `404` - 模板不存在

---

### 4.6 预览模板

预览模板内容（变量替换）。

**接口地址**: `POST /templates/preview`

**认证**: 需要 Bearer Token

**请求体**:

```json
{
  "templateId": 1,
  "content": "Hello {{username}}! I am {{my_name}} from {{exchange_name}}. Today is {{today}}.",
  "kolId": 5
}
```

**字段说明**:

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `templateId` | number | 否 | 模板 ID（提供则从数据库获取内容） |
| `content` | string | 是 | 模板内容（如不提供 templateId 则必填） |
| `kolId` | number | 否 | KOL ID（用于替换 KOL 相关变量） |

**成功响应** (200):

```json
{
  "success": true,
  "message": "模板预览生成成功",
  "data": {
    "originalContent": "Hello {{username}}! I am {{my_name}} from {{exchange_name}}. Today is {{today}}.",
    "previewContent": "Hello cryptotrader_pro! I am pdm from KCEX. Today is 2025-11-07.",
    "variables": {
      "{{username}}": "cryptotrader_pro",
      "{{display_name}}": "Crypto Trader Pro",
      "{{follower_count}}": "15,000",
      "{{bio}}": "Contract trading expert...",
      "{{profile_url}}": "https://twitter.com/cryptotrader_pro",
      "{{my_name}}": "pdm",
      "{{my_email}}": "patrickmingx@gmail.com",
      "{{exchange_name}}": "KCEX",
      "{{today}}": "2025-11-07",
      "{{today_cn}}": "2025年11月7日"
    }
  }
}
```

---

## 附录

### D. 模板分类

| 分类 | 英文 | 说明 |
|------|------|------|
| 初次联系 | `initial` | 首次向 KOL 发送的联系消息 |
| 跟进联系 | `followup` | 跟进之前的联系 |
| 价格谈判 | `negotiation` | 讨论合作价格和条件 |
| 合作细节 | `collaboration` | 商讨具体合作细节 |
| 关系维护 | `maintenance` | 维护长期合作关系 |

---

## 5. 分析统计模块 (Analytics)

### 5.1 获取概览统计

获取仪表板概览统计数据。

**接口地址**: `GET /analytics/overview`

**认证**: 需要 Bearer Token

**成功响应** (200):

```json
{
  "success": true,
  "message": "概览统计获取成功",
  "data": {
    "totalKols": 9,
    "newKolsThisWeek": 9,
    "contactedThisWeek": 0,
    "overallResponseRate": 0,
    "weeklyResponseRate": 0,
    "activePartnerships": 0,
    "pendingFollowups": 0
  }
}
```

**数据说明**:
- `totalKols`: 总 KOL 数
- `newKolsThisWeek`: 本周新增 KOL 数
- `contactedThisWeek`: 本周联系数
- `overallResponseRate`: 总体响应率 (%)
- `weeklyResponseRate`: 本周响应率 (%)
- `activePartnerships`: 活跃合作数 (状态为 cooperating)
- `pendingFollowups`: 待跟进数 (已联系或已回复，且最后联系超过3天)

---

### 5.2 获取 KOL 分布数据

获取 KOL 在各维度的分布统计。

**接口地址**: `GET /analytics/distributions`

**认证**: 需要 Bearer Token

**成功响应** (200):

```json
{
  "success": true,
  "message": "KOL 分布数据获取成功",
  "data": {
    "byFollowerCount": [
      {"range": "1k-5k", "count": 0},
      {"range": "5k-10k", "count": 1},
      {"range": "10k-30k", "count": 5},
      {"range": "30k-50k", "count": 0}
    ],
    "byQualityScore": [
      {"level": "高质量", "count": 2},
      {"level": "良好", "count": 5},
      {"level": "一般", "count": 2},
      {"level": "较差", "count": 0}
    ],
    "byContentCategory": [
      {"category": "crypto_trading", "count": 7},
      {"category": "contract_trading", "count": 2}
    ],
    "byStatus": [
      {"status": "new", "count": 9}
    ]
  }
}
```

**分布维度**:
- `byFollowerCount`: 按粉丝数分布 (1k-5k, 5k-10k, 10k-30k, 30k-50k)
- `byQualityScore`: 按质量分分布 (高质量 85+, 良好 75-84, 一般 65-74, 较差 <65)
- `byContentCategory`: 按内容分类分布
- `byStatus`: 按状态分布

---

### 5.3 获取模板效果统计

获取所有模板的使用效果分析。

**接口地址**: `GET /analytics/templates`

**认证**: 需要 Bearer Token

**成功响应** (200):

```json
{
  "success": true,
  "message": "模板效果统计获取成功",
  "data": [
    {
      "id": 4,
      "name": "打招呼",
      "category": "initial",
      "useCount": 0,
      "responseCount": 0,
      "responseRate": 0,
      "avgResponseTime": null
    }
  ]
}
```

**数据说明**:
- `useCount`: 使用次数
- `responseCount`: 成功响应次数
- `responseRate`: 响应率 (%)
- `avgResponseTime`: 平均响应时间 (小时)

---

### 5.4 获取联系时间线

获取指定天数内的联系趋势数据。

**接口地址**: `GET /analytics/timeline`

**认证**: 需要 Bearer Token

**查询参数**:

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `days` | number | 否 | 30 | 查询天数（1-90）|

**请求示例**:

```bash
curl "http://localhost:3000/api/v1/analytics/timeline?days=7" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**成功响应** (200):

```json
{
  "success": true,
  "message": "联系时间线获取成功",
  "data": [
    {"date": "2025-10-07", "contactsCount": 0, "responsesCount": 0},
    {"date": "2025-10-08", "contactsCount": 0, "responsesCount": 0},
    {"date": "2025-10-09", "contactsCount": 0, "responsesCount": 0}
  ]
}
```

**数据说明**:
- `date`: 日期 (YYYY-MM-DD)
- `contactsCount`: 当天联系数
- `responsesCount`: 当天响应数

**错误响应**:

- `400` - 天数参数必须在 1-90 之间

---

**最后更新**: 2025-11-07
**版本**: v1.2.0
