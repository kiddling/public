export const courseStructure = {
  title: "Course Title",
  loops: [
    {
      id: 1,
      name: "Loop 1",
      code: "L1",
      color: "#3b82f6",
      parts: [
        {
          id: 1,
          name: "Prelude",
          code: "P-00",
          color: "#3b82f6",
          lessons: [
            {
              id: 1,
              title: "Introduction to the Course",
              code: "L-01",
              slug: "introduction",
              order: 1
            },
            {
              id: 2,
              title: "Getting Started",
              code: "L-02",
              slug: "getting-started",
              order: 2
            }
          ]
        },
        {
          id: 2,
          name: "Part A",
          code: "PA-01",
          color: "#3b82f6",
          lessons: [
            {
              id: 3,
              title: "Core Concepts",
              code: "L-03",
              slug: "core-concepts",
              order: 3
            },
            {
              id: 4,
              title: "Building Foundations",
              code: "L-04",
              slug: "building-foundations",
              order: 4
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Loop 2",
      code: "L2",
      color: "#8b5cf6",
      parts: [
        {
          id: 3,
          name: "Part B",
          code: "PB-02",
          color: "#8b5cf6",
          lessons: [
            {
              id: 5,
              title: "Advanced Topics",
              code: "L-05",
              slug: "advanced-topics",
              order: 5
            },
            {
              id: 6,
              title: "Deep Dive",
              code: "L-06",
              slug: "deep-dive",
              order: 6
            },
            {
              id: 7,
              title: "Practical Applications",
              code: "L-07",
              slug: "practical-applications",
              order: 7
            },
            {
              id: 8,
              title: "Case Studies",
              code: "L-08",
              slug: "case-studies",
              order: 8
            }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Loop 3",
      code: "L3",
      color: "#ec4899",
      parts: [
        {
          id: 4,
          name: "Part C",
          code: "PC-03",
          color: "#ec4899",
          lessons: [
            {
              id: 9,
              title: "Mastery Level",
              code: "L-09",
              slug: "mastery-level",
              order: 9
            },
            {
              id: 10,
              title: "Integration Patterns",
              code: "L-10",
              slug: "integration-patterns",
              order: 10
            }
          ]
        },
        {
          id: 5,
          name: "Appendix",
          code: "APP-01",
          color: "#ec4899",
          lessons: [
            {
              id: 11,
              title: "Reference Materials",
              code: "L-11",
              slug: "reference-materials",
              order: 11
            },
            {
              id: 12,
              title: "Final Thoughts",
              code: "L-12",
              slug: "final-thoughts",
              order: 12
            }
          ]
        }
      ]
    }
  ]
}

export function getCourseStructure() {
  return Promise.resolve(courseStructure)
}

export function getAllLessons() {
  const lessons = []
  courseStructure.loops.forEach(loop => {
    loop.parts.forEach(part => {
      part.lessons.forEach(lesson => {
        lessons.push({
          ...lesson,
          loopId: loop.id,
          loopName: loop.name,
          loopCode: loop.code,
          partId: part.id,
          partName: part.name,
          partCode: part.code,
          color: part.color
        })
      })
    })
  })
  return lessons
}

export function getLessonBySlug(slug) {
  const lessons = getAllLessons()
  return lessons.find(lesson => lesson.slug === slug)
}

export function getTotalLessonsCount() {
  return getAllLessons().length
}

// Mock lesson content data with difficulty blocks
const lessonContent = {
  1: {
    description: "Learn the fundamentals of our course structure and how to navigate through the material.",
    difficultyBlocks: {
      base: {
        title: "Introduction to Core Concepts",
        content: "This course uses a unique spiral learning structure. You'll encounter similar concepts multiple times, each time at increasing depth. Navigate using the sidebar or sequential buttons.",
        markdown: `# Welcome to the Course

This is your starting point. Here you'll learn:
- How to navigate the course
- Understanding the spiral structure
- Setting your learning pace`,
        activities: ["Read through the course overview", "Explore the navigation sidebar"],
        estimatedTime: "15 minutes"
      },
      advance: {
        title: "Deep Dive into Course Methodology",
        content: "The spiral curriculum revisits key topics across multiple 'loops', each building on previous understanding. This approach enhances retention and allows for flexible learning paths.",
        markdown: `# Advanced Understanding

## Spiral Learning Benefits
- **Retention**: Revisiting concepts strengthens memory
- **Flexibility**: Non-linear navigation adapts to your pace
- **Depth**: Each loop adds complexity

## Navigation Strategies
Consider bookmarking key lessons for quick reference.`,
        activities: ["Map out your personalized learning path", "Identify prerequisite relationships"],
        estimatedTime: "25 minutes"
      },
      stretch: {
        title: "Meta-Learning and Self-Direction",
        content: "Apply metacognitive strategies to optimize your learning. Consider how the spiral structure mirrors real-world problem-solving where you iteratively refine understanding.",
        markdown: `# Stretch Challenge

## Research Task
Investigate educational research on spiral curricula. Compare with traditional linear approaches.

## Reflection Prompts
- How does this structure change your learning approach?
- What strategies will you use to track your progress across loops?
- Can you identify patterns in how topics are scaffolded?

## Extended Activity
Create a visual representation of the course structure and your progress through it.`,
        activities: [
          "Research spiral curriculum pedagogy",
          "Create a learning journal",
          "Design your progress visualization"
        ],
        estimatedTime: "45 minutes"
      }
    },
    media: [
      {
        type: "video",
        url: "https://example.com/intro-video.mp4",
        title: "Course Introduction Video",
        thumbnail: "https://via.placeholder.com/400x225"
      },
      {
        type: "diagram",
        url: "https://via.placeholder.com/600x400",
        title: "Course Structure Diagram",
        alt: "Visual representation of the spiral learning structure"
      }
    ],
    attachments: [
      {
        title: "Course Handbook PDF",
        filename: "course-handbook.pdf",
        size: "2.5 MB",
        url: "#"
      },
      {
        title: "Quick Reference Guide",
        filename: "quick-reference.pdf",
        size: "500 KB",
        url: "#"
      }
    ],
    relatedResources: [
      {
        id: 1,
        type: "card",
        title: "Learning Strategies",
        description: "Effective techniques for spiral learning",
        url: "/resource/learning-strategies"
      },
      {
        id: 2,
        type: "external",
        title: "Educational Research Paper",
        description: "Studies on spiral curriculum effectiveness",
        url: "https://example.com/research"
      }
    ]
  },
  // Default content for other lessons
  default: {
    description: "This lesson builds on previous concepts and introduces new material.",
    difficultyBlocks: {
      base: {
        title: "Core Concepts",
        content: "Essential understanding and foundational knowledge for this topic.",
        markdown: `# Base Level Content

This section covers the fundamental concepts you need to understand.

## Key Points
- Main concept overview
- Basic examples
- Foundation for further learning`,
        activities: ["Complete basic exercises", "Review key terms"],
        estimatedTime: "20 minutes"
      },
      advance: {
        title: "Advanced Application",
        content: "Deeper exploration with practical applications and complex scenarios.",
        markdown: `# Advanced Content

## In-Depth Analysis
Building on the basics, we explore:
- Complex scenarios
- Real-world applications
- Integration with other concepts

## Practice Problems
Work through these challenges to deepen understanding.`,
        activities: ["Solve practice problems", "Analyze case studies"],
        estimatedTime: "35 minutes"
      },
      stretch: {
        title: "Challenge Extension",
        content: "Independent research, creative applications, and advanced problem-solving.",
        markdown: `# Stretch Goals

## Extended Challenge
Push your understanding further:
- Research advanced topics
- Create original solutions
- Connect to broader themes

## Reflection
Consider how this material connects to your learning goals.`,
        activities: ["Independent research project", "Create teaching materials", "Develop novel applications"],
        estimatedTime: "60 minutes"
      }
    },
    media: [],
    attachments: [],
    relatedResources: []
  }
}

export function getLessonContent(lessonId) {
  return lessonContent[lessonId] || lessonContent.default
}
