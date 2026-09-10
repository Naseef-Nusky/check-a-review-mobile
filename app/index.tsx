import { Redirect } from 'expo-router'
import { ActivityIndicator, Text, View } from 'react-native'
import { useAuth } from '../src/context/AuthContext'
import { BrandLogo } from '../src/components/ui'
import { colors } from '../src/constants'

export default function Index() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.page,
          paddingHorizontal: 24,
        }}
      >
        <BrandLogo height={52} />
        <Text
          style={{
            marginTop: 18,
            color: colors.text,
            fontSize: 18,
            fontWeight: '700',
            textAlign: 'center',
          }}
        >
          Check A Review
        </Text>
        <Text
          style={{
            marginTop: 6,
            marginBottom: 24,
            color: colors.muted,
            fontSize: 14,
            textAlign: 'center',
          }}
        >
          Loading your account…
        </Text>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    )
  }

  if (!user) return <Redirect href="/(auth)/login" />
  if (user.role === 'business') return <Redirect href="/(business)" />
  return <Redirect href="/(customer)" />
}
