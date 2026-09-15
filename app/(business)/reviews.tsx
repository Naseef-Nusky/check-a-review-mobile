import { useCallback, useState } from 'react'
import { Alert, FlatList, RefreshControl, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { businessApi, ApiError } from '../../src/services/api'
import { Button, ErrorText, Field, Screen, Subtitle } from '../../src/components/ui'
import { ReviewCard } from '../../src/components/ReviewCard'
import { AiReviewSummaryCard, type AiReviewSummary } from '../../src/components/AiReviewSummaryCard'
import { colors } from '../../src/constants'
import {
  getReviewReply,
  normalizeReviewsList,
  type ReviewLike,
} from '../../src/utils/reviewDisplay'

export default function BusinessReviewsScreen() {
  const [businessId, setBusinessId] = useState<string | number | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [businessLogo, setBusinessLogo] = useState('')
  const [items, setItems] = useState<ReviewLike[]>([])
  const [aiSummary, setAiSummary] = useState<AiReviewSummary | null>(null)
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const profile = (await businessApi.getMyProfile()) as {
        id: string | number
        name?: string
        logo_url?: string
        logoUrl?: string
      }
      setBusinessId(profile.id)
      setBusinessName(String(profile.name || ''))
      setBusinessLogo(String(profile.logo_url || profile.logoUrl || ''))
      setAiSummaryLoading(true)
      const [data, summaryData] = await Promise.all([
        businessApi.getReviews(profile.id),
        businessApi.getReviewSummary(profile.id).catch(() => null),
      ])
      setItems(normalizeReviewsList(data))
      setAiSummary((summaryData as AiReviewSummary) || null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load reviews')
    } finally {
      setAiSummaryLoading(false)
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  async function sendReply(reviewId: string | number) {
    const key = String(reviewId)
    const reply = (replyDrafts[key] || '').trim()
    if (!reply) {
      Alert.alert('Reply required', 'Write a reply before sending.')
      return
    }
    setSavingId(key)
    try {
      await businessApi.replyToReview(reviewId, reply)
      setReplyDrafts((prev) => ({ ...prev, [key]: '' }))
      await load()
    } catch (err) {
      Alert.alert('Reply failed', err instanceof ApiError ? err.message : 'Could not send reply')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Screen style={{ paddingBottom: 0 }}>
      <Subtitle>Read and reply to customer reviews.</Subtitle>
      <ErrorText>{error}</ErrorText>
      <FlatList
        data={items}
        keyExtractor={(item, index) => String(item.id || index)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <AiReviewSummaryCard summary={aiSummary} loading={aiSummaryLoading} />
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 24 }}>
              {businessId ? 'No reviews yet' : 'Loading business…'}
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const key = String(item.id)
          const existingReply = getReviewReply(item)
          return (
            <ReviewCard
              review={item}
              businessName={businessName}
              businessLogo={businessLogo}
              showActions={false}
              footer={
                existingReply ? null : (
                  <View style={{ marginTop: 12 }}>
                    <Field
                      placeholder="Write a reply…"
                      value={replyDrafts[key] || ''}
                      onChangeText={(text) => setReplyDrafts((prev) => ({ ...prev, [key]: text }))}
                      multiline
                      style={{ minHeight: 80, textAlignVertical: 'top' }}
                    />
                    <Button
                      label="Send reply"
                      onPress={() => sendReply(item.id as string | number)}
                      loading={savingId === key}
                    />
                  </View>
                )
              }
            />
          )
        }}
      />
    </Screen>
  )
}
