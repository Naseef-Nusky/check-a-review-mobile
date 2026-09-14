import { ActivityIndicator, View } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { Ionicons } from '@expo/vector-icons'
import { AuthProvider } from '../src/context/AuthContext'
import { colors } from '../src/constants'

export default function RootLayout() {
  const [fontsLoaded] = useFonts(Ionicons.font)

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.page }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    )
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
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
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="legal" options={{ headerShown: false }} />
        <Stack.Screen
          name="(customer)"
          options={{ headerShown: false, title: '', headerBackTitle: '' }}
        />
        <Stack.Screen name="(business)" options={{ headerShown: false }} />
        <Stack.Screen
          name="business/[id]"
          options={{
            title: 'Business',
            headerBackTitle: '',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
        <Stack.Screen
          name="write-review/[businessId]"
          options={{
            title: 'Write review',
            headerBackTitle: '',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
        <Stack.Screen
          name="claim/[businessId]"
          options={{
            title: 'Claim business',
            headerBackTitle: '',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
        <Stack.Screen
          name="claim/verify"
          options={{
            title: 'Verify claim email',
            headerBackTitle: '',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
      </Stack>
    </AuthProvider>
  )
}
