import { useMemo, useState } from 'react'
import { Pressable, Share, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ProfileAvatar } from './ProfileAvatar'
import { BusinessLogo } from './BusinessLogo'
import { Stars } from './ui'
import { colors } from '../constants'
import {
  getReviewReply,
  getReviewerAvatar,
  getReviewerName,
  type ReviewLike,
} from '../utils/reviewDisplay'

function formatReviewDate(value?: unknown): string {
  if (!value) return 'Recently'
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function ExpandableText({
  text,
  previewLines = 8,
  color = colors.muted,
}: {
  text: string
  previewLines?: number
  color?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const needsToggle = text.length > 220 || text.split('\n').length > previewLines

  return (
    <View>
      <Text style={{ color, lineHeight: 22, fontSize: 14 }} numberOfLines={expanded ? undefined : previewLines}>
        {text}
      </Text>
      {needsToggle ? (
        <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8} style={{ marginTop: 6 }}>
          <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 13 }}>
            {expanded ? 'Show less' : 'Show more'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  )
}

type Props = {
  review: ReviewLike
  businessName?: string
  businessLogo?: string | null
  showActions?: boolean
  footer?: React.ReactNode
}

export function ReviewCard({
  review,
  businessName,
  businessLogo,
  showActions = true,
  footer,
}: Props) {
  const [helpfulCount, setHelpfulCount] = useState(Number(review.helpfulCount || review.helpful_count || 0))
  const [markedHelpful, setMarkedHelpful] = useState(false)

  const author = getReviewerName(review)
  const avatar = getReviewerAvatar(review)
  const replyText = getReviewReply(review)
  const title = String(review.title || '').trim()
  const content = String(review.content || review.body || '').trim()
  const dateLabel = formatReviewDate(review.created_at || review.date || review.createdAt)
  const experienceDate = formatReviewDate(review.experience_date || review.experienceDate)
  const hasExperience = Boolean(review.experience_date || review.experienceDate)
  const replyDate = formatReviewDate(review.business_reply_at || review.replyDate || review.businessReplyAt)

  const sharePayload = useMemo(
    () => `${title || 'Review'} — ${author}\n${content}`.trim(),
    [author, content, title],
  )

  async function onShare() {
    try {
      await Share.share({ message: sharePayload })
    } catch {
      // cancelled
    }
  }

  function onHelpful() {
    if (markedHelpful) {
      setMarkedHelpful(false)
      setHelpfulCount((count) => Math.max(0, count - 1))
      return
    }
    setMarkedHelpful(true)
    setHelpfulCount((count) => count + 1)
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.authorRow}>
          <ProfileAvatar uri={avatar} name={author} size={48} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.authorName} numberOfLines={1}>
              {author}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {dateLabel}
            </Text>
          </View>
        </View>
        <View style={styles.ratingBlock}>
          <Stars rating={Number(review.rating || 0)} />
        </View>
      </View>

      {title ? <Text style={styles.title}>{title}</Text> : null}
      {content ? (
        <View style={{ marginTop: title ? 8 : 10 }}>
          <ExpandableText text={content} />
        </View>
      ) : null}

      {hasExperience ? (
        <Text style={styles.experience}>
          Date of experience: <Text style={styles.experienceValue}>{experienceDate}</Text>
        </Text>
      ) : null}

      {showActions ? (
        <View style={styles.actions}>
          <Pressable
            onPress={onHelpful}
            style={[styles.actionBtn, markedHelpful && styles.actionBtnActive]}
          >
            <Ionicons
              name={markedHelpful ? 'thumbs-up' : 'thumbs-up-outline'}
              size={16}
              color={markedHelpful ? colors.accent : colors.muted}
            />
            <Text style={[styles.actionText, markedHelpful && styles.actionTextActive]}>Helpful</Text>
            {helpfulCount > 0 ? (
              <Text style={styles.actionCount}>({helpfulCount})</Text>
            ) : null}
          </Pressable>

          <Pressable onPress={onShare} style={styles.actionBtn}>
            <Ionicons name="share-outline" size={16} color={colors.muted} />
            <Text style={styles.actionText}>Share</Text>
          </Pressable>
        </View>
      ) : null}

      {footer}

      {replyText ? (
        <View style={styles.replyBox}>
          <View style={styles.replyHeader}>
            <BusinessLogo uri={businessLogo} name={businessName || 'Business'} size={32} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.replyTitleRow}>
                <Text style={styles.replyAuthor} numberOfLines={1}>
                  {businessName || 'Business'}
                </Text>
                <View style={styles.replyBadge}>
                  <Text style={styles.replyBadgeText}>Company reply</Text>
                </View>
              </View>
              {replyDate && replyDate !== 'Recently' ? (
                <Text style={styles.meta}>{replyDate}</Text>
              ) : null}
            </View>
          </View>
          <View style={{ marginTop: 10 }}>
            <ExpandableText text={replyText} previewLines={5} color="#cbd5e1" />
          </View>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  authorName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  ratingBlock: {
    alignItems: 'flex-end',
    paddingTop: 2,
  },
  title: {
    marginTop: 14,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  experience: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 12,
  },
  experienceValue: {
    color: colors.text,
    fontWeight: '600',
  },
  actions: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.page,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  actionBtnActive: {
    borderColor: '#ff9ebb',
    backgroundColor: '#fff1f5',
  },
  actionText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  actionTextActive: {
    color: colors.accent,
  },
  actionCount: {
    color: colors.muted,
    fontSize: 12,
  },
  replyBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  replyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  replyAuthor: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  replyBadge: {
    backgroundColor: '#fff1f5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  replyBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
})
