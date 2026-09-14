import { Text } from 'react-native'
import { router } from 'expo-router'
import { colors } from '../constants'

export function LegalAgreeLine() {
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.7}
      style={{
        color: colors.muted,
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 4,
      }}
    >
      By continuing, you agree to our{' '}
      <Text
        onPress={() => router.push('/legal/terms')}
        style={{ color: colors.accent, fontWeight: '600' }}
      >
        Terms
      </Text>
      {' '}and{' '}
      <Text
        onPress={() => router.push('/legal/privacy')}
        style={{ color: colors.accent, fontWeight: '600' }}
      >
        Privacy
      </Text>
    </Text>
  )
}
