#!/usr/bin/env tsx

import { config } from 'dotenv'
import { z } from 'zod'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment files in order of precedence
const envFiles = [resolve(process.cwd(), '.env'), resolve(process.cwd(), '.env.production')]

envFiles.forEach((file) => {
  if (existsSync(file)) {
    config({ path: file, override: false })
  }
})

// === Utility Functions ===

interface ValidationError {
  field: string
  messageEn: string
  messageCn: string
  hint?: string
}

function createError(
  field: string,
  messageEn: string,
  messageCn: string,
  hint?: string
): ValidationError {
  return { field, messageEn, messageCn, hint }
}

function printErrors(errors: ValidationError[], scope: string): void {
  console.error(`\n❌ ${scope} Environment Validation Failed / ${scope}环境变量验证失败\n`)

  errors.forEach((error) => {
    console.error(`\n🔴 Field / 字段: ${error.field}`)
    console.error(`   EN: ${error.messageEn}`)
    console.error(`   CN: ${error.messageCn}`)
    if (error.hint) {
      console.error(`   💡 Hint / 提示: ${error.hint}`)
    }
  })

  console.error('\n')
}

// === Strapi/CMS Schema ===

const StrapiEnvSchema = z
  .object({
    // Server Configuration
    HOST: z.string().default('0.0.0.0'),
    PORT: z.string().regex(/^\d+$/).default('1337'),

    // Security Keys (REQUIRED)
    APP_KEYS: z
      .string()
      .min(1, 'APP_KEYS is required')
      .refine((val) => !val.includes('toBeModified') && !val.includes('tobemodified'), {
        message: 'APP_KEYS must be changed from default values',
      }),
    API_TOKEN_SALT: z
      .string()
      .min(1, 'API_TOKEN_SALT is required')
      .refine((val) => !val.includes('toBeModified') && !val.includes('tobemodified'), {
        message: 'API_TOKEN_SALT must be changed from default values',
      }),
    ADMIN_JWT_SECRET: z
      .string()
      .min(1, 'ADMIN_JWT_SECRET is required')
      .refine((val) => !val.includes('toBeModified') && !val.includes('tobemodified'), {
        message: 'ADMIN_JWT_SECRET must be changed from default values',
      }),
    TRANSFER_TOKEN_SALT: z
      .string()
      .min(1, 'TRANSFER_TOKEN_SALT is required')
      .refine((val) => !val.includes('toBeModified') && !val.includes('tobemodified'), {
        message: 'TRANSFER_TOKEN_SALT must be changed from default values',
      }),
    JWT_SECRET: z
      .string()
      .min(1, 'JWT_SECRET is required')
      .refine((val) => !val.includes('toBeModified') && !val.includes('tobemodified'), {
        message: 'JWT_SECRET must be changed from default values',
      }),
    ENCRYPTION_KEY: z.string().optional(),

    // Database Configuration
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

    // CORS & Security
    CLIENT_URL: z
      .string()
      .url()
      .or(z.string().regex(/^https?:\/\/.+/))
      .default('http://localhost:3000'),
    SECURITY_CORS_ORIGIN: z.string().optional(),
    SECURITY_CORS_ENABLED: z.string().optional(),
    SECURITY_CORS_CREDENTIALS: z.string().optional(),

    // Security Headers
    SECURITY_HSTS_ENABLED: z.string().optional(),
    SECURITY_HSTS_MAX_AGE: z.string().optional(),
    SECURITY_CSP_ENABLED: z.string().optional(),
    SECURITY_FRAME_GUARD: z.string().optional(),
    SECURITY_XSS_FILTER: z.string().optional(),

    // Rate Limiting
    SECURITY_RATE_LIMIT_ENABLED: z.string().optional(),
    SECURITY_RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
    SECURITY_RATE_LIMIT_WINDOW_MS: z.string().optional(),
    SECURITY_API_RATE_LIMIT_ENABLED: z.string().optional(),
    SECURITY_API_RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
    SECURITY_API_RATE_LIMIT_WINDOW_MS: z.string().optional(),
  })
  .refine(
    (data) => {
      // If using postgres or mysql, require database connection details
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
      // If using sqlite, require filename
      if (data.DATABASE_CLIENT === 'sqlite' || data.DATABASE_CLIENT === 'better-sqlite3') {
        return !!data.DATABASE_FILENAME
      }
      return true
    },
    {
      message: 'Database connection details required for the selected DATABASE_CLIENT',
    }
  )

// === Nuxt/Frontend Schema ===

