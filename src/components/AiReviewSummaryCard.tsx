import { Text, View } from 'react-native'
import { colors } from '../constants'
import { Card } from './ui'

export type AiReviewSummary = {
  summary?: string
  text?: string
  content?: string
  sentiment?: string
  highlights?: string[]
  cons?: string[]
  reviewCount?: number
  data?: unknown
  [key: string]: unknown
}

export function normalizeAiReviewSummary(raw: unknown): AiReviewSummary | null {
  if (!raw) return null
  if (typeof raw === 'string') {
    const summary = raw.trim()
    return summary ? { summary } : null
  }
  if (typeof raw !== 'object') return null
  const obj = raw as AiReviewSummary
  const nested =
    obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)
      ? (obj.data as AiReviewSummary)
      : obj
  const summary = String(nested.summary || nested.text || nested.content || '').trim()
  const highlights = Array.isArray(nested.highlights) ? nested.highlights.map(String).filter(Boolean) : []
  const cons = Array.isArray(nested.cons) ? nested.cons.map(String).filter(Boolean) : []
  if (!summary && highlights.length === 0 && cons.length === 0) return null
  return { ...nested, summary, highlights, cons }
}

function sentimentLabel(sentiment?: string) {
  switch (String(sentiment || '').toLowerCase()) {
    case 'positive':
      return { text: 'Mostly positive', bg: 'rgba(16, 185, 129, 0.18)', color: '#A7F3D0' }
    case 'negative':
      return { text: 'Mostly negative', bg: 'rgba(248, 113, 113, 0.18)', color: '#FCA5A5' }
    case 'mixed':
      return { text: 'Mixed', bg: 'rgba(245, 158, 11, 0.18)', color: '#FCD34D' }
    default:
      return { text: 'Neutral', bg: colors.page, color: colors.muted }
  }
}

export function AiReviewSummaryCard({
  summary,
  loading,
}: {
  summary?: AiReviewSummary | null
  loading?: boolean
}) {
  if (loading) {
    return (
      <Card>
        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 0.4 }}>
          AI SUMMARY
        </Text>
        <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
          Summarizing customer reviews…
        </Text>
      </Card>
    )
  }

  const data = normalizeAiReviewSummary(summary)
  if (!data?.summary) return null

  const tone = sentimentLabel(data.sentiment)
  const highlights = (data.highlights || []).slice(0, 3)
  const cons = data.cons || []

  return (
    <Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 0.4 }}>
          AI SUMMARY
        </Text>
        <View
          style={{
            backgroundColor: tone.bg,
            borderRadius: 999,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text style={{ color: tone.color, fontSize: 11, fontWeight: '700' }}>{tone.text}</Text>
        </View>
      </View>

      <Text style={{ color: colors.text, marginTop: 10, lineHeight: 22, fontSize: 14 }}>
        {data.summary}
      </Text>

      {highlights.length > 0 ? (
        <View style={{ marginTop: 14 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 }}>
            HIGHLIGHTS
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {highlights.map((item) => (
              <View
                key={item}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.page,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 12 }}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {cons.length > 0 ? (
        <View style={{ marginTop: 14 }}>
          <Text style={{ color: '#FCD34D', fontSize: 11, fontWeight: '700', letterSpacing: 0.4 }}>
            CONS
          </Text>
          {cons.map((item) => (
            <Text key={item} style={{ color: colors.muted, marginTop: 6, lineHeight: 20, fontSize: 13 }}>
              • {item}
            </Text>
          ))}
        </View>
      ) : null}

      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 14 }}>
        Generated from published reviews
        {data.reviewCount != null ? ` (${data.reviewCount})` : ''}.
      </Text>
    </Card>
  )
}
