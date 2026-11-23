import { NAVIGATION_PAGE_FIELDS } from '#shared/content'

/**
 * Pages of the main menu ("more" menu) in one language: only the fields the menu uses.
 *
 * GET /api/content/navigation?locale=de
 */
export default defineEventHandler(async (event) => {
  const locale = getLocaleParam(event)

  return queryPublished(event, 'pages')
    .select(...NAVIGATION_PAGE_FIELDS)
    .where('path', 'LIKE', `%.${locale}`)
    .where('mainMenu', '=', true)
    .all()
})
