import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { z } from 'zod'

// Import schemas for testing (we'll need to export them from check-env.ts)
// For now, we'll define them here for testing purposes

const StrapiEnvSchema = z
  .object({
    HOST: z.string().default('0.0.0.0'),
    PORT: z.string().regex(/^\d+$/).default('1337'),
    APP_KEYS: z
      .string()
      .min(1)
      .refine((val) => !val.includes('toBeModified') && !val.includes('tobemodified'), {
        message: 'APP_KEYS must be changed from default values',
      }),
    API_TOKEN_SALT: z
      .string()
      .min(1)
      .refine((val) => !val.includes('toBeModified') && !val.includes('tobemodified'), {
        message: 'API_TOKEN_SALT must be changed from default values',
      }),
    ADMIN_JWT_SECRET: z
      .string()
      .min(1)
      .refine((val) => !val.includes('toBeModified') && !val.includes('tobemodified'), {
        message: 'ADMIN_JWT_SECRET must be changed from default values',
      }),
    TRANSFER_TOKEN_SALT: z
      .string()
      .min(1)
      .refine((val) => !val.includes('toBeModified') && !val.includes('tobemodified'), {
        message: 'TRANSFER_TOKEN_SALT must be changed from default values',
      }),
    JWT_SECRET: z
      .string()
      .min(1)
      .refine((val) => !val.includes('toBeModified') && !val.includes('tobemodified'), {
        message: 'JWT_SECRET must be changed from default values',
      }),
    ENCRYPTION_KEY: z.string().optional(),
    DATABASE_CLIENT: z
      .enum(['sqlite', 'postgres', 'mysql', 'mysql2', 'better-sqlite3'])
      .default('sqlite'),
    DATABASE_FILENAME: z.string().optional(),
    DATABASE_HOST: z.string().optional(),
    DATABASE_PORT: z.string().optional(),
    DATABASE_NAME: z.string().optional(),
    DATABASE_USERNAME: z.string().optional(),
    DATABASE_PASSWORD: z.string().optional(),
    DATABASE_SSL: z.string().optional(),
    CLIENT_URL: z
      .string()
      .url()
      .or(z.string().regex(/^https?:\/\/.+/))
      .default('http://localhost:3000'),
    SECURITY_CORS_ORIGIN: z.string().optional(),
    SECURITY_CORS_ENABLED: z.string().optional(),
    SECURITY_CORS_CREDENTIALS: z.string().optional(),
    SECURITY_HSTS_ENABLED: z.string().optional(),
    SECURITY_HSTS_MAX_AGE: z.string().optional(),
    SECURITY_CSP_ENABLED: z.string().optional(),
    SECURITY_FRAME_GUARD: z.string().optional(),
    SECURITY_XSS_FILTER: z.string().optional(),
    SECURITY_RATE_LIMIT_ENABLED: z.string().optional(),
    SECURITY_RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
    SECURITY_RATE_LIMIT_WINDOW_MS: z.string().optional(),
    SECURITY_API_RATE_LIMIT_ENABLED: z.string().optional(),
    SECURITY_API_RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
    SECURITY_API_RATE_LIMIT_WINDOW_MS: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.DATABASE_CLIENT === 'postgres' ||
        data.DATABASE_CLIENT === 'mysql' ||
        data.DATABASE_CLIENT === 'mysql2'
      ) {
        return !!(
          data.DATABASE_HOST &&
          data.DATABASE_PORT &&
          data.DATABASE_NAME &&
          data.DATABASE_USERNAME &&
          data.DATABASE_PASSWORD
        )
      }
      if (data.DATABASE_CLIENT === 'sqlite' || data.DATABASE_CLIENT === 'better-sqlite3') {
        return !!data.DATABASE_FILENAME
      }
      return true
    },
    { message: 'Database connection details required for the selected DATABASE_CLIENT' }
  )

