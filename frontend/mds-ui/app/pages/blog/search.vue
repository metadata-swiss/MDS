<script setup lang="ts">
import { homePageBreadcrumb } from '~/composables/breadcrumbs.js'
import { useSeoMeta } from 'nuxt/app'
import OdsCmsSearchPage from '~/components/OdsCmsSearchPage.vue'
import type { SearchResult } from 'minisearch'

const { t, locale } = useI18n()

// Search sections of the published posts in the current language, and the posts for the links and images
const { data, error } = await useFetch('/api/content/search/blog', {
  query: { locale: locale.value },
})
const sections = data.value?.sections ?? []
const blog = data.value?.posts ?? []

const searchResultToLink = (result: SearchResult) => {
  const [id, hash] = result.id.split('#')

  const slug = `${id.substring(0, id.lastIndexOf('.'))}`.split('/').pop()
  const article = blog.find(({ path }) => result.id.startsWith(path))
  const hashOrUndefined = hash ? `#${hash}` : undefined
  // The URL of a blog post contains its date, so a post without a date has no link.
  if (!article?.date) {
    return { hash: hashOrUndefined }
  }
  return {
    path: '/' + ['blog', article.date.substring(0, 7), slug].join('/'),
    hash: hashOrUndefined,
  }
}

const searchResultToImage = (result: SearchResult) => {
  const article = blog.find(({ path }) => result.id.startsWith(path))
  return article?.image || ''
}

if (error.value) {
  console.error('Failed to fetch blog search sections', error.value)
}

const breadcrumbs = [
  homePageBreadcrumb(t),
  {
    title: t('message.header.navigation.blog'),
    path: '/blog',
  },
  {
    title: t('message.header.navigation.search'),
  },
]

useSeoMeta({
  title: `${t('message.header.navigation.search')} | ${t('message.header.navigation.blog')} | opendata.swiss`,
})
</script>

<template>
  <OdsCmsSearchPage
    :search-prompt="t('message.blog.search_prompt')"
    :breadcrumbs="breadcrumbs"
    :data="sections"
    :search-result-to-link="searchResultToLink"
    :search-result-to-image="searchResultToImage"
  />
</template>
