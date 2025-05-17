import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Header from './Header';
import Sidebar from './Sidebar';
import { DarkModeProvider, useDarkMode } from './DarkModeContext';

// Inner layout that uses the dark mode context
function LayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();

  // Toggle sidebar function for mobile
  const toggleSidebar = () => {
    console.log("Toggling sidebar from", sidebarOpen, "to", !sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle sidebar collapsed state for desktop
  const toggleSidebarCollapsed = () => {
    console.log("Toggling sidebar collapsed state from", sidebarCollapsed, "to", !sidebarCollapsed);
    setSidebarCollapsed(!sidebarCollapsed);
    // Store preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(!sidebarCollapsed));
    }
  };

  // Load sidebar collapsed state from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        setSidebarCollapsed(savedState === 'true');
      }
    }
  }, []);

  // Apply inline styles based on dark mode
  const mainStyles = {
    backgroundColor: darkMode ? '#0f172a' : '#f3f4f6',
    color: darkMode ? '#f9fafb' : '#111827',
    minHeight: '100vh',
  };

  return (
    <div style={mainStyles}>
      {/* Header */}
      <Header />

      {/* Sidebar toggle button for mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          type="button"
          className="p-2 rounded-md"
          style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
          onClick={toggleSidebar}
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        isCollapsed={sidebarCollapsed}
        toggleCollapsed={toggleSidebarCollapsed}
      />

      {/* Main content */}
      <div 
        className={`flex flex-col flex-1 min-h-screen ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} transition-all duration-300`}
        style={{ backgroundColor: darkMode ? '#0f172a' : '#f3f4f6' }}
      >
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Wrapper layout that provides the dark mode context
export default function Layout() {
  return (
    <DarkModeProvider>
      <LayoutContent />
    </DarkModeProvider>
  );
} 