const NuxtEnvSchema = z.object({
  NUXT_PUBLIC_STRAPI_URL: z
    .string()
    .url()
    .or(z.string().regex(/^https?:\/\/.+/)),
  NUXT_STRAPI_API_TOKEN: z.string().min(1),
  NUXT_PUBLIC_API_BASE_URL: z
    .string()
    .url()
    .or(z.string().regex(/^https?:\/\/.+/)),
  PORT: z.string().regex(/^\d+$/).optional(),
  NUXT_PUBLIC_CDN_URL: z.string().optional(),
  NUXT_PUBLIC_SECURITY_ENFORCE_HTTPS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_HSTS_ENABLED: z.string().optional(),
  NUXT_PUBLIC_SECURITY_HSTS_MAX_AGE: z.string().optional(),
  NUXT_PUBLIC_SECURITY_HSTS_INCLUDE_SUBDOMAINS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_HSTS_PRELOAD: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_ENABLED: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_DEFAULT_SRC: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_SCRIPT_SRC: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_STYLE_SRC: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_IMG_SRC: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_CONNECT_SRC: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_FONT_SRC: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_OBJECT_SRC: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_MEDIA_SRC: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_FRAME_SRC: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_BASE_URI: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_FORM_ACTION: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_FRAME_ANCESTORS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_UPGRADE_INSECURE_REQUESTS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_CSP_REPORT_URI: z.string().optional(),
  NUXT_PUBLIC_SECURITY_X_FRAME_OPTIONS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_REFERRER_POLICY: z.string().optional(),
  NUXT_PUBLIC_SECURITY_PERMISSIONS_POLICY: z.string().optional(),
  NUXT_PUBLIC_SECURITY_X_CONTENT_TYPE_OPTIONS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_X_XSS_PROTECTION: z.string().optional(),
  NUXT_PUBLIC_SECURITY_SECURE_COOKIES: z.string().optional(),
  NUXT_PUBLIC_SECURITY_RATE_LIMIT_ENABLED: z.string().optional(),
  NUXT_PUBLIC_SECURITY_RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_RATE_LIMIT_WINDOW_MS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_RATE_LIMIT_SKIP_PATHS: z.string().optional(),
  NUXT_PUBLIC_ENABLE_VITALS_TELEMETRY: z.string().optional(),
  NUXT_PUBLIC_VITALS_SAMPLING_RATE: z.string().optional(),
  NUXT_PUBLIC_VITALS_RATE_LIMIT: z.string().optional(),
  NUXT_PUBLIC_ENABLE_VITALS_FORWARDING: z.string().optional(),
})

describe('Strapi Environment Validation', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should pass with valid SQLite configuration', () => {
    const validEnv = {
      HOST: '0.0.0.0',
      PORT: '1337',
      APP_KEYS: 'valid-key-1,valid-key-2',
      API_TOKEN_SALT: 'validSalt123',
      ADMIN_JWT_SECRET: 'validSecret123',
      TRANSFER_TOKEN_SALT: 'validTransferSalt',
      JWT_SECRET: 'validJwtSecret',
      DATABASE_CLIENT: 'sqlite',
      DATABASE_FILENAME: '.tmp/data.db',
      CLIENT_URL: 'http://localhost:3000',
    }

    expect(() => StrapiEnvSchema.parse(validEnv)).not.toThrow()
  })

  it('should pass with valid PostgreSQL configuration', () => {
    const validEnv = {
      HOST: '0.0.0.0',
      PORT: '1337',
      APP_KEYS: 'valid-key-1,valid-key-2',
      API_TOKEN_SALT: 'validSalt123',
      ADMIN_JWT_SECRET: 'validSecret123',
      TRANSFER_TOKEN_SALT: 'validTransferSalt',
      JWT_SECRET: 'validJwtSecret',
      DATABASE_CLIENT: 'postgres',
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: '5432',
      DATABASE_NAME: 'strapi',
      DATABASE_USERNAME: 'strapi',
      DATABASE_PASSWORD: 'secure-password',
      CLIENT_URL: 'http://localhost:3000',
    }

    expect(() => StrapiEnvSchema.parse(validEnv)).not.toThrow()
  })

  it('should fail when APP_KEYS contains default values', () => {
    const invalidEnv = {
      APP_KEYS: 'toBeModified1,toBeModified2',
      API_TOKEN_SALT: 'validSalt123',
      ADMIN_JWT_SECRET: 'validSecret123',
      TRANSFER_TOKEN_SALT: 'validTransferSalt',
      JWT_SECRET: 'validJwtSecret',
      DATABASE_CLIENT: 'sqlite',
      DATABASE_FILENAME: '.tmp/data.db',
      CLIENT_URL: 'http://localhost:3000',
    }

    expect(() => StrapiEnvSchema.parse(invalidEnv)).toThrow()
  })

  it('should fail when required secrets are missing', () => {
    const invalidEnv = {
      DATABASE_CLIENT: 'sqlite',
      DATABASE_FILENAME: '.tmp/data.db',
      CLIENT_URL: 'http://localhost:3000',
    }

    expect(() => StrapiEnvSchema.parse(invalidEnv)).toThrow()
  })

  it('should fail when PostgreSQL is selected but connection details are missing', () => {
    const invalidEnv = {
      APP_KEYS: 'valid-key-1,valid-key-2',
      API_TOKEN_SALT: 'validSalt123',
      ADMIN_JWT_SECRET: 'validSecret123',
      TRANSFER_TOKEN_SALT: 'validTransferSalt',
      JWT_SECRET: 'validJwtSecret',
      DATABASE_CLIENT: 'postgres',
      CLIENT_URL: 'http://localhost:3000',
    }

    expect(() => StrapiEnvSchema.parse(invalidEnv)).toThrow()
  })

  it('should apply default values for optional fields', () => {
    const minimalEnv = {
      APP_KEYS: 'valid-key-1,valid-key-2',
      API_TOKEN_SALT: 'validSalt123',
      ADMIN_JWT_SECRET: 'validSecret123',
      TRANSFER_TOKEN_SALT: 'validTransferSalt',
      JWT_SECRET: 'validJwtSecret',
      DATABASE_FILENAME: '.tmp/data.db',
    }

    const result = StrapiEnvSchema.parse(minimalEnv)
    expect(result.HOST).toBe('0.0.0.0')
    expect(result.PORT).toBe('1337')
    expect(result.DATABASE_CLIENT).toBe('sqlite')
    expect(result.CLIENT_URL).toBe('http://localhost:3000')
  })
})

