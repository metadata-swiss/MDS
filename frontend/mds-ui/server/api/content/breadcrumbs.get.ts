const COLLECTIONS = ['pages', 'handbook'] as const
type BreadcrumbCollection = typeof COLLECTIONS[number]

// Deeper addresses don't exist; the limit bounds the number of queries of one request.
const MAX_SEGMENTS = 8

/**
 * Breadcrumbs of a content page, one per path segment, titled from the content. The first segment is a page of the
 * pages collection (for example /handbook); in the handbook, the next segments are handbook articles found by slug.
 * A segment without content keeps its path as title.
 *
 * GET /api/content/breadcrumbs?collection=handbook&path=/handbook/vorbereiten&locale=de
 */
export default defineEventHandler(async (event) => {
  const locale = getLocaleParam(event)
  const { collection, path } = getQuery(event)
  if (!COLLECTIONS.includes(collection as BreadcrumbCollection) || typeof path !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid collection or path' })
  }
  const segments = path.split('/').filter(Boolean)
  if (segments.length > MAX_SEGMENTS || !segments.every(isSlug)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  async function loadTitle(segment: string, index: number) {
    if (collection === 'handbook' && index > 0) {
      const article = await queryPublished(event, 'handbook')
        .select('id', 'title', 'breadcrumb_title')
        .where('path', 'LIKE', `%.${locale}`)
        .where('slug', '=', segment)
        .first()
      return article && { id: article.id, title: article.breadcrumb_title || article.title }
    }
    return queryPublished(event, 'pages')
      .select('id', 'title')
      .where('stem', '=', `pages/${segment}.${locale}`)
      .first()
  }

  return Promise.all(segments.map(async (segment, index) => {
    const crumbPath = '/' + segments.slice(0, index + 1).join('/')
    const content = await loadTitle(segment, index)
    return { id: content?.id, title: content?.title || crumbPath, path: crumbPath }
  }))
})
