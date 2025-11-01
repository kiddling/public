<template>
  <div class="design-log-page container mx-auto px-4 py-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">设计日志系统</h1>

      <!-- Tabs -->
      <div class="mb-8 border-b border-gray-200">
        <nav class="flex space-x-8">
          <button
            @click="activeTab = 'form'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'form'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            创建日志
          </button>
          <button
            @click="activeTab = 'list'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            日志列表 ({{ logs.length }})
          </button>
          <button
            @click="activeTab = 'drafts'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'drafts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            草稿箱 ({{ drafts.length }})
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'form'">
        <DesignLogForm />
      </div>

      <div v-if="activeTab === 'list'" class="space-y-4">
        <!-- Search and Filter -->
        <div class="flex gap-4 mb-6">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索项目名称、标签..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            v-model="filterType"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">所有类型</option>
            <option value="web">网页设计</option>
            <option value="mobile">移动应用</option>
            <option value="graphic">平面设计</option>
            <option value="ui-ux">UI/UX设计</option>
            <option value="other">其他</option>
          </select>
        </div>

        <!-- Export Options -->
        <div class="flex gap-4 mb-6">
          <button
            @click="exportAllAsJSON"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            导出 JSON
          </button>
          <button
            @click="exportAllAsPDF"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            导出全部为 PDF
          </button>
        </div>

        <!-- Logs List -->
        <div v-if="filteredLogs.length === 0" class="text-center py-12 text-gray-500">
          <p class="text-lg">暂无设计日志</p>
          <p class="text-sm mt-2">点击"创建日志"开始记录你的设计过程</p>
        </div>

        <div v-else class="grid gap-4">
          <div
            v-for="log in filteredLogs"
            :key="log.id"
            class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-semibold mb-2">{{ log.projectName }}</h3>
                <div class="flex gap-2 text-sm text-gray-600">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {{ getProjectTypeLabel(log.projectType) }}
                  </span>
                  <span>{{ log.date }}</span>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="viewLog(log)"
                  class="text-blue-600 hover:text-blue-800"
                  title="查看详情"
                >
                  👁️
                </button>
                <button
                  @click="downloadLogPDF(log)"
                  class="text-green-600 hover:text-green-800"
                  title="导出 PDF"
                >
                  📄
                </button>
                <button
                  @click="deleteLog(log.id!)"
                  class="text-red-600 hover:text-red-800"
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>

            <p class="text-gray-700 mb-3 line-clamp-2">{{ log.objective }}</p>

            <div v-if="log.tags" class="flex flex-wrap gap-2">
              <span
                v-for="tag in log.tags.split(',')"
                :key="tag"
                class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
              >
                {{ tag.trim() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'drafts'" class="space-y-4">
        <div v-if="drafts.length === 0" class="text-center py-12 text-gray-500">
          <p class="text-lg">暂无草稿</p>
        </div>

        <div v-else class="grid gap-4">
          <div
            v-for="draft in drafts"
            :key="draft.id"
            class="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-xl font-semibold mb-2">
                  {{ draft.projectName || '未命名草稿' }}
                </h3>
                <p class="text-sm text-gray-600">
                  最后更新: {{ new Date(draft.updatedAt).toLocaleString('zh-CN') }}
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  @click="loadDraft(draft)"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  继续编辑
                </button>
                <button
                  @click="deleteDraft(draft.id!)"
                  class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const activeTab = ref('form');
const logs = ref<any[]>([]);
const drafts = ref<any[]>([]);
const searchQuery = ref('');
const filterType = ref('');

const { getAllDesignLogs, deleteDesignLog, exportAllLogs, getAllDrafts, deleteDraft: deleteDraftFromDB } = useDesignLogStorage();
const { exportToPDF } = useDesignLogPDF();

onMounted(async () => {
  await loadLogs();
  await loadDrafts();
});

const loadLogs = async () => {
  logs.value = await getAllDesignLogs();
};

const loadDrafts = async () => {
  drafts.value = await getAllDrafts();
};

const filteredLogs = computed(() => {
  let filtered = logs.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(log =>
      log.projectName.toLowerCase().includes(query) ||
      log.tags?.toLowerCase().includes(query) ||
      log.objective?.toLowerCase().includes(query)
    );
  }

  if (filterType.value) {
    filtered = filtered.filter(log => log.projectType === filterType.value);
  }

  return filtered;
});

const getProjectTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    web: '网页设计',
    mobile: '移动应用',
    graphic: '平面设计',
    'ui-ux': 'UI/UX设计',
    other: '其他',
  };
  return labels[type] || type;
};

const viewLog = (log: any) => {
  // TODO: Implement modal or detail page
  console.log('Viewing log:', log);
};

const downloadLogPDF = async (log: any) => {
  await exportToPDF(log);
};

const deleteLog = async (id: number) => {
  if (confirm('确定要删除这个设计日志吗？')) {
    await deleteDesignLog(id);
    await loadLogs();
  }
};

const exportAllAsJSON = async () => {
  const json = await exportAllLogs();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `design-logs-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportAllAsPDF = async () => {
  // TODO: Implement batch PDF export
  alert('批量导出功能开发中...');
};

const loadDraft = (draft: any) => {
  // TODO: Load draft into form
  activeTab.value = 'form';
  console.log('Loading draft:', draft);
};

const deleteDraft = async (id: number) => {
  if (confirm('确定要删除这个草稿吗？')) {
    await deleteDraftFromDB(id);
    await loadDrafts();
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
