import { useMemo, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../constants'

type Option = { label: string; value: string }

export function SelectField({
  label,
  value,
  placeholder = 'Select…',
  options,
  onChange,
  disabled,
  searchable,
}: {
  label?: string
  value: string
  placeholder?: string
  options: Option[]
  onChange: (value: string) => void
  disabled?: boolean
  searchable?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const insets = useSafeAreaInsets()
  const { height, width } = useWindowDimensions()
  const compact = width < 390

  const selected = options.find((item) => item.value === value)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (item) =>
        item.label.toLowerCase().includes(q) || item.value.toLowerCase().includes(q),
    )
  }, [options, query])

  return (
    <View style={{ marginBottom: 12, width: '100%', opacity: disabled ? 0.5 : 1 }}>
      {label ? (
        <Text
          style={{
            color: colors.muted,
            fontSize: compact ? 12 : 13,
            fontWeight: '600',
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      ) : null}
      <Pressable
        disabled={disabled}
        onPress={() => {
          setQuery('')
          setOpen(true)
        }}
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: compact ? 12 : 14,
          minHeight: compact ? 46 : 50,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Text
          style={{ color: selected ? colors.text : colors.muted, flex: 1, fontSize: 16 }}
          numberOfLines={1}
        >
          {selected?.label || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
          <View
            style={{
              backgroundColor: colors.page,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: Math.min(height * 0.78, 640),
              paddingBottom: Math.max(16, insets.bottom + 8),
              width: '100%',
              maxWidth: 640,
              alignSelf: 'center',
            }}
          >
            <View
              style={{
                width: 42,
                height: 4,
                borderRadius: 999,
                backgroundColor: colors.border,
                alignSelf: 'center',
                marginTop: 10,
                marginBottom: 4,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingTop: 10,
                paddingBottom: 8,
                gap: 12,
              }}
            >
              <Text
                style={{ color: colors.text, fontSize: 17, fontWeight: '700', flex: 1 }}
                numberOfLines={1}
              >
                {label || 'Select'}
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>

            {searchable ? (
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search…"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                style={{
                  marginHorizontal: 16,
                  marginBottom: 8,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: colors.text,
                  fontSize: 16,
                }}
              />
            ) : null}

            <FlatList
              data={filtered}
              keyExtractor={(item) => `${item.value}-${item.label}`}
              keyboardShouldPersistTaps="handled"
              style={{ flexGrow: 0 }}
              renderItem={({ item }) => {
                const active = item.value === value
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value)
                      setOpen(false)
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      backgroundColor: active ? '#1e293b' : 'transparent',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 16, flex: 1, flexShrink: 1 }}>
                      {item.label}
                    </Text>
                    {active ? <Ionicons name="checkmark" size={20} color={colors.accent} /> : null}
                  </Pressable>
                )
              }}
              ListEmptyComponent={
                <Text style={{ color: colors.muted, textAlign: 'center', padding: 24 }}>
                  No matches
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}
