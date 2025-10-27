<script setup lang="ts">
import BaseButton from './BaseButton.vue'
</script>

<template>
  <Story
    title="基础组件/BaseButton"
    :layout="{ type: 'grid', width: '100%' }"
    group="base"
  >
    <Variant title="Primary">
      <BaseButton variant="primary">
        主要按钮
      </BaseButton>
    </Variant>

    <Variant title="Secondary">
      <BaseButton variant="secondary">
        次要按钮
      </BaseButton>
    </Variant>

    <Variant title="Outline">
      <BaseButton variant="outline">
        轮廓按钮
      </BaseButton>
    </Variant>

    <Variant title="Ghost">
      <BaseButton variant="ghost">
        透明按钮
      </BaseButton>
    </Variant>

    <Variant title="Danger">
      <BaseButton variant="danger">
        危险按钮
      </BaseButton>
    </Variant>

    <Variant title="With Icon Left">
      <BaseButton icon-left="heroicons:star">
        收藏
      </BaseButton>
    </Variant>

    <Variant title="With Icon Right">
      <BaseButton icon-right="heroicons:arrow-right">
        下一步
      </BaseButton>
    </Variant>

    <Variant title="Loading">
      <BaseButton :loading="true">
        加载中
      </BaseButton>
    </Variant>

    <Variant title="Disabled">
      <BaseButton :disabled="true">
        禁用状态
      </BaseButton>
    </Variant>

    <Variant title="Sizes">
      <div class="flex items-center gap-4">
        <BaseButton size="sm">小号</BaseButton>
        <BaseButton size="md">中号</BaseButton>
        <BaseButton size="lg">大号</BaseButton>
      </div>
    </Variant>

    <Variant title="Full Width">
      <BaseButton :full-width="true" variant="primary">
        全宽按钮
      </BaseButton>
    </Variant>
  </Story>
</template>
