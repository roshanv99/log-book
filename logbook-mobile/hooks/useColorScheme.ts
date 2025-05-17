import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as _useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorSchemeType = 'light' | 'dark';

// Create a simplified version without JSX
export function useColorScheme(): ColorSchemeType {
  const deviceColorScheme = _useColorScheme() || 'light';
  const [theme, setTheme] = useState<ColorSchemeType>(deviceColorScheme as ColorSchemeType);
  
  // Load saved theme preference on mount
  useEffect(() => {
    AsyncStorage.getItem('@color_scheme')
      .then(savedTheme => {
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setTheme(savedTheme as ColorSchemeType);
        }
      })
      .catch(err => console.error('Failed to load theme', err));
  }, []);
  
  return theme;
}

// Hook to toggle color scheme
export function toggleColorScheme(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Get current color scheme first
    AsyncStorage.getItem('@color_scheme')
      .then(currentTheme => {
        // Default to system preference if not set
        if (!currentTheme) {
          currentTheme = Appearance.getColorScheme() || 'light';
        }
        
        // Toggle the theme
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Save the new theme
        AsyncStorage.setItem('@color_scheme', newTheme)
          .then(() => {
            // Update the system appearance
            Appearance.setColorScheme(newTheme as 'light' | 'dark' | null);
            resolve();
          })
          .catch(reject);
      })
      .catch(reject);
  });
}
