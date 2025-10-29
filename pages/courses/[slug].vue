<template>
  <div v-if="course" class="course-detail">
    <div class="container">
      <div class="breadcrumb">
        <NuxtLink to="/">首页</NuxtLink>
        <span class="separator">/</span>
        <NuxtLink to="/courses">课程</NuxtLink>
        <span class="separator">/</span>
        <span>{{ course.title }}</span>
      </div>

      <div class="course-header">
        <div class="course-info">
          <h1>{{ course.title }}</h1>
          <p class="description">{{ course.description }}</p>
          <div class="meta-info">
            <span class="duration">⏱ {{ course.duration }}</span>
            <span class="level">📊 {{ course.level }}</span>
            <span class="students">👥 {{ course.students }} 学员</span>
          </div>
          <div class="price-section">
            <span class="price">{{ course.price }}</span>
            <button class="enroll-button">立即报名</button>
          </div>
        </div>
        <div class="course-image">
          <img :src="course.image" :alt="course.title" />
        </div>
      </div>

      <div class="course-content">
        <section class="section">
          <h2>课程简介</h2>
          <p>{{ course.fullDescription }}</p>
        </section>

        <section class="section">
          <h2>你将学到</h2>
          <ul class="learning-objectives">
            <li v-for="(objective, index) in course.objectives" :key="index">
              {{ objective }}
            </li>
          </ul>
        </section>

        <section class="section">
          <h2>课程大纲</h2>
          <div class="curriculum">
            <div 
              v-for="(module, index) in course.curriculum" 
              :key="index"
              class="module"
            >
              <h3>{{ module.title }}</h3>
              <ul>
                <li v-for="(lesson, lessonIndex) in module.lessons" :key="lessonIndex">
                  {{ lesson }}
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()

const coursesData = {
  'web-development': {
    id: 1,
    slug: 'web-development',
    title: 'Web开发全栈课程',
    description: '从零开始学习现代Web开发技术',
    fullDescription: '这是一门全面的Web开发课程，涵盖前端和后端开发的所有关键技术。通过本课程，你将掌握HTML、CSS、JavaScript、Vue.js、Node.js等核心技术，并能够独立开发完整的Web应用。',
    image: '/images/courses/web-dev.jpg',
    duration: '12周',
    level: '初级',
    price: '¥2999',
    students: '1250',
    objectives: [
      '掌握HTML5和CSS3的核心特性',
      '精通JavaScript和ES6+语法',
      '学会使用Vue.js构建单页应用',
      '理解Node.js和Express框架',
      '掌握数据库设计和操作',
      '学习RESTful API设计'
    ],
    curriculum: [
      {
        title: '模块1：前端基础',
        lessons: [
          'HTML5语义化标签',
          'CSS3布局和动画',
          'JavaScript基础语法',
          '响应式设计'
        ]
      },
      {
        title: '模块2：现代前端框架',
        lessons: [
          'Vue.js核心概念',
          '组件化开发',
          '状态管理',
          '路由配置'
        ]
      },
      {
        title: '模块3：后端开发',
        lessons: [
          'Node.js基础',
          'Express框架',
          '数据库集成',
          'API开发'
        ]
      }
    ]
  },
  'data-science': {
    id: 2,
    slug: 'data-science',
    title: '数据科学与机器学习',
    description: '掌握数据分析和机器学习核心技能',
    fullDescription: '深入学习数据科学和机器学习的理论与实践。课程涵盖Python编程、数据分析、机器学习算法、深度学习等内容，帮助你成为数据科学专家。',
    image: '/images/courses/data-science.jpg',
    duration: '16周',
    level: '中级',
    price: '¥3999',
    students: '890',
    objectives: [
      '掌握Python数据分析工具',
      '理解统计学基础知识',
      '学会机器学习算法',
      '掌握深度学习框架',
      '实践真实数据项目'
    ],
    curriculum: [
      {
        title: '模块1：Python与数据分析',
        lessons: [
          'Python编程基础',
          'NumPy和Pandas',
          '数据可视化',
          '数据清洗'
        ]
      },
      {
        title: '模块2：机器学习',
        lessons: [
          '监督学习算法',
          '非监督学习算法',
          '模型评估',
          '特征工程'
        ]
      }
    ]
  },
  'mobile-development': {
    id: 3,
    slug: 'mobile-development',
    title: '移动应用开发',
    description: '学习iOS和Android应用开发',
    fullDescription: '全面学习移动应用开发技术，包括iOS和Android平台。课程涵盖原生开发和跨平台开发方案，让你能够开发高质量的移动应用。',
    image: '/images/courses/mobile-dev.jpg',
    duration: '10周',
    level: '中级',
    price: '¥2799',
    students: '760',
    objectives: [
      '掌握移动应用开发基础',
      '学习React Native跨平台开发',
      '理解移动UI/UX设计',
      '掌握移动应用性能优化',
      '学习应用发布流程'
    ],
    curriculum: [
      {
        title: '模块1：移动开发基础',
        lessons: [
          '移动开发概述',
          '开发环境搭建',
          'UI组件',
          '导航系统'
        ]
      },
      {
        title: '模块2：高级特性',
        lessons: [
          '状态管理',
          '网络请求',
          '本地存储',
          '推送通知'
        ]
      }
    ]
  }
}

