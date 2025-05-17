import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function FinanceBudgetScreen() {
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';
  
  // Budget data would typically come from an API
  const budgets = [];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {budgets.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: Colors[colorScheme].cardAlt }]}>
            <IconSymbol name="chart.pie" size={32} color={isDark ? '#555' : '#ccc'} />
            <ThemedText style={styles.emptyStateText}>No budgets set up</ThemedText>
            <TouchableOpacity 
              style={[styles.emptyStateButton, { backgroundColor: Colors[colorScheme].primary }]}
              onPress={() => Alert.alert('Create Budget', 'Budget creation will be available soon')}
            >
              <ThemedText style={styles.emptyStateButtonText}>Create Your First Budget</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Budget list would go here */}
          </View>
        )}
      </ScrollView>
      
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: Colors[colorScheme].primary }]}
          onPress={() => Alert.alert('Create Budget', 'Budget creation will be available soon')}
        >
          <IconSymbol name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyStateText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
}); 