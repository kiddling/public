export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Handle health check endpoint
    if (ctx.request.url === '/health' && ctx.request.method === 'GET') {
      ctx.status = 200;
      ctx.body = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: strapi.config.get('environment'),
      };
      return;
    }
    
    // Continue to next middleware
    await next();
  };
};
