<template>
  <div class="home-page">
    <section class="hero">
      <div class="container">
        <h1>{{ config.public.siteName }}</h1>
        <p class="subtitle">{{ config.public.siteDescription }}</p>
        <NuxtLink to="/courses" class="cta-button">浏览课程</NuxtLink>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2>为什么选择我们</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <h3>专业课程</h3>
            <p>由行业专家精心打造的高质量课程内容</p>
          </div>
          <div class="feature-card">
            <h3>灵活学习</h3>
            <p>随时随地学习，按照自己的节奏进步</p>
          </div>
          <div class="feature-card">
            <h3>实践项目</h3>
            <p>通过真实项目获得实际经验</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

useHead({
  title: '首页',
  meta: [
    { name: 'description', content: config.public.siteDescription },
    { name: 'keywords', content: '在线教育, 在线课程, 学习平台, 职业培训' }
  ]
})

useSeoMeta({
  title: '首页',
  ogTitle: config.public.siteName,
  description: config.public.siteDescription,
  ogDescription: config.public.siteDescription,
  ogType: 'website',
  ogUrl: config.public.siteUrl,
  twitterCard: 'summary_large_image'
})

useSchemaOrg([
  {
    '@type': 'Organization',
    name: config.public.siteName,
    url: config.public.siteUrl,
    logo: `${config.public.siteUrl}/logo.png`,
    sameAs: []
  },
  {
    '@type': 'WebSite',
    name: config.public.siteName,
    url: config.public.siteUrl,
    description: config.public.siteDescription,
    inLanguage: 'zh-CN'
  }
])
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

.hero {
  padding: 4rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
}

.features {
  padding: 4rem 1rem;
}

.features h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #2d3748;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.feature-card p {
  color: #4a5568;
  line-height: 1.6;
}
</style>
