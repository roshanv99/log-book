import React from 'react';

export default function MonthlyChurn() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Monthly Churn</h1>
      
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
            <p className="text-2xl font-bold text-green-500">$3,250.00</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
            <p className="text-2xl font-bold text-red-500">$2,150.00</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400">Net</p>
            <p className="text-2xl font-bold text-blue-500">$1,100.00</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Expense Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Percentage</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Housing</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">$900.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">41.9%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Food</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">$450.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">20.9%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Transportation</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">$350.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">16.3%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Entertainment</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">$250.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">11.6%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Other</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">$200.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">9.3%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 