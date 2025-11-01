import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::design-log-template.design-log-template',
  ({ strapi }) => ({
    /**
     * Find all templates with optional course filtering
     * GET /api/design-log-templates
     */
    async find(ctx) {
      const { courseCode } = ctx.query;

      const filters: any = {
        publishedAt: { $notNull: true },
      };

      if (courseCode) {
        filters.courseCode = courseCode;
      }

      const templates = await strapi.entityService.findMany(
        'api::design-log-template.design-log-template',
        {
          filters,
          sort: { order: 'asc' },
          populate: '*',
        }
      );

      // Sanitize and format response
      const sanitizedTemplates = await Promise.all(
        templates.map((template: any) =>
          this.sanitizeOutput(template, ctx)
        )
      );

      return this.transformResponse(sanitizedTemplates);
    },

    /**
     * Find one template by slug or ID
     * GET /api/design-log-templates/:id
     */
    async findOne(ctx) {
      const { id } = ctx.params;

      // Try to find by slug first
      let template;
      try {
        template = await strapi.entityService.findMany(
          'api::design-log-template.design-log-template',
          {
            filters: {
              slug: id,
              publishedAt: { $notNull: true },
            },
            populate: '*',
            limit: 1,
          }
        );

        if (template && template.length > 0) {
          template = template[0];
        } else {
          // Try to find by ID
          template = await strapi.entityService.findOne(
            'api::design-log-template.design-log-template',
            id,
            {
              populate: '*',
            }
          );
        }
      } catch (error) {
        return ctx.notFound('Template not found');
      }

      if (!template) {
        return ctx.notFound('Template not found');
      }

      const sanitizedTemplate = await this.sanitizeOutput(template, ctx);
      return this.transformResponse(sanitizedTemplate);
    },
  })
);
