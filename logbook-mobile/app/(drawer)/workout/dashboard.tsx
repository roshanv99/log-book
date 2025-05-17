import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function WorkoutDashboardScreen() {
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Workout Summary</ThemedText>
          
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: Colors[colorScheme].cardAlt }]}>
              <IconSymbol name="calendar" size={24} color={Colors[colorScheme].primary} />
              <ThemedText style={styles.statValue}>0</ThemedText>
              <ThemedText style={styles.statLabel}>This Week</ThemedText>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: Colors[colorScheme].cardAlt }]}>
              <IconSymbol name="flame.fill" size={24} color={Colors[colorScheme].primary} />
              <ThemedText style={styles.statValue}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Streak</ThemedText>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: Colors[colorScheme].cardAlt }]}>
              <IconSymbol name="chart.bar.fill" size={24} color={Colors[colorScheme].primary} />
              <ThemedText style={styles.statValue}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Total</ThemedText>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Start</ThemedText>
          
          <TouchableOpacity 
            style={[styles.quickStartButton, { backgroundColor: Colors[colorScheme].primary }]}
          >
            <IconSymbol name="plus" size={24} color="#fff" />
            <ThemedText style={styles.quickStartText}>New Workout</ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Recent Workouts</ThemedText>
          
          <View style={[styles.emptyState, { backgroundColor: Colors[colorScheme].cardAlt }]}>
            <IconSymbol name="calendar.badge.clock" size={36} color={isDark ? '#555' : '#ccc'} />
            <ThemedText style={styles.emptyStateText}>No recent workouts</ThemedText>
            <ThemedText style={styles.emptyStateSubText}>
              Your recent workouts will appear here
            </ThemedText>
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
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '31%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  quickStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  quickStartText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
}); 