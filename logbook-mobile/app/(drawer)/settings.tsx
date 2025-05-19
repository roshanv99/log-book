import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string | boolean;
  onPress: () => void;
  type?: 'default' | 'switch' | 'picker';
};

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [monthlyStartDate, setMonthlyStartDate] = useState('1');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY'];
  const monthDays = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const renderSettingItem = ({ icon, title, value, onPress, type = 'default' }: SettingItemProps) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={24} color={colors.text} />
        <Text style={[styles.settingItemText, { color: colors.text }]}>{title}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value as boolean}
          onValueChange={onPress}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      ) : type === 'picker' ? (
        <Text style={[styles.settingItemValue, { color: colors.text }]}>{value as string}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={24} color={colors.text} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage}>
          <View style={[styles.profileImageContainer, { borderColor: colors.border }]}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person" size={40} color={colors.text} />
            )}
          </View>
        </TouchableOpacity>
        <Text style={[styles.profileName, { color: colors.text }]}>User Name</Text>
      </View>

      <View style={styles.settingsSection}>
        {renderSettingItem({
          icon: 'mail-outline',
          title: 'Email ID',
          value: 'user@example.com',
          onPress: () => {},
        })}
        {renderSettingItem({
          icon: 'call-outline',
          title: 'Mobile Number',
          value: '+1 234 567 8900',
          onPress: () => {},
        })}
        {renderSettingItem({
          icon: 'moon-outline',
          title: 'Night Mode',
          value: isDarkMode,
          onPress: () => setIsDarkMode(!isDarkMode),
          type: 'switch',
        })}
        {renderSettingItem({
          icon: 'cash-outline',
          title: 'Currency',
          value: selectedCurrency,
          onPress: () => {},
          type: 'picker',
        })}
        {renderSettingItem({
          icon: 'calendar-outline',
          title: 'Monthly Start Cycle',
          value: `${monthlyStartDate}th of every month`,
          onPress: () => {},
          type: 'picker',
        })}
        {renderSettingItem({
          icon: 'information-circle-outline',
          title: 'About',
          value: '',
          onPress: () => {},
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsSection: {
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    marginLeft: 15,
  },
  settingItemValue: {
    fontSize: 16,
    marginRight: 10,
  },
}); 