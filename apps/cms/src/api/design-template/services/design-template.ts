import { factories } from '@strapi/strapi'

export default factories.createCoreService(
  'api::design-template.design-template',
  ({ strapi }) => ({
    async find(params?: any) {
      return strapi.entityService.findMany('api::design-template.design-template', params)
    },

    async findOne(id: string, params?: any) {
      return strapi.entityService.findOne('api::design-template.design-template', id, params)
    },

    async create(data: any) {
      return strapi.entityService.create('api::design-template.design-template', { data })
    },

    async update(id: string, data: any) {
      return strapi.entityService.update('api::design-template.design-template', id, { data })
    },

    async delete(id: string) {
      return strapi.entityService.delete('api::design-template.design-template', id)
    },
  })
)
