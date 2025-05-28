import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, TextInput, ScrollView, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { transactionApi, categoryApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { TransactionFormData, Category, SubCategory } from '@/types';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isDark: boolean;
  cardBackgroundColor: string;
  initialData?: Partial<TransactionFormData>;
}

export function AddTransactionModal({ visible, onClose, onSuccess, isDark, cardBackgroundColor, initialData }: AddTransactionModalProps) {
  const { token, user } = useAuth();
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
    user_id: user?.user_id ? String(user.user_id) : '',
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setNewTransaction(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [tempDate, setTempDate] = useState(new Date());
  const [datePickerModalVisible, setDatePickerModalVisible] = useState(false);
  const [iosDatePickerVisible, setIosDatePickerVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const data = await categoryApi.getCategories(token);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchSubCategories = async (categoryId: number) => {
    if (!token) return;
    try {
      const data = await categoryApi.getSubCategories(token, categoryId);
      setSubCategories(data);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  const validateTransaction = () => {
    const errors: {[key: string]: string} = {};
    if (!newTransaction.transaction_date) errors.transaction_date = 'Date is required';
    if (!categorySearch) errors.category_id = 'Category is required';
    if (!newTransaction.amount || newTransaction.amount <= 0) errors.amount = 'Amount is required';
    if (newTransaction.transaction_type === undefined) errors.transaction_type = 'Transaction type is required';
    return errors;
  };

  const resetForm = () => {
    setNewTransaction({
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
    setCategorySearch('');
    setSubCategorySearch('');
    setFormErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddTransaction = async () => {
    const errors = validateTransaction();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (!token || !user?.user_id) {
        throw new Error('Not authenticated');
      }

      // Check if category exists
      let categoryId = newTransaction.category_id;
      if (!categoryId && categorySearch) {
        // Find category by name
        const existingCategory = categories.find(
          c => c.category_name.toLowerCase() === categorySearch.toLowerCase()
        );
        
        if (existingCategory) {
          categoryId = existingCategory.category_id;
        } else {
          // Create new category
          const newCategory = await categoryApi.addCategory(token, categorySearch);
          categoryId = newCategory.category_id;
          // Refresh categories list
          await fetchCategories();
        }
      }

      // Check if subcategory exists
      let subCategoryId = newTransaction.sub_category_id;
      if (subCategorySearch && !subCategoryId) {
        // Find subcategory by name
        const existingSubCategory = subCategories.find(
          sc => sc.sub_category_name.toLowerCase() === subCategorySearch.toLowerCase()
        );
        
        if (existingSubCategory) {
          subCategoryId = existingSubCategory.sub_category_id;
        } else if (categoryId) {
          // Create new subcategory
          const newSubCategory = await categoryApi.addSubCategory(token, categoryId, subCategorySearch);
          subCategoryId = newSubCategory.sub_category_id;
          // Refresh subcategories list
          await fetchSubCategories(categoryId);
        }
      }

      // Add transaction with the resolved category and subcategory IDs
      await transactionApi.addTransaction(token, {
        ...newTransaction,
        category_id: categoryId,
        sub_category_id: subCategoryId || 0,
        user_id: String(user.user_id)
      });

      // Reset form and close modal
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding transaction:', err);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.category_name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredSubCategories = subCategories.filter(sub => 
    sub.sub_category_name.toLowerCase().includes(subCategorySearch.toLowerCase())
  );

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
              <ThemedText style={styles.modalTitle}>Add Transaction</ThemedText>
              <TouchableOpacity onPress={onClose}>
                <IconSymbol name="xmark.circle.fill" size={24} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalScrollView}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Transaction Type Selection */}
              <View style={styles.formItem}>
                <ThemedText style={styles.formLabel}>Transaction Type *</ThemedText>
                <View style={styles.radioGroup}>
                  <TouchableOpacity 
                    style={[
                      styles.radioButton,
                      newTransaction.transaction_type === 0 && styles.radioButtonSelected,
                      { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }
                    ]}
                    onPress={() => setNewTransaction({ ...newTransaction, transaction_type: 0 })}
                  >
                    <View style={[
                      styles.radioCircle,
                      newTransaction.transaction_type === 0 && styles.radioCircleSelected,
                      { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }
                    ]}>
                      {newTransaction.transaction_type === 0 && (
                        <IconSymbol name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <ThemedText style={styles.radioLabel}>Debit</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.radioButton,
                      newTransaction.transaction_type === 1 && styles.radioButtonSelected,
                      { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }
                    ]}
                    onPress={() => setNewTransaction({ ...newTransaction, transaction_type: 1 })}
                  >
                    <View style={[
                      styles.radioCircle,
                      newTransaction.transaction_type === 1 && styles.radioCircleSelected,
                      { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }
                    ]}>
                      {newTransaction.transaction_type === 1 && (
                        <IconSymbol name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <ThemedText style={styles.radioLabel}>Credit</ThemedText>
                  </TouchableOpacity>
                </View>
                {formErrors.transaction_type && <ThemedText style={styles.errorText}>{formErrors.transaction_type}</ThemedText>}
              </View>

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
                    setTempDate(new Date(newTransaction.transaction_date));
                    if (Platform.OS === 'ios') {
                      setIosDatePickerVisible(true);
                    } else {
                      setDatePickerModalVisible(true);
                    }
                  }}
                >
                  <ThemedText style={{ color: isDark ? '#fff' : '#000' }}>
                    {new Date(newTransaction.transaction_date).toLocaleDateString()}
                  </ThemedText>
                  <IconSymbol 
                    name="calendar" 
                    size={20} 
                    color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} 
                  />
                </TouchableOpacity>
                {formErrors.transaction_date && <ThemedText style={styles.errorText}>{formErrors.transaction_date}</ThemedText>}
              </View>

              {Platform.OS === 'ios' && (
                <Modal
                  visible={iosDatePickerVisible}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setIosDatePickerVisible(false)}
                >
                  <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <View style={{ backgroundColor: cardBackgroundColor, padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                      <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="spinner"
                        onChange={(_event, selectedDate) => {
                          setIosDatePickerVisible(false);
                          if (selectedDate) {
                            setTempDate(selectedDate);
                            setNewTransaction({ ...newTransaction, transaction_date: selectedDate.toISOString().split('T')[0] });
                          }
                        }}
                        style={{ width: '100%' }}
                      />
                      <TouchableOpacity
                        style={{ marginTop: 12, alignItems: 'center' }}
                        onPress={() => setIosDatePickerVisible(false)}
                      >
                        <ThemedText style={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold' }}>Done</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              )}

              {Platform.OS === 'android' && datePickerModalVisible && (
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="default"
                  onChange={(_event, selectedDate) => {
                    setDatePickerModalVisible(false);
                    if (selectedDate) {
                      setTempDate(selectedDate);
                      setNewTransaction({ ...newTransaction, transaction_date: selectedDate.toISOString().split('T')[0] });
                    }
                  }}
                />
              )}

              {/* Category Selection */}
              <View style={styles.formItem}>
                <ThemedText style={styles.formLabel}>Category *</ThemedText>
                <View style={styles.suggestionContainer}>
                  <TextInput
                    style={[styles.formInput, { color: isDark ? '#fff' : '#000' }]}
                    placeholder="Type category name"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                    value={categorySearch}
                    onChangeText={(text) => {
                      setCategorySearch(text);
                      setShowCategoryDropdown(true);
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                  />
                  {showCategoryDropdown && categorySearch.length > 0 && (
                    <View style={[styles.suggestionList, { backgroundColor: cardBackgroundColor }]}>
                      <ScrollView style={styles.suggestionScrollView}>
                        {filteredCategories.map(cat => (
                          <TouchableOpacity
                            key={cat.category_id}
                            style={styles.suggestionItem}
                            onPress={() => {
                              setNewTransaction({ ...newTransaction, category_id: cat.category_id, sub_category_id: 0 });
                              setCategorySearch(cat.category_name);
                              fetchSubCategories(cat.category_id);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <ThemedText style={styles.suggestionItemText}>{cat.category_name}</ThemedText>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
                {formErrors.category_id && <ThemedText style={styles.errorText}>{formErrors.category_id}</ThemedText>}
              </View>

              {/* SubCategory Selection */}
              <View style={styles.formItem}>
                <ThemedText style={styles.formLabel}>SubCategory</ThemedText>
                <View style={styles.suggestionContainer}>
                  <TextInput
                    style={[
                      styles.formInput, 
                      { 
                        color: isDark ? '#fff' : '#000',
                        opacity: categorySearch ? 1 : 0.5 
                      }
                    ]}
                    placeholder="Type subcategory name"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                    value={subCategorySearch}
                    onChangeText={(text) => {
                      setSubCategorySearch(text);
                      setShowSubCategoryDropdown(true);
                    }}
                    onFocus={() => categorySearch && setShowSubCategoryDropdown(true)}
                    editable={!!categorySearch}
                  />
                  {showSubCategoryDropdown && subCategorySearch.length > 0 && (
                    <View style={[styles.suggestionList, { backgroundColor: cardBackgroundColor }]}>
                      <ScrollView style={styles.suggestionScrollView}>
                        {filteredSubCategories.map(sub => (
                          <TouchableOpacity
                            key={sub.sub_category_id}
                            style={styles.suggestionItem}
                            onPress={() => {
                              setNewTransaction({ ...newTransaction, sub_category_id: sub.sub_category_id });
                              setSubCategorySearch(sub.sub_category_name);
                              setShowSubCategoryDropdown(false);
                            }}
                          >
                            <ThemedText style={styles.suggestionItemText}>{sub.sub_category_name}</ThemedText>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
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
                <ThemedText style={styles.formLabel}>Amount (₹) *</ThemedText>
                <TextInput
                  style={[styles.formInput, { color: isDark ? '#fff' : '#000' }]}
                  placeholder="Enter amount"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                  keyboardType="numeric"
                  value={newTransaction.amount ? newTransaction.amount.toString() : ''}
                  onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: parseFloat(text) || 0 })}
                />
                {formErrors.amount && <ThemedText style={styles.errorText}>{formErrors.amount}</ThemedText>}
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
                <ThemedText style={styles.formLabel}>Discount Amount (₹)</ThemedText>
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
                  placeholder="Enter discount origin (e.g., coupon, cashback)"
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
                onPress={handleAddTransaction}
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
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
  },
}); 