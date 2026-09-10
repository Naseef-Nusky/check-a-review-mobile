import { Alert, Linking, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

export const LOGO_MAX_BYTES = 2 * 1024 * 1024
export const LOGO_UPLOAD_HINT =
  'PNG, JPG, or WEBP · max 2MB · wide logos work best (crop is 3:1, or use full image)'

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])

export type LogoFile = {
  uri: string
  name: string
  type: string
}

function extensionForMime(mime: string) {
  if (mime === 'image/png') return '.png'
  if (mime === 'image/webp') return '.webp'
  return '.jpg'
}

function mimeFromUriOrName(uri: string, name?: string | null, mime?: string | null) {
  const raw = String(mime || '').toLowerCase().trim()
  if (raw === 'image/jpg') return 'image/jpeg'
  if (ALLOWED_MIME.has(raw)) return raw === 'image/jpg' ? 'image/jpeg' : raw

  const source = `${name || ''} ${uri || ''}`.toLowerCase()
  if (source.includes('.png')) return 'image/png'
  if (source.includes('.webp')) return 'image/webp'
  if (source.includes('.jpg') || source.includes('.jpeg')) return 'image/jpeg'
  return 'image/jpeg'
}

export function normalizeLogoFile(input: {
  uri: string
  fileName?: string | null
  mimeType?: string | null
  fileSize?: number | null
}): LogoFile {
  const type = mimeFromUriOrName(input.uri, input.fileName, input.mimeType)
  const ext = extensionForMime(type)
  let name = String(input.fileName || `logo-${Date.now()}`).trim() || `logo-${Date.now()}`
  if (!/\.(png|jpe?g|webp)$/i.test(name)) {
    name = `${name.replace(/\.[^.]+$/, '')}${ext}`
  }
  return {
    uri: input.uri,
    name,
    type,
  }
}

export function validateLogoAsset(asset: {
  uri?: string
  mimeType?: string | null
  fileName?: string | null
  fileSize?: number | null
}) {
  if (!asset?.uri) return 'Could not read the selected image.'

  const type = mimeFromUriOrName(asset.uri, asset.fileName, asset.mimeType)
  if (!ALLOWED_MIME.has(type) && type !== 'image/jpg') {
    return 'Invalid logo format. Use PNG, JPG, or WEBP.'
  }

  const hint = `${asset.fileName || ''} ${asset.uri} ${asset.mimeType || ''}`.toLowerCase()
  if (hint.includes('heic') || hint.includes('heif') || asset.mimeType === 'image/heic') {
    return 'HEIC is not supported. Please choose a PNG, JPG, or WEBP logo.'
  }

  if (typeof asset.fileSize === 'number' && asset.fileSize > LOGO_MAX_BYTES) {
    return 'Logo file is too large. Maximum size is 2MB.'
  }

  return null
}

function hasLibraryAccess(permission: ImagePicker.MediaLibraryPermissionResponse) {
  if (permission.granted) return true
  if (permission.status === ImagePicker.PermissionStatus.GRANTED) return true
  // iOS “Select Photos…” limited access
  if (permission.accessPrivileges === 'limited' || permission.accessPrivileges === 'all') {
    return true
  }
  return false
}

async function ensureAndroidPhotoPermission(): Promise<string | null> {
  // iOS PHPicker does not require full library permission to pick one image.
  // Web uses a file input. Only Android needs an explicit grant first.
  if (Platform.OS !== 'android') return null

  let permission = await ImagePicker.getMediaLibraryPermissionsAsync()
  if (!hasLibraryAccess(permission)) {
    permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  }

  if (hasLibraryAccess(permission)) return null

  if (!permission.canAskAgain) {
    Alert.alert(
      'Photo access needed',
      'Enable Photos permission in Settings to upload your business logo.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ],
    )
  }

  return 'Photos permission is required to upload a logo. Please allow access and try again.'
}

export async function pickBusinessLogo(): Promise<{ file: LogoFile } | { error: string } | null> {
  try {
    const permissionError = await ensureAndroidPhotoPermission()
    if (permissionError) return { error: permissionError }

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: true,
      aspect: [3, 1],
      exif: false,
    }

    const representationMode = ImagePicker.UIImagePickerPreferredAssetRepresentationMode
    if (representationMode && 'Compatible' in representationMode) {
      pickerOptions.preferredAssetRepresentationMode = representationMode.Compatible
    }

    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions)

    if (result.canceled || !result.assets?.[0]) return null

    const asset = result.assets[0]
    const validationError = validateLogoAsset(asset)
    if (validationError) return { error: validationError }

    return { file: normalizeLogoFile(asset) }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not open the photo library.'
    if (/permission|access|denied|photo/i.test(message)) {
      return {
        error:
          'Could not access photos. On iPhone go to Settings → Privacy → Photos and allow access for Check A Review / Expo Go.',
      }
    }
    return { error: message }
  }
}

/** Append a logo file in the shape React Native / Expo expects. */
export async function appendLogoToFormData(formData: FormData, file: LogoFile) {
  const normalized = normalizeLogoFile(file)

  if (Platform.OS === 'web') {
    const response = await fetch(normalized.uri)
    const blob = await response.blob()
    const webFile = new File([blob], normalized.name, { type: normalized.type || blob.type })
    formData.append('logo', webFile)
    return
  }

  formData.append('logo', {
    uri: normalized.uri,
    name: normalized.name,
    type: normalized.type,
  } as unknown as Blob)
}
