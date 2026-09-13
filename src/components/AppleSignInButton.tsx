import { useState } from 'react'
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import * as AppleAuthentication from 'expo-apple-authentication'
import { authApi, ApiError } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { StoredUser } from '../storage/authStorage'

function formatAppleName(fullName?: AppleAuthentication.AppleAuthenticationFullName | null) {
  if (!fullName) return ''
  return [fullName.givenName, fullName.familyName].filter(Boolean).join(' ').trim()
}

function appleUnavailableMessage() {
  const isExpoGo =
    Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient

  if (isExpoGo) {
    return 'Sign in with Apple cannot run in Expo Go on the iOS Simulator. Open the app on a real iPhone with Expo Go, or create a development build (npx expo run:ios).'
  }
  return 'Sign in with Apple is not available in this app build. Use an iOS development build with the Sign in with Apple capability enabled.'
}

export function AppleSignInButton({
  disabled,
  onError,
  onSuccess,
}: {
  disabled?: boolean
  onError: (message: string) => void
  onSuccess: (user: StoredUser) => void
}) {
  const { setSession } = useAuth()
  const [loading, setLoading] = useState(false)

  if (Platform.OS !== 'ios') return null

  async function onPress() {
    if (loading || disabled) return
    setLoading(true)
    try {
      const available = await AppleAuthentication.isAvailableAsync().catch(() => false)
      if (!available) {
        onError(appleUnavailableMessage())
        return
      }
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
      if (!credential.identityToken) {
        onError('Apple did not return a sign-in token. Try again.')
        return
      }
      const result = await authApi.loginWithApple({
        identityToken: credential.identityToken,
        email: credential.email,
        fullName: formatAppleName(credential.fullName),
      })
      const user = {
        ...(result.user as object),
        id: (result.user as { id: string | number }).id,
        email: String((result.user as { email?: string }).email || credential.email || ''),
        name: String(
          (result.user as { name?: string }).name || formatAppleName(credential.fullName) || 'User',
        ),
        role: 'customer' as const,
      } as StoredUser
      await setSession(user, result.token)
      onSuccess(user)
    } catch (err) {
      const code =
        typeof err === 'object' && err && 'code' in err ? String((err as { code?: string }).code) : ''
      if (code === 'ERR_REQUEST_CANCELED') return
      if (code === 'ERR_UNAVAILABLE') {
        onError(appleUnavailableMessage())
        return
      }
      onError(err instanceof ApiError ? err.message : 'Apple sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel="Sign in with Apple"
      style={({ pressed }) => ({
        width: '100%',
        height: 48,
        marginTop: 4,
        marginBottom: 4,
        borderRadius: 999,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: disabled || loading ? 0.6 : pressed ? 0.88 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color="#000000" />
      ) : (
        <>
          <Ionicons name="logo-apple" size={20} color="#000000" />
          <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>Sign in with Apple</Text>
        </>
      )}
    </Pressable>
  )
}

export function AuthOrDivider() {
  if (Platform.OS !== 'ios') return null
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 14 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: '#1e293b' }} />
      <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>or</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: '#1e293b' }} />
    </View>
  )
}
