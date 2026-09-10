import { useCallback, useMemo, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import { businessApi, ApiError } from '../../src/services/api'
import { Button, Card, ErrorText, Screen, Stars, Subtitle, Title } from '../../src/components/ui'
import { BusinessLogo } from '../../src/components/BusinessLogo'
import { colors } from '../../src/constants'
import { getReviewReply, getReviewerName, normalizeReviewsList } from '../../src/utils/reviewDisplay'

type BusinessProfile = {
  id: string | number
  name?: string
  category?: string
  website?: string
  email?: string
  phone?: string
  status?: string
  averageRating?: number
  average_rating?: number
  reviewCount?: number
  review_count?: number
  logo_url?: string
  logoUrl?: string
  logo?: string
}

type NotificationItem = {
  id: string | number
  title?: string
  message?: string
  read?: boolean
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: keyof typeof Ionicons.glyphMap
}) {
  return (
    <View
      style={{
        width: '48%',
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: '#fff1f5',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: colors.muted, marginTop: 4, fontSize: 13 }}>{label}</Text>
    </View>
  )
}

export default function BusinessDashboardScreen() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [reviews, setReviews] = useState<ReturnType<typeof normalizeReviewsList>>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const biz = (await businessApi.getMyProfile()) as BusinessProfile
      setProfile(biz)
      if (biz?.id) {
        const [reviewData, notes] = await Promise.all([
          businessApi.getReviews(biz.id),
          businessApi.getNotifications().catch(() => []),
        ])
        setReviews(normalizeReviewsList(reviewData))
        setNotifications(Array.isArray(notes) ? (notes as NotificationItem[]) : [])
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Could not load dashboard'
      setError(
        message === 'Business not found'
          ? 'No company is linked to this login (or your team access is disabled). Use the business owner email, or switch to Customer.'
          : message,
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const unrepliedReviews = useMemo(
    () => reviews.filter((review) => !getReviewReply(review)),
    [reviews],
  )
  const unreadCount = notifications.filter((n) => !n.read).length
  const rating = Number(profile?.averageRating ?? profile?.average_rating ?? 0)
  const count = Number(profile?.reviewCount ?? profile?.review_count ?? 0)
  const logo = profile?.logo_url || profile?.logoUrl || profile?.logo
  const detailLine = [profile?.category, profile?.website, profile?.email, profile?.phone]
    .filter(Boolean)
    .join(' · ')

  return (
    <Screen style={{ paddingBottom: 0 }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <Title>Dashboard</Title>
        <Subtitle>
          {profile?.name
            ? `Overview for ${profile.name}`
            : 'Overview of your reputation and review activity.'}
        </Subtitle>
        <ErrorText>{error}</ErrorText>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          <View style={{ flexGrow: 1, minWidth: '46%' }}>
            <Button
              label={
                unrepliedReviews.length > 0
                  ? `Reply to reviews (${unrepliedReviews.length})`
                  : 'Manage reviews'
              }
              onPress={() => router.push('/(business)/reviews')}
            />
          </View>
          <View style={{ flexGrow: 1, minWidth: '46%' }}>
            <Button
              label="Edit company details"
              variant="ghost"
              onPress={() => router.push('/(business)/profile')}
            />
          </View>
          <View style={{ flexGrow: 1, minWidth: '46%' }}>
            <Button
              label="Subscription plans"
              variant="ghost"
              onPress={() => router.push('/(business)/subscription')}
            />
          </View>
        </View>

        {profile?.status === 'pending' ? (
          <Card>
            <Text style={{ color: '#FCD34D', fontWeight: '700' }}>Awaiting admin approval</Text>
            <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>
              You can finish your profile, but your business will not appear in public search until approved.
            </Text>
          </Card>
        ) : null}

        {profile?.status === 'rejected' ? (
          <Card>
            <Text style={{ color: colors.danger, fontWeight: '700' }}>Listing not approved</Text>
            <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>
              Update your company details and contact support if you need help getting approved.
            </Text>
          </Card>
        ) : null}

        {!loading && unrepliedReviews.length > 0 ? (
          <Card>
            <Text style={{ color: '#FCD34D', fontWeight: '700' }}>
              {unrepliedReviews.length} review{unrepliedReviews.length === 1 ? '' : 's'} waiting for your reply
            </Text>
            <Text style={{ color: colors.muted, marginTop: 6, marginBottom: 10, lineHeight: 20 }}>
              Respond publicly from the reviews page to keep customers engaged.
            </Text>
            <Button label="Reply now" onPress={() => router.push('/(business)/reviews')} />
          </Card>
        ) : null}

        <Card>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <BusinessLogo uri={logo} name={profile?.name} size={56} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Company details</Text>
                <Pressable onPress={() => router.push('/(business)/profile')}>
                  <Text style={{ color: colors.accent, fontWeight: '600' }}>Edit →</Text>
                </Pressable>
              </View>
              <Text style={{ color: colors.text, marginTop: 6, fontWeight: '600' }}>
                {profile?.name || 'Your business'}
              </Text>
              <Text style={{ color: colors.muted, marginTop: 4, lineHeight: 20 }}>
                {detailLine || 'Add your website, email, and phone on the profile page.'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Stars rating={rating} />
                <Text style={{ color: colors.muted }}>{count} reviews</Text>
              </View>
            </View>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <StatCard label="Average rating" value={loading ? '…' : rating.toFixed(1)} icon="star" />
          <StatCard label="Total reviews" value={loading ? '…' : String(count)} icon="chatbubbles" />
          <StatCard
            label="Awaiting reply"
            value={loading ? '…' : String(unrepliedReviews.length)}
            icon="alert-circle"
          />
          <StatCard label="Unread alerts" value={loading ? '…' : String(unreadCount)} icon="notifications" />
        </View>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Recent notifications</Text>
          {loading ? (
            <Text style={{ color: colors.muted, marginTop: 8 }}>Loading...</Text>
          ) : notifications.length === 0 ? (
            <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
              No notifications yet. New and updated reviews will appear here.
            </Text>
          ) : (
            <View style={{ marginTop: 12, gap: 10 }}>
              {notifications.slice(0, 5).map((note) => (
                <View
                  key={String(note.id)}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: colors.page,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                    <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                      {note.title || 'Notification'}
                    </Text>
                    {!note.read ? (
                      <View
                        style={{
                          backgroundColor: '#fff1f5',
                          borderRadius: 999,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700' }}>New</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={{ color: colors.muted, marginTop: 4 }} numberOfLines={2}>
                    {note.message || ''}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Recent reviews</Text>
            {unrepliedReviews.length > 0 ? (
              <View
                style={{
                  backgroundColor: 'rgba(251, 191, 36, 0.18)',
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ color: '#FCD34D', fontSize: 11, fontWeight: '700' }}>
                  {unrepliedReviews.length} need reply
                </Text>
              </View>
            ) : null}
          </View>

          {loading ? (
            <Text style={{ color: colors.muted, marginTop: 8 }}>Loading...</Text>
          ) : reviews.length === 0 ? (
            <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
              No published reviews yet. Invite customers to leave feedback.
            </Text>
          ) : (
            <View style={{ marginTop: 12, gap: 10 }}>
              {reviews.slice(0, 5).map((review) => {
                const needsReply = !getReviewReply(review)
                return (
                  <Pressable
                    key={String(review.id)}
                    onPress={() => router.push('/(business)/reviews')}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      padding: 12,
                      backgroundColor: colors.page,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                      <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                        {getReviewerName(review)}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View
                          style={{
                            backgroundColor: needsReply
                              ? 'rgba(251, 191, 36, 0.18)'
                              : 'rgba(16, 185, 129, 0.18)',
                            borderRadius: 999,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                          }}
                        >
                          <Text
                            style={{
                              color: needsReply ? '#FCD34D' : '#6EE7B7',
                              fontSize: 11,
                              fontWeight: '700',
                            }}
                          >
                            {needsReply ? 'Needs reply' : 'Replied'}
                          </Text>
                        </View>
                        <Text style={{ color: colors.muted, fontSize: 13 }}>
                          {Number(review.rating || 0)}/5
                        </Text>
                      </View>
                    </View>
                    <Text style={{ color: colors.muted, marginTop: 4 }} numberOfLines={2}>
                      {String(review.title || review.content || '')}
                    </Text>
                    {needsReply ? (
                      <Text style={{ color: colors.accent, marginTop: 8, fontWeight: '600', fontSize: 12 }}>
                        Reply from dashboard →
                      </Text>
                    ) : null}
                  </Pressable>
                )
              })}
            </View>
          )}

          <Pressable onPress={() => router.push('/(business)/reviews')} style={{ marginTop: 14 }}>
            <Text style={{ color: colors.accent, fontWeight: '600' }}>Manage reviews →</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </Screen>
  )
}
