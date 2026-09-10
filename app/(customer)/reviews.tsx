import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { customerApi, ApiError } from '../../src/services/api'
import { ErrorText, Screen, Subtitle } from '../../src/components/ui'
import { ReviewCard } from '../../src/components/ReviewCard'
import { colors } from '../../src/constants'
import { normalizeReviewsList, type ReviewLike } from '../../src/utils/reviewDisplay'

export default function MyReviewsScreen() {
  const [items, setItems] = useState<ReviewLike[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await customerApi.getMyReviews()
      setItems(normalizeReviewsList(data))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load reviews')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  return (
    <Screen style={{ paddingBottom: 0 }}>
      <FlatList
        style={{ flex: 1 }}
        data={items}
        keyExtractor={(item, index) => String(item.id || index)}
        ListHeaderComponent={
          <View style={{ marginBottom: 8 }}>
            <Subtitle>Reviews you have submitted.</Subtitle>
            <ErrorText>{error}</ErrorText>
          </View>
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 24 }}>No reviews yet</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <ReviewCard
            review={{
              ...item,
              author_name: 'You',
              authorName: 'You',
            }}
            businessName={String(item.business_name || item.businessName || 'Business')}
            businessLogo={String(item.business_logo || item.businessLogo || '')}
            showActions={false}
          />
        )}
      />
    </Screen>
  )
}
