import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native'
import { Link, router } from 'expo-router'
import { authApi, ApiError } from '../../src/services/api'
import { useAuth } from '../../src/context/AuthContext'
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
import type { StoredUser } from '../../src/storage/authStorage'

export default function RegisterScreen() {
  const { setSession } = useAuth()
  const { height: windowHeight } = useWindowDimensions()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const compact = windowHeight < 720

  async function onSubmit() {
    setError(null)
    setLoading(true)
    try {
      const result = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'customer',
      })

      if (result.requiresEmailVerification) {
        router.push({
          pathname: '/(auth)/verify-email',
          params: { email: email.trim(), role: 'customer' },
        })
        return
      }

      if (result.token && result.user) {
        const user = {
          ...(result.user as object),
          id: (result.user as { id: string | number }).id,
          email: String((result.user as { email?: string }).email || email.trim()),
          name: String((result.user as { name?: string }).name || name.trim() || 'User'),
          role: 'customer' as const,
        } as StoredUser
        await setSession(user, result.token)
        router.replace('/(customer)')
        return
      }

      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: email.trim(), role: 'customer' },
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed')
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

            <Title centered>Create account</Title>
            <Subtitle centered>Create a customer account to write and track reviews.</Subtitle>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Button label="Customer" variant="primary" onPress={() => {}} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Button
                  label="Business"
                  variant="ghost"
                  onPress={() => router.push('/(auth)/business-setup')}
                />
              </View>
            </View>

            <AppleSignInButton
              disabled={loading}
              onError={setError}
              onSuccess={() => router.replace('/(customer)')}
            />
            <AuthOrDivider />

            <Field
              placeholder="Full name"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              value={name}
              onChangeText={setName}
            />
            <Field
              placeholder="Email"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
            />
            <PasswordField
              placeholder="Password (min 8 characters)"
              value={password}
              onChangeText={setPassword}
            />
            <ErrorText>{error}</ErrorText>
            <Button label="Register" onPress={onSubmit} loading={loading} />

            <Button
              label="Register your business instead"
              variant="ghost"
              onPress={() => router.push('/(auth)/business-setup')}
              style={{ marginTop: 8 }}
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
              Already have an account? Sign in
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
