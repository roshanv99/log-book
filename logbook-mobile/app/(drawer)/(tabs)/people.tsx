import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Searchbar } from 'react-native-paper';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/context/AuthContext';
import { formatNumber } from '@/utils/stringUtils';

interface Person {
  id: number;
  name: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  amount: number;
  transactions: Transaction[];
}

interface Transaction {
  id: number;
  amount: number;
  date: string;
  description: string;
}

export default function PeopleScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = Colors[colorScheme].background;
  const cardBackgroundColor = Colors[colorScheme].card;
  const { user } = useAuth();

  // State for people data
  const [people, setPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  // State for new person form
  const [newPerson, setNewPerson] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
  });

  // Filter people based on search query
  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding a new person
  const handleAddPerson = () => {
    if (!newPerson.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    const person: Person = {
      id: Date.now(),
      name: newPerson.name.trim(),
      gender: newPerson.gender,
      amount: 0,
      transactions: [],
    };

    setPeople([...people, person]);
    setNewPerson({ name: '', gender: 'male' });
    setIsAddModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView}>
        {/* Card 1: People who owe money */}
        <Card style={styles.card}>
          <ThemedText style={styles.cardTitle}>People Who Owe</ThemedText>
          {people
            .filter(person => person.amount > 0)
            .map(person => (
              <TouchableOpacity
                key={person.id}
                style={styles.personRow}
                onPress={() => {
                  setSelectedPerson(person);
                  setIsDetailsModalVisible(true);
                }}
              >
                <View style={styles.personInfo}>
                  <IconSymbol
                    name={person.gender === 'male' ? 'person.fill' : 'person.fill'}
                    size={24}
                    color={isDark ? '#10B981' : '#22C55E'}
                  />
                  <ThemedText style={styles.personName}>{person.name}</ThemedText>
                </View>
                <ThemedText style={[styles.amount, { color: isDark ? '#10B981' : '#22C55E' }]}>
                  ₹{formatNumber(person.amount, user?.currency_id || 1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
        </Card>

        {/* Card 2: All People */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>All People</ThemedText>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }]}
              onPress={() => setIsAddModalVisible(true)}
            >
              <IconSymbol name="plus" size={16} color="#fff" />
              <ThemedText style={styles.addButtonText}>Add</ThemedText>
            </TouchableOpacity>
          </View>

          <Searchbar
            placeholder="Search people"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={isDark ? '#fff' : '#000'}
            inputStyle={{ color: isDark ? '#fff' : '#000' }}
          />

          {filteredPeople.map(person => (
            <TouchableOpacity
              key={person.id}
              style={styles.personRow}
              onPress={() => {
                setSelectedPerson(person);
                setIsDetailsModalVisible(true);
              }}
            >
              <View style={styles.personInfo}>
                <IconSymbol
                  name={person.gender === 'male' ? 'person.fill' : 'person.fill'}
                  size={24}
                  color={person.amount >= 0 ? (isDark ? '#10B981' : '#22C55E') : (isDark ? '#EF4444' : '#F87171')}
                />
                <ThemedText style={styles.personName}>{person.name}</ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.amount,
                  { color: person.amount >= 0 ? (isDark ? '#10B981' : '#22C55E') : (isDark ? '#EF4444' : '#F87171') }
                ]}
              >
                ₹{formatNumber(Math.abs(person.amount), user?.currency_id || 1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>

      {/* Add Person Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackgroundColor }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add Person</ThemedText>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Name</ThemedText>
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
                placeholder="Enter name"
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                value={newPerson.name}
                onChangeText={(text) => setNewPerson({ ...newPerson, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Gender</ThemedText>
              <View style={styles.genderOptions}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    newPerson.gender === 'male' && { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }
                  ]}
                  onPress={() => setNewPerson({ ...newPerson, gender: 'male' })}
                >
                  <ThemedText style={[styles.genderText, newPerson.gender === 'male' && { color: '#fff' }]}>
                    Male
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    newPerson.gender === 'female' && { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }
                  ]}
                  onPress={() => setNewPerson({ ...newPerson, gender: 'female' })}
                >
                  <ThemedText style={[styles.genderText, newPerson.gender === 'female' && { color: '#fff' }]}>
                    Female
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }]}
              onPress={handleAddPerson}
            >
              <ThemedText style={styles.saveButtonText}>Add Person</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Person Details Modal */}
      <Modal
        visible={isDetailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDetailsModalVisible(false)}
      >
        {selectedPerson && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBackgroundColor }]}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Transaction Details</ThemedText>
                <TouchableOpacity onPress={() => setIsDetailsModalVisible(false)}>
                  <IconSymbol name="xmark.circle.fill" size={24} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.transactionsList}>
                {selectedPerson.transactions.map(transaction => (
                  <Card key={transaction.id} style={styles.transactionCard}>
                    <View style={styles.transactionHeader}>
                      <ThemedText style={styles.transactionDate}>{transaction.date}</ThemedText>
                      <ThemedText
                        style={[
                          styles.transactionAmount,
                          { color: transaction.amount >= 0 ? (isDark ? '#10B981' : '#22C55E') : (isDark ? '#EF4444' : '#F87171') }
                        ]}
                      >
                        ₹{formatNumber(Math.abs(transaction.amount), user?.currency_id || 1)}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.transactionDescription}>
                      {transaction.description}
                    </ThemedText>
                  </Card>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
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
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchBar: {
    marginBottom: 16,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personName: {
    fontSize: 16,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  genderText: {
    fontSize: 16,
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  transactionsList: {
    maxHeight: '80%',
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDescription: {
    fontSize: 14,
  },
}); 