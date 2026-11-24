<script lang="ts" setup>
import LanguageSelector from '../LanguageSelector.vue'
import OdsButton from '../OdsButton.vue'

import { useI18n } from '#imports'

const { t } = useI18n()

// mds-ui has no login of its own: the button opens the I14Y input portal (see app.vue).
const emit = defineEmits<{
  (e: 'login'): void
}>()
</script>

<template>
  <header
    id="top-bar-container"
    class="top-bar"
  >
    <div
      id="top-bar"
      class="top-bar__bar"
    >
      <div class="container container--flex ">
        <div class="top-bar__btn" />
        <div class="top-bar__right">
          <div>
            <OdsButton
              icon="Login"
              variant="bare-negative"
              size="sm"
              :title="t('message.top_header.login')"
              :aria-label="t('message.top_header.login')"
              icon-right
              @click="emit('login')"
            >
              <span>{{ t('message.top_header.login') }}</span>
            </OdsButton>
          </div>

          <div class="language-selector">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.top-bar__bar .container {
  height: 1.75rem;
  font-size: 0.75rem;
}

.top-bar__bar :deep(.btn),
.top-bar__bar :deep(select) {
  min-height: 0;
  height: 1.75rem;
  padding-block: 0;
}

.top-bar__bar :deep(.btn) {
  font-size: 0.75rem;
}
</style>
