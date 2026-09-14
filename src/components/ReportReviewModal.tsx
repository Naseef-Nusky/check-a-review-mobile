import { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { customerApi, ApiError } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { colors } from '../constants'
import { Button, ErrorText, Field } from './ui'

export const REPORT_REASONS = [
  'Fake or misleading review',
  'Inappropriate or offensive content',
  'Spam or advertising',
  'Conflicts of interest (competitor or owner)',
  'Contains personal or private information',
  'Other',
] as const

type Props = {
  reviewId: string | number
  visible: boolean
  onClose: () => void
}

export function ReportReviewModal({ reviewId, visible, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) return
    setReason('')
    setDetails('')
    setReporterName(String(user?.name || ''))
    setReporterEmail(String(user?.email || ''))
    setSubmitting(false)
    setSubmitted(false)
    setError(null)
  }, [visible, user?.name, user?.email])

  async function onSubmit() {
    if (!reason) {
      setError('Please select a reason')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await customerApi.reportReview(reviewId, {
        reason,
        details: details.trim(),
        reporterName: reporterName.trim(),
        reporterEmail: reporterEmail.trim(),
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
          <View
            style={{
              backgroundColor: colors.page,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '88%',
              paddingBottom: Math.max(16, insets.bottom + 8),
            }}
          >
            <View
              style={{
                width: 42,
                height: 4,
                borderRadius: 999,
                backgroundColor: colors.border,
                alignSelf: 'center',
                marginTop: 10,
                marginBottom: 4,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingTop: 10,
                paddingBottom: 8,
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>
                  Report this review
                </Text>
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4, lineHeight: 18 }}>
                  Help us keep reviews authentic and trustworthy.
                </Text>
              </View>
              <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
                <Ionicons name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>

            {submitted ? (
              <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
                <View
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.14)',
                    borderRadius: 14,
                    padding: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#A7F3D0', fontSize: 16, fontWeight: '700' }}>
                    Report submitted
                  </Text>
                  <Text
                    style={{
                      color: '#6EE7B7',
                      fontSize: 14,
                      textAlign: 'center',
                      marginTop: 6,
                      lineHeight: 20,
                    }}
                  >
                    Thank you. Our team will review your report.
                  </Text>
                </View>
                <Button label="Close" onPress={onClose} style={{ marginTop: 16 }} />
              </View>
            ) : (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
              >
                <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
                  Reason *
                </Text>
                <View style={{ marginBottom: 12, gap: 8 }}>
                  {REPORT_REASONS.map((item) => {
                    const selected = reason === item
                    return (
                      <Pressable
                        key={item}
                        onPress={() => setReason(item)}
                        style={{
                          borderWidth: 1,
                          borderColor: selected ? colors.accent : colors.border,
                          backgroundColor: selected ? 'rgba(255, 64, 129, 0.12)' : colors.card,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                        }}
                      >
                        <Text
                          style={{
                            color: selected ? colors.accent : colors.text,
                            fontSize: 14,
                            fontWeight: selected ? '600' : '500',
                          }}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>
                <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
                  Additional details (optional)
                </Text>
                <Field
                  placeholder="Describe the issue…"
                  value={details}
                  onChangeText={setDetails}
                  multiline
                  maxLength={500}
                  style={{ minHeight: 88, textAlignVertical: 'top', marginBottom: 12 }}
                />
                <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
                  Your name (optional)
                </Text>
                <Field
                  placeholder="Jane Smith"
                  autoCapitalize="words"
                  value={reporterName}
                  onChangeText={setReporterName}
                />
                <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
                  Your email (optional)
                </Text>
                <Field
                  placeholder="jane@example.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  value={reporterEmail}
                  onChangeText={setReporterEmail}
                />
                <ErrorText>{error}</ErrorText>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <View style={{ flex: 1 }}>
                    <Button label="Cancel" variant="ghost" onPress={onClose} disabled={submitting} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      label={submitting ? 'Submitting…' : 'Submit report'}
                      variant="danger"
                      onPress={onSubmit}
                      loading={submitting}
                    />
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
