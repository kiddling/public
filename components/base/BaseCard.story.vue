<script setup lang="ts">
import BaseCard from './BaseCard.vue'
import BaseTag from './BaseTag.vue'
</script>

<template>
  <Story
    title="基础组件/BaseCard"
    :layout="{ type: 'grid', width: '400px' }"
    group="base"
  >
    <Variant title="Default">
      <BaseCard>
        <h3 class="heading-5 mb-2">默认卡片</h3>
        <p class="body-small">这是一个默认样式的卡片组件。</p>
      </BaseCard>
    </Variant>

    <Variant title="Bordered">
      <BaseCard variant="bordered">
        <h3 class="heading-5 mb-2">边框卡片</h3>
        <p class="body-small">这是一个带边框的卡片组件。</p>
      </BaseCard>
    </Variant>

    <Variant title="Elevated">
      <BaseCard variant="elevated">
        <h3 class="heading-5 mb-2">浮起卡片</h3>
        <p class="body-small">这是一个有阴影效果的卡片组件。</p>
      </BaseCard>
    </Variant>

    <Variant title="Interactive">
      <BaseCard interactive>
        <h3 class="heading-5 mb-2">可交互卡片</h3>
        <p class="body-small">鼠标悬停时会有悬浮效果。</p>
      </BaseCard>
    </Variant>

    <Variant title="With Part Color - Foundation">
      <BaseCard part-color="foundation">
        <h3 class="heading-5 mb-2">基础课程</h3>
        <p class="body-small">带有蓝色课程部分标识。</p>
      </BaseCard>
    </Variant>

    <Variant title="With Header and Footer">
      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span>卡片标题</span>
            <BaseTag variant="foundation">基础</BaseTag>
          </div>
        </template>
        <p class="body-small">卡片主体内容区域。</p>
        <template #footer>
          <div class="text-sm text-neutral-600">
            卡片底部信息
          </div>
        </template>
      </BaseCard>
    </Variant>

    <Variant title="With Image">
      <BaseCard
        image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop"
        image-alt="示例图片"
      >
        <h3 class="heading-5 mb-2">图片卡片</h3>
        <p class="body-small">带有顶部图片的卡片组件。</p>
      </BaseCard>
    </Variant>
  </Story>
</template>
