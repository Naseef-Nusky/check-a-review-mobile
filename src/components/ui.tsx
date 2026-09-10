import React, { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ImageStyle,
  type TextInputProps,
  type ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../constants'

export function BrandLogo({ height = 40, style }: { height?: number; style?: ImageStyle }) {
  const { width } = useWindowDimensions()
  const maxWidth = Math.min(width - 48, height * 3.2)
  const logoHeight = Math.min(height, maxWidth / 3.2)

  return (
    <Image
      source={require('../../assets/logo-check-a-review.png')}
      style={[
        {
          height: logoHeight,
          width: maxWidth,
          maxWidth: '100%',
          resizeMode: 'contain',
        },
        style,
      ]}
      accessibilityLabel="Check A Review"
    />
  )
}

export function Screen({
  children,
  style,
  edges = ['left', 'right'],
}: {
  children: React.ReactNode
  style?: ViewStyle
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>
}) {
  return (
    <SafeAreaView edges={edges} style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  )
}

export function Title({
  children,
  centered,
}: {
  children: React.ReactNode
  centered?: boolean
}) {
  return (
    <View style={styles.titleWrap}>
      <Text
        style={[styles.title, centered && styles.textCenter]}
        maxFontSizeMultiplier={1.3}
      >
        {children}
      </Text>
    </View>
  )
}

export function Subtitle({
  children,
  centered,
}: {
  children: React.ReactNode
  centered?: boolean
}) {
  return <Text style={[styles.subtitle, centered && styles.textCenter]}>{children}</Text>
}

export function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      autoCapitalize="none"
      {...props}
      style={[styles.input, props.style]}
    />
  )
}

export function PasswordField({
  value,
  onChangeText,
  placeholder = 'Password',
}: {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.passwordWrap}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={!visible}
        value={value}
        onChangeText={onChangeText}
        style={styles.passwordInput}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        hitSlop={10}
        style={styles.eyeButton}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
      >
        <Ionicons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={22}
          color={colors.muted}
        />
      </Pressable>
    </View>
  )
}

export function Button({
  label,
  onPress,
  loading,
  variant = 'primary',
  disabled,
  compact,
  style,
}: {
  label: string
  onPress: () => void
  loading?: boolean
  variant?: 'primary' | 'ghost' | 'danger'
  disabled?: boolean
  compact?: boolean
  style?: ViewStyle
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        variant === 'ghost' && styles.buttonGhost,
        variant === 'danger' && styles.buttonDanger,
        (disabled || loading) && styles.buttonDisabled,
        pressed && styles.buttonPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? colors.text : colors.white} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            compact && styles.buttonTextCompact,
            variant === 'ghost' && styles.buttonTextGhost,
          ]}
          numberOfLines={2}
        >
          {label}
        </Text>
      )}
    </Pressable>
  )
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string
  selected?: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  )
}

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>
}

export function ErrorText({ children }: { children?: string | null }) {
  if (!children) return null
  return <Text style={styles.error}>{children}</Text>
}

export function Stars({ rating }: { rating: number }) {
  const value = Math.round(Number(rating) || 0)
  return (
    <Text style={styles.stars}>
      {'★'.repeat(Math.max(0, Math.min(5, value)))}
      {'☆'.repeat(Math.max(0, 5 - value))}
    </Text>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.page,
    paddingHorizontal: 16,
    // Match spacing under the tab/stack nav header across all pages
    paddingTop: 12,
  },
  titleWrap: {
    marginTop: 0,
    marginBottom: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    overflow: 'visible',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    // Avoid custom lineHeight/padding on Text — clips bold glyphs on iOS Simulator
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 0,
    marginBottom: 16,
    lineHeight: 22,
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  textCenter: {
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    width: '100%',
  },
  passwordWrap: {
    position: 'relative',
    marginBottom: 12,
    width: '100%',
  },
  passwordInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingRight: 48,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 48,
  },
  buttonCompact: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 0,
    minHeight: 40,
    alignSelf: 'flex-start',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextCompact: {
    fontSize: 13,
  },
  buttonTextGhost: {
    color: colors.text,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.page,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    maxWidth: '100%',
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.white,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    width: '100%',
  },
  stars: {
    color: colors.star,
    fontSize: 16,
    letterSpacing: 1,
  },
})
