<template>
  <div class="app-layout">
    <header class="site-header">
      <div class="container">
        <nav class="nav">
          <NuxtLink to="/" class="logo">{{ config.public.siteName }}</NuxtLink>
          <div class="nav-links">
            <NuxtLink to="/">首页</NuxtLink>
            <NuxtLink to="/courses">课程</NuxtLink>
            <NuxtLink to="/resources">资源</NuxtLink>
          </div>
        </nav>
      </div>
    </header>

    <main class="site-main">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>{{ config.public.siteName }}</h3>
            <p>{{ config.public.siteDescription }}</p>
          </div>
          <div class="footer-section">
            <h4>快速链接</h4>
            <ul>
              <li><NuxtLink to="/">首页</NuxtLink></li>
              <li><NuxtLink to="/courses">课程</NuxtLink></li>
              <li><NuxtLink to="/resources">资源</NuxtLink></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>联系我们</h4>
            <p>邮箱: contact@example.com</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p v-if="config.public.icpNumber">
            <a :href="`https://beian.miit.gov.cn/`" target="_blank" rel="noopener noreferrer">
              {{ config.public.icpNumber }}
            </a>
          </p>
          <p>&copy; {{ new Date().getFullYear() }} {{ config.public.siteName }}. 保留所有权利.</p>
        </div>
      </div>
    </footer>

    <CookieConsent />
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.site-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: #2d3748;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #667eea;
}

.site-main {
  flex: 1;
}

.site-footer {
  background: #2d3748;
  color: white;
  padding: 3rem 0 1rem;
  margin-top: 4rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.footer-section h4 {
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #cbd5e0;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-section a:hover {
  color: white;
}

.footer-section p {
  color: #cbd5e0;
  line-height: 1.6;
}

.footer-bottom {
  border-top: 1px solid #4a5568;
  padding-top: 1rem;
  text-align: center;
}

.footer-bottom p {
  margin: 0.5rem 0;
  color: #cbd5e0;
  font-size: 0.875rem;
}

.footer-bottom a {
  color: #cbd5e0;
  text-decoration: none;
}

.footer-bottom a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
}
</style>
