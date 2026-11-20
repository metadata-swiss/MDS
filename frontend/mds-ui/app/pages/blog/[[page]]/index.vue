<script setup>
import OdsPage from '~/components/OdsPage.vue'
import { homePageBreadcrumb } from '~/composables/breadcrumbs.js'
import OdsBreadcrumbs from '~/components/OdsBreadcrumbs.vue'
import OdsBlogPostCard from '~/components/blog/OdsBlogPostCard.vue'
import OdsPagination from '~/components/OdsPagination.vue'
import OdsSearchPanel from '~/components/OdsSearchPanel.vue'
import { useRouter } from 'vue-router'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const page = parseInt(route.params.page) || 1

// One page of posts and the number of pages; the page size is set in server/api/content/blog/index.get.ts.
const { data } = await useFetch('/api/content/blog', {
  query: { locale: locale.value, page },
})
const posts = computed(() => data.value?.posts ?? [])
const pageCount = computed(() => data.value?.pageCount ?? 0)

useSeoMeta({
  title: `${t('message.header.navigation.blog')} | opendata.swiss`,
})

const breadcrumbs = [
  homePageBreadcrumb(t),
  {
    title: t('message.header.navigation.blog'),
    path: '/blog',
  },
]

const searchInput = ref('')
const router = useRouter()
const onSearch = (value) => {
  router.push(localePath({
    path: '/blog/search',
    query: { q: value.trim() },
  }))
}
</script>

<template>
  <OdsPage>
    <template #header>
      <OdsBreadcrumbs :breadcrumbs="breadcrumbs" />
    </template>
    <OdsSearchPanel
      v-model:search-input="searchInput"
      small
      :search-prompt="t('message.blog.search_prompt')"
      @search="onSearch"
    />
    <section class="section section--default">
      <div class="container gap--responsive">
        <div
          class="search-results search-results--grid"
          aria-live="polite"
          aria-busy="false"
        >
          <ul class="search-results-list">
            <li
              v-for="post in posts"
              :key="post.id"
            >
              <OdsBlogPostCard :post="post" />
            </li>
          </ul>
        </div>
      </div>
      <div class="container">
        <OdsPagination
          :current-page="page"
          :page-label="t('message.ods-pagination.page')"
          :total-pages="parseInt(pageCount)"
          :pagination-items="[
            {
              icon: 'ChevronLeft',
              label: t('message.ods-pagination.previous'),
              link: `/blog/${page > 1 ? parseInt(page) - 1 : 1}`,
            },
            {
              icon: 'ChevronRight',
              label: t('message.ods-pagination.next'),
              link: `/blog/${page < pageCount ? parseInt(page) + 1 : pageCount}`,
            },
          ]"
          @page-change="navigateTo(localePath({ name: 'blog-page', params: { page: $event } }))"
        />
      </div>
    </section>
  </OdsPage>
</template>
