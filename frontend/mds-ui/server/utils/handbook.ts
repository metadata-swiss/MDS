import type { H3Event } from 'h3'
import type { AppLanguage } from '~~/app/constants/langages'
import { HANDBOOK_LINK_FIELDS } from '#shared/content'

// Deeper chains don't exist; the limit ends the loop if `parent` references form a cycle.
const MAX_DEPTH = 10

/**
 * Published and active handbook articles in one language, in the order of their files, with the fields that the
 * navigation uses and the address of each article.
 */
export async function loadHandbookArticles(event: H3Event, locale: AppLanguage) {
  const articles = await queryPublished(event, 'handbook')
    .orWhere(q => q.where('active', 'IS NULL').where('active', '=', true))
    .select(...HANDBOOK_LINK_FIELDS)
    .where('path', 'LIKE', `%.${locale}`)
    .all()

  /**
   * Slugs of the article and its parents, from the top: the address is /handbook/{slugs}. A parent is found by its
   * file in the same language; an article whose parent has no version in this language gets an address without it.
   */
  function slugs(article: typeof articles[number]): string[] {
    const result = [article.slug]
    let current = article
    for (let depth = 0; current.parent && depth < MAX_DEPTH; depth++) {
      const parent = articles.find(a => a.path.endsWith(`handbook/${current.parent}.${locale}`))
      if (!parent) break
      result.unshift(parent.slug)
      current = parent
    }
    return result
  }

  return articles.map(article => ({ ...article, url: `/handbook/${slugs(article).join('/')}` }))
}
