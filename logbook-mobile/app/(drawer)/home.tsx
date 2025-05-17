import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/context/AuthContext';
import { DrawerActions, useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedText style={styles.greeting}>
          Welcome back, {user?.username || 'User'}!
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>Quick Access</ThemedText>

        <View style={styles.quickAccessGrid}>
          <TouchableOpacity 
            style={[styles.quickAccessItem, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}
            onPress={() => router.push('/workout' as any)}
          >
            <IconSymbol name="figure.run" size={32} color={tintColor} />
            <ThemedText style={styles.quickAccessLabel}>Workout</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickAccessItem, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}
            onPress={() => router.push('/finance' as any)}
          >
            <IconSymbol name="chart.line.uptrend.xyaxis" size={32} color={tintColor} />
            <ThemedText style={styles.quickAccessLabel}>Finance</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickAccessItem, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}
            onPress={() => router.push('/settings' as any)}
          >
            <IconSymbol name="gearshape.fill" size={32} color={tintColor} />
            <ThemedText style={styles.quickAccessLabel}>Settings</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
        
        <View style={[styles.emptyState, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
          <IconSymbol name="tray" size={32} color={isDark ? '#555' : '#ccc'} />
          <ThemedText style={styles.emptyStateText}>No recent activity to show</ThemedText>
        </View>

        <ThemedText style={styles.sectionTitle}>Quick Stats</ThemedText>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statItem, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
            <ThemedText style={styles.statValue}>0</ThemedText>
            <ThemedText style={styles.statLabel}>Workouts</ThemedText>
          </View>
          
          <View style={[styles.statItem, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
            <ThemedText style={styles.statValue}>$0</ThemedText>
            <ThemedText style={styles.statLabel}>Expenses</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  quickAccessItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessLabel: {
    marginTop: 8,
    fontWeight: '500',
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateText: {
    marginTop: 8,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 