import React from 'react';
import { Link } from 'react-router';

export function meta() {
  return [
    { title: "Logbook" },
    { name: "description", content: "Track your fitness and finances!" },
  ];
}

export default function Home() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Welcome to Logbook</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/finance"
          className="block p-6 bg-blue-50 dark:bg-blue-900 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">Finance</h2>
          <p className="text-gray-600 dark:text-gray-300">Track your finances, expenses, and income</p>
        </Link>
        
        <Link
          to="/workout"
          className="block p-6 bg-green-50 dark:bg-green-900 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">Workout</h2>
          <p className="text-gray-600 dark:text-gray-300">Log your workouts and track your progress</p>
        </Link>
      </div>
    </div>
  );
}
