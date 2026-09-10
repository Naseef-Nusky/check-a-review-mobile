import { useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { customerApi, ApiError } from '../../src/services/api'
import { Button, ErrorText, Field, Screen, Subtitle, Title } from '../../src/components/ui'
import { colors } from '../../src/constants'

export default function WriteReviewScreen() {
  const { businessId } = useLocalSearchParams<{ businessId: string }>()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    if (!businessId) return
    if (!content.trim()) {
      setError('Please write your review')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await customerApi.createReview({
        businessId,
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
      })
      Alert.alert('Thanks!', 'Your review was submitted.', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <Title>Write a review</Title>
      <Subtitle>Share your experience with this business.</Subtitle>

      <Text style={{ marginBottom: 8, fontWeight: '600', color: colors.text }}>Rating</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} onPress={() => setRating(value)}>
            <Text style={{ fontSize: 28, color: value <= rating ? colors.star : colors.border }}>★</Text>
          </Pressable>
        ))}
      </View>

      <Field placeholder="Title (optional)" value={title} onChangeText={setTitle} autoCapitalize="sentences" />
      <Field
        placeholder="Your review"
        value={content}
        onChangeText={setContent}
        multiline
        style={{ minHeight: 120, textAlignVertical: 'top' }}
        autoCapitalize="sentences"
      />
      <ErrorText>{error}</ErrorText>
      <Button label="Submit review" onPress={onSubmit} loading={loading} />
    </Screen>
  )
}
