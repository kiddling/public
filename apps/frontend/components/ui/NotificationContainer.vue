<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-4 max-w-sm w-full pointer-events-none">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item pointer-events-auto"
        >
          <div
            class="rounded-lg shadow-lg p-4 backdrop-blur-sm"
            :class="notificationClasses(notification.type)"
            role="alert"
          >
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <Icon :name="getIcon(notification.type)" class="w-6 h-6" />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-sm mb-1">
                  {{ notification.title }}
                </h4>
                <p class="text-sm opacity-90">
                  {{ notification.message }}
                </p>

                <!-- Action button -->
                <button
                  v-if="notification.action"
                  @click="notification.action.onClick"
                  class="mt-2 text-sm font-medium underline hover:no-underline"
                >
                  {{ notification.action.label }}
                </button>
              </div>

              <!-- Close button -->
              <button
                @click="removeNotification(notification.id)"
                class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="关闭"
              >
                <Icon name="mdi:close" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useNotification, type NotificationType } from '~/composables/useNotification'

const { notifications, remove } = useNotification()

const notificationClasses = (type: NotificationType) => {
  const baseClasses = 'border'
  
  switch (type) {
    case 'success':
      return `${baseClasses} bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100`
    case 'error':
      return `${baseClasses} bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100`
    case 'warning':
      return `${baseClasses} bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100`
    case 'info':
      return `${baseClasses} bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100`
    default:
      return `${baseClasses} bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100`
  }
}

const getIcon = (type: NotificationType): string => {
  switch (type) {
    case 'success':
      return 'mdi:check-circle'
    case 'error':
      return 'mdi:alert-circle'
    case 'warning':
      return 'mdi:alert'
    case 'info':
      return 'mdi:information'
    default:
      return 'mdi:information'
  }
}

const removeNotification = (id: string) => {
  remove(id)
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
