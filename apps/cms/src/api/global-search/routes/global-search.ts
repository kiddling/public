export default {
  routes: [
    {
      method: 'GET',
      path: '/global-search',
      handler: 'global-search.search',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/global-search/clear-cache',
      handler: 'global-search.clearCache',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}
