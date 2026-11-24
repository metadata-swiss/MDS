<script setup lang="ts">
import { homePageBreadcrumb } from '~/composables/breadcrumbs.js'
import { useSeoMeta } from 'nuxt/app'
import OdsCmsSearchPage from '~/components/OdsCmsSearchPage.vue'
import type { SearchResult } from 'minisearch'

const { t, locale } = useI18n()

// Search sections of the published and active articles in the current language, and the address of each article
const { data, error } = await useFetch('/api/content/search/handbook', {
  query: { locale: locale.value },
})

const searchResultToLink = (articles: { path: string, url: string }[]) => (result: SearchResult) => {
  const [id, hash] = result.id.split('#')

  let path
  const article = articles.find(({ path }) => result.id.startsWith(path))
  if (article) {
    path = article.url
  }
  else {
    path = id.substring(0, id.lastIndexOf('.'))
  }
  return {
    path,
    hash: hash ? `#${hash}` : undefined,
  }
}

if (error.value) {
  console.error('Failed to fetch handbook search sections', error.value)
}

const breadcrumbs = [
  homePageBreadcrumb(t),
  {
    title: t('message.header.navigation.handbook'),
    path: '/handbook',
  },
  {
    title: t('message.header.navigation.search'),
  },
]

useSeoMeta({
  title: `${t('message.header.navigation.search')} | ${t('message.header.navigation.handbook')} | metadata.swiss`,
})
</script>

<template>
  <OdsCmsSearchPage
    :search-prompt="t('message.handbook.search_prompt')"
    :breadcrumbs="breadcrumbs"
    :data="data?.sections ?? []"
    :search-result-to-link="searchResultToLink(data?.articles ?? [])"
  />
</template>
