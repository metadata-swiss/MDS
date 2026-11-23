/**
 * Input of the blog search page in one language: the search sections of the published posts, and the fields of the
 * posts that the results show (link and image).
 *
 * GET /api/content/search/blog?locale=de
 */
export default defineEventHandler(async (event) => {
  const locale = getLocaleParam(event)

  const [sections, posts] = await Promise.all([
    publishedSearchSections(event, 'blog', locale),
    queryPublished(event, 'blog')
      .select('path', 'date', 'image')
      .where('path', 'LIKE', `%.${locale}`)
      .all(),
  ])

  return { sections, posts }
})
