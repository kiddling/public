/**
 * Health Check Routes for Strapi CMS
 * 
 * Defines custom routes for health monitoring
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/cms/health',
      handler: 'health.index',
      config: {
        auth: false, // No authentication required
        policies: [],
        middlewares: [],
      },
    },
  ],
};
