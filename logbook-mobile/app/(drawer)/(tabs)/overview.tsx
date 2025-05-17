import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function FinanceOverviewScreen() {
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';
  
  // Finance data would typically come from an API
  const financeData = {
    income: 0,
    expenses: 0,
    balance: 0,
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: Colors[colorScheme].cardAlt }]}>
            <View style={styles.statHeader}>
              <IconSymbol name="arrow.down.circle.fill" size={24} color={Colors[colorScheme].success} />
              <ThemedText style={styles.statTitle}>Income</ThemedText>
            </View>
            <ThemedText style={styles.statValue}>${financeData.income}</ThemedText>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: Colors[colorScheme].cardAlt }]}>
            <View style={styles.statHeader}>
              <IconSymbol name="arrow.up.circle.fill" size={24} color={Colors[colorScheme].error} />
              <ThemedText style={styles.statTitle}>Expenses</ThemedText>
            </View>
            <ThemedText style={styles.statValue}>${financeData.expenses}</ThemedText>
          </View>
        </View>
        
        <View style={[styles.balanceCard, { backgroundColor: Colors[colorScheme].cardAlt }]}>
          <ThemedText style={styles.balanceTitle}>Current Balance</ThemedText>
          <ThemedText style={styles.balanceValue}>${financeData.balance}</ThemedText>
        </View>
        
        <View style={styles.addTransactionContainer}>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: Colors[colorScheme].primary }]}
            onPress={() => Alert.alert('Add Transaction', 'Transaction adding will be available soon')}
          >
            <IconSymbol name="plus" size={20} color="#fff" />
            <ThemedText style={styles.addButtonText}>Add Transaction</ThemedText>
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
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  addTransactionContainer: {
    marginTop: 16,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
}); 