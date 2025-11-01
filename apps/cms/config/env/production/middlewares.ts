/**
 * Production Middleware Configuration
 * 
 * Security-hardened middleware setup for production:
 * - Enhanced CSP (Content Security Policy)
 * - Strict CORS with environment-based origins
 * - Rate limiting for API protection
 * - Frame protection
 * - Referrer policy
 */

export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
          'style-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'cdn.jsdelivr.net',
            'strapi.io',
            ...(process.env.CDN_URL ? [process.env.CDN_URL] : []),
          ],
          'font-src': ["'self'", 'data:', 'cdn.jsdelivr.net'],
          'connect-src': [
            "'self'",
            'https:',
            ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
          ],
          'frame-src': ["'self'"],
          'frame-ancestors': ["'self'"],
          'object-src': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
      },
      // Prevent clickjacking
      frameguard: {
        action: 'sameorigin',
      },
      // Strict referrer policy
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
      // HSTS (HTTP Strict Transport Security)
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      // Prevent MIME type sniffing
      noSniff: true,
      // XSS filter
      xssFilter: true,
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(',').map((url: string) => url.trim())
        : ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      credentials: true,
      maxAge: 86400, // 24 hours
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'strapi::throttle',
    config: {
      max: 100, // Maximum 100 requests
      interval: 60000, // Per 60 seconds (1 minute)
      delayAfter: 50, // Start delaying responses after 50 requests
      timeWait: 3000, // Delay 3 seconds per request after threshold
      whitelist: [
        // Health check endpoint
        '/_health',
        // Metrics endpoint
        '/_metrics',
      ],
    },
  },
];
