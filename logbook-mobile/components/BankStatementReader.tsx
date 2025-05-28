import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Platform, ViewStyle, Modal, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as DocumentPicker from 'expo-document-picker';
import { API_URL } from '@/config';
import { useAuth } from '@/context/AuthContext';
import { transactionApi, investmentApi } from '@/services/api';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { AddInvestmentModal } from '@/components/AddInvestmentModal';

interface BankStatementReaderProps {
  isDark: boolean;
  cardBackgroundColor: string;
  borderColor: string;
  cycleStartDate: Date;
  onClose: () => void;
}

interface Transaction {
  transaction_date: string;
  transaction_name: string;
  amount: number;
  transaction_type: number;
  currency_id: number;
  user_id: string;
  code?: string;
}

export function BankStatementReader({ isDark, cardBackgroundColor, borderColor, cycleStartDate, onClose }: BankStatementReaderProps) {
  const { token, user } = useAuth();
  const [startDate, setStartDate] = useState(cycleStartDate);
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [iosPickerVisible, setIosPickerVisible] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [addTransactionModalVisible, setAddTransactionModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [addInvestmentModalVisible, setAddInvestmentModalVisible] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Transaction | null>(null);

  useEffect(() => {
    console.log('cycleStartDate', cycleStartDate);
    setStartDate(cycleStartDate);
  }, [cycleStartDate]);

  const handlePickDocument = async () => {
    try {
      if (!token) {
        Alert.alert('Error', 'Please login to upload bank statements');
        return;
      }

      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);

        // Create form data
        const formData = new FormData();
        formData.append('bankStatement', {
          uri: file.uri,
          type: 'application/pdf',
          name: file.name
        } as any);

        // Send to API
        const response = await fetch(`${API_URL}/bank-statement/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();
        
        if (response.ok) {
          // Filter transactions based on cycleStartDate
          const filteredTransactions = data.transactions.filter((transaction: Transaction) => {
            const transactionDate = new Date(transaction.transaction_date);
            return transactionDate >= cycleStartDate;
          });
          setTransactions(filteredTransactions);
          Alert.alert(
            'Success',
            'Bank statement processed successfully',
            [{ text: 'OK' }]
          );
        } else {
          throw new Error(data.message || 'Failed to process bank statement');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process bank statement');
      console.error('Document processing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAsTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setAddTransactionModalVisible(true);
  };

  const handleAddAsInvestment = (transaction: Transaction) => {
    console.log('handleAddAsInvestment called with transaction:', transaction);
    setSelectedInvestment(transaction);
    setAddInvestmentModalVisible(true);
    console.log('Modal visibility set to:', true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTransactions(prev => prev.filter(t => t !== transaction));
          }
        }
      ]
    );
  };

  const handleTransactionSuccess = () => {
    if (selectedTransaction) {
      setTransactions(prev => prev.filter(t => t !== selectedTransaction));
      setSelectedTransaction(null);
    }
  };

  const handleInvestmentSuccess = () => {
    if (selectedInvestment) {
      setTransactions(prev => prev.filter(t => t !== selectedInvestment));
      setSelectedInvestment(null);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={[styles.card, { backgroundColor: cardBackgroundColor }] as unknown as ViewStyle}>
        <ThemedText style={styles.cardTitle}>Extract Transactions</ThemedText>
        
        <View style={styles.dateContainer}>
          <View 
            style={[styles.dateButton, { backgroundColor: cardBackgroundColor, borderColor, opacity: 0.7 }]}
          >
            <ThemedText>Start Date: {startDate.toLocaleDateString()}</ThemedText>
          </View>

          <TouchableOpacity 
            style={[styles.dateButton, { backgroundColor: cardBackgroundColor, borderColor }]}
            onPress={() => {
              if (Platform.OS === 'ios') {
                setIosPickerVisible(true);
              } else {
                setShowEndDatePicker(true);
              }
            }}
          >
            <ThemedText>End Date: {endDate.toLocaleDateString()}</ThemedText>
          </TouchableOpacity>
        </View>

        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}

        {Platform.OS === 'android' && showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
          />
        )}

        {Platform.OS === 'ios' && (
          <Modal
            visible={iosPickerVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIosPickerVisible(false)}
          >
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <View style={{ backgroundColor: cardBackgroundColor, padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="spinner"
                  onChange={(_event, selectedDate) => {
                    setIosPickerVisible(false);
                    if (selectedDate) {
                      setEndDate(selectedDate);
                    }
                  }}
                  style={{ width: '100%' }}
                />
                <TouchableOpacity
                  style={{ marginTop: 12, alignItems: 'center' }}
                  onPress={() => setIosPickerVisible(false)}
                >
                  <ThemedText style={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold' }}>Done</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        <TouchableOpacity 
          style={[styles.uploadButton, { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }]}
          onPress={handlePickDocument}
          disabled={isLoading}
        >
          <IconSymbol 
            name="doc.badge.plus" 
            size={20} 
            color="#fff" 
            style={styles.uploadIcon}
          />
          <ThemedText style={styles.uploadButtonText}>
            {isLoading ? 'Processing...' : 'Upload Bank Statement'}
          </ThemedText>
        </TouchableOpacity>
      </Card>

      <ScrollView style={styles.transactionsContainer}>
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <Card key={index} style={[styles.transactionCard, { backgroundColor: cardBackgroundColor }] as unknown as ViewStyle}>
              <View style={styles.transactionHeader}>
                <ThemedText style={styles.transactionName}>{transaction.transaction_name}</ThemedText>
                <ThemedText style={[
                  styles.transactionAmount,
                  { color: transaction.transaction_type === 1 ? '#10B981' : '#EF4444' }
                ]}>
                  {transaction.transaction_type === 1 ? '+' : '-'}₹{Math.abs(transaction.amount)}
                </ThemedText>
              </View>
              <ThemedText style={styles.transactionDate}>
                {new Date(transaction.transaction_date).toLocaleDateString()}
              </ThemedText>
              <View style={styles.transactionActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }]}
                  onPress={() => handleAddAsTransaction(transaction)}
                >
                  <ThemedText style={styles.actionButtonText}>Add as Transaction</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: isDark ? '#10B981' : '#22C55E' }]}
                  onPress={() => handleAddAsInvestment(transaction)}
                >
                  <ThemedText style={styles.actionButtonText}>Add as Investment</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: isDark ? '#EF4444' : '#F87171' }]}
                  onPress={() => handleDeleteTransaction(transaction)}
                >
                  <ThemedText style={styles.actionButtonText}>Delete</ThemedText>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol 
              name="doc.text" 
              size={40} 
              color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} 
            />
            <ThemedText style={styles.noTransactions}>
              No transactions extracted yet. Upload a bank statement to begin.
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <AddTransactionModal
        visible={addTransactionModalVisible}
        onClose={() => {
          setAddTransactionModalVisible(false);
          setSelectedTransaction(null);
        }}
        onSuccess={handleTransactionSuccess}
        isDark={isDark}
        cardBackgroundColor={cardBackgroundColor}
        initialData={selectedTransaction ? {
          transaction_date: selectedTransaction.transaction_date,
          transaction_name: selectedTransaction.transaction_name,
          amount: selectedTransaction.amount,
          transaction_type: selectedTransaction.transaction_type,
          currency_id: selectedTransaction.currency_id,
          user_id: selectedTransaction.user_id,
          comments: selectedTransaction.code,
          category_id: 0,
          sub_category_id: 0,
          seller_name: '',
          discount_amount: 0,
          discount_origin: '',
          is_income: 0
        } : undefined}
      />

      <AddInvestmentModal
        visible={addInvestmentModalVisible}
        onClose={() => {
          setAddInvestmentModalVisible(false);
          setSelectedInvestment(null);
        }}
        onSuccess={handleInvestmentSuccess}
        isDark={isDark}
        cardBackgroundColor={cardBackgroundColor}
        initialData={selectedInvestment ? {
          investment_date: selectedInvestment.transaction_date,
          type: 'Other',
          name: selectedInvestment.transaction_name,
          amount: selectedInvestment.amount,
          currency_id: selectedInvestment.currency_id,
          user_id: selectedInvestment.user_id
        } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateContainer: {
    gap: 12,
    marginBottom: 16,
  },
  dateButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  uploadButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionsContainer: {
    flex: 1,
  },
  transactionCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  noTransactions: {
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
}); 