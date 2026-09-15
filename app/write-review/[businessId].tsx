import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { customerApi, ApiError } from '../../src/services/api'
import { useAuth } from '../../src/context/AuthContext'
import { Button, Card, Field, Screen } from '../../src/components/ui'
import { BusinessLogo } from '../../src/components/BusinessLogo'
import { colors, REVIEW_TIPS_URL, TRUST_CENTRE_URL } from '../../src/constants'
import { normalizeReviewsList } from '../../src/utils/reviewDisplay'

const SUGGESTED_TAGS = ['Service', 'Technology', 'Recommendation', 'Value', 'Support', 'Quality']

const SCREENING_COPY =
  'Every review is screened by automated fraud/safety checks and AI before going live. Safe, genuine reviews publish automatically; suspicious ones are held for admin approval.'

function todayDateValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateValue(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return new Date()
  return new Date(year, month - 1, day)
}

function formatDisplayDate(value: string) {
  const date = parseDateValue(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatExternalUrl(website: string) {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`
}

function websiteHost(website?: string | null) {
  if (!website) return ''
  try {
    return new URL(formatExternalUrl(website)).hostname
  } catch {
    return website
  }
}

function loginHref(businessId?: string) {
  return {
    pathname: '/(auth)/login' as const,
    params: businessId ? { redirect: `/write-review/${businessId}` } : undefined,
  }
}

function stripExtraLines(content = '') {
  return String(content)
    .replace(/\n\nMentioned:.*$/s, '')
    .replace(/\n\nDate of experience:.*$/s, '')
    .trim()
}

function parseExperienceDate(content = '') {
  const match = String(content).match(/Date of experience:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/)
  return match?.[1] || ''
}

function DateWheel({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = parseDateValue(value)
  const max = parseDateValue(todayDateValue())
  const years = useMemo(() => {
    const current = max.getFullYear()
    return Array.from({ length: 16 }, (_, i) => current - i)
  }, [max])
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const daysInMonth = new Date(selected.getFullYear(), selected.getMonth() + 1, 0).getDate()

  function commit(year: number, monthIndex: number, day: number) {
    const lastDay = new Date(year, monthIndex + 1, 0).getDate()
    const safeDay = Math.min(day, lastDay)
    const next = new Date(year, monthIndex, safeDay)
    if (next > max) {
      onChange(todayDateValue())
      return
    }
    const mm = String(monthIndex + 1).padStart(2, '0')
    const dd = String(safeDay).padStart(2, '0')
    onChange(`${year}-${mm}-${dd}`)
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Date of experience"
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 14,
          minHeight: 50,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: colors.text, fontSize: 16 }}>{formatDisplayDate(value)}</Text>
        <Ionicons name="calendar-outline" size={20} color={colors.muted} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: colors.page,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              paddingBottom: 28,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 12 }}>
              Date of experience
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <ScrollView style={{ maxHeight: 180, flex: 1.1 }} nestedScrollEnabled>
                {years.map((year) => (
                  <Pressable
                    key={year}
                    onPress={() => commit(year, selected.getMonth(), selected.getDate())}
                    style={{
                      paddingVertical: 10,
                      borderRadius: 10,
                      backgroundColor: year === selected.getFullYear() ? colors.card : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: year === selected.getFullYear() ? colors.accent : colors.text,
                        fontWeight: year === selected.getFullYear() ? '700' : '500',
                      }}
                    >
                      {year}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <ScrollView style={{ maxHeight: 180, flex: 1 }} nestedScrollEnabled>
                {months.map((label, index) => (
                  <Pressable
                    key={label}
                    onPress={() => commit(selected.getFullYear(), index, selected.getDate())}
                    style={{
                      paddingVertical: 10,
                      borderRadius: 10,
                      backgroundColor: index === selected.getMonth() ? colors.card : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: index === selected.getMonth() ? colors.accent : colors.text,
                        fontWeight: index === selected.getMonth() ? '700' : '500',
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <ScrollView style={{ maxHeight: 180, flex: 0.8 }} nestedScrollEnabled>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => commit(selected.getFullYear(), selected.getMonth(), day)}
                    style={{
                      paddingVertical: 10,
                      borderRadius: 10,
                      backgroundColor: day === selected.getDate() ? colors.card : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: day === selected.getDate() ? colors.accent : colors.text,
                        fontWeight: day === selected.getDate() ? '700' : '500',
                      }}
                    >
                      {day}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <Button label="Done" onPress={() => setOpen(false)} style={{ marginTop: 12 }} />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

export default function WriteReviewScreen() {
  const { businessId, rating: ratingParam, invite } = useLocalSearchParams<{
    businessId: string
    rating?: string
    invite?: string
  }>()
  const { user, loading: authLoading } = useAuth()

  const [business, setBusiness] = useState<{
    id: string | number
    name?: string
    website?: string
    logo_url?: string
    logoUrl?: string
    slug?: string
  } | null>(null)
  const [existingReviewId, setExistingReviewId] = useState<string | number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showTip, setShowTip] = useState(false)

  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [experienceDate, setExperienceDate] = useState(todayDateValue)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const load = useCallback(async () => {
    if (!businessId) return
    setLoading(true)
    setError(null)
    try {
      const profile = (await customerApi.getBusiness(businessId)) as {
        id: string | number
        name?: string
        website?: string
        logo_url?: string
        logoUrl?: string
        slug?: string
      }
      setBusiness(profile)

      if (user?.role === 'customer') {
        const mine = normalizeReviewsList(await customerApi.getMyReviews())
        const existing = mine.find(
          (item) =>
            String(item.business_id) === String(profile.id) ||
            String(item.businessId) === String(profile.id) ||
            String(item.business_slug) === String(profile.slug) ||
            String(item.business_id) === String(businessId),
        )
        if (existing?.id) {
          setExistingReviewId(existing.id as string | number)
          setRating(Number(existing.rating) || 0)
          setTitle(String(existing.title || ''))
          setContent(stripExtraLines(String(existing.content || existing.body || '')))
          setExperienceDate(parseExperienceDate(String(existing.content || '')) || todayDateValue())
          const mentioned = String(existing.content || '').match(/Mentioned:\s*([^\n]+)/)
          if (mentioned?.[1]) {
            setSelectedTags(
              mentioned[1]
                .split(',')
                .map((item) => item.trim())
                .filter((item) => SUGGESTED_TAGS.includes(item)),
            )
          }
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Business not found')
    } finally {
      setLoading(false)
    }
  }, [businessId, user?.role])

  useEffect(() => {
    const preset = Number(Array.isArray(ratingParam) ? ratingParam[0] : ratingParam || 0)
    if (preset >= 1 && preset <= 5) setRating(preset)
  }, [ratingParam])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(loginHref(businessId))
      return
    }
    load()
  }, [authLoading, user, load, businessId])

  const host = websiteHost(business?.website)
  const logo = business?.logo_url || business?.logoUrl

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]))
  }

  async function onSubmit() {
    if (!business?.id) return
    setError(null)
    setSuccess(null)

    if (!rating) {
      setError('Please select a star rating.')
      return
    }
    if (content.trim().length < 10) {
      setError('Please write a little more about your experience (at least 10 characters).')
      return
    }
    if (!title.trim()) {
      setError('Please give your review a title.')
      return
    }

    setSubmitting(true)
    try {
      const tagLine = selectedTags.length ? `\n\nMentioned: ${selectedTags.join(', ')}` : ''
      const dateLine = experienceDate ? `\n\nDate of experience: ${experienceDate}` : ''
      const payload = {
        rating,
        title: title.trim(),
        content: `${content.trim()}${tagLine}${dateLine}`,
      }

      if (existingReviewId) {
        await customerApi.updateReview(existingReviewId, payload)
        setSuccess(
          'Your review was updated and is being processed again. It may take a few minutes before it goes live.',
        )
      } else {
        await customerApi.createReview({
          businessId: business.id,
          ...payload,
          inviteToken: Array.isArray(invite) ? invite[0] : invite,
        })
        setSuccess(
          'Thanks! Your review was submitted and is being processed. Most reviews go live within a few minutes after automated checks.',
        )
      }

      setTimeout(() => {
        router.replace(`/business/${business.id}`)
      }, 900)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (!authLoading && !user) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Write review' }} />
        <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 24 }}>
          Redirecting to sign in…
        </Text>
      </Screen>
    )
  }

  if (authLoading || (loading && !business)) {
    return (
      <Screen>
        <Stack.Screen options={{ title: existingReviewId ? 'Update review' : 'Write review' }} />
        <ActivityIndicator color={colors.accent} />
        <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 12 }}>
          Loading review form…
        </Text>
      </Screen>
    )
  }

  if (user && user.role !== 'customer') {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Write review' }} />
        <Card>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
            Customer account needed
          </Text>
          <Text style={{ color: colors.muted, lineHeight: 20, marginBottom: 14 }}>
            Only user accounts can write reviews. Please sign in with a user account.
          </Text>
          <Button label="Go to sign in" onPress={() => router.replace(loginHref(businessId))} />
        </Card>
      </Screen>
    )
  }

  if (!business && error) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Write review' }} />
        <Card>
          <Text style={{ color: colors.danger, lineHeight: 20 }}>{error}</Text>
        </Card>
      </Screen>
    )
  }

  return (
    <Screen style={{ paddingBottom: 0 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Stack.Screen options={{ title: existingReviewId ? 'Update review' : 'Write review' }} />
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable onPress={() => business?.id && router.push(`/business/${business.id}`)}>
                <BusinessLogo uri={logo} name={business?.name} size={56} />
              </Pressable>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Pressable onPress={() => business?.id && router.push(`/business/${business.id}`)}>
                  <Text style={{ color: colors.accent, fontSize: 17, fontWeight: '700' }} numberOfLines={2}>
                    {business?.name}
                  </Text>
                </Pressable>
                {host && business?.website ? (
                  <Pressable onPress={() => Linking.openURL(formatExternalUrl(business.website!))}>
                    <Text style={{ color: colors.muted, marginTop: 4, fontSize: 13 }} numberOfLines={1}>
                      {host}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </Card>

          {error ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: 'rgba(248, 113, 113, 0.4)',
                backgroundColor: 'rgba(248, 113, 113, 0.12)',
                borderRadius: 14,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.danger, lineHeight: 20 }}>{error}</Text>
            </View>
          ) : null}
          {success ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: 'rgba(16, 185, 129, 0.4)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                borderRadius: 14,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#A7F3D0', lineHeight: 20 }}>{success}</Text>
            </View>
          ) : null}

          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Pressable
                  key={value}
                  onPress={() => setRating(value)}
                  accessibilityRole="button"
                  accessibilityLabel={`${value} star${value > 1 ? 's' : ''}`}
                  hitSlop={6}
                  style={{ padding: 4 }}
                >
                  <Ionicons
                    name="star"
                    size={40}
                    color={value <= rating ? colors.star : '#334155'}
                  />
                </Pressable>
              ))}
            </View>
            {!rating ? (
              <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 8, fontSize: 13 }}>
                Tap a star to rate your experience
              </Text>
            ) : null}
          </Card>

          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>
                Tell us more about your experience
              </Text>
              <Pressable
                onPress={() => setShowTip((v) => !v)}
                hitSlop={8}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Ionicons name="bulb-outline" size={16} color={colors.accent} />
                <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 13 }}>Want a tip?</Text>
              </Pressable>
            </View>
            {showTip ? (
              <View
                style={{
                  marginTop: 12,
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text style={{ color: '#FCD34D', lineHeight: 20, fontSize: 13 }}>
                  Mention what happened, what went well, and what could improve. Keep it honest and specific.
                </Text>
                <Pressable onPress={() => Linking.openURL(REVIEW_TIPS_URL)} style={{ marginTop: 8 }}>
                  <Text style={{ color: colors.accent, fontWeight: '600' }}>See all 8 tips</Text>
                </Pressable>
              </View>
            ) : null}

            <Field
              placeholder="What did you like or dislike? What is this company doing well, or how can they improve? Remember to be honest, helpful, and constructive!"
              value={content}
              onChangeText={setContent}
              multiline
              autoCapitalize="sentences"
              style={{ minHeight: 140, textAlignVertical: 'top', marginTop: 12 }}
            />

            <Text style={{ color: colors.text, fontWeight: '600', marginTop: 4, marginBottom: 8 }}>
              Other people mention
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTED_TAGS.map((tag) => {
                const selected = selectedTags.includes(tag)
                return (
                  <Pressable
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={{
                      borderWidth: 1,
                      borderColor: selected ? colors.accent : colors.border,
                      backgroundColor: selected ? 'rgba(255, 64, 129, 0.12)' : colors.page,
                      borderRadius: 999,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{ color: selected ? colors.accent : colors.text, fontSize: 13, fontWeight: '600' }}>
                      {tag}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            <Pressable onPress={() => Linking.openURL(REVIEW_TIPS_URL)} style={{ marginTop: 14 }}>
              <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 13 }}>
                Read our tips for writing great reviews
              </Text>
            </Pressable>

            <View
              style={{
                marginTop: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.page,
                borderRadius: 14,
                padding: 12,
                flexDirection: 'row',
                gap: 10,
              }}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} style={{ marginTop: 2 }} />
              <Text style={{ color: colors.muted, flex: 1, lineHeight: 20, fontSize: 13 }}>
                {SCREENING_COPY} Learn more in our{' '}
                <Text style={{ color: colors.accent, fontWeight: '600' }} onPress={() => Linking.openURL(TRUST_CENTRE_URL)}>
                  Trust Centre
                </Text>
                .
              </Text>
            </View>
          </Card>

          <Card>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
              Give your review a title
            </Text>
            <Field
              placeholder="What's important for people to know?"
              value={title}
              onChangeText={setTitle}
              autoCapitalize="sentences"
              maxLength={120}
            />
          </Card>

          <Card>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
              Date of experience
            </Text>
            <DateWheel value={experienceDate} onChange={setExperienceDate} />
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>
              Defaults to today. You can change it if needed.
            </Text>
          </Card>

          <Card>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Ionicons name="shield-outline" size={18} color={colors.accent} style={{ marginTop: 2 }} />
              <Text style={{ color: colors.muted, flex: 1, lineHeight: 20, fontSize: 13 }}>
                Check A Review doesn't allow companies to offer payments or benefits in exchange for leaving a
                review.
              </Text>
            </View>
          </Card>

          <Button
            label={
              submitting
                ? existingReviewId
                  ? 'Updating…'
                  : 'Submitting…'
                : existingReviewId
                  ? 'Update review'
                  : 'Submit review'
            }
            onPress={onSubmit}
            loading={submitting}
            disabled={!!success}
          />
          <Button
            label="Cancel"
            variant="ghost"
            onPress={() => (business?.id ? router.replace(`/business/${business.id}`) : router.back())}
            disabled={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
