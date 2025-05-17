import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function WorkoutTabLayout() {
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].primary,
        headerShown: false, // Header is shown by drawer layout
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].card,
          borderTopColor: Colors[colorScheme].border,
          ...Platform.select({
            ios: {
              shadowColor: Colors[colorScheme].text,
              shadowOpacity: 0.1,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: -2 },
            },
            android: {
              elevation: 8,
            },
          }),
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="dumbbell.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="clock.fill" color={color} />,
        }}
      />
    </Tabs>
  );
} 