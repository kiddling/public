# 设计日志系统 (Design Log System)

设计日志系统是一个完整的工具套件，帮助学生记录、管理和回顾设计过程。

## 📋 功能特性

### 1. 设计日志表单
- ✅ 交互式表单，结构化记录设计过程
- ✅ 项目信息管理
- ✅ 设计过程追踪
- ✅ 结果与反思
- ✅ 标签和分类

### 2. 本地存储 (IndexedDB)
- ✅ 离线可用，无需网络连接
- ✅ 自动保存和草稿功能
- ✅ 快速搜索和过滤
- ✅ 数据导入导出

### 3. PDF 导出
- ✅ 一键导出为专业 PDF 文档
- ✅ 格式化布局
- ✅ 支持中文字体
- ✅ 批量导出

### 4. 设计模板 API
- ✅ Strapi 自定义 API 端点
- ✅ 模板管理
- ✅ RESTful 接口

## 🚀 快速开始

### 访问设计日志

```
http://localhost:3000/design-log
```

### 功能导航

系统提供三个主要标签页：

1. **创建日志** - 填写新的设计日志
2. **日志列表** - 查看和管理已保存的日志
3. **草稿箱** - 恢复未完成的草稿

## 📝 创建设计日志

### 1. 填写项目信息

- **项目名称**: 给你的设计项目命名
- **项目类型**: 选择设计类型
  - 网页设计
  - 移动应用
  - 平面设计
  - UI/UX设计
  - 其他
- **日期**: 项目日期（默认今天）

### 2. 记录设计过程

- **设计目标**: 描述设计的目的和需求
- **灵感来源**: 记录灵感和参考资料
- **设计步骤**: 详细描述设计过程和决策
- **遇到的挑战**: 记录问题和解决方案

### 3. 总结结果

- **最终成果**: 描述最终设计成果
- **反思总结**: 总结经验和改进方向
- **后续计划**: 记录后续改进和优化计划

### 4. 添加标签

- **标签**: 用逗号分隔的关键词
- **使用工具**: 记录使用的设计工具

### 5. 保存选项

- **保存日志**: 完成并保存到 IndexedDB
- **保存草稿**: 保存未完成的草稿
- **导出 PDF**: 立即导出为 PDF 文档
- **重置**: 清空表单

## 🗂️ 管理日志

### 搜索和过滤

```
搜索框: 输入项目名称、标签或关键词
类型筛选: 按项目类型过滤
```

### 日志操作

每个日志卡片提供以下操作：

- 👁️ **查看详情**: 查看完整日志内容
- 📄 **导出 PDF**: 导出单个日志为 PDF
- 🗑️ **删除**: 删除日志

### 批量操作

- **导出 JSON**: 导出所有日志为 JSON 文件
- **导出全部为 PDF**: 批量导出所有日志

## 💾 IndexedDB 存储

### 数据结构

```typescript
interface DesignLog {
  id?: number;
  projectName: string;
  projectType: string;
  date: string;
  objective: string;
  inspiration: string;
  process: string;
  challenges: string;
  outcome: string;
  reflection: string;
  nextSteps: string;
  tags: string;
  tools: string;
  createdAt: string;
  updatedAt: string;
}
```

### 存储 API

```typescript
const { 
  saveDesignLog,        // 保存新日志
  updateDesignLog,      // 更新日志
  getDesignLog,         // 获取单个日志
  getAllDesignLogs,     // 获取所有日志
  deleteDesignLog,      // 删除日志
  searchDesignLogs,     // 搜索日志
  filterByDate,         // 按日期过滤
  filterByType,         // 按类型过滤
  saveDraft,            // 保存草稿
  getAllDrafts,         // 获取所有草稿
  exportAllLogs,        // 导出为 JSON
  importLogs            // 导入 JSON
} = useDesignLogStorage();
```

### 使用示例

```typescript
// 保存日志
const id = await saveDesignLog({
  projectName: '我的网站设计',
  projectType: 'web',
  date: '2024-01-01',
  objective: '设计一个现代化的个人网站',
  // ... 其他字段
});

// 搜索日志
const results = await searchDesignLogs('网站');

// 按日期过滤
const logs = await filterByDate('2024-01-01', '2024-12-31');
```

## 📄 PDF 导出

### 导出功能

```typescript
const { 
  exportToPDF,          // 导出单个日志
  exportMultipleToPDF   // 导出多个日志
} = useDesignLogPDF();
```

### PDF 格式

生成的 PDF 包含：

1. **标题页**
   - 项目名称
   - 设计日志标题

2. **项目信息**
   - 项目名称、类型、日期

3. **设计过程**
   - 设计目标
   - 灵感来源
   - 设计步骤
   - 遇到的挑战

4. **结果与反思**
   - 最终成果
   - 反思总结
   - 后续计划

5. **标签和工具**
   - 标签列表
   - 使用工具

6. **页脚**
   - 生成时间

### 使用示例

```typescript
// 导出单个日志
await exportToPDF(logData);

// 导出多个日志
await exportMultipleToPDF([log1, log2, log3]);
```

## 🔌 设计模板 API

### Strapi API 端点

```
GET    /api/design-templates      # 获取所有模板
GET    /api/design-templates/:id  # 获取单个模板
POST   /api/design-templates      # 创建模板
PUT    /api/design-templates/:id  # 更新模板
DELETE /api/design-templates/:id  # 删除模板
```

### API 架构

