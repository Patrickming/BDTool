#!/bin/bash

# Bypass proxy for localhost
export NO_PROXY=localhost,127.0.0.1

# Test script for Analytics API
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoicGF0cmlja21pbmd4QGdtYWlsLmNvbSIsInJvbGUiOiJtZW1iZXIiLCJpYXQiOjE3NjI0OTk0MzYsImV4cCI6MTc2MzEwNDIzNiwiYXVkIjoia29sLWJkLXRvb2wtdXNlcnMiLCJpc3MiOiJrb2wtYmQtdG9vbCJ9.9CWlJFzIg6l8-j_5gsY5Po7BAA_x12cPJIzgaBlm7CU"
BASE_URL="http://127.0.0.1:3000/api/v1"

echo "=== Testing Analytics API ==="
echo ""

echo "1. Test GET /api/v1/analytics/overview"
curl -s -X GET "$BASE_URL/analytics/overview" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

echo "2. Test GET /api/v1/analytics/distributions"
curl -s -X GET "$BASE_URL/analytics/distributions" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

echo "3. Test GET /api/v1/analytics/templates"
curl -s -X GET "$BASE_URL/analytics/templates" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

echo "4. Test GET /api/v1/analytics/timeline?days=30"
curl -s -X GET "$BASE_URL/analytics/timeline?days=30" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

echo "=== All tests completed ==="
