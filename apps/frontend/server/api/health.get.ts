/**
 * Health Check Endpoint for Nuxt Frontend
 * 
 * This endpoint is used by monitoring services (UptimeRobot, cloud monitoring, etc.)
 * to check if the Nuxt frontend service is healthy.
 * 
 * Endpoint: GET /api/health
 * 
 * Response format:
 * {
 *   "status": "ok" | "degraded" | "error",
 *   "timestamp": "2024-01-01T00:00:00.000Z",
 *   "service": "nuxt-frontend",
 *   "version": "1.0.0",
 *   "uptime": 123456,
 *   "environment": "production",
 *   "checks": {
 *     "cms": { "status": "ok", "responseTime": 50 }
 *   }
 * }
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  environment: string;
  checks?: {
    cms?: {
      status: 'ok' | 'error';
      responseTime?: number;
      error?: string;
    };
  };
}

export default defineEventHandler(async (event): Promise<HealthCheckResponse> => {
  const startTime = Date.now();
  
  // Get version from package.json
  let version = '1.0.0';
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    version = packageJson.version || '1.0.0';
  } catch (error) {
    // If package.json not found, use default version
  }

  // Basic health info
  const healthData: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'nuxt-frontend',
    version,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  // Check CMS connectivity (optional, can be disabled for faster response)
  const checkCms = event.node.req.url?.includes('full') || false;
  
  if (checkCms) {
    healthData.checks = {};
    
    try {
      const cmsUrl = process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const cmsCheckStart = Date.now();
      
      const response = await $fetch(`${cmsUrl}/cms/health`, {
        method: 'GET',
        timeout: 5000, // 5 second timeout
      });
      
      const responseTime = Date.now() - cmsCheckStart;
      
      healthData.checks.cms = {
        status: 'ok',
        responseTime,
      };
    } catch (error: any) {
      healthData.checks.cms = {
        status: 'error',
        error: error.message || 'CMS unreachable',
      };
      
      // Service is degraded if CMS is unreachable, but still operational
      healthData.status = 'degraded';
    }
  }

  // Set appropriate HTTP status code
  const statusCode = healthData.status === 'ok' ? 200 : healthData.status === 'degraded' ? 200 : 503;
  setResponseStatus(event, statusCode);

  return healthData;
});
