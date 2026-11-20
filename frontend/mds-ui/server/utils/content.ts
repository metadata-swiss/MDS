import type { H3Event } from 'h3'
import type { Collections } from '@nuxt/content'
import { queryCollection, queryCollectionSearchSections } from '@nuxt/content/server'
import { APP_LANGUAGES, type AppLanguage } from '~~/app/constants/langages'

// The pages read Nuxt Content only through the routes in server/api/content: the queries run here, on the server.
// The browser doesn't query the content database itself (WebAssembly SQLite with the collection dumps), so the
// rules below (publication date, languages, accepted parameters) apply in one place. ESLint (eslint.config.mjs)
// rejects content queries in app/.
//
// Adding a route for a new need:
// - One file per need in server/api/content: `{name}.get.ts`, or `{name}/[slug].get.ts` for one entry. Look first
//   whether an existing route already returns what the page needs.
// - Query with queryPublished (or publishedSearchSections), never queryCollection directly: entries with a future
//   publication date must not be served.
// - Read the parameters with getLocaleParam, getSlugParam and getIntegerParam: they answer 400/404 for other values.
//   Compare slugs with `=`, not `LIKE`. Keep the parameters few and bounded: each value is a separate cache entry.
// - Select only the fields the page uses. Fields of lists that the app also types go in shared/content.ts, and the
//   app derives its type from them (see app/model/blog.ts).
// - Answer 404 with createError when the entry doesn't exist, and let the page call ensureFound.
// - In the app: `useFetch<T>('/api/content/...', { query: { locale: locale.value } })`.

/**
 * Query of a collection without the entries whose publicationDate is in the future, by the server's clock.
 */
export function queryPublished<T extends keyof Collections>(event: H3Event, collection: T) {
  return queryCollection(event, collection).orWhere(q =>
    q.where('publicationDate', 'IS NULL').where('publicationDate', '<=', new Date().toISOString()),
  )
}

/**
 * Search sections (input of the MiniSearch index of the search pages) of the published entries in one language.
 */
export function publishedSearchSections<T extends keyof Collections>(event: H3Event, collection: T, locale: AppLanguage) {
  return queryCollectionSearchSections(event, collection)
    .where('path', 'LIKE', `%.${locale}`)
    .orWhere(q =>
      q.where('publicationDate', 'IS NULL').where('publicationDate', '<=', new Date().toISOString()),
    )
}

/**
 * The `locale` query parameter. Answers 400 when it isn't one of the app languages.
 */
export function getLocaleParam(event: H3Event): AppLanguage {
  const locale = getQuery(event).locale
  if (typeof locale !== 'string' || !APP_LANGUAGES.includes(locale as AppLanguage)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid locale' })
  }
  return locale as AppLanguage
}

// Slugs come from file names, which the CMS derives from titles: some are over 100 characters long.
const SLUG_PATTERN = /^[\w-]{1,200}$/

/**
 * Whether a path segment can be the slug of a content entry. Slugs are compared with `=`, never with `LIKE`, so
 * `_` and `%` in an address don't act as wildcards.
 */
export function isSlug(value: unknown): value is string {
  return typeof value === 'string' && SLUG_PATTERN.test(value)
}

/**
 * An integer query parameter between min and max. Answers 400 otherwise.
 */
export function getIntegerParam(event: H3Event, name: string, min: number, max: number): number {
  const value = Number(getQuery(event)[name])
  if (!Number.isInteger(value) || value < min || value > max) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${name}` })
  }
  return value
}

/**
 * A route parameter that must be a slug. Answers 404 otherwise: no entry has such an address.
 */
export function getSlugParam(event: H3Event, name = 'slug'): string {
  const slug = getRouterParam(event, name)
  if (!isSlug(slug)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  return slug
}
