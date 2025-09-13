/**
 * Mellowise Application Health Status Endpoint
 * 
 * Provides basic application health information for monitoring systems.
 * This endpoint should always be accessible and return quickly.
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  environment: string;
  checks: {
    server: boolean;
    memory: boolean;
    environment_variables: boolean;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthStatus | { error: string }>
) {
  try {
    const startTime = Date.now();
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Basic health checks
    const checks = {
      server: true, // If we got this far, server is responding
      memory: checkMemoryUsage(),
      environment_variables: checkEnvironmentVariables()
    };

    // Determine overall status
    const allChecksPass = Object.values(checks).every(check => check === true);
    const status: 'healthy' | 'degraded' | 'unhealthy' = allChecksPass ? 'healthy' : 'degraded';

    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      service: 'mellowise-api',
      version: process.env.APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || '1.0.0',
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'unknown',
      checks
    };

    // Set appropriate status code
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
    
    // Add response time header
    res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return res.status(httpStatus).json(healthStatus);

  } catch (error) {
    console.error('Health check error:', error);
    
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'mellowise-api',
      version: process.env.APP_VERSION || 'unknown',
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'unknown',
      checks: {
        server: false,
        memory: false,
        environment_variables: false
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    } as any);
  }
}

/**
 * Check memory usage - warn if over 80% of available memory
 */
function checkMemoryUsage(): boolean {
  try {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal;
    const usedMemory = memUsage.heapUsed;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    // Return false if memory usage is over 80%
    return memoryUsagePercent < 80;
  } catch (error) {
    console.error('Memory check error:', error);
    return false;
  }
}

/**
 * Check that critical environment variables are present
 */
function checkEnvironmentVariables(): boolean {
  const requiredEnvVars = [
    'NODE_ENV',
    // Add other critical environment variables here
    // 'DATABASE_URL',
    // 'NEXTAUTH_SECRET',
    // etc.
  ];

  return requiredEnvVars.every(envVar => {
    const value = process.env[envVar];
    return value !== undefined && value !== '';
  });
}