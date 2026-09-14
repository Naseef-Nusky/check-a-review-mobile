import Constants from 'expo-constants'
import { Platform } from 'react-native'

const PRODUCTION_API_URL = 'https://api.checkareview.com/api'

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

function isLoopbackHost(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1'
  )
}

function configuredApiUrl() {
  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined
  return process.env.EXPO_PUBLIC_API_URL || extra?.apiUrl || PRODUCTION_API_URL
}

export function resolveApiBaseUrl(raw = configuredApiUrl()): string {
  let url = String(raw || PRODUCTION_API_URL).trim().replace(/\/+$/, '')

  const isDev = typeof __DEV__ !== 'undefined' && __DEV__
  if (!isDev) {
    try {
      if (isLoopbackHost(new URL(url).hostname)) return PRODUCTION_API_URL
    } catch {
      return PRODUCTION_API_URL
    }
    return url
  }

  url = rewriteLegacyPort(url)

  if (Platform.OS !== 'web') {
    try {
      const parsed = new URL(url)
      if (isLoopbackHost(parsed.hostname)) {
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
