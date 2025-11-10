#!/bin/bash

# Translation API 测试脚本

echo "=== Testing Translation API ==="
echo ""

# 1. 获取认证令牌
echo "1. Getting authentication token..."
LOGIN_RESPONSE=$(NO_PROXY=localhost,127.0.0.1 curl -s -X POST "http://127.0.0.1:3000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-translation@test.com","password":"Test1234","fullName":"Translation Tester"}')

if echo "$LOGIN_RESPONSE" | grep -q "用户已存在"; then
  # 如果用户已存在,则登录
  echo "User already exists, logging in..."
  LOGIN_RESPONSE=$(NO_PROXY=localhost,127.0.0.1 curl -s -X POST "http://127.0.0.1:3000/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test-translation@test.com","password":"Test1234"}')
fi

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token. Response:"
  echo "$LOGIN_RESPONSE" | python3 -m json.tool
  exit 1
fi

echo "✓ Got token"
echo ""

# 2. 测试翻译服务状态
echo "2. Testing GET /api/v1/translation/status"
NO_PROXY=localhost,127.0.0.1 curl -s -X GET "http://127.0.0.1:3000/api/v1/translation/status" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# 3. 测试翻译接口 (不配置 API key 的情况下应该返回 503)
echo "3. Testing POST /api/v1/translation/translate (without API key)"
NO_PROXY=localhost,127.0.0.1 curl -s -X POST "http://127.0.0.1:3000/api/v1/translation/translate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello World","targetLanguage":"zh"}' | python3 -m json.tool
echo ""

# 4. 测试语言检测
echo "4. Testing POST /api/v1/translation/detect (without API key)"
NO_PROXY=localhost,127.0.0.1 curl -s -X POST "http://127.0.0.1:3000/api/v1/translation/detect" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello World"}' | python3 -m json.tool
echo ""

# 5. 测试批量翻译
echo "5. Testing POST /api/v1/translation/batch (without API key)"
NO_PROXY=localhost,127.0.0.1 curl -s -X POST "http://127.0.0.1:3000/api/v1/translation/batch" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"texts":["Hello","World"],"targetLanguage":"zh"}' | python3 -m json.tool
echo ""

echo "=== Test Complete ==="
