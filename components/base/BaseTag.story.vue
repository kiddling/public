<script setup lang="ts">
import BaseTag from './BaseTag.vue'
</script>

<template>
  <Story
    title="基础组件/BaseTag"
    :layout="{ type: 'grid', width: '100%' }"
    group="base"
  >
    <Variant title="Default">
      <BaseTag>默认标签</BaseTag>
    </Variant>

    <Variant title="Course Part Tags">
      <div class="flex gap-2">
        <BaseTag variant="foundation">基础</BaseTag>
        <BaseTag variant="intermediate">中级</BaseTag>
        <BaseTag variant="advanced">高级</BaseTag>
        <BaseTag variant="expert">专家</BaseTag>
      </div>
    </Variant>

    <Variant title="Status Tags">
      <div class="flex gap-2">
        <BaseTag variant="success">成功</BaseTag>
        <BaseTag variant="warning">警告</BaseTag>
        <BaseTag variant="error">错误</BaseTag>
        <BaseTag variant="info">信息</BaseTag>
      </div>
    </Variant>

    <Variant title="With Icons">
      <div class="flex gap-2">
        <BaseTag variant="foundation" icon="heroicons:academic-cap">基础</BaseTag>
        <BaseTag variant="intermediate" icon="heroicons:beaker">中级</BaseTag>
        <BaseTag variant="advanced" icon="heroicons:rocket-launch">高级</BaseTag>
        <BaseTag variant="expert" icon="heroicons:star">专家</BaseTag>
      </div>
    </Variant>

    <Variant title="Removable">
      <div class="flex gap-2">
        <BaseTag removable>JavaScript</BaseTag>
        <BaseTag removable>TypeScript</BaseTag>
        <BaseTag removable>Vue.js</BaseTag>
      </div>
    </Variant>

    <Variant title="Sizes">
      <div class="flex items-center gap-2">
        <BaseTag size="sm">小号</BaseTag>
        <BaseTag size="md">中号</BaseTag>
        <BaseTag size="lg">大号</BaseTag>
      </div>
    </Variant>
  </Story>
</template>
