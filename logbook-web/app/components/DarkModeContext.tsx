import React, { createContext, useState, useContext, useEffect } from 'react';

// Create dark mode context
type DarkModeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

// Create provider component
export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // Save to localStorage for client-side persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newMode));
    }
    
    // Set cookie for server-side rendering
    document.cookie = `darkMode=${newMode}; path=/; max-age=31536000`; // 1 year
    
    console.log('Dark mode toggled in context to:', newMode);
  };

  // Apply dark mode to document when darkMode state changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Add debug message
    console.log('DarkModeContext applied dark mode:', darkMode);
    console.log('HTML element classes:', document.documentElement.className);
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Custom hook to use dark mode
export const useDarkMode = () => useContext(DarkModeContext);

export default DarkModeContext; 