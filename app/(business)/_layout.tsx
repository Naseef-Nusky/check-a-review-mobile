import { Tabs } from 'expo-router'
import { colors } from '../../src/constants'
import { TabIcon } from '../../src/components/TabIcon'

export default function BusinessLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.slate950 },
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.slate950,
          borderTopColor: colors.border,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home-outline" focusedName="home" color={String(color)} focused={focused} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          title: 'Reviews',
          tabBarLabel: 'Reviews',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="chatbubbles-outline"
              focusedName="chatbubbles"
              color={String(color)}
              focused={focused}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          title: 'Subscription',
          tabBarLabel: 'Plans',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="card-outline"
              focusedName="card"
              color={String(color)}
              focused={focused}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person-outline" focusedName="person" color={String(color)} focused={focused} size={26} />
          ),
        }}
      />
    </Tabs>
  )
}
