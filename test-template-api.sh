#!/bin/bash

# Test Template API
# Remove proxy settings
unset http_proxy
unset https_proxy
unset HTTP_PROXY
unset HTTPS_PROXY

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoicGF0cmlja21pbmd4QGdtYWlsLmNvbSIsInJvbGUiOiJtZW1iZXIiLCJpYXQiOjE3NjI0OTk0MzYsImV4cCI6MTc2MzEwNDIzNiwiYXVkIjoia29sLWJkLXRvb2wtdXNlcnMiLCJpc3MiOiJrb2wtYmQtdG9vbCJ9.9CWlJFzIg6l8-j_5gsY5Po7BAA_x12cPJIzgaBlm7CU"

echo "=== 测试 1: 创建模板 ==="
curl --noproxy "*" -X POST http://localhost:3000/api/v1/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "测试模板",
    "category": "initial",
    "content": "Hello {{username}}!\n\nI am {{my_name}} from {{exchange_name}}.",
    "language": "en"
  }'
echo -e "\n"

echo "=== 测试 2: 获取模板列表 ==="
curl --noproxy "*" "http://localhost:3000/api/v1/templates?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== 测试 3: 获取模板详情 ==="
curl --noproxy "*" http://localhost:3000/api/v1/templates/1 \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== 测试 4: 预览模板（不带 KOL）==="
curl --noproxy "*" -X POST http://localhost:3000/api/v1/templates/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Hello {{username}}! I am {{my_name}} from {{exchange_name}}. Today is {{today}}."
  }'
echo -e "\n"

echo "=== 测试 5: 更新模板 ==="
curl --noproxy "*" -X PUT http://localhost:3000/api/v1/templates/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "测试模板（已更新）",
    "content": "Hi {{display_name}}! This is an updated template from {{my_name}}."
  }'
echo -e "\n"
