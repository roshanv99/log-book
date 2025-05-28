import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Platform, ViewStyle } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as DocumentPicker from 'expo-document-picker';

interface BankStatementReaderProps {
  isDark: boolean;
  cardBackgroundColor: string;
  borderColor: string;
}

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

export function BankStatementReader({ isDark, cardBackgroundColor, borderColor }: BankStatementReaderProps) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handlePickDocument = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        Alert.alert(
          'File Selected',
          `Selected file: ${result.assets[0].name}\n\nNote: PDF parsing functionality will be implemented in the next update.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
      console.error('Document picker error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={[styles.card, { backgroundColor: cardBackgroundColor }] as unknown as ViewStyle}>
        <ThemedText style={styles.cardTitle}>Extract Transactions</ThemedText>
        
        <View style={styles.dateContainer}>
          <TouchableOpacity 
            style={[styles.dateButton, { backgroundColor: cardBackgroundColor, borderColor }]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <ThemedText>Start Date: {startDate.toLocaleDateString()}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dateButton, { backgroundColor: cardBackgroundColor, borderColor }]}
            onPress={() => setShowEndDatePicker(true)}
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

        {showEndDatePicker && (
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

      <Card style={[styles.card, { backgroundColor: cardBackgroundColor }] as unknown as ViewStyle}>
        <ThemedText style={styles.cardTitle}>Extracted Transactions</ThemedText>
        
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <View key={index} style={[styles.transactionItem, { borderColor }]}>
              <View style={styles.transactionHeader}>
                <ThemedText style={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleDateString()}
                </ThemedText>
                <ThemedText style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'credit' ? '#10B981' : '#EF4444' }
                ]}>
                  {transaction.type === 'credit' ? '+' : '-'}₹{Math.abs(transaction.amount)}
                </ThemedText>
              </View>
              <ThemedText style={styles.transactionDescription}>{transaction.description}</ThemedText>
            </View>
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
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
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
  transactionItem: {
    padding: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionDescription: {
    fontSize: 14,
    opacity: 0.8,
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