import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText style={styles.heading}>Explore</ThemedText>
          <ThemedText style={styles.subheading}>
            Track your progress across different categories
          </ThemedText>
        </View>

        {/* Workout Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol name="figure.run" size={24} color={tintColor} />
            <ThemedText style={styles.cardTitle}>Workout</ThemedText>
          </View>
          <View style={styles.divider} />
          
          <ThemedText style={styles.cardDescription}>
            Track your workouts, set fitness goals, and monitor your progress over time.
          </ThemedText>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Workouts</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Active mins</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Goals</ThemedText>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: tintColor }]}
          >
            <ThemedText style={styles.buttonText}>Go to Workouts</ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* Finance Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color={tintColor} />
            <ThemedText style={styles.cardTitle}>Finance</ThemedText>
          </View>
          <View style={styles.divider} />
          
          <ThemedText style={styles.cardDescription}>
            Track your expenses, income, and manage your budget to achieve your financial goals.
          </ThemedText>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>$0</ThemedText>
              <ThemedText style={styles.statLabel}>Income</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>$0</ThemedText>
              <ThemedText style={styles.statLabel}>Expenses</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>$0</ThemedText>
              <ThemedText style={styles.statLabel}>Balance</ThemedText>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: tintColor }]}
          >
            <ThemedText style={styles.buttonText}>Go to Finances</ThemedText>
          </TouchableOpacity>
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  cardDescription: {
    marginBottom: 16,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  button: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
