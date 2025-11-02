<template>
  <div>
    <div
      v-if="isOpen"
      class="overlay"
      aria-hidden="true"
      @click="$emit('close')"
    />
    <aside
      class="sidebar"
      :class="{ 'is-open': isOpen }"
      role="navigation"
      aria-label="Course navigation"
    >
      <div class="sidebar-header">
        <h2 class="sidebar-title">
          Course Outline
        </h2>
        <button
          class="close-button"
          aria-label="Close navigation"
          @click="$emit('close')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
            />
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
            />
          </svg>
        </button>
      </div>

      <div class="sidebar-content">
        <SearchBox @select="handleLessonSelect" />
        <nav class="navigation-tree">
          <ul
            role="tree"
            aria-label="Course structure"
          >
            <li
              v-for="loop in courseStructure.loops"
              :key="loop.id"
              role="treeitem"
              :aria-expanded="expandedLoops.has(loop.id)"
            >
              <button
                class="nav-item loop-item"
                :style="{ borderLeftColor: loop.color }"
                @click="toggleLoop(loop.id)"
              >
                <span class="nav-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    :class="{ rotated: expandedLoops.has(loop.id) }"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
                <span class="nav-code">{{ loop.code }}</span>
                <span class="nav-label">{{ loop.name }}</span>
              </button>

              <ul
                v-if="expandedLoops.has(loop.id)"
                role="group"
                class="nested-list"
              >
                <li
                  v-for="part in loop.parts"
                  :key="part.id"
                  role="treeitem"
                  :aria-expanded="expandedParts.has(part.id)"
                >
                  <button
                    class="nav-item part-item"
                    :style="{ borderLeftColor: part.color }"
                    @click="togglePart(part.id)"
                  >
                    <span class="nav-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        :class="{ rotated: expandedParts.has(part.id) }"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                    <span class="nav-code">{{ part.code }}</span>
                    <span class="nav-label">{{ part.name }}</span>
                  </button>

                  <ul
                    v-if="expandedParts.has(part.id)"
                    role="group"
                    class="nested-list"
                  >
                    <li
                      v-for="lesson in part.lessons"
                      :key="lesson.id"
                      role="treeitem"
                    >
                      <RouterLink
                        :to="`/lesson/${lesson.slug}`"
                        class="nav-item lesson-item"
                        :class="{ 
                          active: currentRoute?.params.slug === lesson.slug,
                          completed: progressStore.isLessonComplete(lesson.id)
                        }"
                        :style="{ borderLeftColor: part.color }"
                        @click="$emit('close')"
                      >
                        <span class="nav-icon completion-icon">
                          <svg
                            v-if="progressStore.isLessonComplete(lesson.id)"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span class="nav-code">{{ lesson.code }}</span>
                        <span class="nav-label">{{ lesson.title }}</span>
                      </RouterLink>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCourseStructure } from '@/services/strapiService'
import { useProgressStore } from '@/stores/progressStore'
import SearchBox from '@/components/SearchBox.vue'

defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const courseStructure = ref({ loops: [] })
const expandedLoops = ref(new Set())
const expandedParts = ref(new Set())
const progressStore = useProgressStore()
const currentRoute = useRoute()
const router = useRouter()

async function loadCourseStructure() {
  courseStructure.value = await getCourseStructure()
  expandedLoops.value = new Set([1])
  expandedParts.value = new Set([1])
}

function toggleLoop(loopId) {
  if (expandedLoops.value.has(loopId)) {
    expandedLoops.value.delete(loopId)
  } else {
    expandedLoops.value.add(loopId)
  }
}

function togglePart(partId) {
  if (expandedParts.value.has(partId)) {
    expandedParts.value.delete(partId)
  } else {
    expandedParts.value.add(partId)
  }
}

function handleLessonSelect(lesson) {
  router.push(`/lesson/${lesson.slug}`)
  emit('close')
}

onMounted(() => {
  loadCourseStructure()
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 200;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 201;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.sidebar.is-open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  height: var(--header-height);
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: var(--color-border);
}

.close-button:focus {
  outline: 2px solid var(--color-loop-1);
  outline-offset: 2px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.navigation-tree {
  margin-top: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  text-align: left;
  border-radius: 6px;
  border-left: 3px solid transparent;
  transition: background-color 0.2s;
  font-size: 0.875rem;
}

.nav-item:hover {
  background-color: var(--color-border);
}

.nav-item:focus {
  outline: 2px solid var(--color-loop-1);
  outline-offset: 2px;
}

.loop-item {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.part-item {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.lesson-item {
  font-weight: 400;
  color: var(--color-text-muted);
}

.lesson-item.active {
  background-color: var(--color-border);
  font-weight: 500;
  color: var(--color-text);
}

.lesson-item.completed .nav-code {
  text-decoration: line-through;
  opacity: 0.7;
}

.nested-list {
  margin-left: 0.75rem;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.nav-icon.rotated {
  transform: rotate(90deg);
}

.completion-icon {
  color: var(--color-success);
}

.nav-code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  opacity: 0.8;
  min-width: 3rem;
}

.nav-label {
  flex: 1;
}

@media (min-width: 1024px) {
  .overlay {
    display: none;
  }

  .sidebar {
    transform: translateX(0);
    top: var(--header-height);
    height: calc(100vh - var(--header-height));
  }

  .sidebar-header {
    display: none;
  }

  .close-button {
    display: none;
  }
}
</style>
