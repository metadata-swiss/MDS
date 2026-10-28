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
  // With unique slugs every item is pushed at most once as a start and once as a follower,
  // so the limit is never reached; it only guarantees that the loop ends
  let stepsLeft = list.length * 2
  const placeChain = (start: T) => {
    const stack = [start]
    while (stack.length && stepsLeft > 0) {
      stepsLeft--
      const item = stack.pop()!
      if (visited.has(item)) {
        continue
      }
      visited.add(item)
      sorted.push(item)
      const slug = getSlug(item)
      const next = ((slug && followers.get(slug)) || []).filter(follower => !visited.has(follower))
      // Reversed so that the first follower is placed first
      stack.push(...next.reverse())
    }
  }

  roots.forEach(placeChain)

  // Whatever is left is part of an `after` cycle
  const cyclic = list.filter(item => !visited.has(item))
  if (cyclic.length) {
    console.warn('Cyclic "after" references in content:', cyclic.map(getSlug))
    cyclic.forEach(placeChain)
    // Only if the step limit ran out: keep the remaining items in their original order
    sorted.push(...list.filter(item => !visited.has(item)))
  }

  return sorted
}
