import React, { useState, useRef, useEffect, useContext } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, TextInput, DimensionValue, FlatList, Alert, ActivityIndicator, Text, Platform, StatusBar } from 'react-native';
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
import { useAuth } from '@/context/AuthContext';
import { BankStatementReader } from '@/components/BankStatementReader';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { AddInvestmentModal } from '@/components/AddInvestmentModal';
import { trimString, trimObjectStrings, formatNumber } from '@/utils/stringUtils';

const INVESTMENT_TYPES = [
  'Mutual Funds',
  'Stocks',
  'Fixed Deposits',
  'Chit Fund'
];

let incomeValue:number | null = null;


const SpendingByCategory = ({ currencyId }: { currencyId: number }) => {
  const { token } = useAuth();
  const [categoryData, setCategoryData] = useState<{ category_id: number; category_name: string; total_amount: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!token) return;
      try {
        const data = await transactionApi.getCategoryAggregates(token);
        setCategoryData(data);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryData();
  }, [token]);

  if (isLoading) {
    return <ActivityIndicator size="large" color={isDark ? '#4361EE' : '#3D5AF1'} />;
  }
  if (categoryData.length === 0) {
    return <ThemedText style={styles.noDataText}>No spending data available</ThemedText>;
  }

  const safeCategoryData = categoryData.map(item => ({
    ...item,
    total_amount: item.total_amount ?? 0,
  }));

  const maxCategoryAmount = Math.max(...safeCategoryData.map(item => item.total_amount));

  return (
    <ScrollView style={styles.chartScrollView}>
      <View style={styles.chartContainer}>
        {safeCategoryData.map((item) => {
          const barWidth = `${(item.total_amount / maxCategoryAmount) * 80}%`;
          return (
            <View key={item.category_id} style={styles.barGroup}>
              <View style={styles.barRow}>
                <ThemedText style={styles.barLabel}>{item.category_name}</ThemedText>
                <ThemedText style={styles.barValue} numberOfLines={1}>
                  ₹{formatNumber(Number(item.total_amount ?? 0), currencyId)}
                </ThemedText>
              </View>
              <View style={styles.barContainer}>
                <View
                 style={[
                  styles.bar,
                  {
                    width: barWidth as DimensionValue,
                    backgroundColor: isDark ? '#4361EE' : '#3D5AF1',
                  },
                ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default function MonthlyChurnScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = Colors[colorScheme].background;
  const cardBackgroundColor = Colors[colorScheme].card;
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const { token, user } = useContext(AuthContext) as AuthContextType;
  
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
    currency_id: user?.currency_id || 1,
    seller_name: '',
    discount_amount: 0,
    discount_origin: '',
    comments: '',
    transaction_type: 0,
    is_income: 0,
    user_id: user?.user_id ? String(user.user_id) : ''
  });
  
  // State for editable summary
  const [monthlySummary, setMonthlySummary] = useState({
    income: 0,
    expenses: 0,
    invested: 0,
    net: 0,
  });

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
    currency_id: user?.currency_id || 1,
    user_id: user?.user_id ? String(user.user_id) : ''
  });
  const [editCategoriesModalVisible, setEditCategoriesModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 for transactions, 1 for investments
  
  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investmentData, setInvestmentData] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  // Add to state:
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Add these state variables inside the MonthlyChurnScreen component
  const [categorySearch, setCategorySearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);

  // Add new state for category management
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<number | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);

  // Add new state for date picker modal
  const [datePickerModalVisible, setDatePickerModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  // Add this state for investment date picker
  const [investmentDatePickerVisible, setInvestmentDatePickerVisible] = useState(false);

  // Add this new state for the SMS reader modal
  const [smsReaderModalVisible, setSmsReaderModalVisible] = useState(false);

  // Add to state:
  const [iosTransactionDatePickerVisible, setIosTransactionDatePickerVisible] = useState(false);
  const [iosInvestmentDatePickerVisible, setIosInvestmentDatePickerVisible] = useState(false);

  // Helper to get user's currency symbol
  const userCurrency = currencies.find(c => c.currency_id === user?.currency_id);
  const currencySymbol = userCurrency ? userCurrency.currency_symbol : '₹';

  // Add this helper function near the top of the component
  const formatDate = (dateString: string) => {
    try {
      // Parse the date and get UTC components
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.log('Invalid date detected');
        return 'Invalid Date';
      }
      
      // Get UTC day and month
      const day = date.getUTCDate();
      const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
      console.log('Day:', day, 'Month:', month);
      
      // Handle special cases for 11, 12, 13
      if (day >= 11 && day <= 13) {
        return `${day}th ${month}`;
      }
      
      // Handle other numbers
      let suffix = 'th';
      if (day % 10 === 1 && day !== 11) {
        suffix = 'st';
      } else if (day % 10 === 2 && day !== 12) {
        suffix = 'nd';
      } else if (day % 10 === 3 && day !== 13) {
        suffix = 'rd';
      }
      
      const result = `${day}${suffix} ${month}`;
      console.log('Formatted result:', result);
      return result;
    } catch (error) {
      console.error('Error in formatDate:', error);
      return 'Invalid Date';
    }
  };

  const formatIndianNumber = (num: number): string => {
    // Convert to integer and then to string
    const numStr = Math.round(num).toString();
    const lastThree = numStr.substring(numStr.length - 3);
    const otherNumbers = numStr.substring(0, numStr.length - 3);
    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherNumbers ? "," : "") + lastThree;
    return formatted;
  };

  // Validation function
  const validateTransaction = () => {
    const errors: {[key: string]: string} = {};
    if (!newTransaction.transaction_date) errors.transaction_date = 'Date is required';
    if (!categorySearch) errors.category_id = 'Category is required';
    if (!newTransaction.amount || newTransaction.amount <= 0) errors.amount = 'Amount is required';
    if (newTransaction.transaction_type === undefined) errors.transaction_type = 'Transaction type is required';
    return errors;
  };

  // Add this new function to handle calculations
  const updateMonthlySummary = (transactions: Transaction[], investments: Investment[]) => {

    const nonIncomeTransactions = transactions.filter(txn => txn.is_income === 0);
    const incomeAmount = incomeValue || 0;

    // Calculate expenses (sum of transactions, subtracting credits)
    const expenses = nonIncomeTransactions.reduce((sum, txn) => {
      const amt = Number(txn.amount) || 0;
      if (txn.transaction_type === 0) {
        return sum + amt;
      } else {
        return sum - amt;
      }
    }, 0);

    // Calculate invested amount
    const investedAmount = investments.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

    // Calculate net amount
    const net = incomeAmount - expenses - investedAmount;

    // Update monthly summary
    setMonthlySummary({
      income: incomeAmount,
      expenses: expenses,
      invested: investedAmount,
      net: net
    });
  };

  // Update fetchTransactions to NOT call updateMonthlySummary
  const fetchTransactions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await transactionApi.getCurrentPeriodTransactions(token);
      setTransactions(data.filter(txn => txn.is_income === 0) || []);
      incomeValue = data.find(txn => txn.is_income === 1)?.amount || 0;
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setMonthlySummary({
        income: 0,
        expenses: 0,
        invested: 0,
        net: 0
      });
      incomeValue = null;
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

  // Add this new function to fetch all subcategories for all categories
  const fetchAllSubCategories = async () => {
    if (!token) return;
    try {
      const allSubCategories: SubCategory[] = [];
      for (const category of categories) {
        const subCategories = await categoryApi.getSubCategories(token, category.category_id);
        allSubCategories.push(...subCategories);
      }
      setSubCategories(allSubCategories);
    } catch (err) {
      console.error('Error fetching all subcategories:', err);
    }
  };

  // Update the useEffect to fetch all subcategories when categories change
  useEffect(() => {
    fetchTransactions();
    fetchInvestments()
    fetchCategories();
    fetchCurrencies();
  }, [token]);
  console.log('User', user);

  // Add new useEffect to fetch subcategories when categories change
  useEffect(() => {
    if (categories.length > 0) {
      fetchAllSubCategories();
    }
  }, [categories]);

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
  const handleSaveSummary = async () => {
    if (!token) return;
    try {
      await transactionApi.upsertIncome(token, monthlySummary.income);
      Alert.alert('Success', 'Income saved for current period.');
      setIsEditingSummary(false);
      // Optionally, refresh transactions or summary here if needed
    } catch (err) {
      console.error('Error saving income:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save income.');
    }
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
  const addInvestment = async () => {
    if (!token || !user?.user_id) return;
    try {
      await investmentApi.addInvestment(token, {
        ...newInvestment,
        user_id: String(user.user_id)
      });
      fetchInvestments();
      setAddInvestmentModalVisible(false);
    } catch (err) {
      console.error('Error adding investment:', err);
      Alert.alert('Error', 'Failed to add investment. Please try again.');
    }
  };

  // Update fetchInvestments to NOT call updateMonthlySummary
  const fetchInvestments = async () => {
    if (!token) return;
    try {
      const data = await investmentApi.getInvestments(token);
      setInvestmentData(data || []);
    } catch (err) {
      console.error('Error fetching investments:', err);
      setInvestmentData([]);
    }
  };

  // Add useEffect to update summary only after both are loaded
  useEffect(() => {
    if ((transactions.length > 0 || investmentData.length > 0) && incomeValue) {
      updateMonthlySummary(transactions, investmentData);
    }
  }, [transactions, investmentData]);

  // Add these helper functions inside the MonthlyChurnScreen component
  const filteredCategories = categories.filter(cat => 
    cat.category_name.toLowerCase().trim().includes(categorySearch.toLowerCase().trim())
  );

  const filteredSubCategories = subCategories.filter(sub => 
    sub.sub_category_name.toLowerCase().trim().includes(subCategorySearch.toLowerCase().trim())
  );

  // Add handlers for category management
  const handleAddCategory = async () => {
    if (!token || !newCategoryName.trim()) return;
    try {
      await categoryApi.addCategory(token, newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
      fetchCategories(); // Refresh categories
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  // Update the edit categories modal visibility handler
  const handleEditCategoriesModalOpen = () => {
    setEditCategoriesModalVisible(true);
    fetchAllSubCategories(); // Fetch all subcategories when modal opens
  };

  // Update the category selection handler
  const handleCategorySelect = async (categoryId: number) => {
    // If we're already adding a subcategory to this category, close it
    if (isAddingSubCategory && selectedCategoryForSub === categoryId) {
      setIsAddingSubCategory(false);
      setSelectedCategoryForSub(null);
    } else {
      // Otherwise, open the subcategory form for this category
      setIsAddingSubCategory(true);
      setSelectedCategoryForSub(categoryId);
    }
    
    try {
      const subCategories = await categoryApi.getSubCategories(token!, categoryId);
      setSubCategories(subCategories);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  // Update handleAddSubCategory to refresh subcategories after adding
  const handleAddSubCategory = async () => {
    if (!token || !selectedCategoryForSub || !newSubCategoryName.trim()) return;
    try {
      await categoryApi.addSubCategory(token, selectedCategoryForSub, newSubCategoryName.trim());
      setNewSubCategoryName('');
      setIsAddingSubCategory(false);
      // Fetch subcategories for the selected category
      const subCategories = await categoryApi.getSubCategories(token, selectedCategoryForSub);
      setSubCategories(subCategories);
    } catch (err) {
      console.error('Error adding subcategory:', err);
      Alert.alert('Error', 'Failed to add subcategory. Please try again.');
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: number) => {
    if (!token) return;
    
    // Validate that the subcategory exists in our local state
    const subcategoryExists = subCategories.some(sub => sub.sub_category_id === subCategoryId);
    if (!subcategoryExists) {
      Alert.alert('Error', 'Subcategory not found. Please refresh the list and try again.');
      return;
    }
    
    Alert.alert(
      'Delete Subcategory',
      'Are you sure you want to delete this subcategory? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryApi.deleteSubCategory(token, subCategoryId);
              // Remove the subcategory from local state immediately
              setSubCategories(prev => prev.filter(sub => sub.sub_category_id !== subCategoryId));
              // Refresh the subcategories list
              if (selectedCategoryForSub) {
                fetchSubCategories(selectedCategoryForSub);
              }
            } catch (err) {
              console.error('Error deleting subcategory:', err);
              const errorMessage = err instanceof Error ? err.message : 'Failed to delete subcategory. Please try again.';
              Alert.alert('Error', errorMessage);
            }
          }
        }
      ]
    );
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!token) return;
    
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? This will also delete all its subcategories. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryApi.deleteCategory(token, categoryId);
              fetchCategories();
            } catch (err) {
              console.error('Error deleting category:', err);
              Alert.alert('Error', 'Failed to delete category. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Add new date picker modal component
  const DatePickerModal = () => (
    <Modal
      visible={datePickerModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setDatePickerModalVisible(false)}
      statusBarTranslucent
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackgroundColor, padding: 20 }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Date</ThemedText>
              <TouchableOpacity onPress={() => setDatePickerModalVisible(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
              </TouchableOpacity>
            </View>
            
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              onChange={(_event: unknown, selectedDate?: Date) => {
                if (selectedDate) {
                  setTempDate(selectedDate);
                  setNewTransaction({ ...newTransaction, transaction_date: selectedDate.toISOString().split('T')[0] });
                  setDatePickerModalVisible(false);
                }
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    // <SafeAreaView style={{ flex: 1, backgroundColor }}>
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
                  value={formatNumber(monthlySummary.income, user?.currency_id || 1)}
                  onChangeText={(text) => {
                    // Remove commas and convert to number
                    const numericValue = parseInt(text.replace(/,/g, '')) || 0;
                    setMonthlySummary({...monthlySummary, income: numericValue});
                  }}
                  keyboardType="numeric"
                />
              ) : (
                <ThemedText style={styles.summaryValue}>₹{formatNumber(monthlySummary.income, user?.currency_id || 1)}</ThemedText>
              )}
            </View>
            
            <View style={styles.summaryItem}>
              <IconSymbol name="arrow.up.circle.fill" size={24} color={isDark ? '#EF4444' : '#F87171'} />
              <ThemedText style={styles.summaryLabel}>Expenses</ThemedText>
              <ThemedText style={styles.summaryValue}>₹{formatNumber(monthlySummary.expenses, user?.currency_id || 1)}</ThemedText>
            </View>
            
            <View style={styles.summaryItem}>
              <IconSymbol name="chart.bar.fill" size={24} color={isDark ? '#8B5CF6' : '#A78BFA'} />
              <ThemedText style={styles.summaryLabel}>Invested</ThemedText>
              <ThemedText style={styles.summaryValue}>₹{formatNumber(monthlySummary.invested, user?.currency_id || 1)}</ThemedText>
            </View>
            
            <View style={styles.summaryItem}>
              <IconSymbol name="chart.pie.fill" size={24} color={isDark ? '#4361EE' : '#3D5AF1'} />
              <ThemedText style={styles.summaryLabel}>Net</ThemedText>
              <ThemedText style={styles.summaryValue}>₹{formatNumber(monthlySummary.net, user?.currency_id || 1)}</ThemedText>
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
          <SpendingByCategory currencyId={user?.currency_id || 1} />
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
            
            {/* Table rows with ScrollView */}
            <ScrollView style={styles.tableScrollView}>
              {transactions.map((transaction) => (
                <TouchableOpacity 
                  key={transaction.transaction_id} 
                  style={styles.tableRow}
                  onPress={() => handleTransactionPress(transaction)}
                >
                  <Text style={[
                    styles.tableCell, 
                    { 
                      flex: 1.2,
                      color: transaction.transaction_type === 1 ? (isDark ? '#10B981' : '#22C55E') : (isDark ? '#fff' : '#000')
                    }
                  ]}>{formatDate(transaction.transaction_date)}</Text>
                  <Text 
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      styles.tableCell, 
                      { 
                        flex: 1.5,
                        color: transaction.transaction_type === 1 ? (isDark ? '#10B981' : '#22C55E') : (isDark ? '#fff' : '#000')
                      }
                    ]}>
                    {categories.find(c => c.category_id === transaction.category_id)?.category_name || 'Unknown'}
                  </Text>
                  <Text 
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      styles.tableCell, 
                      { 
                        flex: 1.5,
                        color: transaction.transaction_type === 1 ? (isDark ? '#10B981' : '#22C55E') : (isDark ? '#fff' : '#000')
                      }
                    ]}>
                    {subCategories.find(sc => sc.sub_category_id === transaction.sub_category_id)?.sub_category_name || 'Unknown'}
                  </Text>
                  <Text 
                    numberOfLines={1}
                    style={[
                      styles.tableCell, 
                      { 
                        flex: 1, 
                        textAlign: 'right',
                        color: transaction.transaction_type === 1 ? (isDark ? '#10B981' : '#22C55E') : (isDark ? '#fff' : '#000')
                      }
                    ]}>₹{formatNumber(transaction.amount, user?.currency_id || 1)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
            
            {/* Table rows with ScrollView */}
            <ScrollView style={styles.tableScrollView}>
              {investmentData.map((investment) => (
                <View key={investment.investment_id} style={styles.tableRow}>
                  <ThemedText style={[styles.tableCell, { flex: 1.2 }]}>{formatDate(investment.investment_date)}</ThemedText>
                  <ThemedText style={[styles.tableCell, { flex: 1.5 }]}>{investment.type}</ThemedText>
                  <ThemedText style={[styles.tableCell, { flex: 1.5 }]}>{investment.name}</ThemedText>
                  <ThemedText style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>₹{formatNumber(investment.amount, user?.currency_id || 1)}</ThemedText>
                </View>
              ))}
            </ScrollView>
          </Card>
        )}
        
        {/* Card 4: Bank Statement Reader */}
        <Card style={styles.card}>
          <TouchableOpacity onPress={() => setSmsReaderModalVisible(true)}>
            <View style={styles.linkContainer}>
              <IconSymbol 
                name="doc.badge.plus" 
                size={24} 
                color={isDark ? '#4361EE' : '#3D5AF1'} 
              />
              <ThemedText style={styles.linkText}>Extract Transaction from Bank Statement</ThemedText>
              <IconSymbol 
                name="chevron.right" 
                size={20} 
                color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} 
              />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Card 5: Upload Bill */}
        <Card style={styles.card}>
          <TouchableOpacity onPress={() => {}}>
            <View style={styles.linkContainer}>
              <IconSymbol 
                name="doc.badge.plus" 
                size={24} 
                color={isDark ? '#4361EE' : '#3D5AF1'} 
              />
              <ThemedText style={styles.linkText}>Upload Bill</ThemedText>
              <IconSymbol 
                name="chevron.right" 
                size={20} 
                color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} 
              />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Card 6: Edit Categories */}
        <Card style={styles.card}>
          <TouchableOpacity onPress={handleEditCategoriesModalOpen}>
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
          statusBarTranslucent
        >
          {selectedTransaction && (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} edges={['top']}>
              <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
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
                      <ThemedText style={styles.modalValue}>{formatDate(selectedTransaction.transaction_date)}</ThemedText>
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
                      <ThemedText style={styles.modalValue}>₹{formatNumber(selectedTransaction.amount, user?.currency_id || 1)}</ThemedText>
                    </View>
                    
                    <View style={styles.modalItem}>
                      <ThemedText style={styles.modalLabel}>Seller Name</ThemedText>
                      <ThemedText style={styles.modalValue}>{selectedTransaction.seller_name}</ThemedText>
                    </View>
                    
                    <View style={styles.modalItem}>
                      <ThemedText style={styles.modalLabel}>Discount Amount</ThemedText>
                      <ThemedText style={styles.modalValue}>
                        {selectedTransaction.discount_amount ? `₹${formatNumber(selectedTransaction.discount_amount, user?.currency_id || 1)}` : 'N/A'}
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
                  
                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity
                      style={[styles.modalDeleteButton, { backgroundColor: isDark ? '#EF4444' : '#F87171' }]}
                      onPress={() => {
                        Alert.alert(
                          'Delete Transaction',
                          'Are you sure you want to delete this transaction? This action cannot be undone.',
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel'
                            },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  await deleteTransaction(selectedTransaction.transaction_id);
                                  setTransactionModalVisible(false);
                                } catch (err) {
                                  console.error('Error deleting transaction:', err);
                                  Alert.alert('Error', 'Failed to delete transaction. Please try again.');
                                }
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <IconSymbol name="trash" size={20} color="#fff" />
                      <ThemedText style={styles.modalDeleteButtonText}>Delete</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }]}
                      onPress={() => setTransactionModalVisible(false)}
                    >
                      <ThemedText style={styles.modalButtonText}>Close</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          )}
        </Modal>
        
        {/* Add Transaction Modal */}
        <AddTransactionModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onSuccess={async () => {
            setAddModalVisible(false);
            await fetchCategories();
            await fetchAllSubCategories();
            await fetchTransactions();
          }}
          isDark={isDark}
          cardBackgroundColor={cardBackgroundColor}
        />
        
        {/* Add Investment Modal */}
        <AddInvestmentModal
          visible={addInvestmentModalVisible}
          onClose={() => setAddInvestmentModalVisible(false)}
          onSuccess={() => {
            setAddInvestmentModalVisible(false);
            fetchInvestments();
          }}
          isDark={isDark}
          cardBackgroundColor={cardBackgroundColor}
        />
        
        {/* Edit Categories Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editCategoriesModalVisible}
          onRequestClose={() => setEditCategoriesModalVisible(false)}
          statusBarTranslucent
        >
          <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <View style={{ flex: 1 }}>
              <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                <TouchableOpacity 
                  onPress={() => setEditCategoriesModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <IconSymbol 
                    name="xmark" 
                    size={24} 
                    color={isDark ? '#fff' : '#000'} 
                  />
                </TouchableOpacity>
                <ThemedText style={styles.modalTitle}>Edit Categories</ThemedText>
              </View>
              
              <ScrollView style={styles.modalContent}>
                {/* Add New Category Section */}
                <View style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <ThemedText style={styles.categoryTitle}>Add New Category</ThemedText>
                    <TouchableOpacity 
                      style={styles.editIcon}
                      onPress={() => setIsAddingCategory(!isAddingCategory)}
                    >
                      <IconSymbol 
                        name={isAddingCategory ? "minus.circle" : "plus.circle"} 
                        size={20} 
                        color={isDark ? '#10B981' : '#22C55E'} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {isAddingCategory && (
                    <View style={styles.addCategoryForm}>
                      <TextInput
                        style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000' }]}
                        placeholder="Enter category name"
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                      />
                      <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: isDark ? '#10B981' : '#22C55E' }]}
                        onPress={handleAddCategory}
                      >
                        <ThemedText style={styles.addButtonText}>Add Category</ThemedText>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Categories List */}
                {categories.map((category) => (
                  <View key={category.category_id} style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                      <ThemedText style={styles.categoryTitle}>{category.category_name}</ThemedText>
                      <View style={styles.categoryActions}>
                        <TouchableOpacity 
                          style={styles.editIcon}
                          onPress={() => handleCategorySelect(category.category_id)}
                        >
                          <IconSymbol 
                            name={isAddingSubCategory && selectedCategoryForSub === category.category_id ? "minus.circle" : "plus.circle"} 
                            size={20} 
                            color={isDark ? '#10B981' : '#22C55E'} 
                          />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.deleteIcon}
                          onPress={() => handleDeleteCategory(category.category_id)}
                        >
                          <IconSymbol name="trash" size={20} color={isDark ? '#EF4444' : '#F87171'} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Add Subcategory Form */}
                    {isAddingSubCategory && selectedCategoryForSub === category.category_id && (
                      <View style={styles.addSubcategoryForm}>
                        <TextInput
                          style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000' }]}
                          placeholder="Enter subcategory name"
                          placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                          value={newSubCategoryName}
                          onChangeText={setNewSubCategoryName}
                        />
                        <TouchableOpacity
                          style={[styles.addButton, { backgroundColor: isDark ? '#10B981' : '#22C55E' }]}
                          onPress={handleAddSubCategory}
                        >
                          <ThemedText style={styles.addButtonText}>Add Subcategory</ThemedText>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Subcategories List */}
                    <View style={styles.subcategoryList}>
                      {subCategories
                        .filter(sub => sub.category_id === category.category_id)
                        .map(subcategory => (
                          <View key={subcategory.sub_category_id} style={styles.subcategoryItem}>
                            <ThemedText style={styles.subcategoryText}>{subcategory.sub_category_name}</ThemedText>
                            <TouchableOpacity 
                              style={styles.deleteIcon}
                              onPress={() => handleDeleteSubCategory(subcategory.sub_category_id)}
                            >
                              <IconSymbol name="trash" size={16} color={isDark ? '#EF4444' : '#F87171'} />
                            </TouchableOpacity>
                          </View>
                        ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Bank Statement Reader Modal */}
        <Modal
          visible={smsReaderModalVisible}
          animationType="slide"
          onRequestClose={() => setSmsReaderModalVisible(false)}
          statusBarTranslucent
        >
          <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}> 
              <TouchableOpacity 
                onPress={() => setSmsReaderModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <IconSymbol 
                  name="xmark" 
                  size={24} 
                  color={isDark ? '#fff' : '#000'} 
                />
              </TouchableOpacity>
              <ThemedText style={styles.modalTitle}>Extract Transaction from Bank Statement</ThemedText>
            </View>
            <BankStatementReader 
              isDark={isDark}
              cardBackgroundColor={cardBackgroundColor}
              borderColor={borderColor}
              cycleStartDate={user?.monthly_start_date ? (() => {
                const today = new Date();
                const startDay = parseInt(user.monthly_start_date);
                const startDate = new Date(today.getFullYear(), today.getMonth(), startDay);
                return startDate;
              })() : new Date()}
              onClose={() => setSmsReaderModalVisible(false)}
            />
          </SafeAreaView>
        </Modal>

        {/* Date Picker Modal */}
        <Modal
          visible={datePickerModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setDatePickerModalVisible(false)}
          statusBarTranslucent
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: cardBackgroundColor, padding: 20 }]}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Select Date</ThemedText>
                  <TouchableOpacity onPress={() => setDatePickerModalVisible(false)}>
                    <IconSymbol name="xmark.circle.fill" size={24} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
                  </TouchableOpacity>
                </View>
                
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="default"
                  onChange={(_event: unknown, selectedDate?: Date) => {
                    if (selectedDate) {
                      setTempDate(selectedDate);
                      setNewTransaction({ ...newTransaction, transaction_date: selectedDate.toISOString().split('T')[0] });
                      setDatePickerModalVisible(false);
                    }
                  }}
                />
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </ScrollView>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBlock: 30,
    marginBottom:80
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
    marginBottom: 16,
  },
  barRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 14,
    flex: 1,
  },
  barValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    flexShrink: 0,
    maxWidth: 100,
    textAlign: 'right',
  },
  barContainer: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 8,
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
    padding: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'transparent', // Ensure header stays visible
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
    paddingRight: 8,
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
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalCloseButton: {
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
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
    gap: 12,
  },
  modalDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  modalDeleteButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  addCategoryForm: {
    marginTop: 8,
    marginBottom: 16,
  },
  addSubcategoryForm: {
    marginTop: 8,
    marginBottom: 16,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartScrollView: {
    maxHeight: 300, // Same height as tables for consistency
  },
  chartContainer: {
    marginTop: 12,
  },
  noDataText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
  },
  radioButtonSelected: {
    borderColor: '#4361EE',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#fff',
  },
  radioLabel: {
    fontSize: 16,
  },
  suggestionContainer: {
    position: 'relative',
    zIndex: 1,
  },
  suggestionList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2,
  },
  suggestionScrollView: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  suggestionItemText: {
    fontSize: 16,
  },
  tableScrollView: {
    maxHeight: 300, // Adjust this value as needed
  },
}); 