export default {
  routes: [
    {
      method: 'GET',
      path: '/design-log-templates',
      handler: 'design-log-template.find',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/design-log-templates/:id',
      handler: 'design-log-template.findOne',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
