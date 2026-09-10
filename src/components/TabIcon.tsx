import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { colors } from '../constants'

type IconName = ComponentProps<typeof Ionicons>['name']

export function TabIcon({
  name,
  focusedName,
  color,
  focused,
  size = 24,
}: {
  name: IconName
  focusedName: IconName
  color?: string
  focused: boolean
  size?: number
}) {
  return <Ionicons name={focused ? focusedName : name} size={size} color={color || colors.muted} />
}
