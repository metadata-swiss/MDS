import { BLOG_CARD_FIELDS } from '#shared/content'

// Number of posts per page of the blog list
const PAGE_SIZE = 1

/**
 * One page of the blog list in one language, newest first, and the number of pages.
 *
 * GET /api/content/blog?locale=de&page=1
 */
export default defineEventHandler(async (event) => {
  const locale = getLocaleParam(event)
  const page = getIntegerParam(event, 'page', 1, 10_000)

  const [posts, total] = await Promise.all([
    queryPublished(event, 'blog')
      .select(...BLOG_CARD_FIELDS)
      .where('path', 'LIKE', `%.${locale}`)
      .order('date', 'DESC')
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .all(),
    queryPublished(event, 'blog')
      .where('path', 'LIKE', `%.${locale}`)
      .count(),
  ])

  return { posts, pageCount: Math.ceil(total / PAGE_SIZE) }
})
