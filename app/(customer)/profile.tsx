import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { router, useFocusEffect } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { authApi, customerApi, ApiError } from '../../src/services/api'
import {
  Button,
  Card,
  ErrorText,
  Field,
  PasswordField,
  Screen,
  Subtitle,
} from '../../src/components/ui'
import { ProfileAvatar } from '../../src/components/ProfileAvatar'
import { colors } from '../../src/constants'
import type { StoredUser } from '../../src/storage/authStorage'

function Label({ children }: { children: string }) {
  return (
    <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
      {children}
    </Text>
  )
}

function toStoredUser(raw: Record<string, unknown>, fallback?: StoredUser | null): StoredUser {
  return {
    ...(fallback || {}),
    ...raw,
    id: (raw.id as string | number) ?? fallback?.id ?? '',
    email: String(raw.email || fallback?.email || ''),
    name: String(raw.name || fallback?.name || 'User'),
    role: ((raw.role as StoredUser['role']) || fallback?.role || 'customer'),
  }
}

export default function CustomerProfileScreen() {
  const { width } = useWindowDimensions()
  const isNarrow = width < 400
  const { user, logout, updateUser, setSession, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [reviewCount, setReviewCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      refreshUser().catch(() => {})
      customerApi
        .getMyReviews()
        .then((data) => setReviewCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setReviewCount(0))
    }, [refreshUser]),
  )

  useEffect(() => {
    setName(user?.name || '')
  }, [user?.name])

  async function onSave() {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const updated = await authApi.updateProfile({ name: name.trim() })
      await updateUser(toStoredUser(updated, user))
      setMessage('Your information has been saved.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  async function onPickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload a profile picture.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    })
    if (result.canceled || !result.assets?.[0]) return

    const asset = result.assets[0]
    setUploading(true)
    setError(null)
    setMessage(null)
    try {
      const updated = await authApi.uploadAvatar({
        uri: asset.uri,
        name: asset.fileName || 'avatar.jpg',
        type: asset.mimeType || 'image/jpeg',
      })
      await updateUser(toStoredUser(updated, user))
      setMessage('Profile picture updated.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to upload profile picture')
    } finally {
      setUploading(false)
    }
  }

  async function onRemoveAvatar() {
    setUploading(true)
    setError(null)
    setMessage(null)
    try {
      const updated = await authApi.removeAvatar()
      await updateUser(toStoredUser(updated, user))
      setMessage('Profile picture removed.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to remove profile picture')
    } finally {
      setUploading(false)
    }
  }

  async function onChangePassword() {
    setPasswordError(null)
    setPasswordMessage(null)
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    setChangingPassword(true)
    try {
      const result = await authApi.changePassword({
        currentPassword: currentPassword || undefined,
        password: newPassword,
      })
      if (!result?.user || !result?.token) {
        throw new Error('Password saved, but session refresh failed. Please sign in again.')
      }
      await setSession(toStoredUser(result.user, user), result.token)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage('Password updated successfully.')
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'Failed to update password')
    } finally {
      setChangingPassword(false)
    }
  }

  async function onLogout() {
    await logout()
    router.replace('/(auth)/login')
  }

  const displayName = name || user?.name || 'User'
  const avatarUrl = (user?.avatar_url as string) || (user?.avatarUrl as string) || ''

  return (
    <Screen style={{ paddingBottom: 0, paddingHorizontal: isNarrow ? 12 : 16 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        >
          <Subtitle>Manage your personal information</Subtitle>

          <Card>
            <View
              style={{
                flexDirection: isNarrow ? 'column' : 'row',
                alignItems: isNarrow ? 'flex-start' : 'center',
                gap: 14,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, width: '100%' }}>
                <ProfileAvatar uri={avatarUrl} name={displayName} size={isNarrow ? 64 : 72} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{ fontSize: isNarrow ? 18 : 20, fontWeight: '700', color: colors.text }}
                    numberOfLines={2}
                  >
                    {displayName}
                  </Text>
                  <Text style={{ color: colors.muted, marginTop: 4 }} numberOfLines={2}>
                    {user?.email}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  alignItems: isNarrow ? 'flex-start' : 'center',
                  paddingTop: isNarrow ? 4 : 0,
                  minWidth: isNarrow ? undefined : 72,
                }}
              >
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{reviewCount}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {reviewCount === 1 ? 'Review' : 'Reviews'}
                </Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
              Personal settings
            </Text>
            <Text style={{ color: colors.muted, marginBottom: 14, lineHeight: 20 }}>
              Update your profile picture, name, and preferences.
            </Text>
            <ErrorText>{error}</ErrorText>
            {message ? <Text style={{ color: '#6EE7B7', marginBottom: 10 }}>{message}</Text> : null}

            <View style={{ gap: 10, marginBottom: 14 }}>
              <Button
                label={uploading ? 'Uploading…' : avatarUrl ? 'Change picture' : 'Upload picture'}
                onPress={onPickAvatar}
                loading={uploading}
              />
              {avatarUrl ? (
                <Pressable onPress={onRemoveAvatar} disabled={uploading} style={{ alignSelf: 'center', padding: 6 }}>
                  <Text style={{ color: colors.muted }}>Remove picture</Text>
                </Pressable>
              ) : null}
            </View>

            <Label>Email</Label>
            <Field value={user?.email || ''} editable={false} style={{ opacity: 0.7 }} />
            <Label>Name</Label>
            <Field value={name} onChangeText={setName} autoCapitalize="words" />
            <Button label={saving ? 'Saving…' : 'Save information'} onPress={onSave} loading={saving} />
          </Card>

          <Card>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
              Change password
            </Text>
            <Text style={{ color: colors.muted, marginBottom: 14, lineHeight: 20 }}>
              Update the password you use to sign in with email.
            </Text>
            <ErrorText>{passwordError}</ErrorText>
            {passwordMessage ? (
              <Text style={{ color: '#6EE7B7', marginBottom: 10 }}>{passwordMessage}</Text>
            ) : null}
            <Label>Current password</Label>
            <PasswordField value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" />
            <Label>New password</Label>
            <PasswordField value={newPassword} onChangeText={setNewPassword} placeholder="New password" />
            <Label>Confirm password</Label>
            <PasswordField value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm password" />
            <Button
              label={changingPassword ? 'Updating…' : 'Update password'}
              onPress={onChangePassword}
              loading={changingPassword}
            />
          </Card>

          <Button label="Sign out" variant="danger" onPress={onLogout} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
