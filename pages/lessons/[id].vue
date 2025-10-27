<template>
  <div class="container">
    <div v-if="pending" class="loading">Loading lesson...</div>
    
    <div v-else-if="error" class="error">
      <p>Error loading lesson: {{ error.message }}</p>
      <button @click="refresh">Retry</button>
      <NuxtLink to="/lessons" class="back-link">← Back to Lessons</NuxtLink>
    </div>

    <div v-else-if="!lesson" class="error">
      <p>Lesson not found</p>
      <NuxtLink to="/lessons" class="back-link">← Back to Lessons</NuxtLink>
    </div>

    <article v-else class="lesson">
      <header>
        <NuxtLink to="/lessons" class="back-link">← Back to Lessons</NuxtLink>
        <h1>{{ lesson.attributes.title }}</h1>
        
        <div class="meta">
          <span v-if="lesson.attributes.grade">Grade: {{ lesson.attributes.grade }}</span>
          <span v-if="lesson.attributes.subject">Subject: {{ lesson.attributes.subject }}</span>
          <span v-if="lesson.attributes.duration">Duration: {{ lesson.attributes.duration }} minutes</span>
        </div>
      </header>

      <div v-if="lesson.attributes.description" class="description">
        {{ lesson.attributes.description }}
      </div>

      <section v-if="lesson.attributes.objectives && lesson.attributes.objectives.length > 0">
        <h2>Learning Objectives</h2>
        <ul>
          <li v-for="(objective, index) in lesson.attributes.objectives" :key="index">
            {{ objective }}
          </li>
        </ul>
      </section>

      <section v-if="lesson.attributes.materials && lesson.attributes.materials.length > 0">
        <h2>Required Materials</h2>
        <ul>
          <li v-for="(material, index) in lesson.attributes.materials" :key="index">
            {{ material }}
          </li>
        </ul>
      </section>

      <section v-if="lesson.attributes.content">
        <h2>Lesson Content</h2>
        <div class="content" v-html="lesson.attributes.content" />
      </section>

      <section v-if="hasKnowledgeCards" class="related">
        <h2>Related Knowledge Cards</h2>
        <p>This lesson includes {{ knowledgeCardsCount }} knowledge card(s).</p>
      </section>

      <section v-if="hasResources" class="related">
        <h2>Resources</h2>
        <p>This lesson includes {{ resourcesCount }} resource(s).</p>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const lessonId = computed(() => route.params.id as string);

const { lesson, pending, error, refresh } = useLesson(lessonId);

const hasKnowledgeCards = computed(() => {
  if (!lesson.value?.attributes.knowledgeCards) return false;
  const data = lesson.value.attributes.knowledgeCards.data;
  return Array.isArray(data) && data.length > 0;
});

const knowledgeCardsCount = computed(() => {
  if (!hasKnowledgeCards.value) return 0;
  const data = lesson.value!.attributes.knowledgeCards!.data;
  return Array.isArray(data) ? data.length : 0;
});

const hasResources = computed(() => {
  if (!lesson.value?.attributes.resources) return false;
  const data = lesson.value.attributes.resources.data;
  return Array.isArray(data) && data.length > 0;
});

const resourcesCount = computed(() => {
  if (!hasResources.value) return 0;
  const data = lesson.value!.attributes.resources!.data;
  return Array.isArray(data) ? data.length : 0;
});

useHead(() => ({
  title: lesson.value ? lesson.value.attributes.title : 'Lesson',
  meta: [
    {
      name: 'description',
      content: lesson.value?.attributes.description || 'Lesson details',
    },
  ],
}));
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
}

.error button {
  margin: 1rem;
  padding: 0.5rem 1rem;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: #0070f3;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.lesson header h1 {
  margin: 0.5rem 0;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
  color: #666;
  font-size: 0.875rem;
}

.description {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
}

section {
  margin: 2rem 0;
}

section h2 {
  margin-bottom: 1rem;
}

ul {
  padding-left: 1.5rem;
}

li {
  margin: 0.5rem 0;
}

.content {
  line-height: 1.6;
}

.related {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}
</style>
