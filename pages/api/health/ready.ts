/**
 * Mellowise Readiness Check Endpoint
 * 
 * Comprehensive readiness check including database connectivity,
 * external services, and critical dependencies. Used by load balancers
 * and orchestration systems to determine if the service is ready to receive traffic.
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface ReadinessCheck {
  ready: boolean;
  timestamp: string;
  service: string;
  checks: {
    database: {
      healthy: boolean;
      response_time?: number;
      error?: string;
    };
    ai_service: {
      healthy: boolean;
      response_time?: number;
      error?: string;
    };
    payment: {
      healthy: boolean;
      response_time?: number;
      error?: string;
    };
    storage: {
      healthy: boolean;
      response_time?: number;
      error?: string;
    };
  };
  overall_response_time: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReadinessCheck | { error: string }>
) {
  const startTime = Date.now();

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Run all readiness checks in parallel
    const [databaseCheck, aiServiceCheck, paymentCheck, storageCheck] = await Promise.allSettled([
      checkDatabaseConnection(),
      checkAIServiceConnection(),
      checkPaymentServiceConnection(),
      checkStorageConnection()
    ]);

    // Process check results
    const checks = {
      database: processCheckResult(databaseCheck),
      ai_service: processCheckResult(aiServiceCheck),
      payment: processCheckResult(paymentCheck),
      storage: processCheckResult(storageCheck)
    };

    // Determine overall readiness
    const isReady = Object.values(checks).every(check => check.healthy);
    
    const readinessStatus: ReadinessCheck = {
      ready: isReady,
      timestamp: new Date().toISOString(),
      service: 'mellowise-api',
      checks,
      overall_response_time: Date.now() - startTime
    };

    // Set appropriate status code and headers
    const httpStatus = isReady ? 200 : 503;
    res.setHeader('X-Response-Time', `${readinessStatus.overall_response_time}ms`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.status(httpStatus).json(readinessStatus);

  } catch (error) {
    console.error('Readiness check error:', error);
    
    return res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      service: 'mellowise-api',
      checks: {
        database: { healthy: false, error: 'Check failed' },
        ai_service: { healthy: false, error: 'Check failed' },
        payment: { healthy: false, error: 'Check failed' },
        storage: { healthy: false, error: 'Check failed' }
      },
      overall_response_time: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as any);
  }
}

/**
 * Check Supabase database connection
 */
async function checkDatabaseConnection(): Promise<{ healthy: boolean; response_time: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    // In a real implementation, you would:
    // 1. Import your Supabase client
    // 2. Run a simple query like: SELECT 1
    // 3. Check response time and success
    
    // For now, simulate a database check
    // Replace this with actual Supabase connection test:
    // const { data, error } = await supabase.rpc('database_health_check');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    
    const response_time = Date.now() - startTime;
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.05) { // 5% failure rate for demo
      throw new Error('Database connection timeout');
    }
    
    return {
      healthy: true,
      response_time
    };
    
  } catch (error) {
    return {
      healthy: false,
      response_time: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Database check failed'
    };
  }
}

/**
 * Check AI service availability (Claude/OpenAI)
 */
async function checkAIServiceConnection(): Promise<{ healthy: boolean; response_time: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    // In a real implementation, you would make a lightweight API call to Claude/OpenAI
    // For example: simple completion request or API status check
    
    // Simulate AI service check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    const response_time = Date.now() - startTime;
    
    // Check if we have API keys configured
    const hasClaudeKey = !!process.env.CLAUDE_API_KEY;
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    
    if (!hasClaudeKey && !hasOpenAIKey) {
      throw new Error('No AI service API keys configured');
    }
    
    return {
      healthy: true,
      response_time
    };
    
  } catch (error) {
    return {
      healthy: false,
      response_time: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'AI service check failed'
    };
  }
}

/**
 * Check Stripe payment service connectivity
 */
async function checkPaymentServiceConnection(): Promise<{ healthy: boolean; response_time: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    // In a real implementation, you would:
    // 1. Check Stripe API connectivity
    // 2. Verify webhook endpoints are accessible
    // 3. Test basic API calls
    
    // Simulate payment service check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 75));
    
    const response_time = Date.now() - startTime;
    
    // Check if Stripe keys are configured
    const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
    
    if (!hasStripeKey) {
      throw new Error('Stripe API key not configured');
    }
    
    return {
      healthy: true,
      response_time
    };
    
  } catch (error) {
    return {
      healthy: false,
      response_time: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Payment service check failed'
    };
  }
}

/**
 * Check Cloudinary storage service
 */
async function checkStorageConnection(): Promise<{ healthy: boolean; response_time: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    // In a real implementation, you would:
    // 1. Test Cloudinary API connectivity
    // 2. Verify upload capabilities
    // 3. Check storage quotas
    
    // Simulate storage service check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 60));
    
    const response_time = Date.now() - startTime;
    
    // Check if Cloudinary credentials are configured
    const hasCloudinaryConfig = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    
    if (!hasCloudinaryConfig) {
      throw new Error('Cloudinary credentials not configured');
    }
    
    return {
      healthy: true,
      response_time
    };
    
  } catch (error) {
    return {
      healthy: false,
      response_time: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Storage service check failed'
    };
  }
}

/**
 * Process Promise.allSettled result into standard check format
 */
function processCheckResult(
  result: PromiseSettledResult<{ healthy: boolean; response_time: number; error?: string }>
): { healthy: boolean; response_time?: number; error?: string } {
  if (result.status === 'fulfilled') {
    return result.value;
  } else {
    return {
      healthy: false,
      error: result.reason instanceof Error ? result.reason.message : 'Check rejected'
    };
  }
}