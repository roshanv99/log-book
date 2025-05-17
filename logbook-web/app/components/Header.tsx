import React from 'react';
import { useDarkMode } from './DarkModeContext';

export default function Header() {
  const { darkMode } = useDarkMode();
  
  // Apply dynamic styles based on dark mode
  const headerStyles = {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
  };
  
  const textStyles = {
    color: darkMode ? '#ffffff' : '#111827'
  };
  
  const userNameStyles = {
    color: darkMode ? '#d1d5db' : '#4b5563'
  };
  
  return (
    <header style={headerStyles}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold" style={textStyles}>Logbook</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium" style={userNameStyles}>
              Roshan
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 