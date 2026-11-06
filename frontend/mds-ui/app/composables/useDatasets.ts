import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, toValue } from 'vue'
import { useI18n } from '#imports'
import {
  SearchResourceType,
  useGetSearch,
  useGetSearchCount,
  useGetVocabulariesByIdentifier,
  type GetSearchCountParams,
  type GetSearchParams,
  type CatalogSearchSort,
} from '~~/api-client/generated/iop-core'
import type { FacetGroup } from '~/composables/useFacets'
import { organizationLabel } from '~/model/organizations'
import { localize } from '~/utils/getCurrentTranslation'

export const datasetFacets = ['categories', 'organization', 'format', 'license', 'keywords'] as const
const KEYWORD_MIN_COUNT = 1

// All public datasets of iop-core are shown, not only those of the opendata.swiss catalog.
const OPEN_DATASETS = {
  types: [SearchResourceType.Dataset],
  accessRights: ['PUBLIC'],
}

/**
 * The I14Y themes, which iop-core uses for the themes of all its resources (codes such as 117).
 */
const THEMES_VOCABULARY = 'Concept_DATASET_THEME'

interface DatasetSearchQueryParams {
  q: Ref<string>
  /** Zero-based, like the old portal's search. */
  page: Ref<number>
  limit: Ref<number>
  sort: Ref<CatalogSearchSort | undefined>
}

interface UseSearchParams {
  queryParams: DatasetSearchQueryParams
  selectedFacets: Record<string, Ref<string[]>>
}

/**
 * Returns the iop-core dataset search.
 * The members are named like the search of the old portal, which the dataset search page was built on.
 * A single dataset is loaded with the generated useGetDatasetsByIdentifier.
 */
export function useDatasetsSearch() {
  /**
   * Search datasets with GET /api/Search. The facets and the number of results come from GET /api/Search/count.
   */
  function useSearch({ queryParams, selectedFacets }: UseSearchParams) {
    const { t, locale } = useI18n()

    const countParams = computed<GetSearchCountParams>(() => ({
      ...OPEN_DATASETS,
      language: locale.value,
      query: queryParams.q.value || undefined,
      // The categories are the I14Y themes, not the EU data themes of the catalog records.
      themes: selectedFacets.categories?.value,
      publishers: selectedFacets.organization?.value,
      formats: selectedFacets.format?.value,
      licenses: selectedFacets.license?.value,
      keywords: selectedFacets.keywords?.value,
    }))

    const searchParams = computed<GetSearchParams>(() => ({
      ...countParams.value,
      sort: queryParams.sort.value,
      page: queryParams.page.value + 1,
      pageSize: queryParams.limit.value,
    }))

    const searchQuery = useGetSearch(searchParams)
    const countQuery = useGetSearchCount(countParams)

    const query = {
      suspense: () => Promise.all([searchQuery.suspense(), countQuery.suspense()]),
    }

    const getSearchResultsEnhanced = computed(() => searchQuery.data.value ?? [])

    const getSearchResultsCount = computed(() => countQuery.data.value?.totalDocCount ?? 0)

    const getSearchResultsPagesCount = computed(() => Math.ceil(getSearchResultsCount.value / queryParams.limit.value))

    function getAvailableFacetsLocalized(lang?: MaybeRefOrGetter<string>) {
      return computed<FacetGroup[]>(() => {
        const language = toValue(lang) ?? locale.value
        const counts = countQuery.data.value
        const selectedKeywords = selectedFacets.keywords?.value ?? []

        return [
          {
            id: 'categories',
            title: t('message.dataset_detail.categories'),
            items: (counts?.themes ?? []).map(item => ({ id: item.value.code ?? '', title: localize(item.value.name, language), count: item.count ?? 0 })),
          },
          {
            id: 'organization',
            title: t('message.dataset_detail.publisher'),
            items: (counts?.publishers ?? []).map(item => ({ id: item.value.identifier ?? '', title: organizationLabel(item.value, language), count: item.count ?? 0 })),
          },
          {
            id: 'format',
            title: t('message.dataset_detail.format'),
            items: (counts?.formats ?? []).map(item => ({ id: item.value.code ?? '', title: localize(item.value.name, language) || item.value.code || '', count: item.count ?? 0 })),
          },
          {
            id: 'license',
            title: t('message.dataset_detail.properties.license'),
            items: (counts?.licenses ?? []).map(item => ({ id: item.value.code ?? '', title: localize(item.value.name, language) || item.value.code || '', count: item.count ?? 0 })),
          },
          {
            id: 'keywords',
            title: t('message.dataset_detail.keywords'),
            // iop-core counts the keywords of all languages together, in lower case.
            // A selected keyword stays in the list, so that the filter still shows it as selected and doesn't drop it.
            items: (counts?.keywords ?? [])
              .filter(item => item.value && ((item.count ?? 0) >= KEYWORD_MIN_COUNT || selectedKeywords.includes(item.value)))
              .map(item => ({ id: item.value ?? '', title: item.value ?? '', count: item.count ?? 0 })),
          },
        ]
      })
    }

    return {
      query,
      getSearchResultsEnhanced,
      getSearchResultsCount,
      getSearchResultsPagesCount,
      getAvailableFacetsLocalized,
    }
  }

  return { useSearch }
}

/**
 * Returns the number of datasets per organization identifier.
 */
export function useDatasetCountByOrganization() {
  const query = useGetSearchCount(OPEN_DATASETS)

  const counts = computed<Record<string, number>>(() => Object.fromEntries(
    (query.data.value?.publishers ?? []).map(item => [item.value.identifier ?? '', item.count ?? 0]),
  ))

  return { query, counts }
}

/**
 * Returns the I14Y themes from GET /api/Vocabularies/{identifier}.
 */
export function useThemes() {
  const query = useGetVocabulariesByIdentifier(THEMES_VOCABULARY)

  const themes = computed(() => query.data.value?.entries ?? [])

  return { query, themes }
}
