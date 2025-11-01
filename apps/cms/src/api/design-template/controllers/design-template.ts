import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::design-template.design-template', ({ strapi }) => ({
  async find(ctx) {
    const { query } = ctx;
    const templates = await strapi.service('api::design-template.design-template').find(query);
    return templates;
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const template = await strapi.service('api::design-template.design-template').findOne(id);
    return template;
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const template = await strapi.service('api::design-template.design-template').create(data);
    return template;
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const template = await strapi.service('api::design-template.design-template').update(id, data);
    return template;
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const template = await strapi.service('api::design-template.design-template').delete(id);
    return template;
  },
}));
