import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { isAuthenticated } = useAuth();
  
  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(drawer)/home" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
} 