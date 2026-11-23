import type { HandbookCollectionItem } from '@nuxt/content'
import type { HANDBOOK_LINK_FIELDS } from '#shared/content'

/**
 * A handbook article in the handbook navigation, as returned by server/api/content/handbook, with the address of the
 * article (`url`, without the language).
 */
export type HandbookArticleLink = Pick<HandbookCollectionItem, typeof HANDBOOK_LINK_FIELDS[number]> & {
  url: string
}
