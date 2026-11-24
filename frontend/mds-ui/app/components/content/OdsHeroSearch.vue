<script setup lang="ts">
import { ref } from 'vue'
import OdsInput from '~/components/OdsInput.vue'

const { t } = useI18n()

const localePath = useLocalePath()

const formRef = ref<HTMLFormElement | null>(null)

function onEnter() {
  // Trigger native form submission when ENTER is pressed inside the input
  formRef.value?.requestSubmit()
}
</script>

<template>
  <form
    id="hero-search"
    ref="formRef"
    :action="localePath('/datasets')"
    @keydown.enter.prevent="onEnter"
  >
    <ods-input
      id="q"
      name="q"
      :placeholder="t('message.dataset_search.search_placeholder')"
    />
  </form>
</template>

<style scoped>
form {
  max-width: 48rem;
  margin-inline: auto;
  padding-top: 30px;
}

/* OdsInput has no colour variant; this overrides the design system's input--outline border for the hero search. */
form :deep(input) {
  border-color: var(--color-primary-600);
}
</style>
