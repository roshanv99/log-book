import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function GoalsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.header}>Financial Goals</ThemedText>
      
      {/* Add Goal Button */}
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }]}
      >
        <IconSymbol name="plus" size={20} color="#fff" />
        <ThemedText style={styles.addButtonText}>Add New Goal</ThemedText>
      </TouchableOpacity>

      {/* Active Goals */}
      <Card style={styles.card}>
        <ThemedText style={styles.cardTitle}>Active Goals</ThemedText>
        <View style={styles.goalItem}>
          <View style={styles.goalHeader}>
            <ThemedText style={styles.goalTitle}>Emergency Fund</ThemedText>
            <ThemedText style={styles.goalAmount}>₹50,000 / ₹1,00,000</ThemedText>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <ThemedText style={styles.goalDeadline}>Target: Dec 2024</ThemedText>
        </View>
      </Card>

      {/* Completed Goals */}
      <Card style={styles.card}>
        <ThemedText style={styles.cardTitle}>Completed Goals</ThemedText>
        <View style={styles.goalItem}>
          <View style={styles.goalHeader}>
            <ThemedText style={styles.goalTitle}>New Laptop</ThemedText>
            <ThemedText style={styles.goalAmount}>₹75,000 / ₹75,000</ThemedText>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <ThemedText style={styles.goalDeadline}>Completed: Mar 2024</ThemedText>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    marginBottom: 80,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalAmount: {
    fontSize: 14,
    opacity: 0.7,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4361EE',
    borderRadius: 4,
  },
  goalDeadline: {
    fontSize: 12,
    opacity: 0.6,
  },
}); 