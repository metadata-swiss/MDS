/**
 * Input of the handbook search page in one language: the search sections of the published and active articles, and
 * the address of each article for the result links.
 *
 * GET /api/content/search/handbook?locale=de
 */
export default defineEventHandler(async (event) => {
  const locale = getLocaleParam(event)

  const [sections, articles] = await Promise.all([
    publishedSearchSections(event, 'handbook', locale)
      .orWhere(q => q.where('active', 'IS NULL').where('active', '=', true)),
    loadHandbookArticles(event, locale),
  ])

  return { sections, articles: articles.map(({ path, url }) => ({ path, url })) }
})
