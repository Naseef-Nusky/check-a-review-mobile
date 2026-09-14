export const APP_NAME = 'Check A Review'
export const CONTACT_EMAIL = 'info@checkareview.com'

/** Public website — legal pages stay in sync with checkareview.com */
export const PUBLIC_SITE_URL = 'https://checkareview.com'
export const PRIVACY_URL = `${PUBLIC_SITE_URL}/privacy`
export const TERMS_URL = `${PUBLIC_SITE_URL}/terms`
export const TERMS_BUSINESS_URL = `${PUBLIC_SITE_URL}/terms/business`

/** Paste into App Store Connect → App Review Information → Notes */
export const APP_STORE_REVIEW_NOTES = `Check A Review is a review platform with two account types.

Customer accounts are free. Customers can search businesses, write reviews, and delete their account from Profile.

Business subscriptions are B2B SaaS sold only to companies (Guideline 3.1.3(c) Enterprise Services). They are billed monthly via Square to the company account. Customers never pay. This is not a consumer in-app purchase and does not unlock consumer content.

Photo library access is used only to set a customer profile picture or upload a business logo.`

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
