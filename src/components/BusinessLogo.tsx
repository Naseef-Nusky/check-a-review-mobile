import { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { colors } from '../constants'
import { resolveMediaUrl } from '../utils/mediaUrl'

type Props = {
  uri?: string | null
  name?: string
  size?: number
}

export function BusinessLogo({ uri, name = '', size = 48 }: Props) {
  const [failed, setFailed] = useState(false)
  const src = resolveMediaUrl(uri)
  const initial = (String(name || '').trim()[0] || 'B').toUpperCase()
  const radius = size * 0.22

  if (!src || failed) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}>
        <Text style={[styles.initial, { fontSize: size * 0.38 }]}>{initial}</Text>
      </View>
    )
  }

  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: radius }]}>
      <Image
        source={{ uri: src }}
        style={styles.image}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.slate900,
    fontWeight: '700',
  },
})
