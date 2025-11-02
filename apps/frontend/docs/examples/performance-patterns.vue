<template>
  <div class="performance-patterns-examples">
    <!-- Example 1: Lazy Loading Heavy Components -->
    <section class="example-section">
      <h2>1. 懒加载重型组件 (Lazy Loading Heavy Components)</h2>

      <!-- Only load when needed -->
      <LazyHeavyChart v-if="showChart" :data="chartData" />

      <button @click="showChart = !showChart">
        {{ showChart ? '隐藏图表' : '显示图表' }}
      </button>
    </section>

    <!-- Example 2: Virtual Scrolling for Long Lists -->
    <section class="example-section">
      <h2>2. 虚拟滚动优化长列表 (Virtual Scrolling)</h2>

      <!-- For lists > 100 items, use virtual scrolling -->
      <div v-if="items.length > 100" class="virtual-list">
        <!-- Would use vue-virtual-scroller here -->
        <div v-for="item in visibleItems" :key="item.id">
          {{ item.name }}
        </div>
      </div>

      <!-- Regular list for small datasets -->
      <div v-else>
        <div v-for="item in items" :key="item.id">
          {{ item.name }}
        </div>
      </div>
    </section>

    <!-- Example 3: Debounced Search -->
    <section class="example-section">
      <h2>3. 防抖搜索 (Debounced Search)</h2>

      <input
        v-model="searchQuery"
        @input="debouncedSearch"
        type="text"
        placeholder="搜索..."
        class="search-input"
      />

      <p>搜索中: {{ isSearching ? '是' : '否' }}</p>
      <p>结果: {{ searchResults.length }} 项</p>
    </section>

    <!-- Example 4: Throttled Scroll -->
    <section class="example-section">
      <h2>4. 节流滚动 (Throttled Scroll)</h2>

      <div class="scrollable" @scroll="throttledScroll">
        <div v-for="i in 100" :key="i" class="scroll-item">Item {{ i }}</div>
      </div>

      <p>滚动位置: {{ scrollPosition }}px</p>
    </section>

    <!-- Example 5: v-memo for Expensive Renders -->
    <section class="example-section">
      <h2>5. v-memo 优化渲染 (Memoized Rendering)</h2>

      <!-- Only re-render when these dependencies change -->
      <div v-for="item in expensiveItems" :key="item.id" v-memo="[item.id, item.updatedAt]">
        <ExpensiveComponent :item="item" />
      </div>
    </section>

    <!-- Example 6: v-once for Static Content -->
    <section class="example-section">
      <h2>6. v-once 静态内容 (Static Content)</h2>

      <!-- Render once and never update -->
      <div v-once>
        <h3>{{ staticTitle }}</h3>
        <p>{{ staticDescription }}</p>
      </div>
    </section>

    <!-- Example 7: Computed Caching -->
    <section class="example-section">
      <h2>7. 计算属性缓存 (Computed Caching)</h2>

      <!-- Uses cached value unless dependencies change -->
      <p>过滤后的项目: {{ filteredItems.length }}</p>
      <p>总价: {{ totalPrice }}</p>
    </section>

    <!-- Example 8: Dynamic Imports -->
    <section class="example-section">
      <h2>8. 动态导入 (Dynamic Imports)</h2>

      <button @click="exportPDF">导出 PDF</button>
      <button @click="generateQR">生成二维码</button>
    </section>

    <!-- Example 9: Image Optimization -->
    <section class="example-section">
      <h2>9. 图片优化 (Image Optimization)</h2>

      <!-- Auto WebP conversion and responsive images -->
      <NuxtImg
        src="/images/sample.jpg"
        sizes="sm:100vw md:50vw lg:400px"
        loading="lazy"
        preset="card"
        alt="Sample image"
      />
    </section>

    <!-- Example 10: Slow Connection Detection -->
    <section class="example-section">
      <h2>10. 慢速连接检测 (Slow Connection Detection)</h2>

      <p>连接速度: {{ connectionSpeed }}</p>
      <p>慢速连接: {{ isSlowConnection ? '是' : '否' }}</p>

      <div v-if="isSlowConnection">
        <p class="warning">检测到慢速连接，已启用低质量模式</p>
      </div>
    </section>

    <!-- Example 11: Preloading -->
    <section class="example-section">
      <h2>11. 资源预加载 (Resource Preloading)</h2>

      <button @click="preloadNextPage">预加载下一页</button>
      <button @click="preloadFont">预加载字体</button>
    </section>

    <!-- Example 12: Reduce Motion -->
    <section class="example-section">
      <h2>12. 减少动画 (Reduced Motion)</h2>

      <div :class="{ 'animate-fade-in': !reducedMotion }" class="animated-box">
        {{ reducedMotion ? '静态模式' : '动画模式' }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Performance utilities
const {
  debounce,
  throttle,
  getConnectionSpeed,
  isSlowConnection: checkSlowConnection,
  prefersReducedMotion,
  preloadResource,
  prefetchResource,
  mark,
  measure,
} = usePerformance()

// Example 1: Lazy Loading
const showChart = ref(false)
const chartData = ref([1, 2, 3, 4, 5])

// Example 2: Virtual Scrolling
const items = ref(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }))
)
const visibleItems = computed(() => items.value.slice(0, 50))

