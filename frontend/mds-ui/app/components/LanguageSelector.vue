<template>
  <div :class="computedClass">
    <label for="lang-switcher" class="sr-only">{{ t('message.header.select_language') }}</label>
    <Select

      id="lang-switcher"
      v-model="selectedLocale"
      size="sm"
      bare
      :variant="type"
    >
      <option
        v-for="availableLocale in locales"
        :key="availableLocale.code"
        :value="availableLocale.code"
        :selected="selectedLocale == availableLocale.code">
        {{ availableLocale.code.toUpperCase() }}
      </option>
    </Select>
  </div>
</template>

<script setup lang="ts">
import Select from './OdsSelect.vue'
import { computed } from 'vue'
import { useI18n } from '#imports'

const switchLocalePath = useSwitchLocalePath()
const { t, locale, locales } = useI18n()

// Props
defineProps({
  type: {
    type: String,
    default: () => 'negative',
  },
})

// CSS class
const computedClass = computed(() => 'language-switcher')

const selectedLocale = computed({
  get: () => locale.value,
  set: (newLocale) => {
    if (newLocale !== locale.value) {
      navigateTo(switchLocalePath(newLocale))
    }
  },
})

useLoadingIndicator()
</script>
