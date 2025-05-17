import React from 'react';
import { Outlet } from 'react-router';
import SubNavigation from '../components/SubNavigation';
import { financeNavigation } from '../config/navigation';

export default function FinanceLayout() {
  return (
    <div>
      {/* Sub Navigation */}
      <SubNavigation links={financeNavigation} />

      {/* Finance Section Content */}
      <Outlet />
    </div>
  );
} 