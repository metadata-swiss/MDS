/**
 * Handbook articles in one language for the handbook navigation, each with its address (`url`).
 *
 * GET /api/content/handbook?locale=de
 */
export default defineEventHandler(async (event) => {
  return loadHandbookArticles(event, getLocaleParam(event))
})
