import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { signup, isLoading, error } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Signup handler
  const handleSignup = async () => {
    // Form validation
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await signup({ username, email }, password);
    } catch (err) {
      console.error('Signup failed:', err);
      // Error is already set in the auth context
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#666' }]}>
          Sign up for your Logbook account
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Username</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: isDark ? '#333' : '#f5f5f5',
                color: isDark ? '#fff' : '#000',
                borderColor: isDark ? '#555' : '#ddd'
              }
            ]}
            placeholder="Choose a username"
            placeholderTextColor={isDark ? '#999' : '#999'}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: isDark ? '#333' : '#f5f5f5',
                color: isDark ? '#fff' : '#000',
                borderColor: isDark ? '#555' : '#ddd'
              }
            ]}
            placeholder="Enter your email"
            placeholderTextColor={isDark ? '#999' : '#999'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Password</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: isDark ? '#333' : '#f5f5f5',
                color: isDark ? '#fff' : '#000',
                borderColor: isDark ? '#555' : '#ddd'
              }
            ]}
            placeholder="Create a password"
            placeholderTextColor={isDark ? '#999' : '#999'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Confirm Password</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: isDark ? '#333' : '#f5f5f5',
                color: isDark ? '#fff' : '#000',
                borderColor: isDark ? '#555' : '#ddd'
              }
            ]}
            placeholder="Confirm your password"
            placeholderTextColor={isDark ? '#999' : '#999'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <Text style={[styles.linkText, { color: isDark ? '#ccc' : '#666' }]}>
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  button: {
    backgroundColor: Colors.light.tint,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
  },
  link: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '600',
  },
}); 