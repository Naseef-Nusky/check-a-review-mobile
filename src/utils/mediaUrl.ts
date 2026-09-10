/** Resolve uploaded media (e.g. /uploads/logos/...) against the API host */

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:5000/api'

export function resolveMediaUrl(path?: string | null): string {
  if (!path) return ''
  const value = String(path)
  if (/^https?:\/\//i.test(value) || value.startsWith('data:') || value.startsWith('file:')) {
    return value
  }
  const normalized = value.startsWith('/') ? value : `/${value}`
  try {
    if (/^https?:\/\//i.test(API_BASE_URL)) {
      return `${new URL(API_BASE_URL).origin}${normalized}`
    }
  } catch {
    // fall through
  }
  return normalized
}
