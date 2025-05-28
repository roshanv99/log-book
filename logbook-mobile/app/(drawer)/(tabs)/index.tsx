import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/context/AuthContext';
import { transactionApi } from '@/services/api';

const screenWidth = Dimensions.get('window').width;

// Sample data for savings and investments
const savingsData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [3000, 3500, 4000, 3800, 4200, 4500],
      color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
      strokeWidth: 2,
    },
    {
      data: [5000, 5500, 6000, 5800, 6200, 6500],
      color: (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,
      strokeWidth: 2,
    },
  ],
  legend: ['Savings', 'Investments'],
};

const SpendingByCategory = () => {
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
    <View style={styles.chartContainer}>
      {safeCategoryData.map((item) => {
        const barWidth = (item.total_amount / maxCategoryAmount) * 80;
        return (
          <View key={item.category_id} style={styles.barGroup}>
            <View style={styles.barRow}>
              <ThemedText style={styles.barLabel}>{item.category_name}</ThemedText>
              <ThemedText style={styles.barValue} numberOfLines={1}>
                ₹{Number(item.total_amount ?? 0).toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${barWidth}%`,
                    backgroundColor: isDark ? '#4361EE' : '#3D5AF1',
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default function FinanceDashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [timePeriod, setTimePeriod] = useState('6months');

  const chartConfig = {
    backgroundGradientFrom: isDark ? Colors.dark.card : Colors.light.card,
    backgroundGradientTo: isDark ? Colors.dark.card : Colors.light.card,
    color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForLabels: {
      fill: isDark ? '#fff' : '#000',
    },
    propsForBackgroundLines: {
      stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.header}>Finance Dashboard</ThemedText>
      
      {/* Card 1: Savings and Investment Charts */}
      <Card style={styles.card}>
        <ThemedText style={styles.cardTitle}>Savings & Investments</ThemedText>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              timePeriod === '6months' && styles.periodButtonActive,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
            onPress={() => setTimePeriod('6months')}
          >
            <ThemedText style={[
              styles.periodButtonText,
              timePeriod === '6months' && styles.periodButtonTextActive
            ]}>
              6 Months
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              timePeriod === '12months' && styles.periodButtonActive,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
            onPress={() => setTimePeriod('12months')}
          >
            <ThemedText style={[
              styles.periodButtonText,
              timePeriod === '12months' && styles.periodButtonTextActive
            ]}>
              12 Months
            </ThemedText>
          </TouchableOpacity>
        </View>
        <LineChart
          data={savingsData}
          width={screenWidth - 72}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Card>

      {/* Card 2: Expenses by Category */}
      <Card style={styles.card}>
        <ThemedText style={styles.cardTitle}>Expenses by Category</ThemedText>
        <SpendingByCategory />
      </Card>

      {/* Card 3: Insights */}
      <Card style={styles.card}>
        <ThemedText style={styles.cardTitle}>Financial Insights</ThemedText>
        <View style={styles.insightsContainer}>
          <View style={[styles.insightItem, { backgroundColor: isDark ? '#1E3A8A' : '#DBEAFE' }]}>
            <ThemedText style={[styles.insightText, { color: isDark ? '#93C5FD' : '#1E40AF' }]}>
              Your savings have increased by 15% this month!
            </ThemedText>
          </View>
          <View style={[styles.insightItem, { backgroundColor: isDark ? '#064E3B' : '#D1FAE5' }]}>
            <ThemedText style={[styles.insightText, { color: isDark ? '#6EE7B7' : '#065F46' }]}>
              You're on track to reach your investment goals.
            </ThemedText>
          </View>
          <View style={[styles.insightItem, { backgroundColor: isDark ? '#78350F' : '#FEF3C7' }]}>
            <ThemedText style={[styles.insightText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
              Consider reducing entertainment expenses by 20%.
            </ThemedText>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    marginBottom: 80,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#4361EE',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  chart: {
    marginVertical: 4,
    borderRadius: 16,
  },
  insightsContainer: {
    gap: 12,
  },
  insightItem: {
    padding: 16,
    borderRadius: 8,
  },
  insightText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    marginTop: 8,
  },
  barGroup: {
    marginBottom: 12,
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
    fontWeight: '500',
    marginLeft: 8,
  },
  barContainer: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
}); 