// Example 3: Debounced Search
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)

const performSearch = async (query: string) => {
  isSearching.value = true
  mark('search-start')

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))

  searchResults.value = items.value.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  )

  mark('search-end')
  measure('search-duration', 'search-start', 'search-end')
  isSearching.value = false
}

const debouncedSearch = debounce(performSearch, 300)

// Example 4: Throttled Scroll
const scrollPosition = ref(0)
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollPosition.value = target.scrollTop
}
const throttledScroll = throttle(handleScroll, 100)

// Example 5: v-memo
const expensiveItems = ref([
  { id: 1, name: 'Item 1', updatedAt: Date.now() },
  { id: 2, name: 'Item 2', updatedAt: Date.now() },
])

// Example 6: v-once
const staticTitle = '这是静态标题'
const staticDescription = '这段内容永远不会改变'

// Example 7: Computed Caching
const filteredItems = computed(() => {
  console.log('Filtered items computed')
  return items.value.filter((item) => item.id % 2 === 0)
})

const totalPrice = computed(() => {
  console.log('Total price computed')
  return filteredItems.value.length * 100
})

// Example 8: Dynamic Imports
const exportPDF = async () => {
  mark('pdf-import-start')
  const { jsPDF } = await import('jspdf')
  mark('pdf-import-end')
  measure('pdf-import', 'pdf-import-start', 'pdf-import-end')

  // Use jsPDF
  console.log('Exporting PDF...')
}

const generateQR = async () => {
  mark('qr-import-start')
  const QRCode = await import('qrcode')
  mark('qr-import-end')
  measure('qr-import', 'qr-import-start', 'qr-import-end')

  // Use QRCode
  console.log('Generating QR code...')
}

// Example 10: Connection Detection
const connectionSpeed = ref(getConnectionSpeed())
const isSlowConnection = ref(checkSlowConnection())

// Example 11: Preloading
const preloadNextPage = () => {
  prefetchResource('/api/lessons/next')
}

const preloadFont = () => {
  preloadResource('/fonts/source-han-sans.woff2', 'font')
}

// Example 12: Reduced Motion
const reducedMotion = ref(prefersReducedMotion())
</script>

<style scoped>
.performance-patterns-examples {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 3rem;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.example-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.scrollable {
  height: 200px;
  overflow-y: auto;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 1rem;
}

.scroll-item {
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.animated-box {
  padding: 2rem;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  text-align: center;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none;
  }
}

.warning {
  padding: 1rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  margin-top: 0.5rem;
}

button:hover {
  background: #2563eb;
}

.virtual-list {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 1rem;
}
</style>
