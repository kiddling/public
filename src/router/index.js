import { createRouter, createWebHistory } from 'vue-router'
import { getLessonBySlug } from '@/services/strapiService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: 'Home',
        breadcrumb: [{ label: 'Home', to: '/' }]
      }
    },
    {
      path: '/lesson/:slug',
      name: 'lesson',
      component: () => import('@/views/LessonView.vue'),
      meta: {
        title: 'Lesson',
        breadcrumb: []
      },
      beforeEnter: (to, from, next) => {
        const lesson = getLessonBySlug(to.params.slug)
        if (lesson) {
          to.meta.lesson = lesson
          to.meta.breadcrumb = [
            { label: 'Home', to: '/' },
            { label: lesson.loopName, to: null },
            { label: lesson.partName, to: null },
            { label: lesson.title, to: null }
          ]
          next()
        } else {
          next('/')
        }
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.afterEach((to) => {
  const title = to.meta.title || 'Course Navigation'
  document.title = title
})

export default router
