import type { Ref } from 'vue'
import type { BreadcrumbItem } from '~/components/OdsBreadcrumbs.vue'
import { getDatasetSearchFromSessionStorage, storeDatasetSearchInSessionStorage } from '~/utils/breadcrumb-session-storage'

interface Options {
  route: ReturnType<typeof useRoute>
  /** pages: every segment is a page; handbook: the first segment is a page, the next ones handbook articles. */
  collection: 'pages' | 'handbook'
}

type Translate = (key: string) => string

/**
 * Breadcrumbs of a content page, one per path segment, titled from the content (server/api/content/breadcrumbs.get.ts).
 * The result comes with the server-rendered page, so the browser doesn't load it again.
 */
export async function useBreadcrumbs({ route, collection }: Options) {
  const { t, locale } = useI18n()
  const home = homePageBreadcrumb(t)

  // The address without the language: /de/handbook/vorbereiten -> /handbook/vorbereiten
  const path = '/' + route.path.split('/').filter(Boolean).slice(1).join('/')

  const { data } = await useFetch('/api/content/breadcrumbs', {
    query: { collection, path, locale: locale.value },
  })

  return data.value?.length ? [home, ...data.value as BreadcrumbItem[]] : []
}

export function homePageBreadcrumb(t: Translate): BreadcrumbItem {
  return {
    id: 'home',
    title: t('message.header.navigation.home'),
    path: '/',
  }
}

/**
 * Breadcrumbs of a dataset: home, datasets, search results (when the dataset was opened from a search) and the dataset.
 *
 * The search comes from the `search` query that the result list adds to its links. It's removed from the address
 * after loading and kept in sessionStorage, so the distribution pages of the same dataset show it too.
 * The server renders the breadcrumbs without the stored search; the browser adds it after loading.
 */
export function useDatasetBreadcrumbs(datasetId: string, datasetTitle: Ref<string>) {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()

  const searchFromQuery = typeof route.query.search === 'string' && route.query.search ? route.query.search : null
  const search = ref<string | null>(searchFromQuery)

  onMounted(() => {
    if (searchFromQuery) {
      storeDatasetSearchInSessionStorage(datasetId, searchFromQuery)
      const { search: _, ...rest } = route.query
      router.replace({ query: rest })
    }
    else {
      search.value = getDatasetSearchFromSessionStorage(datasetId)
    }
  })

  return computed<BreadcrumbItem[]>(() => {
    const breadcrumbs: BreadcrumbItem[] = [
      homePageBreadcrumb(t),
      {
        id: 'datasets',
        title: t('message.header.navigation.datasets'),
        path: '/datasets',
      },
    ]

    if (search.value) {
      breadcrumbs.push({
        id: 'search',
        title: t('message.dataset_search.search_results'),
        route: {
          path: '/datasets',
          query: Object.fromEntries(new URLSearchParams(decodeURIComponent(search.value))),
        },
      })
    }

    breadcrumbs.push({
      id: datasetId,
      title: datasetTitle.value,
      route: {
        name: 'datasets-datasetId',
        params: { datasetId },
      },
    })

    return breadcrumbs
  })
}
