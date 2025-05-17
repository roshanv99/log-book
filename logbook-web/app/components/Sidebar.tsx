import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { sidebarNavigation } from '../config/navigation';
import { useAuth } from '../config/userContext';

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
};

export default function Sidebar({ 
  isOpen, 
  setIsOpen, 
  darkMode, 
  toggleDarkMode,
  isCollapsed,
  toggleCollapsed
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // Function to close the sidebar on mobile
  const closeSidebar = () => {
    setIsOpen(false);
  };
  
  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    console.log("Dark mode toggled in sidebar");
    toggleDarkMode();
  };
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  // Generate user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return '?';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    
    return user.username.substring(0, 2).toUpperCase();
  };

  // Get display name
  const getDisplayName = () => {
    if (!user) return 'Guest';
    
    if (user.firstName) {
      return `${user.firstName} ${user.lastName || ''}`.trim();
    }
    
    return user.username;
  };
  
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 transition-all duration-300 ease-in-out
          flex flex-col h-screen
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
          w-64
        `}
        style={{ 
          backgroundColor: darkMode ? '#111827' : '#ffffff',
          color: darkMode ? '#f9fafb' : '#111827'
        }}
      >
        {/* Sidebar header with user info */}
        <div className="px-4 py-4 border-b" 
          style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}
        >
          <div className="flex items-center justify-between">
            {/* User info section */}
            <div className={`flex items-center ${isCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
              {/* User avatar/profile picture */}
              <div className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`}>
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                  {getUserInitials()}
                </div>
              </div>
              
              {/* Username - hide when collapsed on desktop */}
              {(!isCollapsed || window.innerWidth < 1024) && (
                <div className={`flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
                  <h3 
                    className="text-sm font-medium"
                    style={{ color: darkMode ? '#f9fafb' : '#111827' }}
                  >
                    {getDisplayName()}
                  </h3>
                  {user?.email && (
                    <p 
                      className="text-xs truncate"
                      style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
                    >
                      {user.email}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Mobile close button */}
            <button 
              onClick={closeSidebar}
              className="lg:hidden"
              style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Desktop collapse toggle button */}
            <button
              onClick={toggleCollapsed}
              className="hidden lg:block"
              style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}
            >
              <span className="sr-only">
                {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              </span>
              {isCollapsed ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar content */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {sidebarNavigation.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center px-3 py-2 rounded-md text-base font-medium
                  ${isCollapsed ? 'lg:justify-center' : ''}
                `}
                style={{
                  backgroundColor: isActive 
                    ? (darkMode ? '#1f2937' : '#f3f4f6') 
                    : 'transparent',
                  color: isActive
                    ? (darkMode ? '#ffffff' : '#111827')
                    : (darkMode ? '#d1d5db' : '#4b5563')
                }}
                onClick={() => {
                  // On mobile, close sidebar when a nav link is clicked
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                title={isCollapsed ? item.name : undefined}
              >
                {/* Icon placeholder - would replace with actual icons */}
                <span className="inline-flex items-center justify-center w-8 h-8">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.name === 'Finance' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                    {item.name === 'Workout' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    )}
                    {item.name === 'Settings' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    )}
                  </svg>
                </span>
                
                {/* Text label - hide when collapsed on desktop */}
                <span className={`ml-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer with dark mode toggle and logout */}
        <div className="border-t py-2" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          {/* Dark mode toggle */}
          <div 
            className={`px-4 py-2 ${isCollapsed ? 'lg:flex lg:justify-center lg:px-2' : ''}`}
          >
            {!isCollapsed && (
              <div className="flex items-center justify-between">
                <span 
                  className="text-sm font-medium"
                  style={{ color: darkMode ? '#d1d5db' : '#4b5563' }}
                >
                  Dark Mode
                </span>
                <button
                  id="dark-mode-toggle"
                  type="button"
                  onClick={handleDarkModeToggle}
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none"
                  style={{
                    backgroundColor: darkMode ? '#4f46e5' : '#e5e7eb',
                    borderColor: darkMode ? '#4f46e5' : '#e5e7eb'
                  }}
                  aria-pressed={darkMode}
                  aria-label="Toggle dark mode"
                >
                  <span className="sr-only">Toggle dark mode</span>
                  <span
                    className={`
                      pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow 
                      ring-0 transition duration-200 ease-in-out
                      ${darkMode ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  >
                    {/* Moon icon for dark mode */}
                    <span
                      style={{
                        opacity: darkMode ? 1 : 0,
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    </span>
                    
                    {/* Sun icon for light mode */}
                    <span
                      style={{
                        opacity: darkMode ? 0 : 1,
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      <svg className="h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>
            )}
            
            {isCollapsed && (
              <button
                id="dark-mode-toggle-collapsed"
                type="button"
                onClick={handleDarkModeToggle}
                className="hidden lg:block p-2 rounded-md"
                style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}
                aria-pressed={darkMode}
                aria-label="Toggle dark mode"
                title="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Logout button */}
          <div className={`px-4 py-2 ${isCollapsed ? 'lg:flex lg:justify-center lg:px-2' : ''}`}>
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="flex items-center justify-between w-full text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style={{ color: darkMode ? '#d1d5db' : '#4b5563' }}
              >
                <span>Logout</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
            
            {isCollapsed && (
              <button
                onClick={handleLogout}
                className="hidden lg:block p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}
                title="Logout"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}