const NuxtEnvSchema = z.object({
  // Strapi API Configuration (REQUIRED)
  NUXT_PUBLIC_STRAPI_URL: z
    .string()
    .url()
    .or(z.string().regex(/^https?:\/\/.+/)),
  NUXT_STRAPI_API_TOKEN: z.string().min(1, 'NUXT_STRAPI_API_TOKEN is required'),
  NUXT_PUBLIC_API_BASE_URL: z
    .string()
    .url()
    .or(z.string().regex(/^https?:\/\/.+/)),

  // Server Configuration
  PORT: z.string().regex(/^\d+$/).optional(),

  // CDN Configuration
  NUXT_PUBLIC_CDN_URL: z.string().optional(),

  // Security Configuration
  NUXT_PUBLIC_SECURITY_ENFORCE_HTTPS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_HSTS_ENABLED: z.string().optional(),
  NUXT_PUBLIC_SECURITY_HSTS_MAX_AGE: z.string().optional(),
  NUXT_PUBLIC_SECURITY_HSTS_INCLUDE_SUBDOMAINS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_HSTS_PRELOAD: z.string().optional(),

  // CSP Configuration
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

  // Other Security Headers
  NUXT_PUBLIC_SECURITY_X_FRAME_OPTIONS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_REFERRER_POLICY: z.string().optional(),
  NUXT_PUBLIC_SECURITY_PERMISSIONS_POLICY: z.string().optional(),
  NUXT_PUBLIC_SECURITY_X_CONTENT_TYPE_OPTIONS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_X_XSS_PROTECTION: z.string().optional(),
  NUXT_PUBLIC_SECURITY_SECURE_COOKIES: z.string().optional(),

  // Rate Limiting
  NUXT_PUBLIC_SECURITY_RATE_LIMIT_ENABLED: z.string().optional(),
  NUXT_PUBLIC_SECURITY_RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_RATE_LIMIT_WINDOW_MS: z.string().optional(),
  NUXT_PUBLIC_SECURITY_RATE_LIMIT_SKIP_PATHS: z.string().optional(),

  // Web Vitals
  NUXT_PUBLIC_ENABLE_VITALS_TELEMETRY: z.string().optional(),
  NUXT_PUBLIC_VITALS_SAMPLING_RATE: z.string().optional(),
  NUXT_PUBLIC_VITALS_RATE_LIMIT: z.string().optional(),
  NUXT_PUBLIC_ENABLE_VITALS_FORWARDING: z.string().optional(),
})

// === Validation Logic ===

function validateStrapiEnv(): ValidationError[] {
  const errors: ValidationError[] = []

  try {
    StrapiEnvSchema.parse(process.env)
    console.log('✅ Strapi/CMS environment validation passed / Strapi/CMS 环境变量验证通过')
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        const field = err.path.join('.')

        if (err.code === 'invalid_type' && err.received === 'undefined') {
          errors.push(
            createError(
              field,
              `Missing required field: ${field}`,
              `缺少必需字段: ${field}`,
              'Check .env.example for required Strapi variables / 请检查 .env.example 中的必需 Strapi 变量'
            )
          )
        } else if (err.message.includes('must be changed from default')) {
          errors.push(
            createError(
              field,
              `${field} contains default/placeholder values and must be changed`,
              `${field} 包含默认/占位值，必须修改`,
              'Generate secure values using: openssl rand -base64 32 / 使用以下命令生成安全值: openssl rand -base64 32'
            )
          )
        } else if (err.code === 'invalid_enum_value') {
          errors.push(
            createError(
              field,
              `Invalid value for ${field}: ${err.received}. Expected one of: ${err.options.join(', ')}`,
              `${field} 的值无效: ${err.received}。期望值之一: ${err.options.join(', ')}`
            )
          )
        } else {
          errors.push(createError(field, err.message, `验证失败: ${err.message}`))
        }
      })
    } else {
      errors.push(createError('UNKNOWN', 'Unknown validation error', '未知验证错误'))
    }
  }

  return errors
}

function validateNuxtEnv(): ValidationError[] {
  const errors: ValidationError[] = []

  try {
    NuxtEnvSchema.parse(process.env)
    console.log('✅ Nuxt/Frontend environment validation passed / Nuxt/Frontend 环境变量验证通过')
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        const field = err.path.join('.')

        if (err.code === 'invalid_type' && err.received === 'undefined') {
          errors.push(
            createError(
              field,
              `Missing required field: ${field}`,
              `缺少必需字段: ${field}`,
              'Check apps/frontend/.env.example for required Nuxt variables / 请检查 apps/frontend/.env.example 中的必需 Nuxt 变量'
            )
          )
        } else if (err.code === 'invalid_string') {
          errors.push(
            createError(
              field,
              `Invalid format for ${field}: ${err.message}`,
              `${field} 格式无效: ${err.message}`,
              err.validation === 'url'
                ? 'Must be a valid URL (e.g., http://localhost:1337) / 必须是有效的 URL (例如: http://localhost:1337)'
                : undefined
            )
          )
        } else {
          errors.push(createError(field, err.message, `验证失败: ${err.message}`))
        }
      })
    } else {
      errors.push(createError('UNKNOWN', 'Unknown validation error', '未知验证错误'))
    }
  }

  return errors
}

// === Main Execution ===

function main() {
  console.log('\n🔍 Validating environment variables... / 验证环境变量中...\n')

  const args = process.argv.slice(2)
  const validateStrapi = args.includes('--strapi') || args.includes('--all') || args.length === 0
  const validateNuxt = args.includes('--nuxt') || args.includes('--all') || args.length === 0

  let hasErrors = false

  if (validateStrapi) {
    const strapiErrors = validateStrapiEnv()
    if (strapiErrors.length > 0) {
      printErrors(strapiErrors, 'Strapi/CMS')
      hasErrors = true
    }
  }

  if (validateNuxt) {
    const nuxtErrors = validateNuxtEnv()
    if (nuxtErrors.length > 0) {
      printErrors(nuxtErrors, 'Nuxt/Frontend')
      hasErrors = true
    }
  }

  if (hasErrors) {
    console.error('❌ Environment validation failed. Please fix the errors above.')
    console.error('❌ 环境变量验证失败。请修复上述错误。\n')
    console.error('📚 Documentation / 文档:')
    console.error('   - .env.example - Root environment template / 根环境模板')
    console.error('   - apps/frontend/.env.example - Frontend environment template / 前端环境模板')
    console.error('   - apps/cms/.env.example - CMS environment template / CMS 环境模板')
    console.error('   - README.md - Setup instructions / 设置说明\n')
    process.exit(1)
  }

  console.log('✅ All environment validations passed! / 所有环境变量验证通过！\n')
  process.exit(0)
}

main()
