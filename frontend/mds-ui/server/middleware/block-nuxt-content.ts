// Nuxt Content serves each collection's whole database (/__nuxt_content/{collection}/sql_dump.txt) and runs SQL sent
// by the caller (/__nuxt_content/{collection}/query), including entries that aren't published yet or aren't active.
// Only the app's own server needs them: queryCollection calls them in-process, behind server/api/content. Requests
// from outside get a 404, so content is only reachable through server/api/content and its rules.
// The dumps must not be prerendered as public files, which would be served before this middleware
// (nitro.prerender.ignore in nuxt.config.ts).
//
// In-process calls (event.$fetch) have a simulated socket without a remote address; a request from the network
// always has one. If an upgrade changed that, the content pages would answer 404 at once instead of leaking content.

/**
 * Whether the address points to Nuxt Content's endpoints, also when written with encoded characters or `..` segments.
 */
function isNuxtContentPath(path: string) {
  let decoded = path
  try {
    decoded = decodeURIComponent(path)
  }
  catch {
    // Malformed encoding: check the address as it is.
  }
  return decoded.toLowerCase().includes('__nuxt_content')
}

export default defineEventHandler((event) => {
  if (event.node.req.socket?.remoteAddress && isNuxtContentPath(event.path)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
})
