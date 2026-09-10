import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { Link, router, useLocalSearchParams } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { authApi, businessApi, ApiError } from '../../src/services/api'
import { BrandLogo, Button, ErrorText, Field, Screen, Subtitle, Title } from '../../src/components/ui'
import { colors } from '../../src/constants'
import { takePendingBusinessLogo } from '../../src/storage/pendingLogo'
import type { StoredUser } from '../../src/storage/authStorage'

export default function VerifyEmailScreen() {
  const { setSession } = useAuth()
  const { height: windowHeight } = useWindowDimensions()
  const params = useLocalSearchParams<{ email?: string; role?: string }>()
  const role = (params.role === 'business' ? 'business' : 'customer') as 'customer' | 'business'
  const compact = windowHeight < 720

  const [email, setEmail] = useState(String(params.email || ''))
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState(
    params.email
      ? 'We sent a 6-digit code to your email. Enter it below to activate your account.'
      : 'Enter your email and the 6-digit code from your inbox.',
  )
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  async function uploadPendingLogoIfAny() {
    if (role !== 'business') return
    const pending = await takePendingBusinessLogo()
    if (!pending) return
    try {
      const profile = (await businessApi.getMyProfile()) as { id?: string | number }
      if (profile?.id) {
        await businessApi.uploadLogo(profile.id, pending)
      }
    } catch {
      // User can upload later from company profile
    }
  }

  async function onVerify() {
    setError(null)
    if (!email.trim()) {
      setError('Enter your email address')
      return
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the 6-digit code from your email')
      return
    }
    setLoading(true)
    try {
      const result = await authApi.verifyEmail(email.trim(), code.trim(), role)
      const user = {
        ...(result.user as object),
        id: (result.user as { id: string | number }).id,
        email: String((result.user as { email?: string }).email || email.trim()),
        name: String((result.user as { name?: string }).name || 'User'),
        role: ((result.user as { role?: string }).role as StoredUser['role']) || role,
      } as StoredUser
      await setSession(user, result.token)
      await uploadPendingLogoIfAny()
      router.replace(user.role === 'business' ? '/(business)' : '/(customer)')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  async function onResend() {
    setError(null)
    setInfo('')
    if (!email.trim()) {
      setError('Enter your email address first')
      return
    }
    setResending(true)
    try {
      const result = await authApi.resendVerification(email.trim(), role)
      setInfo(result.message || 'A new code has been sent to your email.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend code')
    } finally {
      setResending(false)
    }
  }

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: compact ? 'flex-start' : 'center',
            paddingTop: compact ? 8 : 24,
            paddingBottom: 32,
          }}
        >
          <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: compact ? 12 : 20 }}>
              <BrandLogo height={compact ? 40 : 48} />
            </View>
            <Title centered>Verify your email</Title>
            <Subtitle centered>Codes expire after 15 minutes. Check spam if you don’t see it.</Subtitle>

            {info ? (
              <Text
                style={{
                  color: '#6EE7B7',
                  marginBottom: 12,
                  lineHeight: 20,
                  textAlign: 'center',
                }}
              >
                {info}
              </Text>
            ) : null}

            <Field
              placeholder="Email"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
            />
            <Field
              placeholder="6-digit code"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
              style={{ letterSpacing: 8, textAlign: 'center', fontWeight: '700', fontSize: 20 }}
            />
            <ErrorText>{error}</ErrorText>
            <Button
              label="Verify email"
              onPress={onVerify}
              loading={loading}
              disabled={code.length !== 6}
            />
            <Button
              label={resending ? 'Sending…' : 'Resend code'}
              variant="ghost"
              onPress={onResend}
              loading={resending}
            />
            <Link
              href="/(auth)/login"
              style={{
                marginTop: 20,
                marginBottom: 8,
                textAlign: 'center',
                color: colors.accent,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              Back to sign in
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
