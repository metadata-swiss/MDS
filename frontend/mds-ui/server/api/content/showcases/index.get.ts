import { SHOWCASE_CARD_FIELDS } from '#shared/content'

/**
 * The active showcases in one language, by title, with the fields that the lists use.
 *
 * GET /api/content/showcases?locale=de
 */
export default defineEventHandler(async (event) => {
  const locale = getLocaleParam(event)

  return queryPublished(event, 'showcases')
    .select(...SHOWCASE_CARD_FIELDS)
    .where('stem', 'LIKE', `%.${locale}`)
    .where('active', '=', true)
    .order('title', 'ASC')
    .all()
})
