<template>
  <AppShell>
    <div class="content-container py-8">
      <SectionHeader
        title="欢迎来到教育平台"
        subtitle="构建现代化的在线学习体验"
        part-color="foundation"
        part-label="基础课程"
      >
        <template #actions>
          <BaseButton variant="primary" icon-right="heroicons:arrow-right">
            开始学习
          </BaseButton>
        </template>
      </SectionHeader>

      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BaseCard
          v-motion-pop-bottom
          interactive
          part-color="foundation"
          image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop"
          image-alt="基础课程"
          @click="handleCardClick('foundation')"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="heading-5">基础课程</h3>
              <BaseTag variant="foundation" icon="heroicons:academic-cap">
                {{ $t('course.foundation') }}
              </BaseTag>
            </div>
            <p class="body-small">
              从零开始学习编程基础知识，掌握核心概念和技能。
            </p>
          </div>
          <template #footer>
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-600">12 个课程</span>
              <Icon name="heroicons:arrow-right" class="w-5 h-5 text-primary-600" />
            </div>
          </template>
        </BaseCard>

        <BaseCard
          v-motion-pop-bottom
          interactive
          part-color="intermediate"
          @click="handleCardClick('intermediate')"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="heading-5">中级课程</h3>
              <BaseTag variant="intermediate" icon="heroicons:beaker">
                {{ $t('course.intermediate') }}
              </BaseTag>
            </div>
            <p class="body-small">
              深入学习高级编程技术，提升开发能力。
            </p>
          </div>
          <template #footer>
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-600">8 个课程</span>
              <Icon name="heroicons:arrow-right" class="w-5 h-5 text-primary-600" />
            </div>
          </template>
        </BaseCard>

        <BaseCard
          v-motion-pop-bottom
          interactive
          part-color="advanced"
          @click="handleCardClick('advanced')"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="heading-5">高级课程</h3>
              <BaseTag variant="advanced" icon="heroicons:rocket-launch">
                {{ $t('course.advanced') }}
              </BaseTag>
            </div>
            <p class="body-small">
              探索复杂架构和设计模式，成为技术专家。
            </p>
          </div>
          <template #footer>
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-600">6 个课程</span>
              <Icon name="heroicons:arrow-right" class="w-5 h-5 text-primary-600" />
            </div>
          </template>
        </BaseCard>

        <BaseCard
          v-motion-pop-bottom
          interactive
          part-color="expert"
          @click="handleCardClick('expert')"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="heading-5">专家课程</h3>
              <BaseTag variant="expert" icon="heroicons:star">
                {{ $t('course.expert') }}
              </BaseTag>
            </div>
            <p class="body-small">
              掌握行业最佳实践和前沿技术，引领技术创新。
            </p>
          </div>
          <template #footer>
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-600">4 个课程</span>
              <Icon name="heroicons:arrow-right" class="w-5 h-5 text-primary-600" />
            </div>
          </template>
        </BaseCard>
      </div>

      <section class="mt-12">
        <SectionHeader
          title="功能特色"
          subtitle="体验现代化的学习功能"
          :heading-level="2"
        />

        <div class="mt-6 space-y-4">
          <BaseCard variant="bordered" padding="lg">
            <h4 class="heading-5 mb-3">响应式设计</h4>
            <p class="body-base">
              完美适配各种屏幕尺寸，从手机到桌面都能提供优质体验。
            </p>
          </BaseCard>

          <BaseCard variant="bordered" padding="lg">
            <h4 class="heading-5 mb-3">无障碍访问</h4>
            <p class="body-base mb-3">
              支持键盘导航、屏幕阅读器，确保所有用户都能访问内容。
            </p>
            <NuxtLink to="/accessibility-demo" class="link text-sm">
              查看无障碍访问示例 →
            </NuxtLink>
          </BaseCard>

          <BaseCard variant="bordered" padding="lg">
            <h4 class="heading-5 mb-3">打印友好</h4>
            <p class="body-base mb-3">
              优化的打印样式，方便用户打印和保存学习资料。
            </p>
            <NuxtLink to="/print-demo" class="link text-sm">
              查看打印预览示例 →
            </NuxtLink>
          </BaseCard>
        </div>

        <div class="mt-6 text-center">
          <NuxtLink to="/components">
            <BaseButton variant="primary" icon-right="heroicons:arrow-right">
              查看完整组件库
            </BaseButton>
          </NuxtLink>
        </div>
      </section>

      <section class="mt-12">
        <SectionHeader
          title="按钮组件示例"
          :heading-level="3"
        />
        
        <div class="flex flex-wrap gap-4 mt-6">
          <BaseButton variant="primary">
            主要按钮
          </BaseButton>
          <BaseButton variant="secondary">
            次要按钮
          </BaseButton>
          <BaseButton variant="outline">
            轮廓按钮
          </BaseButton>
          <BaseButton variant="ghost">
            透明按钮
          </BaseButton>
          <BaseButton variant="danger">
            危险按钮
          </BaseButton>
          <BaseButton variant="primary" :loading="true">
            加载中
          </BaseButton>
          <BaseButton variant="primary" icon-left="heroicons:star">
            带图标
          </BaseButton>
        </div>
      </section>

      <section class="mt-12">
        <SectionHeader
          title="标签组件示例"
          :heading-level="3"
        />
        
        <div class="flex flex-wrap gap-2 mt-6">
          <BaseTag variant="foundation">基础</BaseTag>
          <BaseTag variant="intermediate">中级</BaseTag>
          <BaseTag variant="advanced">高级</BaseTag>
          <BaseTag variant="expert">专家</BaseTag>
          <BaseTag variant="success">成功</BaseTag>
          <BaseTag variant="warning">警告</BaseTag>
          <BaseTag variant="error">错误</BaseTag>
          <BaseTag variant="info">信息</BaseTag>
          <BaseTag removable @remove="handleTagRemove">可移除</BaseTag>
        </div>
      </section>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from '~/components/layout/AppShell.vue'
import SectionHeader from '~/components/base/SectionHeader.vue'
import BaseCard from '~/components/base/BaseCard.vue'
import BaseButton from '~/components/base/BaseButton.vue'
import BaseTag from '~/components/base/BaseTag.vue'

const handleCardClick = (type: string) => {
  console.log(`Clicked ${type} card`)
}

const handleTagRemove = () => {
  console.log('Tag removed')
}
</script>
