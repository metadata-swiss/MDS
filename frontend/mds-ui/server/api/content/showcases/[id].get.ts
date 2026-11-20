/**
 * An active showcase in one language, with the contact person (`contactDetails`), which only the German version holds.
 * The id is the file name without the language.
 *
 * GET /api/content/showcases/{id}?locale=de
 */
export default defineEventHandler(async (event) => {
  const locale = getLocaleParam(event)
  const id = getSlugParam(event, 'id')

  const [showcase, german] = await Promise.all([
    queryPublished(event, 'showcases')
      .where('stem', '=', `showcases/${id}.${locale}`)
      .where('active', '=', true)
      .first(),
    queryPublished(event, 'showcases')
      .select('relationships')
      .where('stem', '=', `showcases/${id}.de`)
      .where('active', '=', true)
      .first(),
  ])
  if (!showcase) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  return {
    ...showcase,
    // TODO: this compares `type` (organization, organization-external, person) with a role, so it never matches and
    // the page never shows the contact. It was probably meant to be `role`; kept as before, the change needs a decision.
    contactDetails: german?.relationships?.find(relationship => (relationship.type as string) === 'pointOfContact'),
  }
})
