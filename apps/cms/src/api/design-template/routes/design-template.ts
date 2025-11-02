export default {
  routes: [
    {
      method: 'GET',
      path: '/design-templates',
      handler: 'design-template.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/design-templates/:id',
      handler: 'design-template.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/design-templates',
      handler: 'design-template.create',
    },
    {
      method: 'PUT',
      path: '/design-templates/:id',
      handler: 'design-template.update',
    },
    {
      method: 'DELETE',
      path: '/design-templates/:id',
      handler: 'design-template.delete',
    },
  ],
}
