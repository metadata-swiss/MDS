import { BLOG_CARD_FIELDS } from '#shared/content'

/**
 * Posts of the news section of the home page in one language: up to `max` pinned posts, and up to `max` other posts,
 * newest first.
 *
 * GET /api/content/blog/latest?locale=de&max=3
 */
export default defineEventHandler(async (event) => {
  const locale = getLocaleParam(event)
  const max = getIntegerParam(event, 'max', 1, 20)

  const pinned = await queryPublished(event, 'blog')
    .select(...BLOG_CARD_FIELDS)
    .where('path', 'LIKE', `%.${locale}`)
    .where('pinned', '=', true)
    .limit(max)
    .all()

  let latestQuery = queryPublished(event, 'blog')
    .select(...BLOG_CARD_FIELDS)
    .where('path', 'LIKE', `%.${locale}`)
    .order('date', 'DESC')
  if (pinned.length) {
    latestQuery = latestQuery.where('id', 'NOT IN', pinned.map(post => post.id))
  }
  const latest = await latestQuery.limit(max).all()

  return { pinned, latest }
})
