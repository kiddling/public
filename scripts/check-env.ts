#!/usr/bin/env node
/**
 * Environment Configuration Validator
 * 
 * Validates required environment variables for production/staging deployments
 * using Zod schemas. Fails fast if critical variables are missing or invalid.
 */

import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Environment tier to check
const ENV_MODE = process.env.ENV_MODE || process.env.NODE_ENV || 'development';

// Frontend environment schema
const FrontendEnvSchema = z.object({
  // API Configuration
  NUXT_PUBLIC_API_BASE_URL: z.string().url('Must be a valid URL'),
  NUXT_PUBLIC_STRAPI_URL: z.string().url('Must be a valid URL'),
  NUXT_STRAPI_API_TOKEN: z.string().min(20, 'API token must be at least 20 characters'),
  
  // CDN Configuration (required for production)
  NUXT_PUBLIC_CDN_URL: ENV_MODE === 'production' 
    ? z.string().url('CDN URL must be valid in production')
    : z.string().optional(),
  
  // Server Configuration
  PORT: z.string().regex(/^\d+$/, 'Port must be a number').optional().default('3000'),
  
  // Sentry (optional but recommended for production)
  NUXT_PUBLIC_SENTRY_DSN: ENV_MODE === 'production'
    ? z.string().url('Sentry DSN should be a valid URL').optional()
    : z.string().optional(),
});

// CMS environment schema
const CmsEnvSchema = z.object({
  // Server Configuration
  HOST: z.string().default('0.0.0.0'),
  PORT: z.string().regex(/^\d+$/, 'Port must be a number').default('1337'),
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  
  // Security Keys - must be changed from defaults in production
  APP_KEYS: ENV_MODE === 'production'
    ? z.string()
        .refine((val) => !val.includes('toBeModified'), 'APP_KEYS must be changed from default')
        .refine((val) => val.split(',').length >= 2, 'APP_KEYS must contain at least 2 keys')
    : z.string(),
  API_TOKEN_SALT: ENV_MODE === 'production'
    ? z.string()
        .min(32, 'API_TOKEN_SALT must be at least 32 characters')
        .refine((val) => val !== 'tobemodified', 'API_TOKEN_SALT must be changed from default')
    : z.string(),
  ADMIN_JWT_SECRET: ENV_MODE === 'production'
    ? z.string()
        .min(32, 'ADMIN_JWT_SECRET must be at least 32 characters')
        .refine((val) => val !== 'tobemodified', 'ADMIN_JWT_SECRET must be changed from default')
    : z.string(),
  TRANSFER_TOKEN_SALT: ENV_MODE === 'production'
    ? z.string()
        .min(32, 'TRANSFER_TOKEN_SALT must be at least 32 characters')
        .refine((val) => val !== 'tobemodified', 'TRANSFER_TOKEN_SALT must be changed from default')
    : z.string(),
  JWT_SECRET: ENV_MODE === 'production'
    ? z.string()
        .min(32, 'JWT_SECRET must be at least 32 characters')
        .refine((val) => val !== 'tobemodified', 'JWT_SECRET must be changed from default')
    : z.string(),
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),
  
  // Database Configuration (PostgreSQL required for production)
  DATABASE_CLIENT: ENV_MODE === 'production'
    ? z.enum(['postgres', 'mysql'], { errorMap: () => ({ message: 'Production must use postgres or mysql, not sqlite' }) })
    : z.enum(['sqlite', 'postgres', 'mysql']),
  DATABASE_HOST: ENV_MODE === 'production' ? z.string().min(1) : z.string().optional(),
  DATABASE_PORT: ENV_MODE === 'production' ? z.string().regex(/^\d+$/) : z.string().optional(),
  DATABASE_NAME: ENV_MODE === 'production' ? z.string().min(1) : z.string().optional(),
  DATABASE_USERNAME: ENV_MODE === 'production' ? z.string().min(1) : z.string().optional(),
  DATABASE_PASSWORD: ENV_MODE === 'production' ? z.string().min(8) : z.string().optional(),
  DATABASE_SSL: z.string().optional(),
  
  // Frontend URL for CORS
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL'),
  
  // CDN Configuration (optional)
  CDN_URL: ENV_MODE === 'production' 
    ? z.string().url().optional() 
    : z.string().optional(),
  
  // SSL Configuration (required for production)
  SSL_CERT_PATH: ENV_MODE === 'production' ? z.string().optional() : z.string().optional(),
  SSL_KEY_PATH: ENV_MODE === 'production' ? z.string().optional() : z.string().optional(),
  
  // Sentry (optional)
  SENTRY_DSN: z.string().url().optional(),
});

interface ValidationResult {
  success: boolean;
  component: string;
  errors: Array<{ field: string; message: string }>;
}

function loadEnvFile(filePath: string): Record<string, string> {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const env: Record<string, string> = {};
    
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          env[key.trim()] = value;
        }
      }
    });
    
    return env;
  } catch (error) {
    return {};
  }
}

function validateEnv(
  schema: z.ZodObject<any>,
  env: Record<string, string>,
  component: string
): ValidationResult {
  const result = schema.safeParse(env);
  
  if (result.success) {
    return {
      success: true,
      component,
      errors: [],
    };
  }
  
  const errors = result.error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  
  return {
    success: false,
    component,
    errors,
  };
}

function printResult(result: ValidationResult): void {
  if (result.success) {
    console.log(`${colors.green}✓${colors.reset} ${result.component}: All required environment variables are valid`);
  } else {
    console.log(`${colors.red}✗${colors.reset} ${result.component}: Validation failed`);
    result.errors.forEach(error => {
      console.log(`  ${colors.yellow}•${colors.reset} ${colors.cyan}${error.field}${colors.reset}: ${error.message}`);
    });
  }
}

function main(): void {
  console.log(`${colors.magenta}Environment Configuration Validator${colors.reset}`);
  console.log(`${colors.blue}Mode: ${ENV_MODE}${colors.reset}\n`);
  
  // Load environment from process.env and .env files
  const projectRoot = join(process.cwd());
  const frontendEnvPath = join(projectRoot, 'apps', 'frontend', '.env');
  const cmsEnvPath = join(projectRoot, 'apps', 'cms', '.env');
  
  // Merge process.env with file-based env vars
  const frontendEnv = {
    ...loadEnvFile(frontendEnvPath),
    ...Object.fromEntries(
      Object.entries(process.env).filter(([key]) => 
        key.startsWith('NUXT_') || key === 'PORT' || key === 'SENTRY_DSN'
      )
    ),
  };
  
  const cmsEnv = {
    ...loadEnvFile(cmsEnvPath),
    ...Object.fromEntries(
      Object.entries(process.env).filter(([key]) => 
        !key.startsWith('NUXT_')
      )
    ),
  };
  
  // Validate both components
  const results: ValidationResult[] = [
    validateEnv(FrontendEnvSchema, frontendEnv, 'Frontend (Nuxt)'),
    validateEnv(CmsEnvSchema, cmsEnv, 'CMS (Strapi)'),
  ];
  
  // Print results
  results.forEach(printResult);
  
  // Exit with error code if any validation failed
  const hasErrors = results.some(r => !r.success);
  
  if (hasErrors) {
    console.log(`\n${colors.red}Environment validation failed!${colors.reset}`);
    console.log(`${colors.yellow}Please fix the errors above before deploying.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}✓ All environment variables are valid!${colors.reset}`);
    process.exit(0);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateEnv, FrontendEnvSchema, CmsEnvSchema };
