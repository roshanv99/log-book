import React from 'react';
import { Link } from 'react-router';

export default function FinanceIndex() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Finance Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/finance/monthly-churn"
          className="block p-6 bg-blue-50 dark:bg-blue-900 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">Monthly Churn</h2>
          <p className="text-gray-600 dark:text-gray-300">Track your monthly expenses and income</p>
        </Link>
        
        <Link
          to="/finance/query"
          className="block p-6 bg-green-50 dark:bg-green-900 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">Query</h2>
          <p className="text-gray-600 dark:text-gray-300">Search and filter your financial records</p>
        </Link>
        
        <Link
          to="/finance/upload-bill"
          className="block p-6 bg-purple-50 dark:bg-purple-900 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">Upload Bill</h2>
          <p className="text-gray-600 dark:text-gray-300">Add new bills and receipts to your records</p>
        </Link>
      </div>
    </div>
  );
} 