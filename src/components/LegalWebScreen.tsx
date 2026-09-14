import { useState } from 'react'
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { colors } from '../constants'

export function LegalWebScreen({ uri }: { uri: string }) {
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.page,
          paddingHorizontal: 24,
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 17,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Couldn’t load this page
        </Text>
        <Text
          style={{
            color: colors.muted,
            fontSize: 15,
            lineHeight: 22,
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          Open it in your browser instead.
        </Text>
        <Pressable
          onPress={() => Linking.openURL(uri)}
          accessibilityRole="link"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text
            style={{
              color: colors.accent,
              fontSize: 16,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            Open in browser
          </Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.page }}>
      {loading ? (
        <View
          style={{
            position: 'absolute',
            top: 24,
            left: 0,
            right: 0,
            zIndex: 1,
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : null}
      <WebView
        source={{ uri }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setFailed(true)
        }}
        onHttpError={() => {
          setLoading(false)
          setFailed(true)
        }}
        startInLoadingState
        style={{ flex: 1, backgroundColor: colors.page }}
      />
    </View>
  )
}