const course = computed(() => coursesData[route.params.slug as string])

if (!course.value) {
  throw createError({ statusCode: 404, statusMessage: 'Course Not Found' })
}

useHead({
  title: course.value.title,
  meta: [
    { name: 'description', content: course.value.fullDescription },
    { name: 'keywords', content: `${course.value.title}, 在线课程, 在线学习` }
  ]
})

useSeoMeta({
  title: course.value.title,
  ogTitle: `${course.value.title} - ${config.public.siteName}`,
  description: course.value.fullDescription,
  ogDescription: course.value.fullDescription,
  ogType: 'website',
  ogUrl: `${config.public.siteUrl}/courses/${course.value.slug}`
})

useSchemaOrg([
  {
    '@type': 'Course',
    name: course.value.title,
    description: course.value.fullDescription,
    url: `${config.public.siteUrl}/courses/${course.value.slug}`,
    provider: {
      '@type': 'Organization',
      name: config.public.siteName,
      url: config.public.siteUrl
    },
    educationalLevel: course.value.level,
    timeRequired: course.value.duration,
    offers: {
      '@type': 'Offer',
      price: course.value.price.replace('¥', ''),
      priceCurrency: 'CNY',
      availability: 'https://schema.org/InStock'
    }
  },
  {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '首页',
        item: config.public.siteUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '课程',
        item: `${config.public.siteUrl}/courses`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: course.value.title,
        item: `${config.public.siteUrl}/courses/${course.value.slug}`
      }
    ]
  }
])
</script>

<style scoped>
.course-detail {
  padding: 2rem 1rem;
  min-height: 100vh;
  background: #f7fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.breadcrumb {
  margin-bottom: 2rem;
  font-size: 0.875rem;
  color: #4a5568;
}

.breadcrumb a {
  color: #667eea;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 0.5rem;
}

.course-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.course-info h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2d3748;
}

.description {
  font-size: 1.25rem;
  color: #4a5568;
  margin-bottom: 1.5rem;
}

.meta-info {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  font-size: 1rem;
  color: #4a5568;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.price {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.enroll-button {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.enroll-button:hover {
  transform: translateY(-2px);
}

.course-image {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section {
  margin-bottom: 3rem;
}

.section h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.section p {
  color: #4a5568;
  line-height: 1.8;
  font-size: 1.125rem;
}

.learning-objectives {
  list-style: none;
  padding: 0;
}

.learning-objectives li {
  padding: 0.75rem 0;
  padding-left: 2rem;
  position: relative;
  color: #4a5568;
  line-height: 1.6;
}

.learning-objectives li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #48bb78;
  font-weight: bold;
}

.curriculum {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.module {
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 8px;
}

.module h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2d3748;
}

.module ul {
  list-style: none;
  padding: 0;
}

.module li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: #4a5568;
}

.module li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

@media (max-width: 768px) {
  .course-header {
    grid-template-columns: 1fr;
  }
  
  .course-info h1 {
    font-size: 2rem;
  }
}
</style>
