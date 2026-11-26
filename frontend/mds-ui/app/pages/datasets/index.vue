<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRefs, useTemplateRef, watch, type ComponentPublicInstance } from 'vue'

import { type LocationQuery, useRoute, useRouter } from 'vue-router'
import { useI18n } from '#imports'

import { useDatasetsSearch, datasetFacets } from '~/composables/useDatasets'
import OdsBreadcrumbs, { type BreadcrumbItem } from '~/components/OdsBreadcrumbs.vue'
import OdsPagination from '~/components/OdsPagination.vue'
import OdsDatasetList from '~/components/dataset/dataset-list/OdsDatasetList.vue'
import OdsListCardToggle from '~/components/dataset/list-card-toggle/OdsListCardToggle.vue'
import OdsSortSelect, { type SortOption } from '~/components/dataset/OdsSortSelect.vue'
import { homePageBreadcrumb } from '~/composables/breadcrumbs'
import SvgIcon from '~/components/SvgIcon.vue'
import { useSeoMeta } from 'nuxt/app'
import { clearDatasetSearchFromSessionStorage } from '~/utils/breadcrumb-session-storage'
import { DcatApChV2DatasetAdapter } from '~/model/dataset/dcat-ap-ch-v2-dataset-adapter'
import { syncFacetsFromRoute, useActiveFacets, useFacets, useFacetSync } from '~/composables/useFacets'

import OdsSearchPanel from '~/components/OdsSearchPanel.vue'
import OdsSearchResults from '~/components/OdsSearchResults.vue'
import OdsNotification from '~/components/OdsNotification.vue'
import type { AppLanguage } from '~/constants/langages'
import { CatalogSearchSort } from '~~/api-client/generated/iop-core'

const { t, locale } = useI18n()

const router = useRouter()
const route = useRoute()
const { facetRefs, resetAllFacets } = useFacets(datasetFacets)

// Read the filters from the URL before searching, so they also apply when the page is rendered on the server.
syncFacetsFromRoute({
  facetRefs,
})

if (import.meta.client) {
  clearDatasetSearchFromSessionStorage()
}

function resetSearch() {
  searchInput.value = ''
  datasetFacets.forEach((facet) => {
    facetRefs[facet].value = []
  })
  queryParams.page = 0
  queryParams.sort = undefined
}

function toSortOption(value: unknown): CatalogSearchSort | undefined {
  return Object.values(CatalogSearchSort).find(option => option === value)
}

function sortQuery(sort: CatalogSearchSort | undefined): LocationQuery {
  return sort ? { sort } : {}
}

const queryParams = reactive({
  limit: 10,
  page: route.query.page ? Number(route.query.page) - 1 : 0,
  q: Array.isArray(route.query.q) ? route.query.q.join(' ') : route.query.q || '',
  sort: toSortOption(route.query.sort),
})

const sortOptions = computed<SortOption[]>(() => [
  { value: CatalogSearchSort.Relevance, text: t('message.dataset_search.sort_by.relevance') },
  { value: CatalogSearchSort.TitleAscending, text: t('message.dataset_search.sort_by.title_asc') },
  { value: CatalogSearchSort.TitleDescending, text: t('message.dataset_search.sort_by.title_desc') },
  { value: CatalogSearchSort.ModifiedNewest, text: t('message.dataset_search.sort_by.date_modified_desc') },
  { value: CatalogSearchSort.ModifiedOldest, text: t('message.dataset_search.sort_by.date_modified_asc') },
])

const { useSearch } = useDatasetsSearch()
const {
  query,
  isSearchPending,
  isSearchUnavailable,
  getSearchResultsEnhanced,
  getSearchResultsCount,
  getSearchResultsPagesCount,
  getAvailableFacetsLocalized,
} = useSearch({
  queryParams: toRefs(queryParams),
  selectedFacets: facetRefs,
})

const datasets = computed(() => {
  const result = getSearchResultsEnhanced.value
  if (!result) {
    return []
  }
  return getSearchResultsEnhanced.value.map(item => DcatApChV2DatasetAdapter.fromSearchResult(item, locale.value as AppLanguage, t))
})

const { suspense } = query

const listType = useCookie<'card' | 'list'>('datasets-list-type', {
  default: () => 'list',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
})

const activeFacets = useActiveFacets({
  facets: datasetFacets,
  getAvailableFacetsLocalized,
})

function goToPage(newPage: number | string, query = route.query) {
  const page = newPage ? Number(newPage) : 1
  // Collect all facet values from facetRefs
  const facetsQuery = datasetFacets.reduce((acc, facet) => {
    if (facetRefs[facet].value.length > 0) {
      acc[facet] = facetRefs[facet].value
    }
    return acc
  }, {} as Record<string, string[]>)
  router.push({
    name: route.name,
    query: { ...query, ...facetsQuery, page },
  })
}

const searchResultsElement = useTemplateRef<ComponentPublicInstance>('search-results')

const searchInput = ref(queryParams.q)
const onSearch = () => goToPage(1, { q: searchInput.value, ...sortQuery(queryParams.sort) })

