import React from 'react';
import { Outlet } from 'react-router';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Outlet />
    </div>
  );
} 