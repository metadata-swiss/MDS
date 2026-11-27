import { createError } from '#imports'
import type { ErrorType } from '~~/api-client/iop-core-fetch'

const TEMPORARY_CLIENT_ERRORS = [408, 429]

function statusOf(error: unknown) {
  return (error as { statusCode?: number }).statusCode
}

export function isServiceUnavailable(error: unknown): boolean {
  if (!error) {
    return false
  }
  const status = statusOf(error)
  return status === undefined || status >= 500 || TEMPORARY_CLIENT_ERRORS.includes(status)
}

export function isUnexpectedError(error: unknown): boolean {
  return !!error && statusOf(error) !== 400
}

function throwServiceUnavailable(): never {
  throw createError({ statusCode: 503, statusMessage: 'Service Unavailable', fatal: true })
}

export function ensureAvailable(error?: ErrorType<unknown> | null) {
  if (isUnexpectedError(error)) {
    throwServiceUnavailable()
  }
}

/**
 * Ends rendering with the error page (app/error.vue) when a page has nothing to show: 404 when the resource doesn't
 * exist, 503 when iop-core failed or couldn't be reached. Without it, a missing resource renders an empty page with
 * status 200, which search engines index as a real page.
 */
export function ensureFound<T>(value: T | null | undefined, error?: ErrorType<unknown> | null): asserts value is T {
  if (isUnexpectedError(error) && statusOf(error) !== 404) {
    throwServiceUnavailable()
  }
  if (value === null || value === undefined) {
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found', fatal: true })
  }
}
