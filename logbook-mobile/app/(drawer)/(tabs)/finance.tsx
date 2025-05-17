import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function FinanceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Finance data would typically come from an API
  const financeData = {
    overview: {
      income: 0,
      expenses: 0,
      balance: 0,
    },
    transactions: [],
    budgets: [],
  };

  // Tab content components
  const OverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
          <View style={styles.statHeader}>
            <IconSymbol name="arrow.down.circle.fill" size={24} color={tintColor} />
            <ThemedText style={styles.statTitle}>Income</ThemedText>
          </View>
          <ThemedText style={styles.statValue}>${financeData.overview.income}</ThemedText>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
          <View style={styles.statHeader}>
            <IconSymbol name="arrow.up.circle.fill" size={24} color="#ff6b6b" />
            <ThemedText style={styles.statTitle}>Expenses</ThemedText>
          </View>
          <ThemedText style={styles.statValue}>${financeData.overview.expenses}</ThemedText>
        </View>
      </View>
      
      <View style={[styles.balanceCard, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
        <ThemedText style={styles.balanceTitle}>Current Balance</ThemedText>
        <ThemedText style={styles.balanceValue}>${financeData.overview.balance}</ThemedText>
      </View>
      
      <View style={styles.addTransactionContainer}>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: tintColor }]}
          onPress={() => Alert.alert('Add Transaction', 'Transaction adding will be available soon')}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
          <ThemedText style={styles.addButtonText}>Add Transaction</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
  
  const TransactionsTab = () => (
    <ScrollView style={styles.tabContent}>
      {financeData.transactions.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
          <IconSymbol name="doc.text" size={32} color={isDark ? '#555' : '#ccc'} />
          <ThemedText style={styles.emptyStateText}>No transactions yet</ThemedText>
          <TouchableOpacity 
            style={[styles.emptyStateButton, { backgroundColor: tintColor }]}
            onPress={() => Alert.alert('Add Transaction', 'Transaction adding will be available soon')}
          >
            <ThemedText style={styles.emptyStateButtonText}>Add Your First Transaction</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {/* Transaction list would go here */}
        </View>
      )}
    </ScrollView>
  );
  
  const BudgetTab = () => (
    <ScrollView style={styles.tabContent}>
      {financeData.budgets.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
          <IconSymbol name="chart.pie" size={32} color={isDark ? '#555' : '#ccc'} />
          <ThemedText style={styles.emptyStateText}>No budgets set up</ThemedText>
          <TouchableOpacity 
            style={[styles.emptyStateButton, { backgroundColor: tintColor }]}
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
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Finance</ThemedText>
      </View>
      
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'overview' && 
                { backgroundColor: isDark ? '#333' : '#e0e0e0' }
            ]}
            onPress={() => setActiveTab('overview')}
          >
            <ThemedText 
              style={[
                styles.tabText,
                activeTab === 'overview' && styles.activeTabText
              ]}
            >
              Overview
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'transactions' && 
                { backgroundColor: isDark ? '#333' : '#e0e0e0' }
            ]}
            onPress={() => setActiveTab('transactions')}
          >
            <ThemedText 
              style={[
                styles.tabText,
                activeTab === 'transactions' && styles.activeTabText
              ]}
            >
              Transactions
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'budget' && 
                { backgroundColor: isDark ? '#333' : '#e0e0e0' }
            ]}
            onPress={() => setActiveTab('budget')}
          >
            <ThemedText 
              style={[
                styles.tabText,
                activeTab === 'budget' && styles.activeTabText
              ]}
            >
              Budget
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'transactions' && <TransactionsTab />}
      {activeTab === 'budget' && <BudgetTab />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tabs: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 8,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  tabContent: {
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
}); 