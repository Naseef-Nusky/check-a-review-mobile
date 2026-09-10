import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

const TOKEN_KEY = 'car_token'
const USER_KEY = 'car_user'

export type StoredUser = {
  id: string | number
  email: string
  name: string
  role: 'customer' | 'business'
  [key: string]: unknown
}

const isWeb = Platform.OS === 'web'

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return AsyncStorage.getItem(key)
  return SecureStore.getItemAsync(key)
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value)
    return
  }
  await SecureStore.setItemAsync(key, value)
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key)
    return
  }
  await SecureStore.deleteItemAsync(key)
}

export async function getToken(): Promise<string | null> {
  return getItem(TOKEN_KEY)
}

export async function setToken(token: string): Promise<void> {
  await setItem(TOKEN_KEY, token)
}

export async function getUser(): Promise<StoredUser | null> {
  const raw = await getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export async function setUser(user: StoredUser): Promise<void> {
  await setItem(USER_KEY, JSON.stringify(user))
}

export async function clearAuth(): Promise<void> {
  await deleteItem(TOKEN_KEY)
  await deleteItem(USER_KEY)
}
