import type { BlogCollectionItem } from '@nuxt/content'
import type { BLOG_CARD_FIELDS } from '#shared/content'

/**
 * A blog post in the lists (blog list, news section of the home page), as returned by server/api/content/blog.
 */
export type BlogPostSummary = Pick<BlogCollectionItem, typeof BLOG_CARD_FIELDS[number]>
