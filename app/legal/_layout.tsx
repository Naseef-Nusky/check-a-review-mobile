import { Stack } from 'expo-router'
import { colors } from '../../src/constants'

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.slate950 },
        headerTintColor: colors.accent,
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        headerBackTitle: '',
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.page },
      }}
    >
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="terms" options={{ title: 'Terms of Use' }} />
      <Stack.Screen name="terms-business" options={{ title: 'Business terms' }} />
    </Stack>
  )
}
