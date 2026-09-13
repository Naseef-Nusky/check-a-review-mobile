import { getApiBaseUrl } from '../utils/apiBaseUrl'
import { clearAuth, getToken } from '../storage/authStorage'
import { appendLogoToFormData, type LogoFile } from '../utils/logoUpload'

export class ApiError extends Error {
  status: number
  code: string | null

  constructor(message: string, status: number, code: string | null = null) {
    super(message)
    this.status = status
    this.code = code
  }
}

export type BusinessSearchItem = {
  id: string | number
  name?: string
  slug?: string
  category?: string
  city?: string
  averageRating?: number
  average_rating?: number
  reviewCount?: number
  review_count?: number
  logo_url?: string
  logoUrl?: string
  logo?: string
}

function isFormDataBody(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  if (typeof FormData !== 'undefined' && body instanceof FormData) return true
  return typeof (body as FormData).append === 'function'
}

async function request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const method = String(options.method || 'GET').toUpperCase()
  const isFormData = isFormDataBody(options.body)
  const apiBaseUrl = getApiBaseUrl()
  const url = `${apiBaseUrl}${endpoint}`
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  // iOS fetch can fail with "Network request failed" if JSON Content-Type is set on GET.
  if (!isFormData && options.body != null && method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json'
  }
  if (token) headers.Authorization = `Bearer ${token}`
  Object.assign(headers, (options.headers || {}) as Record<string, string>)

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Network request failed'
    throw new ApiError(`Cannot reach the API at ${apiBaseUrl}. ${detail}`, 0)
  }

  const text = await response.text()
  let json: { message?: string; data?: unknown; code?: string } = {}
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      throw new ApiError(
        `Request failed (${response.status}). The API did not return JSON from ${url}`,
        response.status,
      )
    }
  } else if (!response.ok) {
    throw new ApiError(`Request failed (${response.status}) from ${url}`, response.status)
  }

  if (!response.ok) {
    if (response.status === 401) {
      await clearAuth()
    }
    throw new ApiError(json.message || `Request failed (${response.status})`, response.status, json.code || null)
  }

  if (response.status === 204) return null as T
  return (json.data !== undefined ? json.data : json) as T
}

export const api = {
  get: <T = unknown>(endpoint: string) => request<T>(endpoint),
  post: <T = unknown>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  put: <T = unknown>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data ?? {}) }),
  patch: <T = unknown>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data ?? {}) }),
  delete: <T = unknown>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
  upload: <T = unknown>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, { method: 'POST', body: formData }),
}

export const authApi = {
  login: (email: string, password: string, role: 'customer' | 'business') =>
    api.post<{ token: string; user: Record<string, unknown> }>('/auth/login', {
      email,
      password,
      role,
    }),
  loginWithApple: (data: { identityToken: string; email?: string | null; fullName?: string }) =>
    api.post<{ token: string; user: Record<string, unknown> }>('/auth/apple', data),
  register: (data: {
    name: string
    email: string
    password: string
    role: 'customer' | 'business'
    category?: string
    website?: string | null
    phone?: string | null
    description?: string
  }) =>
    api.post<{
      requiresEmailVerification?: boolean
      message?: string
      token?: string
      user?: Record<string, unknown>
    }>('/auth/register', data),
  verifyEmail: (email: string, code: string, role: 'customer' | 'business') =>
    api.post<{ token: string; user: Record<string, unknown> }>('/auth/verify-email', {
      email,
      code,
      role,
    }),
  resendVerification: (email: string, role: 'customer' | 'business') =>
    api.post<{ message?: string }>('/auth/resend-verification', { email, role }),
  me: () => api.get<Record<string, unknown>>('/auth/me'),
  updateProfile: (data: { name?: string }) =>
    api.put<Record<string, unknown>>('/auth/me', data),
  changePassword: (data: { currentPassword?: string; password: string }) =>
    api.post<{ user: Record<string, unknown>; token: string; first_password?: boolean }>(
      '/auth/change-password',
      data,
    ),
  uploadAvatar: (file: { uri: string; name: string; type: string }) => {
    const formData = new FormData()
    formData.append('avatar', file as unknown as Blob)
    return api.upload<Record<string, unknown>>('/auth/me/avatar', formData)
  },
  removeAvatar: () => api.delete<Record<string, unknown>>('/auth/me/avatar'),
}

