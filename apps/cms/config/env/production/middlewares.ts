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
          'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'connect-src': ["'self'", process.env.SECURITY_CORS_ORIGIN || 'http://localhost:3000'],
          'font-src': ["'self'", 'data:'],
          'object-src': ["'none'"],
          'media-src': ["'self'"],
          'frame-src': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
          'frame-ancestors': ["'none'"],
          'upgrade-insecure-requests': process.env.SECURITY_CSP_ENABLED !== 'false' ? [] : null,
        },
      },
      hsts: {
        enabled: process.env.SECURITY_HSTS_ENABLED !== 'false',
        maxAge: parseInt(process.env.SECURITY_HSTS_MAX_AGE || '31536000'),
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        enabled: process.env.SECURITY_FRAME_GUARD !== 'false',
        action: 'deny',
      },
      xssFilter: {
        enabled: process.env.SECURITY_XSS_FILTER !== 'false',
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: process.env.SECURITY_CORS_ENABLED !== 'false',
      origin: (process.env.SECURITY_CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim()),
      credentials: process.env.SECURITY_CORS_CREDENTIALS !== 'false',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'X-Frame-Options'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  {
    name: 'strapi::session',
    config: {
      cookie: {
        secure: process.env.SECURITY_SECURE_COOKIES !== 'false',
        sameSite: process.env.SECURITY_SAME_SITE || 'strict',
        httpOnly: true,
      },
    },
  },
  'strapi::favicon',
  'strapi::public',
  {
    name: 'global::rate-limit',
    config: {
      enabled: process.env.SECURITY_RATE_LIMIT_ENABLED !== 'false',
      max: parseInt(process.env.SECURITY_RATE_LIMIT_MAX_REQUESTS || '100'),
      duration: parseInt(process.env.SECURITY_RATE_LIMIT_WINDOW_MS || '60000'),
      skipPaths: ['/admin', '/_health'],
    },
  },
  {
    name: 'global::api-rate-limit',
    config: {
      enabled: process.env.SECURITY_API_RATE_LIMIT_ENABLED !== 'false',
      max: parseInt(process.env.SECURITY_API_RATE_LIMIT_MAX_REQUESTS || '1000'),
      duration: parseInt(process.env.SECURITY_API_RATE_LIMIT_WINDOW_MS || '60000'),
      skipPaths: ['/admin', '/_health'],
    },
  },
];
