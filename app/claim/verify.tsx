import { useCallback, useEffect, useState } from 'react'
import { Text } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { customerApi, ApiError } from '../../src/services/api'
import { Button, ErrorText, Field, Screen, Subtitle, Title } from '../../src/components/ui'
import { colors } from '../../src/constants'

/** Extract claim verify code/token from a pasted email link or raw value. */
export function extractClaimVerifyToken(raw: string): string {
  const value = String(raw || '').trim()
  if (!value) return ''
  try {
    if (value.includes('://') || value.startsWith('/')) {
      const url = value.includes('://')
        ? new URL(value)
        : new URL(value, 'https://checkareview.com')
      const fromQuery = url.searchParams.get('token') || url.searchParams.get('code')
      if (fromQuery) return fromQuery.trim()
    }
  } catch {
    /* fall through — treat as raw token/code */
  }
  const match = value.match(/[?&](?:token|code)=([^&\s#]+)/i)
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1]).trim()
    } catch {
      return match[1].trim()
    }
  }
  // Prefer digits-only when user typed a 6-digit code with spaces
  const digits = value.replace(/\s+/g, '')
  if (/^\d{6}$/.test(digits)) return digits
  return value
}

export default function ClaimVerifyScreen() {
  const params = useLocalSearchParams<{
    token?: string | string[]
    code?: string | string[]
    email?: string | string[]
    businessId?: string | string[]
  }>()
  const paramToken = Array.isArray(params.token)
    ? params.token[0]
    : params.token || (Array.isArray(params.code) ? params.code[0] : params.code)
  const paramEmail = Array.isArray(params.email) ? params.email[0] : params.email
  const paramBusinessId = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId

  const [email, setEmail] = useState(String(paramEmail || ''))
  const [input, setInput] = useState(String(paramToken || ''))
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    paramToken ? 'loading' : 'idle',
  )
  const [message, setMessage] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [info, setInfo] = useState(
    paramEmail
      ? 'We sent a 6-digit code to your email. Enter it below to verify your claim.'
      : 'Enter the 6-digit code from your claim verification email.',
  )

  const verify = useCallback(async (rawToken: string) => {
    const token = extractClaimVerifyToken(rawToken)
    if (!token) {
      setStatus('error')
      setError('Enter the 6-digit code from your email.')
      return
    }
    setStatus('loading')
    setError(null)
    setMessage('')
    try {
      const data = await customerApi.verifyBusinessClaimEmail(token)
      setBusinessName(String(data.businessName || ''))
      setStatus('success')
      setMessage(
        data.alreadyVerified
          ? 'Your email was already verified. Our team can continue reviewing your claim.'
          : 'Email verified. Your claim is now under review.',
      )
    } catch (err) {
      setStatus('error')
      setError(err instanceof ApiError ? err.message : 'Verification failed')
    }
  }, [])

  useEffect(() => {
    if (paramToken) {
      void verify(String(paramToken))
    }
  }, [paramToken, verify])

  async function resend() {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter the email you used on the claim form to resend the code.')
      setStatus('error')
      return
    }
    setResending(true)
    setError(null)
    try {
      const data = await customerApi.resendClaimVerification(trimmed, paramBusinessId)
      setInfo(data.message || 'A new 6-digit code has been sent to your email.')
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setError(err instanceof ApiError ? err.message : 'Could not resend code')
    } finally {
      setResending(false)
    }
  }

  return (
    <Screen>
      {status === 'loading' ? (
        <>
          <Title>Verifying email</Title>
          <Subtitle>Please wait while we confirm your claim email…</Subtitle>
        </>
      ) : null}

      {status === 'success' ? (
        <>
          <Text style={{ color: '#6EE7B7', fontWeight: '700', fontSize: 12, marginBottom: 8 }}>
            EMAIL VERIFIED
          </Text>
          <Title>You're verified</Title>
          <Subtitle>
            {message}
            {businessName ? ` Claim for ${businessName}.` : ''}
          </Subtitle>
          <Button
            label="Back to home"
            onPress={() => router.replace('/(customer)')}
            style={{ marginTop: 8 }}
          />
        </>
      ) : null}

      {status === 'error' || status === 'idle' ? (
        <>
          <Title>Verify claim email</Title>
          <Subtitle>{info}</Subtitle>
          <ErrorText>{error}</ErrorText>
          {!paramEmail ? (
            <>
              <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 6, fontSize: 14 }}>
                Email used on claim
              </Text>
              <Field
                value={email}
                onChangeText={setEmail}
                placeholder="you@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </>
          ) : null}
          <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 6, fontSize: 14 }}>
            6-digit code
          </Text>
          <Field
            value={input}
            onChangeText={setInput}
            placeholder="123456"
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={64}
          />
          <Button
            label={status === 'loading' ? 'Verifying…' : 'Verify email'}
            onPress={() => verify(input)}
            loading={status === 'loading'}
            disabled={!input.trim()}
          />
          <Button
            label={resending ? 'Sending…' : 'Resend code'}
            variant="ghost"
            onPress={resend}
            loading={resending}
            disabled={resending}
          />
          <Text style={{ color: colors.muted, marginTop: 16, fontSize: 13, lineHeight: 20 }}>
            You can also paste the full verification link from the email if you prefer.
          </Text>
        </>
      ) : null}
    </Screen>
  )
}
