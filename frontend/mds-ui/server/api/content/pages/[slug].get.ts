/**
 * A page of the pages collection in one language, with its body. `index` is the home page.
 *
 * GET /api/content/pages/about?locale=de
 */
export default defineEventHandler(async (event) => {
  const locale = getLocaleParam(event)
  const slug = getSlugParam(event)

  const page = await queryPublished(event, 'pages')
    .where('stem', '=', `pages/${slug}.${locale}`)
    .first()
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  return page
})
