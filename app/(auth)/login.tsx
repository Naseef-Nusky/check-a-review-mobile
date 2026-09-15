import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native'
import { Link, router, useLocalSearchParams } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { ApiError } from '../../src/services/api'
import {
  BrandLogo,
  Button,
  ErrorText,
  Field,
  PasswordField,
  Screen,
  Subtitle,
  Title,
} from '../../src/components/ui'
import { colors } from '../../src/constants'
import { AppleSignInButton, AuthOrDivider } from '../../src/components/AppleSignInButton'
import { SupportContactLine } from '../../src/components/SupportContact'
import { LegalAgreeLine } from '../../src/components/LegalLinks'

function safePostLoginPath(redirect: unknown, role: 'customer' | 'business') {
  const path = String(Array.isArray(redirect) ? redirect[0] : redirect || '')
  if (role === 'customer' && path.startsWith('/write-review/')) return path
  return role === 'business' ? '/(business)' : '/(customer)'
}

export default function LoginScreen() {
  const { login } = useAuth()
  const { redirect } = useLocalSearchParams<{ redirect?: string }>()
  const { height: windowHeight } = useWindowDimensions()
  const [role, setRole] = useState<'customer' | 'business'>('customer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const compact = windowHeight < 720

  function goAfterLogin(nextRole: 'customer' | 'business') {
    router.replace(safePostLoginPath(redirect, nextRole))
  }

  async function onSubmit() {
    setError(null)
    setLoading(true)
    try {
      const user = await login(email.trim(), password, role)
      goAfterLogin(user.role)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'EMAIL_NOT_VERIFIED') {
        router.push({
          pathname: '/(auth)/verify-email',
          params: { email: email.trim(), role },
        })
        return
      }
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setLoading(false)
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
            <Title centered>{role === 'business' ? 'Business sign in' : 'Sign in'}</Title>
            <Subtitle centered>
              {role === 'business'
                ? 'Access your company dashboard, reviews, and profile.'
                : 'Use the same account as your web app.'}
            </Subtitle>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {(['customer', 'business'] as const).map((item) => (
                <View key={item} style={{ flex: 1, minWidth: 0 }}>
                  <Button
                    label={item === 'customer' ? 'Customer' : 'Business'}
                    variant={role === item ? 'primary' : 'ghost'}
                    onPress={() => setRole(item)}
                  />
                </View>
              ))}
            </View>

            {role === 'customer' ? (
              <>
                <AppleSignInButton
                  disabled={loading}
                  onError={setError}
                  onSuccess={() => goAfterLogin('customer')}
                />
                <AuthOrDivider />
              </>
            ) : null}

            <Field
              placeholder="Email"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
            />
            <PasswordField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
            />
            <ErrorText>{error}</ErrorText>
            <Button label="Sign in" onPress={onSubmit} loading={loading} />

            <Link
              href="/(auth)/register"
              style={{
                marginTop: 20,
                marginBottom: 8,
                textAlign: 'center',
                color: colors.accent,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              Create a customer account
            </Link>
            <Link
              href="/(auth)/business-setup"
              style={{
                marginTop: 8,
                marginBottom: 8,
                textAlign: 'center',
                color: colors.accent,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              Register your business
            </Link>
            <LegalAgreeLine />
            <SupportContactLine />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
