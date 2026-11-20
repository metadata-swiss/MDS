// Fields that the routes in server/api/content select for the lists. The server selects them, and the app derives the
// types of the answers from them (app/model/blog.ts, app/model/handbook.ts, useShowcases, useNavigationItems), so a
// field added or removed here changes both.
//
// Only the names are here: the collection types (BlogCollectionItem, ...) aren't available in shared/.

/**
 * Blog post cards (OdsBlogPostCard): blog list and news section of the home page. Not the body.
 */
export const BLOG_CARD_FIELDS = ['id', 'title', 'image', 'date', 'slug', 'path'] as const

/**
 * Showcases in the lists: cards, search, filters, promoted showcases. Not the body, the relationships or the answers
 * of the submission form.
 */
export const SHOWCASE_CARD_FIELDS = [
  'id', 'stem', 'title', 'description', 'images', 'type', 'datasets', 'keywords', 'themes', 'pinned',
] as const

/**
 * Handbook articles in the handbook navigation. The server adds the address of each article (`url`).
 */
export const HANDBOOK_LINK_FIELDS = ['id', 'title', 'path', 'slug', 'parent', 'after'] as const

/**
 * Pages of the main menu ("more" menu).
 */
export const NAVIGATION_PAGE_FIELDS = ['title', 'stem', 'permalink', 'parent', 'after'] as const
