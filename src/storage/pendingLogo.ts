import AsyncStorage from '@react-native-async-storage/async-storage'
import type { LogoFile } from '../utils/logoUpload'

const PENDING_LOGO_KEY = 'pending_business_logo'

export async function stashPendingBusinessLogo(file: LogoFile | null) {
  if (!file?.uri) {
    await clearPendingBusinessLogo()
    return
  }
  try {
    await AsyncStorage.setItem(PENDING_LOGO_KEY, JSON.stringify(file))
  } catch {
    await clearPendingBusinessLogo()
  }
}

export async function clearPendingBusinessLogo() {
  try {
    await AsyncStorage.removeItem(PENDING_LOGO_KEY)
  } catch {
    /* ignore */
  }
}

export async function takePendingBusinessLogo(): Promise<LogoFile | null> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_LOGO_KEY)
    if (!raw) return null
    await clearPendingBusinessLogo()
    const parsed = JSON.parse(raw) as LogoFile
    if (!parsed?.uri) return null
    return {
      uri: parsed.uri,
      name: parsed.name || 'logo.jpg',
      type: parsed.type || 'image/jpeg',
    }
  } catch {
    await clearPendingBusinessLogo()
    return null
  }
}
