/**
 * Mock Lessons Data for E2E Tests
 */

export const lessonsFixture = {
  data: [
    {
      id: 1,
      attributes: {
        code: 'P-00',
        title: 'Welcome to Art Foundations',
        slug: 'welcome-to-foundations',
        summary: 'Introduction to the foundations of visual art',
        description: 'Start your journey in visual arts with fundamental concepts.',
        content: `# Welcome to Art Foundations

## Introduction
This lesson introduces you to the core concepts of visual art.

## Key Concepts
- **Line**: The foundation of all drawing
- **Shape**: Creating forms with lines
- **Color**: Understanding color theory

## Practice Exercises
1. Draw 10 different types of lines
2. Create 5 basic shapes
3. Mix primary colors

## Learning Objectives
By the end of this lesson, you will be able to:
- Identify different types of lines
- Create basic shapes
- Understand primary colors

## Resources
- Sketchbook
- Pencils (HB, 2B, 4B)
- Colored pencils or markers`,
        difficulty: 'beginner',
        estimatedTime: 45,
        order: 1,
        objectives: ['Understand basic art concepts', 'Practice fundamental techniques'],
        materials: ['Sketchbook', 'Pencils', 'Colored pencils'],
        keywords: ['foundations', 'basics', '基础', 'art'],
        publishedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
    {
      id: 2,
      attributes: {
        code: 'P-01',
        title: 'Line and Form',
        slug: 'line-and-form',
        summary: 'Exploring different types of lines and basic forms',
        description: 'Learn to create expressive lines and basic geometric forms.',
        content: `# Line and Form

## Understanding Lines
Lines are the building blocks of all visual art.

### Types of Lines
- Straight lines
- Curved lines
- Broken lines
- Implied lines

## Form Creation
Combine lines to create three-dimensional forms.

### Practice
Draw a cube using only lines to show depth and dimension.`,
        difficulty: 'beginner',
        estimatedTime: 60,
        order: 2,
        objectives: ['Master line techniques', 'Create basic forms'],
        materials: ['Pencils', 'Ruler', 'Paper'],
        keywords: ['line', '线条', 'form', 'drawing'],
        publishedAt: '2024-01-02T00:00:00.000Z',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
    },
    {
      id: 3,
      attributes: {
        code: 'PA-01',
        title: 'Color Theory Fundamentals',
        slug: 'color-theory-fundamentals',
        summary: 'Introduction to color theory and mixing',
        description: 'Understand the color wheel and basic color relationships.',
        content: `# Color Theory Fundamentals

## Primary Colors
Red, Blue, and Yellow are the foundation of all colors.

## Secondary Colors
Mix primary colors to create:
- Red + Blue = Purple
- Blue + Yellow = Green
- Yellow + Red = Orange

## Color Harmony
Learn to create harmonious color combinations.`,
        difficulty: 'intermediate',
        estimatedTime: 90,
        order: 3,
        objectives: ['Understand color theory', 'Mix colors effectively'],
        materials: ['Paints', 'Palette', 'Paper'],
        keywords: ['color', '颜色', 'theory', 'mixing'],
        publishedAt: '2024-01-03T00:00:00.000Z',
        createdAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
      },
    },
    {
      id: 4,
      attributes: {
        code: 'PA-02',
        title: 'Composition and Balance',
        slug: 'composition-and-balance',
        summary: 'Creating balanced and interesting compositions',
        description: 'Master the principles of visual composition.',
        content: `# Composition and Balance

## Rule of Thirds
Divide your canvas into thirds for balanced compositions.

## Visual Weight
Understand how elements create balance in artwork.

## Leading Lines
Use lines to guide the viewer's eye through your composition.`,
        difficulty: 'intermediate',
        estimatedTime: 75,
        order: 4,
        objectives: ['Create balanced compositions', 'Use compositional techniques'],
        materials: ['Viewfinder', 'Sketchbook', 'Camera'],
        keywords: ['composition', '构图', 'balance', 'design'],
        publishedAt: '2024-01-04T00:00:00.000Z',
        createdAt: '2024-01-04T00:00:00.000Z',
        updatedAt: '2024-01-04T00:00:00.000Z',
      },
    },
    {
      id: 5,
      attributes: {
        code: 'ET-01',
        title: 'Advanced Perspective Drawing',
        slug: 'advanced-perspective',
        summary: 'Master complex perspective techniques',
        description: 'Learn two-point and three-point perspective drawing.',
        content: `# Advanced Perspective Drawing

## Two-Point Perspective
Create realistic architectural drawings.

## Three-Point Perspective
Add dramatic angles to your compositions.

## Atmospheric Perspective
Show depth through value and detail changes.`,
        difficulty: 'advanced',
        estimatedTime: 120,
        order: 5,
        objectives: ['Master perspective techniques', 'Create realistic depth'],
        materials: ['Pencils', 'Ruler', 'Drawing paper'],
        keywords: ['perspective', '透视', 'advanced', '高级'],
        publishedAt: '2024-01-05T00:00:00.000Z',
        createdAt: '2024-01-05T00:00:00.000Z',
        updatedAt: '2024-01-05T00:00:00.000Z',
      },
    },
  ],
  meta: {
    pagination: {
      page: 1,
      pageSize: 25,
      pageCount: 1,
      total: 5,
    },
  },
}
