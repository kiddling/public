import { z } from 'zod';

export const strapiBaseAttributesSchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
});

export const strapiMediaSchema = z.object({
  id: z.number(),
  name: z.string(),
  alternativeText: z.string().optional(),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  formats: z.record(z.object({
    url: z.string(),
    width: z.number(),
    height: z.number(),
  })).optional(),
  hash: z.string(),
  ext: z.string(),
  mime: z.string(),
  size: z.number(),
  url: z.string(),
  previewUrl: z.string().optional(),
  provider: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const strapiRelationSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: z.union([
      z.null(),
      z.object({
        id: z.number(),
        attributes: schema,
      }),
      z.array(z.object({
        id: z.number(),
        attributes: schema,
      })),
    ]),
  });

export const lessonAttributesSchema = strapiBaseAttributesSchema.extend({
  title: z.string(),
  description: z.string().optional(),
  content: z.string().optional(),
  slug: z.string(),
  grade: z.string().optional(),
  subject: z.string().optional(),
  order: z.number().optional(),
  duration: z.number().optional(),
  objectives: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  thumbnail: strapiRelationSchema(strapiMediaSchema).optional(),
  knowledgeCards: strapiRelationSchema(z.any()).optional(),
  resources: strapiRelationSchema(z.any()).optional(),
});

export const knowledgeCardAttributesSchema = strapiBaseAttributesSchema.extend({
  title: z.string(),
  content: z.string(),
  slug: z.string(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().optional(),
  image: strapiRelationSchema(strapiMediaSchema).optional(),
  relatedCards: strapiRelationSchema(z.any()).optional(),
  lessons: strapiRelationSchema(z.any()).optional(),
});

export const studentWorkAttributesSchema = strapiBaseAttributesSchema.extend({
  title: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  studentName: z.string().optional(),
  studentGrade: z.string().optional(),
  completionDate: z.string().optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  images: strapiRelationSchema(strapiMediaSchema).optional(),
  lesson: strapiRelationSchema(z.any()).optional(),
});

export const resourceAttributesSchema = strapiBaseAttributesSchema.extend({
  title: z.string(),
  description: z.string().optional(),
  type: z.enum(['document', 'video', 'image', 'link', 'other']),
  url: z.string().optional(),
  slug: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  file: strapiRelationSchema(strapiMediaSchema).optional(),
  lessons: strapiRelationSchema(z.any()).optional(),
});

export const lessonSchema = z.object({
  id: z.number(),
  attributes: lessonAttributesSchema,
});

export const knowledgeCardSchema = z.object({
  id: z.number(),
  attributes: knowledgeCardAttributesSchema,
});

export const studentWorkSchema = z.object({
  id: z.number(),
  attributes: studentWorkAttributesSchema,
});

export const resourceSchema = z.object({
  id: z.number(),
  attributes: resourceAttributesSchema,
});

export const strapiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.union([dataSchema, z.null()]),
    meta: z.record(z.unknown()).optional(),
  });

export const strapiCollectionResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    meta: z.object({
      pagination: z.object({
        page: z.number(),
        pageSize: z.number(),
        pageCount: z.number(),
        total: z.number(),
      }),
    }),
  });

export const strapiErrorResponseSchema = z.object({
  data: z.null(),
  error: z.object({
    status: z.number(),
    name: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
});
