import { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { colors, resolveMediaUrl } from '../constants'

type Props = {
  uri?: string | null
  name?: string
  size?: number
}

export function ProfileAvatar({ uri, name = '', size = 64 }: Props) {
  const [failed, setFailed] = useState(false)
  const src = resolveMediaUrl(uri)
  const initial = (name.trim()[0] || 'U').toUpperCase()

  if (!src || failed) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.initial, { fontSize: size * 0.36 }]}>{initial}</Text>
      </View>
    )
  }

  return (
    <Image
      source={{ uri: src }}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.border }}
      onError={() => setFailed(true)}
    />
  )
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.white,
    fontWeight: '700',
  },
})
