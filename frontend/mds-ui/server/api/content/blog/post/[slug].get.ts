const MONTH_PATTERN = /^(\d{4})-(\d{1,2})$/

/**
 * A blog post in one language. Its address has the month of its date: /blog/2026-03/{slug}.
 *
 * GET /api/content/blog/post/{slug}?locale=de&month=2026-03
 */
export default defineEventHandler(async (event) => {
  const locale = getLocaleParam(event)
  const slug = getSlugParam(event)
  const month = MONTH_PATTERN.exec(String(getQuery(event).month ?? ''))
  if (!month) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  const yearMonth = `${month[1]}-${month[2]!.padStart(2, '0')}`

  const post = await queryPublished(event, 'blog')
    .where('path', '=', `/blog/${slug}.${locale}`)
    .where('date', '>=', `${yearMonth}-01`)
    .where('date', '<', `${yearMonth}-32`)
    .first()
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  return post
})
