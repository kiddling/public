<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">分析仪表板</h1>
        <p class="mt-2 text-gray-600">用户行为统计和数据分析</p>
      </div>

      <!-- Time Range Selector -->
      <div class="mb-6">
        <div class="flex space-x-2">
          <button
            v-for="range in timeRanges"
            :key="range.value"
            @click="selectedTimeRange = range.value"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              selectedTimeRange === range.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            ]"
          >
            {{ range.label }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">加载统计数据失败，请稍后再试。</p>
      </div>

      <!-- Stats Dashboard -->
      <div v-else-if="stats" class="space-y-6">
        <!-- Overview Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总事件数"
            :value="stats.totalEvents"
            icon="📊"
            color="blue"
          />
          <StatCard
            title="会话数"
            :value="stats.totalSessions"
            icon="🔄"
            color="green"
          />
          <StatCard
            title="独立用户"
            :value="stats.uniqueUsers"
            icon="👥"
            color="purple"
          />
          <StatCard
            title="平均会话时长"
            :value="formatDuration(stats.avgSessionDuration)"
            icon="⏱️"
            color="orange"
          />
        </div>

        <!-- Popular Pages -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">热门页面</h2>
          <div v-if="stats.popularPages.length > 0" class="space-y-3">
            <div
              v-for="(page, index) in stats.popularPages"
              :key="page.path"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <span class="text-lg font-bold text-gray-400">{{ index + 1 }}</span>
                <div>
                  <p class="font-medium text-gray-900">{{ page.path }}</p>
                  <p class="text-sm text-gray-500">
                    平均停留时间: {{ formatDuration(page.avgDwellTime) }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-blue-600">{{ page.views }}</p>
                <p class="text-sm text-gray-500">次浏览</p>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-500 text-center py-4">暂无数据</p>
        </div>

        <!-- Popular Courses -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">热门课程</h2>
          <div v-if="stats.popularCourses.length > 0" class="space-y-3">
            <div
              v-for="(course, index) in stats.popularCourses"
              :key="course.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <span class="text-lg font-bold text-gray-400">{{ index + 1 }}</span>
                <div>
                  <p class="font-medium text-gray-900">{{ course.title }}</p>
                  <p class="text-sm text-gray-500">ID: {{ course.id }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-green-600">{{ course.views }}</p>
                <p class="text-sm text-gray-500">次浏览</p>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-500 text-center py-4">暂无数据</p>
        </div>

        <!-- Search Queries and Downloads -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Search Queries -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">热门搜索</h2>
            <div v-if="stats.searchQueries.length > 0" class="space-y-2">
              <div
                v-for="query in stats.searchQueries"
                :key="query.query"
                class="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <p class="text-gray-900">{{ query.query }}</p>
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {{ query.count }}
                </span>
              </div>
            </div>
            <p v-else class="text-gray-500 text-center py-4">暂无数据</p>
          </div>

          <!-- Downloads -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">热门下载</h2>
            <div v-if="stats.downloads.length > 0" class="space-y-2">
              <div
                v-for="download in stats.downloads"
                :key="download.resourceName"
                class="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <p class="text-gray-900">{{ download.resourceName }}</p>
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  {{ download.count }}
                </span>
              </div>
            </div>
            <p v-else class="text-gray-500 text-center py-4">暂无数据</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnalyticsStats } from '~/types/analytics'

definePageMeta({
  layout: 'default',
})

const timeRanges = [
  { label: '24小时', value: '24h' },
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' },
  { label: '全部', value: 'all' },
]

const selectedTimeRange = ref('7d')

const { data: stats, pending, error, refresh } = await useFetch<AnalyticsStats>(
  '/api/analytics/stats',
  {
    query: {
      timeRange: selectedTimeRange,
    },
    watch: [selectedTimeRange],
  }
)

const formatDuration = (ms: number): string => {
  if (!ms || ms === 0) return '0秒'
  
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

useHead({
  title: '分析仪表板 - 管理员',
})
</script>
