<template>
  <div :class="['notification', `notification--${type}`]">
    <SvgIcon
      :icon="icons[type]"
      role="notification"
    />
    <div class="notification__content">
      <div
        v-if="title"
        class="text--bold"
      >
        {{ title }}
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '~/components/SvgIcon.vue'

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'alert' | 'hint'

defineProps<{
  type: NotificationType
  title?: string
}>()

const icons: Record<NotificationType, string> = {
  info: 'InfoCircle',
  success: 'CheckmarkCircle',
  warning: 'Warning',
  error: 'WarningCircle',
  alert: 'WarningCircle',
  hint: 'HelpCircle',
}
</script>