export const customerApi = {
  searchBusinesses: (params: { q?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams()
    if (params.q) query.set('q', params.q)
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<{
      businesses?: BusinessSearchItem[]
      items?: BusinessSearchItem[]
      total?: number
      page?: number
      limit?: number
    }>(`/businesses/search${qs ? `?${qs}` : ''}`)
  },
  getBusiness: (idOrSlug: string) => api.get(`/businesses/${idOrSlug}`),
  getBusinessReviews: (businessId: string | number, limit = 20) =>
    api.get(`/reviews/business/${businessId}?limit=${limit}`),
  getReviewSummary: (businessId: string | number) =>
    api.get(`/businesses/${businessId}/review-summary`),
  createReview: (data: {
    businessId: string | number
    rating: number
    title?: string
    content: string
  }) => api.post('/reviews', data),
  getMyReviews: () => api.get('/reviews/my'),
  submitBusinessClaim: (
    idOrSlug: string | number,
    data: {
      fullName: string
      email: string
      phone: string
      jobTitle: string
      relationship: string
      verificationInfo: string
      password: string
    },
    files: Array<{ uri: string; name: string; type: string }> = [],
  ) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value))
    })
    files.forEach((file) => {
      formData.append('attachments', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as unknown as Blob)
    })
    return api.upload<{
      id?: string
      status?: string
      emailVerified?: boolean
      attachmentCount?: number
      message?: string
    }>(`/claims/businesses/${idOrSlug}/claim`, formData)
  },
  getClaimAvailability: (idOrSlug: string | number) =>
    api.get<{
      claimed?: boolean
      claimInProgress?: boolean
      canSubmitClaim?: boolean
      businessName?: string
    }>(`/claims/businesses/${idOrSlug}/availability`),
  /** Same endpoint as the public website claim verify page */
  verifyBusinessClaimEmail: (tokenOrCode: string) =>
    api.post<{
      alreadyVerified?: boolean
      businessName?: string
      status?: string
      emailVerified?: boolean
      message?: string
    }>('/claims/verify-email', { code: tokenOrCode, token: tokenOrCode }),
  resendClaimVerification: (email: string, businessId?: string | number) =>
    api.post<{ message?: string; businessName?: string }>('/claims/resend-verification', {
      email,
      ...(businessId != null ? { businessId: String(businessId) } : {}),
    }),
}

export const businessApi = {
  getMyProfile: () => api.get<Record<string, unknown>>('/businesses/my/profile'),
  updateBusiness: (id: string | number, data: Record<string, unknown>) =>
    api.put(`/businesses/${id}`, data),
  uploadLogo: async (id: string | number, file: LogoFile) => {
    const formData = new FormData()
    await appendLogoToFormData(formData, file)
    return api.upload(`/businesses/${id}/logo`, formData)
  },
  getCategories: () => api.get('/businesses/categories'),
  getReviews: (businessId: string | number) =>
    api.get(`/reviews/business/${businessId}?limit=50`),
  replyToReview: (reviewId: string | number, reply: string) =>
    api.post(`/reviews/${reviewId}/reply`, { reply }),
  getAnalytics: (businessId: string | number) =>
    api.get(`/businesses/${businessId}/analytics`),
  getNotifications: () => api.get('/notifications'),
  getSubscription: (businessId: string | number) =>
    api.get<Record<string, unknown>>(`/subscriptions/${businessId}`),
  getPayments: (businessId: string | number) =>
    api.get<Record<string, unknown>[]>(`/subscriptions/${businessId}/payments`),
  getSquareConfig: () =>
    api.get<{
      applicationId?: string
      locationId?: string
      environment?: string
      cardPaymentsEnabled?: boolean
    }>('/subscriptions/square-config'),
  createCheckout: (businessId: string | number, plan: string) =>
    api.post<{
      sessionId?: string
      url?: string
      sandboxMode?: boolean
      plan?: string
    }>('/subscriptions/checkout', { businessId, plan }),
  payWithCard: (
    businessId: string | number,
    plan: string,
    sourceId: string,
    verificationToken?: string,
  ) =>
    api.post<Record<string, unknown>>('/subscriptions/pay-with-card', {
      businessId,
      plan,
      sourceId,
      ...(verificationToken ? { verificationToken } : {}),
    }),
  updatePaymentMethod: (
    businessId: string | number,
    sourceId: string,
    verificationToken?: string,
  ) =>
    api.post<Record<string, unknown>>('/subscriptions/update-payment-method', {
      businessId,
      sourceId,
      ...(verificationToken ? { verificationToken } : {}),
    }),
  cancelSubscription: (businessId: string | number) =>
    api.post<Record<string, unknown>>('/subscriptions/cancel', { businessId }),
  confirmCheckout: (businessId: string | number) =>
    api.post<Record<string, unknown>>('/subscriptions/confirm-checkout', { businessId }),
}
