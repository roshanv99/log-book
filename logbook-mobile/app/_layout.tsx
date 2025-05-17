import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

// Component to handle auth state and navigate accordingly
function RootLayoutNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isAtHome = segments[0] === '(drawer)' && (!segments[1] || segments[1] === 'home');

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page if the user is not authenticated
      router.replace('/(auth)/login' as any);
    } else if (isAuthenticated) {
      if (inAuthGroup) {
        // If user is authenticated and in auth group, redirect to home
        router.replace('/(drawer)/home' as any);
      } else if (!isAtHome) {
        // If user is authenticated but not at home (and not in auth), 
        // and this is a refresh or initial load (segments length check),
        // redirect to home
        if (segments.length <= 1) {
          router.replace('/(drawer)/home' as any);
        }
      }
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(drawer)" options={{ animation: 'fade' }} />
      <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // Set the background color for the entire app
  const backgroundColor = colorScheme === 'dark' 
    ? Colors.dark.background 
    : Colors.light.background;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor }}>
      <SafeAreaProvider style={{ backgroundColor }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <View style={{ flex: 1, backgroundColor }}>
              <RootLayoutNavigator />
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor={backgroundColor} />
            </View>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
