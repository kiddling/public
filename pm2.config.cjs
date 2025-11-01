/**
 * PM2 Process Manager Configuration
 * 
 * This configuration defines PM2 processes for:
 * - Nuxt 3 SSR Frontend
 * - Strapi CMS
 * 
 * Usage:
 *   Development:   pm2 start pm2.config.cjs --env dev
 *   Staging:       pm2 start pm2.config.cjs --env staging
 *   Production:    pm2 start pm2.config.cjs --env prod
 * 
 *   Start single:  pm2 start pm2.config.cjs --only=frontend
 *   Restart:       pm2 restart pm2.config.cjs
 *   Stop:          pm2 stop pm2.config.cjs
 *   Delete:        pm2 delete pm2.config.cjs
 *   Monitor:       pm2 monit
 *   Logs:          pm2 logs
 * 
 * Dry run (validation):
 *   pm2 start pm2.config.cjs --only=frontend --dry-run
 */

module.exports = {
  apps: [
    /**
     * Nuxt 3 Frontend Application (SSR)
     */
    {
      name: 'nuxt-frontend',
      script: '.output/server/index.mjs',
      cwd: './apps/frontend',
      instances: 'max', // 使用所有 CPU 核心 (cluster mode)
      exec_mode: 'cluster',
      
      // Auto-restart configuration
      autorestart: true,
      watch: false, // 生产环境禁用 watch
      max_memory_restart: '1G', // 内存超过 1GB 自动重启
      min_uptime: '10s', // 最小运行时间（防止频繁重启）
      max_restarts: 10, // 最大重启次数
      restart_delay: 4000, // 重启延迟 (ms)
      
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/pm2/nuxt-frontend-error.log',
      out_file: '/var/log/pm2/nuxt-frontend-out.log',
      log_file: '/var/log/pm2/nuxt-frontend-combined.log',
      merge_logs: true,
      
      // Environment variables - Development
      env_dev: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0',
        NUXT_PUBLIC_API_BASE_URL: 'http://localhost:1337',
        NUXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
      },
      
      // Environment variables - Staging
      env_staging: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        NUXT_PUBLIC_API_BASE_URL: 'https://staging-cms.example.com',
        NUXT_PUBLIC_STRAPI_URL: 'https://staging-cms.example.com',
      },
      
      // Environment variables - Production
      env_prod: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        NUXT_PUBLIC_API_BASE_URL: 'https://cms.example.com',
        NUXT_PUBLIC_STRAPI_URL: 'https://cms.example.com',
      },
      
      // Cluster mode configuration
      listen_timeout: 8000,
      kill_timeout: 5000,
      wait_ready: true,
      
      // Advanced features
      exp_backoff_restart_delay: 100, // 指数退避重启延迟
    },

    /**
     * Strapi CMS Application
     */
    {
      name: 'strapi-cms',
      script: 'node_modules/.bin/strapi',
      args: 'start',
      cwd: './apps/cms',
      instances: 1, // Strapi 通常以单实例运行
      exec_mode: 'fork',
      
      // Auto-restart configuration
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/pm2/strapi-cms-error.log',
      out_file: '/var/log/pm2/strapi-cms-out.log',
      log_file: '/var/log/pm2/strapi-cms-combined.log',
      merge_logs: true,
      
      // Environment variables - Development
      env_dev: {
        NODE_ENV: 'development',
        PORT: 1337,
        HOST: '0.0.0.0',
        APP_KEYS: 'dev-key-1,dev-key-2,dev-key-3,dev-key-4',
        API_TOKEN_SALT: 'dev-token-salt',
        ADMIN_JWT_SECRET: 'dev-admin-jwt-secret',
        TRANSFER_TOKEN_SALT: 'dev-transfer-token-salt',
        JWT_SECRET: 'dev-jwt-secret',
        DATABASE_CLIENT: 'better-sqlite3',
        DATABASE_FILENAME: '.tmp/data.db',
      },
      
      // Environment variables - Staging
      env_staging: {
        NODE_ENV: 'production',
        PORT: 1337,
        HOST: '0.0.0.0',
        // 以下敏感信息应从环境变量或密钥管理系统加载
        // APP_KEYS, API_TOKEN_SALT, etc. 应设置在服务器环境变量中
        DATABASE_CLIENT: 'postgres',
        DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
        DATABASE_PORT: process.env.DATABASE_PORT || 5432,
        DATABASE_NAME: process.env.DATABASE_NAME || 'strapi_staging',
        DATABASE_USERNAME: process.env.DATABASE_USERNAME || 'strapi',
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
        DATABASE_SSL: false,
      },
      
      // Environment variables - Production
      env_prod: {
        NODE_ENV: 'production',
        PORT: 1337,
        HOST: '0.0.0.0',
        // 以下敏感信息应从环境变量或密钥管理系统加载
        DATABASE_CLIENT: 'postgres',
        DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
        DATABASE_PORT: process.env.DATABASE_PORT || 5432,
        DATABASE_NAME: process.env.DATABASE_NAME || 'strapi',
        DATABASE_USERNAME: process.env.DATABASE_USERNAME || 'strapi',
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
        DATABASE_SSL: false,
        // OSS/COS 配置（如使用对象存储）
        OSS_ACCESS_KEY_ID: process.env.OSS_ACCESS_KEY_ID,
        OSS_ACCESS_KEY_SECRET: process.env.OSS_ACCESS_KEY_SECRET,
        OSS_REGION: process.env.OSS_REGION || 'oss-cn-hangzhou',
        OSS_BUCKET: process.env.OSS_BUCKET,
        OSS_BASE_URL: process.env.OSS_BASE_URL,
      },
      
      // Advanced features
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],

  /**
   * PM2 Deploy Configuration (Optional)
   * 
   * 配置 PM2 自动部署，支持多环境部署
   * 
   * Usage:
   *   Setup:    pm2 deploy pm2.config.cjs staging setup
   *   Deploy:   pm2 deploy pm2.config.cjs staging
   *   Revert:   pm2 deploy pm2.config.cjs staging revert 1
   */
  deploy: {
    // Staging environment
    staging: {
      user: 'deploy',
      host: ['staging.example.com'],
      ref: 'origin/staging',
      repo: 'git@github.com:your-org/your-repo.git',
      path: '/var/www/staging',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload pm2.config.cjs --env staging',
      'pre-setup': 'mkdir -p /var/log/pm2',
      ssh_options: 'StrictHostKeyChecking=no',
    },

    // Production environment
    production: {
      user: 'deploy',
      host: ['prod1.example.com', 'prod2.example.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/your-repo.git',
      path: '/var/www/production',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload pm2.config.cjs --env prod',
      'pre-setup': 'mkdir -p /var/log/pm2',
      ssh_options: 'StrictHostKeyChecking=no',
    },
  },
};
