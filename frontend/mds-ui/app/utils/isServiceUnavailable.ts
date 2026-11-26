const TEMPORARY_CLIENT_ERRORS = [408, 429]

export function isServiceUnavailable(error: unknown): boolean {
  if (!error) {
    return false
  }
  const status = (error as { statusCode?: number }).statusCode
  return status === undefined || status >= 500 || TEMPORARY_CLIENT_ERRORS.includes(status)
}
