import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, TextInput, ScrollView, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { investmentApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { InvestmentFormData } from '@/types';

interface AddInvestmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isDark: boolean;
  cardBackgroundColor: string;
  initialData?: Partial<InvestmentFormData>;
}

const INVESTMENT_TYPES = [
  'Mutual Funds',
  'Stocks',
  'Fixed Deposits',
  'Chit Fund'
];

export function AddInvestmentModal({ visible, onClose, onSuccess, isDark, cardBackgroundColor, initialData }: AddInvestmentModalProps) {
  console.log('AddInvestmentModal rendered with visible:', visible);
  const { token, user } = useAuth();
  const [newInvestment, setNewInvestment] = useState<InvestmentFormData>({
    investment_date: new Date().toISOString().split('T')[0],
    type: '',
    name: '',
    amount: 0,
    currency_id: user?.currency_id || 1,
    user_id: user?.user_id ? String(user.user_id) : '',
    ...initialData
  });

  const [investmentDatePickerVisible, setInvestmentDatePickerVisible] = useState(false);
  const [iosInvestmentDatePickerVisible, setIosInvestmentDatePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const addInvestment = async () => {
    if (!token || !user?.user_id) return;
    try {
      await investmentApi.addInvestment(token, {
        ...newInvestment,
        user_id: String(user.user_id)
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding investment:', err);
      Alert.alert('Error', 'Failed to add investment. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Investment',
      'Are you sure you want to delete this investment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onSuccess();
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: cardBackgroundColor }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add Investment</ThemedText>
              <TouchableOpacity onPress={onClose}>
                <IconSymbol name="xmark.circle.fill" size={24} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScrollView}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Date Selection */}
              <View style={styles.formItem}>
                <ThemedText style={styles.formLabel}>Date *</ThemedText>
                <TouchableOpacity 
                  style={[styles.formInput, { 
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }]}
                  onPress={() => {
                    setTempDate(new Date(newInvestment.investment_date));
                    if (Platform.OS === 'ios') {
                      setIosInvestmentDatePickerVisible(true);
                    } else {
                      setInvestmentDatePickerVisible(true);
                    }
                  }}
                >
                  <ThemedText style={{ color: isDark ? '#fff' : '#000' }}>
                    {new Date(newInvestment.investment_date).toLocaleDateString()}
                  </ThemedText>
                  <IconSymbol 
                    name="calendar" 
                    size={20} 
                    color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} 
                  />
                </TouchableOpacity>
              </View>

              {Platform.OS === 'ios' && (
                <Modal
                  visible={iosInvestmentDatePickerVisible}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setIosInvestmentDatePickerVisible(false)}
                >
                  <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <View style={{ backgroundColor: cardBackgroundColor, padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                      <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="spinner"
                        onChange={(_event, selectedDate) => {
                          setIosInvestmentDatePickerVisible(false);
                          if (selectedDate) {
                            setTempDate(selectedDate);
                            setNewInvestment({ ...newInvestment, investment_date: selectedDate.toISOString().split('T')[0] });
                          }
                        }}
                        style={{ width: '100%' }}
                      />
                      <TouchableOpacity
                        style={{ marginTop: 12, alignItems: 'center' }}
                        onPress={() => setIosInvestmentDatePickerVisible(false)}
                      >
                        <ThemedText style={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold' }}>Done</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              )}

              {Platform.OS === 'android' && investmentDatePickerVisible && (
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="default"
                  onChange={(_event, selectedDate) => {
                    setInvestmentDatePickerVisible(false);
                    if (selectedDate) {
                      setTempDate(selectedDate);
                      setNewInvestment({ ...newInvestment, investment_date: selectedDate.toISOString().split('T')[0] });
                    }
                  }}
                />
              )}

              {/* Investment Type */}
              <View style={styles.formItem}>
                <ThemedText style={styles.formLabel}>Type *</ThemedText>
                <View style={[styles.formInput, { padding: 0 }]}> 
                  <Picker
                    selectedValue={newInvestment.type}
                    onValueChange={(value) => setNewInvestment({ ...newInvestment, type: value })}
                    style={{ color: isDark ? '#fff' : '#000' }}
                  >
                    <Picker.Item label="Select type" value="" />
                    {INVESTMENT_TYPES.map((type) => (
                      <Picker.Item key={type} label={type} value={type} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Investment Name */}
              <View style={styles.formItem}>
                <ThemedText style={styles.formLabel}>Name *</ThemedText>
                <TextInput
                  style={[styles.formInput, { color: isDark ? '#fff' : '#000' }]}
                  placeholder="Enter investment name"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                  value={newInvestment.name}
                  onChangeText={(text) => setNewInvestment({ ...newInvestment, name: text })}
                />
              </View>

              {/* Amount */}
              <View style={styles.formItem}>
                <ThemedText style={styles.formLabel}>Amount (₹) *</ThemedText>
                <TextInput
                  style={[styles.formInput, { color: isDark ? '#fff' : '#000' }]}
                  placeholder="Enter amount"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                  keyboardType="numeric"
                  value={newInvestment.amount ? newInvestment.amount.toString() : ''}
                  onChangeText={(text) => setNewInvestment({ ...newInvestment, amount: parseFloat(text) || 0 })}
                />
              </View>

              <ThemedText style={styles.requiredNote}>* Required fields</ThemedText>
            </ScrollView>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { 
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  backgroundColor: 'transparent'
                }]}
                onPress={onClose}
              >
                <ThemedText style={[styles.modalButtonText, { color: isDark ? '#fff' : '#000' }]}>Close</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }]}
                onPress={addInvestment}
              >
                <ThemedText style={[styles.modalButtonText, { color: '#fff' }]}>Add</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontWeight: '600',
  }
}); 