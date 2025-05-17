import React, { useState } from 'react';

export default function FinanceQuery() {
  const [query, setQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [category, setCategory] = useState('all');
  
  // Mock data for demonstration
  const transactions = [
    { id: 1, date: '2023-09-15', description: 'Rent Payment', category: 'Housing', amount: -900.00 },
    { id: 2, date: '2023-09-12', description: 'Grocery Store', category: 'Food', amount: -125.37 },
    { id: 3, date: '2023-09-10', description: 'Gas Station', category: 'Transportation', amount: -45.82 },
    { id: 4, date: '2023-09-05', description: 'Movie Theater', category: 'Entertainment', amount: -28.50 },
    { id: 5, date: '2023-09-01', description: 'Salary', category: 'Income', amount: 3250.00 },
    { id: 6, date: '2023-08-28', description: 'Restaurant', category: 'Food', amount: -62.45 },
    { id: 7, date: '2023-08-25', description: 'Online Shopping', category: 'Shopping', amount: -89.99 },
    { id: 8, date: '2023-08-20', description: 'Public Transit', category: 'Transportation', amount: -45.00 },
  ];
  
  // Filter transactions based on search criteria
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by search query
    const matchesQuery = query === '' || 
      transaction.description.toLowerCase().includes(query.toLowerCase()) ||
      transaction.category.toLowerCase().includes(query.toLowerCase());
    
    // Filter by category
    const matchesCategory = category === 'all' || transaction.category === category;
    
    // Filter by date range
    const transactionDate = new Date(transaction.date);
    const matchesDateStart = !dateRange.start || new Date(dateRange.start) <= transactionDate;
    const matchesDateEnd = !dateRange.end || new Date(dateRange.end) >= transactionDate;
    
    return matchesQuery && matchesCategory && matchesDateStart && matchesDateEnd;
  });
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Finance Query</h1>
      
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Search Transactions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <input
              id="query"
              type="text"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search descriptions or categories"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              id="category"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Housing">Housing</option>
              <option value="Food">Food</option>
              <option value="Transportation">Transportation</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Income">Income</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input
              id="start-date"
              type="date"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input
              id="end-date"
              type="date"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Results</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.category}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 