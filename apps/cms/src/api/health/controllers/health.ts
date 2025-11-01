/**
 * Health Check Controller for Strapi CMS
 * 
 * This endpoint is used by monitoring services (UptimeRobot, cloud monitoring, etc.)
 * to check if the Strapi CMS service is healthy.
 * 
 * Endpoint: GET /cms/health
 * 
 * Response format:
 * {
 *   "status": "ok" | "degraded" | "error",
 *   "timestamp": "2024-01-01T00:00:00.000Z",
 *   "service": "strapi-cms",
 *   "version": "5.29.0",
 *   "uptime": 123456,
 *   "environment": "production",
 *   "database": {
 *     "status": "connected" | "error",
 *     "responseTime": 5,
 *     "error": "error message if failed"
 *   },
 *   "storage": {
 *     "status": "ok" | "error",
 *     "provider": "local" | "ali-oss" | "tencent-cos",
 *     "error": "error message if failed"
 *   }
 * }
 */

import type { Context } from 'koa';

interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  environment: string;
  database: {
    status: 'connected' | 'error';
    responseTime?: number;
    error?: string;
  };
  storage: {
    status: 'ok' | 'error';
    provider: string;
    error?: string;
  };
}

export default {
  async index(ctx: Context) {
    const startTime = Date.now();

    // Get Strapi version
    const strapiVersion = strapi.config.get('info.strapi') || '5.29.0';

    // Initialize health response
    const healthData: HealthCheckResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'strapi-cms',
      version: strapiVersion,
      uptime: process.uptime(),
      environment: strapi.config.get('environment') || process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
      },
      storage: {
        status: 'ok',
        provider: 'local',
      },
    };

    // Check database connectivity
    try {
      const dbCheckStart = Date.now();
      
      // Test database connection by querying
      await strapi.db.connection.raw('SELECT 1');
      
      const dbResponseTime = Date.now() - dbCheckStart;
      
      healthData.database = {
        status: 'connected',
        responseTime: dbResponseTime,
      };
    } catch (error: any) {
      healthData.database = {
        status: 'error',
        error: error.message || 'Database connection failed',
      };
      healthData.status = 'error';
    }

    // Check storage/upload provider
    try {
      const uploadConfig = strapi.config.get('plugin.upload');
      
      if (uploadConfig && uploadConfig.provider) {
        healthData.storage.provider = uploadConfig.provider;
      }

      // Test storage accessibility (check if upload plugin is available)
      if (strapi.plugin('upload')) {
        healthData.storage.status = 'ok';
      }
    } catch (error: any) {
      healthData.storage = {
        status: 'error',
        provider: healthData.storage.provider,
        error: error.message || 'Storage check failed',
      };
      
      // Storage error is not critical, mark as degraded
      if (healthData.status === 'ok') {
        healthData.status = 'degraded';
      }
    }

    // Set HTTP status code based on health status
    const statusCode = healthData.status === 'ok' ? 200 : healthData.status === 'degraded' ? 200 : 503;
    ctx.status = statusCode;

    // Return health check response
    ctx.body = healthData;
  },
};
