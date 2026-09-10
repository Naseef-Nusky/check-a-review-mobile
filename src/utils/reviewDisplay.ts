export type ReviewLike = {
  author_name?: string
  authorName?: string
  author?: string
  customerName?: string
  customer_name?: string
  userName?: string
  user_name?: string
  name?: string
  business_reply?: string
  businessReply?: string
  reply?: string
  author_avatar?: string
  authorAvatar?: string
  [key: string]: unknown
}

export function getReviewerName(review: ReviewLike): string {
  return (
    String(
      review.author_name ||
        review.authorName ||
        review.author ||
        review.customerName ||
        review.customer_name ||
        review.userName ||
        review.user_name ||
        review.name ||
        '',
    ).trim() || 'Anonymous'
  )
}

export function getReviewReply(review: ReviewLike): string {
  return String(review.business_reply || review.businessReply || review.reply || '').trim()
}

export function getReviewerAvatar(review: ReviewLike): string {
  return String(review.author_avatar || review.authorAvatar || '').trim()
}

export function normalizeReviewsList(data: unknown): ReviewLike[] {
  if (Array.isArray(data)) return data as ReviewLike[]
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.items)) return obj.items as ReviewLike[]
    if (Array.isArray(obj.reviews)) return obj.reviews as ReviewLike[]
  }
  return []
}
