import React, { useState, useRef, useEffect, useContext } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, TextInput, DimensionValue, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Searchbar } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Card } from '@/components/ui/Card';
import { transactionApi, investmentApi, categoryApi, currencyApi } from '@/services/api';
import AuthContext from '@/context/AuthContext';
import type { AuthContextType } from '@/context/AuthContext';
import type { Transaction, Investment, Category, SubCategory, Currency, TransactionFormData, InvestmentFormData } from '@/types';

// Sample monthly data
const monthlySummary = {
  income: 42000,
  expenses: 28500,
  invested: 8000,
  net: 5500,
};

// Sample investment data
const investmentData: Investment[] = [
  { investment_id: 1, investment_date: '2023-06-20', type: 'Mutual Fund', name: 'SBI Blue Chip Fund', amount: 5000, currency_id: 1, user_id: '1', created_at: '2023-06-20', updated_at: '2023-06-20' },
  { investment_id: 2, investment_date: '2023-06-15', type: 'Stocks', name: 'Reliance Industries', amount: 10000, currency_id: 1, user_id: '1', created_at: '2023-06-15', updated_at: '2023-06-15' },
  { investment_id: 3, investment_date: '2023-06-10', type: 'Fixed Deposit', name: 'HDFC Bank FD', amount: 20000, currency_id: 1, user_id: '1', created_at: '2023-06-10', updated_at: '2023-06-10' },
];

// Sample aggregated data for bar graph
const categoryData = [
  { category: 'Food', amount: 5200 },
  { category: 'Transport', amount: 3500 },
  { category: 'Utilities', amount: 4300 },
  { category: 'Shopping', amount: 7800 },
  { category: 'Subscription', amount: 2100 },
  { category: 'Entertainment', amount: 3200 },
];

// Find the maximum value for scaling the bars
const maxCategoryAmount = Math.max(...categoryData.map(item => item.amount));

// Available categories for dropdown
const availableCategories = [
  'Food',
  'Transport',
  'Utilities',
  'Shopping',
  'Subscription',
  'Entertainment',
];

// Available subcategories mapped to categories
const availableSubCategories = {
  Food: ['Lunch', 'Dinner', 'Groceries', 'Snacks'],
  Transport: ['Cab', 'Fuel', 'Public Transport', 'Maintenance'],
  Utilities: ['Electricity', 'Water', 'Internet', 'Gas'],
  Shopping: ['Clothing', 'Electronics', 'Home', 'Personal care'],
  Subscription: ['Entertainment', 'Software', 'News', 'Music'],
  Entertainment: ['Movies', 'Events', 'Games', 'Activities'],
};

