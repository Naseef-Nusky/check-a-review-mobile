export const APP_NAME = 'Check A Review'

/** Backend API base. Override with EXPO_PUBLIC_API_URL in .env */
export { API_BASE_URL, getApiBaseUrl } from './utils/apiBaseUrl'

export const USER_ROLES = {
  CUSTOMER: 'customer',
  BUSINESS: 'business',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export { resolveMediaUrl } from './utils/mediaUrl'

/** Dark navy theme (matches frontend header slate navy) */
export const colors = {
  primary: '#0f172a',
  primaryDark: '#020617',
  primaryDeeper: '#020617',
  primarySoft: '#e2e8f0',
  primaryMuted: '#cbd5e1',
  accent: '#ff4081',
  bg: '#0f172a',
  page: '#0b1220',
  card: '#111827',
  text: '#f8fafc',
  muted: '#94a3b8',
  border: '#1e293b',
  danger: '#f87171',
  star: '#F59E0B',
  white: '#FFFFFF',
  slate950: '#020617',
  slate900: '#0f172a',
}
