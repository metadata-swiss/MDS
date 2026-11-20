<script setup lang="ts">
import OdsSection, { type SectionLayout } from '~/components/content/OdsSection.vue'
import type { BlogPostSummary } from '~/model/blog'
import OdsBlogPostCard from '../blog/OdsBlogPostCard.vue'

const { max: limit } = defineProps<{
  title: string
  max: number
  layout: SectionLayout
}>()

const { locale } = useI18n()

// Pinned posts first, then the newest other posts (server/api/content/blog/latest.get.ts)
const { data } = await useFetch<{ pinned: BlogPostSummary[], latest: BlogPostSummary[] }>('/api/content/blog/latest', {
  query: { locale: locale.value, max: limit },
})
const pinnedPosts = computed(() => data.value?.pinned ?? [])
const latestPosts = computed(() => data.value?.latest ?? [])
</script>

<template>
  <OdsSection
    id="latest-news"
    :layout="layout"
    accent-color="100"
    text-color="600"
    :title="title"
  >
    <OdsBlogPostCard
      v-for="post in pinnedPosts"
      :key="post.id"
      :post="post"
    />
    <OdsBlogPostCard
      v-for="post in latestPosts"
      :key="post.id"
      :post="post"
    />
  </OdsSection>
</template>