export default function MonthlyChurnScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = Colors[colorScheme].background;
  const cardBackgroundColor = Colors[colorScheme].card;
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
  // State for modals
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  
  // Form state for new transaction
  const [newTransaction, setNewTransaction] = useState<TransactionFormData>({
    transaction_date: new Date().toISOString().split('T')[0],
    category_id: 0,
    sub_category_id: 0,
    transaction_name: '',
    amount: 0,
    currency_id: 0,
    seller_name: '',
    discount_amount: 0,
    discount_origin: '',
    comments: '',
    transaction_type: 0,
    is_income: 0,
  });
  
  // State for editable summary
  const [editableSummary, setEditableSummary] = useState({...monthlySummary});

  // State for categories and subcategories
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  
  // New state for investments and category editing
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [addInvestmentModalVisible, setAddInvestmentModalVisible] = useState(false);
  const [newInvestment, setNewInvestment] = useState<InvestmentFormData>({
    investment_date: new Date().toISOString().split('T')[0],
    type: '',
    name: '',
    amount: 0,
    currency_id: 0,
  });
  const [editCategoriesModalVisible, setEditCategoriesModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 for transactions, 1 for investments
  
  const { token, user } = useContext(AuthContext) as AuthContextType;

  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Add to state:
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Add these state variables inside the MonthlyChurnScreen component
  const [categorySearch, setCategorySearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);

  // Helper to get user's currency symbol
  const userCurrency = currencies.find(c => c.currency_id === user?.currency_id);
  const currencySymbol = userCurrency ? userCurrency.currency_symbol : '₹';

  // Validation function
  const validateTransaction = () => {
    const errors: {[key: string]: string} = {};
    if (!newTransaction.transaction_date) errors.transaction_date = 'Date is required';
    if (!newTransaction.category_id) errors.category_id = 'Category is required';
    if (!newTransaction.amount || newTransaction.amount <= 0) errors.amount = 'Amount is required';
    return errors;
  };

  // Fetch transactions for current period
  const fetchTransactions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await transactionApi.getCurrentPeriodTransactions(token);
      // Ensure transactions is always an array
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactions([]); // fallback to empty array on error
    }
    setLoading(false);
  };

  // Fetch categories
  const fetchCategories = async () => {
    if (!token) return;
    try {
      const data = await categoryApi.getCategories(token);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch subcategories for a category
  const fetchSubCategories = async (categoryId: number) => {
    if (!token) return;
    try {
      const data = await categoryApi.getSubCategories(token, categoryId);
      setSubCategories(data);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  // Fetch currencies
  const fetchCurrencies = async () => {
    if (!token) return;
    try {
      const data = await currencyApi.getCurrencies(token);
      setCurrencies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching currencies:', err);
      setCurrencies([]);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
    fetchCurrencies();
  }, [token]);

  // Modified addTransaction handler
  const handleAddTransaction = async () => {
    const errors = validateTransaction();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    await addTransaction(newTransaction);
  };

  // Add new transaction
  const addTransaction = async (data: TransactionFormData) => {
    if (!token || !user?.user_id) return;
    try {
      await transactionApi.addTransaction(token, data);
      fetchTransactions();
      setAddModalVisible(false);
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  // Delete transaction
  const deleteTransaction = async (id: number) => {
    if (!token) return;
    try {
      await transactionApi.deleteTransaction(token, id);
      fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  // Update transaction
  const updateTransaction = async (id: number, data: Partial<TransactionFormData>) => {
    if (!token) return;
    try {
      await transactionApi.updateTransaction(token, id, data);
      fetchTransactions();
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  };

  // Handle category change
  const handleCategoryChange = async (categoryId: number) => {
    setNewTransaction(prev => ({ ...prev, category_id: categoryId, sub_category_id: 0 }));
    await fetchSubCategories(categoryId);
  };

  // Open transaction details modal
  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionModalVisible(true);
  };
  
  // Open add transaction modal
  const handleAddPress = () => {
    setAddModalVisible(true);
  };
  
  // Handle saving edited summary
  const handleSaveSummary = () => {
    // Here you would normally update this via an API
    setIsEditingSummary(false);
  };
  
  // Toggle editing mode for summary
  const toggleEditSummary = () => {
    setIsEditingSummary(!isEditingSummary);
  };

  // Handle investment input
  const handleInvestmentChange = (field: string, value: string) => {
    setNewInvestment({
      ...newInvestment,
      [field]: value
    });
  };
  
  // Add new investment
  const addInvestment = () => {
    // Convert string values to numbers where needed
    const amount = parseFloat(newInvestment.amount.toString());
    
    if (isNaN(amount)) {
      // Handle validation error
      console.log('Invalid amount');
      return;
    }
    
    // In a real app, would add the investment to state/database
    console.log('New investment:', {
      ...newInvestment,
      amount,
    });
    
    setAddInvestmentModalVisible(false);
    // Reset form
    setNewInvestment({
      investment_date: new Date().toISOString().split('T')[0],
      type: '',
      name: '',
      amount: 0,
      currency_id: 0,
    });
  };

  // Add these helper functions inside the MonthlyChurnScreen component
  const filteredCategories = categories.filter(cat => 
    cat.category_name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredSubCategories = subCategories.filter(sub => 
    sub.sub_category_name.toLowerCase().includes(subCategorySearch.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <ScrollView style={styles.container}>
        <ThemedText style={styles.header}>Monthly Churn</ThemedText>
        
        {/* Card 1: Amount Summary (Editable) */}
        <Card style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <ThemedText style={styles.cardTitle}>Amount Summary</ThemedText>
            <TouchableOpacity onPress={toggleEditSummary} style={styles.editIcon}>
              <IconSymbol 
                name={isEditingSummary ? "checkmark.circle.fill" : "pencil.circle.fill"} 
                size={24} 
                color={isDark ? '#4361EE' : '#3D5AF1'} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <IconSymbol name="arrow.down.circle.fill" size={24} color={isDark ? '#10B981' : '#22C55E'} />
              <ThemedText style={styles.summaryLabel}>Income</ThemedText>
              {isEditingSummary ? (
                <TextInput
                  style={[styles.summaryInput, { color: isDark ? '#fff' : '#000' }]}
                  value={editableSummary.income.toString()}
                  onChangeText={(text) => setEditableSummary({...editableSummary, income: parseInt(text) || 0})}
                  keyboardType="numeric"
                />
              ) : (
                <ThemedText style={styles.summaryValue}>₹{monthlySummary.income.toLocaleString()}</ThemedText>
              )}
            </View>
            
            <View style={styles.summaryItem}>
              <IconSymbol name="arrow.up.circle.fill" size={24} color={isDark ? '#EF4444' : '#F87171'} />
              <ThemedText style={styles.summaryLabel}>Expenses</ThemedText>
              {isEditingSummary ? (
                <TextInput
                  style={[styles.summaryInput, { color: isDark ? '#fff' : '#000' }]}
                  value={editableSummary.expenses.toString()}
                  onChangeText={(text) => setEditableSummary({...editableSummary, expenses: parseInt(text) || 0})}
                  keyboardType="numeric"
                />
              ) : (
                <ThemedText style={styles.summaryValue}>₹{monthlySummary.expenses.toLocaleString()}</ThemedText>
              )}
            </View>
            
            <View style={styles.summaryItem}>
              <IconSymbol name="chart.bar.fill" size={24} color={isDark ? '#8B5CF6' : '#A78BFA'} />
              <ThemedText style={styles.summaryLabel}>Invested</ThemedText>
              {isEditingSummary ? (
                <TextInput
                  style={[styles.summaryInput, { color: isDark ? '#fff' : '#000' }]}
                  value={editableSummary.invested.toString()}
                  onChangeText={(text) => setEditableSummary({...editableSummary, invested: parseInt(text) || 0})}
                  keyboardType="numeric"
                />
              ) : (
                <ThemedText style={styles.summaryValue}>₹{monthlySummary.invested.toLocaleString()}</ThemedText>
              )}
            </View>
            
            <View style={styles.summaryItem}>
              <IconSymbol name="chart.pie.fill" size={24} color={isDark ? '#4361EE' : '#3D5AF1'} />
              <ThemedText style={styles.summaryLabel}>Net</ThemedText>
              {isEditingSummary ? (
                <TextInput
                  style={[styles.summaryInput, { color: isDark ? '#fff' : '#000' }]}
                  value={editableSummary.net.toString()}
                  onChangeText={(text) => setEditableSummary({...editableSummary, net: parseInt(text) || 0})}
                  keyboardType="numeric"
                />
              ) : (
                <ThemedText style={styles.summaryValue}>₹{monthlySummary.net.toLocaleString()}</ThemedText>
              )}
            </View>
          </View>
          
          {isEditingSummary && (
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }]}
              onPress={handleSaveSummary}
            >
              <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
            </TouchableOpacity>
          )}
        </Card>
        
        {/* Card 2: Aggregated Bar Graph */}
        <Card style={styles.card}>
          <ThemedText style={styles.cardTitle}>Spending by Category</ThemedText>
          <View style={styles.barGraphContainer}>
            {categoryData.map((item) => {
              // Calculate bar height based on proportion of max value
              const barWidth = `${(item.amount / maxCategoryAmount) * 90}%`;
              return (
                <View key={item.category} style={styles.barGroup}>
                  <ThemedText style={styles.barLabel}>{item.category}</ThemedText>
                  <View style={styles.barContainer}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          width: barWidth as DimensionValue,
                          backgroundColor: isDark ? '#4361EE' : '#3D5AF1'
                        }
                      ]} 
                    />
                    <ThemedText style={styles.barValue}>₹{item.amount}</ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
        
        {/* Tab selector for Transactions/Investments */}
        <View style={styles.tabSelector}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 0 && styles.activeTab]} 
            onPress={() => setActiveTab(0)}
          >
            <ThemedText style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>Transactions</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 1 && styles.activeTab]} 
            onPress={() => setActiveTab(1)}
          >
            <ThemedText style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>Investments</ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* Card 3a: Transactions Table (shown when activeTab is 0) */}
        {activeTab === 0 && (
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <ThemedText style={styles.cardTitle}>Transactions</ThemedText>
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }]}
                onPress={handleAddPress}
              >
                <IconSymbol name="plus" size={16} color="#fff" />
                <ThemedText style={styles.addButtonText}>Add</ThemedText>
              </TouchableOpacity>
            </View>
            
            {/* Table header */}
            <View style={styles.tableHeader}>
              <ThemedText style={[styles.tableHeaderCell, { flex: 1.2 }]}>Date</ThemedText>
              <ThemedText style={[styles.tableHeaderCell, { flex: 1.5 }]}>Category</ThemedText>
              <ThemedText style={[styles.tableHeaderCell, { flex: 1.5 }]}>SubCategory</ThemedText>
              <ThemedText style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Amount</ThemedText>
            </View>
            
            {/* Table rows */}
            {transactions.map((transaction) => (
              <TouchableOpacity 
                key={transaction.transaction_id} 
                style={styles.tableRow}
                onPress={() => handleTransactionPress(transaction)}
              >
                <ThemedText style={[styles.tableCell, { flex: 1.2 }]}>{transaction.transaction_date}</ThemedText>
                <ThemedText style={[styles.tableCell, { flex: 1.5 }]}>
                  {categories.find(c => c.category_id === transaction.category_id)?.category_name || 'Unknown'}
                </ThemedText>
                <ThemedText style={[styles.tableCell, { flex: 1.5 }]}>
                  {subCategories.find(sc => sc.sub_category_id === transaction.sub_category_id)?.sub_category_name || 'Unknown'}
                </ThemedText>
                <ThemedText style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>₹{transaction.amount}</ThemedText>
              </TouchableOpacity>
            ))}
          </Card>
        )}
        
        {/* Card 3b: Investments Table (shown when activeTab is 1) */}
        {activeTab === 1 && (
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <ThemedText style={styles.cardTitle}>Investments</ThemedText>
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }]}
                onPress={() => setAddInvestmentModalVisible(true)}
              >
                <IconSymbol name="plus" size={16} color="#fff" />
                <ThemedText style={styles.addButtonText}>Add</ThemedText>
              </TouchableOpacity>
            </View>
            
            {/* Table header */}
            <View style={styles.tableHeader}>
              <ThemedText style={[styles.tableHeaderCell, { flex: 1.2 }]}>Date</ThemedText>
              <ThemedText style={[styles.tableHeaderCell, { flex: 1.5 }]}>Type</ThemedText>
              <ThemedText style={[styles.tableHeaderCell, { flex: 1.5 }]}>Name</ThemedText>
              <ThemedText style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Amount</ThemedText>
            </View>
            
            {/* Investment rows */}
            {investmentData.map((investment) => (
              <View key={investment.investment_id} style={styles.tableRow}>
                <ThemedText style={[styles.tableCell, { flex: 1.2 }]}>{investment.investment_date}</ThemedText>
                <ThemedText style={[styles.tableCell, { flex: 1.5 }]}>{investment.type}</ThemedText>
                <ThemedText style={[styles.tableCell, { flex: 1.5 }]}>{investment.name}</ThemedText>
                <ThemedText style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>₹{investment.amount}</ThemedText>
              </View>
            ))}
          </Card>
        )}
        
        {/* Card 4: Edit Categories */}
        <Card style={styles.card}>
          <TouchableOpacity onPress={() => setEditCategoriesModalVisible(true)}>
            <View style={styles.linkContainer}>
              <IconSymbol 
                name="square.grid.2x2.fill" 
                size={24} 
                color={isDark ? '#4361EE' : '#3D5AF1'} 
              />
              <ThemedText style={styles.linkText}>Edit Categories & Subcategories</ThemedText>
              <IconSymbol 
                name="chevron.right" 
                size={20} 
                color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} 
              />
            </View>
          </TouchableOpacity>
        </Card>
        
        {/* Transaction Detail Modal */}
        <Modal
          visible={transactionModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setTransactionModalVisible(false)}
        >
          {selectedTransaction && (
            <View style={styles.centeredView}>
              <View style={[styles.modalView, { backgroundColor: cardBackgroundColor }]}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Transaction Details</ThemedText>
                  <TouchableOpacity onPress={() => setTransactionModalVisible(false)}>
                    <IconSymbol name="xmark.circle.fill" size={24} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalScrollView}>
                  <View style={styles.modalItem}>
                    <ThemedText style={styles.modalLabel}>Date</ThemedText>
                    <ThemedText style={styles.modalValue}>{selectedTransaction.transaction_date}</ThemedText>
                  </View>
                  
                  <View style={styles.modalItem}>
                    <ThemedText style={styles.modalLabel}>Category</ThemedText>
                    <ThemedText style={styles.modalValue}>
                      {categories.find(c => c.category_id === selectedTransaction.category_id)?.category_name || 'Unknown'}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.modalItem}>
                    <ThemedText style={styles.modalLabel}>SubCategory</ThemedText>
                    <ThemedText style={styles.modalValue}>
                      {subCategories.find(sc => sc.sub_category_id === selectedTransaction.sub_category_id)?.sub_category_name || 'Unknown'}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.modalItem}>
                    <ThemedText style={styles.modalLabel}>Item Name</ThemedText>
                    <ThemedText style={styles.modalValue}>{selectedTransaction.transaction_name}</ThemedText>
                  </View>
                  
                  <View style={styles.modalItem}>
                    <ThemedText style={styles.modalLabel}>Total Amount</ThemedText>
                    <ThemedText style={styles.modalValue}>₹{selectedTransaction.amount}</ThemedText>
                  </View>
                  
                  <View style={styles.modalItem}>
                    <ThemedText style={styles.modalLabel}>Seller Name</ThemedText>
                    <ThemedText style={styles.modalValue}>{selectedTransaction.seller_name}</ThemedText>
                  </View>
                  
                  <View style={styles.modalItem}>
                    <ThemedText style={styles.modalLabel}>Discount Amount</ThemedText>
                    <ThemedText style={styles.modalValue}>
                      {selectedTransaction.discount_amount ? `₹${selectedTransaction.discount_amount}` : 'N/A'}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.modalItem}>
                    <ThemedText style={styles.modalLabel}>Discount Origin</ThemedText>
                    <ThemedText style={styles.modalValue}>
                      {selectedTransaction.discount_origin || 'N/A'}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.modalItem}>
                    <ThemedText style={styles.modalLabel}>Comments</ThemedText>
                    <ThemedText style={styles.modalValue}>
                      {selectedTransaction.comments || 'N/A'}
                    </ThemedText>
                  </View>
                </ScrollView>
                
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }]}
                  onPress={() => setTransactionModalVisible(false)}
                >
                  <ThemedText style={styles.modalButtonText}>Close</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Modal>
        
        {/* Add Transaction Modal */}
        <Modal
          visible={addModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setAddModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { backgroundColor: cardBackgroundColor }]}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Add Transaction</ThemedText>
                <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                  <IconSymbol name="xmark.circle.fill" size={24} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollView}>
                {/* Date Picker */}
                <View style={styles.formItem}>
                  <ThemedText style={styles.formLabel}>Date *</ThemedText>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <TextInput
                      style={[styles.formInput, { color: isDark ? '#fff' : '#000' }]}
                      value={newTransaction.transaction_date}
                      editable={false}
                      pointerEvents="none"
                    />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={new Date(newTransaction.transaction_date)}
                      mode="date"
                      display="default"
                      onChange={(_event: unknown, selectedDate?: Date) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          setNewTransaction({ ...newTransaction, transaction_date: selectedDate.toISOString().split('T')[0] });
                        }
                      }}
                    />
                  )}
                  {formErrors.transaction_date && <ThemedText style={{ color: 'red' }}>{formErrors.transaction_date}</ThemedText>}
                </View>
                {/* Category Selection */}
                <View style={styles.formItem}>
                  <ThemedText style={styles.formLabel}>Category *</ThemedText>
                  <TouchableOpacity 
                    style={[styles.dropdownButton, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }]}
                    onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <ThemedText style={styles.dropdownButtonText}>
                      {newTransaction.category_id 
                        ? categories.find(c => c.category_id === newTransaction.category_id)?.category_name 
                        : 'Select category'}
                    </ThemedText>
                    <IconSymbol 
                      name={showCategoryDropdown ? "chevron.up" : "chevron.down"} 
                      size={20} 
                      color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} 
                    />
                  </TouchableOpacity>
                  
                  {showCategoryDropdown && (
                    <View style={[styles.dropdownContainer, { backgroundColor: cardBackgroundColor }]}>
                      <Searchbar
                        placeholder="Search categories"
                        onChangeText={setCategorySearch}
                        value={categorySearch}
                        style={styles.searchBar}
                        inputStyle={{ color: isDark ? '#fff' : '#000' }}
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                      />
                      <ScrollView style={styles.dropdownList}>
                        {filteredCategories.map(cat => (
                          <TouchableOpacity
                            key={cat.category_id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setNewTransaction({ ...newTransaction, category_id: cat.category_id, sub_category_id: 0 });
                              fetchSubCategories(cat.category_id);
                              setShowCategoryDropdown(false);
                              setCategorySearch('');
                            }}
                          >
                            <ThemedText style={styles.dropdownItemText}>{cat.category_name}</ThemedText>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                  {formErrors.category_id && <ThemedText style={styles.errorText}>{formErrors.category_id}</ThemedText>}
                </View>
                {/* SubCategory Selection */}
                <View style={styles.formItem}>
                  <ThemedText style={styles.formLabel}>SubCategory</ThemedText>
                  <TouchableOpacity 
                    style={[
                      styles.dropdownButton, 
                      { 
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        opacity: newTransaction.category_id ? 1 : 0.5 
                      }
                    ]}
                    onPress={() => newTransaction.category_id && setShowSubCategoryDropdown(!showSubCategoryDropdown)}
                    disabled={!newTransaction.category_id}
                  >
                    <ThemedText style={styles.dropdownButtonText}>
                      {newTransaction.sub_category_id 
                        ? subCategories.find(sc => sc.sub_category_id === newTransaction.sub_category_id)?.sub_category_name 
                        : 'Select subcategory'}
                    </ThemedText>
                    <IconSymbol 
                      name={showSubCategoryDropdown ? "chevron.up" : "chevron.down"} 
                      size={20} 
                      color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} 
                    />
                  </TouchableOpacity>
                  
                  {showSubCategoryDropdown && (
                    <View style={[styles.dropdownContainer, { backgroundColor: cardBackgroundColor }]}>
                      <Searchbar
                        placeholder="Search subcategories"
                        onChangeText={setSubCategorySearch}
                        value={subCategorySearch}
                        style={styles.searchBar}
                        inputStyle={{ color: isDark ? '#fff' : '#000' }}
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                      />
                      <ScrollView style={styles.dropdownList}>
                        {filteredSubCategories.map(sub => (
                          <TouchableOpacity
                            key={sub.sub_category_id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setNewTransaction({ ...newTransaction, sub_category_id: sub.sub_category_id });
                              setShowSubCategoryDropdown(false);
                              setSubCategorySearch('');
                            }}
                          >
                            <ThemedText style={styles.dropdownItemText}>{sub.sub_category_name}</ThemedText>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
                {/* Item Name */}
                <View style={styles.formItem}>
                  <ThemedText style={styles.formLabel}>Item Name</ThemedText>
                  <TextInput
                    style={[styles.formInput, { color: isDark ? '#fff' : '#000' }]}
                    placeholder="Enter item name"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                    value={newTransaction.transaction_name}
                    onChangeText={(text) => setNewTransaction({ ...newTransaction, transaction_name: text })}
                  />
                </View>
                {/* Amount */}
                <View style={styles.formItem}>
                  <ThemedText style={styles.formLabel}>Amount ( {currencySymbol} ) *</ThemedText>
                  <TextInput
                    style={[styles.formInput, { color: isDark ? '#fff' : '#000' }]}
                    placeholder={`Enter amount in ${currencySymbol}`}
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                    keyboardType="numeric"
                    value={newTransaction.amount ? newTransaction.amount.toString() : ''}
                    onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: parseFloat(text) || 0 })}
                  />
                  {formErrors.amount && <ThemedText style={{ color: 'red' }}>{formErrors.amount}</ThemedText>}
                </View>
                {/* Seller Name */}
                <View style={styles.formItem}>
                  <ThemedText style={styles.formLabel}>Seller Name</ThemedText>
                  <TextInput
                    style={[styles.formInput, { color: isDark ? '#fff' : '#000' }]}
                    placeholder="Enter seller name"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                    value={newTransaction.seller_name}
                    onChangeText={(text) => setNewTransaction({ ...newTransaction, seller_name: text })}
                  />
                </View>
                {/* Discount Amount */}
                <View style={styles.formItem}>
                  <ThemedText style={styles.formLabel}>Discount Amount</ThemedText>
                  <TextInput
                    style={[styles.formInput, { color: isDark ? '#fff' : '#000' }]}
                    placeholder="Enter discount amount"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                    keyboardType="numeric"
                    value={newTransaction.discount_amount ? newTransaction.discount_amount.toString() : ''}
                    onChangeText={(text) => setNewTransaction({ ...newTransaction, discount_amount: parseFloat(text) || 0 })}
                  />
                </View>
                {/* Discount Origin */}
                <View style={styles.formItem}>
                  <ThemedText style={styles.formLabel}>Discount Origin</ThemedText>
                  <TextInput
                    style={[styles.formInput, { color: isDark ? '#fff' : '#000' }]}
                    placeholder="Enter discount origin"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                    value={newTransaction.discount_origin}
                    onChangeText={(text) => setNewTransaction({ ...newTransaction, discount_origin: text })}
                  />
                </View>
                {/* Comments */}
                <View style={styles.formItem}>
                  <ThemedText style={styles.formLabel}>Comments</ThemedText>
                  <TextInput
                    style={[styles.formInput, styles.textArea, { color: isDark ? '#fff' : '#000' }]}
                    placeholder="Add comments"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                    multiline={true}
                    numberOfLines={3}
                    value={newTransaction.comments}
                    onChangeText={(text) => setNewTransaction({ ...newTransaction, comments: text })}
                  />
                </View>
                <ThemedText style={styles.requiredNote}>* Required fields</ThemedText>
              </ScrollView>
              
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }]}
                  onPress={() => setAddModalVisible(false)}
                >
                  <ThemedText style={styles.modalCancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveButton, { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }]}
                  onPress={handleAddTransaction}
                >
                  <ThemedText style={styles.modalSaveButtonText}>Add</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Add Investment Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={addInvestmentModalVisible}
          onRequestClose={() => setAddInvestmentModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.addModalContent, { backgroundColor: Colors[colorScheme].card }]}>
              <ThemedText style={styles.modalTitle}>Add Investment</ThemedText>
              
              <ScrollView style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Date *</ThemedText>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }]}
                    value={newInvestment.investment_date}
                    onChangeText={(text) => handleInvestmentChange('investment_date', text)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                  />
                  {/* Ideally, this would be a date picker */}
                </View>
                
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Type *</ThemedText>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }]}
                    value={newInvestment.type}
                    onChangeText={(text) => handleInvestmentChange('type', text)}
                    placeholder="Investment type"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                  />
                  {/* Ideally, this would be a dropdown */}
                </View>
                
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Name *</ThemedText>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }]}
                    value={newInvestment.name}
                    onChangeText={(text) => handleInvestmentChange('name', text)}
                    placeholder="Investment name"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Amount (₹) *</ThemedText>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }]}
                    value={newInvestment.amount.toString()}
                    onChangeText={(text) => handleInvestmentChange('amount', text)}
                    keyboardType="numeric"
                    placeholder="Enter amount"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                  />
                </View>
                
                <ThemedText style={styles.requiredNote}>* Required fields</ThemedText>
              </ScrollView>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setAddInvestmentModalVisible(false)}
                >
                  <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]} 
                  onPress={addInvestment}
                >
                  <ThemedText style={styles.buttonText}>Add</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Edit Categories Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editCategoriesModalVisible}
          onRequestClose={() => setEditCategoriesModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.addModalContent, { backgroundColor: Colors[colorScheme].card }]}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Edit Categories</ThemedText>
                <TouchableOpacity onPress={() => setEditCategoriesModalVisible(false)}>
                  <IconSymbol name="xmark.circle.fill" size={24} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.formContainer}>
                {Object.entries(availableSubCategories).map(([category, subcategories]) => (
                  <View key={category} style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                      <ThemedText style={styles.categoryTitle}>{category}</ThemedText>
                      <TouchableOpacity style={styles.editIcon}>
                        <IconSymbol name="pencil" size={16} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.subcategoryList}>
                      {subcategories.map(subcategory => (
                        <View key={subcategory} style={styles.subcategoryItem}>
                          <ThemedText style={styles.subcategoryText}>{subcategory}</ThemedText>
                          <TouchableOpacity style={styles.deleteIcon}>
                            <IconSymbol name="trash" size={16} color={isDark ? '#EF4444' : '#F87171'} />
                          </TouchableOpacity>
                        </View>
                      ))}
                      
                      <TouchableOpacity style={styles.addSubcategoryButton}>
                        <IconSymbol name="plus.circle" size={16} color={isDark ? '#10B981' : '#22C55E'} />
                        <ThemedText style={styles.addSubcategoryText}>Add Subcategory</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                
                <TouchableOpacity 
                  style={[styles.addCategoryButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                >
                  <IconSymbol name="plus.circle.fill" size={20} color={isDark ? '#10B981' : '#22C55E'} />
                  <ThemedText style={styles.addCategoryText}>Add New Category</ThemedText>
                </TouchableOpacity>
              </ScrollView>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]} 
                onPress={() => setEditCategoriesModalVisible(false)}
              >
                <ThemedText style={styles.buttonText}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editIcon: {
    padding: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  summaryItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryInput: {
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    padding: 6,
    width: '100%',
    textAlign: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Bar graph styles
  barGraphContainer: {
    marginTop: 12,
  },
  barGroup: {
    marginBottom: 12,
  },
  barLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    marginLeft: 8,
    fontSize: 14,
  },
  // Table styles
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tableCell: {
    fontSize: 14,
  },
  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScrollView: {
    marginBottom: 16,
  },
  modalItem: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Form styles
  formItem: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    height: 80,
  },
  requiredNote: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
  },
  modalCancelButtonText: {
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalSaveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Tab selector styles
  tabSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4361EE',
  },
  tabText: {
    fontSize: 16,
    opacity: 0.6,
  },
  activeTabText: {
    fontWeight: '600',
    opacity: 1,
  },
  // Edit categories styles
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  linkText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  subcategoryList: {
    marginLeft: 16,
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  subcategoryText: {
    fontSize: 14,
  },
  deleteIcon: {
    padding: 4,
  },
  addSubcategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  addSubcategoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#22C55E',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  addCategoryText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addModalContent: {
    maxHeight: '80%',
  },
  modalTitleNew: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#3D5AF1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButton: {
    backgroundColor: '#3D5AF1',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  detailContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    width: '40%',
    fontWeight: '500',
  },
  detailValue: {
    width: '60%',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 200,
  },
  searchBar: {
    margin: 8,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  dropdownList: {
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
}); 