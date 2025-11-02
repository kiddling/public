#!/bin/bash
# Generate Strapi Security Keys
# 生成 Strapi 安全密钥
#
# Usage | 使用方法:
#   bash scripts/generate-strapi-keys.sh
#
# This will output all required Strapi security keys
# 此脚本将输出所有必需的 Strapi 安全密钥

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Strapi Security Keys Generator                                ║"
echo "║  Strapi 安全密钥生成器                                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Generated on: $(date)"
echo "生成时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "⚠️  IMPORTANT | 重要提示:"
echo "   - Copy these keys to your .env.docker file"
echo "   - 将这些密钥复制到你的 .env.docker 文件中"
echo "   - Never commit these keys to version control"
echo "   - 切勿将这些密钥提交到版本控制系统"
echo "   - Keep them secure and private"
echo "   - 妥善保管这些密钥"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Generate APP_KEYS (4 keys comma-separated)
APP_KEY_1=$(openssl rand -base64 32)
APP_KEY_2=$(openssl rand -base64 32)
APP_KEY_3=$(openssl rand -base64 32)
APP_KEY_4=$(openssl rand -base64 32)

echo "# Strapi Security Keys | Strapi 安全密钥"
echo "# Add these to your .env.docker file | 将这些添加到你的 .env.docker 文件"
echo ""
echo "APP_KEYS=${APP_KEY_1},${APP_KEY_2},${APP_KEY_3},${APP_KEY_4}"
echo ""
echo "API_TOKEN_SALT=$(openssl rand -base64 32)"
echo "ADMIN_JWT_SECRET=$(openssl rand -base64 32)"
echo "TRANSFER_TOKEN_SALT=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "✅ Keys generated successfully!"
echo "✅ 密钥生成成功！"
echo ""
echo "Next steps | 后续步骤:"
echo "1. Copy the keys above to your .env.docker file"
echo "   将上面的密钥复制到 .env.docker 文件"
echo "2. Verify all keys are set correctly"
echo "   验证所有密钥设置正确"
echo "3. Restart your Strapi container"
echo "   重启 Strapi 容器"
echo ""
