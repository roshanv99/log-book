import React, { useState } from 'react';

export default function UploadBill() {
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    description: '',
    category: '',
    receipt: null as File | null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        receipt: e.target.files![0]
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      setFormData({
        date: '',
        amount: '',
        description: '',
        category: '',
        receipt: null,
      });
      
      // Reset success message after a delay
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error uploading bill:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload Bill</h1>
      
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
                Bill uploaded successfully!
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount ($)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              id="description"
              name="description"
              type="text"
              required
              placeholder="Enter bill description"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="" disabled>Select a category</option>
              <option value="Housing">Housing</option>
              <option value="Food">Food</option>
              <option value="Transportation">Transportation</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Utilities">Utilities</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Upload Receipt (optional)
            </label>
            <input
              id="receipt"
              name="receipt"
              type="file"
              accept="image/*,.pdf"
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-indigo-50 file:text-indigo-700
                dark:file:bg-indigo-900 dark:file:text-indigo-300
                hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
              onChange={handleFileChange}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Uploading...' : 'Upload Bill'}
          </button>
        </div>
      </form>
      
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Uploads</h2>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Date</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-400 sm:pl-6">2023-09-18</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Internet Bill</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Utilities</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500 dark:text-gray-400">$79.99</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-400 sm:pl-6">2023-09-15</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Grocery Store</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Food</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500 dark:text-gray-400">$125.37</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 