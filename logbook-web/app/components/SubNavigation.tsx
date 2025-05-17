import React from 'react';
import { Link, useLocation } from 'react-router';
import type { NavLink } from '../config/navigation';

type SubNavigationProps = {
  links: NavLink[];
};

export default function SubNavigation({ links }: SubNavigationProps) {
  const location = useLocation();

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
      <div className="flex overflow-x-auto">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`
              px-4 py-3 text-sm font-medium whitespace-nowrap
              ${location.pathname === link.path
                ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-500 dark:text-indigo-400 dark:bg-gray-700 dark:border-indigo-400'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'}
            `}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
} 