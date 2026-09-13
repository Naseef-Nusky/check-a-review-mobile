import Constants from 'expo-constants'
import { Platform } from 'react-native'

const DEFAULT_API_URL = 'http://localhost:5001/api'

function rewriteLegacyPort(url: string) {
  // macOS AirPlay owns 5000, so local API runs on 5001.
  return url.replace(/:5000(?=\/|$)/, ':5001')
}

function hostnameFromCandidate(value?: string | null): string | null {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null
  try {
    const withProtocol = /^[a-z]+:\/\//i.test(raw) ? raw : `http://${raw}`
    const hostname = new URL(withProtocol).hostname
    if (
      !hostname ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname === '::1'
    ) {
      return null
    }
    return hostname
  } catch {
    return null
  }
}

function expoLanHost(): string | null {
  const extras = Constants as typeof Constants & {
    expoGoConfig?: { debuggerHost?: string }
    manifest?: { debuggerHost?: string; hostUri?: string }
    manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } }
  }

  return (
    hostnameFromCandidate(Constants.expoConfig?.hostUri) ||
    hostnameFromCandidate(extras.expoGoConfig?.debuggerHost) ||
    hostnameFromCandidate(extras.manifest2?.extra?.expoGo?.debuggerHost) ||
    hostnameFromCandidate(extras.manifest?.debuggerHost) ||
    hostnameFromCandidate(extras.manifest?.hostUri) ||
    hostnameFromCandidate(Constants.linkingUri)
  )
}

export function resolveApiBaseUrl(raw = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL): string {
  let url = String(raw || DEFAULT_API_URL).trim().replace(/\/+$/, '')

  // Dev-only: map localhost to the Mac LAN IP so a phone/simulator can reach the API.
  // Production builds use EXPO_PUBLIC_API_URL as-is (e.g. https://checkareview.com/api).
  const isDev = typeof __DEV__ !== 'undefined' && __DEV__
  if (!isDev) return url

  url = rewriteLegacyPort(url)

  if (Platform.OS !== 'web') {
    try {
      const parsed = new URL(url)
      const isLoopback =
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname === '[::1]' ||
        parsed.hostname === '::1'
      if (isLoopback) {
        const lan = expoLanHost()
        if (lan) parsed.hostname = lan
        url = parsed.toString().replace(/\/+$/, '')
      }
    } catch {
      // keep original
    }
  }

  return url
}

/** Resolve on each call so Expo's LAN host is available after Metro connects. */
export function getApiBaseUrl() {
  return resolveApiBaseUrl()
}

export const API_BASE_URL = getApiBaseUrl()

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('[Check A Review] API_BASE_URL =', getApiBaseUrl())
}
