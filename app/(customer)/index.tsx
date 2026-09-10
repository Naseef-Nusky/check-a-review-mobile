import { useCallback, useState } from 'react'
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { customerApi, ApiError, type BusinessSearchItem } from '../../src/services/api'
import { Button, Card, ErrorText, Field, Screen, Stars, Subtitle } from '../../src/components/ui'
import { BusinessLogo } from '../../src/components/BusinessLogo'
import { colors } from '../../src/constants'

const PAGE_SIZE = 100 // API max per request
const FILL_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'

function extractBusinesses(data: unknown): { items: BusinessSearchItem[]; total: number } {
  if (Array.isArray(data)) {
    return { items: data as BusinessSearchItem[], total: data.length }
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    const list =
      (Array.isArray(obj.businesses) && (obj.businesses as BusinessSearchItem[])) ||
      (Array.isArray(obj.items) && (obj.items as BusinessSearchItem[])) ||
      (Array.isArray(obj.data) && (obj.data as BusinessSearchItem[])) ||
      []
    const total = typeof obj.total === 'number' ? obj.total : list.length
    return { items: list, total }
  }
  return { items: [], total: 0 }
}

async function fetchPages(params: { q?: string; category?: string }) {
  const all: BusinessSearchItem[] = []
  const seen = new Set<string>()
  let page = 1
  let total = Number.POSITIVE_INFINITY

  while (all.length < total && page <= 200) {
    const data = await customerApi.searchBusinesses({
      q: params.q,
      page,
      limit: PAGE_SIZE,
    })
    const parsed = extractBusinesses(data)
    total = parsed.total
    if (!parsed.items.length) break

    let added = 0
    for (const item of parsed.items) {
      const id = String(item.id)
      if (!seen.has(id)) {
        seen.add(id)
        all.push(item)
        added += 1
      }
    }

    if (all.length >= total || added === 0 || parsed.items.length < PAGE_SIZE) break
    page += 1
  }

  return { items: all, total: Number.isFinite(total) ? total : all.length }
}

async function fetchAllBusinesses(query: string) {
  const q = query.trim() || undefined
  const primary = await fetchPages({ q })
  const byId = new Map(primary.items.map((item) => [String(item.id), item]))

  // OFFSET pages can skip rows when many businesses share the same rating.
  // If a plain browse/search comes up short, fill gaps with letter scans and merge.
  if (!q && byId.size < primary.total) {
    for (const ch of FILL_CHARS) {
      if (byId.size >= primary.total) break
      const extra = await fetchPages({ q: ch })
      for (const item of extra.items) {
        byId.set(String(item.id), item)
      }
    }
  }

  const items = Array.from(byId.values()).sort((a, b) => {
    const ratingDiff =
      Number(b.average_rating ?? b.averageRating ?? 0) - Number(a.average_rating ?? a.averageRating ?? 0)
    if (ratingDiff !== 0) return ratingDiff
    const reviewDiff =
      Number(b.review_count ?? b.reviewCount ?? 0) - Number(a.review_count ?? a.reviewCount ?? 0)
    if (reviewDiff !== 0) return reviewDiff
    return String(a.name || '').localeCompare(String(b.name || ''))
  })
  return { items, total: items.length }
}

export default function CustomerHomeScreen() {
  const { width, height } = useWindowDimensions()
  const compact = height < 720 || width < 380
  const [q, setQ] = useState('')
  const [items, setItems] = useState<BusinessSearchItem[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (query = q) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAllBusinesses(query)
      setItems(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Search failed')
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [q])

  useFocusEffect(
    useCallback(() => {
      setQ('')
      search('')
    }, []),
  )

  return (
    <Screen style={{ paddingBottom: 0 }}>
      <View style={{ flexShrink: 0 }}>
        <View style={{ marginBottom: 10, paddingVertical: 2, justifyContent: 'center' }}>
          <Text
            style={{
              color: colors.text,
              fontSize: compact ? 24 : 28,
              fontWeight: '700',
            }}
            maxFontSizeMultiplier={1.2}
          >
            Find a business
          </Text>
        </View>
        <Subtitle>Search trusted reviews on Check A Review.</Subtitle>
        <Field
          placeholder="Search by name or keyword"
          value={q}
          onChangeText={setQ}
          onSubmitEditing={() => search()}
          returnKeyType="search"
        />
        <Button label="Search" onPress={() => search()} loading={loading} />
        <ErrorText>{error}</ErrorText>
        {!loading && total > 0 ? (
          <Text style={{ color: colors.muted, marginTop: 10, fontSize: 13 }}>
            {items.length} business{items.length === 1 ? '' : 'es'}
            {q.trim() ? ` matching “${q.trim()}”` : ''}
          </Text>
        ) : null}
      </View>

      <FlatList
        style={{ flex: 1, marginTop: 8 }}
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => search(q)} />}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={20}
        maxToRenderPerBatch={24}
        windowSize={11}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 24 }}>
              No businesses found
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const rating = item.averageRating ?? item.average_rating ?? 0
          const count = item.reviewCount ?? item.review_count ?? 0
          const logo = item.logo_url || item.logoUrl || item.logo
          return (
            <Pressable onPress={() => router.push(`/business/${item.slug || item.id}`)}>
              <Card>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <BusinessLogo uri={logo} name={item.name} size={compact ? 46 : 52} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{
                        fontSize: compact ? 16 : 17,
                        fontWeight: '700',
                        color: colors.text,
                      }}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    <Text style={{ color: colors.muted, marginTop: 4 }} numberOfLines={2}>
                      {[item.category, item.city].filter(Boolean).join(' · ') || 'Business'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <Stars rating={Number(rating)} />
                      <Text style={{ color: colors.muted }}>{count} reviews</Text>
                    </View>
                  </View>
                </View>
              </Card>
            </Pressable>
          )
        }}
      />
    </Screen>
  )
}
