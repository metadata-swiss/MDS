/**
 * A handbook article in one language, with its body. The address must be the article's full address: the slugs of
 * its parents, then its own slug (/handbook/vorbereiten/dataset).
 *
 * GET /api/content/handbook/vorbereiten/dataset?locale=de
 */
export default defineEventHandler(async (event) => {
  const locale = getLocaleParam(event)
  const segments = (getRouterParam(event, 'slug') ?? '').split('/').filter(Boolean)
  if (!segments.length || !segments.every(isSlug)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  // The first article with the last slug, if its address is the requested one
  const articles = await loadHandbookArticles(event, locale)
  const leaf = articles.find(article => article.slug === segments.at(-1))
  if (!leaf || leaf.url !== `/handbook/${segments.join('/')}`) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const article = await queryPublished(event, 'handbook')
    .where('id', '=', leaf.id)
    .first()
  if (!article) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  return article
})
