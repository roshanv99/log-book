import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Switch, ScrollView, TouchableOpacity, Alert, Appearance } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme, toggleColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';

// Define types for settings items
type BaseSettingItem = {
  icon: string;
  label: string;
};

type ToggleSettingItem = BaseSettingItem & {
  type: 'toggle';
  value: boolean;
  onToggle: (value: boolean) => void;
};

type ActionSettingItem = BaseSettingItem & {
  onPress: () => void;
};

type StaticSettingItem = BaseSettingItem & {
  value: string;
  static: boolean;
};

type SettingItem = ToggleSettingItem | ActionSettingItem | StaticSettingItem;

type SettingSection = {
  title: string;
  items: SettingItem[];
};

const THEME_STORAGE_KEY = '@theme_mode';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout } = useAuth();
  
  // Settings states
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(isDark);
  
  // Effect to update dark mode state when system preference changes
  useEffect(() => {
    setDarkMode(isDark);
  }, [isDark]);
  
  // Function to toggle dark mode
  const toggleDarkMode = async (value: boolean) => {
    setDarkMode(value);
    
    try {
      // Apply the theme change
      const newTheme = value ? 'dark' : 'light';
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      Appearance.setColorScheme(newTheme);
      
      // Force a re-render
      setTimeout(() => {
        if (value !== isDark) {
          setDarkMode(value);
        }
      }, 100);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };
  
  const settingsSections: SettingSection[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person.fill',
          label: 'Profile Information',
          onPress: () => Alert.alert('Profile', 'Profile editing will be available soon')
        },
        {
          icon: 'lock.fill',
          label: 'Security',
          onPress: () => Alert.alert('Security', 'Security settings will be available soon')
        },
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'bell.fill',
          label: 'Notifications',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications
        },
        {
          icon: 'moon.fill',
          label: 'Dark Mode',
          type: 'toggle',
          value: darkMode,
          onToggle: toggleDarkMode
        },
      ]
    },
    {
      title: 'Help & Support',
      items: [
        {
          icon: 'questionmark.circle.fill',
          label: 'Help Center',
          onPress: () => Alert.alert('Help', 'Help content will be available soon')
        },
        {
          icon: 'envelope.fill',
          label: 'Contact Us',
          onPress: () => Alert.alert('Contact', 'Contact information will be available soon')
        },
      ]
    },
    {
      title: 'About',
      items: [
        {
          icon: 'info.circle.fill',
          label: 'App Version',
          value: '1.0.0',
          static: true
        },
        {
          icon: 'doc.text.fill',
          label: 'Terms of Service',
          onPress: () => Alert.alert('Terms', 'Terms content will be available soon')
        },
        {
          icon: 'hand.raised.fill',
          label: 'Privacy Policy',
          onPress: () => Alert.alert('Privacy', 'Privacy policy will be available soon')
        },
      ]
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Settings</ThemedText>
      </View>

      <ScrollView style={styles.scrollView}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            
            <View style={[
              styles.sectionContent,
              { backgroundColor: Colors[colorScheme].cardAlt }
            ]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && styles.borderBottom
                  ]}
                  onPress={'onPress' in item ? item.onPress : undefined}
                  disabled={'type' in item || 'static' in item}
                >
                  <View style={styles.settingItemMain}>
                    <IconSymbol 
                      name={item.icon as any} 
                      size={22} 
                      color={isDark ? '#fff' : '#333'} 
                      style={styles.settingIcon}
                    />
                    <ThemedText style={styles.settingLabel}>{item.label}</ThemedText>
                  </View>
                  
                  {'type' in item && item.type === 'toggle' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ 
                        false: isDark ? '#444' : '#E0E0E0', 
                        true: Colors[colorScheme].primary + '80' 
                      }}
                      thumbColor={item.value ? Colors[colorScheme].primary : isDark ? '#666' : '#F5F5F5'}
                    />
                  ) : 'value' in item ? (
                    <ThemedText style={styles.settingValue}>{item.value}</ThemedText>
                  ) : (
                    <IconSymbol 
                      name="chevron.right" 
                      size={18} 
                      color={isDark ? '#999' : '#999'} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        
        <TouchableOpacity 
          style={[
            styles.logoutButton, 
            { backgroundColor: Colors[colorScheme].error + '20' }
          ]}
          onPress={logout}
        >
          <IconSymbol name="arrow.right.square" size={22} color={Colors[colorScheme].error} />
          <ThemedText style={[styles.logoutText, { color: Colors[colorScheme].error }]}>Logout</ThemedText>
        </TouchableOpacity>
        
        <View style={styles.footer} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
    opacity: 0.7,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    height: 40,
  },
}); 