import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTotalLessonsCount } from '@/services/strapiService'

const STORAGE_KEY = 'course_progress'

export const useProgressStore = defineStore('progress', () => {
  const completedLessons = ref(new Set())

  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        completedLessons.value = new Set(parsed)
      }
    } catch (error) {
      console.error('Error loading progress from localStorage:', error)
    }
  }

  function saveToLocalStorage() {
    try {
      const data = Array.from(completedLessons.value)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving progress to localStorage:', error)
    }
  }

  function toggleLessonCompletion(lessonId) {
    if (completedLessons.value.has(lessonId)) {
      completedLessons.value.delete(lessonId)
    } else {
      completedLessons.value.add(lessonId)
    }
    saveToLocalStorage()
  }

  function markLessonComplete(lessonId) {
    completedLessons.value.add(lessonId)
    saveToLocalStorage()
  }

  function markLessonIncomplete(lessonId) {
    completedLessons.value.delete(lessonId)
    saveToLocalStorage()
  }

  function isLessonComplete(lessonId) {
    return completedLessons.value.has(lessonId)
  }

  const completedCount = computed(() => {
    return completedLessons.value.size
  })

  const totalLessons = computed(() => {
    return getTotalLessonsCount()
  })

  const completionPercentage = computed(() => {
    if (totalLessons.value === 0) return 0
    return Math.round((completedCount.value / totalLessons.value) * 100)
  })

  const completedLessonsArray = computed(() => {
    return Array.from(completedLessons.value)
  })

  function resetProgress() {
    completedLessons.value.clear()
    saveToLocalStorage()
  }

  loadFromLocalStorage()

  return {
    completedLessons,
    completedCount,
    totalLessons,
    completionPercentage,
    completedLessonsArray,
    toggleLessonCompletion,
    markLessonComplete,
    markLessonIncomplete,
    isLessonComplete,
    resetProgress,
    loadFromLocalStorage
  }
})
