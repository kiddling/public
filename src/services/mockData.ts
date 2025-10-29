import { KnowledgeCardData } from '../types';

export const mockCards: KnowledgeCardData[] = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    type: 'Theory',
    description: 'Learn the fundamentals of machine learning including supervised and unsupervised learning algorithms.',
    tags: ['ml', 'ai', 'basics'],
    loop: 'Loop 1',
    difficulty: 'Beginner',
    relevance: 95,
    media: [
      {
        type: 'image',
        url: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=ML+Theory',
        alt: 'Machine Learning Concept',
        isChinaSafe: true,
      },
    ],
    externalLinks: [
      {
        url: 'https://example.com/ml-guide',
        title: 'ML Beginner Guide',
        isAccessible: true,
        isChinaSafe: true,
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Climate Change Case Study: Amazon Rainforest',
    type: 'Case Study',
    description: 'Analyze the impact of deforestation on climate change through real-world data from the Amazon rainforest.',
    tags: ['climate', 'environment', 'research'],
    loop: 'Loop 2',
    difficulty: 'Intermediate',
    relevance: 88,
    media: [
      {
        type: 'image',
        url: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Rainforest+Study',
        alt: 'Amazon Rainforest',
        isChinaSafe: true,
      },
    ],
    downloadableAssets: [
      {
        id: 'asset1',
        name: 'Research Paper - Climate Impact.pdf',
        url: 'https://example.com/climate-paper.pdf',
        type: 'application/pdf',
        size: '2.4 MB',
      },
    ],
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    title: 'Student Project: Solar Energy Calculator',
    type: 'Student Work',
    description: 'An innovative web application created by students to calculate solar energy potential for homes.',
    tags: ['renewable-energy', 'project', 'javascript'],
    difficulty: 'Advanced',
    relevance: 75,
    media: [
      {
        type: 'image',
        url: 'https://via.placeholder.com/400x300/a855f7/ffffff?text=Solar+Calculator',
        alt: 'Solar Calculator Interface',
      },
    ],
    externalLinks: [
      {
        url: 'https://example.com/solar-calc',
        title: 'Live Demo',
        isAccessible: true,
      },
      {
        url: 'https://blocked-site.example',
        title: 'Alternative Demo',
        isAccessible: false,
        fallbackText: 'This resource may be blocked in some regions. Please contact support for alternatives.',
      },
    ],
    relatedLessons: [
      {
        id: 'lesson1',
        title: 'Renewable Energy Basics',
        slug: 'renewable-energy-basics',
      },
    ],
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-02-01T09:15:00Z',
  },
  {
    id: '4',
    title: 'AI Writing Assistant Prompt',
    type: 'AI Prompt',
    description: 'A carefully crafted prompt for generating educational content using AI language models.',
    tags: ['ai', 'writing', 'prompts'],
    loop: 'Loop 3',
    difficulty: 'Intermediate',
    relevance: 92,
    aiPrompt: `You are an educational content expert. Create a lesson plan for high school students on the topic of [TOPIC].

Include:
1. Learning objectives (3-5 clear goals)
2. Materials needed
3. Step-by-step teaching instructions
4. Interactive activities
5. Assessment methods
6. Extension activities for advanced learners

Make the content engaging and accessible for diverse learning styles.`,
    media: [
      {
        type: 'image',
        url: 'https://via.placeholder.com/400x300/f97316/ffffff?text=AI+Prompt',
        alt: 'AI Prompt Template',
        isChinaSafe: true,
      },
    ],
    createdAt: '2024-02-10T11:00:00Z',
    updatedAt: '2024-02-10T11:00:00Z',
  },
  {
    id: '5',
    title: 'Critical Thinking: Evaluating Online Sources',
    type: 'Extended Thinking',
    description: 'Develop critical thinking skills to evaluate the credibility and bias of online information sources.',
    tags: ['critical-thinking', 'media-literacy', 'research'],
    loop: 'Loop 1',
    difficulty: 'Advanced',
    relevance: 98,
    media: [
      {
        type: 'pdf',
        url: 'https://example.com/critical-thinking.pdf',
        alt: 'Critical Thinking Guide',
      },
    ],
    relatedLessons: [
      {
        id: 'lesson2',
        title: 'Digital Literacy',
        slug: 'digital-literacy',
      },
      {
        id: 'lesson3',
        title: 'Research Methods',
        slug: 'research-methods',
      },
    ],
    createdAt: '2024-02-15T16:45:00Z',
    updatedAt: '2024-02-15T16:45:00Z',
  },
  {
    id: '6',
    title: 'Python Programming Fundamentals',
    type: 'Theory',
    description: 'Master the basics of Python programming including variables, loops, functions, and data structures.',
    tags: ['python', 'programming', 'coding'],
    loop: 'Loop 2',
    difficulty: 'Beginner',
    relevance: 90,
    media: [
      {
        type: 'video',
        url: 'https://example.com/python-intro.mp4',
        thumbnail: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Python+Video',
        alt: 'Python Tutorial Video',
      },
    ],
    downloadableAssets: [
      {
        id: 'asset2',
        name: 'Python Cheat Sheet.pdf',
        url: 'https://example.com/python-cheatsheet.pdf',
        type: 'application/pdf',
        size: '1.2 MB',
      },
      {
        id: 'asset3',
        name: 'Practice Exercises.zip',
        url: 'https://example.com/exercises.zip',
        type: 'application/zip',
        size: '3.5 MB',
      },
    ],
    createdAt: '2024-02-20T08:30:00Z',
    updatedAt: '2024-02-20T08:30:00Z',
  },
];
