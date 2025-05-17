// Navigation configuration for the application

export type NavLink = {
  name: string;
  path: string;
};

// Main sidebar navigation
export const sidebarNavigation = [
  {
    name: 'Finance',
    path: '/finance',
  },
  {
    name: 'Workout',
    path: '/workout',
  },
  {
    name: 'Settings',
    path: '/settings',
  }
];

// Sub-navigation for Finance section
export const financeNavigation = [
  { name: 'Dashboard', path: '/finance' },
  { name: 'Monthly Churn', path: '/finance/monthly-churn' },
  { name: 'Query', path: '/finance/query' },
  { name: 'Upload Bill', path: '/finance/upload-bill' }
];

// Sub-navigation for Workout section
export const workoutNavigation = [
  { name: 'Dashboard', path: '/workout' },
  { name: 'Overview', path: '/workout/overview' },
  { name: 'Query', path: '/workout/query' }
];

// Settings has no sub-navigation currently 