import { useCallback, useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { router, useLocalSearchParams } from 'expo-router'
import { customerApi, ApiError } from '../../src/services/api'
import {
  Button,
  ErrorText,
  Field,
  PasswordField,
  Screen,
  Subtitle,
  Title,
} from '../../src/components/ui'
import { colors } from '../../src/constants'

type ClaimFile = {
  uri: string
  name: string
  type: string
  size?: number | null
}

const MAX_FILES = 5
const MAX_FILE_BYTES = 8 * 1024 * 1024
const ALLOWED = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
])

function Label({ children }: { children: string }) {
  return (
    <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 6, fontSize: 14 }}>
      {children}
    </Text>
  )
}

export default function ClaimBusinessScreen() {
  const { businessId } = useLocalSearchParams<{ businessId: string }>()
  const [businessName, setBusinessName] = useState('this business')
  const [alreadyClaimed, setAlreadyClaimed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<ClaimFile[]>([])
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobTitle: '',
    relationship: '',
    verificationInfo: '',
    password: '',
    confirmPassword: '',
  })

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const load = useCallback(async () => {
    if (!businessId) return
    setLoading(true)
    setError(null)
    try {
      const biz = (await customerApi.getBusiness(businessId)) as {
        id?: string | number
        name?: string
        claimed?: boolean
      }
      setBusinessName(biz.name || 'this business')
      if (biz.claimed) {
        setAlreadyClaimed(true)
        setError('This business profile has already been claimed.')
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Business not found')
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    load()
  }, [load])

  async function pickFiles() {
    setError(null)
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
        multiple: true,
        copyToCacheDirectory: true,
      })
      if (result.canceled) return

      const next: ClaimFile[] = []
      for (const asset of result.assets || []) {
        const type = String(asset.mimeType || '').toLowerCase() || 'application/octet-stream'
        const size = asset.size ?? null
        if (!ALLOWED.has(type) && !type.includes('pdf') && !type.startsWith('image/')) {
          setError('Only PNG, JPG, WEBP, or PDF files are allowed.')
          continue
        }
        if (size != null && size > MAX_FILE_BYTES) {
          setError('Each file must be 8MB or smaller.')
          continue
        }
        next.push({
          uri: asset.uri,
          name: asset.name || `attachment-${next.length + 1}`,
          type: type === 'image/jpg' ? 'image/jpeg' : type,
          size,
        })
      }

      setFiles((prev) => [...prev, ...next].slice(0, MAX_FILES))
    } catch {
      setError('Could not open file picker')
    }
  }

  async function onSubmit() {
    if (alreadyClaimed || !businessId) return
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.trim().length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.jobTitle.trim() ||
      !form.relationship.trim() ||
      !form.verificationInfo.trim()
    ) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await customerApi.submitBusinessClaim(
        businessId,
        {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          jobTitle: form.jobTitle.trim(),
          relationship: form.relationship.trim(),
          verificationInfo: form.verificationInfo.trim(),
          password: form.password,
        },
        files,
      )
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit claim')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Screen>
        <Subtitle>Loading…</Subtitle>
      </Screen>
    )
  }

  if (submitted) {
    return (
      <Screen>
        <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12, marginBottom: 8 }}>
          CLAIM REQUEST CREATED
        </Text>
        <Title>Check your email</Title>
        <Subtitle>
          Your claim for {businessName} is pending. We sent a verification link to your email.
          After you verify, our team will review your request.
        </Subtitle>
        <Text style={{ color: colors.muted, marginBottom: 20, fontSize: 13 }}>
          Status: Pending · Email: Unverified until you click the link
        </Text>
        <Button label="Back to profile" onPress={() => router.back()} />
      </Screen>
    )
  }

  return (
    <Screen style={{ paddingBottom: 0 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12, marginBottom: 8 }}>
            CLAIM THIS BUSINESS
          </Text>
          <Title>{businessName}</Title>
          <Subtitle>
            Tell us who you are and how you are connected to this business. After you submit,
            verify your email so we can review your claim.
          </Subtitle>

          <ErrorText>{error}</ErrorText>

          {!alreadyClaimed ? (
            <View style={{ gap: 4 }}>
              <Label>Full name</Label>
              <Field
                value={form.fullName}
                onChangeText={(v) => update('fullName', v)}
                placeholder="Your full name"
                autoCapitalize="words"
              />

              <Label>Email</Label>
              <Field
                value={form.email}
                onChangeText={(v) => update('email', v)}
                placeholder="you@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Label>Phone number</Label>
              <Field
                value={form.phone}
                onChangeText={(v) => update('phone', v)}
                placeholder="+1 555 000 0000"
                keyboardType="phone-pad"
              />

              <Label>Job title / position</Label>
              <Field
                value={form.jobTitle}
                onChangeText={(v) => update('jobTitle', v)}
                placeholder="Owner, Manager…"
                autoCapitalize="words"
              />

              <Label>Relationship with the business</Label>
              <Field
                value={form.relationship}
                onChangeText={(v) => update('relationship', v)}
                placeholder="e.g. Owner, Manager, Marketing lead"
                autoCapitalize="sentences"
              />

              <Label>Verification information</Label>
              <Field
                value={form.verificationInfo}
                onChangeText={(v) => update('verificationInfo', v)}
                placeholder="How you can prove your connection…"
                multiline
                style={{ minHeight: 110, textAlignVertical: 'top', paddingTop: 12 }}
              />

              <Label>Supporting attachments (optional)</Label>
              <Button
                label={files.length ? `Add more files (${files.length}/${MAX_FILES})` : 'Upload files'}
                variant="ghost"
                onPress={pickFiles}
                disabled={files.length >= MAX_FILES}
              />
              <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8, lineHeight: 18 }}>
                Up to 5 files (PNG, JPG, WEBP, or PDF). Max 8MB each.
              </Text>
              {files.map((file) => (
                <View
                  key={`${file.uri}-${file.name}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                    gap: 8,
                  }}
                >
                  <Text style={{ color: colors.text, flex: 1, fontSize: 13 }} numberOfLines={1}>
                    • {file.name}
                  </Text>
                  <Pressable
                    onPress={() => setFiles((prev) => prev.filter((f) => f.uri !== file.uri))}
                    hitSlop={8}
                  >
                    <Text style={{ color: colors.danger, fontWeight: '600', fontSize: 13 }}>Remove</Text>
                  </Pressable>
                </View>
              ))}

              <Label>Create dashboard password</Label>
              <PasswordField
                value={form.password}
                onChangeText={(v) => update('password', v)}
                placeholder="Min. 8 characters"
              />

              <Label>Confirm password</Label>
              <PasswordField
                value={form.confirmPassword}
                onChangeText={(v) => update('confirmPassword', v)}
                placeholder="Confirm password"
              />

              <View style={{ marginTop: 12 }}>
                <Button
                  label={submitting ? 'Submitting…' : 'Submit claim request'}
                  onPress={onSubmit}
                  loading={submitting}
                />
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
