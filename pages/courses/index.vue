<template>
  <div class="courses-page">
    <div class="container">
      <h1>所有课程</h1>
      <div class="courses-grid">
        <NuxtLink 
          v-for="course in courses" 
          :key="course.id" 
          :to="`/courses/${course.slug}`"
          class="course-card"
        >
          <div class="course-image">
            <img :src="course.image" :alt="course.title" loading="lazy" />
          </div>
          <div class="course-content">
            <h3>{{ course.title }}</h3>
            <p>{{ course.description }}</p>
            <div class="course-meta">
              <span class="duration">{{ course.duration }}</span>
              <span class="level">{{ course.level }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const courses = ref([
  {
    id: 1,
    slug: 'web-development',
    title: 'Web开发全栈课程',
    description: '从零开始学习现代Web开发技术',
    image: '/images/courses/web-dev.jpg',
    duration: '12周',
    level: '初级',
    price: '¥2999'
  },
  {
    id: 2,
    slug: 'data-science',
    title: '数据科学与机器学习',
    description: '掌握数据分析和机器学习核心技能',
    image: '/images/courses/data-science.jpg',
    duration: '16周',
    level: '中级',
    price: '¥3999'
  },
  {
    id: 3,
    slug: 'mobile-development',
    title: '移动应用开发',
    description: '学习iOS和Android应用开发',
    image: '/images/courses/mobile-dev.jpg',
    duration: '10周',
    level: '中级',
    price: '¥2799'
  }
])

useHead({
  title: '所有课程',
  meta: [
    { name: 'description', content: '浏览我们精选的在线课程，涵盖Web开发、数据科学、移动开发等多个领域' },
    { name: 'keywords', content: '在线课程, Web开发, 数据科学, 移动开发, 编程课程' }
  ]
})

useSeoMeta({
  title: '所有课程',
  ogTitle: '所有课程 - ' + config.public.siteName,
  description: '浏览我们精选的在线课程，涵盖Web开发、数据科学、移动开发等多个领域',
  ogDescription: '浏览我们精选的在线课程，涵盖Web开发、数据科学、移动开发等多个领域',
  ogType: 'website',
  ogUrl: `${config.public.siteUrl}/courses`
})

useSchemaOrg([
  {
    '@type': 'ItemList',
    name: '课程列表',
    description: '在线课程目录',
    numberOfItems: courses.value.length,
    itemListElement: courses.value.map((course, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Course',
        name: course.title,
        description: course.description,
        url: `${config.public.siteUrl}/courses/${course.slug}`,
        provider: {
          '@type': 'Organization',
          name: config.public.siteName
        }
      }
    }))
  }
])
</script>

<style scoped>
.courses-page {
  padding: 4rem 1rem;
  min-height: 100vh;
  background: #f7fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2d3748;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.course-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.course-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-content {
  padding: 1.5rem;
}

.course-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: #2d3748;
}

.course-content p {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.course-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.duration,
.level {
  padding: 0.25rem 0.75rem;
  background: #edf2f7;
  border-radius: 4px;
  color: #4a5568;
}
</style>
