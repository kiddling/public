/**
 * Production Server Configuration
 * 
 * Security-hardened server setup for production:
 * - HTTPS enforcement
 * - Proxy trust for load balancers
 * - Secure cookies
 * - Custom admin path (optional)
 */

export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  
  // Production URL - must be HTTPS
  url: env('PUBLIC_URL', 'https://api.yourdomain.com'),
  
  // Trust proxy headers (for load balancers, reverse proxies)
  proxy: true,
  
  // App configuration
  app: {
    keys: env.array('APP_KEYS', []),
  },
  
  // Admin panel configuration
  admin: {
    // Custom admin path (more secure than default /admin)
    path: env('ADMIN_PATH', '/admin'),
    
    // Build configuration
    build: {
      backend: env('ADMIN_BACKEND_URL', env('PUBLIC_URL')),
    },
    
    // Secure admin URL
    url: env('ADMIN_URL', '/admin'),
    
    // Auto-open admin panel on start (disabled in production)
    autoOpen: false,
    
    // Watchdog (disabled in production for performance)
    watchIgnoreFiles: [
      '**/config/sync/**',
      '**/*.db*',
    ],
  },
  
  // Cron configuration (disabled by default, enable as needed)
  cron: {
    enabled: false,
  },
  
  // Webhook configuration
  webhooks: {
    // Timeout for webhook requests
    timeout: 10000,
    
    // Populate relations in webhook payloads
    populateRelations: true,
  },
  
  // Transfer configuration
  transfer: {
    remote: {
      enabled: true,
    },
  },
  
  // Cookie configuration (secure in production)
  session: {
    cookie: {
      httpOnly: true,
      secure: true, // Only send cookies over HTTPS
      sameSite: 'strict',
      maxAge: 86400000, // 24 hours
    },
  },
  
  // Security headers
  security: {
    // Enforce HTTPS
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },
  
  // Logger configuration
  logger: {
    level: 'info',
    requests: true,
  },
});
