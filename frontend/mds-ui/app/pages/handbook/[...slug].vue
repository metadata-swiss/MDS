<script lang="ts" setup>
import type { HandbookCollectionItem } from '@nuxt/content'
import OdsHandbookPage from '~/components/handbook/OdsHandbookPage.vue'
import { ensureFound } from '~/utils/ensureFound'

const { locale, t } = useI18n()
const route = useRoute()

const breadcrumbs = await useBreadcrumbs({ route, collection: 'handbook' })

// The server finds the article and checks that the address is its full address (parents, then the article).
const slug = route.params.slug ?? []
const segments = Array.isArray(slug) ? slug : [slug]
const { data, error } = await useFetch<HandbookCollectionItem>(`/api/content/handbook/${segments.map(encodeURIComponent).join('/')}`, {
  query: { locale: locale.value },
})
ensureFound(data.value, error.value)

useSeoMeta({
  title: `${data.value?.title} | ${t('message.header.navigation.handbook')} | metadata.swiss`,
})

// TODO: make sidebar navigation dynamic based on the handbook content
const _navigation = ref([
  {
    title: 'Guide',
    icon: 'i-lucide-book-open',
    path: '#getting-started',
    children: [
      {
        title: 'Introduction',
        path: '#introduction',
        active: true,
      },
      {
        title: 'Installation',
        path: '#installation',
      },
    ],
  },
  {
    title: 'Composables',
    icon: 'i-lucide-database',
    path: '#composables',
    children: [
      {
        title: 'defineShortcuts',
        path: '#defineshortcuts',
      },
      {
        title: 'useModal',
        path: '#usemodal',
      },
    ],
  },
])
</script>

<template>
  <OdsHandbookPage
    v-if="data"
    :page="data"
    :breadcrumbs="breadcrumbs"
  />
</template>
