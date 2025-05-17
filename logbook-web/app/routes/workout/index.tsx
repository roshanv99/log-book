import React from 'react';
import { Link } from 'react-router';

export default function WorkoutIndex() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Workout Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/workout/overview"
          className="block p-6 bg-blue-50 dark:bg-blue-900 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">Overview</h2>
          <p className="text-gray-600 dark:text-gray-300">Track your workout progress and achievements</p>
        </Link>
        
        <Link
          to="/workout/query"
          className="block p-6 bg-green-50 dark:bg-green-900 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">Query</h2>
          <p className="text-gray-600 dark:text-gray-300">Search and filter your workout history</p>
        </Link>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
            <li className="py-4">
              <div className="flex space-x-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Full Body Workout</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">3 days ago</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">45 min · 320 calories burned</p>
                </div>
              </div>
            </li>
            <li className="py-4">
              <div className="flex space-x-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Running</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">5 days ago</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">30 min · 5.2 km · 275 calories burned</p>
                </div>
              </div>
            </li>
            <li className="py-4">
              <div className="flex space-x-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Yoga Session</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">1 week ago</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">60 min · 180 calories burned</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 