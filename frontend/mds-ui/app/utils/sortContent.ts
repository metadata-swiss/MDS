interface Sortable {
  after?: string | null
}

/**
 * Orders items so that each item with `after` comes right after the item with that slug. Items that follow the
 * same item keep their original order. Items without `after`, or whose target is not in the list, keep their
 * original position. A cycle of `after` references is broken at its first item in the original order.
 */
export function sortContent<T extends Sortable>(items: T[] | undefined, getSlug: (item: T) => string | undefined) {
  const list = items?.slice() || []
  const slugs = new Set(list.map(getSlug))

  // Items that declare `after` per target slug, in their original order
  const followers = new Map<string, T[]>()
  const roots: T[] = []
  for (const item of list) {
    const { after } = item
    if (after && after !== getSlug(item) && slugs.has(after)) {
      const targetFollowers = followers.get(after)
      if (targetFollowers) {
        targetFollowers.push(item)
      }
      else {
        followers.set(after, [item])
      }
    }
    else {
      roots.push(item)
    }
  }

  const sorted: T[] = []
  const visited = new Set<T>()
  const place = (item: T) => {
    if (visited.has(item)) {
      return
    }
    visited.add(item)
    sorted.push(item)
    const slug = getSlug(item)
    for (const follower of (slug && followers.get(slug)) || []) {
      place(follower)
    }
  }

  roots.forEach(place)

  // Whatever is left is part of an `after` cycle
  const cyclic = list.filter(item => !visited.has(item))
  if (cyclic.length) {
    console.warn('Cyclic "after" references in content:', cyclic.map(getSlug))
  }
  cyclic.forEach(place)

  return sorted
}
