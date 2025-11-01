import { factories } from '@strapi/strapi';

export default factories.createCoreService(
  'api::design-log-template.design-log-template',
  ({ strapi }) => ({
    /**
     * Get templates by course code
     */
    async getByCourseCode(courseCode: string) {
      return await strapi.entityService.findMany(
        'api::design-log-template.design-log-template',
        {
          filters: {
            courseCode,
            publishedAt: { $notNull: true },
          },
          sort: { order: 'asc' },
          populate: '*',
        }
      );
    },

    /**
     * Get template by slug
     */
    async getBySlug(slug: string) {
      const templates = await strapi.entityService.findMany(
        'api::design-log-template.design-log-template',
        {
          filters: {
            slug,
            publishedAt: { $notNull: true },
          },
          populate: '*',
          limit: 1,
        }
      );

      return templates.length > 0 ? templates[0] : null;
    },

    /**
     * Create or update template
     */
    async upsertTemplate(data: any) {
      const existing = await this.getBySlug(data.slug);

      if (existing) {
        return await strapi.entityService.update(
          'api::design-log-template.design-log-template',
          existing.id,
          { data }
        );
      }

      return await strapi.entityService.create(
        'api::design-log-template.design-log-template',
        { data }
      );
    },
  })
);
