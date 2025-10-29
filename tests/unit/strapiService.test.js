import { describe, it, expect } from 'vitest'
import { 
  getCourseStructure, 
  getAllLessons, 
  getLessonBySlug, 
  getTotalLessonsCount 
} from '@/services/strapiService'

describe('Strapi Service', () => {
  it('gets course structure', async () => {
    const structure = await getCourseStructure()
    expect(structure).toBeDefined()
    expect(structure.loops).toBeInstanceOf(Array)
    expect(structure.loops.length).toBe(3)
  })

  it('gets all lessons', () => {
    const lessons = getAllLessons()
    expect(lessons).toBeInstanceOf(Array)
    expect(lessons.length).toBe(12)
    expect(lessons[0]).toHaveProperty('id')
    expect(lessons[0]).toHaveProperty('title')
    expect(lessons[0]).toHaveProperty('slug')
    expect(lessons[0]).toHaveProperty('loopId')
    expect(lessons[0]).toHaveProperty('partId')
  })

  it('gets lesson by slug', () => {
    const lesson = getLessonBySlug('introduction')
    expect(lesson).toBeDefined()
    expect(lesson.slug).toBe('introduction')
    expect(lesson.title).toBe('Introduction to the Course')
  })

  it('returns undefined for invalid slug', () => {
    const lesson = getLessonBySlug('invalid-slug')
    expect(lesson).toBeUndefined()
  })

  it('gets total lessons count', () => {
    const count = getTotalLessonsCount()
    expect(count).toBe(12)
  })

  it('lessons are ordered correctly', () => {
    const lessons = getAllLessons()
    for (let i = 0; i < lessons.length - 1; i++) {
      expect(lessons[i].order).toBeLessThan(lessons[i + 1].order)
    }
  })

  it('lessons have proper loop assignment', () => {
    const lessons = getAllLessons()
    const loop1Lessons = lessons.filter(l => l.loopId === 1)
    const loop2Lessons = lessons.filter(l => l.loopId === 2)
    const loop3Lessons = lessons.filter(l => l.loopId === 3)
    
    expect(loop1Lessons.length).toBeGreaterThan(0)
    expect(loop2Lessons.length).toBeGreaterThan(0)
    expect(loop3Lessons.length).toBeGreaterThan(0)
  })
})
