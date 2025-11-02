/**
 * Composable for showing user notifications
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

const notifications = ref<Notification[]>([])

export function useNotification() {
  const show = (
    type: NotificationType,
    title: string,
    message: string,
    duration: number = 5000,
    action?: { label: string; onClick: () => void }
  ) => {
    const id = Math.random().toString(36).substring(7)

    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      action,
    }

    notifications.value.push(notification)

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const remove = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clear = () => {
    notifications.value = []
  }

  const success = (title: string, message: string, duration?: number) => {
    return show('success', title, message, duration)
  }

  const error = (
    title: string,
    message: string,
    duration?: number,
    action?: { label: string; onClick: () => void }
  ) => {
    return show('error', title, message, duration, action)
  }

  const warning = (title: string, message: string, duration?: number) => {
    return show('warning', title, message, duration)
  }

  const info = (title: string, message: string, duration?: number) => {
    return show('info', title, message, duration)
  }

  return {
    notifications: readonly(notifications),
    show,
    remove,
    clear,
    success,
    error,
    warning,
    info,
  }
}