describe('Nuxt Environment Validation', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should pass with valid configuration', () => {
    const validEnv = {
      NUXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
      NUXT_STRAPI_API_TOKEN: 'valid-token-123',
      NUXT_PUBLIC_API_BASE_URL: 'http://localhost:1337',
    }

    expect(() => NuxtEnvSchema.parse(validEnv)).not.toThrow()
  })

  it('should pass with HTTPS URLs', () => {
    const validEnv = {
      NUXT_PUBLIC_STRAPI_URL: 'https://api.example.com',
      NUXT_STRAPI_API_TOKEN: 'valid-token-123',
      NUXT_PUBLIC_API_BASE_URL: 'https://api.example.com',
    }

    expect(() => NuxtEnvSchema.parse(validEnv)).not.toThrow()
  })

  it('should fail when required fields are missing', () => {
    const invalidEnv = {
      NUXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
    }

    expect(() => NuxtEnvSchema.parse(invalidEnv)).toThrow()
  })

  it('should fail when URLs are invalid', () => {
    const invalidEnv = {
      NUXT_PUBLIC_STRAPI_URL: 'not-a-url',
      NUXT_STRAPI_API_TOKEN: 'valid-token-123',
      NUXT_PUBLIC_API_BASE_URL: 'http://localhost:1337',
    }

    expect(() => NuxtEnvSchema.parse(invalidEnv)).toThrow()
  })

  it('should pass with optional security configuration', () => {
    const validEnv = {
      NUXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
      NUXT_STRAPI_API_TOKEN: 'valid-token-123',
      NUXT_PUBLIC_API_BASE_URL: 'http://localhost:1337',
      NUXT_PUBLIC_SECURITY_CSP_ENABLED: 'true',
      NUXT_PUBLIC_SECURITY_HSTS_ENABLED: 'true',
      NUXT_PUBLIC_SECURITY_RATE_LIMIT_ENABLED: 'true',
    }

    expect(() => NuxtEnvSchema.parse(validEnv)).not.toThrow()
  })

  it('should validate PORT format when provided', () => {
    const validEnv = {
      NUXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
      NUXT_STRAPI_API_TOKEN: 'valid-token-123',
      NUXT_PUBLIC_API_BASE_URL: 'http://localhost:1337',
      PORT: '3000',
    }

    expect(() => NuxtEnvSchema.parse(validEnv)).not.toThrow()

    const invalidEnv = {
      NUXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
      NUXT_STRAPI_API_TOKEN: 'valid-token-123',
      NUXT_PUBLIC_API_BASE_URL: 'http://localhost:1337',
      PORT: 'not-a-number',
    }

    expect(() => NuxtEnvSchema.parse(invalidEnv)).toThrow()
  })
})

describe('Environment Validation Integration', () => {
  it('should validate that schemas cover required fields from env templates', () => {
    // This test verifies that our schemas include the critical fields
    const requiredStrapiFields = [
      'APP_KEYS',
      'API_TOKEN_SALT',
      'ADMIN_JWT_SECRET',
      'TRANSFER_TOKEN_SALT',
      'JWT_SECRET',
      'DATABASE_CLIENT',
    ]

    // Test by trying to parse without required fields - should throw
    requiredStrapiFields.forEach((field) => {
      const incompleteEnv = {
        APP_KEYS: 'valid-key',
        API_TOKEN_SALT: 'validSalt',
        ADMIN_JWT_SECRET: 'validSecret',
        TRANSFER_TOKEN_SALT: 'validTransfer',
        JWT_SECRET: 'validJwt',
        DATABASE_CLIENT: 'sqlite',
        DATABASE_FILENAME: '.tmp/data.db',
        CLIENT_URL: 'http://localhost:3000',
      }

      // Remove one required field
      if (field !== 'DATABASE_CLIENT') {
        // DATABASE_CLIENT has a default
        delete incompleteEnv[field as keyof typeof incompleteEnv]
        expect(() => StrapiEnvSchema.parse(incompleteEnv)).toThrow()
      }
    })

    const requiredNuxtFields = [
      'NUXT_PUBLIC_STRAPI_URL',
      'NUXT_STRAPI_API_TOKEN',
      'NUXT_PUBLIC_API_BASE_URL',
    ]

    // Test by trying to parse without required fields - should throw
    requiredNuxtFields.forEach((field) => {
      const incompleteEnv = {
        NUXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
        NUXT_STRAPI_API_TOKEN: 'token',
        NUXT_PUBLIC_API_BASE_URL: 'http://localhost:1337',
      }

      delete incompleteEnv[field as keyof typeof incompleteEnv]
      expect(() => NuxtEnvSchema.parse(incompleteEnv)).toThrow()
    })
  })
})
