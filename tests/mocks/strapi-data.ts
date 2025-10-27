import type {
  StrapiCollectionResponse,
  StrapiResponse,
  LessonAttributes,
  KnowledgeCardAttributes,
  StudentWorkAttributes,
  ResourceAttributes,
} from '~/types/strapi';

export const mockLesson: StrapiResponse<LessonAttributes> = {
  data: {
    id: 1,
    attributes: {
      title: 'Introduction to Math',
      description: 'Learn basic math concepts',
      content: '<p>This is a lesson about math</p>',
      slug: 'intro-to-math',
      grade: '1',
      subject: 'math',
      order: 1,
      duration: 45,
      objectives: ['Learn numbers', 'Basic addition'],
      materials: ['Pencil', 'Paper'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      publishedAt: '2024-01-01T00:00:00.000Z',
    },
  },
  meta: {},
};

export const mockLessons: StrapiCollectionResponse<LessonAttributes> = {
  data: [
    {
      id: 1,
      attributes: {
        title: 'Introduction to Math',
        description: 'Learn basic math concepts',
        slug: 'intro-to-math',
        grade: '1',
        subject: 'math',
        order: 1,
        duration: 45,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    },
    {
      id: 2,
      attributes: {
        title: 'Introduction to Science',
        description: 'Learn basic science concepts',
        slug: 'intro-to-science',
        grade: '1',
        subject: 'science',
        order: 2,
        duration: 40,
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        publishedAt: '2024-01-02T00:00:00.000Z',
      },
    },
  ],
  meta: {
    pagination: {
      page: 1,
      pageSize: 10,
      pageCount: 1,
      total: 2,
    },
  },
};

export const mockKnowledgeCard: StrapiResponse<KnowledgeCardAttributes> = {
  data: {
    id: 1,
    attributes: {
      title: 'Addition Basics',
      content: 'Addition is combining two numbers',
      slug: 'addition-basics',
      category: 'math',
      difficulty: 'beginner',
      tags: ['math', 'addition'],
      order: 1,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      publishedAt: '2024-01-01T00:00:00.000Z',
    },
  },
  meta: {},
};

export const mockKnowledgeCards: StrapiCollectionResponse<KnowledgeCardAttributes> = {
  data: [
    {
      id: 1,
      attributes: {
        title: 'Addition Basics',
        content: 'Addition is combining two numbers',
        slug: 'addition-basics',
        category: 'math',
        difficulty: 'beginner',
        tags: ['math', 'addition'],
        order: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  ],
  meta: {
    pagination: {
      page: 1,
      pageSize: 10,
      pageCount: 1,
      total: 1,
    },
  },
};

export const mockStudentWork: StrapiResponse<StudentWorkAttributes> = {
  data: {
    id: 1,
    attributes: {
      title: 'My Math Project',
      description: 'A project about numbers',
      slug: 'my-math-project',
      studentName: 'John Doe',
      studentGrade: '1',
      completionDate: '2024-01-15',
      category: 'math',
      featured: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      publishedAt: '2024-01-01T00:00:00.000Z',
    },
  },
  meta: {},
};

export const mockStudentWorks: StrapiCollectionResponse<StudentWorkAttributes> = {
  data: [
    {
      id: 1,
      attributes: {
        title: 'My Math Project',
        description: 'A project about numbers',
        slug: 'my-math-project',
        studentName: 'John Doe',
        studentGrade: '1',
        completionDate: '2024-01-15',
        category: 'math',
        featured: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  ],
  meta: {
    pagination: {
      page: 1,
      pageSize: 10,
      pageCount: 1,
      total: 1,
    },
  },
};

export const mockResource: StrapiResponse<ResourceAttributes> = {
  data: {
    id: 1,
    attributes: {
      title: 'Math Worksheet',
      description: 'Practice addition problems',
      type: 'document',
      slug: 'math-worksheet',
      category: 'worksheet',
      tags: ['math', 'practice'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      publishedAt: '2024-01-01T00:00:00.000Z',
    },
  },
  meta: {},
};

export const mockResources: StrapiCollectionResponse<ResourceAttributes> = {
  data: [
    {
      id: 1,
      attributes: {
        title: 'Math Worksheet',
        description: 'Practice addition problems',
        type: 'document',
        slug: 'math-worksheet',
        category: 'worksheet',
        tags: ['math', 'practice'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  ],
  meta: {
    pagination: {
      page: 1,
      pageSize: 10,
      pageCount: 1,
      total: 1,
    },
  },
};
