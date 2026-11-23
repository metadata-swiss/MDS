<script setup>
import OdsPage from '~/components/OdsPage.vue'
import { homePageBreadcrumb } from '~/composables/breadcrumbs'
import OdsBreadcrumbs from '~/components/OdsBreadcrumbs.vue'
import { ensureFound } from '~/utils/ensureFound'

const route = useRoute()
const { locale, t } = useI18n()
const { year, month, slug } = route.params

const { data: post, error } = await useFetch(`/api/content/blog/post/${encodeURIComponent(slug)}`, {
  query: { locale: locale.value, month: `${year}-${month}` },
})
ensureFound(post.value, error.value)

useSeoMeta({
  title: `${post.value?.title} | ${t('message.header.navigation.blog')} | metadata.swiss`,
})

const breadcrumbs = [
  homePageBreadcrumb(t),
  {
    title: t('message.header.navigation.blog'),
    path: '/blog',
  },
  {
    title: post.value?.title || slug,
  },
]
</script>

<template>
  <OdsPage
    v-if="post"
    :page="post"
  >
    <template #header>
      <OdsBreadcrumbs :breadcrumbs="breadcrumbs" />
    </template>
  </OdsPage>
</template>
