<script lang="ts" setup>
import type { PagesCollectionItem } from '@nuxt/content'
import { useBreadcrumbs } from '~/composables/breadcrumbs'
import OdsHandbookPage from '~/components/handbook/OdsHandbookPage.vue'

const route = useRoute()
const { locale } = useI18n()

const breadcrumbs = await useBreadcrumbs({ route, collection: 'pages' })

// The handbook page exists only in some languages; without it the page stays empty, as before.
const { data: page } = await useFetch<PagesCollectionItem>('/api/content/pages/handbook', {
  query: { locale: locale.value },
})

useSeoMeta({
  title: `${page.value?.title} | opendata.swiss`,
})
</script>

<template>
  <OdsHandbookPage
    v-if="page"
    :page="page"
    :breadcrumbs="breadcrumbs"
  />
</template>
