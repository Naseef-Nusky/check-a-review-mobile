import { Image, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../constants'
import { LOGO_UPLOAD_HINT, type LogoFile } from '../utils/logoUpload'
import { Button } from './ui'

export function LogoUploadField({
  value,
  onChange,
  onError,
  compact,
  disabled,
  hideLabel,
}: {
  value: LogoFile | null
  onChange: (file: LogoFile | null) => void
  onError?: (message: string) => void
  compact?: boolean
  disabled?: boolean
  hideLabel?: boolean
}) {
  return (
    <View style={{ marginBottom: 12, width: '100%' }}>
      {!hideLabel ? (
        <Text
          style={{
            color: colors.muted,
            fontSize: compact ? 12 : 13,
            fontWeight: '600',
            marginBottom: 6,
          }}
        >
          Business logo
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: compact ? 'column' : 'row',
          alignItems: compact ? 'stretch' : 'flex-start',
          gap: 12,
        }}
      >
        <View
          style={{
            width: compact ? '100%' : 176,
            height: compact ? 80 : 80,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            alignSelf: compact ? 'stretch' : 'flex-start',
          }}
        >
          {value?.uri ? (
            <Image
              source={{ uri: value.uri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="image-outline" size={28} color={colors.muted} />
          )}
        </View>

        <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <View style={{ flexGrow: 1, minWidth: 120 }}>
              <Button
                label={value ? 'Reselect' : 'Upload logo'}
                onPress={async () => {
                  onError?.('')
                  const { pickBusinessLogo } = await import('../utils/logoUpload')
                  const result = await pickBusinessLogo()
                  if (!result) return
                  if ('error' in result) {
                    onError?.(result.error)
                    return
                  }
                  onChange(result.file)
                }}
                disabled={disabled}
                compact
                style={{ marginTop: 0, alignSelf: 'stretch' }}
              />
            </View>
            {value ? (
              <View style={{ flexGrow: 1, minWidth: 100 }}>
                <Button
                  label="Remove"
                  variant="ghost"
                  onPress={() => {
                    onError?.('')
                    onChange(null)
                  }}
                  disabled={disabled}
                  compact
                  style={{ marginTop: 0, alignSelf: 'stretch' }}
                />
              </View>
            ) : null}
          </View>
          <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 15 }}>
            {LOGO_UPLOAD_HINT}
          </Text>
        </View>
      </View>
    </View>
  )
}
