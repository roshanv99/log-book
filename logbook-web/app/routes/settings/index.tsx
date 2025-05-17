import React, { useState } from 'react';

export default function Settings() {
  // User profile state
  const [profile, setProfile] = useState({
    name: 'Roshan',
    email: 'roshan@example.com',
    notifications: true,
    theme: 'system' as 'light' | 'dark' | 'system',
  });
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSuccess(true);
      
      // Reset success message after a delay
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
      
      {isSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-400 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Settings saved successfully!
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* User Profile Section */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={profile.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={profile.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="notifications"
                name="notifications"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={profile.notifications}
                onChange={handleChange}
              />
              <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enable email notifications
              </label>
            </div>
            
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Theme Preference
              </label>
              <select
                id="theme"
                name="theme"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={profile.theme}
                onChange={handleSelectChange}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        
        {/* App Settings Section */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">App Settings</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Data Export</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Download all your data as a CSV or JSON file.
              </p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Export as CSV
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Export as JSON
                </button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Clear Data</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                This will permanently delete all your data. This action cannot be undone.
              </p>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 