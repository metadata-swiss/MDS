<template>
  <OdsPage
    v-if="page"
    :page="page"
  >
    <template #header>
      <OdsBreadcrumbs :breadcrumbs="breadcrumbs" />
    </template>
    <template #before-aside-content>
      <OdsSearchPanel
        v-model:search-input="searchInput"
        aside
        :title="t('message.handbook.search_prompt')"
        :search-prompt="t('message.handbook.search_prompt_short')"
        @search="onSearch"
      />
      <OdsCard :title="t('message.header.navigation.handbook')">
        <OdsAccordion id="handbook">
          <OdsAccordionItem
            v-for="section in sections"
            :id="section.id"
            :key="section.id"
            :title="section.title"
            :open="isSectionOpen(section)"
          >
            <NuxtLinkLocale
              :to="section.url"
              :class="['menu__item', 'menu__item--border', 'menu__item--condensed', { 'menu__item--active': page.id === section.id }]"
              style="margin-top: unset"
            >
              <div>{{ section.title }}</div>
            </NuxtLinkLocale>
            <NuxtLinkLocale
              v-for="article in getArticlesByParent(section)"
              :key="article.id"
              :to="article.url"
              :class="['menu__item', 'menu__item--border', 'menu__item--condensed', { 'menu__item--active': page.id === article.id }]"
              style="margin-top: unset"
            >
              <div>{{ article.title }}</div>
            </NuxtLinkLocale>
          </OdsAccordionItem>
        </OdsAccordion>
      </OdsCard>
    </template>
  </OdsPage>
</template>

<script setup lang="ts">
import type { HandbookCollectionItem, PagesCollectionItem } from '@nuxt/content'
import OdsPage from '~/components/OdsPage.vue'
import OdsBreadcrumbs, { type BreadcrumbItem } from '~/components/OdsBreadcrumbs.vue'
import OdsSearchPanel from '~/components/OdsSearchPanel.vue'
import { useRouter } from '#vue-router'
import OdsCard from '../content/OdsCard.vue'
import OdsAccordion from '~/components/OdsAccordion.vue'
import OdsAccordionItem from '~/components/OdsAccordionItem.vue'
import type { HandbookArticleLink } from '~/model/handbook'
import { sortContent } from '~/utils/sortContent'

const { t, locale } = useI18n()

const { page } = defineProps<{
  page: HandbookCollectionItem | PagesCollectionItem
  breadcrumbs: BreadcrumbItem[]
}>()

const searchInput = ref('')

const router = useRouter()
const localePath = useLocalePath()
const onSearch = (value: string) => {
  router.push(localePath({
    path: '/handbook/search',
    query: { q: value.trim() },
  }))
}

// The articles of the current language with their addresses (server/api/content/handbook/index.get.ts)
const { data: articles } = await useFetch<HandbookArticleLink[]>('/api/content/handbook', {
  query: { locale: locale.value },
})

const getSlug = (article: HandbookArticleLink) => article.slug

const sections = computed(() => {
  const sections = articles.value?.filter(article => !article.parent) || []

  return sortContent(sections, getSlug)
})

function getArticlesByParent(parent: HandbookArticleLink) {
  const children = articles.value
    ?.filter(article => article.parent && parent.path.endsWith(`handbook/${article.parent}.${locale.value}`))

  return sortContent(children, getSlug)
}

function isSectionOpen(section: HandbookArticleLink) {
  if ('parent' in page) {
    if (page.parent) {
      let current: Pick<HandbookArticleLink, 'path' | 'parent'> | undefined = page

      while (current) {
        if (current.path === section.path) {
          return true
        }

        const currentParent: string | undefined = current.parent
        current = currentParent
          ? articles.value?.find(article => article.path.endsWith(`handbook/${currentParent}.${locale.value}`))
          : undefined
      }

      return false
    }
    else {
      return page.id === section.id
    }
  }

  return true
}
</script>
