import { Alert, Linking, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { CONTACT_EMAIL, colors } from '../constants'
import { Card } from './ui'

async function openSupportEmail() {
  const url = `mailto:${CONTACT_EMAIL}`
  try {
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      await Linking.openURL(url)
      return
    }
  } catch {
    // fall through
  }
  Alert.alert('Contact support', CONTACT_EMAIL)
}

export function SupportContact({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Pressable onPress={openSupportEmail} accessibilityRole="link" accessibilityLabel="Contact support">
        <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
          Need help? Contact the support team
        </Text>
        <Text
          style={{
            color: colors.accent,
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {CONTACT_EMAIL}
        </Text>
      </Pressable>
    )
  }

  return (
    <Card>
      <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
        Contact support
      </Text>
      <Text style={{ color: colors.muted, marginBottom: 12, lineHeight: 20 }}>
        Questions about your account, reviews, or billing? Email the Check A Review support team.
      </Text>
      <Pressable
        onPress={openSupportEmail}
        accessibilityRole="link"
        accessibilityLabel={`Email ${CONTACT_EMAIL}`}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Ionicons name="mail-outline" size={18} color={colors.accent} />
        <Text style={{ color: colors.accent, fontSize: 15, fontWeight: '600' }}>{CONTACT_EMAIL}</Text>
      </Pressable>
    </Card>
  )
}

export function SupportContactLine() {
  return (
    <View style={{ marginTop: 20, marginBottom: 4 }}>
      <SupportContact compact />
    </View>
  )
}
