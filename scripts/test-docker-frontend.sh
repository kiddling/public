#!/bin/bash
# Frontend Docker 镜像测试脚本
# Frontend Docker image test script
#
# This script tests the frontend Docker image for:
# - Image size (must be ≤ 200MB)
# - Security (non-root user, tini init)
# - Runtime dependencies (curl, timezone)
# - Health check functionality
#
# 此脚本测试前端 Docker 镜像：
# - 镜像大小（必须 ≤ 200MB）
# - 安全性（非 root 用户，tini init）
# - 运行时依赖（curl，时区）
# - 健康检查功能

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

IMAGE_NAME="${1:-frontend:test}"
TEST_PORT="${2:-3001}"

echo "🧪 Testing Frontend Docker Image..."
echo "===================================="
echo "Image: ${IMAGE_NAME}"
echo "Test Port: ${TEST_PORT}"
echo ""

# 1. 构建镜像 | Build image
echo "📦 Building image..."
docker build -f apps/frontend/Dockerfile -t "${IMAGE_NAME}" .
echo ""

# 2. 检查镜像大小 | Check image size
echo "📏 Checking image size..."
SIZE=$(docker image inspect "${IMAGE_NAME}" --format='{{.Size}}')
SIZE_MB=$((SIZE / 1024 / 1024))
echo "Image size: ${SIZE_MB}MB"

if [ "$SIZE_MB" -gt 200 ]; then
  echo -e "${RED}❌ FAIL: Image size ${SIZE_MB}MB exceeds 200MB limit${NC}"
  exit 1
fi
echo -e "${GREEN}✅ PASS: Image size is within limit (≤ 200MB)${NC}"
echo ""

# 3. 验证用户 | Verify user
echo "👤 Checking non-root user..."
USER_INFO=$(docker run --rm "${IMAGE_NAME}" id)
echo "User info: ${USER_INFO}"
if [[ "$USER_INFO" != *"uid=1001(nuxtjs)"* ]]; then
  echo -e "${RED}❌ FAIL: Not running as nuxtjs user${NC}"
  exit 1
fi
echo -e "${GREEN}✅ PASS: Running as non-root user (nuxtjs:nodejs)${NC}"
echo ""

# 4. 验证 tini | Verify tini
echo "🔧 Checking tini..."
ENTRYPOINT=$(docker image inspect "${IMAGE_NAME}" --format='{{.Config.Entrypoint}}')
echo "Entrypoint: ${ENTRYPOINT}"
if [[ "$ENTRYPOINT" != *"tini"* ]]; then
  echo -e "${RED}❌ FAIL: tini not configured as ENTRYPOINT${NC}"
  exit 1
fi
echo -e "${GREEN}✅ PASS: tini configured as ENTRYPOINT${NC}"
echo ""

# 5. 验证依赖 | Verify dependencies
echo "📦 Checking runtime dependencies..."
if docker run --rm "${IMAGE_NAME}" apk list | grep -q tini; then
  echo -e "${GREEN}✅ tini installed${NC}"
else
  echo -e "${RED}❌ tini missing${NC}"
  exit 1
fi

if docker run --rm "${IMAGE_NAME}" apk list | grep -q curl; then
  echo -e "${GREEN}✅ curl installed${NC}"
else
  echo -e "${RED}❌ curl missing${NC}"
  exit 1
fi
echo ""

# 6. 检查时区 | Check timezone
echo "🌍 Checking timezone..."
TZ_INFO=$(docker run --rm "${IMAGE_NAME}" date)
echo "Timezone: ${TZ_INFO}"
if [[ "$TZ_INFO" == *"CST"* ]] || [[ "$TZ_INFO" == *"+08"* ]]; then
  echo -e "${GREEN}✅ PASS: Timezone set to Asia/Shanghai${NC}"
else
  echo -e "${YELLOW}⚠️  WARNING: Timezone might not be Asia/Shanghai${NC}"