const selectedSort = computed({
  get: () => queryParams.sort ?? '',
  set: (value: string) => goToPage(1, { ...route.query, ...sortQuery(toSortOption(value)) }),
})

const homeBreadcrumb = homePageBreadcrumb(t)
const datasetBreadcrumb = computed<BreadcrumbItem>(() => {
  const bc = {
    id: 'datasets',
    title: t('message.header.navigation.datasets'),
    route: '/datasets',
  }
  return bc
})

const resultBreadcrumb = computed<BreadcrumbItem | null>(() => {
  const notFirstPage = route.query.page && Number(route.query.page) > 1
  const hasFacetFilters = Object.values(facetRefs).some(facetRef => facetRef.value.length > 0)
  const hasOtherQueryParams = Object.keys(route.query).length > 1 || (route.query.q && route.query.q !== '')
  if (notFirstPage || hasOtherQueryParams || hasFacetFilters) {
    const resultBc = {
      id: 'search-results',
      title: t('message.dataset_search.search_results'),
      route,
    }
    return resultBc
  }
  return null
})

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const lastBreadcrumb = resultBreadcrumb.value
  if (lastBreadcrumb === null) {
    return [
      homeBreadcrumb,
      datasetBreadcrumb.value,
    ]
  }
  return [
    homeBreadcrumb,
    datasetBreadcrumb.value,
    lastBreadcrumb,
  ]
})

watch(() => route.query.page, (newPage) => {
  queryParams.page = newPage ? Number(newPage) - 1 : 0
})

watch(() => route.query, (queryParam) => {
  if (Object.keys(queryParam).length === 0) {
    // query params are empty
    resetSearch()
  }
  else {
    // syncFacetsFromRoute()
  }
})

watch(() => route.query.sort, (sort) => {
  queryParams.sort = toSortOption(sort)
})

watch(() => route.query.q, (searchTerm) => {
  if (searchTerm) {
    searchInput.value = Array.isArray(searchTerm) ? searchTerm.join(' ') : searchTerm
  }
  else {
    searchInput.value = ''
  }
  queryParams.q = searchInput.value
})

onMounted(() => {
  useFacetSync({
    facetRefs,
  })
})

useSeoMeta({
  title: `${t('message.header.navigation.datasets')} | metadata.swiss`,
})

await suspense()

if (isSearchUnavailable.value) {
  throw createError({ statusCode: 503, statusMessage: 'Service Unavailable', fatal: true })
}
</script>

<template>
  <div>
    <header id="main-header">
      <OdsBreadcrumbs :breadcrumbs="breadcrumbs" />
    </header>

    <div class="page-content">
      <!-- search panel -->
      <OdsSearchPanel
        :search-input="searchInput"
        :search-prompt="t('message.dataset_search.search_placeholder')"
        :facet-refs="facetRefs"
        :active-facets="activeFacets"
        @search="onSearch"
        @reset-all-facets="resetAllFacets"
        @update:search-input="value => searchInput = value"
      />
      <!-- results -->

      <OdsSearchResults
        ref="search-results"
        :results-count="getSearchResultsCount"
      >
        <template #header-right>
          <OdsSortSelect
            v-model="selectedSort"
            :options="sortOptions"
          />
          <div class="separator separator--vertical" />
          <OdsListCardToggle v-model="listType" />
        </template>

        <div
          v-if="isSearchPending"
          class="datasets-loading"
        >
          <SvgIcon
            icon="Spinner"
            size="3xl"
            spin
          />
        </div>
        <OdsNotification
          v-else-if="isSearchUnavailable"
          type="error"
          :title="t('message.dataset_search.unavailable.title')"
        >
          <div>
            {{ t('message.dataset_search.unavailable.text') }}
          </div>
        </OdsNotification>
        <OdsDatasetList
          v-else
          :items="datasets"
          :list-type="listType"
          :search-params="route.query"
        />
        <div class="pagination pagination--right">
          <OdsPagination
            :current-page="(Number(route.query.page ?? 1))"
            :total-pages="getSearchResultsPagesCount"
            :pagination-items="[
              {
                icon: 'ChevronLeft',
                label: t('message.ods-pagination.previous'),
                page: Number(route.query.page ?? 1) - 1,
              },
              {
                icon: 'ChevronRight',
                label: t('message.ods-pagination.next'),
                page: Number(route.query.page ?? 1) + 1,
              },
            ]"
            :search-results-element="searchResultsElement ?? undefined"
            @page-change="goToPage"
          />
        </div>

        <OdsNotification
          v-if="!isSearchPending && !isSearchUnavailable"
          type="info"
          :title="t('message.dataset_search.help.title')"
        >
          <div>
            {{ t('message.dataset_search.help.text') }}
          </div>
          <NuxtLinkLocale
            to="/contact"
            class="link"
          >
            {{ t('message.dataset_search.help.link') }}
          </NuxtLinkLocale>
        </OdsNotification>
      </OdsSearchResults>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.datasets-loading {
  display: flex;
  justify-content: center;
  padding-block: 4rem;
}
</style>
