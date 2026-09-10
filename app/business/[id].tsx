import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { customerApi, ApiError } from '../../src/services/api'
import { Button, Card, ErrorText, Screen, Stars } from '../../src/components/ui'
import { BusinessLogo } from '../../src/components/BusinessLogo'
import { ReviewCard } from '../../src/components/ReviewCard'
import { colors } from '../../src/constants'
import { normalizeReviewsList, type ReviewLike } from '../../src/utils/reviewDisplay'

type Business = {
  id: string | number
  name?: string
  description?: string
  category?: string
  city?: string
  averageRating?: number
  average_rating?: number
  reviewCount?: number
  review_count?: number
  logo_url?: string
  logoUrl?: string
  logo?: string
  claimed?: boolean
  verified_contact?: boolean
  verified_identity?: boolean
  verified_ownership?: boolean
}

type AiSummary = {
  summary?: string
  text?: string
  content?: string
  [key: string]: unknown
}

function ExpandableText({
  text,
  previewLines = 4,
}: {
  text: string
  previewLines?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const needsToggle = text.length > 180 || text.split('\n').length > previewLines

  return (
    <View>
      <Text
        style={{ color: colors.muted, lineHeight: 22 }}
        numberOfLines={expanded ? undefined : previewLines}
      >
        {text}
      </Text>
      {needsToggle ? (
        <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8} style={{ marginTop: 6 }}>
          <Text style={{ color: colors.accent, fontWeight: '600' }}>
            {expanded ? 'Show less' : 'Show more'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  )
}

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [reviews, setReviews] = useState<ReviewLike[]>([])
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const biz = (await customerApi.getBusiness(id)) as Business
      setBusiness(biz)
      const [reviewData, summaryData] = await Promise.all([
        customerApi.getBusinessReviews(biz.id, 50),
        customerApi.getReviewSummary(biz.id).catch(() => null),
      ])
      setReviews(normalizeReviewsList(reviewData))
      setAiSummary((summaryData as AiSummary) || null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load business')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const summaryText = useMemo(() => {
    if (!aiSummary) return ''
    if (typeof aiSummary === 'string') return aiSummary
    return String(aiSummary.summary || aiSummary.text || aiSummary.content || '').trim()
  }, [aiSummary])

  if (loading && !business) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    )
  }

  const rating = business?.averageRating ?? business?.average_rating ?? 0
  const count = business?.reviewCount ?? business?.review_count ?? 0
  const logo = business?.logo_url || business?.logoUrl || business?.logo
  const claimed = Boolean(business?.claimed)
  const claimId = business?.id ?? id

  const header = (
    <View style={{ marginBottom: 8 }}>
      <ErrorText>{error}</ErrorText>
      {business ? (
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 8 }}>
            <BusinessLogo uri={logo} name={business.name} size={72} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }} numberOfLines={2}>
                {business.name}
              </Text>
              <Text style={{ color: colors.muted, marginTop: 4 }} numberOfLines={2}>
                {[business.category, business.city].filter(Boolean).join(' · ') || 'Business profile'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Stars rating={Number(rating)} />
            <Text style={{ color: colors.muted }}>{count} reviews</Text>
            {claimed ? (
              <View
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.18)',
                  borderColor: 'rgba(52, 211, 153, 0.35)',
                  borderWidth: 1,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: '#A7F3D0', fontSize: 12, fontWeight: '700' }}>
                  ✓ Verified claimed business
                </Text>
              </View>
            ) : null}
          </View>

          {summaryText ? (
            <Card>
              <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
                AI SUMMARY
              </Text>
              <ExpandableText text={summaryText} previewLines={5} />
            </Card>
          ) : null}

          <View style={{ gap: 10, marginBottom: 4 }}>
            <Button
              label="Write a review"
              onPress={() => router.push(`/write-review/${business.id}`)}
            />
            {!claimed ? (
              <Button
                label="Claim this business"
                variant="ghost"
                onPress={() => router.push(`/claim/${claimId}`)}
              />
            ) : null}
          </View>

          {claimed ? (
            <Card>
              <Text style={{ color: '#A7F3D0', fontWeight: '700', marginBottom: 6 }}>
                ✓ This business has claimed their Check A Review profile.
              </Text>
              {business.verified_contact || business.verified_identity || business.verified_ownership ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 4 }}>
                    Confirmed details
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 8 }}>
                    This business has chosen to confirm specific details about their business with Check A
                    Review.
                  </Text>
                  {business.verified_contact ? (
                    <Text style={{ color: colors.text, marginBottom: 4 }}>✓ Business contact details</Text>
                  ) : null}
                  {business.verified_identity ? (
                    <Text style={{ color: colors.text, marginBottom: 4 }}>✓ User identity</Text>
                  ) : null}
                  {business.verified_ownership ? (
                    <Text style={{ color: colors.text, marginBottom: 4 }}>✓ Business ownership</Text>
                  ) : null}
                </View>
              ) : null}
            </Card>
          ) : (
            <Card>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 6 }}>
                Own this business?
              </Text>
              <Text style={{ color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
                Claim this profile for free to manage your reputation and respond to reviews.
              </Text>
              <Button label="Claim this business" onPress={() => router.push(`/claim/${claimId}`)} />
            </Card>
          )}
        </View>
      ) : null}

      <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 10, color: colors.text }}>
        Reviews
      </Text>
    </View>
  )

  return (
    <Screen style={{ paddingBottom: 0 }}>
      <FlatList
        style={{ flex: 1 }}
        data={reviews}
        keyExtractor={(item, index) => String(item.id || index)}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading ? <Text style={{ color: colors.muted }}>No reviews yet</Text> : null}
        renderItem={({ item }) => (
          <ReviewCard
            review={item}
            businessName={business?.name}
            businessLogo={logo}
          />
        )}
      />
    </Screen>
  )
}
