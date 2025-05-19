import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Sample query results
const queryResults = [
  { id: '1', date: '2023-06-15', description: 'Restaurant Bill', amount: 82.50, category: 'Food' },
  { id: '2', date: '2023-06-05', description: 'Grocery Shopping', amount: 157.32, category: 'Food' },
  { id: '3', date: '2023-06-01', description: 'Gas Station', amount: 45.75, category: 'Transportation' },
  { id: '4', date: '2023-05-28', description: 'Movie Tickets', amount: 32.00, category: 'Entertainment' },
  { id: '5', date: '2023-05-25', description: 'Online Purchase', amount: 89.99, category: 'Shopping' },
];

export default function QueryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = Colors[colorScheme].background;
  const cardBackgroundColor = Colors[colorScheme].card;
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  const categories = ['All', 'Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities'];
  
  // Filter results based on search query and category
  const filteredResults = queryResults.filter(item => {
    const matchesSearch = 
      searchQuery === '' || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <ScrollView style={styles.container}>
        <ThemedText style={styles.header}>Query Transactions</ThemedText>
        
        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <IconSymbol name="magnifyingglass" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#fff' : '#000' }]}
            placeholder="Search transactions..."
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                { 
                  backgroundColor: filterCategory === category 
                    ? (isDark ? '#4361EE' : '#3D5AF1')
                    : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                }
              ]}
              onPress={() => setFilterCategory(category)}
            >
              <ThemedText 
                style={[
                  styles.categoryText,
                  filterCategory === category && { color: '#fff' }
                ]}
              >
                {category}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Results */}
        <View style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText style={styles.cardTitle}>
            {filteredResults.length > 0 
              ? `Found ${filteredResults.length} transaction${filteredResults.length === 1 ? '' : 's'}`
              : 'No transactions found'
            }
          </ThemedText>
          
          {filteredResults.length > 0 ? (
            <>
              <View style={styles.resultsHeader}>
                <ThemedText style={[styles.headerCell, { flex: 1 }]}>Date</ThemedText>
                <ThemedText style={[styles.headerCell, { flex: 2 }]}>Description</ThemedText>
                <ThemedText style={[styles.headerCell, { flex: 1, textAlign: 'right' }]}>Amount</ThemedText>
              </View>
              
              {filteredResults.map(item => (
                <View key={item.id} style={styles.resultItem}>
                  <ThemedText style={[styles.resultCell, { flex: 1 }]}>{item.date}</ThemedText>
                  <View style={{ flex: 2 }}>
                    <ThemedText style={styles.resultDescription}>{item.description}</ThemedText>
                    <ThemedText style={styles.resultCategory}>{item.category}</ThemedText>
                  </View>
                  <ThemedText style={[styles.resultCell, styles.resultAmount, { flex: 1 }]}>
                    ${item.amount.toFixed(2)}
                  </ThemedText>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="doc.text.magnifyingglass" size={40} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} />
              <ThemedText style={styles.emptyText}>
                No transactions match your search criteria
              </ThemedText>
            </View>
          )}
        </View>
        
        {/* Advanced Options */}
        <View style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText style={styles.cardTitle}>Advanced Query Options</ThemedText>
          
          <View style={styles.advancedOption}>
            <IconSymbol name="calendar" size={20} color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'} />
            <ThemedText style={styles.advancedOptionText}>Date Range</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
          </View>
          
          <View style={styles.advancedOption}>
            <IconSymbol name="dollarsign.circle" size={20} color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'} />
            <ThemedText style={styles.advancedOptionText}>Amount Range</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
          </View>
          
          <View style={styles.advancedOption}>
            <IconSymbol name="tag" size={20} color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'} />
            <ThemedText style={styles.advancedOptionText}>Category Selection</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
          </View>
          
          <TouchableOpacity 
            style={[
              styles.exportButton,
              { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }
            ]}
          >
            <IconSymbol name="square.and.arrow.down" size={20} color="#fff" />
            <ThemedText style={styles.exportButtonText}>Export Results</ThemedText>
          </TouchableOpacity>
        </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  categoryContainer: {
    paddingBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontWeight: '500',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultsHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerCell: {
    fontWeight: '600',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  resultCell: {
    fontSize: 14,
  },
  resultDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultCategory: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  resultAmount: {
    textAlign: 'right',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    opacity: 0.5,
  },
  advancedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  advancedOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
}); 