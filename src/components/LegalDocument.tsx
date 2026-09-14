import React from 'react'
import { ScrollView, Text, useWindowDimensions, View } from 'react-native'
import { colors } from '../constants'

export function LegalScreen({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions()
  const pad = width < 380 ? 16 : 20

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.page }}
      contentContainerStyle={{
        paddingHorizontal: pad,
        paddingTop: 8,
        paddingBottom: 48,
      }}
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  )
}

export function LegalLead({ children }: { children: string }) {
  const { width } = useWindowDimensions()
  return (
    <Text
      style={{
        color: colors.text,
        fontSize: width < 380 ? 18 : 20,
        fontWeight: '700',
        lineHeight: 28,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  )
}

export function LegalH2({ children }: { children: string }) {
  const { width } = useWindowDimensions()
  return (
    <Text
      style={{
        color: colors.text,
        fontSize: width < 380 ? 16 : 17,
        fontWeight: '700',
        lineHeight: 24,
        marginTop: 22,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  )
}

export function LegalP({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions()
  return (
    <Text
      style={{
        color: colors.muted,
        fontSize: width < 380 ? 14 : 15,
        lineHeight: 22,
        marginBottom: 10,
      }}
    >
      {children}
    </Text>
  )
}

export function LegalStrong({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: colors.text,
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 22,
        marginTop: 8,
        marginBottom: 6,
      }}
    >
      {children}
    </Text>
  )
}

export function LegalUl({ items }: { items: string[] }) {
  const { width } = useWindowDimensions()
  const fontSize = width < 380 ? 14 : 15
  return (
    <View style={{ marginBottom: 10 }}>
      {items.map((item) => (
        <View
          key={item}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 6,
            paddingRight: 2,
          }}
        >
          <Text style={{ color: colors.accent, fontSize, lineHeight: 22, width: 16 }}>•</Text>
          <Text style={{ flex: 1, flexShrink: 1, color: colors.muted, fontSize, lineHeight: 22 }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  )
}

export function LegalRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 12,
            backgroundColor: colors.card,
            borderTopWidth: index === 0 ? 0 : 1,
            borderTopColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 4,
              lineHeight: 20,
            }}
          >
            {row.label}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>{row.value}</Text>
        </View>
      ))}
    </View>
  )
}
