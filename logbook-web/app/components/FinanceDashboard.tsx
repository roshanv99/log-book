import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FinanceDashboard: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<'6months' | '12months'>('6months');

  // Sample data for savings and investments
  const savingsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Savings',
        data: [3000, 3500, 4000, 3800, 4200, 4500],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Investments',
        data: [5000, 5500, 6000, 5800, 6200, 6500],
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1,
      },
    ],
  };

  // Sample data for expenses by category
  const expensesData = {
    labels: ['Housing', 'Food', 'Transport', 'Entertainment', 'Utilities'],
    datasets: [
      {
        label: 'Expenses by Category',
        data: [1200, 800, 400, 300, 500],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Finance Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Savings and Investment Charts */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Savings & Investments</h2>
          <div className="mb-4">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as '6months' | '12months')}
              className="w-full p-2 border rounded-md"
            >
              <option value="6months">6 Months</option>
              <option value="12months">12 Months</option>
            </select>
          </div>
          <div className="h-64">
            <Line data={savingsData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Card 2: Expenses by Category */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
          <div className="h-64">
            <Line data={expensesData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Card 3: Insights */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Financial Insights</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">Your savings have increased by 15% this month!</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-800">You're on track to reach your investment goals.</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800">Consider reducing entertainment expenses by 20%.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard; 