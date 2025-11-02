<template>
  <div class="container">
    <h1>CMS Data Layer Demo</h1>
    
    <section>
      <h2>Quick Links</h2>
      <nav>
        <ul>
          <li><NuxtLink to="/lessons">Lessons</NuxtLink></li>
          <li><NuxtLink to="/knowledge-cards">Knowledge Cards</NuxtLink></li>
          <li><NuxtLink to="/student-works">Student Works</NuxtLink></li>
          <li><NuxtLink to="/resources">Resources</NuxtLink></li>
        </ul>
      </nav>
    </section>

    <section>
      <h2>About</h2>
      <p>
        This application demonstrates a complete CMS data layer integration with Strapi.
        It includes typed composables, SSR-aware caching, ISR support, and comprehensive error handling.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'CMS Data Layer Demo',
  meta: [
    { name: 'description', content: 'Nuxt app with Strapi CMS integration' }
  ],
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

nav ul {
  list-style: none;
  padding: 0;
}

nav li {
  margin: 0.5rem 0;
}

nav a {
  color: #0070f3;
  text-decoration: none;
}

nav a:hover {
  text-decoration: underline;
}

section {
  margin: 2rem 0;
}
</style>
