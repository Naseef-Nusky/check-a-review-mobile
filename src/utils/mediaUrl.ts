/** Resolve uploaded media (e.g. /uploads/logos/...) against the API host */

import { getApiBaseUrl } from './apiBaseUrl'

export function resolveMediaUrl(path?: string | null): string {
  if (!path) return ''
  const value = String(path)
  if (/^https?:\/\//i.test(value) || value.startsWith('data:') || value.startsWith('file:')) {
    return value
  }
  const normalized = value.startsWith('/') ? value : `/${value}`
  try {
    const apiBaseUrl = getApiBaseUrl()
    if (/^https?:\/\//i.test(apiBaseUrl)) {
      return `${new URL(apiBaseUrl).origin}${normalized}`
    }
  } catch {
    // fall through
  }
  return normalized
}
