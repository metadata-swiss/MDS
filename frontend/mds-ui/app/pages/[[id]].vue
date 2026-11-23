<script lang="ts" setup>
import type { PagesCollectionItem } from '@nuxt/content'
import OdsBreadcrumbs from '~/components/OdsBreadcrumbs.vue'
import { useBreadcrumbs } from '~/composables/breadcrumbs'
import OdsPage from '~/components/OdsPage.vue'
import { ensureFound } from '~/utils/ensureFound'

const route = useRoute()
const { locale } = useI18n()

const breadcrumbs = await useBreadcrumbs({ route, collection: 'pages' })

const slug = String(route.params.id || 'index')
const { data: page, error } = await useFetch<PagesCollectionItem>(`/api/content/pages/${encodeURIComponent(slug)}`, {
  query: { locale: locale.value },
})
ensureFound(page.value, error.value)

const isHome = slug === 'index'
const displayedPage = computed(() => isHome && page.value ? { ...page.value, heading: 'metadata.swiss', heroImage: undefined } : page.value)

useSeoMeta({
  title: `${page.value?.title} | metadata.swiss`,
})
</script>

<template>
  <OdsPage
    v-if="displayedPage"
    :page="displayedPage"
    :centered-hero="isHome"
  >
    <template #header>
      <OdsBreadcrumbs :breadcrumbs="breadcrumbs" />
    </template>
  </OdsPage>
</template>