```
apps/cms/src/api/design-template/
├── routes/
│   └── design-template.ts
├── controllers/
│   └── design-template.ts
└── services/
    └── design-template.ts
```

### 使用示例

```typescript
// 获取所有模板
const response = await fetch('http://localhost:1337/api/design-templates');
const templates = await response.json();

// 创建新模板
const response = await fetch('http://localhost:1337/api/design-templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    data: {
      name: '网页设计模板',
      description: '用于网页设计项目的模板',
      fields: ['目标', '用户研究', '线框图', '视觉设计']
    }
  })
});
```

## 🎨 界面组件

### DesignLogForm.vue

主要的设计日志表单组件。

**Props**: 无

**Features**:
- 表单验证
- 自动保存草稿
- 实时反馈
- 响应式设计

**使用**:

```vue
<template>
  <DesignLogForm />
</template>
```

### 日志列表页面

`pages/design-log.vue` 提供完整的日志管理界面。

**Features**:
- 标签页导航
- 搜索和过滤
- 批量操作
- 草稿管理

## 🔧 自定义配置

### 修改表单字段

编辑 `components/design/DesignLogForm.vue`:

```vue
<template>
  <!-- 添加自定义字段 -->
  <div>
    <label for="customField">自定义字段</label>
    <input
      id="customField"
      v-model="formData.customField"
      type="text"
    />
  </div>
</template>

<script setup lang="ts">
// 更新接口
interface DesignLogData {
  // ... 现有字段
  customField: string;
}
</script>
```

### 自定义 PDF 样式

编辑 `composables/useDesignLogPDF.ts`:

```typescript
// 修改字体、颜色、布局等
doc.setFontSize(20);
doc.setTextColor(0, 0, 255);
```

### 扩展存储功能

编辑 `composables/useDesignLogStorage.ts`:

```typescript
// 添加新的索引
logStore.createIndex('customIndex', 'customField');

// 添加新的查询方法
const filterByCustom = async (value: string) => {
  const db = await initDB();
  const index = db.transaction(STORE_NAME).store.index('customIndex');
  return await index.getAll(value);
};
```

## 📊 数据管理

### 导出数据

```typescript
// 导出所有日志为 JSON
const { exportAllLogs } = useDesignLogStorage();
const json = await exportAllLogs();

// 下载文件
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'design-logs.json';
a.click();
```

### 导入数据

```typescript
// 从 JSON 导入日志
const { importLogs } = useDesignLogStorage();

// 读取文件
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const text = await file.text();
  await importLogs(text);
});
```

### 数据备份

建议定期备份 IndexedDB 数据：

1. 导出为 JSON 文件
2. 保存到云存储
3. 设置自动备份计划

## 🔒 数据隐私

### 本地存储优势

- ✅ 数据完全存储在本地浏览器
- ✅ 无需网络连接
- ✅ 不会上传到服务器
- ✅ 完全的数据控制权

### 数据清理

```typescript
// 清空所有日志
const db = await openDB('DesignLogDB', 1);
await db.clear('designLogs');

// 清空所有草稿
await db.clear('designDrafts');
```

### 浏览器兼容性

- ✅ Chrome / Edge (推荐)
- ✅ Firefox
- ✅ Safari
- ✅ 移动浏览器

## 🎓 教学应用

### 学生视角

1. **记录过程**: 详细记录每个设计决策
2. **反思学习**: 总结经验教训
3. **构建作品集**: 导出 PDF 用于展示
4. **追踪进步**: 回顾历史项目

### 教师视角

1. **评估工具**: 查看学生的设计思考过程
2. **反馈指导**: 基于日志提供针对性反馈
3. **标准化**: 统一的记录格式
4. **作品集管理**: 帮助学生整理作品

### 课堂活动

**每周设计日志**:
- 学生每周完成一个设计项目
- 填写设计日志
- 导出 PDF 提交

**设计回顾会**:
- 学生分享设计日志
- 讨论挑战和解决方案
- 互相学习和反馈

**期末作品集**:
- 导出整学期的设计日志
- 制作专业作品集
- 申请或求职使用

## 🚀 未来计划

### 计划功能

- [ ] 图片上传和管理
- [ ] 协作功能（分享日志）
- [ ] 模板系统
- [ ] 统计和分析
- [ ] 移动应用
- [ ] 云同步选项

### 贡献

欢迎贡献新功能！请查看 [CONTRIBUTING.md](../CONTRIBUTING.md)。

## 🐛 故障排除

### IndexedDB 不可用

**症状**: 无法保存日志

**解决**:
1. 检查浏览器兼容性
2. 确保浏览器允许使用 IndexedDB
3. 检查是否在隐私/无痕模式
4. 清除浏览器缓存后重试

### PDF 导出失败

**症状**: 导出 PDF 时出错

**解决**:
1. 检查 jsPDF 库是否正确加载
2. 确保数据格式正确
3. 查看浏览器控制台错误信息
4. 尝试导出较小的日志

### 搜索不工作

**症状**: 搜索无结果

**解决**:
1. 检查搜索关键词是否正确
2. 确保日志包含搜索的内容
3. 尝试清除筛选条件
4. 刷新页面重试

## 🔗 相关资源

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [jsPDF 文档](https://github.com/parallax/jsPDF)
- [idb 库](https://github.com/jakearchibald/idb)
- [Strapi 文档](https://docs.strapi.io)

---

最后更新: 2024
