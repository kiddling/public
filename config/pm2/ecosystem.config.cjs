/**
 * PM2 Ecosystem Configuration
 * 
 * Process management configuration for Nuxt frontend and Strapi CMS.
 * 
 * Usage:
 *   pm2 start ecosystem.config.cjs                    # Start all processes
 *   pm2 start ecosystem.config.cjs --only frontend    # Start frontend only
 *   pm2 start ecosystem.config.cjs --only cms         # Start CMS only
 *   pm2 start ecosystem.config.cjs --env production   # Start in production mode
 *   pm2 reload ecosystem.config.cjs                   # Reload all processes
 *   pm2 stop ecosystem.config.cjs                     # Stop all processes
 *   pm2 delete ecosystem.config.cjs                   # Delete all processes
 *   pm2 logs                                          # View logs
 *   pm2 monit                                         # Monitor processes
 * 
 * For more information: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    {
      // Nuxt Frontend Application
      name: 'frontend',
      script: '.output/server/index.mjs',
      cwd: './apps/frontend',
      instances: process.env.PM2_FRONTEND_INSTANCES || 2,
      exec_mode: 'cluster',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0',
        NUXT_PUBLIC_API_BASE_URL: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:1337',
        NUXT_PUBLIC_STRAPI_URL: process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
        NUXT_STRAPI_URL: process.env.NUXT_STRAPI_URL || 'http://localhost:1337',
        NUXT_STRAPI_API_TOKEN: process.env.NUXT_STRAPI_API_TOKEN || '',
      },
      
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.FRONTEND_PORT || 3000,
        HOST: '0.0.0.0',
        NUXT_PUBLIC_API_BASE_URL: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:1337',
        NUXT_PUBLIC_STRAPI_URL: process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
        NUXT_STRAPI_URL: process.env.NUXT_STRAPI_URL || 'http://localhost:1337',
        NUXT_STRAPI_API_TOKEN: process.env.NUXT_STRAPI_API_TOKEN || '',
      },
      
      // Logging
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      autorestart: true,
      watch: false,
      
      // Advanced features
      max_memory_restart: '1G',
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Monitoring
      instance_var: 'INSTANCE_ID',
      
      // Health check
      health_check_interval: 30000,
      health_check_grace_period: 10000,
    },
    
    {
      // Strapi CMS Application
      name: 'cms',
      script: './node_modules/.bin/strapi',
      args: 'start',
      cwd: './apps/cms',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        PORT: 1337,
        APP_KEYS: process.env.APP_KEYS || '',
        API_TOKEN_SALT: process.env.API_TOKEN_SALT || '',
        ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || '',
        TRANSFER_TOKEN_SALT: process.env.TRANSFER_TOKEN_SALT || '',
        JWT_SECRET: process.env.JWT_SECRET || '',
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
        DATABASE_CLIENT: process.env.DATABASE_CLIENT || 'postgres',
        DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
        DATABASE_PORT: process.env.DATABASE_PORT || 5432,
        DATABASE_NAME: process.env.DATABASE_NAME || 'strapi',
        DATABASE_USERNAME: process.env.DATABASE_USERNAME || 'strapi',
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || '',
        DATABASE_SSL: process.env.DATABASE_SSL || 'false',
      },
      
      env_production: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: process.env.CMS_PORT || 1337,
        APP_KEYS: process.env.APP_KEYS || '',
        API_TOKEN_SALT: process.env.API_TOKEN_SALT || '',
        ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || '',
        TRANSFER_TOKEN_SALT: process.env.TRANSFER_TOKEN_SALT || '',
        JWT_SECRET: process.env.JWT_SECRET || '',
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
        DATABASE_CLIENT: process.env.DATABASE_CLIENT || 'postgres',
        DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
        DATABASE_PORT: process.env.DATABASE_PORT || 5432,
        DATABASE_NAME: process.env.DATABASE_NAME || 'strapi',
        DATABASE_USERNAME: process.env.DATABASE_USERNAME || 'strapi',
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || '',
        DATABASE_SSL: process.env.DATABASE_SSL || 'false',
      },
      
      // Logging
      error_file: './logs/cms-error.log',
      out_file: './logs/cms-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      autorestart: true,
      watch: false,
      
      // Advanced features
      max_memory_restart: '1G',
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Health check
      health_check_interval: 30000,
      health_check_grace_period: 10000,
    },
  ],
  
  /**
   * Deployment configuration
   * 
   * Example deployment to production server:
   *   pm2 deploy ecosystem.config.cjs production setup
   *   pm2 deploy ecosystem.config.cjs production
   */
  deploy: {
    production: {
      user: process.env.DEPLOY_USER || 'deploy',
      host: process.env.DEPLOY_HOST || 'production.example.com',
      ref: 'origin/main',
      repo: process.env.DEPLOY_REPO || 'git@github.com:username/repo.git',
      path: process.env.DEPLOY_PATH || '/var/www/production',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.cjs --env production',
      env: {
        NODE_ENV: 'production',
      },
    },
    
    staging: {
      user: process.env.DEPLOY_USER || 'deploy',
      host: process.env.DEPLOY_HOST_STAGING || 'staging.example.com',
      ref: 'origin/develop',
      repo: process.env.DEPLOY_REPO || 'git@github.com:username/repo.git',
      path: process.env.DEPLOY_PATH_STAGING || '/var/www/staging',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.cjs',
      env: {
        NODE_ENV: 'staging',
      },
    },
  },
};
