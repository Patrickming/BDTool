#!/bin/bash

# 测试插件模板功能的 API
TOKEN="fd8add44a70815a1c03c731f8eb3b3c08b0e0673153b9c1b4c5c5e134cd5595a"

echo "=== 测试插件模板功能 ==="
echo ""

echo "1. 测试获取模板列表"
curl -s -X GET "http://127.0.0.1:3000/api/v1/templates?page=1&limit=5" \
  -H "X-Extension-Token: $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool | head -40

echo ""
echo "2. 测试获取 KOL 列表"
curl -s -X GET "http://127.0.0.1:3000/api/v1/kols?page=1&limit=5" \
  -H "X-Extension-Token: $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool | head -40

echo ""
echo "3. 测试预览模板（不选择 KOL - 保留占位符）"
curl -s -X POST "http://127.0.0.1:3000/api/v1/templates/preview" \
  -H "X-Extension-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": 1,
    "language": "en"
  }' | python3 -m json.tool

echo ""
echo "4. 测试预览模板（选择 KOL - 替换占位符）"
curl -s -X POST "http://127.0.0.1:3000/api/v1/templates/preview" \
  -H "X-Extension-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": 1,
    "language": "en",
    "kolId": 1
  }' | python3 -m json.tool

echo ""
echo "5. 测试 AI 改写"
curl -s -X POST "http://127.0.0.1:3000/api/v1/ai/rewrite" \
  -H "X-Extension-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello {{username}}, I am from KCEX.",
    "tone": "professional",
    "language": "en",
    "preserveVariables": true
  }' | python3 -m json.tool
