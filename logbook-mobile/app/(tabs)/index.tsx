import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText style={styles.heading}>Logbook</ThemedText>
          <ThemedText style={styles.subheading}>
            Welcome back, {user?.username || 'User'}!
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Your Profile</ThemedText>
          <View style={styles.divider} />
          
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].tint} />
          ) : (
            <>
              <View style={styles.profileItem}>
                <ThemedText style={styles.label}>Username:</ThemedText>
                <ThemedText style={styles.value}>{user?.username}</ThemedText>
              </View>
              <View style={styles.profileItem}>
                <ThemedText style={styles.label}>Email:</ThemedText>
                <ThemedText style={styles.value}>{user?.email}</ThemedText>
              </View>
              {user?.firstName && (
                <View style={styles.profileItem}>
                  <ThemedText style={styles.label}>First Name:</ThemedText>
                  <ThemedText style={styles.value}>{user.firstName}</ThemedText>
                </View>
              )}
              {user?.lastName && (
                <View style={styles.profileItem}>
                  <ThemedText style={styles.label}>Last Name:</ThemedText>
                  <ThemedText style={styles.value}>{user.lastName}</ThemedText>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Recent Activity</ThemedText>
          <View style={styles.divider} />
          <ThemedText style={styles.emptyState}>No recent activity to show.</ThemedText>
        </View>

        <TouchableOpacity 
          style={[
            styles.logoutButton, 
            { backgroundColor: isDark ? '#444' : '#e0e0e0' }
          ]} 
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={isDark ? '#fff' : '#000'} />
          ) : (
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    opacity: 0.8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    flex: 1,
    fontWeight: '500',
  },
  value: {
    flex: 2,
  },
  emptyState: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
    marginVertical: 16,
  },
  logoutButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  logoutText: {
    fontWeight: '600',
  },
});
