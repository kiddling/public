<template>
  <div class="resources-page">
    <div class="container">
      <h1>学习资源</h1>
      <p class="intro">免费的学习资源，帮助你提升技能</p>

      <div class="resources-grid">
        <article 
          v-for="resource in resources" 
          :key="resource.id"
          class="resource-card"
        >
          <div class="resource-type">{{ resource.type }}</div>
          <h3>{{ resource.title }}</h3>
          <p>{{ resource.description }}</p>
          <a :href="resource.link" target="_blank" rel="noopener noreferrer" class="resource-link">
            查看资源 →
          </a>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const resources = ref([
  {
    id: 1,
    type: '文章',
    title: 'JavaScript最佳实践指南',
    description: '学习编写高质量JavaScript代码的最佳实践和常见陷阱',
    link: '#'
  },
  {
    id: 2,
    type: '视频',
    title: 'Vue 3 组合式API教程',
    description: '深入理解Vue 3的组合式API和响应式系统',
    link: '#'
  },
  {
    id: 3,
    type: '工具',
    title: '开发者工具箱',
    description: '精选的开发工具和资源列表，提高开发效率',
    link: '#'
  },
  {
    id: 4,
    type: '文档',
    title: 'Web性能优化清单',
    description: '全面的Web性能优化检查清单和实施指南',
    link: '#'
  }
])

useHead({
  title: '学习资源',
  meta: [
    { name: 'description', content: '免费的在线学习资源，包括文章、视频、工具和文档' },
    { name: 'keywords', content: '学习资源, 编程教程, 开发工具, 技术文档' }
  ]
})

useSeoMeta({
  title: '学习资源',
  ogTitle: '学习资源 - ' + config.public.siteName,
  description: '免费的在线学习资源，包括文章、视频、工具和文档',
  ogDescription: '免费的在线学习资源，包括文章、视频、工具和文档',
  ogType: 'website',
  ogUrl: `${config.public.siteUrl}/resources`
})

useSchemaOrg([
  {
    '@type': 'ItemList',
    name: '学习资源列表',
    description: '免费学习资源集合',
    numberOfItems: resources.value.length,
    itemListElement: resources.value.map((resource, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: resource.title,
        description: resource.description,
        url: resource.link
      }
    }))
  }
])
</script>

<style scoped>
.resources-page {
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
  margin-bottom: 1rem;
  color: #2d3748;
}

.intro {
  font-size: 1.25rem;
  color: #4a5568;
  margin-bottom: 3rem;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.resource-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.resource-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.resource-type {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #667eea;
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.resource-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: #2d3748;
}

.resource-card p {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.resource-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.resource-link:hover {
  text-decoration: underline;
}
</style>