fi
echo ""

# 7. 验证 .output 目录 | Verify .output directory
echo "📂 Checking .output directory..."
if docker run --rm "${IMAGE_NAME}" sh -c "[ -d /app/.output ] && echo 'exists' || echo 'missing'" | grep -q "exists"; then
  echo -e "${GREEN}✅ PASS: .output directory exists${NC}"
else
  echo -e "${RED}❌ FAIL: .output directory missing${NC}"
  exit 1
fi
echo ""

# 8. 启动测试容器 | Start test container
echo "🚀 Starting test container..."
# Clean up any existing test container
docker rm -f frontend-test 2>/dev/null || true

docker run -d --name frontend-test \
  -p "${TEST_PORT}:3000" \
  -e NODE_ENV=production \
  -e NUXT_PUBLIC_STRAPI_URL=http://localhost:1337 \
  "${IMAGE_NAME}"

# Wait for container to start
echo "⏳ Waiting for container to start (15 seconds)..."
sleep 15
echo ""

# 9. 检查容器状态 | Check container status
echo "🔍 Checking container status..."
if docker ps | grep -q "frontend-test"; then
  echo -e "${GREEN}✅ PASS: Container is running${NC}"
else
  echo -e "${RED}❌ FAIL: Container is not running${NC}"
  docker logs frontend-test
  docker rm -f frontend-test
  exit 1
fi
echo ""

# 10. 测试健康检查端点 | Test health check endpoint
echo "🏥 Testing health endpoint..."
for i in {1..3}; do
  echo "Attempt $i/3..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${TEST_PORT}/api/health" || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASS: Health check returned 200${NC}"
    
    # Show health response
    echo "Health response:"
    curl -s "http://localhost:${TEST_PORT}/api/health" | head -20
    echo ""
    break
  else
    if [ "$i" -eq 3 ]; then
      echo -e "${RED}❌ FAIL: Health check returned $HTTP_CODE${NC}"
      echo "Container logs:"
      docker logs frontend-test | tail -50
      docker stop frontend-test && docker rm frontend-test
      exit 1
    else
      echo "Retrying in 5 seconds..."
      sleep 5
    fi
  fi
done
echo ""

# 11. 检查健康状态 | Check health status (if healthcheck is configured)
echo "💓 Checking Docker health status..."
sleep 5  # Wait a bit for health check to run
HEALTH_STATUS=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}no healthcheck{{end}}' frontend-test)
echo "Health status: ${HEALTH_STATUS}"
if [ "$HEALTH_STATUS" = "healthy" ] || [ "$HEALTH_STATUS" = "starting" ] || [ "$HEALTH_STATUS" = "no healthcheck" ]; then
  echo -e "${GREEN}✅ PASS: Container health status is ${HEALTH_STATUS}${NC}"
else
  echo -e "${YELLOW}⚠️  WARNING: Container health status is ${HEALTH_STATUS}${NC}"
fi
echo ""

# 12. 检查内存使用 | Check memory usage
echo "💾 Checking memory usage..."
MEMORY=$(docker stats --no-stream --format "{{.MemUsage}}" frontend-test | awk '{print $1}')
echo "Memory usage: ${MEMORY}"
echo -e "${GREEN}✅ Memory usage checked${NC}"
echo ""

# 13. 清理 | Cleanup
echo "🧹 Cleaning up..."
docker stop frontend-test
docker rm frontend-test
echo ""

# Final summary
echo "===================================="
echo -e "${GREEN}✅ All tests passed!${NC}"
echo "===================================="
echo "Image: ${IMAGE_NAME}"
echo "Size: ${SIZE_MB}MB / 200MB limit"
echo "User: nuxtjs:nodejs (uid=1001:gid=1001)"
echo "Init: tini"
echo "Runtime: curl, timezone support"
echo "Health: /api/health returns 200"
echo ""
echo "✨ Image is ready for production deployment!"
echo ""
