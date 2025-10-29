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
