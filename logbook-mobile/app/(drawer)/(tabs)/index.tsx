import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Sample data
const financialSummary = {
  balance: 5328.42,
  income: 3500,
  expenses: 2175.58,
  savings: 1324.42,
  budgetStatus: 'On track',
};

// Sample transactions
const recentTransactions = [
  { id: '1', merchant: 'Grocery Store', amount: 87.32, date: '2023-08-01', category: 'Food' },
  { id: '2', merchant: 'Electricity Bill', amount: 124.50, date: '2023-07-30', category: 'Utilities' },
  { id: '3', merchant: 'Coffee Shop', amount: 5.75, date: '2023-07-29', category: 'Food' },
];

export default function FinanceDashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <ScrollView style={styles.container}>
        <ThemedText style={styles.header}>Finance Dashboard</ThemedText>
        
        {/* Account Summary Card */}
        <Card style={styles.card}>
          <ThemedText style={styles.cardTitle}>Account Summary</ThemedText>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.iconContainer}>
                <IconSymbol name="dollarsign.circle.fill" size={24} color={isDark ? '#4361EE' : '#3D5AF1'} />
              </View>
              <ThemedText style={styles.summaryLabel}>Balance</ThemedText>
              <ThemedText style={styles.summaryValue}>${financialSummary.balance.toFixed(2)}</ThemedText>
            </View>
            
            <View style={styles.summaryItem}>
              <View style={styles.iconContainer}>
                <IconSymbol name="arrow.down.circle.fill" size={24} color={isDark ? '#10B981' : '#22C55E'} />
              </View>
              <ThemedText style={styles.summaryLabel}>Income</ThemedText>
              <ThemedText style={styles.summaryValue}>${financialSummary.income.toFixed(2)}</ThemedText>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.iconContainer}>
                <IconSymbol name="arrow.up.circle.fill" size={24} color={isDark ? '#EF4444' : '#F87171'} />
              </View>
              <ThemedText style={styles.summaryLabel}>Expenses</ThemedText>
              <ThemedText style={styles.summaryValue}>${financialSummary.expenses.toFixed(2)}</ThemedText>
            </View>
            
            <View style={styles.summaryItem}>
              <View style={styles.iconContainer}>
                <IconSymbol name="creditcard.fill" size={24} color={isDark ? '#8B5CF6' : '#A78BFA'} />
              </View>
              <ThemedText style={styles.summaryLabel}>Savings</ThemedText>
              <ThemedText style={styles.summaryValue}>${financialSummary.savings.toFixed(2)}</ThemedText>
            </View>
          </View>
        </Card>
        
        {/* Recent Transactions */}
        <Card style={styles.card}>
          <ThemedText style={styles.cardTitle}>Recent Transactions</ThemedText>
          {recentTransactions.map(transaction => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionDetails}>
                <ThemedText style={styles.merchantName}>{transaction.merchant}</ThemedText>
                <ThemedText style={styles.transactionCategory}>{transaction.category}</ThemedText>
                <ThemedText style={styles.transactionDate}>{transaction.date}</ThemedText>
              </View>
              <ThemedText style={styles.transactionAmount}>
                -${transaction.amount.toFixed(2)}
              </ThemedText>
            </View>
          ))}
          <View style={styles.showMoreButton}>
            <ThemedText style={styles.showMoreText}>Show More</ThemedText>
          </View>
        </Card>
        
        {/* Budget Status */}
        <Card style={styles.card}>
          <ThemedText style={styles.cardTitle}>Budget Status</ThemedText>
          <View style={styles.budgetStatusContainer}>
            <View style={styles.iconContainer}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={isDark ? '#10B981' : '#22C55E'} />
            </View>
            <ThemedText style={styles.budgetStatusText}>{financialSummary.budgetStatus}</ThemedText>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '60%' }]} />
          </View>
          <ThemedText style={styles.progressText}>60% of monthly budget used</ThemedText>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  transactionDetails: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionCategory: {
    fontSize: 14,
    opacity: 0.7,
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  showMoreText: {
    color: '#4361EE',
    fontWeight: '600',
  },
  budgetStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetStatusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 